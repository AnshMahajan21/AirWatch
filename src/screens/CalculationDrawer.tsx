/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - How Calculation Works Drawer
 * Transparent breakdown of official Central Pollution Control Board (CPCB) India
 * National Air Quality Index (IND-AQI) standards, mathematical linear interpolation,
 * 24h/8h rolling average rules, 3-pollutant validity criteria, and diurnal thermal inversion.
 */

import React from 'react';
import { X, ShieldCheck, Sun, Info, BookOpen, Calculator, Clock } from 'lucide-react';
import { CPCB_INDEX_BANDS } from '../lib/aqi.ts';

interface CalculationDrawerProps {
  onClose: () => void;
}

export const CalculationDrawer: React.FC<CalculationDrawerProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-stone-900 border border-white/20 rounded-[32px] shadow-2xl p-6 sm:p-8 text-white relative max-h-[88vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-serif font-bold text-white">CPCB IND-AQI Technical Standards</h2>
        </div>
        <p className="text-xs text-white/70 mb-6">
          Official mathematical equations, rolling average protocols, and health statement criteria.
        </p>

        <div className="space-y-5 text-xs text-white/80 leading-relaxed">
          {/* Section 1: Official Categories & Exact Health Statements */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>1. Official CPCB Categories & Health Statements</span>
            </h3>
            <p className="text-[11px] text-white/70">
              Each AQI score maps strictly to an official Indian National category and mandatory health statement:
            </p>
            <div className="space-y-1.5 text-[11px]">
              {CPCB_INDEX_BANDS.map((b) => (
                <div
                  key={b.band}
                  className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">
                      {b.category} ({b.iLow}–{b.iHigh})
                    </span>
                  </div>
                  <span className="text-white/80 italic text-[11px] sm:text-right max-w-md">
                    "{b.healthStatement}"
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Mathematical Sub-Index Formula */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2.5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>2. Linear Interpolation Sub-Index Formula</span>
            </h3>
            <p>
              The sub-index for each individual pollutant is calculated via piecewise linear interpolation:
            </p>
            <div className="p-3 rounded-xl bg-black/40 border border-white/15 font-mono text-center text-amber-300 text-xs sm:text-sm">
              Ip = ((Ihi - Ilo) / (BPhi - BPlo)) * (Cp - BPlo) + Ilo
            </div>
            <ul className="space-y-1 text-[11px] text-white/70 pl-2">
              <li>• <strong>Ip:</strong> Sub-index for the monitored pollutant</li>
              <li>• <strong>Cp:</strong> Measured ambient concentration (or rolling average)</li>
              <li>• <strong>BPhi, BPlo:</strong> Breakpoint concentration range containing Cp</li>
              <li>• <strong>Ihi, Ilo:</strong> Corresponding AQI band boundaries</li>
              <li>• <strong>Open Top Band (Band 6):</strong> For concentrations exceeding the 5th breakpoint, extrapolated using the 5th band's slope and clamped at 500.</li>
            </ul>
          </div>

          {/* Section 3: Overall AQI & 3-Pollutant Minimum Rule */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-400" />
              <span>3. Overall AQI & Dominant Pollutant Validation</span>
            </h3>
            <p>
              • <strong>Overall AQI:</strong> Governed by the single highest sub-index among all monitored pollutants: <code className="font-mono text-amber-300">AQI = max(Ip)</code>.
            </p>
            <p>
              • <strong>Dominant Pollutant:</strong> The pollutant whose sub-index equals the overall AQI.
            </p>
            <p className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-200 text-[11px]">
              • <strong>CPCB Validity Rule:</strong> An overall AQI is valid only if at least <strong>3 pollutants</strong> are measured, and at least one of them is <strong>PM2.5 or PM10</strong>. If this criterion is not satisfied, the calculation is marked as <em>insufficient data</em>.
            </p>
          </div>

          {/* Section 4: Rolling Average Requirements */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>4. Averaging Windows & Missing Data Fallback</span>
            </h3>
            <div className="space-y-1.5 text-[11px]">
              <p>
                • <strong>24-Hour Rolling Average:</strong> Required for PM2.5, PM10, NO2, SO2, and NH3 (must contain at least 16 hourly values).
              </p>
              <p>
                • <strong>8-Hour Rolling Average:</strong> Required for CO and Ozone (O3).
              </p>
              <p className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                • <strong>Window Not Covered:</strong> If fewer than the required hourly readings exist, the sub-index is computed directly from the latest hour, displaying: <em>"Based on latest hour, not 24-hour average"</em>.
              </p>
            </div>
          </div>

          {/* Section 5: Official Breakpoints Reference Table */}
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-2">
            <h3 className="font-bold text-white text-sm">
              5. CPCB Pollutant Breakpoint Matrix
            </h3>
            <div className="overflow-x-auto no-scrollbar pt-1">
              <table className="w-full text-left text-[10px] font-mono border-collapse">
                <thead>
                  <tr className="border-b border-white/20 text-white/50">
                    <th className="py-1 px-1.5">Pollutant</th>
                    <th className="py-1 px-1.5">Band 1 (0-50)</th>
                    <th className="py-1 px-1.5">Band 2 (51-100)</th>
                    <th className="py-1 px-1.5">Band 3 (101-200)</th>
                    <th className="py-1 px-1.5">Band 4 (201-300)</th>
                    <th className="py-1 px-1.5">Band 5 (301-400)</th>
                    <th className="py-1 px-1.5">Band 6 (401-500)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-white/90">
                  <tr>
                    <td className="py-1.5 px-1.5 font-bold text-amber-400">PM2.5 (µg/m³)</td>
                    <td className="py-1.5 px-1.5">0–30</td>
                    <td className="py-1.5 px-1.5">31–60</td>
                    <td className="py-1.5 px-1.5">61–90</td>
                    <td className="py-1.5 px-1.5">91–120</td>
                    <td className="py-1.5 px-1.5">121–250</td>
                    <td className="py-1.5 px-1.5">250+</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-1.5 font-bold text-amber-400">PM10 (µg/m³)</td>
                    <td className="py-1.5 px-1.5">0–50</td>
                    <td className="py-1.5 px-1.5">51–100</td>
                    <td className="py-1.5 px-1.5">101–250</td>
                    <td className="py-1.5 px-1.5">251–350</td>
                    <td className="py-1.5 px-1.5">351–430</td>
                    <td className="py-1.5 px-1.5">430+</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-1.5 font-bold text-amber-400">NO2 (µg/m³)</td>
                    <td className="py-1.5 px-1.5">0–40</td>
                    <td className="py-1.5 px-1.5">41–80</td>
                    <td className="py-1.5 px-1.5">81–180</td>
                    <td className="py-1.5 px-1.5">181–280</td>
                    <td className="py-1.5 px-1.5">281–400</td>
                    <td className="py-1.5 px-1.5">400+</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-1.5 font-bold text-amber-400">O3 (8h, µg/m³)</td>
                    <td className="py-1.5 px-1.5">0–50</td>
                    <td className="py-1.5 px-1.5">51–100</td>
                    <td className="py-1.5 px-1.5">101–168</td>
                    <td className="py-1.5 px-1.5">169–208</td>
                    <td className="py-1.5 px-1.5">209–748</td>
                    <td className="py-1.5 px-1.5">748+</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-1.5 font-bold text-amber-400">CO (8h, mg/m³)</td>
                    <td className="py-1.5 px-1.5">0–1.0</td>
                    <td className="py-1.5 px-1.5">1.1–2.0</td>
                    <td className="py-1.5 px-1.5">2.1–10</td>
                    <td className="py-1.5 px-1.5">10–17</td>
                    <td className="py-1.5 px-1.5">17–34</td>
                    <td className="py-1.5 px-1.5">34+</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-1.5 font-bold text-amber-400">SO2 (µg/m³)</td>
                    <td className="py-1.5 px-1.5">0–40</td>
                    <td className="py-1.5 px-1.5">41–80</td>
                    <td className="py-1.5 px-1.5">81–380</td>
                    <td className="py-1.5 px-1.5">381–800</td>
                    <td className="py-1.5 px-1.5">801–1600</td>
                    <td className="py-1.5 px-1.5">1600+</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-1.5 font-bold text-amber-400">NH3 (µg/m³)</td>
                    <td className="py-1.5 px-1.5">0–200</td>
                    <td className="py-1.5 px-1.5">201–400</td>
                    <td className="py-1.5 px-1.5">401–800</td>
                    <td className="py-1.5 px-1.5">801–1200</td>
                    <td className="py-1.5 px-1.5">1200–1800</td>
                    <td className="py-1.5 px-1.5">1800+</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
