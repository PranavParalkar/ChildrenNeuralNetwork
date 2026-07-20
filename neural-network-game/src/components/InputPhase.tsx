'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Timer from './Timer';
import { CheckIcon } from './Icons';
import { DEFAULT_CONFIG } from '@/lib/types';

interface InputPhaseProps {
  imageUrl: string;
  timeRemaining: number;
  onSubmit: (word: string) => void;
  submitted: boolean;
}

export default function InputPhase({ imageUrl, timeRemaining, onSubmit, submitted }: InputPhaseProps) {
  const [word, setWord] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (word.trim() && !submitted) {
      onSubmit(word.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-blue-400 mb-1">Input Layer</h2>
        <p className="text-gray-400">Describe this image in ONE word</p>
      </motion.div>

      <Timer
        timeRemaining={timeRemaining}
        totalTime={DEFAULT_CONFIG.inputTime}
        label="Time Left"
      />

      <motion.div
        className="my-8 rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-lg shadow-blue-500/20 max-w-lg w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <img
          src={imageUrl}
          alt="Describe this image"
          className="w-full h-64 object-cover"
        />
      </motion.div>

      {!submitted ? (
        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value.replace(/\s/g, ''))}
              placeholder="One word..."
              maxLength={30}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!word.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-colors"
            >
              Send
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="flex justify-center mb-3">
            <CheckIcon size={48} />
          </div>
          <p className="text-green-400 font-semibold">Word submitted!</p>
          <p className="text-gray-500 text-sm mt-1">Waiting for other players...</p>
        </motion.div>
      )}
    </div>
  );
}
