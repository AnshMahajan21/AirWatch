/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Pixel Art School Safety Card
 * Ref 3 inspired pixelated aesthetic with 8-bit styling, 3 states (clear/green, alert/amber, hazard/red),
 * designed specifically for crisp WhatsApp / Instagram story image rendering.
 */

import React, { forwardRef } from 'react';
import { SchoolResponse } from '../types.js';
import { ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';

interface PixelCardProps {
  school: SchoolResponse;
  dateStr?: string;
  aqi?: number;
  className?: string;
}

export const PixelCard = forwardRef<HTMLDivElement, PixelCardProps>(
  ({ school, dateStr, aqi, className = '' }, ref) => {
    const isGreen = school.status === 'green';
    const isAmber = school.status === 'amber';
    const isRed = school.status === 'red';

    let bgGrad = 'bg-stone-900 border-rose-500';
    let bannerBg = 'bg-rose-950 text-rose-200 border-rose-500';
    let statusText = 'HAZARD // OUTDOOR SUSPENDED';
    let StatusIcon = XCircle;

    if (isGreen) {
      bgGrad = 'bg-stone-950 border-emerald-500';
      bannerBg = 'bg-emerald-950 text-emerald-200 border-emerald-500';
      statusText = 'CLEAR // OUTDOOR APPROVED';
      StatusIcon = ShieldCheck;
    } else if (isAmber) {
      bgGrad = 'bg-stone-950 border-amber-500';
      bannerBg = 'bg-amber-950 text-amber-200 border-amber-500';
      statusText = 'CAUTION // MODIFIED RECESS';
      StatusIcon = AlertTriangle;
    }

    const today = dateStr || new Date().toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return (
      <div
        ref={ref}
        className={`
          w-full max-w-[380px] rounded-2xl p-5 border-2 shadow-2xl 
          font-sans text-white select-none relative overflow-hidden
          ${bgGrad} ${className}
        `}
        style={{
          boxShadow: isGreen
            ? '0 0 25px rgba(16, 185, 129, 0.25)'
            : isAmber
            ? '0 0 25px rgba(245, 158, 11, 0.25)'
            : '0 0 25px rgba(239, 68, 68, 0.35)',
        }}
      >
        {/* Retro Grid Background Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Top Header Banner */}
        <div className="flex items-center justify-between pb-3 border-b border-white/15 relative z-10">
          <div>
            <div className="font-['Press_Start_2P',monospace] text-[10px] tracking-wider uppercase text-amber-400">
              AIRWATCH ADVISORY
            </div>
            <div className="text-xs text-white/60 mt-1 font-mono">
              {today}
            </div>
          </div>
          {aqi !== undefined && (
            <div className="flex flex-col items-end">
              <span className="text-[9px] uppercase font-mono text-white/50">DELHI AQI</span>
              <span className="font-['Press_Start_2P',monospace] text-base text-white">
                {aqi}
              </span>
            </div>
          )}
        </div>

        {/* School Name */}
        <div className="my-4 relative z-10">
          <div className="text-[11px] font-mono text-white/50 uppercase tracking-widest">
            Campus Advisory
          </div>
          <div className="text-lg font-bold text-white tracking-tight mt-0.5 line-clamp-1">
            {school.schoolName}
          </div>
        </div>

        {/* Status Callout Pill */}
        <div
          className={`
            flex items-center gap-2.5 p-3 rounded-xl border mb-4 relative z-10
            ${bannerBg}
          `}
        >
          <StatusIcon className="w-5 h-5 shrink-0" />
          <div className="font-['Press_Start_2P',monospace] text-[10px] leading-relaxed">
            {statusText}
          </div>
        </div>

        {/* Activity Checklist (8-bit style check / cross) */}
        <div className="space-y-2 relative z-10 bg-white/5 p-3 rounded-xl border border-white/10">
          {school.activities.map((act, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1">
              <span className="text-white/85 font-medium">{act.name}</span>
              <span
                className={`
                  px-2 py-0.5 rounded text-[10px] font-['Press_Start_2P',monospace]
                  ${act.ok ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}
                `}
              >
                {act.ok ? 'OK' : 'HALT'}
              </span>
            </div>
          ))}
        </div>

        {/* Advisory Summary */}
        <p className="mt-4 text-xs text-white/70 italic relative z-10 leading-relaxed border-t border-white/10 pt-3">
          "{school.summary}"
        </p>

        {/* Footer Brand Verification */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-white/40 font-mono relative z-10">
          <span>Track 01: Air • CPCB Grid</span>
          <span>airwatch.app</span>
        </div>
      </div>
    );
  }
);

PixelCard.displayName = 'PixelCard';
