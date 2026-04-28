'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
  className?: string;
}

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Smoothly animates a number to a new value using requestAnimationFrame.
 * Fixed: startValue is captured in a ref at animation start, not read from
 * state during the animation (which caused stale-closure bugs).
 */
export function AnimatedNumber({
  value,
  duration = 600,
  formatter = (n) => Math.round(n).toLocaleString('en-TZ'),
  className,
}: AnimatedNumberProps) {
  const [displayed, setDisplayed] = useState(value);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef<number>(value);
  const currentDisplayRef = useRef<number>(value); // tracks current without stale closure

  useEffect(() => {
    // No animation needed if value hasn't changed
    if (value === currentDisplayRef.current && value === displayed) return;

    // Cancel any running animation
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // Snapshot where we're animating FROM
    startValueRef.current = currentDisplayRef.current;
    startTimeRef.current = null;

    function tick(timestamp: number) {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = startValueRef.current + (value - startValueRef.current) * eased;

      currentDisplayRef.current = current;
      setDisplayed(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        currentDisplayRef.current = value;
        setDisplayed(value);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // value and duration are the only real deps — displayed intentionally excluded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return (
    <span className={cn('tabular-nums', className)}>
      {formatter(displayed)}
    </span>
  );
}
