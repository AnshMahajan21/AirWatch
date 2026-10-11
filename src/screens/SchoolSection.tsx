/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - School Outdoor Safety Section
 * Search campus, displays traffic light advisory, and activity checklist.
 * English only.
 */

import React, { useState, useEffect } from 'react';
import { Band, SchoolResponse } from '../types.ts';
import { fetchSchoolData } from '../services/api.ts';
import { LabelPill } from '../design/Pills.tsx';
import { Search, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface SchoolSectionProps {
  currentBand: Band;
  currentAqi?: number;
  className?: string;
}

const COMMON_NCR_SCHOOLS = [
  'Delhi Public School, R.K. Puram',
  'Modern School, Barakhamba Road',
  'The Mother\'s International School',
  'Amity International School, Noida',
  'The Heritage School, Gurugram',
  'Shiv Nadar School, Faridabad',
  'Step By Step School, Noida',
];

export const SchoolSection: React.FC<SchoolSectionProps> = ({
  currentBand,
  currentAqi: _currentAqi,
  className = '',
}) => {
  const [query, setQuery] = useState<string>(COMMON_NCR_SCHOOLS[0]);
  const [schoolData, setSchoolData] = useState<SchoolResponse | null>(null);
  const [_loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchSchoolData(query, currentBand)
      .then((data) => {
        if (!cancelled) {
          setSchoolData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('School fetch failed:', err);
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, currentBand]);

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-serif font-bold text-white">
              School & Campus Outdoor Safety
            </h3>
            <LabelPill label="DoE & GRAP Aligned" variant="neutral" />
          </div>
          <p className="text-xs text-white/70 mt-0.5">
            Real-time advisory for morning assemblies, sports, PE, and outdoor recess.
          </p>
        </div>
      </div>

      {/* Search Input & Quick Chips */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-white/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search school or district..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
          <span className="text-white/40 text-[11px] shrink-0 font-mono">Popular:</span>
          {COMMON_NCR_SCHOOLS.slice(0, 4).map((sch, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQuery(sch)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 whitespace-nowrap border border-white/10 text-[11px] cursor-pointer transition-colors"
            >
              {sch.split(',')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Advisory Display - Compact card scaled to the space */}
      {schoolData && (
        <div className="w-full flex justify-center">
          <div className="w-full max-w-xl space-y-4 bg-white/5 p-4 sm:p-5 rounded-3xl border border-white/10 shadow-lg">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase font-mono text-white/50 tracking-wider">Current Evaluation</span>
                <h4 className="text-base sm:text-lg font-bold text-white line-clamp-1">{schoolData.schoolName}</h4>
              </div>

              {schoolData.status === 'green' && (
                <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Green Status</span>
                </div>
              )}
              {schoolData.status === 'amber' && (
                <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 shrink-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Amber Status</span>
                </div>
              )}
              {schoolData.status === 'red' && (
                <div className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1 shrink-0">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Red Status</span>
                </div>
              )}
            </div>

            {/* Checklist */}
            <div className="divide-y divide-white/10">
              {schoolData.activities.map((act, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-white/90 font-medium">{act.name}</span>
                  <span
                    className={`
                      px-2.5 py-0.5 rounded-full text-xs font-semibold
                      ${act.ok ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}
                    `}
                  >
                    {act.ok ? 'Permitted' : 'Suspended'}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-white/70 italic border-t border-white/10 pt-3 leading-relaxed">
              "{schoolData.summary}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
