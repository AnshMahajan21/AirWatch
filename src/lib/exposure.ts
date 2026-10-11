/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Cumulative Exposure Engine
 * Calculates estimated daily inhaled particulate dose and budget % relative to CPCB 24-hr guideline.
 */

import { ExposureResponse, HourPoint } from '../types.ts';

// CPCB 24-hour PM2.5 national ambient standard: 60 µg/m³
// Daily baseline budget dose = 60 µg/m³ × 24h = 1,440 µg·h/m³
const DAILY_BUDGET_CAP = 1440;

export function calculateExposure(
  hourly: HourPoint[],
  hoursOutside: number
): ExposureResponse {
  const safeHours = Math.max(0, Math.min(24, hoursOutside));
  
  if (!hourly || hourly.length === 0) {
    return {
      pm25Dose: 0,
      budgetPct: 0,
      label: 'within',
      isEstimate: true,
    };
  }

  // Take average PM2.5 of the daylight/first N hours
  const samplePoints = hourly.slice(0, Math.max(1, Math.ceil(safeHours)));
  const sumPm25 = samplePoints.reduce((acc, curr) => acc + curr.pm25, 0);
  const avgPm25 = sumPm25 / samplePoints.length;

  const dose = Math.round(avgPm25 * safeHours);
  const budgetPct = Math.round((dose / DAILY_BUDGET_CAP) * 100);

  let label: 'within' | 'near' | 'over';
  if (budgetPct <= 75) {
    label = 'within';
  } else if (budgetPct <= 100) {
    label = 'near';
  } else {
    label = 'over';
  }

  return {
    pm25Dose: dose,
    budgetPct,
    label,
    isEstimate: true,
  };
}
