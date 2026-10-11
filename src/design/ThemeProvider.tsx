/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Atmospheric Theme Provider
 * Responsive website background using exactly the user-provided images:
 *  - Laptop / Desktop: laptop_baclground.png
 *  - Mobile: Delhi_skyshine.png
 *  - Full-website atmospheric scrim with zero images in individual AQI cards
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Band } from '../types.ts';
import { BAND_THEMES, BandTheme } from './tokens.ts';
import laptopBg from '../assets/images/Laptop.png';
import mobileBg from '../assets/images/Mobile.png';

interface ThemeContextType {
  band: Band;
  setBand: (band: Band) => void;
  theme: BandTheme;
}

const ThemeContext = createContext<ThemeContextType>({
  band: 'moderate',
  setBand: () => {},
  theme: BAND_THEMES.moderate,
});

export const useAtmosphericTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  initialBand?: Band;
  currentBand?: Band;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  initialBand = 'moderate',
  currentBand,
  children,
}) => {
  const [band, setBand] = useState<Band>(currentBand || initialBand);

  useEffect(() => {
    if (currentBand && currentBand !== band) {
      setBand(currentBand);
    }
  }, [currentBand]);

  const activeTheme = BAND_THEMES[band] || BAND_THEMES.moderate;

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && activeTheme) {
      meta.setAttribute('content', activeTheme.bgBase);
    }
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{ band, setBand, theme: activeTheme }}>
      <div className="relative min-h-screen w-full overflow-x-hidden font-sans text-white bg-slate-950">
        {/* Whole Website Background: Laptop / Desktop Image (>= 768px) */}
        <div
          className="fixed inset-0 hidden md:block bg-cover bg-center bg-no-repeat pointer-events-none z-0 transform-gpu"
          style={{
            backgroundImage: `url(${laptopBg})`,
          }}
          aria-hidden="true"
        />

        {/* Whole Website Background: Mobile Image (< 768px) */}
        <div
          className="fixed inset-0 block md:hidden bg-cover bg-center bg-no-repeat pointer-events-none z-0 transform-gpu"
          style={{
            backgroundImage: `url(${mobileBg})`,
          }}
          aria-hidden="true"
        />

        {/* Ambient Dark Scrim / Vignette to ensure WCAG AA text contrast over photographic backdrop */}
        <div 
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(circle at 50% 15%, rgba(10, 15, 29, 0.45) 0%, rgba(6, 10, 20, 0.78) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Content Container */}
        <div className="relative z-10 w-full min-h-screen flex flex-col">
          {children}
        </div>
      </div>
    </ThemeContext.Provider>
  );
};
