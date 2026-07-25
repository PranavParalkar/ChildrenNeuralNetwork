'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Timer from './Timer';
import { CheckIcon, InputLayerIcon } from './Icons';
import { DEFAULT_CONFIG } from '@/lib/types';

interface InputPhaseProps {
  imageUrl: string;
  timeRemaining: number;
  onSubmit: (word: string) => void;
  submitted: boolean;
  timerStarted?: boolean;
}

export default function InputPhase({ imageUrl, timeRemaining, onSubmit, submitted, timerStarted = true }: InputPhaseProps) {
  const [word, setWord] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (word.trim() && !submitted) {
      onSubmit(word.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Bold Layer Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 sm:mb-6"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <InputLayerIcon size={28} />
          <h2 className="text-xl sm:text-2xl font-extrabold text-blue-400">You are in the Input Layer</h2>
        </div>
        <p className="text-sm sm:text-base text-gray-400">Describe this image in ONE word</p>
      </motion.div>

      <Timer
        timeRemaining={timeRemaining}
        totalTime={DEFAULT_CONFIG.inputTime}
        label="Time Left"
        timerStarted={timerStarted}
      />

      <motion.div
        className="my-4 sm:my-8 rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-lg shadow-blue-500/20 max-w-lg w-full"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <img
          src={imageUrl}
          alt="Describe this image"
          className="w-full h-48 sm:h-64 object-cover"
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
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value.replace(/\s/g, ''))}
              placeholder="One word..."
              maxLength={30}
              className="flex-1 px-3 sm:px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm sm:text-base"
              autoFocus
            />
            <button
              type="submit"
              disabled={!word.trim()}
              className="px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-colors text-sm sm:text-base"
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
