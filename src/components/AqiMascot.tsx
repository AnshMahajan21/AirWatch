import React from 'react';
import { Band } from '../types.ts';
import mascot1 from '../assets/images/1.png';
import mascot2 from '../assets/images/2.png';
import mascot3 from '../assets/images/3.png';
import mascot4 from '../assets/images/4.png';
import mascot5 from '../assets/images/5.png';
import mascot6 from '../assets/images/6.png';

interface AqiMascotProps {
  band: Band;
  aqi?: number;
  className?: string;
}

export const MASCOT_IMAGE_MAP: Record<Band, { src: string; file: string; color: string }> = {
  good: {
    src: mascot1,
    file: '1.png',
    color: '#22c55e',
  },
  satisfactory: {
    src: mascot2,
    file: '2.png',
    color: '#eab308',
  },
  moderate: {
    src: mascot3,
    file: '3.png',
    color: '#f97316',
  },
  poor: {
    src: mascot4,
    file: '4.png',
    color: '#ef4444',
  },
  very_poor: {
    src: mascot5,
    file: '5.png',
    color: '#a855f7',
  },
  severe: {
    src: mascot6,
    file: '6.png',
    color: '#991b1b',
  },
};

export const AqiMascot: React.FC<AqiMascotProps> = ({
  band,
  className = '',
}) => {
  const item = MASCOT_IMAGE_MAP[band] || MASCOT_IMAGE_MAP.moderate;

  return (
    <div className={`w-full flex justify-center items-center ${className}`}>
      <img
        src={item.src}
        alt="AirWatch AQI Mascot"
        className="w-auto h-48 sm:h-56 object-contain drop-shadow-2xl transition-transform duration-300 hover:scale-105 pointer-events-none select-none"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
