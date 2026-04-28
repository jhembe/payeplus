'use client';

import { cn } from '@/lib/utils';

interface GradientBackgroundProps {
  className?: string;
}

/**
 * Ambient background: grid overlay + animated gradient orbs.
 * Fixed for iOS: removed will-change (causes GPU layer explosion on mobile),
 * reduced blur radius on mobile, use translate3d for compositing hint,
 * orbs are absolute (not fixed) inside a fixed wrapper to avoid iOS scroll bugs.
 */
export function GradientBackground({ className }: GradientBackgroundProps) {
  return (
    <div
      className={cn('fixed inset-0 z-0 overflow-hidden', className)}
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.018]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.6) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Primary orb — indigo, top-left */}
      <div
        className="orb animate-float"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.32) 0%, transparent 70%)',
          top: '-120px',
          left: '-120px',
        }}
      />

      {/* Secondary orb — cyan, bottom-right */}
      <div
        className="orb animate-float-slow"
        style={{
          width: '420px',
          height: '420px',
          background: 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)',
          bottom: '-90px',
          right: '-90px',
        }}
      />

      {/* Tertiary orb — violet, center-right */}
      <div
        className="orb animate-float"
        style={{
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(167,139,250,0.14) 0%, transparent 70%)',
          top: '42%',
          left: '58%',
          animationDelay: '3s',
          animationDuration: '20s',
        }}
      />
    </div>
  );
}
