import { describe, it, expect } from 'vitest';
import {
  pm25ToAqi,
  aqiToBand,
  aqiToPm25,
  calculateSubIndex,
  evaluateOverallAqi,
  getCategoryName,
  getHealthStatement,
  CPCB_INDEX_BANDS,
} from '../src/lib/aqi.ts';
import { calculateVerdict } from '../src/lib/verdict.ts';
import { calculateBestWindow, calculatePeakHazardWindow, formatWindowRange, getAvoidHours } from '../src/lib/bestWindow.ts';
import { getDelhiCurrentHourTimestamp, generateMockHourly } from '../src/lib/fixtures.ts';
import { calculateExposure } from '../src/lib/exposure.ts';
import { calculateSchoolStatus } from '../src/lib/school.ts';
import { HourPoint } from '../src/lib/types.ts';

describe('Official CPCB IND-AQI Linear Interpolation & Breakpoints', () => {
  it('calculates PM2.5 sub-indices across all 6 CPCB bands', () => {
    // Band 1: 0-30 -> 0-50 (Good)
    expect(calculateSubIndex('pm25', 0)).toBe(0);
    expect(calculateSubIndex('pm25', 15)).toBe(25);
    expect(calculateSubIndex('pm25', 30)).toBe(50);
    expect(aqiToBand(50)).toBe('good');

    // Band 2: 31-60 -> 51-100 (Satisfactory)
    expect(calculateSubIndex('pm25', 31)).toBe(51);
    expect(calculateSubIndex('pm25', 60)).toBe(100);
    expect(aqiToBand(100)).toBe('satisfactory');

    // Band 3: 61-90 -> 101-200 (Moderate)
    expect(calculateSubIndex('pm25', 61)).toBe(101);
    expect(calculateSubIndex('pm25', 90)).toBe(200);
    expect(aqiToBand(200)).toBe('moderate');

    // Band 4: 91-120 -> 201-300 (Poor)
    expect(calculateSubIndex('pm25', 91)).toBe(201);
    expect(calculateSubIndex('pm25', 120)).toBe(300);
    expect(aqiToBand(300)).toBe('poor');

    // Band 5: 121-250 -> 301-400 (Very Poor)
    expect(calculateSubIndex('pm25', 121)).toBe(301);
    expect(calculateSubIndex('pm25', 250)).toBe(400);
    expect(aqiToBand(400)).toBe('very_poor');

    // Band 6: 250+ -> extrapolated with Band 5 slope, clamped at 500 (Severe)
    const aqi251 = calculateSubIndex('pm25', 251);
    expect(aqi251).toBeGreaterThanOrEqual(401);
    expect(aqiToBand(aqi251)).toBe('severe');

    expect(calculateSubIndex('pm25', 500)).toBe(500);
    expect(calculateSubIndex('pm25', 800)).toBe(500);
  });

  it('calculates sub-indices for PM10, NO2, O3, CO, SO2, NH3 accurately', () => {
    // PM10: Band 1: 0-50 -> 0-50, Band 3: 101-250 -> 101-200
    expect(calculateSubIndex('pm10', 50)).toBe(50);
    expect(calculateSubIndex('pm10', 250)).toBe(200);

    // NO2: Band 1: 0-40 -> 0-50, Band 2: 41-80 -> 51-100
    expect(calculateSubIndex('no2', 40)).toBe(50);
    expect(calculateSubIndex('no2', 80)).toBe(100);

    // O3 (8h): Band 1: 0-50 -> 0-50, Band 3: 101-168 -> 101-200
    expect(calculateSubIndex('o3', 50)).toBe(50);
    expect(calculateSubIndex('o3', 168)).toBe(200);

    // CO (8h, mg/m3): Band 1: 0-1.0 -> 0-50, Band 2: 1.1-2.0 -> 51-100
    expect(calculateSubIndex('co', 1.0)).toBe(50);
    expect(calculateSubIndex('co', 2.0)).toBe(100);

    // SO2: Band 1: 0-40 -> 0-50
    expect(calculateSubIndex('so2', 40)).toBe(50);

    // NH3: Band 1: 0-200 -> 0-50
    expect(calculateSubIndex('nh3', 200)).toBe(50);
  });

  it('enforces open top band slope extrapolation and clamps at 500', () => {
    // CO Band 5 is 17-34 (range 17), AQI 301-400 (range 99, slope ~ 5.82)
    const coAqiHigh = calculateSubIndex('co', 40);
    expect(coAqiHigh).toBeGreaterThanOrEqual(401);
    expect(coAqiHigh).toBeLessThanOrEqual(500);
    expect(calculateSubIndex('co', 100)).toBe(500);
  });
});

describe('CPCB Categories and Mandatory Health Statements', () => {
  it('returns exact official categories and health statements', () => {
    expect(getCategoryName(25)).toBe('Good');
    expect(getHealthStatement(25)).toBe('Minimal impact');

    expect(getCategoryName(75)).toBe('Satisfactory');
    expect(getHealthStatement(75)).toBe('May cause minor breathing discomfort to sensitive people');

    expect(getCategoryName(150)).toBe('Moderate');
    expect(getHealthStatement(150)).toBe('May cause breathing discomfort to people with lung disease, asthma and heart disease');

    expect(getCategoryName(250)).toBe('Poor');
    expect(getHealthStatement(250)).toBe('May cause breathing discomfort to most people on prolonged exposure');

    expect(getCategoryName(350)).toBe('Very Poor');
    expect(getHealthStatement(350)).toBe('May cause respiratory illness on prolonged exposure');

    expect(getCategoryName(450)).toBe('Severe');
    expect(getHealthStatement(450)).toBe('Affects healthy people and seriously affects people with existing diseases');
  });
});

describe('Composite AQI Evaluation, Validity & Dominant Pollutant', () => {
  it('identifies overall AQI as maximum sub-index and tags dominant pollutant', () => {
    const result = evaluateOverallAqi({
      pm25: { value: 75, isRollingAvg: true }, // Band 3 (61-90) -> Sub-index ~ 149
      pm10: { value: 60, isRollingAvg: true }, // Band 2 (51-100) -> Sub-index ~ 60
      no2: { value: 30, isRollingAvg: true },  // Band 1 (0-40) -> Sub-index ~ 38
    });

    expect(result.isValid).toBe(true);
    expect(result.isInsufficient).toBe(false);
    expect(result.dominantPollutant).toBe('pm25');
    expect(result.aqi).toBeGreaterThan(100);
    expect(result.averagingNote).toBeUndefined();
  });

  it('marks AQI as insufficient if fewer than 3 pollutants are present', () => {
    const result = evaluateOverallAqi({
      pm25: { value: 75, isRollingAvg: true },
      pm10: { value: 60, isRollingAvg: true },
    });

    expect(result.isValid).toBe(false);
    expect(result.isInsufficient).toBe(true);
  });

  it('marks AQI as insufficient if neither PM2.5 nor PM10 is present', () => {
    const result = evaluateOverallAqi({
      no2: { value: 35, isRollingAvg: true },
      so2: { value: 20, isRollingAvg: true },
      co: { value: 1.2, isRollingAvg: true },
    });

    expect(result.isValid).toBe(false);
    expect(result.isInsufficient).toBe(true);
  });

  it('shows latest hour averaging note when rolling window is not covered', () => {
    const result = evaluateOverallAqi({
      pm25: { value: 75, isRollingAvg: false }, // Latest hour fallback!
      pm10: { value: 60, isRollingAvg: true },
      no2: { value: 30, isRollingAvg: true },
    });

    expect(result.isValid).toBe(true);
    expect(result.averagingNote).toBe('Based on latest hour, not 24-hour average');
  });
});

describe('Verdict Decision Engine for the 3 Profiles', () => {
  const dummyHourly: HourPoint[] = [
    { iso: '2026-10-08T06:00:00Z', pm25: 45, pm10: 90, aqi: 75, band: 'satisfactory' },
    { iso: '2026-10-08T09:00:00Z', pm25: 80, pm10: 150, aqi: 167, band: 'moderate' },
    { iso: '2026-10-08T12:00:00Z', pm25: 35, pm10: 70, aqi: 58, band: 'satisfactory' },
    { iso: '2026-10-08T15:00:00Z', pm25: 30, pm10: 60, aqi: 50, band: 'good' },
    { iso: '2026-10-08T18:00:00Z', pm25: 110, pm10: 220, aqi: 267, band: 'poor' },
  ];

  it('assigns tailored actions to general profile', () => {
    const goodPt: HourPoint = { iso: '2026-10-08T12:00:00Z', pm25: 20, pm10: 40, aqi: 33, band: 'good' };
    const modPt: HourPoint = { iso: '2026-10-08T12:00:00Z', pm25: 75, pm10: 130, aqi: 150, band: 'moderate' };
    const poorPt: HourPoint = { iso: '2026-10-08T12:00:00Z', pm25: 110, pm10: 200, aqi: 260, band: 'poor' };
    const severePt: HourPoint = { iso: '2026-10-08T12:00:00Z', pm25: 300, pm10: 450, aqi: 420, band: 'severe' };

    expect(calculateVerdict('general', goodPt, dummyHourly).action).toBe('go');
    expect(calculateVerdict('general', modPt, dummyHourly).action).toBe('go_with_mask');
    expect(calculateVerdict('general', poorPt, dummyHourly).action).toBe('go_with_mask');
    expect(calculateVerdict('general', severePt, dummyHourly).action).toBe('stay_indoors');
  });

  it('assigns tailored actions to school profile', () => {
    const goodPt: HourPoint = { iso: '2026-10-08T12:00:00Z', pm25: 20, pm10: 40, aqi: 33, band: 'good' };
    const modPt: HourPoint = { iso: '2026-10-08T12:00:00Z', pm25: 75, pm10: 130, aqi: 150, band: 'moderate' };
    const poorPt: HourPoint = { iso: '2026-10-08T12:00:00Z', pm25: 110, pm10: 200, aqi: 260, band: 'poor' };
    const vPoorPt: HourPoint = { iso: '2026-10-08T12:00:00Z', pm25: 180, pm10: 280, aqi: 350, band: 'very_poor' };

    expect(calculateVerdict('school', goodPt, dummyHourly).action).toBe('go');
    expect(calculateVerdict('school', modPt, dummyHourly).action).toBe('go_with_mask');
    expect(calculateVerdict('school', poorPt, dummyHourly).action).toBe('stay_indoors');
    expect(calculateVerdict('school', vPoorPt, dummyHourly).action).toBe('stay_indoors');
  });

  it('assigns tailored actions to medical profile', () => {
    const goodPt: HourPoint = { iso: '2026-10-08T12:00:00Z', pm25: 20, pm10: 40, aqi: 33, band: 'good' };
    const modPt: HourPoint = { iso: '2026-10-08T12:00:00Z', pm25: 75, pm10: 130, aqi: 150, band: 'moderate' };
    const poorPt: HourPoint = { iso: '2026-10-08T12:00:00Z', pm25: 110, pm10: 200, aqi: 260, band: 'poor' };

    expect(calculateVerdict('medical', goodPt, dummyHourly).action).toBe('go');
    expect(calculateVerdict('medical', modPt, dummyHourly).action).toBe('stay_indoors');
    expect(calculateVerdict('medical', poorPt, dummyHourly).action).toBe('stay_indoors');
  });
});

describe('Best Window & Avoid Hours Logic', () => {
  const hourlySample: HourPoint[] = [
    { iso: '2026-10-08T07:00:00Z', pm25: 180, pm10: 290, aqi: 346, band: 'very_poor' },
    { iso: '2026-10-08T08:00:00Z', pm25: 190, pm10: 310, aqi: 354, band: 'very_poor' },
    { iso: '2026-10-08T09:00:00Z', pm25: 170, pm10: 280, aqi: 338, band: 'very_poor' },
    { iso: '2026-10-08T13:00:00Z', pm25: 40, pm10: 80, aqi: 67, band: 'satisfactory' },
    { iso: '2026-10-08T14:00:00Z', pm25: 45, pm10: 85, aqi: 75, band: 'satisfactory' },
    { iso: '2026-10-08T15:00:00Z', pm25: 42, pm10: 82, aqi: 70, band: 'satisfactory' },
    { iso: '2026-10-08T19:00:00Z', pm25: 210, pm10: 330, aqi: 370, band: 'very_poor' },
    { iso: '2026-10-08T20:00:00Z', pm25: 220, pm10: 340, aqi: 377, band: 'very_poor' },
  ];

  it('selects the cleanest afternoon 2-hour window', () => {
    const win = calculateBestWindow(hourlySample);
    expect(win).not.toBeNull();
    expect(win?.startIso).toBe('2026-10-08T13:00:00Z');
    expect(win?.endIso).toBe('2026-10-08T14:00:00Z');
    expect(win?.avgPm25).toBe(43);
  });

  it('selects the peak hazard 2-hour window', () => {
    const peak = calculatePeakHazardWindow(hourlySample);
    expect(peak).not.toBeNull();
    expect(peak?.startIso).toBe('2026-10-08T19:00:00Z');
    expect(peak?.endIso).toBe('2026-10-08T20:00:00Z');
    expect(peak?.avgPm25).toBe(215);
  });

  it('identifies worst 3 avoid hours', () => {
    const avoid = getAvoidHours(hourlySample);
    expect(avoid.length).toBe(3);
    expect(avoid).toContain('2026-10-08T20:00:00Z');
    expect(avoid).toContain('2026-10-08T19:00:00Z');
    expect(avoid).toContain('2026-10-08T08:00:00Z');
  });
});

describe('Cumulative Exposure Calculations', () => {
  const hourly: HourPoint[] = [
    { iso: '2026-10-08T10:00:00Z', pm25: 120, pm10: 200, aqi: 300, band: 'poor' },
    { iso: '2026-10-08T11:00:00Z', pm25: 120, pm10: 200, aqi: 300, band: 'poor' },
  ];

  it('calculates dose and budget label correctly', () => {
    const res2 = calculateExposure(hourly, 2);
    expect(res2.pm25Dose).toBe(240);
    expect(res2.budgetPct).toBe(17);
    expect(res2.label).toBe('within');
    expect(res2.isEstimate).toBe(true);

    const res10 = calculateExposure(hourly, 10);
    expect(res10.budgetPct).toBe(83);
    expect(res10.label).toBe('near');

    const res107 = calculateExposure(hourly, 12.84);
    expect(res107.budgetPct).toBe(107);
    expect(res107.label).toBe('over');
  });
});
