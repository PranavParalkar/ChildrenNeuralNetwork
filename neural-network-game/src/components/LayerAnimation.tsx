'use client';

import { motion } from 'framer-motion';
import { Layer } from '@/lib/types';
import { InputLayerIcon, HiddenLayerIcon, OutputLayerIcon } from './Icons';

interface LayerAnimationProps {
  layer: Layer;
  onComplete?: () => void;
}

const layerConfig = {
  input: {
    color: 'from-blue-500 to-cyan-400',
    icon: InputLayerIcon,
    title: 'Input Layer',
    description: 'You will describe an image in one word',
    bgGlow: 'shadow-blue-500/50',
  },
  hidden: {
    color: 'from-purple-500 to-pink-400',
    icon: HiddenLayerIcon,
    title: 'Hidden Layer',
    description: 'You will form phrases from collected words',
    bgGlow: 'shadow-purple-500/50',
  },
  output: {
    color: 'from-amber-500 to-orange-400',
    icon: OutputLayerIcon,
    title: 'Output Layer',
    description: 'You will construct sentences from phrases',
    bgGlow: 'shadow-amber-500/50',
  },
};

export default function LayerAnimation({ layer, onComplete }: LayerAnimationProps) {
  const config = layerConfig[layer];

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-gray-950 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={onComplete}
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full bg-gradient-to-r ${config.color}`}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              y: [null, Math.random() * -200],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        className="text-center z-10"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 1, bounce: 0.5 }}
      >
        <motion.div
          className="text-8xl mb-6"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <config.icon size={80} />
        </motion.div>

        <motion.h1
          className={`text-5xl font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent mb-4`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {config.title}
        </motion.h1>

        <motion.p
          className="text-xl text-gray-300"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {config.description}
        </motion.p>

        <motion.div
          className={`mt-8 mx-auto w-48 h-1 rounded-full bg-gradient-to-r ${config.color}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1, duration: 2 }}
        />
      </motion.div>
    </motion.div>
  );
}
