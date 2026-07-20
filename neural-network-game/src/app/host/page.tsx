'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { createSocket } from '@/lib/socket';
import { Player, GamePhase, RoomStats } from '@/lib/types';
import PlayerList from '@/components/PlayerList';
import ResultsScreen from '@/components/ResultsScreen';

function HostContent() {
  const searchParams = useSearchParams();
  const hostName = searchParams.get('name') || 'Host';
  // Bug #4 fix: create a fresh socket per page mount
  const socketRef = useRef(createSocket());
  // Bug #12 fix: track whether we've already created a room to prevent duplicates on reconnect
  const roomCodeRef = useRef<string>('');

  const [roomCode, setRoomCode] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [phase, setPhase] = useState<GamePhase>('waiting');
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [results, setResults] = useState<{ sentences: string[]; imageUrl: string } | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const socket = socketRef.current;

    socket.on('connect', () => {
      // Bug #12 fix: only create a room if we haven't already
      // Prevents duplicate room creation on socket reconnect (network blip)
      if (!roomCodeRef.current) {
        socket.emit('create-room', { hostName });
      }
    });

    socket.on('room-created', ({ roomCode }) => {
      roomCodeRef.current = roomCode;
      setRoomCode(roomCode);
    });

    socket.on('player-joined', ({ players }) => {
      setPlayers(players);
    });

    socket.on('player-left', ({ players }) => {
      setPlayers(players);
    });

    socket.on('host-update', ({ phase, stats }) => {
      setPhase(phase);
      setStats(stats);
    });

    socket.on('timer-tick', ({ timeRemaining }) => {
      setTimeRemaining(timeRemaining);
    });

    socket.on('show-results', ({ sentences, imageUrl }) => {
      setResults({ sentences, imageUrl });
      setPhase('results');
    });

    socket.on('error', ({ message }) => {
      setError(message);
      setTimeout(() => setError(''), 5000);
    });

    // Connect the socket
    socket.connect();

    return () => {
      // Bug #4 fix: fully disconnect on unmount
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [hostName]);

  const handleStart = useCallback(() => {
    const code = roomCodeRef.current;
    if (code) {
      socketRef.current.emit('start-game', { roomCode: code });
    }
  }, []);

  const handleFinish = useCallback(() => {
    const code = roomCodeRef.current;
    if (code) {
      socketRef.current.emit('finish-game', { roomCode: code });
      window.location.href = '/';
    }
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (results) {
    return (
      <div>
        <ResultsScreen sentences={results.sentences} imageUrl={results.imageUrl} />
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handleFinish}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-red-500/20"
          >
            Finish Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Host Dashboard</h1>
          {roomCode && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block"
            >
              <p className="text-gray-400 text-sm mb-2">Share this code with players:</p>
              <button
                onClick={copyCode}
                className="px-6 py-3 bg-gray-800 border-2 border-cyan-500/50 rounded-xl hover:border-cyan-400 transition-colors group"
              >
                <span className="text-3xl font-mono font-bold text-cyan-400 tracking-[0.3em]">
                  {roomCode}
                </span>
                <span className="block text-xs text-gray-500 group-hover:text-gray-400 mt-1">
                  {copied ? 'Copied!' : 'Click to copy'}
                </span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Game status */}
        {phase !== 'waiting' && stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Game Progress</h3>
              <span className="text-cyan-400 font-mono">{timeRemaining}s</span>
            </div>

            {/* Phase indicator */}
            <div className="flex items-center gap-2 mb-4">
              {['distributing', 'input-phase', 'hidden-phase', 'output-phase', 'results'].map((p, i) => (
                <div key={p} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${
                    phase === p ? 'bg-cyan-400 animate-pulse' :
                    getPhaseIndex(phase) > i ? 'bg-green-500' : 'bg-gray-700'
                  }`} />
                  {i < 4 && <div className={`w-8 h-0.5 ${getPhaseIndex(phase) > i ? 'bg-green-500' : 'bg-gray-700'}`} />}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-white">{stats.totalPlayers}</p>
                <p className="text-xs text-gray-400">Total Players</p>
              </div>
              <div className="bg-blue-500/10 rounded-xl p-3 text-center border border-blue-500/20">
                <p className="text-2xl font-bold text-blue-400">{stats.inputCount}</p>
                <p className="text-xs text-gray-400">Input Layer</p>
              </div>
              <div className="bg-purple-500/10 rounded-xl p-3 text-center border border-purple-500/20">
                <p className="text-2xl font-bold text-purple-400">{stats.hiddenCount}</p>
                <p className="text-xs text-gray-400">Hidden Layer</p>
              </div>
              <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
                <p className="text-2xl font-bold text-amber-400">{stats.outputCount}</p>
                <p className="text-xs text-gray-400">Output Layer</p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400">
                Submissions: <span className="text-cyan-400 font-mono">{stats.submissions}</span>
              </p>
            </div>
          </motion.div>
        )}

        {/* Player list */}
        {phase === 'waiting' && (
          <>
            <PlayerList players={players} />

            {/* Start button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleStart}
                disabled={players.length < 3}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:shadow-none"
              >
                {players.length < 3
                  ? `Need ${3 - players.length} more player${3 - players.length > 1 ? 's' : ''}`
                  : `Start Game (${players.length} players)`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function HostPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="text-white">Loading...</div></div>}>
      <HostContent />
    </Suspense>
  );
}

function getPhaseIndex(phase: GamePhase): number {
  const phases: GamePhase[] = ['distributing', 'input-phase', 'hidden-phase', 'output-phase', 'results'];
  return phases.indexOf(phase);
}
