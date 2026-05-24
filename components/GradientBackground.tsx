'use client';

import { cn } from '@/lib/utils';

export function GradientBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn('fixed inset-0 z-0 overflow-hidden', className)}
      aria-hidden="true"
      style={{ pointerEvents: 'none' }}
    >
      {/* Warm amber glow — top center, like a desk lamp */}
      <div
        className="ambient-warm animate-float"
        style={{
          width: '800px',
          height: '600px',
          background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.13) 0%, transparent 70%)',
          top: '-240px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Secondary cool accent — bottom right edge */}
      <div
        className="ambient-warm animate-float-slow"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)',
          bottom: '-150px',
          right: '-80px',
        }}
      />

      {/* Subtle diagonal grid */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.025,
          backgroundImage: `
            linear-gradient(rgba(245,158,11,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,158,11,0.6) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}
