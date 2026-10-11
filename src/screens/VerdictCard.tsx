/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Verdict Decision Card
 * Action badge (Go / Mask / Stay indoors), warm human headline, transparent reasons,
 * scientific 2-hour Safest Window and 2-hour Peak Hazard range badges,
 * and accessible ARIA live attributes.
 * English only.
 */

import React from 'react';
import { Action, Persona, VerdictResponse } from '../types.ts';
import { GlassCard } from '../design/GlassCard.tsx';
import { LabelPill } from '../design/Pills.tsx';
import { CheckCircle2, ShieldAlert, Home, Sparkles, AlertTriangle, Info } from 'lucide-react';
import { formatWindowRange } from '../lib/bestWindow.ts';

interface VerdictCardProps {
  verdict: VerdictResponse;
  persona?: Persona;
  onChangePersona?: () => void;
  className?: string;
}

export const VerdictCard: React.FC<VerdictCardProps> = ({
  verdict,
  persona: _persona,
  onChangePersona: _onChangePersona,
  className = '',
}) => {
  const getActionConfig = (action: Action) => {
    switch (action) {
      case 'go':
        return {
          label: 'Safe to Go Out',
          icon: CheckCircle2,
          badgeVariant: 'success' as const,
          bgGlow: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'border-emerald-400/40',
        };
      case 'go_with_mask':
        return {
          label: 'Wear an N95 Mask',
          icon: ShieldAlert,
          badgeVariant: 'accent' as const,
          bgGlow: 'rgba(245, 158, 11, 0.2)',
          borderColor: 'border-amber-400/40',
        };
      case 'stay_indoors':
      default:
        return {
          label: 'Stay Indoors Today',
          icon: Home,
          badgeVariant: 'danger' as const,
          bgGlow: 'rgba(239, 68, 68, 0.25)',
          borderColor: 'border-rose-400/40',
        };
    }
  };

  const actionCfg = getActionConfig(verdict.action);
  const ActionIcon = actionCfg.icon;

  return (
    <GlassCard
      className={`relative overflow-hidden ${actionCfg.borderColor} ${className}`}
      aria-live="polite"
    >
      {/* Background Soft Accent Glow */}
      <div
        className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl pointer-events-none"
        style={{ background: actionCfg.bgGlow }}
      />

      <div className="relative z-10">
        {/* Top Header: Action Pill */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <LabelPill
              label={actionCfg.label}
              icon={ActionIcon}
              variant={actionCfg.badgeVariant}
            />
          </div>
        </div>

        {/* Headline Statement */}
        <div className="my-3.5">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight leading-snug">
            {verdict.headline}
          </h2>
        </div>

        {/* Window Callouts: Two-hour Safest Window & Two-hour Peak Hazard Range */}
        <div className="my-3.5 space-y-2">
          {verdict.bestWindow && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm text-emerald-100">
                <span className="font-bold">Safest window to step out: </span>
                <span className="font-semibold text-white">
                  {formatWindowRange(verdict.bestWindow.startIso, verdict.bestWindow.endIso)}
                </span>
                <span className="text-emerald-300/90 ml-1 font-mono text-[11px] sm:text-xs">
                  ({verdict.bestWindow.avgPm25} µg/m³)
                </span>
              </div>
            </div>
          )}

          {verdict.peakWindow && (
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-400/30 flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-rose-400/20 text-rose-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-sm text-rose-100">
                <span className="font-bold">Peak pollution hazard: </span>
                <span className="font-semibold text-white">
                  {formatWindowRange(verdict.peakWindow.startIso, verdict.peakWindow.endIso)}
                </span>
                <span className="text-rose-300/90 ml-1 font-mono text-[11px] sm:text-xs">
                  ({verdict.peakWindow.avgPm25} µg/m³)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Transparent Reason Bullets */}
        <div className="mt-3 space-y-2">
          {verdict.reasons.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/85 leading-relaxed">
              <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-2 shrink-0" />
              <span>{reason}</span>
            </div>
          ))}
        </div>

        {/* Medical disclaimer note */}
        <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-white/50">
          <Info className="w-3 h-3 shrink-0" />
          <span>Transparent CPCB heuristic rules. Grounded in atmospheric boundary-layer science.</span>
        </div>
      </div>
    </GlassCard>
  );
};
