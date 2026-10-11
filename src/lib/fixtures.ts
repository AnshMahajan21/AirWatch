/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Pure Mock & Fixture Generators
 * Generates contiguous next-24-hours diurnal curves for NCR presets,
 * including multi-pollutant telemetry conforming to official CPCB standards.
 */

import { AirResponse, Band, HourPoint, NCR_PRESETS, PollutantKey } from '../types.ts';
import { aqiToBand, evaluateOverallAqi, pm25ToAqi } from './aqi.ts';
import { findClosestCpcbStation } from './delhiLocations.ts';

export function getDelhiHour(date: Date): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });
    return parseInt(formatter.format(date), 10) % 24;
  } catch {
    return date.getHours();
  }
}

export function getDelhiCurrentHourTimestamp(nowMs: number = Date.now()): number {
  const IST_OFFSET_MS = 5.5 * 3600 * 1000;
  // Compute top of current hour in Asia/Kolkata
  return Math.floor((nowMs + IST_OFFSET_MS) / 3600000) * 3600000 - IST_OFFSET_MS;
}

export function generateMockHourly(basePm25: number, startFromMs?: number): HourPoint[] {
  const points: HourPoint[] = [];
  const baseTimestampMs = startFromMs !== undefined ? startFromMs : getDelhiCurrentHourTimestamp();

  // Generate contiguous 24 hours ahead (hour 0 = current hour, hour 1 = +1h, etc.)
  for (let i = 0; i < 24; i++) {
    const d = new Date(baseTimestampMs + i * 3600 * 1000);
    const hour = getDelhiHour(d);

    // Delhi diurnal cycle in IST (Asia/Kolkata):
    // - Morning rush & shallow inversion layer (6 AM to 9 AM): high (1.35x)
    // - Afternoon solar convection dip & deepest boundary layer (1 PM to 4 PM): cleanest/safest (0.65x)
    // - Evening rush & nocturnal thermal inversion (7 PM to 11 PM): peak hazard (1.45x)
    // - Overnight trapped pollutants (12 AM to 5 AM): elevated (1.25x)
    let diurnalFactor = 1.0;
    if (hour >= 6 && hour <= 9) diurnalFactor = 1.35; // morning rush & inversion peak
    else if (hour >= 13 && hour <= 16) diurnalFactor = 0.65; // afternoon solar convection dip (SAFEST)
    else if (hour >= 19 && hour <= 23) diurnalFactor = 1.45; // night inversion & trapped smoke (PEAK HAZARD)
    else if (hour >= 0 && hour <= 5) diurnalFactor = 1.25;

    const pm25 = Math.max(12, Math.round(basePm25 * diurnalFactor + Math.sin(i) * 4));
    const pm10 = Math.round(pm25 * 1.85);
    const no2 = Math.max(10, Math.round(35 * diurnalFactor + Math.cos(i) * 5));
    const o3 = Math.max(15, Math.round(hour >= 12 && hour <= 17 ? 95 : 35));
    const co = Math.round(((0.8 * diurnalFactor) + 0.1) * 10) / 10;
    const so2 = Math.max(8, Math.round(18 + Math.sin(i) * 3));
    const nh3 = Math.max(20, Math.round(120 * diurnalFactor));

    const evaluated = evaluateOverallAqi({
      pm25: { value: pm25, isRollingAvg: true },
      pm10: { value: pm10, isRollingAvg: true },
      no2: { value: no2, isRollingAvg: true },
      o3: { value: o3, isRollingAvg: true },
      co: { value: co, isRollingAvg: true },
      so2: { value: so2, isRollingAvg: true },
      nh3: { value: nh3, isRollingAvg: true },
    });

    points.push({
      iso: d.toISOString(),
      pm25,
      pm10,
      aqi: evaluated.aqi,
      band: evaluated.band,
      pollutants: evaluated.readings,
      dominantPollutant: evaluated.dominantPollutant,
      isInsufficient: evaluated.isInsufficient,
      healthStatement: evaluated.healthStatement,
    });
  }

  return points;
}

export const DEMO_BAND_PRESETS: Record<string, { aqi: number; band: Band; pm25: number; pm10: number; no2: number; o3: number; co: number; so2: number; nh3: number }> = {
  good: {
    aqi: 35,
    band: 'good',
    pm25: 20,
    pm10: 40,
    no2: 25,
    o3: 30,
    co: 0.5,
    so2: 12,
    nh3: 45,
  },
  satisfactory: {
    aqi: 75,
    band: 'satisfactory',
    pm25: 45,
    pm10: 80,
    no2: 40,
    o3: 50,
    co: 0.9,
    so2: 18,
    nh3: 75,
  },
  moderate: {
    aqi: 145,
    band: 'moderate',
    pm25: 75,
    pm10: 140,
    no2: 60,
    o3: 75,
    co: 1.4,
    so2: 25,
    nh3: 110,
  },
  poor: {
    aqi: 245,
    band: 'poor',
    pm25: 110,
    pm10: 210,
    no2: 85,
    o3: 95,
    co: 2.1,
    so2: 35,
    nh3: 160,
  },
  very_poor: {
    aqi: 345,
    band: 'very_poor',
    pm25: 175,
    pm10: 310,
    no2: 115,
    o3: 125,
    co: 3.2,
    so2: 48,
    nh3: 210,
  },
  severe: {
    aqi: 445,
    band: 'severe',
    pm25: 320,
    pm10: 460,
    no2: 155,
    o3: 165,
    co: 4.8,
    so2: 65,
    nh3: 280,
  },
};

export function createMockAirResponse(
  lat: number,
  lon: number,
  locationName?: string,
  bandOverride?: string
): AirResponse {
  const closest = findClosestCpcbStation(lat, lon);
  const name = locationName || closest.station.name;

  const target = bandOverride ? DEMO_BAND_PRESETS[bandOverride] : null;
  const basePm25 = target ? target.pm25 : 115;

  const hourly = generateMockHourly(basePm25);

  if (target) {
    hourly[0].aqi = target.aqi;
    hourly[0].band = target.band;
    hourly[0].pm25 = target.pm25;
    hourly[0].pm10 = target.pm10;
    hourly[0].dominantPollutant = 'pm25';
    if (hourly[0].pollutants) {
      hourly[0].pollutants.pm25 = {
        key: 'pm25',
        name: 'PM2.5',
        value: target.pm25,
        unit: 'µg/m³',
        subIndex: target.aqi,
        band: target.band,
        isRollingAvg: true,
        windowHours: 24,
      };
      hourly[0].pollutants.pm10 = {
        key: 'pm10',
        name: 'PM10',
        value: target.pm10,
        unit: 'µg/m³',
        subIndex: Math.min(500, Math.round(target.aqi * 0.95)),
        band: target.band,
        isRollingAvg: true,
        windowHours: 24,
      };
    }
  }

  const current = hourly[0];

  return {
    location: { name, lat, lon },
    station: {
      name: `${closest.station.name} CAAQMS`,
      distanceKm: closest.distanceKm,
      source: 'CPCB',
    },
    current,
    hourly,
    daily: [
      { date: new Date().toISOString().split('T')[0], aqi: current.aqi, band: current.band },
      {
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        aqi: Math.min(500, Math.round(current.aqi * 1.05)),
        band: aqiToBand(Math.min(500, Math.round(current.aqi * 1.05))),
      },
      {
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        aqi: Math.round(current.aqi * 0.9),
        band: aqiToBand(Math.round(current.aqi * 0.9)),
      },
    ],
    updatedAt: new Date().toISOString(),
    source: 'demo',
    dominantPollutant: current.dominantPollutant || 'pm25',
    isInsufficient: false,
    healthStatement: current.healthStatement,
    pollutants: current.pollutants,
  };
}
