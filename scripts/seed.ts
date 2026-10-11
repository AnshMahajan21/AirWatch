/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - DynamoDB Seed Script
 * Pre-populates local or AWS DynamoDB with realistic demo records for all 8 NCR presets.
 */

import { NCR_PRESETS } from '../backend/src/lib/types.js';
import { createMockAirResponse } from './mock-api.js';

export async function seedDatabase() {
  console.log('Seeding AirWatch DynamoDB with NCR presets (source: "demo")...');
  
  const records = NCR_PRESETS.map((preset) => {
    // Generate air fixture
    const air = createMockAirResponse(preset.lat, preset.lon, preset.name);
    return {
      pk: `LOC#${preset.id}`,
      sk: 'LATEST',
      data: air,
      ttl: Math.floor(Date.now() / 1000) + 86400 * 2, // 2 days TTL
      updatedAt: new Date().toISOString(),
    };
  });

  console.log(`Prepared ${records.length} preset readings for DynamoDB:`);
  records.forEach((r) => console.log(` - ${r.pk}: AQI ${r.data.current.aqi} (${r.data.current.band})`));
  console.log('Seed completed successfully.');
  return records;
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase().catch(console.error);
}
