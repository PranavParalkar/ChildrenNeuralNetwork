'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { WordWithFrequency } from '@/lib/types';

interface WordCloudProps {
  words: WordWithFrequency[];
}

// Color palette for word cloud variety
const WORD_COLORS = [
  'text-purple-200',
  'text-purple-300',
  'text-fuchsia-300',
  'text-violet-300',
  'text-pink-300',
  'text-indigo-300',
  'text-purple-100',
];

export default function WordCloud({ words }: WordCloudProps) {
  // Compute font sizes and layout deterministically (no Math.random to avoid hydration mismatch)
  const cloudWords = useMemo(() => {
    if (words.length === 0) return [];

    const maxCount = Math.max(...words.map(w => w.count));
    const minCount = Math.min(...words.map(w => w.count));
    const range = maxCount - minCount || 1;

    // Map count to a font size between 0.75rem and 2.75rem
    const minSize = 0.75;
    const maxSize = 2.75;

    // Simple deterministic hash for a string → number between 0 and 1
    const hash = (str: string): number => {
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h + str.charCodeAt(i)) | 0;
      }
      return (((h % 1000) + 1000) % 1000) / 1000;
    };

    // Deterministic shuffle based on word hash
    const shuffled = [...words].sort((a, b) => hash(a.word) - hash(b.word));

    return shuffled.map((w, i) => {
      const normalized = (w.count - minCount) / range;
      const fontSize = minSize + normalized * (maxSize - minSize);
      const color = WORD_COLORS[i % WORD_COLORS.length];
      // Higher frequency words get full opacity, lower ones are slightly faded
      const opacity = 0.6 + normalized * 0.4;
      // Deterministic rotation based on word hash
      const rotation = (hash(w.word + '_rot') - 0.5) * 12;

      return { ...w, fontSize, color, opacity, rotation };
    });
  }, [words]);

  return (
    <div className="bg-gray-800/50 rounded-2xl border border-purple-500/30 p-6">
      <h3 className="text-sm text-gray-400 uppercase tracking-wide mb-4 text-center">
        Top Words from Input Layer
      </h3>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 min-h-[120px]">
        {cloudWords.map((item, index) => (
          <motion.span
            key={item.word}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: item.opacity }}
            transition={{
              delay: index * 0.04,
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className={`inline-block font-bold ${item.color} cursor-default select-none transition-transform hover:scale-110`}
            style={{
              fontSize: `${item.fontSize}rem`,
              transform: `rotate(${item.rotation}deg)`,
            }}
            title={`"${item.word}" — submitted ${item.count} time${item.count !== 1 ? 's' : ''}`}
          >
            {item.word}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
