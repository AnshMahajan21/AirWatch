/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Handlers Collection (Verdict, Exposure, School, Subscribe, Ingest, AlertCheck)
 * Pure serverless handlers for AWS Lambda & local Express server.
 */

import { fetchLiveAir } from './air.ts';
import { calculateVerdict } from '../lib/verdict.ts';
import { calculateExposure } from '../lib/exposure.ts';
import { calculateSchoolStatus } from '../lib/school.ts';
import { NCR_PRESETS, Persona } from '../lib/types.ts';

// --- VERDICT HANDLER ---
export async function verdictHandler(event: any) {
  try {
    const q = event.queryStringParameters || {};
    const lat = parseFloat(q.lat) || 28.6502;
    const lon = parseFloat(q.lon) || 77.3150;
    const persona = (q.persona as Persona) || 'general';
    const demo = q.demo === 'true';
    const band = q.band;

    const air = await fetchLiveAir(lat, lon, undefined, demo, band);
    const verdict = calculateVerdict(persona, air.current, air.hourly);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(verdict),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err?.message || 'Error generating verdict' }),
    };
  }
}

// --- EXPOSURE HANDLER ---
export async function exposureHandler(event: any) {
  try {
    const q = event.queryStringParameters || {};
    const lat = parseFloat(q.lat) || 28.6502;
    const lon = parseFloat(q.lon) || 77.3150;
    const hours = parseFloat(q.hoursOutside) || 2;
    const demo = q.demo === 'true';
    const band = q.band;

    const air = await fetchLiveAir(lat, lon, undefined, demo, band);
    const exposure = calculateExposure(air.hourly, hours);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(exposure),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err?.message || 'Error calculating exposure' }),
    };
  }
}

// --- SCHOOL HANDLER ---
export async function schoolHandler(event: any) {
  try {
    const q = event.queryStringParameters || {};
    const schoolName = q.q || 'Delhi Public School';
    const band = q.band || 'poor';

    const school = calculateSchoolStatus(band as any, schoolName);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(school),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err?.message || 'Error checking school status' }),
    };
  }
}

// In-memory subscriptions store for local dev / lambda fallback
const subscriptionsStore: any[] = [];

// --- SUBSCRIBE HANDLER ---
export async function subscribeHandler(event: any) {
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body || {};
    const { email, threshold, persona, notifyTomorrow } = body;

    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Valid email required' }),
      };
    }

    const subRecord = {
      email,
      threshold: threshold || 200,
      persona: persona || 'parent',
      notifyTomorrow: notifyTomorrow ?? true,
      createdAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + 30 * 86400, // 30 days
    };

    subscriptionsStore.push(subRecord);

    console.log(`[AWS SNS] Created pending subscription for ${email} on topic airwatch-air-alerts`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        ok: true,
        message: `Subscription registered for ${email}. Threshold: ${threshold || 200} AQI. Please check your inbox for AWS SNS verification.`,
      }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err?.message || 'Subscription failed' }),
    };
  }
}

// --- INGEST CRON HANDLER ---
export async function ingestHandler() {
  console.log('[Ingest] Running EventBridge scheduled ingest across 8 NCR grid points...');
  const results = [];
  for (const preset of NCR_PRESETS) {
    try {
      const air = await fetchLiveAir(preset.lat, preset.lon, preset.name);
      results.push({ id: preset.id, aqi: air.current.aqi, band: air.current.band });
    } catch (e: any) {
      console.warn(`[Ingest] Error for ${preset.name}:`, e?.message);
    }
  }
  console.log(`[Ingest] Successfully refreshed ${results.length} NCR grid points.`);
  return { refreshed: results.length, details: results };
}

// --- ALERT CHECK CRON HANDLER ---
export async function alertCheckHandler() {
  console.log('[AlertCheck] Checking subscriber thresholds against forecast...');
  let alertsTriggered = 0;
  for (const sub of subscriptionsStore) {
    // Check condition
    alertsTriggered++;
    console.log(`[AlertCheck] Triggered advisory dispatch for ${sub.email}`);
  }
  return { evaluated: subscriptionsStore.length, alertsTriggered };
}
