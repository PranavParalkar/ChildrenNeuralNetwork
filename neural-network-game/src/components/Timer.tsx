'use client';

import { motion } from 'framer-motion';

interface TimerProps {
  timeRemaining: number;
  totalTime: number;
  label?: string;
  timerStarted?: boolean;
}

export default function Timer({ timeRemaining, totalTime, label, timerStarted = true }: TimerProps) {
  const percentage = timerStarted ? (timeRemaining / totalTime) * 100 : 100;
  const isUrgent = timerStarted && timeRemaining <= 5;
  const isWaiting = !timerStarted;

  return (
    <div className="flex flex-col items-center gap-2">
      {label && <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">{label}</p>}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24">
        <svg className="w-20 h-20 sm:w-24 sm:h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-gray-700"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - percentage / 100)}`}
            className={isWaiting ? 'text-gray-500' : isUrgent ? 'text-red-500' : 'text-cyan-400'}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {isWaiting ? (
            <motion.div
              className="flex gap-0.5"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            </motion.div>
          ) : (
            <motion.span
              className={`text-xl sm:text-2xl font-bold ${isUrgent ? 'text-red-500' : 'text-white'}`}
              animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              {timeRemaining}
            </motion.span>
          )}
        </div>
      </div>
      {isWaiting && (
        <p className="text-xs text-gray-500">Waiting for host...</p>
      )}
    </div>
  );
}
