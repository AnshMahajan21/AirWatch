/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Clean Half-Circle Arc Gauge Bar
 * Minimalist, prominent semi-circular bar gauge matching the requested bar design:
 * - Clean semi-circular track (thick rounded bar)
 * - Clean filled active progress arc (rounded caps)
 * - Crisp needle/indicator dot at current progress position
 * - Centered bold percentage with '%', 'BUDGET USED' label, and sublabel below
 * - Pure bar presentation without tick marks or busy border rings
 */

import React from 'react';

interface ArcGaugeProps {
  value: number; // 0 to 100+
  max?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  showPercent?: boolean;
  className?: string;
}

export const ArcGauge: React.FC<ArcGaugeProps> = ({
  value,
  max = 100,
  label = 'Budget Used',
  sublabel,
  color,
  showPercent = true,
  className = '',
}) => {
  const percentage = Math.max(0, (value / max) * 100);
  const clampedRatio = Math.min(100, percentage) / 100;

  // Semi-circle geometry
  // Width: 240, Height: 135
  // Center at (120, 115), radius 80, stroke width 16
  const centerX = 120;
  const centerY = 115;
  const radius = 80;
  const strokeWidth = 16;

  // Arc length for 180 degrees (semi-circle) = PI * radius
  const arcLength = Math.PI * radius; // ≈ 251.33
  const strokeDashoffset = arcLength * (1 - clampedRatio);

  // Dynamic bar color (preserves theme/status while focusing on the clean bar style)
  let barColor = color;
  if (!barColor) {
    if (percentage <= 75) {
      barColor = '#10b981'; // emerald green
    } else if (percentage <= 100) {
      barColor = '#f59e0b'; // amber
    } else {
      barColor = '#ef4444'; // rose red
    }
  }

  return (
    <div className={`w-full flex flex-col items-center justify-center select-none ${className}`}>
      <div className="relative w-full max-w-[240px] flex items-center justify-center">
        <svg
          viewBox="0 0 240 135"
          className="w-full h-auto overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background Semi-Circle Track */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            fill="none"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Progress Bar Arc */}
          {clampedRatio > 0 && (
            <path
              d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
              fill="none"
              stroke={barColor}
              strokeWidth={strokeWidth}
              strokeDasharray={arcLength}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset,stroke] duration-200 ease-out"
            />
          )}
        </svg>

        {/* Center Readout: percentage, label */}
        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center justify-center text-center pointer-events-none">
          <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white flex items-baseline gap-0.5 leading-none drop-shadow">
            <span>{Math.round(value)}</span>
            {showPercent && <span className="text-lg font-sans font-semibold text-white/80">%</span>}
          </div>
          <div className="text-[11px] uppercase tracking-widest font-bold text-white/75 mt-1.5 leading-none">
            {label}
          </div>
        </div>
      </div>

      {sublabel && (
        <div className="mt-2 text-xs font-normal text-center text-white/60 max-w-[220px] leading-tight">
          {sublabel}
        </div>
      )}
    </div>
  );
};
