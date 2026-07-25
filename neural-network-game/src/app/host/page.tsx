'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { createSocket } from '@/lib/socket';
import { Player, GamePhase, RoomStats } from '@/lib/types';
import PlayerList from '@/components/PlayerList';
import ResultsScreen from '@/components/ResultsScreen';
import Timer from '@/components/Timer';

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
  const [timerStarted, setTimerStarted] = useState(false);
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

    socket.on('host-update', ({ phase, stats, timerStarted: timerState }) => {
      setPhase(phase);
      setStats(stats);
      setTimerStarted(timerState);
    });

    socket.on('timer-tick', ({ timeRemaining }) => {
      setTimeRemaining(timeRemaining);
    });

    socket.on('timer-started', ({ totalTime }) => {
      setTimerStarted(true);
      setTimeRemaining(totalTime);
    });

    socket.on('phase-change', () => {
      // Reset timer state on phase change
      setTimerStarted(false);
      setTimeRemaining(0);
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

  const handleStartTimer = useCallback(() => {
    const code = roomCodeRef.current;
    if (code) {
      socketRef.current.emit('start-timer', { roomCode: code });
    }
  }, []);

  const handleEndPhase = useCallback(() => {
    const code = roomCodeRef.current;
    if (code) {
      socketRef.current.emit('end-phase', { roomCode: code });
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

  // Helper to get the active layer name for the current phase
  const getActiveLayerName = (phase: GamePhase): string => {
    switch (phase) {
      case 'input-phase': return 'Input Layer';
      case 'hidden-phase': return 'Hidden Layer';
      case 'output-phase': return 'Output Layer';
      default: return '';
    }
  };

  // Helper to get active layer submission info
  const getActiveLayerSubmissions = (): { submitted: number; total: number } | null => {
    if (!stats) return null;
    switch (phase) {
      case 'input-phase': return { submitted: stats.inputSubmissions, total: stats.inputCount };
      case 'hidden-phase': return { submitted: stats.hiddenSubmissions, total: stats.hiddenCount };
      case 'output-phase': return { submitted: stats.outputSubmissions, total: stats.outputCount };
      default: return null;
    }
  };

  const isActivePhase = phase === 'input-phase' || phase === 'hidden-phase' || phase === 'output-phase';

  if (results) {
    return (
      <div>
        <ResultsScreen sentences={results.sentences} imageUrl={results.imageUrl} />
        <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handleFinish}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-base sm:text-lg rounded-xl transition-all shadow-lg shadow-red-500/20"
          >
            Finish Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Host Dashboard</h1>
          {roomCode && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block"
            >
              <p className="text-gray-400 text-xs sm:text-sm mb-2">Share this code with players:</p>
              <button
                onClick={copyCode}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-800 border-2 border-cyan-500/50 rounded-xl hover:border-cyan-400 transition-colors group"
              >
                <span className="text-2xl sm:text-3xl font-mono font-bold text-cyan-400 tracking-[0.2em] sm:tracking-[0.3em]">
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
            className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 sm:mb-6 text-center text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Game status */}
        {phase !== 'waiting' && stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-800/50 rounded-2xl border border-gray-700 p-4 sm:p-6 mb-4 sm:mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-white">Game Progress</h3>
              {timerStarted && (
                <span className="text-cyan-400 font-mono text-sm sm:text-base">{timeRemaining}s</span>
              )}
            </div>

            {/* Phase indicator */}
            <div className="flex items-center gap-1 sm:gap-2 mb-4 overflow-x-auto">
              {['distributing', 'input-phase', 'hidden-phase', 'output-phase', 'results'].map((p, i) => (
                <div key={p} className="flex items-center flex-shrink-0">
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                    phase === p ? 'bg-cyan-400 animate-pulse' :
                    getPhaseIndex(phase) > i ? 'bg-green-500' : 'bg-gray-700'
                  }`} />
                  {i < 4 && <div className={`w-4 sm:w-8 h-0.5 ${getPhaseIndex(phase) > i ? 'bg-green-500' : 'bg-gray-700'}`} />}
                </div>
              ))}
            </div>

            {/* Layer Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <div className="bg-gray-900/50 rounded-xl p-2 sm:p-3 text-center">
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalPlayers}</p>
                <p className="text-[10px] sm:text-xs text-gray-400">Total Players</p>
              </div>
              <div className={`rounded-xl p-2 sm:p-3 text-center border ${
                phase === 'input-phase' ? 'bg-blue-500/20 border-blue-400/50' : 'bg-blue-500/10 border-blue-500/20'
              }`}>
                <p className="text-xl sm:text-2xl font-bold text-blue-400">{stats.inputCount}</p>
                <p className="text-[10px] sm:text-xs text-gray-400">Input Layer</p>
                <p className="text-[10px] sm:text-xs text-blue-300/70 mt-0.5">
                  {stats.inputSubmissions}/{stats.inputCount} submitted
                </p>
              </div>
              <div className={`rounded-xl p-2 sm:p-3 text-center border ${
                phase === 'hidden-phase' ? 'bg-purple-500/20 border-purple-400/50' : 'bg-purple-500/10 border-purple-500/20'
              }`}>
                <p className="text-xl sm:text-2xl font-bold text-purple-400">{stats.hiddenCount}</p>
                <p className="text-[10px] sm:text-xs text-gray-400">Hidden Layer</p>
                <p className="text-[10px] sm:text-xs text-purple-300/70 mt-0.5">
                  {stats.hiddenSubmissions}/{stats.hiddenCount} submitted
                </p>
              </div>
              <div className={`rounded-xl p-2 sm:p-3 text-center border ${
                phase === 'output-phase' ? 'bg-amber-500/20 border-amber-400/50' : 'bg-amber-500/10 border-amber-500/20'
              }`}>
                <p className="text-xl sm:text-2xl font-bold text-amber-400">{stats.outputCount}</p>
                <p className="text-[10px] sm:text-xs text-gray-400">Output Layer</p>
                <p className="text-[10px] sm:text-xs text-amber-300/70 mt-0.5">
                  {stats.outputSubmissions}/{stats.outputCount} submitted
                </p>
              </div>
            </div>

            {/* Active Phase Info + Timer Controls */}
            {isActivePhase && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 sm:mt-6"
              >
                {/* Active phase banner */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gray-900/70 border border-gray-600/50">
                  <div className="text-center sm:text-left">
                    <p className="text-sm sm:text-base font-semibold text-white">
                      {getActiveLayerName(phase)} Active
                    </p>
                    {(() => {
                      const sub = getActiveLayerSubmissions();
                      if (!sub) return null;
                      const allSubmitted = sub.submitted === sub.total;
                      return (
                        <p className={`text-xs sm:text-sm ${allSubmitted ? 'text-green-400' : 'text-gray-400'}`}>
                          {sub.submitted} of {sub.total} players submitted
                          {allSubmitted && ' ✓'}
                        </p>
                      );
                    })()}
                  </div>

                  {/* Timer Controls */}
                  <div className="flex items-center gap-3">
                    {timerStarted && (
                      <div className="flex items-center gap-2">
                        <Timer
                          timeRemaining={timeRemaining}
                          totalTime={
                            phase === 'input-phase' ? 30 :
                            phase === 'hidden-phase' ? 30 :
                            phase === 'output-phase' ? 30 : 30
                          }
                          timerStarted={true}
                        />
                      </div>
                    )}

                    {!timerStarted ? (
                      <button
                        onClick={handleStartTimer}
                        className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Start Timer
                      </button>
                    ) : (
                      <button
                        onClick={handleEndPhase}
                        className="px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        </svg>
                        End Phase
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Distributing phase message */}
            {phase === 'distributing' && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400">
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Assigning players to layers...
                  </motion.span>
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Player list */}
        {phase === 'waiting' && (
          <>
            <PlayerList players={players} />

            {/* Start button */}
            <div className="mt-6 sm:mt-8 text-center">
              <button
                onClick={handleStart}
                disabled={players.length < 3}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-bold text-base sm:text-lg rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:shadow-none"
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
