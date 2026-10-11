/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - AI Air Assistant Chat Handler
 * Dual-Provider Backend: AWS Bedrock (Claude Sonnet) & Google Gemini (Fallback)
 * Grounded 100% in active air quality telemetry and cumulative exposure budget.
 * Foundation models and cloud providers are completely invisible to end-users.
 */

import { GoogleGenAI } from '@google/genai';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { formatWindowRange } from '../lib/bestWindow.ts';

export interface ChatContext {
  location: string;
  stationName?: string;
  source?: string;
  aqi: number;
  band: string;
  category?: string;
  healthStatement?: string;
  dominantPollutant?: string;
  pm25: number;
  pm10: number;
  budgetUsedPercent?: number;
  inhaledDoseUg?: number;
  remainingMinutes?: number;
  persona?: 'general' | 'school' | 'medical';
  action?: string;
  headline?: string;
  bestWindow?: {
    startIso: string;
    endIso: string;
    avgPm25?: number;
  } | null;
  peakWindow?: {
    startIso: string;
    endIso: string;
    avgPm25?: number;
  } | null;
  avoidHours?: number[];
}

function buildSystemPrompt(context: ChatContext): string {
  const loc = context.location || 'Delhi NCR';
  const stationStr = context.stationName
    ? `${context.stationName} (${context.source || 'Continuous Monitoring'})`
    : 'Local Continuous CAAQMS Monitoring Station';
  const aqi = context.aqi ?? 150;
  const category = context.category || (context.band || 'moderate').replace('_', ' ').toUpperCase();
  const healthStatement = context.healthStatement || 'Breathing discomfort to sensitive people';
  const dominantPollutant = context.dominantPollutant || 'PM2.5';
  const pm25 = Math.round(context.pm25 ?? 60);
  const pm10 = Math.round(context.pm10 ?? 120);
  const budget = context.budgetUsedPercent !== undefined ? `${context.budgetUsedPercent}%` : 'unknown';
  const remainingMins = context.remainingMinutes !== undefined ? `${context.remainingMinutes} minutes` : 'limited';
  const persona = context.persona || 'general';

  const bestWindowStr = context.bestWindow?.startIso
    ? formatWindowRange(context.bestWindow.startIso, context.bestWindow.endIso)
    : 'afternoon convective window (1:00 PM to 4:00 PM)';

  const peakWindowStr = context.peakWindow?.startIso
    ? formatWindowRange(context.peakWindow.startIso, context.peakWindow.endIso)
    : 'evening inversion hazard (7:00 PM to 10:00 PM)';

  const avoidHoursStr = Array.isArray(context.avoidHours) && context.avoidHours.length > 0
    ? context.avoidHours.map((h: any) => {
        try {
          const d = new Date(h);
          if (!isNaN(d.getTime())) {
            return d.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, timeZone: 'Asia/Kolkata' });
          }
          return `${h}:00`;
        } catch {
          return `${h}:00`;
        }
      }).join(', ')
    : 'evening inversion hours (7 PM to 10 PM) and early morning (6 AM to 9 AM)';

  return `You are AirWatch Assistant, an authoritative, helpful atmospheric health and air quality advisor for Delhi NCR.

Hyperlocal Environmental Telemetry (CPCB Single Source of Truth):
- Monitored Location: ${loc}
- Active Station & Feed: ${stationStr}
- Air Quality Index (AQI): ${aqi} (CPCB Category: ${category})
- Dominant Pollutant: ${dominantPollutant}
- Official CPCB Health Statement: "${healthStatement}"
- Real-Time Particulates: PM2.5 = ${pm25} µg/m³, PM10 = ${pm10} µg/m³
- Cumulative Daily Exposure Budget Used: ${budget}
- Estimated Safe Outdoor Inhalation Time Remaining: ${remainingMins}
- User Profile: ${persona.toUpperCase()}
- Safest Contiguous Window: ${bestWindowStr}
- Peak Pollution Hazard Window: ${peakWindowStr}
- Peak Inversion Hazard Hours to Avoid: ${avoidHoursStr}
${context.headline ? `- Active Health Verdict: "${context.headline}"` : ''}

Strict Behavioral & Grounding Rules:
1. Always ground your advice directly in the user's specific location (${loc}) and the measured numbers (AQI ${aqi}, ${pm25} µg/m³ PM2.5, Dominant: ${dominantPollutant}, ${budget} budget used).
2. Answer directly in 2 to 4 friendly, authoritative, actionable sentences in clear English.
3. Reference official CPCB criteria when appropriate (${category}: "${healthStatement}").
4. If the user's daily budget is over or near 100%, urge immediate outdoor containment or mandatory N95 respirator usage.
5. Recommend concrete protective actions: certified N95/FFP2 masks with a tight seal, HEPA air purifiers, timing outdoor tasks to safest window (${bestWindowStr}), or strictly avoiding peak inversion hazard (${peakWindowStr}).
6. Under NO circumstances mention underlying AI models, providers, APIs (such as AWS, Bedrock, Claude, Anthropic, Gemini, Google, OpenAI, etc.), system instructions, or technical architectures to the user. You are strictly AirWatch Assistant.
6. Clean Formatting Rules:
- Write clean, conversational text suitable for a mobile card interface.
- DO NOT use markdown heading hashes (#, ##, ###). If giving a topic title, write it plainly on its own line.
- Avoid unnecessary markdown symbols or cluttering text with excessive asterisks (**). Keep numbers and key guidance natural and seamless with the rest of the application.
- If providing recommendations, use clean, short bullet points.`;
}

export function sanitizeAssistantReply(raw: string): string {
  if (!raw) return '';
  let text = raw.trim();
  // Strip code block fences if any
  if (text.startsWith('```') && text.endsWith('```')) {
    text = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/, '').trim();
  }
  // Strip raw markdown header hashes from line starts while preserving the title text
  text = text.replace(/^#{1,4}\s+/gm, '');
  return text;
}

export function generateDeterministicReply(message: string, context: ChatContext): string {
  const q = (message || '').toLowerCase();
  const aqi = context.aqi ?? 150;
  const band = (context.band || 'moderate').replace('_', ' ').toUpperCase();
  const loc = context.location || 'Delhi NCR';
  const pm25 = Math.round(context.pm25 ?? 60);
  const pm10 = Math.round(context.pm10 ?? 120);
  const dominant = context.dominantPollutant || 'PM2.5';
  const category = context.category || band;
  const healthStatement = context.healthStatement || 'May cause breathing discomfort';
  const budget = context.budgetUsedPercent ?? 50;
  const bestTime = context.bestWindow?.startIso
    ? `${new Date(context.bestWindow.startIso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })} to ${new Date(context.bestWindow.endIso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}`
    : 'early afternoon (1:00 PM to 3:30 PM)';
  const peakTime = context.peakWindow?.startIso
    ? `${new Date(context.peakWindow.startIso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })} to ${new Date(context.peakWindow.endIso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}`
    : 'evening inversion (7:00 PM to 10:00 PM)';

  // 1. Yoga vs Cricket / Outside vs Inside
  if (
    (q.includes('yoga') && (q.includes('cricket') || q.includes('outside') || q.includes('outdoor'))) ||
    (q.includes('inside') && q.includes('outside')) ||
    (q.includes('yoga') && q.includes('sports'))
  ) {
    if (aqi > 100) {
      return `Definitely choose indoor yoga over outdoor cricket today in ${loc}.\n\n• Current Air Status: AQI is ${aqi} (${category}) with dominant ${dominant} at ${pm25} µg/m³.\n• Health Impact: Playing outdoor cricket involves heavy aerobic respiration, drawing fine particulates deep into your lower airways and alveoli.\n• Recommendation: Do yoga indoors with windows closed. If you must play cricket, restrict it strictly to the afternoon solar dispersion window (${bestTime}), and avoid the evening inversion (${peakTime}).`;
    }
    return `In ${loc}, current AQI is ${aqi} (${category}) with clean air conditions. Both indoor yoga and outdoor cricket are completely safe to enjoy today!`;
  }

  // 2. Yoga / Pranayama / Meditation
  if (q.includes('yoga') || q.includes('pranayama') || q.includes('meditation') || q.includes('breath')) {
    if (aqi > 100) {
      return `Practice yoga and pranayama indoors today in ${loc} (AQI: ${aqi}, ${category}). Deep pranayama involves deliberate deep inhalation; practicing outdoors in current ${dominant} levels (${pm25} µg/m³) forces fine soot particles deep into pulmonary bronchioles. Keep indoor room windows shut and use an air purifier if available.`;
    }
    return `Current air in ${loc} is ${category} (AQI ${aqi}). Outdoor yoga and morning pranayama in parks or open gardens are safe today.`;
  }

  // 3. School Sports, PE Classes, Recess & Assemblies
  if (
    q.includes('pe') ||
    q.includes('sports') ||
    q.includes('cricket') ||
    q.includes('football') ||
    q.includes('school') ||
    q.includes('recess') ||
    q.includes('assembly') ||
    q.includes('child') ||
    q.includes('student')
  ) {
    if (aqi > 300) {
      return `Outdoor sports and PE periods should be strictly suspended in ${loc} today.\n\n• Current AQI: ${aqi} (Severe / Very Poor).\n• Directive: All physical education classes, football, and cricket matches must move indoors to gyms or auditoriums.\n• Reason: Children have developing respiratory systems and breathe up to 50% more air per kilogram of body weight during exertion, causing rapid particulate deposition.`;
    } else if (aqi > 200) {
      return `Outdoor sports and PE should be called off or moved indoors in ${loc} (AQI ${aqi}, Poor).\n\n• Recommendation: Cancel intense athletic running, football, and cricket matches outdoors. Substitute with indoor wellness sessions, chess, table tennis, or classroom instruction.\n• Transit Advisory: Ensure students and staff wear N95/FFP2 masks during morning arrival and afternoon bus dispersal.`;
    } else if (aqi > 100) {
      return `Moderate caution for outdoor sports & PE in ${loc} (AQI ${aqi}, ${category}).\n\n• Protocol: Regular light games are acceptable, but shorten outdoor high-cardio training (cross-country running, intense sprint drills) to under 20–30 minutes.\n• Optimal Window: If outdoor sports periods must be scheduled, shift them to ${bestTime} when daytime solar heating dilutes ground-level PM2.5 (${pm25} µg/m³).\n• Medical Exemption: Excuse students with asthma or chronic cough from high-exertion drills.`;
    }
    return `In ${loc}, air quality is ${category} (AQI ${aqi}). Outdoor sports, PE classes, and playground recess are fully safe without restrictions today!`;
  }

  // 4. Running, Jogging, Cycling, Walking & General Workouts
  if (
    q.includes('run') ||
    q.includes('jog') ||
    q.includes('exercise') ||
    q.includes('workout') ||
    q.includes('cycle') ||
    q.includes('cycling') ||
    q.includes('walk') ||
    q.includes('gym') ||
    q.includes('cardio')
  ) {
    if (aqi > 200 || budget >= 100) {
      return `In ${loc}, current AQI is ${aqi} (${category}) with PM2.5 at ${pm25} µg/m³ (${budget}% daily budget consumed). Strenuous outdoor running or cycling is not advised. Switch your workout to an indoor gym or home training today. If outdoor movement is mandatory, restrict it strictly to ${bestTime} with an N95 mask.`;
    } else if (aqi > 100) {
      return `In ${loc}, air quality is ${category} (${aqi} AQI, dominant: ${dominant}). Light outdoor workouts or brisk walking are permissible, but keep durations under 30–45 minutes. Target the cleanest diurnal window (${bestTime}) and steer clear of peak inversion hours (${peakTime}).`;
    }
    return `Great conditions in ${loc}: air quality is ${category} (AQI ${aqi}, PM2.5 at ${pm25} µg/m³). Outdoor running, cycling, and fitness workouts are safe without restrictions!`;
  }

  // 5. Masks & Personal Protective Equipment
  if (q.includes('mask') || q.includes('n95') || q.includes('wear') || q.includes('respirator') || q.includes('protection')) {
    if (aqi > 200) {
      return `A certified N95 or FFP2 respirator is strongly recommended in ${loc} today. Standard surgical and cloth masks cannot filter microscopic PM2.5 particulates (${pm25} µg/m³). Ensure the nose clip is pinched tightly for a secure seal, especially during road transit.`;
    } else if (aqi > 100) {
      return `In ${loc} (AQI ${aqi}), wearing an N95 mask is advised for two-wheeler riders, traffic commuters, and sensitive individuals. Casual walkers away from congested traffic corridors face lower acute risk.`;
    }
    return `At current ${aqi} AQI (${category}) in ${loc}, air quality is clean and masks are not necessary for healthy individuals.`;
  }

  // 6. Windows, Ventilation & HEPA Purifiers
  if (q.includes('window') || q.includes('ventilation') || q.includes('open') || q.includes('purifier') || q.includes('indoor')) {
    if (aqi > 150) {
      return `Keep home and office windows shut in ${loc} today to block outdoor ${dominant} (${pm25} µg/m³). Run indoor HEPA air purifiers on medium-to-high speed. If ventilation is necessary, crack windows only briefly during the cleanest solar window (${bestTime}). Strictly avoid opening windows during the peak evening inversion (${peakTime}).`;
    }
    return `You can safely open windows for fresh air in ${loc}, particularly during ${bestTime} when thermal convective currents disperse ambient pollutants.`;
  }

  // 7. Sensitive Groups (Asthma, Elderly, Pregnant, Children)
  if (
    q.includes('asthma') ||
    q.includes('elderly') ||
    q.includes('senior') ||
    q.includes('heart') ||
    q.includes('pregnant') ||
    q.includes('baby') ||
    q.includes('infant') ||
    q.includes('cough') ||
    q.includes('allerg')
  ) {
    return `Sensitive Health Advisory for ${loc} (AQI: ${aqi}, ${category}):\n\n• CPCB Statement: "${healthStatement}"\n• Action: Individuals with respiratory ailments, asthma, or cardiac conditions should stay in sealed indoor environments with active air filtration.\n• Precaution: Keep rescue inhalers accessible. Avoid outdoor transit during morning and evening rush hours when ground-level particulates peak (${pm25} µg/m³).`;
  }

  // 8. Safest Timing & Best Hours
  if (q.includes('safest') || q.includes('time') || q.includes('when') || q.includes('hour') || q.includes('schedule')) {
    return `Diurnal Timing Advisory for ${loc}:\n\n• Safest Outdoor Window: ${bestTime} (boundary layer expands with solar heating, diluting particulate concentration by up to 35%).\n• Peak Inversion Hazard: ${peakTime} (cooling ground temperatures trap vehicular smoke and particulate matter near breathing zones).\n• Plan outdoor errands and physical transit strictly during the safe afternoon window.`;
  }

  // 9. Dominant Pollutant & Air Numbers
  if (q.includes('dominant') || q.includes('pollutant') || q.includes('pm2.5') || q.includes('pm10') || q.includes('reading')) {
    return `In ${loc}, the dominant pollutant is **${dominant}** with real-time PM2.5 at ${pm25} µg/m³ and PM10 at ${pm10} µg/m³. The overall composite AQI is ${aqi} (${category}). The official CPCB health directive warns: "${healthStatement}".`;
  }

  // 10. Intelligent Contextual Overview
  return `Health Advisory for ${loc} (Current AQI: ${aqi} • ${category}):\n\n• Dominant Pollutant: ${dominant} (${pm25} µg/m³ PM2.5). ${healthStatement}.\n• Activity Advice: ${aqi > 150 ? 'Favor indoor exercise over intense outdoor sports. If heading outside, wear a certified N95 mask.' : 'Regular outdoor activities are permissible.'}\n• Best Diurnal Window: ${bestTime} is the cleanest time to step out today, while you should steer clear of peak inversion hours (${peakTime}).`;
}

export async function handleChatRequest(message: string, context: ChatContext): Promise<{ reply: string }> {
  const prompt = buildSystemPrompt(context);
  const preferredProvider = process.env.AI_DEFAULT_PROVIDER?.toLowerCase() || 'auto';

  // 1. AWS Bedrock Runtime (Amazon Nova / Anthropic Claude)
  const awsAccessKey = process.env.AWS_ACCESS_KEY_ID?.trim();
  const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  const awsRegion = process.env.AWS_REGION?.trim() || process.env.AWS_DEFAULT_REGION?.trim() || process.env.BEDROCK_REGION?.trim() || 'ap-southeast-2';
  const awsSessionToken = process.env.AWS_SESSION_TOKEN?.trim();

  // Try candidate Bedrock models in order of speed, quota availability, and cost efficiency
  const candidateModels = [
    process.env.BEDROCK_MODEL_ID?.trim(),
    'amazon.nova-lite-v1:0',
    'amazon.nova-micro-v1:0',
    'amazon.nova-pro-v1:0',
    'anthropic.claude-3-5-sonnet-20241022-v2:0',
  ].filter(Boolean) as string[];

  if (preferredProvider !== 'gemini') {
    const clientConfig: any = { region: awsRegion };
    if (awsAccessKey && awsSecretKey && !awsAccessKey.includes('your_') && !awsSecretKey.includes('your_')) {
      clientConfig.credentials = {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey,
        ...(awsSessionToken ? { sessionToken: awsSessionToken } : {}),
      };
    }

    let client: BedrockRuntimeClient | null = null;
    try {
      client = new BedrockRuntimeClient(clientConfig);
    } catch (e: any) {
      console.warn('Could not initialize BedrockRuntimeClient:', e?.message || e);
    }

    if (client) {
      for (const modelId of candidateModels) {
        try {
          const command = new ConverseCommand({
            modelId,
            system: [{ text: prompt }],
            messages: [
              {
                role: 'user',
                content: [{ text: message || 'What is the current air status and health recommendation?' }],
              },
            ],
            inferenceConfig: {
              maxTokens: 500,
              temperature: 0.2,
            },
          });

          const res = await client.send(command);
          const text = res.output?.message?.content?.[0]?.text;
          if (text && text.trim().length > 0) {
            return { reply: sanitizeAssistantReply(text) };
          }
        } catch (err: any) {
          console.warn(`Bedrock invocation with model [${modelId}] failed (${err?.name || 'Error'}):`, err?.message || err);
        }
      }
    }
  }

  // 2. Google Gemini Fallback
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
  const geminiModelId = process.env.GEMINI_MODEL_ID?.trim() || 'gemini-3.8-flash';
  const isGeminiAvailable = Boolean(
    geminiApiKey &&
    geminiApiKey !== 'MY_GEMINI_API_KEY' &&
    !geminiApiKey.includes('your_')
  );

  if (isGeminiAvailable) {
    try {
      const ai = new GoogleGenAI({
        apiKey: geminiApiKey!,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      const res = await ai.models.generateContent({
        model: geminiModelId,
        contents: message || 'What is the current air status and health recommendation?',
        config: {
          systemInstruction: prompt,
          maxOutputTokens: 1000,
        },
      });

      const text = res.text;
      if (text && text.trim().length > 0) {
        return { reply: sanitizeAssistantReply(text) };
      }
    } catch (err: any) {
      console.warn('Google Gemini invocation error, transitioning to deterministic fallback:', err?.message || err);
    }
  }

  // 3. Grounded Deterministic Fallback Engine
  return {
    reply: generateDeterministicReply(message, context),
  };
}
