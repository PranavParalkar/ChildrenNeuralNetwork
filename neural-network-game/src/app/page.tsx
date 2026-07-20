'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [hostName, setHostName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [activeTab, setActiveTab] = useState<'host' | 'join'>('join');

  const handleHost = (e: React.FormEvent) => {
    e.preventDefault();
    if (hostName.trim()) {
      router.push(`/host?name=${encodeURIComponent(hostName.trim())}`);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && roomCode.trim()) {
      router.push(`/play?name=${encodeURIComponent(playerName.trim())}&room=${encodeURIComponent(roomCode.trim().toUpperCase())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      {/* Background neural network pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            className="flex items-center justify-center gap-3 mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
          >
            <div className="w-4 h-4 rounded-full bg-blue-400" />
            <div className="w-4 h-4 rounded-full bg-purple-400" />
            <div className="w-4 h-4 rounded-full bg-amber-400" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">Neural Network</h1>
          <p className="text-gray-400">A crowd-powered image description game</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-800/50 rounded-xl p-1 mb-6 border border-gray-700">
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'join'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Join Game
          </button>
          <button
            onClick={() => setActiveTab('host')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'host'
                ? 'bg-cyan-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Host Game
          </button>
        </div>

        {/* Join form */}
        {activeTab === 'join' && (
          <motion.form
            key="join"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleJoin}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Room Code</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 uppercase tracking-widest text-center text-lg font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={!playerName.trim() || roomCode.length < 6}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-colors text-lg"
            >
              Join Room
            </button>
          </motion.form>
        )}

        {/* Host form */}
        {activeTab === 'host' && (
          <motion.form
            key="host"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleHost}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Host Name</label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <button
              type="submit"
              disabled={!hostName.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all text-lg"
            >
              Create Room
            </button>
          </motion.form>
        )}

        {/* How it works */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-gray-600 uppercase tracking-wide mb-3">How it works</p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <span className="text-blue-400">Image → Words</span>
            <span>→</span>
            <span className="text-purple-400">Words → Phrases</span>
            <span>→</span>
            <span className="text-amber-400">Phrases → Sentences</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
