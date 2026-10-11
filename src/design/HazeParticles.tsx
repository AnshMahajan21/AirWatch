/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Atmospheric Haze Particles
 * Soft drifting particles whose density and opacity scale with PM2.5.
 * Automatically halts when prefers-reduced-motion is active.
 */

import React, { useMemo } from 'react';

interface HazeParticlesProps {
  pm25: number;
  className?: string;
}

export const HazeParticles: React.FC<HazeParticlesProps> = ({ pm25, className = '' }) => {
  // Density: 8 particles for clean air up to 28 particles for severe smog
  const count = Math.min(28, Math.max(6, Math.round(pm25 / 12)));

  const particles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: 4 + (i % 7) * 3,
      top: `${(i * 17) % 95}%`,
      left: `${(i * 23) % 96}%`,
      opacity: 0.12 + ((i % 5) * 0.05),
      animDuration: `${14 + (i % 8) * 3}s`,
      animDelay: `${(i * 1.5) % 8}s`,
    }));
  }, [count]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none ${className}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white/20 blur-xs transition-opacity duration-1000"
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            left: p.left,
            opacity: p.opacity,
            animation: `drift ${p.animDuration} infinite ease-in-out alternate`,
            animationDelay: p.animDelay,
          }}
        />
      ))}
      <style>{`
        @keyframes drift {
          0% { transform: translate(0px, 0px) scale(0.9); }
          50% { transform: translate(18px, -14px) scale(1.1); }
          100% { transform: translate(-12px, 16px) scale(0.95); }
        }
        @media (prefers-reduced-motion: reduce) {
          .drift { animation: none !important; }
        }
      `}</style>
    </div>
  );
};
