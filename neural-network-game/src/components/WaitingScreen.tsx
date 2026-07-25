'use client';

import { motion } from 'framer-motion';
import { GamePhase, Layer, DEFAULT_CONFIG } from '@/lib/types';
import Timer from './Timer';
import { InputLayerIcon, HiddenLayerIcon, OutputLayerIcon } from './Icons';

interface WaitingScreenProps {
  layer: Layer;
  currentPhase: GamePhase;
  timeRemaining: number;
  timerStarted?: boolean;
}

const layerConfig = {
  input: {
    icon: InputLayerIcon,
    title: 'You are in the Input Layer',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgColor: 'bg-blue-500/10',
  },
  hidden: {
    icon: HiddenLayerIcon,
    title: 'You are in the Hidden Layer',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgColor: 'bg-purple-500/10',
  },
  output: {
    icon: OutputLayerIcon,
    title: 'You are in the Output Layer',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    bgColor: 'bg-amber-500/10',
  },
};

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

// Bug #13 fix: return correct total time per phase instead of hardcoded 30
function getPhaseTime(phase: GamePhase): number {
  switch (phase) {
    case 'input-phase': return DEFAULT_CONFIG.inputTime;
    case 'hidden-phase': return DEFAULT_CONFIG.hiddenTime;
    case 'output-phase': return DEFAULT_CONFIG.outputTime;
    case 'results': return DEFAULT_CONFIG.resultsDelay;
    default: return 30;
  }
}

export default function WaitingScreen({ layer, currentPhase, timeRemaining, timerStarted = true }: WaitingScreenProps) {
  const message = phaseMessages[currentPhase]?.[layer] || 'Processing...';
  const config = layerConfig[layer];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div
        className="text-center w-full max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Bold Layer Heading Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 sm:mb-8 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border ${config.borderColor} ${config.bgColor}`}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <config.icon size={24} />
            <h2 className={`text-lg sm:text-xl font-extrabold ${config.color}`}>{config.title}</h2>
          </div>
        </motion.div>

        {/* Neural network visualization */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-4 sm:gap-8">
            {(['input', 'hidden', 'output'] as const).map((l) => (
              <motion.div
                key={l}
                className={`flex flex-col items-center ${l === getCurrentActiveLayer(currentPhase) ? 'opacity-100' : 'opacity-30'}`}
                animate={l === getCurrentActiveLayer(currentPhase) ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 ${
                  l === 'input' ? 'border-blue-400 bg-blue-500/20' :
                  l === 'hidden' ? 'border-purple-400 bg-purple-500/20' :
                  'border-amber-400 bg-amber-500/20'
                } flex items-center justify-center`}>
                  <span className="text-xs font-bold text-white uppercase">{l[0]}</span>
                </div>
                <span className="text-[10px] sm:text-xs text-gray-400 mt-1 capitalize">{l}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          className="text-base sm:text-xl text-gray-300 mb-4 sm:mb-6"
          key={message}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {message}
        </motion.p>

        {(timeRemaining > 0 || !timerStarted) && (
          <Timer
            timeRemaining={timeRemaining}
            totalTime={getPhaseTime(currentPhase)}
            label="Phase Timer"
            timerStarted={timerStarted}
          />
        )}

        <motion.div
          className="mt-6 sm:mt-8 flex gap-1 justify-center"
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
