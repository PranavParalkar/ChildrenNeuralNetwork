'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Timer from './Timer';
import { CheckIcon } from './Icons';
import { DEFAULT_CONFIG } from '@/lib/types';

interface OutputPhaseProps {
  phrases: string[];
  timeRemaining: number;
  onSubmit: (sentence: string) => void;
  submitted: boolean;
}

export default function OutputPhase({ phrases, timeRemaining, onSubmit, submitted }: OutputPhaseProps) {
  const [sentence, setSentence] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sentence.trim() && !submitted) {
      onSubmit(sentence.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-amber-400 mb-1">Output Layer</h2>
        <p className="text-gray-400">Form a sentence using these phrases</p>
      </motion.div>

      <Timer
        timeRemaining={timeRemaining}
        totalTime={DEFAULT_CONFIG.outputTime}
        label="Time Left"
      />

      <motion.div
        className="my-8 max-w-2xl w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-gray-800/50 rounded-2xl border border-amber-500/30 p-6">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide mb-4">Top Phrases from Hidden Layer</h3>
          <div className="flex flex-wrap gap-2">
            {phrases.map((phrase, index) => (
              <motion.span
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.08 }}
                className="px-4 py-2 bg-amber-500/20 text-amber-200 rounded-lg text-sm font-medium border border-amber-500/30"
              >
                {phrase}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>

      {!submitted ? (
        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder="Write a sentence using the phrases above..."
              maxLength={200}
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              autoFocus
            />
            <button
              type="submit"
              disabled={!sentence.trim()}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-colors"
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
          <p className="text-green-400 font-semibold">Sentence submitted!</p>
          <p className="text-gray-500 text-sm mt-1">Waiting for results...</p>
        </motion.div>
      )}
    </div>
  );
}
