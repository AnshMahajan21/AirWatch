/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Full-Stack Express Server
 * Serves real serverless API endpoints (/api/*), mounts Vite middlewares in dev,
 * and provides Gemini 3.8-flash powered AI air assistant chat endpoint.
 */

import 'dotenv/config';
import http from 'http';
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { fetchLiveAir } from './backend/src/handlers/air.ts';
import { handleChatRequest } from './backend/src/handlers/chat.ts';
import {
  verdictHandler,
  exposureHandler,
  schoolHandler,
  subscribeHandler,
  ingestHandler,
} from './backend/src/handlers/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // CORS for local development & cloud API Gateway emulation
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // --- API ROUTES (/api/*) ---

  // GET /api/air
  app.get('/api/air', async (req: Request, res: Response) => {
    try {
      const lat = parseFloat(req.query.lat as string) || 28.6502;
      const lon = parseFloat(req.query.lon as string) || 77.3150;
      const name = (req.query.name as string) || '';
      const demo = req.query.demo === 'true';
      const band = req.query.band as string;

      const data = await fetchLiveAir(lat, lon, name, demo, band);
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch air data' });
    }
  });

  // GET /api/config/sources (Inspect status of configured API keys and sources without leaking secrets)
  const getSourcesConfig = () => {
    const cpcbKey = process.env.DATA_GOV_IN_API_KEY || process.env.CPCB_API_KEY;
    const aqicnKey = process.env.AQICN_API_KEY || process.env.WAQI_API_TOKEN;

    return {
      sources: [
        {
          id: 'aqicn',
          name: 'AQICN / WAQI Real-Time Feed',
          configured: true,
          description: 'Real-time ground station monitors directly matching aqicn.org',
        },
        {
          id: 'cpcb',
          name: 'CPCB (data.gov.in CAAQMS)',
          configured: Boolean(cpcbKey && cpcbKey.trim().length > 0 && !cpcbKey.includes('your_')),
          description: 'Official Government of India CAAQMS continuous ground stations',
        },
        {
          id: 'diurnal',
          name: 'Diurnal Harmonic Model',
          configured: true,
          description: 'Autonomous zero-network NCR physical atmospheric inversion failsafe',
        },
      ],
    };
  };

  app.get('/api/config/sources', (req: Request, res: Response) => {
    res.json(getSourcesConfig());
  });

  app.get('/api/config/tiers', (req: Request, res: Response) => {
    res.json(getSourcesConfig());
  });

  // GET /api/verdict
  app.get('/api/verdict', async (req: Request, res: Response) => {
    const lambdaEvent = { queryStringParameters: req.query };
    const result = await verdictHandler(lambdaEvent);
    res.status(result.statusCode).json(JSON.parse(result.body));
  });

  // GET /api/exposure
  app.get('/api/exposure', async (req: Request, res: Response) => {
    const lambdaEvent = { queryStringParameters: req.query };
    const result = await exposureHandler(lambdaEvent);
    res.status(result.statusCode).json(JSON.parse(result.body));
  });

  // GET /api/school
  app.get('/api/school', async (req: Request, res: Response) => {
    const lambdaEvent = { queryStringParameters: req.query };
    const result = await schoolHandler(lambdaEvent);
    res.status(result.statusCode).json(JSON.parse(result.body));
  });

  // POST /api/subscribe
  app.post('/api/subscribe', async (req: Request, res: Response) => {
    const lambdaEvent = { body: req.body };
    const result = await subscribeHandler(lambdaEvent);
    res.status(result.statusCode).json(JSON.parse(result.body));
  });

  // POST /api/chat (Dual-Provider AI Assistant: AWS Bedrock + Gemini fallback)
  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { message, context } = req.body || {};
      const result = await handleChatRequest(message, context);
      res.json(result);
    } catch (err: any) {
      console.warn('Chat API error:', err?.message);
      res.status(500).json({ error: 'Chat service temporarily unavailable' });
    }
  });

  // Warm up ingest on startup
  setTimeout(() => {
    ingestHandler().catch((e) => console.warn('Warmup ingest warning:', e.message));
  }, 2000);

  // --- VITE DEV MIDDLEWARE OR STATIC PROD SERVING ---
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`AirWatch running on http://0.0.0.0:${PORT} (Node ${process.version})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
