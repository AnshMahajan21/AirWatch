/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Single Source of Truth Types
 * Unified types for Atmospheric Air Decision Engine with CPCB IND-AQI standards.
 */

export type Persona = 'general' | 'school' | 'medical';

export type Band = 'good' | 'satisfactory' | 'moderate' | 'poor' | 'very_poor' | 'severe';

export type Action = 'go' | 'go_with_mask' | 'stay_indoors';

export type PollutantKey = 'pm25' | 'pm10' | 'no2' | 'o3' | 'co' | 'so2' | 'nh3';

export interface PollutantReading {
  key: PollutantKey;
  name: string;
  value: number; // raw concentration
  unit: string;  // 'µg/m³' or 'mg/m³'
  subIndex: number;
  band: Band;
  isRollingAvg: boolean; // whether rolling average threshold was satisfied
  windowHours: number;   // 24 for PM2.5/PM10/NO2/SO2/NH3, 8 for CO/O3
}

export interface HourPoint {
  iso: string;
  pm25: number;
  pm10: number;
  aqi: number;
  band: Band;
  pollutants?: Record<PollutantKey, PollutantReading>;
  dominantPollutant?: PollutantKey;
  isInsufficient?: boolean;
  averagingNote?: string;
  healthStatement?: string;
}

export interface DailyPoint {
  date: string;
  aqi: number;
  band: Band;
}

export interface AirLocation {
  name: string;
  lat: number;
  lon: number;
}

export interface StationInfo {
  name: string;
  distanceKm: number;
  source?: 'AQICN' | 'CPCB' | 'Diurnal Baseline' | string;
  tier?: 1 | 2 | 3 | 4;
}

export interface AirResponse {
  location: AirLocation;
  station: StationInfo | null;
  current: HourPoint;
  hourly: HourPoint[];
  daily: DailyPoint[];
  updatedAt: string;
  source: 'live' | 'cache' | 'demo';
  tier?: 1 | 2 | 3 | 4;
  dominantPollutant?: PollutantKey;
  isInsufficient?: boolean;
  averagingNote?: string;
  healthStatement?: string;
  pollutants?: Record<PollutantKey, PollutantReading>;
}

export interface BestWindow {
  startIso: string;
  endIso: string;
  avgPm25: number;
}

export interface PeakHazardWindow {
  startIso: string;
  endIso: string;
  avgPm25: number;
}

export interface VerdictResponse {
  action: Action;
  headline: string;
  reasons: string[];
  bestWindow: BestWindow | null;
  peakWindow?: PeakHazardWindow | null;
  avoidHours: string[];
  persona: Persona;
}

export interface ExposureResponse {
  pm25Dose: number;
  budgetPct: number;
  label: 'within' | 'near' | 'over';
  isEstimate: true;
}

export interface SchoolActivity {
  name: string;
  ok: boolean;
}

export interface SchoolResponse {
  schoolName: string;
  status: 'green' | 'amber' | 'red';
  activities: SchoolActivity[];
  summary: string;
}

export interface SubscribeRequest {
  email: string;
  lat: number;
  lon: number;
  threshold: number;
  persona: Persona;
  notifyTomorrow: boolean;
}

export interface PresetLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  state: string;
}

export const NCR_PRESETS: PresetLocation[] = [
  { id: 'anand-vihar', name: 'Anand Vihar', lat: 28.6502, lon: 77.3150, state: 'East Delhi' },
  { id: 'ghaziabad', name: 'Ghaziabad', lat: 28.6692, lon: 77.4538, state: 'Uttar Pradesh' },
  { id: 'noida', name: 'Noida', lat: 28.5355, lon: 77.3910, state: 'Uttar Pradesh' },
  { id: 'ito', name: 'ITO', lat: 28.6304, lon: 77.2435, state: 'Central Delhi' },
  { id: 'dwarka', name: 'Dwarka', lat: 28.5921, lon: 77.0460, state: 'South West Delhi' },
  { id: 'gurugram', name: 'Gurugram', lat: 28.4595, lon: 77.0266, state: 'Haryana' },
  { id: 'rohini', name: 'Rohini', lat: 28.7495, lon: 77.0736, state: 'North West Delhi' },
  { id: 'faridabad', name: 'Faridabad', lat: 28.4089, lon: 77.3178, state: 'Haryana' },
];

export interface BreakpointRange {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
  band: Band;
}

export interface PollutantMeta {
  key: PollutantKey;
  label: string;
  unit: string;
  windowHours: number;
  minReadings: number;
  breakpoints: BreakpointRange[];
}
