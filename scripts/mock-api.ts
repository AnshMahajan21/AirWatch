/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Local Mock API Server
 * Provides deterministic fixtures for AirResponse, VerdictResponse, Exposure, and School
 * for local development and offline preview.
 */

import express, { Request, Response } from 'express';
import { AirResponse, ExposureResponse, HourPoint, NCR_PRESETS, Persona, SchoolResponse, VerdictResponse } from '../backend/src/lib/types.ts';
import { aqiToBand, pm25ToAqi } from '../backend/src/lib/aqi.ts';
import { calculateVerdict } from '../backend/src/lib/verdict.ts';
import { calculateExposure } from '../backend/src/lib/exposure.ts';
import { calculateSchoolStatus } from '../backend/src/lib/school.ts';
import { generateMockHourly, createMockAirResponse } from '../backend/src/lib/fixtures.ts';

export { generateMockHourly, createMockAirResponse };

export function setupMockRoutes(app: express.Express) {
  // GET /air
  app.get('/air', (req: Request, res: Response) => {
    const lat = parseFloat(req.query.lat as string) || 28.6502;
    const lon = parseFloat(req.query.lon as string) || 77.3150;
    const name = (req.query.name as string) || 'Anand Vihar, Delhi';
    const band = req.query.band as string;

    const data = createMockAirResponse(lat, lon, name, band);
    res.json(data);
  });

  // GET /verdict
  app.get('/verdict', (req: Request, res: Response) => {
    const lat = parseFloat(req.query.lat as string) || 28.6502;
    const lon = parseFloat(req.query.lon as string) || 77.3150;
    const persona = (req.query.persona as Persona) || 'parent';
    const band = req.query.band as string;

    const air = createMockAirResponse(lat, lon, undefined, band);
    const verdict = calculateVerdict(persona, air.current, air.hourly);
    res.json(verdict);
  });

  // GET /exposure
  app.get('/exposure', (req: Request, res: Response) => {
    const lat = parseFloat(req.query.lat as string) || 28.6502;
    const lon = parseFloat(req.query.lon as string) || 77.3150;
    const hoursOutside = parseFloat(req.query.hoursOutside as string) || 2;
    const band = req.query.band as string;

    const air = createMockAirResponse(lat, lon, undefined, band);
    const exposure = calculateExposure(air.hourly, hoursOutside);
    res.json(exposure);
  });

  // GET /school
  app.get('/school', (req: Request, res: Response) => {
    const q = (req.query.q as string) || 'Delhi Public School';
    const band = (req.query.band as any) || 'poor';
    const school = calculateSchoolStatus(band, q);
    res.json(school);
  });

  // POST /subscribe
  app.post('/subscribe', (req: Request, res: Response) => {
    const { email, threshold, persona } = req.body || {};
    res.json({
      ok: true,
      message: `Subscription registered for ${email || 'user'}. Threshold: ${threshold || 200} AQI. Please check your inbox for AWS SNS verification.`,
    });
  });
}

// Standalone runner if executed directly
if (process.argv[1]?.endsWith('mock-api.ts') || process.argv[1]?.endsWith('mock-api.js')) {
  const app = express();
  app.use(express.json());
  setupMockRoutes(app);
  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`AirWatch Mock API listening on http://localhost:${PORT}`);
  });
}
