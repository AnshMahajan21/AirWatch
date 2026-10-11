/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Pills & Stat Bars
 * Clean, tactile metadata pills and interactive selector capsules.
 * English only.
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface LabelPillProps {
  label: string;
  icon?: LucideIcon;
  variant?: 'neutral' | 'accent' | 'warning' | 'danger' | 'success';
  className?: string;
}

export const LabelPill: React.FC<LabelPillProps> = ({
  label,
  icon: Icon,
  variant = 'neutral',
  className = '',
}) => {
  let colorClasses = 'bg-white/15 text-white border-white/20';
  if (variant === 'accent') colorClasses = 'bg-amber-500/25 text-amber-200 border-amber-400/30';
  if (variant === 'success') colorClasses = 'bg-emerald-500/25 text-emerald-200 border-emerald-400/30';
  if (variant === 'warning') colorClasses = 'bg-orange-500/25 text-orange-200 border-orange-400/30';
  if (variant === 'danger') colorClasses = 'bg-rose-500/25 text-rose-200 border-rose-400/30';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 
        rounded-full text-xs font-semibold tracking-wide 
        border backdrop-blur-md shadow-xs select-none
        ${colorClasses} ${className}
      `}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{label}</span>
    </span>
  );
};

interface StatItem {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
}

interface StatPillProps {
  stats: StatItem[];
  className?: string;
}

export const StatPill: React.FC<StatPillProps> = ({ stats, className = '' }) => {
  return (
    <div
      className={`
        flex items-center justify-between divide-x divide-white/15 
        bg-white/10 backdrop-blur-xl border border-white/20 
        rounded-2xl px-4 py-2.5 shadow-lg select-none ${className}
      `}
    >
      {stats.map((st, idx) => {
        const Icon = st.icon;
        return (
          <div key={idx} className="flex-1 flex flex-col items-center justify-center px-2 text-center">
            <div className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-white/70 font-medium">
              {Icon && <Icon className="w-3 h-3 text-white/80" />}
              <span>{st.label}</span>
            </div>
            <div className="mt-0.5 text-sm sm:text-base font-bold text-white tracking-tight flex items-baseline gap-0.5">
              <span>{st.value}</span>
              {st.unit && <span className="text-[11px] font-normal text-white/70">{st.unit}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
