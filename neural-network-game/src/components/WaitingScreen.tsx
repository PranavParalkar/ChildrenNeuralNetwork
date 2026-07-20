'use client';

import { motion } from 'framer-motion';
import { GamePhase, Layer } from '@/lib/types';
import Timer from './Timer';

interface WaitingScreenProps {
  layer: Layer;
  currentPhase: GamePhase;
  timeRemaining: number;
}

const phaseMessages: Record<string, Record<Layer, string>> = {
  'input-phase': {
    input: 'Your turn! Describe the image.',
    hidden: 'Input Layer is describing the image...',
    output: 'Input Layer is describing the image...',
  },
  'hidden-phase': {
    input: 'Hidden Layer is forming phrases from your words...',
    hidden: 'Your turn! Form a two-word phrase.',
    output: 'Hidden Layer is forming phrases...',
  },
  'output-phase': {
    input: 'Output Layer is constructing sentences...',
    hidden: 'Output Layer is constructing sentences...',
    output: 'Your turn! Form a sentence.',
  },
};

export default function WaitingScreen({ layer, currentPhase, timeRemaining }: WaitingScreenProps) {
  const message = phaseMessages[currentPhase]?.[layer] || 'Processing...';

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Neural network visualization */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-8">
            {['input', 'hidden', 'output'].map((l) => (
              <motion.div
                key={l}
                className={`flex flex-col items-center ${l === getCurrentActiveLayer(currentPhase) ? 'opacity-100' : 'opacity-30'}`}
                animate={l === getCurrentActiveLayer(currentPhase) ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className={`w-12 h-12 rounded-full border-2 ${
                  l === 'input' ? 'border-blue-400 bg-blue-500/20' :
                  l === 'hidden' ? 'border-purple-400 bg-purple-500/20' :
                  'border-amber-400 bg-amber-500/20'
                } flex items-center justify-center`}>
                  <span className="text-xs font-bold text-white uppercase">{l[0]}</span>
                </div>
                <span className="text-xs text-gray-400 mt-1 capitalize">{l}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          className="text-xl text-gray-300 mb-6"
          key={message}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {message}
        </motion.p>

        {timeRemaining > 0 && (
          <Timer timeRemaining={timeRemaining} totalTime={30} label="Phase Timer" />
        )}

        <motion.div
          className="mt-8 flex gap-1 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-cyan-400 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, delay: i * 0.3, repeat: Infinity }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

function getCurrentActiveLayer(phase: GamePhase): string {
  switch (phase) {
    case 'input-phase': return 'input';
    case 'hidden-phase': return 'hidden';
    case 'output-phase': return 'output';
    default: return '';
  }
}
