'use client';

import { useState, useMemo, useEffect } from 'react';
import WordCloud from '@/components/WordCloud';
import { WordWithFrequency } from '@/lib/types';

// A corpus of plausible single-word image descriptions players might submit
const WORD_POOL = [
  // Animals
  'cat', 'dog', 'bird', 'fish', 'rabbit', 'horse', 'elephant', 'tiger', 'lion', 'bear',
  'dolphin', 'whale', 'eagle', 'owl', 'butterfly', 'snake', 'frog', 'turtle', 'penguin', 'monkey',
  // Nature
  'tree', 'flower', 'mountain', 'river', 'ocean', 'forest', 'cloud', 'sun', 'moon', 'star',
  'rain', 'snow', 'sky', 'grass', 'garden', 'lake', 'waterfall', 'desert', 'island', 'beach',
  // Colors
  'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'white', 'black', 'golden',
  // Objects
  'house', 'car', 'bridge', 'tower', 'castle', 'boat', 'train', 'bicycle', 'umbrella', 'clock',
  'lamp', 'chair', 'table', 'book', 'door', 'window', 'mirror', 'bell', 'key', 'crown',
  // Adjectives
  'beautiful', 'bright', 'dark', 'tall', 'small', 'colorful', 'peaceful', 'wild', 'calm', 'ancient',
  'happy', 'lonely', 'warm', 'cold', 'soft', 'shiny', 'round', 'magical', 'giant', 'tiny',
  // Actions / descriptors
  'flying', 'swimming', 'running', 'sleeping', 'dancing', 'glowing', 'floating', 'shining', 'growing', 'falling',
];

// Generate 15,000 words with a realistic Zipf-like distribution
// (some words are much more popular than others)
function generate15000Words(): string[] {
  const words: string[] = [];

  // Assign weights: first words in pool are more "popular"
  // Using a power-law distribution to make it realistic
  const weights = WORD_POOL.map((_, i) => 1 / Math.pow(i + 1, 0.8));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const cumulativeWeights: number[] = [];
  let cum = 0;
  for (const w of weights) {
    cum += w / totalWeight;
    cumulativeWeights.push(cum);
  }

  for (let i = 0; i < 15000; i++) {
    const r = Math.random();
    let idx = cumulativeWeights.findIndex(cw => r <= cw);
    if (idx === -1) idx = WORD_POOL.length - 1;
    words.push(WORD_POOL[idx]);
  }

  return words;
}

// Mirror server-side aggregation: getTopItemsWithFrequency
function getTopItemsWithFrequency(items: string[], topN: number): WordWithFrequency[] {
  const frequency = new Map<string, number>();
  for (const item of items) {
    const normalized = item.toLowerCase().trim();
    if (normalized) {
      frequency.set(normalized, (frequency.get(normalized) || 0) + 1);
    }
  }
  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
}

export default function TestWordCloudPage() {
  const [topN, setTopN] = useState(25);
  const [seed, setSeed] = useState(0);
  const [rawWords, setRawWords] = useState<string[]>([]);

  // Generate words only on client to avoid hydration mismatch from Math.random()
  useEffect(() => {
    setRawWords(generate15000Words());
  }, [seed]);

  const topWords = useMemo(
    () => rawWords.length > 0 ? getTopItemsWithFrequency(rawWords, topN) : [],
    [rawWords, topN]
  );

  const uniqueCount = useMemo(() => {
    const set = new Set(rawWords);
    return set.size;
  }, [rawWords]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
            Word Cloud Stress Test
          </h1>
          <p className="text-gray-400 text-lg">
            15,000 simulated player word submissions → aggregated → word cloud
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4 text-center">
            <p className="text-3xl font-bold text-cyan-400">{rawWords.length.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">Total Words Generated</p>
          </div>
          <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4 text-center">
            <p className="text-3xl font-bold text-purple-400">{uniqueCount}</p>
            <p className="text-sm text-gray-400 mt-1">Unique Words</p>
          </div>
          <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-4 text-center">
            <p className="text-3xl font-bold text-fuchsia-400">{topN}</p>
            <p className="text-sm text-gray-400 mt-1">Shown in Cloud</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-400">Top N words:</label>
            <input
              type="range"
              min={5}
              max={100}
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="w-40 accent-purple-500"
            />
            <span className="text-white font-mono w-8">{topN}</span>
          </div>
          <button
            onClick={() => setSeed(s => s + 1)}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors text-sm"
          >
            🎲 Regenerate 15K Words
          </button>
        </div>

        {/* Word Cloud */}
        <WordCloud words={topWords} />

        {/* Frequency Table */}
        <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide mb-4">
            Frequency Breakdown (Top {topN})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {topWords.map((w, i) => (
              <div
                key={w.word}
                className="flex items-center justify-between bg-gray-900/60 rounded-lg px-3 py-2 text-sm"
              >
                <span className="text-gray-300">
                  <span className="text-gray-500 mr-1.5">#{i + 1}</span>
                  {w.word}
                </span>
                <span className="text-purple-400 font-mono ml-2">{w.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Raw sample */}
        <div className="bg-gray-800/60 rounded-xl border border-gray-700/50 p-6">
          <h3 className="text-sm text-gray-400 uppercase tracking-wide mb-4">
            Raw Word Sample (first 200 of 15,000)
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed break-words font-mono">
            {rawWords.slice(0, 200).join(', ')}
            <span className="text-gray-600"> … and {(rawWords.length - 200).toLocaleString()} more</span>
          </p>
        </div>
      </div>
    </div>
  );
}
