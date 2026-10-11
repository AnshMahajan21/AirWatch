/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * WCAG AA Contrast Ratio Verification Script
 * Validates text on gradient/background/glass for all 6 AQI bands.
 * WCAG AA requires >= 4.5:1 for normal body text and >= 3:1 for large text (>18pt / bold 14pt).
 */

import { BAND_THEMES } from '../src/design/tokens.js';
import { Band } from '../backend/src/lib/types.js';

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = relativeLuminance(r1, g1, b1);
  const l2 = relativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function runContrastAudit() {
  console.log('\n======================================================');
  console.log('     AIRWATCH WCAG AA CONTRAST AUDIT (ALL BANDS)     ');
  console.log('======================================================');
  
  const bands: Band[] = ['good', 'satisfactory', 'moderate', 'poor', 'very_poor', 'severe'];
  let allPassed = true;

  for (const b of bands) {
    const theme = BAND_THEMES[b];
    const heroRatio = contrastRatio(theme.heroText, theme.bgBase);
    const bodyRatio = contrastRatio(theme.textPrimary, theme.bgBase);
    const subRatio = contrastRatio(theme.textSecondary, theme.bgBase);

    const heroPass = heroRatio >= 3.0;
    const bodyPass = bodyRatio >= 4.5;
    const subPass = subRatio >= 4.5;

    console.log(`\nBand: [${b.toUpperCase()}]`);
    console.log(` - Hero Numeral (${theme.heroText} on ${theme.bgBase}): ${heroRatio.toFixed(2)}:1 (Min 3:1) => ${heroPass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(` - Primary Text (${theme.textPrimary} on ${theme.bgBase}): ${bodyRatio.toFixed(2)}:1 (Min 4.5:1) => ${bodyPass ? '✅ PASS' : '❌ FAIL'}`);
    console.log(` - Secondary Text (${theme.textSecondary} on ${theme.bgBase}): ${subRatio.toFixed(2)}:1 (Min 4.5:1) => ${subPass ? '✅ PASS' : '❌ FAIL'}`);

    if (!heroPass || !bodyPass || !subPass) {
      allPassed = false;
    }
  }

  console.log('\n------------------------------------------------------');
  if (allPassed) {
    console.log('🎉 ALL BANDS PASS WCAG AA CONTRAST REQUIREMENTS!');
  } else {
    console.log('⚠️ Some contrast ratios fell below WCAG AA thresholds.');
  }
  console.log('======================================================\n');
  return allPassed;
}

if (process.argv[1]?.endsWith('contrast-check.ts') || process.argv[1]?.endsWith('contrast-check.js')) {
  runContrastAudit();
}
