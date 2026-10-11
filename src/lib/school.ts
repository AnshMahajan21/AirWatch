/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - School Outdoor Safety Advisory Engine
 * Implements Delhi NCR Directorate of Education / GRAP aligned outdoor school advisories.
 */

import { Band, SchoolActivity, SchoolResponse } from '../types.ts';

export function calculateSchoolStatus(
  band: Band,
  schoolName: string = 'Delhi Public School, R.K. Puram'
): SchoolResponse {
  let status: 'green' | 'amber' | 'red';
  let summary = '';
  const activities: SchoolActivity[] = [
    { name: 'Morning Assembly', ok: false },
    { name: 'Physical Education (PE)', ok: false },
    { name: 'Outdoor Sports', ok: false },
    { name: 'Outdoor Recess', ok: false },
  ];

  switch (band) {
    case 'good':
    case 'satisfactory':
      status = 'green';
      activities.forEach((act) => (act.ok = true));
      summary = 'Clear outdoor day. All assemblies, outdoor sports, and outdoor recess are permitted.';
      break;

    case 'moderate':
      status = 'amber';
      activities[0].ok = true; // Morning Assembly ok
      activities[1].ok = true; // PE ok (light exertion)
      activities[2].ok = false; // Outdoor sports suspended
      activities[3].ok = true; // Recess ok
      summary = 'Mild haze. Strenuous outdoor sports suspended; quiet outdoor recess and morning assembly allowed.';
      break;

    case 'poor':
      status = 'amber';
      activities[0].ok = false; // Morning Assembly moved indoors
      activities[1].ok = false; // PE moved indoors
      activities[2].ok = false;
      activities[3].ok = true; // Short recess
      summary = 'Poor air. Outdoor assembly and physical education moved indoors. Limit recess to 15 minutes.';
      break;

    case 'very_poor':
    case 'severe':
    default:
      status = 'red';
      activities.forEach((act) => (act.ok = false));
      summary = 'High pollution alert. All outdoor student activities suspended. Keep windows closed and air filtration active.';
      break;
  }

  return {
    schoolName: schoolName.trim() || 'NCR Campus Advisory',
    status,
    activities,
    summary,
  };
}
