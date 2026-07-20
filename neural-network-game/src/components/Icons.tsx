'use client';

interface IconProps {
  className?: string;
  size?: number;
}

export function InputLayerIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="#3b82f6" opacity="0.2" stroke="#3b82f6" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="#3b82f6" />
    </svg>
  );
}

export function HiddenLayerIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="#a855f7" opacity="0.2" stroke="#a855f7" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="#a855f7" />
    </svg>
  );
}

export function OutputLayerIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="#f59e0b" opacity="0.2" stroke="#f59e0b" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="#f59e0b" />
    </svg>
  );
}

export function CheckIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="#22c55e" opacity="0.2" stroke="#22c55e" strokeWidth="2" />
      <path d="M8 12l3 3 5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ErrorIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" fill="#ef4444" opacity="0.2" stroke="#ef4444" strokeWidth="2" />
      <path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function BookIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 7h6M9 11h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrophyIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 4H4v3a3 3 0 003 3M17 4h3v3a3 3 0 01-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EyeIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function BrainIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2a7 7 0 00-5.2 2.3A5.5 5.5 0 003 9.5c0 2.1 1.2 3.9 3 4.8V20a2 2 0 002 2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2a7 7 0 015.2 2.3A5.5 5.5 0 0121 9.5c0 2.1-1.2 3.9-3 4.8V20a2 2 0 01-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.5" />
    </svg>
  );
}

export function PenIcon({ className = '', size = 24 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M17 3a2.85 2.85 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
