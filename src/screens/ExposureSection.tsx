/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Exposure Meter Section
 * Clean, non-overflowing cumulative exposure budget calculator.
 * English only.
 */

import React, { useState, useEffect } from 'react';
import { ExposureResponse, HourPoint } from '../types.ts';
import { fetchExposureData } from '../services/api.ts';
import { calculateExposure } from '../lib/exposure.ts';
import { ArcGauge } from '../design/ArcGauge.tsx';
import { LabelPill } from '../design/Pills.tsx';
import { ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';

interface ExposureSectionProps {
  lat: number;
  lon: number;
  hourly?: HourPoint[];
  demoMode?: boolean;
  bandOverride?: string;
  className?: string;
}

export const ExposureSection: React.FC<ExposureSectionProps> = ({
  lat,
  lon,
  hourly,
  demoMode = false,
  bandOverride,
  className = '',
}) => {
  const [hours, setHours] = useState<number>(2);
  const [exposure, setExposure] = useState<ExposureResponse | null>(null);

  useEffect(() => {
    if (hourly && hourly.length > 0) {
      setExposure(calculateExposure(hourly, hours));
      return;
    }

    let cancelled = false;
    fetchExposureData(lat, lon, hours, demoMode, bandOverride)
      .then((data) => {
        if (!cancelled) setExposure(data);
      })
      .catch((err) => {
        console.error('Failed to load exposure:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [hourly, lat, lon, hours, demoMode, bandOverride]);

  const getStatusBadge = (label?: string) => {
    if (label === 'within') {
      return {
        pill: <LabelPill label="Safe Range" variant="success" icon={ShieldCheck} />,
        note: 'Estimated particulate dose is within safe 24-hr daily clearance limits.',
      };
    }
    if (label === 'near') {
      return {
        pill: <LabelPill label="Near Daily Cap" variant="warning" icon={AlertTriangle} />,
        note: 'Approaching daily limit. Consider moving remaining activities indoors.',
      };
    }
    return {
      pill: <LabelPill label="Cap Exceeded" variant="danger" icon={XCircle} />,
      note: 'Significant exposure. Wear an N95 respirator if outdoor transit is required.',
    };
  };

  const statusInfo = getStatusBadge(exposure?.label);

  return (
    <div className={`space-y-4 overflow-hidden w-full ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-serif font-bold text-white">
            Estimated AQI Exposure
          </h3>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-white/70">
            Daily Budget
          </span>
        </div>
        {exposure && statusInfo.pill}
      </div>

      {/* Main Container - responsive side-by-side on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* Gauge Box */}
        <div className="flex flex-col items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 overflow-hidden w-full">
          <div className="w-full flex justify-center py-1">
            <ArcGauge
              value={exposure?.budgetPct || 0}
              max={100}
              label="Budget Used"
              sublabel="60 µg/m³ 24h standard"
            />
          </div>

          <div className="mt-2 flex items-center justify-around w-full border-t border-white/10 pt-2.5 text-center text-xs">
            <div>
              <div className="text-[10px] text-white/50 uppercase font-mono">Dose Received</div>
              <div className="font-bold font-mono text-white text-sm">
                {exposure?.pm25Dose ?? 0} µg·h/m³
              </div>
            </div>
            <div className="h-5 w-px bg-white/10" />
            <div>
              <div className="text-[10px] text-white/50 uppercase font-mono">Category</div>
              <div className="font-bold capitalize text-white text-sm">
                {exposure?.label ?? 'calculating'}
              </div>
            </div>
          </div>
        </div>

        {/* Slider & Context Box */}
        <div className="flex flex-col justify-between gap-3">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="hours-slider" className="font-semibold text-white">
                Planned outdoor time:
              </label>
              <span className="font-mono font-bold text-amber-300 text-sm">
                {hours} {hours === 1 ? 'hour' : 'hours'}
              </span>
            </div>

            <input
              id="hours-slider"
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />

            <div className="flex justify-between text-[10px] text-white/50 font-mono px-0.5">
              <span>0h</span>
              <span>3h</span>
              <span>6h</span>
              <span>9h</span>
              <span>12h</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 leading-relaxed">
            <p>{statusInfo.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
