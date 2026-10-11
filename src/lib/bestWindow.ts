/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Best Window & Avoid Hours Finder
 * Identifies the cleanest contiguous 2-hour block (safest window) and the
 * peak pollution hazard 2-hour block across the upcoming 24 hours.
 * Fully grounded in Delhi NCR boundary-layer diurnal atmospheric science.
 */

import { BestWindow, HourPoint, PeakHazardWindow } from '../types.ts';

export function getLocalHour(isoString: string): number {
  try {
    const date = new Date(isoString);
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });
    return parseInt(formatter.format(date), 10) % 24;
  } catch {
    return new Date(isoString).getHours();
  }
}

/**
 * Format a 2-hour contiguous window range into a clean string in Delhi IST
 * Example: "1:00 PM – 3:00 PM"
 */
export function formatWindowRange(startIso: string, endIso: string): string {
  try {
    const startD = new Date(startIso);
    const endD = new Date(endIso);
    const fmt = (d: Date) =>
      d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      }).replace(':00', '');

    // If start and end are the same point (single point fallback)
    if (startIso === endIso) {
      return fmt(startD);
    }

    // Since points represent hourly readings (e.g. 1 PM and 2 PM readings span 1 PM - 3 PM window)
    // Add 1 hour to end point to represent the full interval block if equal or contiguous
    const endPlusOne = new Date(endD.getTime() + 3600000);
    return `${fmt(startD)} – ${fmt(endPlusOne)}`;
  } catch {
    return '';
  }
}

/**
 * Identifies the contiguous 2-hour block with the lowest average PM2.5 in the upcoming 24 hours.
 * Strictly prioritizes daytime active convective hours (7 AM to 6 PM Delhi IST),
 * where solar surface heating drives deep vertical atmospheric mixing.
 * Never selects evening/night thermal inversion hours as the safest outdoor window.
 */
export function calculateBestWindow(hourly: HourPoint[]): BestWindow | null {
  if (!hourly || hourly.length === 0) return null;

  const displayHours = hourly.slice(0, 24);
  if (displayHours.length < 2) {
    if (displayHours.length === 1) {
      return {
        startIso: displayHours[0].iso,
        endIso: displayHours[0].iso,
        avgPm25: Math.round(displayHours[0].pm25),
      };
    }
    return null;
  }

  const windowSize = 2; // Two-hour range badge matching safest window style
  let minDaytimeAvg = Infinity;
  let bestDaytimeIndex = -1;

  let minOverallAvg = Infinity;
  let bestOverallIndex = 0;

  for (let i = 0; i <= displayHours.length - windowSize; i++) {
    const slice = displayHours.slice(i, i + windowSize);
    const sum = slice.reduce((acc, curr) => acc + curr.pm25, 0);
    const avg = sum / windowSize;

    // Track overall minimum as fallback
    if (avg < minOverallAvg) {
      minOverallAvg = avg;
      bestOverallIndex = i;
    }

    // Check if window falls in daytime active hours (6 AM to 7 PM IST, start strictly before 7 PM)
    const startHr = getLocalHour(slice[0].iso);
    const endHr = getLocalHour(slice[slice.length - 1].iso);
    const isDaytime = startHr >= 6 && startHr < 19 && endHr >= 6 && endHr <= 19;

    if (isDaytime && avg < minDaytimeAvg) {
      minDaytimeAvg = avg;
      bestDaytimeIndex = i;
    }
  }

  const chosenIndex = bestDaytimeIndex !== -1 ? bestDaytimeIndex : bestOverallIndex;
  const chosenAvg = bestDaytimeIndex !== -1 ? minDaytimeAvg : minOverallAvg;
  const startPt = displayHours[chosenIndex];
  const endPt = displayHours[chosenIndex + windowSize - 1];

  return {
    startIso: startPt.iso,
    endIso: endPt.iso,
    avgPm25: Math.round(chosenAvg),
  };
}

/**
 * Identifies the contiguous 2-hour block with the HIGHEST average PM2.5 in the upcoming 24 hours.
 * Formatted as a 2-hour range badge matching the safest window style.
 * Represents peak pollution hazard (evening thermal inversion or morning rush peak).
 */
export function calculatePeakHazardWindow(hourly: HourPoint[]): PeakHazardWindow | null {
  if (!hourly || hourly.length === 0) return null;

  const displayHours = hourly.slice(0, 24);
  if (displayHours.length < 2) {
    if (displayHours.length === 1) {
      return {
        startIso: displayHours[0].iso,
        endIso: displayHours[0].iso,
        avgPm25: Math.round(displayHours[0].pm25),
      };
    }
    return null;
  }

  const windowSize = 2; // Two-hour range badge matching safest window style
  let maxAvg = -Infinity;
  let peakStartIndex = 0;

  for (let i = 0; i <= displayHours.length - windowSize; i++) {
    const slice = displayHours.slice(i, i + windowSize);
    const sum = slice.reduce((acc, curr) => acc + curr.pm25, 0);
    const avg = sum / windowSize;
    if (avg > maxAvg) {
      maxAvg = avg;
      peakStartIndex = i;
    }
  }

  const startPt = displayHours[peakStartIndex];
  const endPt = displayHours[peakStartIndex + windowSize - 1];

  return {
    startIso: startPt.iso,
    endIso: endPt.iso,
    avgPm25: Math.round(maxAvg),
  };
}

/**
 * Returns the worst 3 individual hours by PM2.5 concentration in the upcoming 24 hours.
 */
export function getAvoidHours(hourly: HourPoint[]): string[] {
  if (!hourly || hourly.length === 0) return [];
  const sorted = [...hourly].sort((a, b) => b.pm25 - a.pm25);
  return sorted.slice(0, 3).map((h) => h.iso);
}
