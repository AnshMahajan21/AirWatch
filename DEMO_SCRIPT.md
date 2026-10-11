# AirWatch — 3-Minute Video Demo Script

> **Hackathon**: Environmental Hacks 2026 (Track 01: Air)  
> **Duration**: Exactly 3:00 (180 Seconds)  
> **Presenter**: Senior Full-Stack & Cloud Engineer

---

## ⏱️ Timestamped Shot List & Narration

### [0:00 – 0:20] Hook & Problem (Ghaziabad / Delhi Morning)
- **Visual**: Screen recording opens on a foggy, hazy morning window in Anand Vihar, Delhi, then cuts to a generic weather app displaying an abstract number: *"AQI 348"*.
- **Narration**:
  > *"Every November morning across Delhi NCR, 30 million people wake up, see a number like 348 on their phone, and have the exact same question: 'What do I actually DO with this?' A mother doesn't know if her child can do PE outdoor play. An asthma patient doesn't know what time of day is safe for groceries. And delivery riders don't know when they need an N95 respirator. This is AirWatch—the first atmospheric decision engine built for Delhi NCR."*

---

### [0:20 – 1:30] Live Product Walkthrough (PWA & Desktop)
- **0:20 – 0:40 | Persona Onboarding & Atmospheric World**
  - **Visual**: Show first launch onboarding modal. Select **"Parent or School Coordinator"**, pick **"Anand Vihar"**. The app cross-fades into the deep maroon *Very Poor* atmospheric world with the India Gate skyline shrouded in realistic PM2.5 haze.
  - **Narration**:
    > *"On first launch, AirWatch personalizes for you: Parent, Sensitive Health Profile, or Commuter. Notice the giant Fraunces hero numeral—348 AQI—calculated with official CPCB linear breakpoints. As air conditions shift, the entire atmospheric palette cross-fades, complete with India Gate silhouettes and stubble-burning smoke streaks on the horizon."*

- **0:40 – 1:00 | The Decision & Diurnal Best Window**
  - **Visual**: Point out the **Verdict Card**: *"Stay Indoors Today. Children breathe 50% more air per pound."* Then highlight the green best window banner: *"Best window: 1:00 PM – 3:00 PM (avg 68 µg/m³)"*.
  - **Narration**:
    > *"Instead of an abstract number, AirWatch gives you a clear verdict: Stay Indoors Today. But it also finds hope. Thanks to solar convective mixing that breaks winter thermal inversion, our algorithm highlights the contiguous safest 2-hour window: 1 to 3 PM."*

- **1:00 – 1:15 | Cumulative Exposure Meter**
  - **Visual**: Drag the hours-outside slider from 1 hour to 6 hours. Watch the ArcGauge sweep from 24% (green) to 135% (red: Budget Exceeded).
  - **Narration**:
    > *"For our commuters and delivery riders, our exposure meter tracks cumulative inhaled particulate against India's 24-hour safe budget. 2 hours outside is manageable; 6 hours pushes you into the red zone."*

- **1:15 – 1:30 | School Safety & WhatsApp Card Share**
  - **Visual**: Open School Safety tab. Search *'DPS R.K. Puram'*. Red status: Assembly Suspended, PE Suspended. Click **"Save PNG"** / **"Share WhatsApp"**. The retro 8-bit `PixelCard` renders crisply and opens WhatsApp share dialogue.
  - **Narration**:
    > *"For schools, AirWatch provides automated Directorate of Education and GRAP compliance. With one click, school coordinators export an 8-bit advisory widget directly to class WhatsApp parent groups."*

---

### [1:30 – 2:15] Visible AWS Console & Serverless Ingestion
- **Visual**: Cut to AWS Management Console:
  1. **AWS CloudWatch Dashboard**: Show `AirWatch-Operations-prod` with live API Gateway traffic and Lambda execution graphs.
  2. **Amazon DynamoDB**: Open table `airwatch-readings-prod`. Inspect items partitioned by `LOC#anand-vihar`, `LOC#noida` with TTL values.
  3. **Amazon EventBridge**: Show the 30-minute scheduled rule `ScheduledIngest`.
  4. **Amazon SNS**: Show topic `airwatch-air-alerts-prod`. Trigger a test notification or show subscription confirmation email in the inbox.
- **Narration**:
  > *"Under the hood, AirWatch is 100% serverless on AWS, defined cleanly with AWS SAM. Every 30 minutes, an EventBridge cron invokes our Ingest Lambda on Graviton arm64. It pulls live AQICN and CPCB continuous ground station readings and writes to DynamoDB with automatic TTL expiry. When someone subscribes, Amazon SNS manages topic fanout, sending real-time advisory emails with zero server management."*

---

### [2:15 – 2:45] Architecture & One-Command SAM Deploy
- **Visual**: Display the Mermaid architecture diagram on screen. Open terminal and run `sam build && sam deploy`. Show the CloudFront URL and API Gateway endpoint outputs.
- **Narration**:
  > *"Our architecture uses HTTP API Gateway v2, ARM64 Lambdas, and private S3 hosting behind CloudFront with Origin Access Control. Everything stays strictly within the AWS Free Tier—no NAT Gateways, no idle servers. Deploying the entire stack takes a single command: sam deploy."*

---

### [2:45 – 3:00] Impact & What's Next
- **Visual**: Switch back to AirWatch desktop dashboard on 1280px screen showing the full multi-column overview.
- **Narration**:
  > *"Air quality isn't just a number to dread—it's an environment we can navigate when we have the right decisions at the right time. AirWatch brings clarity, protection, and calm to every breath in Delhi NCR. Thank you."*
