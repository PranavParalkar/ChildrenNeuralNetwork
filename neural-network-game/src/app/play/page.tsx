'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import { Layer, GamePhase, WordWithFrequency } from '@/lib/types';
import InstructionsModal from '@/components/InstructionsModal';
import InputPhase from '@/components/InputPhase';
import HiddenPhase from '@/components/HiddenPhase';
import OutputPhase from '@/components/OutputPhase';
import WaitingScreen from '@/components/WaitingScreen';
import ResultsScreen from '@/components/ResultsScreen';
import { ErrorIcon } from '@/components/Icons';
import { motion } from 'framer-motion';

function PlayContent() {
  const searchParams = useSearchParams();
  const playerName = searchParams.get('name') || 'Player';
  const roomCode = searchParams.get('room') || '';
  const socketRef = useRef(getSocket());

  const [layer, setLayer] = useState<Layer | null>(null);
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [words, setWords] = useState<WordWithFrequency[]>([]);
  const [phrases, setPhrases] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<{ sentences: string[]; imageUrl: string } | null>(null);
  const [error, setError] = useState('');
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('join-room', { roomCode, playerName });
    });

    socket.on('player-joined', ({ players }) => {
      setPlayerCount(players.length);
    });

    socket.on('player-left', ({ players }) => {
      setPlayerCount(players.length);
    });

    socket.on('game-starting', ({ layer }) => {
      setLayer(layer);
      setShowInstructions(true);
    });

    socket.on('phase-change', ({ phase, timeRemaining }) => {
      setPhase(phase);
      if (timeRemaining !== undefined) {
        setTimeRemaining(timeRemaining);
      }
      setSubmitted(false);
    });

    socket.on('show-image', ({ imageUrl }) => {
      setImageUrl(imageUrl);
    });

    socket.on('show-words', ({ words }) => {
      setWords(words);
    });

    socket.on('show-phrases', ({ phrases }) => {
      setPhrases(phrases);
    });

    socket.on('timer-tick', ({ timeRemaining }) => {
      setTimeRemaining(timeRemaining);
    });

    socket.on('submission-received', () => {
      setSubmitted(true);
    });

    socket.on('show-results', ({ sentences, imageUrl }) => {
      setResults({ sentences, imageUrl });
      setPhase('results');
    });

    socket.on('game-finished', () => {
      window.location.href = '/';
    });

    socket.on('error', ({ message }) => {
      setError(message);
    });

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off('connect');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('game-starting');
      socket.off('phase-change');
      socket.off('show-image');
      socket.off('show-words');
      socket.off('show-phrases');
      socket.off('timer-tick');
      socket.off('submission-received');
      socket.off('show-results');
      socket.off('game-finished');
      socket.off('error');
    };
  }, [roomCode, playerName]);

  const handleSubmitWord = (word: string) => {
    socketRef.current.emit('submit-word', { roomCode, word });
  };

  const handleSubmitPhrase = (phrase: string) => {
    socketRef.current.emit('submit-phrase', { roomCode, phrase });
  };

  const handleSubmitSentence = (sentence: string) => {
    socketRef.current.emit('submit-sentence', { roomCode, sentence });
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="flex justify-center mb-4">
            <ErrorIcon size={48} />
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-gray-400">{error}</p>
          <a href="/" className="inline-block mt-6 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors">
            Back to Home
          </a>
        </motion.div>
      </div>
    );
  }

  // Results phase
  if (results) {
    return <ResultsScreen sentences={results.sentences} imageUrl={results.imageUrl} />;
  }

  // Waiting for game to start
  if (phase === 'waiting') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-white mb-2">Waiting for Host</h2>
          <p className="text-gray-400 mb-1">Room: <span className="text-cyan-400 font-mono">{roomCode}</span></p>
          <p className="text-gray-500 text-sm">{playerCount} player{playerCount !== 1 ? 's' : ''} in room</p>
          <div className="mt-6 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700 inline-block">
            <p className="text-sm text-gray-400">Playing as <span className="text-white font-medium">{playerName}</span></p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Input phase - current player is in input layer
  if (phase === 'input-phase' && layer === 'input') {
    return (
      <>
        <InputPhase
          imageUrl={imageUrl}
          timeRemaining={timeRemaining}
          onSubmit={handleSubmitWord}
          submitted={submitted}
        />
        <InstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          layer={layer}
        />
      </>
    );
  }

  // Hidden phase - current player is in hidden layer
  if (phase === 'hidden-phase' && layer === 'hidden') {
    return (
      <>
        <HiddenPhase
          words={words}
          timeRemaining={timeRemaining}
          onSubmit={handleSubmitPhrase}
          submitted={submitted}
        />
        <InstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          layer={layer}
        />
      </>
    );
  }

  // Output phase - current player is in output layer
  if (phase === 'output-phase' && layer === 'output') {
    return (
      <>
        <OutputPhase
          phrases={phrases}
          timeRemaining={timeRemaining}
          onSubmit={handleSubmitSentence}
          submitted={submitted}
        />
        <InstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          layer={layer}
        />
      </>
    );
  }

  // Default: waiting/spectating screen for non-active layers
  return (
    <>
      <WaitingScreen
        layer={layer || 'input'}
        currentPhase={phase}
        timeRemaining={timeRemaining}
      />
      {layer && (
        <InstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          layer={layer}
        />
      )}
    </>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <PlayContent />
    </Suspense>
  );
}
