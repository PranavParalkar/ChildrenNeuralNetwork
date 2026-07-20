'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Layer } from '@/lib/types';
import {
  BookIcon,
  CloseIcon,
  InputLayerIcon,
  HiddenLayerIcon,
  OutputLayerIcon,
  EyeIcon,
  BrainIcon,
  PenIcon,
} from './Icons';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  layer: Layer;
}

export default function InstructionsModal({ isOpen, onClose, layer }: InstructionsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookIcon size={22} className="text-cyan-400" /> How to Play
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                aria-label="Close instructions"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-8">

              {/* ===== SECTION 1: Activity Overview ===== */}
              <div>
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">The Activity</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                  This is a crowd-powered game inspired by how neural networks process information.
                  Everyone works together in layers to turn an image into a sentence — but no one sees the full picture!
                </p>

                {/* Flow diagram */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col items-center text-center flex-1">
                      <InputLayerIcon size={28} />
                      <span className="text-xs text-blue-300 font-medium mt-1">Input Layer</span>
                      <span className="text-[10px] text-gray-500 mt-0.5">Sees image</span>
                      <span className="text-[10px] text-gray-500">Types 1 word</span>
                    </div>
                    <div className="text-gray-600 text-lg">→</div>
                    <div className="flex flex-col items-center text-center flex-1">
                      <HiddenLayerIcon size={28} />
                      <span className="text-xs text-purple-300 font-medium mt-1">Hidden Layer</span>
                      <span className="text-[10px] text-gray-500 mt-0.5">Sees top words</span>
                      <span className="text-[10px] text-gray-500">Forms 2-word phrase</span>
                    </div>
                    <div className="text-gray-600 text-lg">→</div>
                    <div className="flex flex-col items-center text-center flex-1">
                      <OutputLayerIcon size={28} />
                      <span className="text-xs text-amber-300 font-medium mt-1">Output Layer</span>
                      <span className="text-[10px] text-gray-500 mt-0.5">Sees top phrases</span>
                      <span className="text-[10px] text-gray-500">Writes a sentence</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-xs mt-3 text-center">
                  Each phase is timed (30 seconds). Your layer is randomly assigned. The top 5 sentences are revealed at the end alongside the original image.
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-800" />

              {/* ===== SECTION 2: Your Layer Example ===== */}
              <div>
                <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wide mb-3">
                  Your Role: {layer === 'input' ? 'Input Layer' : layer === 'hidden' ? 'Hidden Layer' : 'Output Layer'}
                </h3>

                {layer === 'input' && <InputLayerExample />}
                {layer === 'hidden' && <HiddenLayerExample />}
                {layer === 'output' && <OutputLayerExample />}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 px-6 py-4 rounded-b-2xl">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-colors"
              >
                Got it, let&apos;s go!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Input Layer Example ─── */
function InputLayerExample() {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 text-sm text-gray-300">
        <EyeIcon size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <p>You will see an image and describe it in <strong className="text-blue-300">ONE word</strong>.</p>
      </div>

      {/* Sample image + example words */}
      <div className="bg-gray-800/50 rounded-xl border border-blue-500/20 p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Example</p>
        <div className="flex gap-4 items-center">
          <div className="w-28 h-28 rounded-lg overflow-hidden border border-gray-700 flex-shrink-0">
            <img
              src="/images/sample-1.svg"
              alt="Sample game image"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">From this image, you might type:</p>
            <div className="flex flex-wrap gap-1.5">
              {['red', 'ball', 'round', 'toy', 'bounce'].map((word) => (
                <span
                  key={word}
                  className="px-2.5 py-1 bg-blue-500/20 text-blue-200 rounded-md text-xs font-medium border border-blue-500/30"
                >
                  {word}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-2">The top 25 most common words from all Input Layer players move forward.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Hidden Layer Example ─── */
function HiddenLayerExample() {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 text-sm text-gray-300">
        <BrainIcon size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
        <p>You will NOT see the image. You receive the top words and form a <strong className="text-purple-300">TWO-word phrase</strong>.</p>
      </div>

      {/* Sample words → phrase */}
      <div className="bg-gray-800/50 rounded-xl border border-purple-500/20 p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Example</p>
        <div>
          <p className="text-xs text-gray-400 mb-2">You receive these top words (shown as a word cloud — bigger = more common):</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="px-2 py-1 text-purple-200 text-lg font-bold">red</span>
            <span className="px-2 py-1 text-purple-200 text-base font-bold">ball</span>
            <span className="px-2 py-1 text-purple-300 text-sm font-medium">round</span>
            <span className="px-2 py-1 text-purple-300 text-xs font-medium">toy</span>
            <span className="px-2 py-1 text-purple-300 text-xs font-medium">bounce</span>
          </div>
          <p className="text-xs text-gray-400 mb-1.5">From these words, you might type:</p>
          <div className="flex gap-1.5">
            {['red ball', 'round toy'].map((phrase) => (
              <span
                key={phrase}
                className="px-2.5 py-1 bg-purple-500/20 text-purple-200 rounded-md text-xs font-medium border border-purple-500/30"
              >
                {phrase}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 mt-2">The top 10 most common phrases move forward to the Output Layer.</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Output Layer Example ─── */
function OutputLayerExample() {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 text-sm text-gray-300">
        <PenIcon size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p>You will NOT see the image. You receive the top phrases and write a <strong className="text-amber-300">full sentence</strong>.</p>
      </div>

      {/* Sample phrases → sentence */}
      <div className="bg-gray-800/50 rounded-xl border border-amber-500/20 p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Example</p>
        <div>
          <p className="text-xs text-gray-400 mb-2">You receive these top phrases:</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {['red ball', 'round toy', 'kids play'].map((phrase) => (
              <span
                key={phrase}
                className="px-2.5 py-1 bg-amber-500/20 text-amber-200 rounded-md text-xs font-medium border border-amber-500/30"
              >
                {phrase}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-1.5">From these phrases, you might write:</p>
          <div className="px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-amber-200 text-sm italic">&quot;Kids play with a round red ball&quot;</p>
          </div>
          <p className="text-[10px] text-gray-500 mt-2">The top 5 sentences are revealed at the end alongside the original image!</p>
        </div>
      </div>
    </div>
  );
}
