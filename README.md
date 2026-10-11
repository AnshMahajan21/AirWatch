# AirWatch — Atmospheric Air Decision Engine

> **Environmental Hacks 2026** · Track 01: Air (Oct 8–11, 2026)  
> *Turning raw Delhi NCR AQI numbers into personalized, life-saving decisions.*

---

## 🌫️ The Problem

On bad-air mornings in Delhi NCR, 33 million citizens check an AQI number (e.g., "382"). But an abstract number doesn't tell a mother whether her 6-year-old should run outdoor PE, doesn't tell an asthmatic grandfather when it's safe to buy groceries, and doesn't tell a Zomato delivery rider when to put on a sealed N95 mask.

**AirWatch** bridges the gap between raw atmospheric data and human action. It answers:
> **"Is it safe for ME to go out, and when is the cleanest window today?"**

---

## 🎯 The Three Personas

1. **Parent / School Coordinator (`parent`)**
   - Actionable go / no-go for outdoor recess, assemblies, and physical education.
   - Grounded in Delhi Directorate of Education & CAQM GRAP directives.
   - Generates retro 8-bit shareable advisory cards for WhatsApp school groups.
2. **Sensitive Health Profile (`sensitive`)**
   - Built for asthma, cardiovascular conditions, seniors, and pregnancy.
   - Pinpoints the **cleanest 2–3 hour daylight window** (convective solar mixing between 1 PM and 4 PM).
   - Highlights morning thermal inversion danger hours to avoid.
3. **Daily Commuter / Outdoor Rider (`commuter`)**
   - Real-time cumulative inhaled particulate dose meter (`µg·h/m³`).
   - Strict N95 mask trigger when roadside particulate breaches safety thresholds.

---

## 🚀 Key Features

- **Official CPCB Breakpoints**: Exact piecewise linear sub-index interpolation for PM2.5 (0–30 Good, 31–60 Satisfactory, 61–90 Moderate, 91–120 Poor, 121–250 Very Poor, 250+ Severe).
- **Diurnal Best-Window Algorithm**: Evaluates all contiguous 3-hour daylight intervals (06:00–21:00 IST) to find the minimum forecasted exposure.
- **Atmospheric Visual Theming**: 6 color worlds mirroring Delhi's sky—from pale mint/sky to deep maroon-brown dust fog.
- **Layered Delhi Skyline SVG**: Hand-crafted silhouettes of India Gate, Humayun domes, and Qutub Minar with depth-scaled PM2.5 haze layers and stubble-smoke streaks (<30KB).
- **Retro 8-Bit School Cards**: 1-click export to PNG via `html-to-image` with native Web Share and WhatsApp `wa.me` sharing.
- **Real-Time AWS SNS Alerts**: Daily proactive notifications when local air breaches subscriber thresholds.
- **Offline PWA Ready**: Automatically serves cached readings with a freshness badge when offline.

---

## ☁️ Serverless AWS Architecture & Free Tier Rationale

Built with **AWS SAM (`infra/template.yaml`)**:

| AWS Service | Role in AirWatch | Why Chosen & Free Tier Compliance |
|---|---|---|
| **HTTP API Gateway (v2)** | REST API routing (`/air`, `/verdict`, `/exposure`, `/school`, `/subscribe`) | 70% cheaper than REST API Gateway, sub-5ms latency, generous 1M requests/mo free tier. |
| **AWS Lambda (arm64 Node.js 20)** | Pure serverless handlers for calculations, Open-Meteo ingestion, and alerts | Graviton2 arm64 cuts execution time & cost by 20%. 1M free requests/mo + 3.2M seconds compute. |
| **Amazon DynamoDB** | Storage for 8 NCR preset grid readings & email subscriptions | On-Demand mode with TTL auto-expiring old data. 25GB free forever. No idle cost. |
| **Amazon EventBridge** | Cron schedules (every 30 mins) for `IngestFunction` and `AlertCheckFunction` | Built-in serverless scheduler. No EC2 or persistent daemons required. |
| **Amazon SNS** | Direct email delivery for hazardous smog alerts | Instant delivery, 1,000 free email notifications per month. |
| **Amazon S3 + CloudFront (OAC)** | Private static hosting with global CDN caching & SPA routing fallback | Origin Access Control (OAC) prevents direct S3 access. 1TB free data transfer out. |
| **CloudWatch + Budget Alarm** | Operational observability dashboard and $10 billing alarm | Ensures strict 0-cost operation within AWS Free Tier limits. |

---

## 🛠️ Local Development & Quickstart

### Prerequisites
- Node.js 20+
- (Optional) Docker for DynamoDB Local / LocalStack
- (Optional) AWS SAM CLI for cloud deployment

### 1. Clone & Install
```bash
git clone https://github.com/environmental-hacks/airwatch.git
cd airwatch
npm install
```

### 2. Run the Full-Stack Dev Server
```bash
# Starts Express backend and mounts Vite on http://localhost:3000
npm run dev
```

### 3. Run Unit Tests (100% CPCB Logic Coverage)
```bash
npm run test
```

### 4. Run WCAG AA Contrast Audit
```bash
npx tsx scripts/contrast-check.ts
```

---

## 🚢 Deploying to AWS

### Deploy Backend with AWS SAM
```bash
cd infra
sam build
sam deploy --guided
```

### Deploy Frontend to S3 + CloudFront
```bash
# Uses CloudFormation stack outputs to build and sync
./scripts/deploy-frontend.sh airwatch-prod ap-south-1
```

---

## 📜 Credits, Data Sources & Licences

- **Data Sources**:
  - [AQICN / WAQI Open Data Platform](https://aqicn.org) (Real-time ground station monitors across Delhi NCR)
  - [CPCB India / data.gov.in](https://cpcb.nic.in) (Continuous Ambient Air Quality Monitoring Stations & IND-AQI standards)
- **Typography**: Fraunces & Plus Jakarta Sans via Google Fonts (SIL Open Font License).
- **License**: Apache License 2.0.
