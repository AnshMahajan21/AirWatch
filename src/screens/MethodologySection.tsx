/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Official CPCB IND-AQI Methodology Section
 * Clean, high-legibility methodology section displaying the exact mathematical equations,
 * 24-hr & 8-hr rolling average windows, 3-pollutant validity rule, and complete breakpoint table.
 */

import React from 'react';
import { GlassCard } from '../design/GlassCard.tsx';
import { CPCB_INDEX_BANDS } from '../lib/aqi.ts';
import { Calculator, ShieldCheck, Clock, CheckCircle2, FileText } from 'lucide-react';

export const MethodologySection: React.FC = () => {
  return (
    <GlassCard className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Official CPCB Calculation Methodology
            </h3>
            <p className="text-xs text-white/60">
              India National Air Quality Index (IND-AQI) Mathematical Protocol
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold w-fit">
          Government Protocol Verified
        </span>
      </div>

      {/* Grid of Key Methodology Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Card 1: Linear Interpolation Equation */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
            <Calculator className="w-4 h-4" />
            <span>Linear Interpolation Sub-Index</span>
          </div>
          <p className="text-white/80 leading-relaxed text-[11px]">
            The sub-index (<code className="font-mono text-amber-300">Ip</code>) for each individual pollutant is calculated using piecewise linear interpolation between official breakpoint ranges:
          </p>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-center text-amber-300 text-xs tracking-wide">
            Ip = ((Ihi - Ilo) / (BPhi - BPlo)) * (Cp - BPlo) + Ilo
          </div>
          <ul className="text-[10px] text-white/60 space-y-1 font-mono pt-1">
            <li>• Cp = Measured concentration / rolling average</li>
            <li>• BPhi, BPlo = Breakpoint concentration boundaries</li>
            <li>• Ihi, Ilo = Sub-index category boundaries</li>
            <li>• Band 6 (250+ PM2.5): Extrapolated with Band 5 slope & clamped at 500</li>
          </ul>
        </div>

        {/* Card 2: Composite AQI & Validity Rules */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-sky-300 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Composite AQI & 3-Pollutant Rule</span>
          </div>
          <p className="text-white/80 leading-relaxed text-[11px]">
            The overall AQI is governed strictly by the highest sub-index among all monitored pollutants:
          </p>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-center text-sky-300 text-xs">
            Overall AQI = max(Ip) &nbsp;•&nbsp; Dominant Pollutant = argmax(Ip)
          </div>
          <div className="p-2 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-200 text-[11px] leading-relaxed">
            <strong>Mandatory CPCB Validation:</strong> At least <strong>3 pollutants</strong> must be measured, and at least one must be <strong>PM2.5 or PM10</strong>. If not met, the reading is officially marked as <em>insufficient data</em>.
          </div>
        </div>

        {/* Card 3: Rolling Averaging Windows */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
            <Clock className="w-4 h-4" />
            <span>Rolling Averaging Windows</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-white/80 leading-relaxed">
            <p>
              • <strong>24-Hour Rolling Average:</strong> Required for PM2.5, PM10, NO2, SO2, and NH3 (needs at least 16 hourly readings).
            </p>
            <p>
              • <strong>8-Hour Rolling Average:</strong> Required for Carbon Monoxide (CO, in mg/m³) and Ozone (O3).
            </p>
            <p className="text-amber-300/90 italic pt-1">
              *If the required hours are not fully covered, the engine computes directly from the latest hour and displays: "Based on latest hour, not 24-hour average".
            </p>
          </div>
        </div>

        {/* Card 4: Official CPCB Categories */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Categories & Health Impacts</span>
          </div>
          <div className="space-y-1.5 text-[10px] text-white/80">
            {CPCB_INDEX_BANDS.map((b) => (
              <div key={b.band} className="flex items-center justify-between gap-1 p-1.5 rounded-lg bg-white/5 border border-white/10">
                <span className="font-bold text-white shrink-0">{b.category} ({b.iLow}–{b.iHigh}):</span>
                <span className="text-white/70 italic truncate text-right">{b.healthStatement}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakpoint Matrix Table */}
      <div className="pt-2 border-t border-white/10 space-y-2">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
          Complete 7-Pollutant CPCB Breakpoint Reference Table
        </h4>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-[11px] font-mono border-collapse">
            <thead>
              <tr className="border-b border-white/20 text-white/50 text-[10px]">
                <th className="py-1.5 px-2">Pollutant</th>
                <th className="py-1.5 px-2">Band 1 (0-50)</th>
                <th className="py-1.5 px-2">Band 2 (51-100)</th>
                <th className="py-1.5 px-2">Band 3 (101-200)</th>
                <th className="py-1.5 px-2">Band 4 (201-300)</th>
                <th className="py-1.5 px-2">Band 5 (301-400)</th>
                <th className="py-1.5 px-2">Band 6 (401-500)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-white/90">
              <tr>
                <td className="py-2 px-2 font-bold text-amber-400">PM2.5 (µg/m³)</td>
                <td className="py-2 px-2">0–30</td>
                <td className="py-2 px-2">31–60</td>
                <td className="py-2 px-2">61–90</td>
                <td className="py-2 px-2">91–120</td>
                <td className="py-2 px-2">121–250</td>
                <td className="py-2 px-2 text-rose-300 font-bold">250+</td>
              </tr>
              <tr>
                <td className="py-2 px-2 font-bold text-amber-400">PM10 (µg/m³)</td>
                <td className="py-2 px-2">0–50</td>
                <td className="py-2 px-2">51–100</td>
                <td className="py-2 px-2">101–250</td>
                <td className="py-2 px-2">251–350</td>
                <td className="py-2 px-2">351–430</td>
                <td className="py-2 px-2 text-rose-300 font-bold">430+</td>
              </tr>
              <tr>
                <td className="py-2 px-2 font-bold text-amber-400">NO2 (µg/m³)</td>
                <td className="py-2 px-2">0–40</td>
                <td className="py-2 px-2">41–80</td>
                <td className="py-2 px-2">81–180</td>
                <td className="py-2 px-2">181–280</td>
                <td className="py-2 px-2">281–400</td>
                <td className="py-2 px-2 text-rose-300 font-bold">400+</td>
              </tr>
              <tr>
                <td className="py-2 px-2 font-bold text-amber-400">O3 (8h, µg/m³)</td>
                <td className="py-2 px-2">0–50</td>
                <td className="py-2 px-2">51–100</td>
                <td className="py-2 px-2">101–168</td>
                <td className="py-2 px-2">169–208</td>
                <td className="py-2 px-2">209–748</td>
                <td className="py-2 px-2 text-rose-300 font-bold">748+</td>
              </tr>
              <tr>
                <td className="py-2 px-2 font-bold text-amber-400">CO (8h, mg/m³)</td>
                <td className="py-2 px-2">0–1.0</td>
                <td className="py-2 px-2">1.1–2.0</td>
                <td className="py-2 px-2">2.1–10</td>
                <td className="py-2 px-2">10–17</td>
                <td className="py-2 px-2">17–34</td>
                <td className="py-2 px-2 text-rose-300 font-bold">34+</td>
              </tr>
              <tr>
                <td className="py-2 px-2 font-bold text-amber-400">SO2 (µg/m³)</td>
                <td className="py-2 px-2">0–40</td>
                <td className="py-2 px-2">41–80</td>
                <td className="py-2 px-2">81–380</td>
                <td className="py-2 px-2">381–800</td>
                <td className="py-2 px-2">801–1600</td>
                <td className="py-2 px-2 text-rose-300 font-bold">1600+</td>
              </tr>
              <tr>
                <td className="py-2 px-2 font-bold text-amber-400">NH3 (µg/m³)</td>
                <td className="py-2 px-2">0–200</td>
                <td className="py-2 px-2">201–400</td>
                <td className="py-2 px-2">401–800</td>
                <td className="py-2 px-2">801–1200</td>
                <td className="py-2 px-2">1200–1800</td>
                <td className="py-2 px-2 text-rose-300 font-bold">1800+</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </GlassCard>
  );
};
