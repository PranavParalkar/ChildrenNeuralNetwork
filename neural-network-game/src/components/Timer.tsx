'use client';

import { motion } from 'framer-motion';

interface TimerProps {
  timeRemaining: number;
  totalTime: number;
  label?: string;
}

export default function Timer({ timeRemaining, totalTime, label }: TimerProps) {
  const percentage = (timeRemaining / totalTime) * 100;
  const isUrgent = timeRemaining <= 5;

  return (
    <div className="flex flex-col items-center gap-2">
      {label && <p className="text-sm text-gray-400 uppercase tracking-wide">{label}</p>}
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
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
            className={isUrgent ? 'text-red-500' : 'text-cyan-400'}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`text-2xl font-bold ${isUrgent ? 'text-red-500' : 'text-white'}`}
            animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            {timeRemaining}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
