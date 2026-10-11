/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Atmospheric Air Quality Decision Engine
 * Turns raw CPCB & AQICN AQI data into personalized, actionable decisions for Delhi NCR.
 * English only.
 */

import React, { useState, useEffect } from 'react';
import { AirResponse, Band, HourPoint, Persona, PollutantKey, VerdictResponse } from './types.ts';
import { fetchAirData, fetchVerdictData, getCachedAir } from './services/api.ts';
import { calculateVerdict } from './lib/verdict.ts';
import { BAND_THEMES } from './design/tokens.ts';
import { ThemeProvider } from './design/ThemeProvider.tsx';
import { HeroNumber } from './design/HeroNumber.tsx';
import { GlassCard } from './design/GlassCard.tsx';
import { LabelPill, StatPill } from './design/Pills.tsx';
import { HourlyStrip } from './design/HourlyStrip.tsx';
import { HazeParticles } from './design/HazeParticles.tsx';
import { OnboardingModal } from './screens/OnboardingModal.tsx';
import { VerdictCard } from './screens/VerdictCard.tsx';
import { CalculationDrawer } from './screens/CalculationDrawer.tsx';
import { DesktopDashboard } from './screens/DesktopDashboard.tsx';
import { ExposureSection } from './screens/ExposureSection.tsx';
import { LocationPickerModal } from './screens/LocationPickerModal.tsx';
import { AiAirChatbot } from './components/AiAirChatbot.tsx';
import {
  Wind,
  Activity,
  MapPin,
  RefreshCw,
  WifiOff,
  AlertTriangle,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AirWatchLogo } from './components/AirWatchLogo.tsx';
import { AqiMascot } from './components/AqiMascot.tsx';
import { InstituteCard } from './components/InstituteCard.tsx';
import { getCategoryName, getHealthStatement, POLLUTANT_CONFIG } from './lib/aqi.ts';

const STORAGE_KEY_PERSONA = 'airwatch_persona_v2';
const STORAGE_KEY_LOC = 'airwatch_location_v2';

function renderProfileIcon(currentPersona: Persona) {
  if (currentPersona === 'school') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        {/* Red flag on top */}
        <path d="M 12 2 L 12 5.5 M 12 2 L 16 3.2 L 12 4.5" fill="#EF4444" stroke="#EF4444" strokeWidth="0.8" strokeLinejoin="round" />
        {/* Central gable roof */}
        <path d="M 12 5.5 L 6.5 9.5 L 17.5 9.5 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.6" />
        {/* Left & Right roof wings */}
        <path d="M 2.5 10 L 6.5 9.5 L 6.5 10.8 L 2.5 11.2 Z" fill="#0284C7" />
        <path d="M 17.5 9.5 L 21.5 10 L 21.5 11.2 L 17.5 10.8 Z" fill="#0284C7" />
        {/* Building facades */}
        <rect x="2.5" y="10.8" width="19" height="10.2" rx="0.5" fill="#F59E0B" />
        <rect x="6.5" y="9.5" width="11" height="11.5" fill="#FBBF24" />
        {/* Windows */}
        <rect x="3.8" y="12" width="1.8" height="2.4" rx="0.3" fill="#B45309" />
        <rect x="3.8" y="15.8" width="1.8" height="2.4" rx="0.3" fill="#B45309" />
        <rect x="18.4" y="12" width="1.8" height="2.4" rx="0.3" fill="#B45309" />
        <rect x="18.4" y="15.8" width="1.8" height="2.4" rx="0.3" fill="#B45309" />
        {/* Central Clock */}
        <circle cx="12" cy="13" r="2.2" fill="#FFFFFF" stroke="#D97706" strokeWidth="0.5" />
        <path d="M 12 11.7 L 12 13 L 12.9 13" stroke="#78350F" strokeWidth="0.8" strokeLinecap="round" />
        {/* Arched Door */}
        <path d="M 10.4 21 L 10.4 17.5 C 10.4 16.7 11.1 16 12 16 C 12.9 16 13.6 16.7 13.6 17.5 L 13.6 21 Z" fill="#DC2626" />
      </svg>
    );
  }

  if (currentPersona === 'medical') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5">
        <path
          d="M 19.5 12.572 L 12 20 L 4.5 12.572 C 2.5 10.5 2.5 7.2 4.6 5.1 C 6.7 3 10 3.1 12 5.4 C 14 3.1 17.3 3 19.4 5.1 C 21.5 7.2 21.5 10.5 19.5 12.572 Z"
          fill="#F43F5E"
          stroke="#E11D48"
          strokeWidth="1.2"
        />
        <path
          d="M 4 12 L 7.8 12 L 9.6 8.5 L 12 15.5 L 14.4 10 L 16.2 12 L 20 12"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  // General profile (person silhouette)
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
      <circle cx="12" cy="7" r="4.2" />
      <path d="M 4.5 19.5 C 4.5 15.4 7.8 13.2 12 13.2 C 16.2 13.2 19.5 15.4 19.5 19.5 C 19.5 19.8 19.3 20 19 20 L 5 20 C 4.7 20 4.5 19.8 4.5 19.5 Z" />
    </svg>
  );
}

export default function App() {
  // Persistent Persona: default to 'general'
  const [persona, setPersona] = useState<Persona>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PERSONA);
    if (saved === 'school' || saved === 'medical') return saved;
    return 'general';
  });

  // Persistent Location: default to Anand Vihar, Delhi
  const [location, setLocation] = useState<{ name: string; lat: number; lon: number }>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOC);
      return stored ? JSON.parse(stored) : { name: 'Anand Vihar', lat: 28.6502, lon: 77.3150 };
    } catch {
      return { name: 'Anand Vihar', lat: 28.6502, lon: 77.3150 };
    }
  });

  // Data state
  const [air, setAir] = useState<AirResponse | null>(null);
  const [verdict, setVerdict] = useState<VerdictResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [selectedHour, setSelectedHour] = useState<HourPoint | undefined>(undefined);

  // Demo Controls for testing variations
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [bandOverride, setBandOverride] = useState<Band | undefined>(undefined);

  // Modals
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return !localStorage.getItem(STORAGE_KEY_PERSONA);
  });
  const [showHowCalculated, setShowHowCalculated] = useState<boolean>(false);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [showChatbot, setShowChatbot] = useState<boolean>(false);

  // Connectivity detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load air and verdict data
  const loadData = async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const airData = await fetchAirData(location.lat, location.lon, location.name, demoMode, bandOverride);
      // Strictly derive verdict from authoritative active air data
      const verdictData = calculateVerdict(persona, airData.current, airData.hourly);

      setAir(airData);
      setVerdict(verdictData);
      setSelectedHour(undefined);
    } catch (err) {
      console.error('Error fetching AirWatch data:', err);
      const cached = getCachedAir(location.lat, location.lon);
      if (cached) setAir(cached);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [location.lat, location.lon, persona, demoMode, bandOverride]);

  const handleCompleteOnboarding = (
    newPersona: Persona,
    newLoc: { name: string; lat: number; lon: number }
  ) => {
    setPersona(newPersona);
    setLocation(newLoc);
    localStorage.setItem(STORAGE_KEY_PERSONA, newPersona);
    localStorage.setItem(STORAGE_KEY_LOC, JSON.stringify(newLoc));
    setShowOnboarding(false);
  };

  const handleSelectLocation = (loc: { name: string; lat: number; lon: number }) => {
    setLocation(loc);
    localStorage.setItem(STORAGE_KEY_LOC, JSON.stringify(loc));
    setShowLocationPicker(false);
  };

  const activePoint = selectedHour || air?.current;
  const currentBand: Band = activePoint?.band || 'moderate';
  const currentAqi = activePoint?.aqi ?? 142;
  const currentPm25 = activePoint?.pm25 ?? 85;

  // CAQM GRAP Stage determination (English)
  const getGrapStage = (aqiScore: number) => {
    if (aqiScore > 450) return { label: 'Stage IV (Severe+)', desc: 'Truck ban, hybrid school mode active.' };
    if (aqiScore >= 401) return { label: 'Stage III (Severe)', desc: 'Construction ban & BS-III/IV restrictions.' };
    if (aqiScore >= 301) return { label: 'Stage II (Very Poor)', desc: 'Mechanical sweeping & diesel generator ban.' };
    if (aqiScore >= 201) return { label: 'Stage I (Poor)', desc: 'Dust suppression & open burning ban.' };
    return null;
  };
  const grapInfo = getGrapStage(currentAqi);

  const personaLabel =
    persona === 'general' ? 'General' : persona === 'school' ? 'Parent / School / Institute' : 'Medical Profile';

  return (
    <ThemeProvider initialBand={currentBand} currentBand={currentBand}>
      <div className="relative min-h-screen flex flex-col font-sans selection:bg-amber-400/30 selection:text-amber-200">
        {/* Background Haze Particles Drifting */}
        <HazeParticles pm25={currentPm25} />

        {/* Clean Top Navigation Bar */}
        <header className="px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 backdrop-blur-md bg-black/15 z-30">
          {/* Brand on Left; Location & Profile on Right for Mobile */}
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5 shrink-0">
              <AirWatchLogo className="w-8 h-8 rounded-full ring-1 ring-white/20 shadow-md" />
              <span className="font-serif text-lg font-bold text-white tracking-tight leading-none">AirWatch</span>
            </div>

            {/* Location Selector & Profile Button (Alignd to right side on mobile, above Demo) */}
            <div className="flex items-center gap-2">
              {/* Location Selector Button (Small circular icon button on mobile, full bar on tablet/desktop) */}
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="flex items-center justify-center sm:justify-start gap-1.5 w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-full sm:rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 text-left"
                title={`Change NCR Location (${location.name})`}
                aria-label={`Change NCR Location (${location.name})`}
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline font-semibold text-xs sm:text-sm text-white">
                  {location.name}
                </span>
                <span className="hidden sm:inline text-[10px] text-white/50 ml-0.5">▼</span>
              </button>

              {/* Circular Profile Icon Button */}
              <button
                type="button"
                onClick={() => setShowOnboarding(true)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0 shadow-xs"
                title={`Switch profile (${personaLabel})`}
                aria-label={`Switch profile (${personaLabel})`}
              >
                {renderProfileIcon(persona)}
              </button>
            </div>
          </div>

          {/* Right Controls: Freshness, Refresh, Alerts, Ask AI, Demo Mode */}
          <div className="w-full sm:w-auto flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
            {isOffline && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold">
                <WifiOff className="w-3 h-3" />
                <span>Cached</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh latest readings"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Demo Mode Toggle with Band Selector */}
            <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => {
                  const nextDemo = !demoMode;
                  setDemoMode(nextDemo);
                  setBandOverride(nextDemo ? (bandOverride || 'moderate') : undefined);
                }}
                className={`px-2 py-1 rounded-lg cursor-pointer ${demoMode ? 'bg-amber-500 text-stone-950 font-bold' : 'text-white/60 hover:text-white'}`}
              >
                Demo
              </button>
              {demoMode && (
                <select
                  value={bandOverride || currentBand}
                  onChange={(e) => setBandOverride(e.target.value as Band)}
                  aria-label="Override simulated AQI band"
                  className="bg-stone-900 text-white border border-white/20 text-xs rounded px-1.5 py-0.5"
                >
                  <option value="good">🟩 Good (0–50)</option>
                  <option value="satisfactory">🟨 Satisfactory (51–100)</option>
                  <option value="moderate">🟧 Moderate (101–200)</option>
                  <option value="poor">🟥 Poor (201–300)</option>
                  <option value="very_poor">🟪 Very Poor (301–400)</option>
                  <option value="severe">🟫 Severe (401+)</option>
                </select>
              )}
            </div>
          </div>
        </header>

        {/* GRAP Warning Banner for Delhi NCR */}
        {grapInfo && (
          <div className="bg-rose-950/80 border-b border-rose-500/40 px-4 py-2 text-rose-200 text-xs flex items-center justify-between z-20">
            <div className="flex items-center gap-2 max-w-4xl">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>CAQM GRAP {grapInfo.label}: </strong>
                {grapInfo.desc}
              </span>
            </div>
            <span className="font-mono text-[10px] text-rose-300/70 uppercase shrink-0 ml-2">
              Mandatory Directive
            </span>
          </div>
        )}

        {/* Selected Hour Notice Bar */}
        {selectedHour && (
          <div className="bg-black/40 border-b border-white/10 px-4 py-2 text-xs text-white/90 flex items-center justify-between z-20">
            <span>
              Previewing forecast for{' '}
              <strong>
                {new Date(selectedHour.iso).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </strong>{' '}
              ({selectedHour.aqi} AQI).
            </span>
            <button
              type="button"
              onClick={() => setSelectedHour(undefined)}
              className="px-2.5 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white font-bold cursor-pointer"
            >
              Reset to Current
            </button>
          </div>
        )}

        {/* Main Application Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative z-10 overflow-x-hidden">
          {loading && !air ? (
            <div className="max-w-md mx-auto space-y-6 pt-12 animate-pulse">
              <div className="h-44 bg-white/10 rounded-3xl" />
              <div className="h-32 bg-white/10 rounded-3xl" />
              <div className="h-36 bg-white/10 rounded-3xl" />
            </div>
          ) : air && verdict ? (
            <>
              {/* Desktop Dashboard (>= 1024px) */}
              <div className="hidden lg:block">
                <DesktopDashboard
                  air={air}
                  verdict={verdict}
                  persona={persona}
                  onChangePersona={() => setShowOnboarding(true)}
                  onOpenHowCalculated={() => setShowHowCalculated(true)}
                  onOpenLocationPicker={() => setShowLocationPicker(true)}
                  onSelectHour={(h) => setSelectedHour(h)}
                  selectedHour={selectedHour}
                  location={location}
                  demoMode={demoMode}
                  bandOverride={bandOverride}
                />
              </div>

              {/* Mobile View (< 1024px, Clean 390px baseline) */}
              <div className="block lg:hidden max-w-md mx-auto space-y-5">
                {/* Hero Weather Card */}
                <GlassCard className="overflow-hidden pb-0">
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                    <div>
                      <div className="text-[11px] uppercase font-mono tracking-widest text-white/60">
                        Ambient Air Quality
                      </div>
                      <div className="text-xs text-white/90 font-medium truncate max-w-[190px]" title={air.station?.name}>
                        {air.station ? air.station.name : 'Continuous CAAQMS'}
                      </div>
                      <div className="text-[10px] font-mono mt-0.5 flex items-center gap-1">
                        {air.station?.distanceKm ? <span className="text-white/50">{air.station.distanceKm} km ·</span> : null}
                        <span className="text-emerald-300 font-semibold">
                          {air?.source === 'demo'
                            ? 'Demo'
                            : isOffline
                            ? 'Cached (Offline)'
                            : air?.station?.source === 'AQICN'
                            ? 'Live AQICN'
                            : air?.station?.source === 'CPCB'
                            ? 'Live CPCB'
                            : air?.station?.source === 'Diurnal Baseline'
                            ? 'Diurnal Baseline'
                            : 'Live Air'}
                        </span>
                      </div>
                    </div>
                    <LabelPill
                      label={getCategoryName(currentAqi)}
                      variant="accent"
                    />
                  </div>

                  {/* Insufficient Data Notice if < 3 pollutants or missing PM */}
                  {(activePoint?.isInsufficient || air.isInsufficient) && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Insufficient data (min. 3 pollutants with PM2.5 or PM10 required)</span>
                    </div>
                  )}

                  <div className="py-3 flex flex-col items-center text-center relative z-10">
                    <HeroNumber value={currentAqi} unit="AQI" />
                    {/* Official Health Statement */}
                    <p className="text-xs text-white/85 max-w-xs mt-1 italic font-normal">
                      "{activePoint?.healthStatement || air.healthStatement || getHealthStatement(currentAqi)}"
                    </p>
                  </div>

                  {/* Stat Pill */}
                  <div className="mb-3">
                    <StatPill
                      stats={[
                        { label: 'PM 2.5', value: Math.round(currentPm25), unit: 'µg/m³', icon: Wind },
                        { label: 'PM 10', value: Math.round(activePoint?.pm10 || currentPm25 * 1.8), unit: 'µg/m³', icon: Activity },
                        { label: 'Profile', value: personaLabel.toUpperCase() },
                      ]}
                    />
                  </div>

                  {/* AQI Band Mascot Illustration (1.png to 6.png) */}
                  <div className="mt-3 mb-2">
                    <AqiMascot band={currentBand} aqi={currentAqi} />
                  </div>
                </GlassCard>

                {/* Verdict Decision Card */}
                <VerdictCard
                  verdict={verdict}
                  persona={persona}
                  onChangePersona={() => setShowOnboarding(true)}
                />

                {/* Institute Advisory Card (Strictly for 'school' Persona) */}
                {persona === 'school' && (
                  <InstituteCard
                    currentAqi={currentAqi}
                    currentBand={currentBand}
                    currentPm25={currentPm25}
                    hourly={air?.hourly}
                  />
                )}

                {/* 24-Hour Diurnal Timeline */}
                <GlassCard>
                  <div className="mb-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      24-Hour Timeline & Air Windows
                    </h3>
                  </div>
                  <HourlyStrip
                    hourly={air.hourly}
                    bestWindowStartIso={verdict.bestWindow?.startIso}
                    bestWindowEndIso={verdict.bestWindow?.endIso}
                    peakWindowStartIso={verdict.peakWindow?.startIso}
                    peakWindowEndIso={verdict.peakWindow?.endIso}
                    avoidHours={verdict.avoidHours}
                    selectedIso={selectedHour?.iso}
                    onSelectHour={(h) => setSelectedHour(h)}
                  />
                </GlassCard>

                {/* Estimated AQI Exposure Section */}
                <GlassCard>
                  <ExposureSection
                    lat={location.lat}
                    lon={location.lon}
                    hourly={air.hourly}
                    demoMode={demoMode}
                    bandOverride={bandOverride}
                  />
                </GlassCard>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-white/70">
              <p>Unable to retrieve air data. Please check your network connection.</p>
              <button
                type="button"
                onClick={() => loadData(true)}
                className="mt-4 px-4 py-2 bg-white text-stone-900 rounded-xl font-bold text-xs"
              >
                Retry Connection
              </button>
            </div>
          )}
        </main>

        {/* Footer Section - Calculation Methodology strictly here */}
        <footer className="px-6 py-5 pb-24 sm:pb-6 border-t border-white/10 text-center text-xs text-white/50 flex flex-wrap items-center justify-between gap-3 z-10 bg-black/20">
          <div>
            <span>AirWatch • Atmospheric Air Quality Decision Engine</span>
          </div>
          <div className="flex items-center gap-4 sm:pr-20">
            <button
              type="button"
              onClick={() => setShowHowCalculated(true)}
              className="text-white/80 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 underline underline-offset-4 font-medium"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Calculation Methodology</span>
            </button>
            <span className="text-white/40 font-mono text-[11px]">CPCB & AQICN Feeds</span>
          </div>
        </footer>

        {/* --- AI AIR ASSISTANT CHATBOT --- */}
        {air && verdict && (
          <AiAirChatbot
            air={air}
            verdict={verdict}
            persona={persona}
            isOpen={showChatbot}
            onOpenChange={setShowChatbot}
          />
        )}

        {/* --- MODALS --- */}
        {showOnboarding && (
          <OnboardingModal
            currentPersona={persona}
            currentLocation={location}
            onComplete={handleCompleteOnboarding}
            onClose={() => setShowOnboarding(false)}
          />
        )}

        {showHowCalculated && (
          <CalculationDrawer onClose={() => setShowHowCalculated(false)} />
        )}

        {showLocationPicker && (
          <LocationPickerModal
            currentLocationName={location.name}
            onSelectLocation={(loc) => {
              const newLoc = { name: loc.name, lat: loc.lat, lon: loc.lon };
              setLocation(newLoc);
              localStorage.setItem(STORAGE_KEY_LOC, JSON.stringify(newLoc));
              setShowLocationPicker(false);
            }}
            onClose={() => setShowLocationPicker(false)}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
