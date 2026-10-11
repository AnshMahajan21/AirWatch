/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Hero Numerals (Fraunces Serif)
 * Large atmospheric numeral (140px - 220px) with animated count-up and tabular figures.
 */

import React, { useEffect, useState } from 'react';

interface HeroNumberProps {
  value: number;
  durationMs?: number;
  className?: string;
  unit?: string;
}

export const HeroNumber: React.FC<HeroNumberProps> = ({
  value,
  durationMs = 900,
  className = '',
  unit,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    let start = displayValue;
    const end = value;
    if (start === end) return;

    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [value, durationMs]);

  return (
    <div className={`inline-flex items-baseline font-serif select-none tracking-tighter ${className}`} style={{ fontVariantNumeric: 'tabular-nums' }}>
      <span className="text-6xl sm:text-7xl md:text-8xl leading-none font-bold drop-shadow-sm font-['Fraunces',serif]">
        {displayValue}
      </span>
      {unit && (
        <span className="ml-2 text-xl sm:text-2xl font-sans font-semibold opacity-75 tracking-normal">
          {unit}
        </span>
      )}
    </div>
  );
};
