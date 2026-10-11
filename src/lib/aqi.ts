/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Central Pollution Control Board (CPCB) India AQI Engine
 * Implements official CPCB Indian National Air Quality Index (IND-AQI) specifications:
 *  - Linear interpolation sub-index calculation per pollutant
 *  - Open top-band slope extrapolation clamped at 500
 *  - 24-hour rolling averaging (>=16 hourly values) for PM2.5, PM10, NO2, SO2, NH3
 *  - 8-hour rolling averaging for CO and O3
 *  - Minimum 3 pollutants with at least one PM2.5 or PM10 for valid AQI
 *  - Dominant pollutant identification (highest sub-index)
 *  - Official CPCB Categories & exact health statements
 */

import { Band, PollutantKey, PollutantReading } from '../types.ts';

export interface CpcbBandDefinition {
  band: Band;
  category: string;
  iLow: number;
  iHigh: number;
  healthStatement: string;
}

export const CPCB_INDEX_BANDS: CpcbBandDefinition[] = [
  {
    band: 'good',
    category: 'Good',
    iLow: 0,
    iHigh: 50,
    healthStatement: 'Minimal impact',
  },
  {
    band: 'satisfactory',
    category: 'Satisfactory',
    iLow: 51,
    iHigh: 100,
    healthStatement: 'May cause minor breathing discomfort to sensitive people',
  },
  {
    band: 'moderate',
    category: 'Moderate',
    iLow: 101,
    iHigh: 200,
    healthStatement: 'May cause breathing discomfort to people with lung disease, asthma and heart disease',
  },
  {
    band: 'poor',
    category: 'Poor',
    iLow: 201,
    iHigh: 300,
    healthStatement: 'May cause breathing discomfort to most people on prolonged exposure',
  },
  {
    band: 'very_poor',
    category: 'Very Poor',
    iLow: 301,
    iHigh: 400,
    healthStatement: 'May cause respiratory illness on prolonged exposure',
  },
  {
    band: 'severe',
    category: 'Severe',
    iLow: 401,
    iHigh: 500,
    healthStatement: 'Affects healthy people and seriously affects people with existing diseases',
  },
];

export interface PollutantBreakpoint {
  bpLow: number;
  bpHigh: number;
  iLow: number;
  iHigh: number;
  band: Band;
}

/**
 * Breakpoints per pollutant as specified by CPCB standard:
 * Pollutant      Band 1  Band 2  Band 3    Band 4    Band 5     Band 6
 * PM2.5          0-30    31-60   61-90     91-120    121-250    250+
 * PM10           0-50    51-100  101-250   251-350   351-430    430+
 * NO2            0-40    41-80   81-180    181-280   281-400    400+
 * O3 (8h)        0-50    51-100  101-168   169-208   209-748    748+
 * CO (8h, mg/m3) 0-1.0   1.1-2.0 2.1-10    10-17     17-34      34+
 * SO2            0-40    41-80   81-380    381-800   801-1600   1600+
 * NH3            0-200   201-400 401-800   801-1200  1200-1800  1800+
 */
export const POLLUTANT_CONFIG: Record<
  PollutantKey,
  {
    name: string;
    unit: string;
    windowHours: number;
    minReadings: number;
    breakpoints: PollutantBreakpoint[];
  }
> = {
  pm25: {
    name: 'PM2.5',
    unit: 'µg/m³',
    windowHours: 24,
    minReadings: 16,
    breakpoints: [
      { bpLow: 0, bpHigh: 30, iLow: 0, iHigh: 50, band: 'good' },
      { bpLow: 31, bpHigh: 60, iLow: 51, iHigh: 100, band: 'satisfactory' },
      { bpLow: 61, bpHigh: 90, iLow: 101, iHigh: 200, band: 'moderate' },
      { bpLow: 91, bpHigh: 120, iLow: 201, iHigh: 300, band: 'poor' },
      { bpLow: 121, bpHigh: 250, iLow: 301, iHigh: 400, band: 'very_poor' },
    ],
  },
  pm10: {
    name: 'PM10',
    unit: 'µg/m³',
    windowHours: 24,
    minReadings: 16,
    breakpoints: [
      { bpLow: 0, bpHigh: 50, iLow: 0, iHigh: 50, band: 'good' },
      { bpLow: 51, bpHigh: 100, iLow: 51, iHigh: 100, band: 'satisfactory' },
      { bpLow: 101, bpHigh: 250, iLow: 101, iHigh: 200, band: 'moderate' },
      { bpLow: 251, bpHigh: 350, iLow: 201, iHigh: 300, band: 'poor' },
      { bpLow: 351, bpHigh: 430, iLow: 301, iHigh: 400, band: 'very_poor' },
    ],
  },
  no2: {
    name: 'NO2',
    unit: 'µg/m³',
    windowHours: 24,
    minReadings: 16,
    breakpoints: [
      { bpLow: 0, bpHigh: 40, iLow: 0, iHigh: 50, band: 'good' },
      { bpLow: 41, bpHigh: 80, iLow: 51, iHigh: 100, band: 'satisfactory' },
      { bpLow: 81, bpHigh: 180, iLow: 101, iHigh: 200, band: 'moderate' },
      { bpLow: 181, bpHigh: 280, iLow: 201, iHigh: 300, band: 'poor' },
      { bpLow: 281, bpHigh: 400, iLow: 301, iHigh: 400, band: 'very_poor' },
    ],
  },
  o3: {
    name: 'Ozone (O3)',
    unit: 'µg/m³',
    windowHours: 8,
    minReadings: 6,
    breakpoints: [
      { bpLow: 0, bpHigh: 50, iLow: 0, iHigh: 50, band: 'good' },
      { bpLow: 51, bpHigh: 100, iLow: 51, iHigh: 100, band: 'satisfactory' },
      { bpLow: 101, bpHigh: 168, iLow: 101, iHigh: 200, band: 'moderate' },
      { bpLow: 169, bpHigh: 208, iLow: 201, iHigh: 300, band: 'poor' },
      { bpLow: 209, bpHigh: 748, iLow: 301, iHigh: 400, band: 'very_poor' },
    ],
  },
  co: {
    name: 'CO (8h)',
    unit: 'mg/m³',
    windowHours: 8,
    minReadings: 6,
    breakpoints: [
      { bpLow: 0, bpHigh: 1.0, iLow: 0, iHigh: 50, band: 'good' },
      { bpLow: 1.1, bpHigh: 2.0, iLow: 51, iHigh: 100, band: 'satisfactory' },
      { bpLow: 2.1, bpHigh: 10, iLow: 101, iHigh: 200, band: 'moderate' },
      { bpLow: 10, bpHigh: 17, iLow: 201, iHigh: 300, band: 'poor' },
      { bpLow: 17, bpHigh: 34, iLow: 301, iHigh: 400, band: 'very_poor' },
    ],
  },
  so2: {
    name: 'SO2',
    unit: 'µg/m³',
    windowHours: 24,
    minReadings: 16,
    breakpoints: [
      { bpLow: 0, bpHigh: 40, iLow: 0, iHigh: 50, band: 'good' },
      { bpLow: 41, bpHigh: 80, iLow: 51, iHigh: 100, band: 'satisfactory' },
      { bpLow: 81, bpHigh: 380, iLow: 101, iHigh: 200, band: 'moderate' },
      { bpLow: 381, bpHigh: 800, iLow: 201, iHigh: 300, band: 'poor' },
      { bpLow: 801, bpHigh: 1600, iLow: 301, iHigh: 400, band: 'very_poor' },
    ],
  },
  nh3: {
    name: 'NH3',
    unit: 'µg/m³',
    windowHours: 24,
    minReadings: 16,
    breakpoints: [
      { bpLow: 0, bpHigh: 200, iLow: 0, iHigh: 50, band: 'good' },
      { bpLow: 201, bpHigh: 400, iLow: 51, iHigh: 100, band: 'satisfactory' },
      { bpLow: 401, bpHigh: 800, iLow: 101, iHigh: 200, band: 'moderate' },
      { bpLow: 801, bpHigh: 1200, iLow: 201, iHigh: 300, band: 'poor' },
      { bpLow: 1200, bpHigh: 1800, iLow: 301, iHigh: 400, band: 'very_poor' },
    ],
  },
};

/**
 * Calculates sub-index for a specific pollutant using linear interpolation:
 * Ip = (Ihi - Ilo) / (BPhi - BPlo) * (Cp - BPlo) + Ilo
 * For the open top band (Band 6), extrapolates with the previous band's slope and clamps at 500.
 */
export function calculateSubIndex(pollutant: PollutantKey, cp: number): number {
  if (cp === null || cp === undefined || isNaN(cp) || cp < 0) {
    return 0;
  }

  const config = POLLUTANT_CONFIG[pollutant];
  if (!config) return 0;

  const bps = config.breakpoints;
  const band5 = bps[4]; // 301-400 band

  // Check if concentration falls in the open top band (above Band 5's top breakpoint)
  if (cp > band5.bpHigh) {
    const slope = (band5.iHigh - band5.iLow) / (band5.bpHigh - band5.bpLow);
    const extrapolated = 401 + slope * (cp - band5.bpHigh);
    return Math.min(500, Math.max(401, Math.round(extrapolated)));
  }

  // Iterate through bands 1 to 5
  for (let i = 0; i < bps.length; i++) {
    const bp = bps[i];
    // Check if cp falls within or at this breakpoint
    if (cp <= bp.bpHigh) {
      // Linear interpolation: Ip = (Ihi - Ilo) / (BPhi - BPlo) * (Cp - BPlo) + Ilo
      const range = bp.bpHigh - bp.bpLow;
      const normalizedCp = Math.max(0, cp - bp.bpLow);
      const subIndex = range > 0
        ? ((bp.iHigh - bp.iLow) / range) * normalizedCp + bp.iLow
        : bp.iLow;
      return Math.min(500, Math.max(0, Math.round(subIndex)));
    }
  }

  return 500;
}

/**
 * Maps an AQI numeric score to its standardized CPCB Band:
 *  - 0 to 50:    Good
 *  - 51 to 100:  Satisfactory
 *  - 101 to 200: Moderate
 *  - 201 to 300: Poor
 *  - 301 to 400: Very Poor
 *  - 401 to 500: Severe
 */
export function aqiToBand(aqi: number): Band {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'satisfactory';
  if (aqi <= 200) return 'moderate';
  if (aqi <= 300) return 'poor';
  if (aqi <= 400) return 'very_poor';
  return 'severe';
}

/**
 * Returns official CPCB category name.
 */
export function getCategoryName(aqi: number): string {
  const band = aqiToBand(aqi);
  const def = CPCB_INDEX_BANDS.find((b) => b.band === band);
  return def ? def.category : 'Moderate';
}

/**
 * Returns official CPCB health statement.
 */
export function getHealthStatement(aqi: number): string {
  const band = aqiToBand(aqi);
  const def = CPCB_INDEX_BANDS.find((b) => b.band === band);
  return def ? def.healthStatement : 'Breathing discomfort to sensitive people';
}

/**
 * Backward compatibility: Converts PM2.5 (µg/m³) into CPCB AQI sub-index.
 */
export function pm25ToAqi(pm25: number): number {
  return calculateSubIndex('pm25', pm25);
}

/**
 * Inverse mapping: converts AQI back to approximate PM2.5 (µg/m³).
 */
export function aqiToPm25(aqi: number): number {
  if (aqi <= 0) return 0;
  if (aqi >= 500) return 250;

  const bps = POLLUTANT_CONFIG.pm25.breakpoints;
  for (const bp of bps) {
    if (aqi <= bp.iHigh) {
      const iRange = bp.iHigh - bp.iLow;
      const bpRange = bp.bpHigh - bp.bpLow;
      const pm25 = iRange > 0 ? (bpRange / iRange) * (aqi - bp.iLow) + bp.bpLow : bp.bpLow;
      return Math.round(pm25);
    }
  }

  // Band 6 inverse
  const band5 = bps[4];
  const slope = (band5.iHigh - band5.iLow) / (band5.bpHigh - band5.bpLow);
  const pm25 = (aqi - 401) / slope + band5.bpHigh;
  return Math.round(pm25);
}

/**
 * Inverse mapping: converts AQI back to approximate PM10 (µg/m³).
 */
export function aqiToPm10(aqi: number): number {
  if (aqi <= 0) return 0;
  if (aqi >= 500) return 430;

  const bps = POLLUTANT_CONFIG.pm10.breakpoints;
  for (const bp of bps) {
    if (aqi <= bp.iHigh) {
      const iRange = bp.iHigh - bp.iLow;
      const bpRange = bp.bpHigh - bp.bpLow;
      const pm10 = iRange > 0 ? (bpRange / iRange) * (aqi - bp.iLow) + bp.bpLow : bp.bpLow;
      return Math.round(pm10);
    }
  }

  const band5 = bps[4];
  const slope = (band5.iHigh - band5.iLow) / (band5.bpHigh - band5.bpLow);
  const pm10 = (aqi - 401) / slope + band5.bpHigh;
  return Math.round(pm10);
}

/**
 * Evaluates comprehensive multi-pollutant AQI according to official CPCB rules:
 * 1. Calculate sub-index for each present pollutant
 * 2. Overall AQI = highest sub-index
 * 3. Validation: Must have at least 3 pollutants, and at least ONE must be PM2.5 or PM10.
 * 4. Dominant pollutant: The pollutant with the highest sub-index.
 */
export interface OverallAqiResult {
  aqi: number;
  band: Band;
  category: string;
  healthStatement: string;
  dominantPollutant: PollutantKey;
  isValid: boolean;
  isInsufficient: boolean;
  averagingNote?: string;
  readings: Record<PollutantKey, PollutantReading>;
  validPollutantCount: number;
}

export function evaluateOverallAqi(
  pollutantValues: Partial<Record<PollutantKey, { value: number; isRollingAvg: boolean }>>
): OverallAqiResult {
  const readings: Partial<Record<PollutantKey, PollutantReading>> = {};
  let maxSubIndex = 0;
  let dominant: PollutantKey = 'pm25';
  let hasPm = false;
  let validCount = 0;
  let anyNonRolling = false;

  const allKeys: PollutantKey[] = ['pm25', 'pm10', 'no2', 'o3', 'co', 'so2', 'nh3'];

  for (const key of allKeys) {
    const raw = pollutantValues[key];
    if (raw !== undefined && raw.value !== null && !isNaN(raw.value)) {
      const subIndex = calculateSubIndex(key, raw.value);
      const band = aqiToBand(subIndex);
      readings[key] = {
        key,
        name: POLLUTANT_CONFIG[key].name,
        value: raw.value,
        unit: POLLUTANT_CONFIG[key].unit,
        subIndex,
        band,
        isRollingAvg: raw.isRollingAvg,
        windowHours: POLLUTANT_CONFIG[key].windowHours,
      };

      validCount++;
      if (key === 'pm25' || key === 'pm10') {
        hasPm = true;
      }
      if (!raw.isRollingAvg) {
        anyNonRolling = true;
      }

      if (subIndex > maxSubIndex) {
        maxSubIndex = subIndex;
        dominant = key;
      }
    }
  }

  // Validity rule: at least 3 pollutants AND one of them PM2.5 or PM10
  const isValid = validCount >= 3 && hasPm;
  const isInsufficient = !isValid;

  const finalAqi = maxSubIndex;
  const band = aqiToBand(finalAqi);
  const category = getCategoryName(finalAqi);
  const healthStatement = getHealthStatement(finalAqi);

  let averagingNote: string | undefined = undefined;
  if (anyNonRolling) {
    averagingNote = 'Based on latest hour, not 24-hour average';
  }

  return {
    aqi: finalAqi,
    band,
    category,
    healthStatement,
    dominantPollutant: dominant,
    isValid,
    isInsufficient,
    averagingNote,
    readings: readings as Record<PollutantKey, PollutantReading>,
    validPollutantCount: validCount,
  };
}
