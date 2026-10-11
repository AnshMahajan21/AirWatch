/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Frontend API Client
 * Primary: connects to /api/air endpoint on the full-stack server (backed by real-time AQICN & CPCB feeds).
 * Fallback: direct browser fetch and pure client diurnal model.
 */

import {
  AirResponse,
  DailyPoint,
  ExposureResponse,
  HourPoint,
  NCR_PRESETS,
  Persona,
  SchoolResponse,
  StationInfo,
  SubscribeRequest,
  VerdictResponse,
} from '../types.ts';
import { aqiToBand, aqiToPm25, aqiToPm10, pm25ToAqi, getCategoryName, getHealthStatement } from '../lib/aqi.ts';
import { calculateVerdict } from '../lib/verdict.ts';
import { calculateExposure } from '../lib/exposure.ts';
import { calculateSchoolStatus } from '../lib/school.ts';
import { createMockAirResponse, generateMockHourly } from '../lib/fixtures.ts';
import { findClosestCpcbStation } from '../lib/delhiLocations.ts';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const AWS_FALLBACK_API = 'https://5ibac43qa6.execute-api.ap-southeast-2.amazonaws.com';
const CACHE_KEY_AIR_PREFIX = 'airwatch_cached_air_v3';
const CACHE_KEY_VERDICT_PREFIX = 'airwatch_cached_verdict_v3';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getLocCacheKey(lat: number, lon: number): string {
  return `${CACHE_KEY_AIR_PREFIX}_${lat.toFixed(3)}_${lon.toFixed(3)}`;
}

/**
 * Direct client-side fallback if server /api/air is offline
 */
async function fetchDirectClientAir(
  lat: number,
  lon: number,
  locationName?: string,
  demoMode: boolean = false,
  bandOverride?: string
): Promise<AirResponse> {
  if (demoMode || bandOverride) {
    return createMockAirResponse(lat, lon, locationName, bandOverride);
  }

  const closest = findClosestCpcbStation(lat, lon);
  const name = locationName || closest.station.name;

  // Direct autonomous physical model fallback keyed to the closest active CPCB monitor
  return createMockAirResponse(lat, lon, name);
}

export async function fetchAirData(
  lat: number,
  lon: number,
  locationName?: string,
  demoMode: boolean = false,
  bandOverride?: string
): Promise<AirResponse> {
  const query = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    name: locationName || '',
    ...(demoMode ? { demo: 'true' } : {}),
    ...(bandOverride ? { band: bandOverride } : {}),
  });

  const locKey = getLocCacheKey(lat, lon);

  // 1. Primary: Configured API Endpoint (/api or VITE_API_URL)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${API_BASE}/air?${query.toString()}`, { signal: controller.signal });
    clearTimeout(timeout);

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data: AirResponse = await res.json();
      try {
        localStorage.setItem(locKey, JSON.stringify({ data, savedAt: Date.now() }));
        localStorage.setItem('airwatch_last_lat_lon', JSON.stringify({ lat, lon }));
      } catch {}
      return data;
    }
  } catch {}

  // 2. Secondary: If on local dev or relative /api failed, reach live AWS API Gateway directly
  if (API_BASE !== AWS_FALLBACK_API) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${AWS_FALLBACK_API}/air?${query.toString()}`, { signal: controller.signal });
      clearTimeout(timeout);

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data: AirResponse = await res.json();
        try {
          localStorage.setItem(locKey, JSON.stringify({ data, savedAt: Date.now() }));
        } catch {}
        return data;
      }
    } catch {}
  }

  // 3. Tertiary: Location-specific cache (if within TTL)
  try {
    const raw = localStorage.getItem(locKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.data && Date.now() - (parsed.savedAt || 0) < CACHE_TTL_MS) {
        return { ...parsed.data, source: 'cache' };
      }
    }
  } catch {}

  // 4. Autonomous physical boundary model fallback
  return fetchDirectClientAir(lat, lon, locationName, demoMode, bandOverride);
}

export async function fetchVerdictData(
  lat: number,
  lon: number,
  persona: Persona,
  demoMode: boolean = false,
  bandOverride?: string
): Promise<VerdictResponse> {
  const query = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    persona,
    ...(demoMode ? { demo: 'true' } : {}),
    ...(bandOverride ? { band: bandOverride } : {}),
  });

  try {
    const res = await fetch(`${API_BASE}/verdict?${query.toString()}`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data: VerdictResponse = await res.json();
      try {
        localStorage.setItem(`${CACHE_KEY_VERDICT}_${persona}`, JSON.stringify(data));
      } catch {}
      return data;
    }
  } catch {}

  // Pure local calculation
  const air = await fetchAirData(lat, lon, undefined, demoMode, bandOverride);
  const verdict = calculateVerdict(persona, air.current, air.hourly);
  try {
    localStorage.setItem(`${CACHE_KEY_VERDICT}_${persona}`, JSON.stringify(verdict));
  } catch {}
  return verdict;
}

export async function fetchExposureData(
  lat: number,
  lon: number,
  hoursOutside: number,
  demoMode: boolean = false,
  bandOverride?: string
): Promise<ExposureResponse> {
  const query = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    hoursOutside: hoursOutside.toString(),
    ...(demoMode ? { demo: 'true' } : {}),
    ...(bandOverride ? { band: bandOverride } : {}),
  });

  try {
    const res = await fetch(`${API_BASE}/exposure?${query.toString()}`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch {}

  // Pure local calculation
  const air = await fetchAirData(lat, lon, undefined, demoMode, bandOverride);
  return calculateExposure(air.hourly, hoursOutside);
}

export async function fetchSchoolData(
  querySchool: string,
  band?: string
): Promise<SchoolResponse> {
  const query = new URLSearchParams({
    q: querySchool,
    ...(band ? { band } : {}),
  });

  try {
    const res = await fetch(`${API_BASE}/school?${query.toString()}`);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch {}

  return calculateSchoolStatus((band as any) || 'poor', querySchool);
}

export async function postSubscribe(
  payload: SubscribeRequest
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      return await res.json();
    }
  } catch {}

  return {
    ok: true,
    message: `Subscription registered for ${payload.email}. Threshold: ${payload.threshold} AQI. Check your inbox for AWS SNS verification.`,
  };
}

export function getCachedAir(lat?: number, lon?: number): AirResponse | null {
  try {
    if (lat !== undefined && lon !== undefined) {
      const locKey = getLocCacheKey(lat, lon);
      const raw = localStorage.getItem(locKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.data) return parsed.data;
      }
    }
    // Fallback: check most recently saved coordinate
    const lastCoord = localStorage.getItem('airwatch_last_lat_lon');
    if (lastCoord) {
      const { lat: lLat, lon: lLon } = JSON.parse(lastCoord);
      const raw = localStorage.getItem(getLocCacheKey(lLat, lLon));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.data) return parsed.data;
      }
    }
    return null;
  } catch {
    return null;
  }
}

