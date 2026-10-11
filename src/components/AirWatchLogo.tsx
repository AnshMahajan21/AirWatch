import React from 'react';
import logoImg from '../assets/images/AirWatch_Logo.png';

interface AirWatchLogoProps {
  className?: string;
  size?: number | string;
  alt?: string;
}

export const AirWatchLogo: React.FC<AirWatchLogoProps> = ({
  className = 'w-8 h-8 rounded-full',
  size,
  alt = 'AirWatch Logo',
}) => {
  return (
    <img
      src={logoImg}
      alt={alt}
      width={size}
      height={size}
      className={`shrink-0 rounded-full object-contain ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};
