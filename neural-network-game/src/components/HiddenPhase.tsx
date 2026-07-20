'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Timer from './Timer';
import WordCloud from './WordCloud';
import { CheckIcon } from './Icons';
import { DEFAULT_CONFIG, WordWithFrequency } from '@/lib/types';

interface HiddenPhaseProps {
  words: WordWithFrequency[];
  timeRemaining: number;
  onSubmit: (phrase: string) => void;
  submitted: boolean;
}

export default function HiddenPhase({ words, timeRemaining, onSubmit, submitted }: HiddenPhaseProps) {
  const [phrase, setPhrase] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = phrase.trim();
    const wordCount = trimmed.split(/\s+/).length;
    if (trimmed && wordCount === 2 && !submitted) {
      onSubmit(trimmed);
    }
  };

  const wordCount = phrase.trim() ? phrase.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-2xl font-bold text-purple-400 mb-1">Hidden Layer</h2>
        <p className="text-gray-400">Form a TWO-word phrase from these words</p>
      </motion.div>

      <Timer
        timeRemaining={timeRemaining}
        totalTime={DEFAULT_CONFIG.hiddenTime}
        label="Time Left"
      />

      <motion.div
        className="my-8 max-w-2xl w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <WordCloud words={words} />
      </motion.div>

      {!submitted ? (
        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <input
                type="text"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder="Two-word phrase..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                autoFocus
              />
              <button
                type="submit"
                disabled={wordCount !== 2}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-colors"
              >
                Send
              </button>
            </div>
            <p className={`text-xs ${wordCount === 2 ? 'text-green-400' : 'text-gray-500'}`}>
              {wordCount}/2 words
            </p>
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
          <p className="text-green-400 font-semibold">Phrase submitted!</p>
          <p className="text-gray-500 text-sm mt-1">Waiting for other players...</p>
        </motion.div>
      )}
    </div>
  );
}
