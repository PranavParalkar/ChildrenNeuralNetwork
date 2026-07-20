'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@/lib/types';

interface PlayerListProps {
  players: Player[];
  maxVisible?: number;
}

export default function PlayerList({ players, maxVisible = 50 }: PlayerListProps) {
  const visiblePlayers = players.slice(0, maxVisible);
  const hiddenCount = Math.max(0, players.length - maxVisible);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-200">Players</h3>
        <span className="text-sm text-cyan-400 font-mono">{players.length} joined</span>
      </div>

      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden max-h-96 overflow-y-auto">
        <AnimatePresence>
          {visiblePlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.02 }}
              className="flex items-center px-4 py-2.5 border-b border-gray-700/50 last:border-b-0"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white mr-3">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-200 text-sm">{player.name}</span>
              {player.layer && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  player.layer === 'input' ? 'bg-blue-500/20 text-blue-300' :
                  player.layer === 'hidden' ? 'bg-purple-500/20 text-purple-300' :
                  'bg-amber-500/20 text-amber-300'
                }`}>
                  {player.layer}
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {hiddenCount > 0 && (
          <div className="px-4 py-2.5 text-center text-gray-400 text-sm">
            +{hiddenCount} more players
          </div>
        )}
      </div>
    </div>
  );
}
