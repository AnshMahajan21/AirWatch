/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Recommendation & Verdict Decision Engine
 * Tailored, actionable guidance for three distinct personas:
 * 1. General (Default public, commuters, outdoor workout, window ventilation)
 * 2. School & Institute (Children, morning assemblies, PE, outdoor sports, recess)
 * 3. Medical Profile (Asthma, respiratory, cardiovascular, elderly, pregnant)
 * English only.
 */

import { Action, HourPoint, Persona, VerdictResponse } from '../types.ts';
import { calculateBestWindow, calculatePeakHazardWindow, formatWindowRange, getAvoidHours } from './bestWindow.ts';

export function calculateVerdict(
  persona: Persona,
  current: HourPoint,
  hourly: HourPoint[]
): VerdictResponse {
  const band = current.band;
  let action: Action;
  let headline = '';
  const reasons: string[] = [];

  const bestWin = calculateBestWindow(hourly);
  const peakWin = calculatePeakHazardWindow(hourly);
  const avoid = getAvoidHours(hourly);
  const windowTimeStr = bestWin ? formatWindowRange(bestWin.startIso, bestWin.endIso) : '1:00 PM – 3:00 PM';
  const peakTimeStr = peakWin ? formatWindowRange(peakWin.startIso, peakWin.endIso) : '7:00 PM – 9:00 PM';

  if (persona === 'general') {
    // --- 1. GENERAL PROFILE (DEFAULT / NORMAL ACCESS) ---
    switch (band) {
      case 'good':
        action = 'go';
        headline = 'Clear, fresh air across the city.';
        reasons.push('Ideal conditions for outdoor running, cycling, and routine daily commutes.');
        reasons.push('Open home and office windows for natural clean air circulation.');
        reasons.push('No protective masks or indoor air filtration required.');
        break;

      case 'satisfactory':
        action = 'go';
        headline = 'Acceptable conditions for daily movement.';
        reasons.push('Safe for standard commutes, shopping, errands, and fitness routines.');
        reasons.push('Ambient particulate levels are within healthy tolerances for adults.');
        if (bestWin) {
          reasons.push(`Best window for outdoor exercise is around ${windowTimeStr}.`);
        }
        break;

      case 'moderate':
        action = 'go_with_mask';
        headline = 'Noticeable haze: moderate particulate load.';
        reasons.push('Cap intense outdoor cardio; sensitive individuals should wear an N95 mask.');
        reasons.push('Keep vehicle windows rolled up during high-traffic rush hours.');
        reasons.push(`Cleanest daytime outdoor window is ${windowTimeStr}.`);
        break;

      case 'poor':
        action = 'go_with_mask';
        headline = 'Elevated smog layer: wear an N95 mask outside.';
        reasons.push('Wear a fitted N95 respirator if commuting on two-wheelers or walking outdoors.');
        reasons.push('Postpone outdoor jogging; shift aerobic cardio to an indoor gym.');
        reasons.push(`Avoid peak inversion hours (${peakTimeStr}) when pollution concentrates at ground level.`);
        break;

      case 'very_poor':
        action = 'stay_indoors';
        headline = 'High pollution: stay indoors and minimize transit.';
        reasons.push('Strict N95 respirator mandatory for any unavoidable outdoor trip.');
        reasons.push(`Remain indoors in filtered air; avoid exposure during peak hazard (${peakTimeStr}).`);
        reasons.push('Run indoor HEPA air purifiers; keep doors and windows sealed.');
        break;

      case 'severe':
      default:
        action = 'stay_indoors';
        headline = 'Severe smog emergency: stay indoors today.';
        reasons.push('Remain inside sealed indoor spaces with doors and windows shut.');
        reasons.push('Avoid all outdoor physical exertion or unnecessary travel.');
        reasons.push('Operate air filtration on high; use recirculated AC mode only.');
        break;
    }
  } else if (persona === 'school') {
    // --- 2. PARENT, SCHOOL & INSTITUTE PROFILE ---
    switch (band) {
      case 'good':
      case 'satisfactory':
        action = 'go';
        headline = 'Outdoor campus activities cleared.';
        reasons.push('Safe for morning school assemblies, PE classes, and outdoor sports.');
        reasons.push('Children can play freely outdoors without respiratory restrictions.');
        reasons.push('Classroom windows can be opened for fresh ambient ventilation.');
        break;

      case 'moderate':
        action = 'go_with_mask';
        headline = 'Mild particulate haze on campus.';
        reasons.push('Morning assembly and short outdoor recess are permitted.');
        reasons.push('Suspend strenuous long-distance track events and intense competitive sports.');
        reasons.push('Ensure students stay hydrated; provide indoor options for sensitive kids.');
        break;

      case 'poor':
        action = 'stay_indoors';
        headline = 'Poor air: move assemblies and PE indoors.';
        reasons.push('Shift morning school assembly and physical education classes indoors.');
        reasons.push('Outdoor sports matches should be postponed or relocated to indoor courts.');
        reasons.push('Keep students in air-filtered indoor classrooms.');
        break;

      case 'very_poor':
        action = 'stay_indoors';
        headline = 'High smog alert: suspend outdoor school activities.';
        reasons.push('All outdoor sports, assemblies, and playground recess must be cancelled.');
        reasons.push('Keep all classroom windows closed and run HEPA air cleaners.');
        reasons.push('Advise parents to equip children with well-fitted pediatric N95 masks.');
        break;

      case 'severe':
      default:
        action = 'stay_indoors';
        headline = 'Emergency smog: keep students strictly indoors.';
        reasons.push('Strict halt on all outdoor student movement under GRAP directives.');
        reasons.push('Shift to online/hybrid classes as per Directorate of Education guidelines.');
        reasons.push('Keep vulnerable students with asthma in air-purified sick bays.');
        break;
    }
  } else {
    // --- 3. MEDICAL PROFILE (VULNERABLE HEALTH, ASTHMA, CARDIAC) ---
    switch (band) {
      case 'good':
        action = 'go';
        headline = 'Clean, safe air for sensitive lungs.';
        reasons.push('Low respiratory irritation risk for asthma or cardiac conditions.');
        reasons.push('Safe for gentle outdoor walks and daily therapeutic movement.');
        reasons.push('Keep preventative inhalers on hand as part of standard care.');
        break;

      case 'satisfactory':
        action = 'go';
        headline = 'Acceptable for sensitive health, monitor airway.';
        reasons.push('Safe for gentle strolls, but avoid rapid walking along dusty construction corridors.');
        reasons.push('Carry your rescue bronchodilator / inhaler during all outings.');
        if (bestWin) {
          reasons.push(`Safest low-particulate window of the day is ${windowTimeStr}.`);
        }
        break;

      case 'moderate':
        action = 'stay_indoors';
        headline = 'Particulate haze: elevated bronchospasm risk.';
        reasons.push('Stay inside air-purified rooms; carry quick-relief inhaler if stepping out.');
        reasons.push(`Avoid peak hazard hours (${peakTimeStr}) when pollution is trapped near the ground.`);
        reasons.push('Wear a sealed particulate mask if stepping out near busy roads.');
        break;

      case 'poor':
        action = 'stay_indoors';
        headline = 'Unhealthy air: high asthma & cardiac alert.';
        reasons.push('High risk of coughing, wheezing, and cardiovascular strain.');
        reasons.push('Stay inside air-purified rooms; keep all windows closed.');
        reasons.push('If stepping out is unavoidable, wear an airtight N95/FFP2 mask.');
        break;

      case 'very_poor':
        action = 'stay_indoors';
        headline = 'Severe medical hazard: remain in filtered air.';
        reasons.push('Do not go outside. Fine particles penetrate deep into alveolar spaces.');
        reasons.push('Monitor peak expiratory flow or pulse oximetry if prescribed.');
        reasons.push('Keep emergency medications, spacer, and nebulizer within reach.');
        break;

      case 'severe':
      default:
        action = 'stay_indoors';
        headline = 'Critical pollution emergency for vulnerable health.';
        reasons.push('Remain strictly in a sealed, air-purified room with HEPA filtration.');
        reasons.push('Avoid all exertion. Keep emergency physician contact on speed dial.');
        reasons.push('Eliminate any indoor smoke sources (agarbatti, unvented cooking).');
        break;
    }
  }

  return {
    action,
    headline,
    reasons,
    bestWindow: bestWin,
    peakWindow: peakWin,
    avoidHours: avoid,
    persona,
  };
}
