/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch Design System Tokens
 * CPCB Indian AQI Scale with Standard Government Color Themes:
 *  - 0 to 50:    🟩 Green  | Good
 *  - 51 to 100:  🟨 Yellow | Satisfactory
 *  - 101 to 200: 🟧 Orange | Moderate
 *  - 201 to 300: 🟥 Red    | Poor
 *  - 301 to 400: 🟪 Purple | Very Poor
 *  - 401+:       🟫 Maroon | Severe
 */

import { Band } from '../types.js';

export interface BandTheme {
  id: Band;
  name: string;
  colorName: string;
  indexRange: string;
  healthImpact: string;
  gradient: string;
  bgBase: string;
  heroText: string;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  cardBorder: string;
  cardGlow: string;
  pillBg: string;
  pillText: string;
  accent: string;
  accentText: string;
  sunColor: string;
  sunOpacity: number;
  hazeColor: string;
  hazeOpacity: number;
  skylineTint: string;
}

export const BAND_THEMES: Record<Band, BandTheme> = {
  // 🟩 Green | Good (0 to 50) -> #00B050
  good: {
    id: 'good',
    name: 'Good',
    colorName: 'Green',
    indexRange: '0 to 50',
    healthImpact: 'Air quality is satisfactory; little to no health risk.',
    gradient: 'linear-gradient(180deg, #004d23 0%, #006b31 25%, #008f41 55%, #00b050 80%, #22c55e 100%)',
    bgBase: '#004d23',
    heroText: '#ecfdf5',
    textPrimary: '#ffffff',
    textSecondary: '#a7f3d0',
    cardBg: 'rgba(0, 176, 80, 0.22)',
    cardBorder: 'rgba(0, 176, 80, 0.45)',
    cardGlow: '0 8px 32px 0 rgba(0, 176, 80, 0.25), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
    pillBg: 'rgba(0, 176, 80, 0.40)',
    pillText: '#ffffff',
    accent: '#00B050',
    accentText: '#003316',
    sunColor: '#fef08a',
    sunOpacity: 0.95,
    hazeColor: '#6ee7b7',
    hazeOpacity: 0.08,
    skylineTint: '#006b31',
  },

  // 🟨 Lime-Yellow | Satisfactory (51 to 100) -> #f2ff80
  satisfactory: {
    id: 'satisfactory',
    name: 'Satisfactory',
    colorName: 'Lime-Yellow',
    indexRange: '51 to 100',
    healthImpact: 'Acceptable air quality, but may pose a minor risk to unusually sensitive individuals.',
    gradient: 'linear-gradient(180deg, #3d5921 0%, #4f732b 25%, #669438 55%, #7ea844 80%, #92d050 100%)',
    bgBase: '#3d5921',
    heroText: '#f7fee7',
    textPrimary: '#ffffff',
    textSecondary: '#f2ff80',
    cardBg: 'rgba(242, 255, 128, 0.22)',
    cardBorder: 'rgba(242, 255, 128, 0.50)',
    cardGlow: '0 8px 32px 0 rgba(242, 255, 128, 0.28), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
    pillBg: 'rgba(242, 255, 128, 0.35)',
    pillText: '#ffffff',
    accent: '#f2ff80',
    accentText: '#273815',
    sunColor: '#f2ff80',
    sunOpacity: 0.9,
    hazeColor: '#f2ff80',
    hazeOpacity: 0.15,
    skylineTint: '#4f732b',
  },

  // 🟧 Yellow-Gold | Moderate (101 to 200) -> #FFD400
  moderate: {
    id: 'moderate',
    name: 'Moderate',
    colorName: 'Yellow-Gold',
    indexRange: '101 to 200',
    healthImpact: 'Members of sensitive groups (e.g. asthma, elderly, children) may experience health effects.',
    gradient: 'linear-gradient(180deg, #665500 0%, #856e00 25%, #ad8f00 55%, #d6b200 80%, #ffd400 100%)',
    bgBase: '#665500',
    heroText: '#fefce8',
    textPrimary: '#ffffff',
    textSecondary: '#fef08a',
    cardBg: 'rgba(255, 212, 0, 0.20)',
    cardBorder: 'rgba(255, 212, 0, 0.45)',
    cardGlow: '0 8px 32px 0 rgba(255, 212, 0, 0.25), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
    pillBg: 'rgba(255, 212, 0, 0.38)',
    pillText: '#ffffff',
    accent: '#FFD400',
    accentText: '#3b3100',
    sunColor: '#fde047',
    sunOpacity: 0.8,
    hazeColor: '#fef08a',
    hazeOpacity: 0.25,
    skylineTint: '#856e00',
  },

  // 🟧 Orange | Poor (201 to 300) -> #FF9900
  poor: {
    id: 'poor',
    name: 'Poor',
    colorName: 'Orange',
    indexRange: '201 to 300',
    healthImpact: 'Everyone may begin to experience health effects; sensitive groups experience more serious effects.',
    gradient: 'linear-gradient(180deg, #663d00 0%, #854f00 25%, #b36b00 55%, #db8400 80%, #ff9900 100%)',
    bgBase: '#663d00',
    heroText: '#fff7ed',
    textPrimary: '#ffffff',
    textSecondary: '#fed7aa',
    cardBg: 'rgba(255, 153, 0, 0.22)',
    cardBorder: 'rgba(255, 153, 0, 0.45)',
    cardGlow: '0 8px 32px 0 rgba(255, 153, 0, 0.25), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
    pillBg: 'rgba(255, 153, 0, 0.40)',
    pillText: '#ffffff',
    accent: '#FF9900',
    accentText: '#3b2300',
    sunColor: '#fb923c',
    sunOpacity: 0.65,
    hazeColor: '#fed7aa',
    hazeOpacity: 0.4,
    skylineTint: '#854f00',
  },

  // 🟥 Red | Very Poor (301 to 400) -> #E53935
  very_poor: {
    id: 'very_poor',
    name: 'Very Poor',
    colorName: 'Red',
    indexRange: '301 to 400',
    healthImpact: 'Health alert: The risk of health complications is significantly increased for everyone.',
    gradient: 'linear-gradient(180deg, #5c1715 0%, #7d1f1c 25%, #a12824 55%, #c4312d 80%, #e53935 100%)',
    bgBase: '#5c1715',
    heroText: '#fee2e2',
    textPrimary: '#ffffff',
    textSecondary: '#fca5a5',
    cardBg: 'rgba(229, 57, 53, 0.24)',
    cardBorder: 'rgba(229, 57, 53, 0.45)',
    cardGlow: '0 8px 32px 0 rgba(229, 57, 53, 0.28), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
    pillBg: 'rgba(229, 57, 53, 0.42)',
    pillText: '#ffffff',
    accent: '#E53935',
    accentText: '#ffffff',
    sunColor: '#f87171',
    sunOpacity: 0.45,
    hazeColor: '#fca5a5',
    hazeOpacity: 0.55,
    skylineTint: '#7d1f1c',
  },

  // 🟫 Maroon / Deep Crimson | Severe (401 and higher) -> #A31515
  severe: {
    id: 'severe',
    name: 'Severe',
    colorName: 'Maroon',
    indexRange: '401 and higher',
    healthImpact: 'Emergency health warning conditions; entire population is likely to be affected.',
    gradient: 'linear-gradient(180deg, #3d0808 0%, #540b0b 25%, #6e0e0e 55%, #881212 80%, #a31515 100%)',
    bgBase: '#3d0808',
    heroText: '#ffe4e6',
    textPrimary: '#ffffff',
    textSecondary: '#fecdd3',
    cardBg: 'rgba(163, 21, 21, 0.30)',
    cardBorder: 'rgba(163, 21, 21, 0.48)',
    cardGlow: '0 8px 32px 0 rgba(163, 21, 21, 0.30), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
    pillBg: 'rgba(163, 21, 21, 0.48)',
    pillText: '#ffffff',
    accent: '#A31515',
    accentText: '#ffffff',
    sunColor: '#e11d48',
    sunOpacity: 0.28,
    hazeColor: '#fda4af',
    hazeOpacity: 0.72,
    skylineTint: '#540b0b',
  },
};
