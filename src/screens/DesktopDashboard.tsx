/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Premium Light Studio Desktop UI
 * Seamless borderless frosted glass cards without outer bounding borders.
 * Focused purely on AQI, Health Advisories, 24-Hour Timeline,
 * and Estimated AQI Exposure side-by-side with Exposure Reduction Tips in a Bento Grid.
 */

import React, { useState } from 'react';
import { AirResponse, HourPoint, Persona, PollutantKey, VerdictResponse, Band } from '../types.ts';
import { getCategoryName, getHealthStatement } from '../lib/aqi.ts';
import { formatWindowRange } from '../lib/bestWindow.ts';
import {
  Wind,
  Sparkles,
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Home,
  CheckCircle2,
  TreePine,
  Mask,
} from 'lucide-react';
import { AqiMascot } from '../components/AqiMascot.tsx';
import { InstituteCard } from '../components/InstituteCard.tsx';
import { HourlyStrip } from '../design/HourlyStrip.tsx';
import { ExposureSection } from './ExposureSection.tsx';
import { useAtmosphericTheme } from '../design/ThemeProvider.tsx';

interface DesktopDashboardProps {
  air: AirResponse;
  verdict: VerdictResponse;
  persona: Persona;
  onChangePersona: () => void;
  onOpenHowCalculated?: () => void;
  onOpenLocationPicker?: () => void;
  onSelectHour: (h: HourPoint) => void;
  selectedHour?: HourPoint;
  location?: { name: string; lat: number; lon: number };
  demoMode?: boolean;
  bandOverride?: Band;
}

export const DesktopDashboard: React.FC<DesktopDashboardProps> = ({
  air,
  verdict,
  persona,
  onChangePersona,
  onOpenHowCalculated,
  onOpenLocationPicker,
  onSelectHour,
  selectedHour,
  location,
  demoMode = false,
  bandOverride,
}) => {
  const { theme } = useAtmosphericTheme();
  const [showPollutantGrid, setShowPollutantGrid] = useState(true);

  const current = selectedHour || air.current;
  const officialCategory = getCategoryName(current.aqi);
  const officialHealthStatement = current.healthStatement || getHealthStatement(current.aqi);

  const pollutants = current.pollutants || air.pollutants;
  const dominantKey = current.dominantPollutant || air.dominantPollutant || 'pm25';
  const dominantReading = pollutants ? pollutants[dominantKey] : undefined;
  const dominantName = dominantReading?.name || dominantKey.toUpperCase();

  // AQI Badge Styling with requested colors:
  // Good #00B050, Satisfactory #92D050, Moderate #FFD400, Poor #FF9900, Very Poor #E53935, Severe #A31515
  const getAqiBadgeStyle = (aqi: number) => {
    if (aqi <= 50) return { bg: 'bg-[#00B050]', text: 'text-white' };
    if (aqi <= 100) return { bg: 'bg-[#92D050]', text: 'text-stone-900' };
    if (aqi <= 200) return { bg: 'bg-[#FFD400]', text: 'text-stone-950' };
    if (aqi <= 300) return { bg: 'bg-[#FF9900]', text: 'text-white' };
    if (aqi <= 400) return { bg: 'bg-[#E53935]', text: 'text-white' };
    return { bg: 'bg-[#A31515]', text: 'text-white' };
  };

  const aqiBadge = getAqiBadgeStyle(current.aqi);

  // Tips to improve and reduce inhalation exposure based on AQI and Persona
  const exposureTips = [
    {
      title: 'Shift High Cardio to Midday',
      desc: 'Thermal boundary layer expands between 12:00 PM – 3:30 PM, lowering ground-level particle concentrations by ~35%.',
      icon: Sparkles,
      tag: 'Timing Optimization',
      tagColor: 'text-emerald-800 bg-emerald-100/70',
    },
    {
      title: 'Use N95 / FFP2 During Commute',
      desc: 'Cloth masks block coarse dust but miss fine PM2.5. A certified N95 or KF94 filters up to 95% of fine particulates along traffic arteries.',
      icon: ShieldCheck,
      tag: 'Inhalation Defense',
      tagColor: 'text-sky-800 bg-sky-100/70',
    },
    {
      title: 'Run Indoor Air Recirculation',
      desc: 'Seal windows in early mornings when temperature inversion traps soot. Run HEPA filtration on medium speed to clear indoor PM2.5.',
      icon: Home,
      tag: 'Indoor Protection',
      tagColor: 'text-amber-800 bg-amber-100/70',
    },
    {
      title: 'Post-Exposure Airway Care',
      desc: 'Warm saline gargle and nasal rinsing after prolonged outdoor transit dislodges deposited coarse particulate matter from upper airways.',
      icon: CheckCircle2,
      tag: 'Airway Recovery',
      tagColor: 'text-purple-800 bg-purple-100/70',
    },
  ];

  const currentLat = location?.lat ?? air.location.lat;
  const currentLon = location?.lon ?? air.location.lon;

  return (
    <div className="w-full max-w-[1360px] mx-auto flex flex-col gap-6 font-sans relative">
      {/* Two Featured Pure AQI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 relative z-10">
        
        {/* Card 1 (7 Cols): Real-time Air Quality & Station Details */}
        <div 
          className="md:col-span-7 relative rounded-[32px] overflow-hidden p-6 md:p-7 backdrop-blur-2xl flex flex-col justify-between min-h-[290px] text-white transition-all duration-500"
          style={{
            backgroundColor: theme?.cardBg || 'rgba(255, 255, 255, 0.12)',
            border: `1px solid ${theme?.cardBorder || 'rgba(255, 255, 255, 0.25)'}`,
            boxShadow: theme?.cardGlow || '0 20px 40px -15px rgba(0, 0, 0, 0.35)',
          }}
        >
          {/* Subtle top light highlight reflecting on glass surface */}
          <div 
            className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[32px] opacity-70"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 backdrop-blur-md shadow-xs flex items-center justify-center">
                  <Wind className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-black text-white">Air Quality Composite Index</div>
                  <div className="text-[10px] text-white/70 font-semibold">
                    Dominant Pollutant: <span className="font-mono text-white font-bold">{dominantName}</span> ({Math.round(current.pm25)} µg/m³)
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider block">Monitoring Station</span>
                <span className="text-xs font-bold text-white truncate max-w-[200px] block" title={air.station?.name}>
                  {air.station?.name || 'Continuous CAAQMS'}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-baseline gap-4">
              <span className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-md font-mono">
                {current.aqi}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-black uppercase shadow-md ${aqiBadge.bg} ${aqiBadge.text}`}>
                {officialCategory}
              </span>
            </div>

            {/* Official Health Statement */}
            <p className="text-xs text-white/85 font-medium mt-2 max-w-lg leading-relaxed">
              "{officialHealthStatement}"
            </p>
          </div>

          {/* AQI Range Slider Track with Exact CPCB Color Scale */}
          <div className="relative z-10 bg-black/25 backdrop-blur-xl border border-white/15 rounded-2xl p-3.5 shadow-inner mt-5">
            <div className="flex items-center justify-between text-[10px] font-bold text-white/70 mb-1.5">
              <span>Good (0)</span>
              <span className="text-white font-black">{officialCategory} ({current.aqi})</span>
              <span>Severe (500)</span>
            </div>
            <div className="w-full h-3 bg-black/40 rounded-full relative overflow-hidden border border-white/10">
              <div
                className="h-full rounded-full transition-all duration-500 shadow-inner"
                style={{
                  width: `${Math.min(100, Math.max(5, (current.aqi / 500) * 100))}%`,
                  background: 'linear-gradient(90deg, #00B050 0%, #92D050 20%, #FFD400 40%, #FF9900 60%, #E53935 80%, #A31515 100%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 2 (5 Cols): Health Advisory & Prescribed Action */}
        <div 
          className="md:col-span-5 rounded-[32px] p-6 backdrop-blur-2xl text-white flex flex-col justify-between min-h-[290px] relative transition-all duration-500"
          style={{
            backgroundColor: theme?.cardBg || 'rgba(255, 255, 255, 0.12)',
            border: `1px solid ${theme?.cardBorder || 'rgba(255, 255, 255, 0.25)'}`,
            boxShadow: theme?.cardGlow || '0 20px 40px -15px rgba(0, 0, 0, 0.35)',
          }}
        >
          {/* Top highlight line */}
          <div 
            className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[32px] opacity-70"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
            }}
          />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold tracking-wider text-lime-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-lime-400" />
                Health Advisory
              </span>
              <button
                onClick={onChangePersona}
                className="px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md text-white font-bold text-[10px] shadow-xs transition-all cursor-pointer"
                title="Change Persona"
              >
                {persona.toUpperCase()} PROFILE
              </button>
            </div>
            <h4 className="text-lg font-bold text-white mt-2 leading-tight">
              {verdict.headline}
            </h4>
          </div>

          <div className="my-3 flex justify-center items-center">
            <div className="w-40 h-40">
              <AqiMascot band={current.band} aqi={current.aqi} />
            </div>
          </div>

          <div className="bg-black/25 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 shadow-xs">
            <div className="text-[10px] uppercase font-bold tracking-wider text-lime-300">Prescribed Action</div>
            <div className="text-xs font-semibold text-white mt-0.5 leading-snug">
              {verdict.action === 'go'
                ? 'Normal outdoor routine permissible with adequate hydration'
                : verdict.action === 'caution'
                ? 'Limit intensive endurance cardio outdoors; mask near busy roads'
                : 'Contain workouts indoors; run HEPA air filtration & keep windows closed'}
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Timeline & Diurnal Air Windows Strip */}
      <div 
        className="backdrop-blur-2xl rounded-[32px] p-6 text-white relative z-10 transition-all duration-500"
        style={{
          backgroundColor: theme?.cardBg || 'rgba(255, 255, 255, 0.12)',
          border: `1px solid ${theme?.cardBorder || 'rgba(255, 255, 255, 0.25)'}`,
          boxShadow: theme?.cardGlow || '0 20px 40px -15px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div 
          className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[32px] opacity-70"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
          }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-300" />
              <h3 className="text-sm font-bold text-white">
                24-Hour Diurnal Timeline & Air Windows
              </h3>
            </div>
            <p className="text-xs text-white/70 font-medium mt-0.5">
              Hourly dispersion trends across Delhi NCR. Click any card to inspect that specific hour.
            </p>
          </div>

          {/* Safe & Peak Window Callout Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {verdict.bestWindow && (
              <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-md px-3 py-1 rounded-xl font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Safest Window: {formatWindowRange(verdict.bestWindow.startIso, verdict.bestWindow.endIso)}</span>
              </div>
            )}
            {verdict.peakWindow && (
              <div className="flex items-center gap-1.5 text-rose-300 bg-rose-500/20 border border-rose-400/30 backdrop-blur-md px-3 py-1 rounded-xl font-bold shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Avoid Peak: {formatWindowRange(verdict.peakWindow.startIso, verdict.peakWindow.endIso)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 24-Hour Contiguous Scrollable Strip */}
        <HourlyStrip
          hourly={air.hourly}
          bestWindowStartIso={verdict.bestWindow?.startIso}
          bestWindowEndIso={verdict.bestWindow?.endIso}
          peakWindowStartIso={verdict.peakWindow?.startIso}
          peakWindowEndIso={verdict.peakWindow?.endIso}
          avoidHours={verdict.avoidHours}
          selectedIso={selectedHour?.iso}
          onSelectHour={onSelectHour}
          className="pt-1"
        />
      </div>

      {/* Bento Grid: Estimated AQI Exposure & Tips to Improve Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10">
        
        {/* Left 6 Cols: Estimated AQI Exposure Section */}
        <div 
          className="lg:col-span-6 backdrop-blur-2xl rounded-[32px] p-6 text-white flex flex-col justify-between transition-all duration-500 relative"
          style={{
            backgroundColor: theme?.cardBg || 'rgba(255, 255, 255, 0.12)',
            border: `1px solid ${theme?.cardBorder || 'rgba(255, 255, 255, 0.25)'}`,
            boxShadow: theme?.cardGlow || '0 20px 40px -15px rgba(0, 0, 0, 0.35)',
          }}
        >
          <div 
            className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[32px] opacity-70"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
            }}
          />
          <ExposureSection
            lat={currentLat}
            lon={currentLon}
            hourly={air.hourly}
            demoMode={demoMode}
            bandOverride={bandOverride}
          />
        </div>

        {/* Right 6 Cols: Tips to Improve & Mitigate Exposure */}
        <div 
          className="lg:col-span-6 backdrop-blur-2xl rounded-[32px] p-6 text-white flex flex-col justify-between transition-all duration-500 relative"
          style={{
            backgroundColor: theme?.cardBg || 'rgba(255, 255, 255, 0.12)',
            border: `1px solid ${theme?.cardBorder || 'rgba(255, 255, 255, 0.25)'}`,
            boxShadow: theme?.cardGlow || '0 20px 40px -15px rgba(0, 0, 0, 0.35)',
          }}
        >
          <div 
            className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[32px] opacity-70"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
            }}
          />
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-white/15">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">
                    Actionable Exposure Reductions
                  </h3>
                  <span className="text-[10px] text-white/60 font-medium">
                    Evidence-based interventions for {persona.toUpperCase()} profile
                  </span>
                </div>
              </div>

              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20 shadow-xs">
                Air Hygiene
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {exposureTips.map((tip, idx) => {
                const Icon = tip.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-black/20 hover:bg-black/30 border border-white/15 backdrop-blur-md shadow-xs flex flex-col justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/10 ${tip.tagColor}`}>
                          {tip.tag}
                        </span>
                        <Icon className="w-3.5 h-3.5 text-white/60 shrink-0" />
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug">
                        {tip.title}
                      </h4>
                      <p className="text-[11px] text-white/70 mt-1.5 leading-relaxed font-medium">
                        {tip.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <span className="text-[11px] text-white/60">
              Guidelines curated from CPCB & WHO air quality standards.
            </span>
            <button
              onClick={onOpenHowCalculated}
              className="text-[11px] font-bold text-amber-300 hover:text-amber-200 hover:underline cursor-pointer"
            >
              Methodology →
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Pollutant 7-Parameter Breakdown Drawer */}
      {pollutants && (
        <div 
          className="backdrop-blur-2xl rounded-[32px] p-6 text-white relative z-10 transition-all duration-500"
          style={{
            backgroundColor: theme?.cardBg || 'rgba(255, 255, 255, 0.12)',
            border: `1px solid ${theme?.cardBorder || 'rgba(255, 255, 255, 0.25)'}`,
            boxShadow: theme?.cardGlow || '0 20px 40px -15px rgba(0, 0, 0, 0.35)',
          }}
        >
          <div 
            className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[32px] opacity-70"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
            }}
          />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-300" />
              <h3 className="text-sm font-bold text-white">
                CPCB 7-Parameter Pollutant Breakdowns (µg/m³)
              </h3>
            </div>
            <button
              onClick={() => setShowPollutantGrid(!showPollutantGrid)}
              className="text-xs font-semibold text-white/70 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{showPollutantGrid ? 'Collapse' : 'Expand'}</span>
              {showPollutantGrid ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showPollutantGrid && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {(Object.keys(pollutants) as PollutantKey[]).map((pkey) => {
                const p = pollutants[pkey];
                if (!p) return null;
                const isDominant = pkey === dominantKey;
                return (
                  <div
                    key={pkey}
                    className={`p-3.5 rounded-2xl text-center transition-all backdrop-blur-md border ${
                      isDominant
                        ? 'bg-amber-400/25 border-amber-400/60 ring-2 ring-amber-400/40 shadow-md'
                        : 'bg-black/20 border-white/15 hover:bg-black/30 shadow-xs'
                    }`}
                  >
                    <div className="text-xs font-bold text-white/85">{p.name}</div>
                    <div className="text-base font-black font-mono text-white mt-1">{p.value}</div>
                    <div className="text-[10px] text-white/60 uppercase font-mono font-semibold mt-0.5">
                      Sub-idx: {p.subIndex}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Institute Safety Card (Rendered if in school persona) */}
      {persona === 'school' && (
        <div className="relative z-10">
          <InstituteCard
            currentAqi={current.aqi}
            currentBand={current.band}
            currentPm25={current.pm25}
            hourly={air?.hourly}
          />
        </div>
      )}
    </div>
  );
};
