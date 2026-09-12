/**
 * useCountdown Hook
 * Provides a countdown timer with formatted display and progress ratio.
 * Used primarily by BurnerCard for the 10-minute card expiration.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface CountdownResult {
  /** Remaining seconds */
  seconds: number;
  /** Formatted string "MM:SS" */
  formatted: string;
  /** Progress from 1 (full) to 0 (expired) */
  progress: number;
  /** Whether the timer is running */
  isRunning: boolean;
  /** Pause the timer */
  pause: () => void;
  /** Resume the timer */
  resume: () => void;
  /** Reset the timer */
  reset: (newSeconds?: number) => void;
}

export function useCountdown(initialSeconds: number): CountdownResult {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const totalRef = useRef(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning || seconds <= 0) return;

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, seconds]);

  const formatted = `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  const progress = totalRef.current > 0 ? seconds / totalRef.current : 0;

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);
  const reset = useCallback(
    (newSeconds?: number) => {
      const s = newSeconds ?? initialSeconds;
      totalRef.current = s;
      setSeconds(s);
      setIsRunning(true);
    },
    [initialSeconds]
  );

  return { seconds, formatted, progress, isRunning, pause, resume, reset };
}
