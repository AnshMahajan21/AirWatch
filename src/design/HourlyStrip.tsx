/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - 24-Hour Diurnal Timeline Strip
 * Displays next 24 contiguous hours ahead, clearly highlights 2-hour Safest window
 * and 2-hour Peak hazard window matching styles, and removes distracting accent dots.
 * English only.
 */

import React, { useMemo } from 'react';
import { HourPoint } from '../types.ts';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { calculateBestWindow, calculatePeakHazardWindow } from '../lib/bestWindow.ts';

// 16-point scalloped golden sun matching the day icon
const SUN_POLYGON_POINTS = Array.from({ length: 32 }, (_, i) => {
  const angle = (i * Math.PI) / 16 - Math.PI / 2;
  const r = i % 2 === 0 ? 10.5 : 8.0;
  const x = (12 + r * Math.cos(angle)).toFixed(2);
  const y = (12 + r * Math.sin(angle)).toFixed(2);
  return `${x},${y}`;
}).join(' ');

export const DaySunIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-label="Day (Sun)"
  >
    <defs>
      <radialGradient id="airwatchTimelineSunOuter" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#FEF08A" />
        <stop offset="50%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#EA580C" />
      </radialGradient>
      <radialGradient id="airwatchTimelineSunInner" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#FFFBEB" />
        <stop offset="35%" stopColor="#FDE047" />
        <stop offset="85%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </radialGradient>
    </defs>
    {/* 16 rays perimeter */}
    <polygon
      points={SUN_POLYGON_POINTS}
      fill="url(#airwatchTimelineSunOuter)"
      stroke="#D97706"
      strokeWidth="0.6"
      strokeLinejoin="round"
    />
    {/* Inner glowing core disc */}
    <circle
      cx="12"
      cy="12"
      r="6.8"
      fill="url(#airwatchTimelineSunInner)"
      stroke="#F59E0B"
      strokeWidth="0.75"
    />
  </svg>
);

export const NightMoonIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    aria-label="Night (Moon)"
  >
    <defs>
      <linearGradient id="airwatchTimelineMoonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EDE9FE" />
        <stop offset="45%" stopColor="#C4B5FD" />
        <stop offset="100%" stopColor="#818CF8" />
      </linearGradient>
    </defs>
    {/* Crescent Moon path with rounded tips and violet outline */}
    <path
      d="M 18.2 3.8 C 14.1 4.4 10.8 7.8 10.5 12.3 C 10.3 16.9 13.2 20.4 17.5 21.4 C 10.6 22.8 4.8 17.6 5.0 11.6 C 5.2 5.6 11.4 1.8 18.2 3.8 Z"
      fill="url(#airwatchTimelineMoonGrad)"
      stroke="#6366F1"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Soft inner highlight curve */}
    <path
      d="M 8.2 8.8 C 7.8 11.2 8.5 13.6 10 15.5"
      stroke="#FFFFFF"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.65"
    />
  </svg>
);

interface HourlyStripProps {
  hourly: HourPoint[];
  bestWindowStartIso?: string;
  bestWindowEndIso?: string;
  peakWindowStartIso?: string;
  peakWindowEndIso?: string;
  avoidHours?: string[];
  selectedIso?: string;
  onSelectHour?: (hour: HourPoint) => void;
  className?: string;
}

export const HourlyStrip: React.FC<HourlyStripProps> = ({
  hourly,
  bestWindowStartIso,
  bestWindowEndIso,
  peakWindowStartIso,
  peakWindowEndIso,
  avoidHours = [],
  selectedIso,
  onSelectHour,
  className = '',
}) => {
  if (!hourly || hourly.length === 0) {
    return (
      <div className="py-6 text-center text-white/50 text-sm">
        No hourly forecast points available.
      </div>
    );
  }

  // Display the next 24 contiguous hours ahead
  const displayHours = hourly.slice(0, 24);

  // Determine 2-hour Safest Window
  const computedBest = useMemo(() => {
    if (bestWindowStartIso && bestWindowEndIso) {
      return { startIso: bestWindowStartIso, endIso: bestWindowEndIso };
    }
    return calculateBestWindow(displayHours);
  }, [displayHours, bestWindowStartIso, bestWindowEndIso]);

  // Determine 2-hour Peak Hazard Window
  const computedPeak = useMemo(() => {
    if (peakWindowStartIso && peakWindowEndIso) {
      return { startIso: peakWindowStartIso, endIso: peakWindowEndIso };
    }
    return calculatePeakHazardWindow(displayHours);
  }, [displayHours, peakWindowStartIso, peakWindowEndIso]);

  const isBestWindow = (iso: string) => {
    if (!computedBest?.startIso || !computedBest?.endIso) return false;
    const t = new Date(iso).getTime();
    const s = new Date(computedBest.startIso).getTime();
    const e = new Date(computedBest.endIso).getTime();
    // The contiguous window interval covers from startIso through the end of the 2-hour range (+1 hour block)
    const endBoundary = e === s ? e : e + 3600000;
    return t >= s && t <= endBoundary;
  };

  const isPeakWindow = (iso: string) => {
    if (!computedPeak?.startIso || !computedPeak?.endIso) return false;
    const t = new Date(iso).getTime();
    const s = new Date(computedPeak.startIso).getTime();
    const e = new Date(computedPeak.endIso).getTime();
    // The contiguous window interval covers from startIso through the end of the 2-hour range (+1 hour block)
    const endBoundary = e === s ? e : e + 3600000;
    return t >= s && t <= endBoundary;
  };

  const formatHour = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      }).replace(':00', '');
    } catch {
      return '';
    }
  };

  const getDelhiHourNumber = (iso: string) => {
    try {
      const d = new Date(iso);
      const str = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: 'Asia/Kolkata',
      }).format(d);
      return parseInt(str, 10) % 24;
    } catch {
      return new Date(iso).getHours();
    }
  };

  const isTomorrow = (iso: string, idx: number) => {
    if (idx === 0) return false;
    try {
      const d = new Date(iso);
      const now = new Date(displayHours[0].iso);
      const dDay = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', day: 'numeric' }).format(d);
      const nowDay = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', day: 'numeric' }).format(now);
      return dDay !== nowDay;
    } catch {
      return false;
    }
  };

  return (
    <div className={`w-full overflow-x-auto no-scrollbar pt-3.5 pb-2 ${className}`}>
      <div className="flex items-stretch gap-2.5 min-w-max px-1">
        {displayHours.map((h, idx) => {
          const isBest = isBestWindow(h.iso);
          const isPeak = isPeakWindow(h.iso);
          const isSelected = selectedIso === h.iso;
          const hr = getDelhiHourNumber(h.iso);
          // Range 5am to 6pm: Sun icon | Range 6pm to 5am: Moon icon
          const isDay = hr >= 5 && hr < 18;
          const crossesMidnight = isTomorrow(h.iso, idx);

          return (
            <div
              key={h.iso || idx}
              onClick={() => onSelectHour && onSelectHour(h)}
              className={`
                relative flex flex-col items-center justify-between p-3 rounded-2xl 
                transition-all duration-200 cursor-pointer select-none min-w-[82px] sm:min-w-[86px] h-[136px]
                border backdrop-blur-md
                ${isBest
                  ? 'bg-emerald-500/25 border-emerald-400/60 shadow-md ring-1 ring-emerald-400/50'
                  : isPeak
                  ? 'bg-rose-950/60 border-rose-500/60 shadow-md ring-1 ring-rose-500/40'
                  : isSelected
                  ? 'bg-white/20 border-white/50 shadow-md'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              {/* Badge for Safest or Peak 2-Hour Range */}
              {isBest && (
                <div className="absolute -top-2.5 bg-emerald-500 text-stone-950 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Safest</span>
                </div>
              )}
              {isPeak && !isBest && (
                <div className="absolute -top-2.5 bg-rose-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>Peak</span>
                </div>
              )}

              {/* Time Label - Fixed height 2-row container ensuring identical vertical baseline across all cards */}
              <div className="text-center w-full h-8 flex flex-col items-center justify-start shrink-0">
                <span className="text-xs font-semibold text-white/95 leading-none block truncate">
                  {idx === 0 ? 'Now' : formatHour(h.iso)}
                </span>
                <span className="text-[10px] leading-tight block font-mono mt-1 h-3.5">
                  {idx === 0 ? (
                    <span className="text-white/50">{formatHour(h.iso)}</span>
                  ) : crossesMidnight ? (
                    <span className="text-amber-300/90 text-[9px] font-semibold">+1 Day</span>
                  ) : (
                    <span className="invisible select-none opacity-0" aria-hidden="true">
                      &nbsp;
                    </span>
                  )}
                </span>
              </div>

              {/* Day (Sun 5am–6pm) / Night (Moon 6pm–5am) Icon - Dedicated centered zone */}
              <div className="my-1 flex items-center justify-center w-full h-6 shrink-0">
                {isDay ? (
                  <DaySunIcon className="w-5 h-5 drop-shadow-[0_0_5px_rgba(245,158,11,0.55)] transition-transform hover:scale-110" />
                ) : (
                  <NightMoonIcon className="w-5 h-5 drop-shadow-[0_0_6px_rgba(167,139,250,0.55)] transition-transform hover:scale-110" />
                )}
              </div>

              {/* AQI Score & PM2.5 Concentration */}
              <div className="text-center w-full flex flex-col items-center justify-end shrink-0">
                <span className="font-mono font-bold text-sm text-white leading-none">
                  {h.aqi}
                </span>
                <span className="text-[10px] text-white/60 font-mono mt-1 leading-none">
                  {Math.round(h.pm25)} µg/m³
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
