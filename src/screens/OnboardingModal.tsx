/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Profile & Location Setup
 * Configures one of three specialized profiles:
 * 1. General (Default normal public access)
 * 2. Parent / School / Institute (Children & campus safety)
 * 3. Medical Profile (Asthma, respiratory, cardiovascular)
 * English only.
 */

import React, { useState, useMemo } from 'react';
import { Persona, PresetLocation } from '../types.ts';
import {
  ALL_DELHI_LOCATIONS,
  findNearestDelhiLocation,
  searchDelhiLocations,
} from '../lib/delhiLocations.ts';
import { User, School, HeartPulse, MapPin, Search, Check, Sparkles, Navigation } from 'lucide-react';

interface OnboardingModalProps {
  currentPersona: Persona;
  currentLocation: PresetLocation | { name: string; lat: number; lon: number };
  onComplete: (persona: Persona, location: { name: string; lat: number; lon: number }) => void;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  currentPersona,
  currentLocation,
  onComplete,
  onClose,
}) => {
  const [step, setStep] = useState<'persona' | 'location'>('persona');
  const [selectedPersona, setSelectedPersona] = useState<Persona>(currentPersona || 'general');
  const [selectedLoc, setSelectedLoc] = useState<{ name: string; lat: number; lon: number }>(currentLocation);
  const [searchQuery, setSearchQuery] = useState('');
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const personas = [
    {
      id: 'general' as Persona,
      title: 'General (Default)',
      tagline: 'Standard profile for everyday outdoor movement, errands, fitness, and daily commutes.',
      icon: User,
      bullets: [
        'Safe outdoor workout & jogging windows',
        'Commuter mask & N95 recommendations',
        'Home ventilation and window advice',
      ],
      color: 'from-blue-500/20 to-cyan-500/20 border-blue-400/30',
    },
    {
      id: 'school' as Persona,
      title: 'Parent / School / Institute',
      tagline: 'Specifically designed for managing children, students, sports, and campus safety.',
      icon: School,
      bullets: [
        'Clearance for assemblies, PE, and outdoor recess',
        'Dedicated School & Campus Safety guidelines',
        'Shareable 8-bit advisory cards for parent groups',
      ],
      color: 'from-amber-500/20 to-orange-500/20 border-amber-400/30',
    },
    {
      id: 'medical' as Persona,
      title: 'Medical Profile',
      tagline: 'Customized for people with illness, asthma, respiratory, heart disease, and high-risk health needs.',
      icon: HeartPulse,
      bullets: [
        'Safest low-particulate window of the day',
        'Early morning thermal inversion warnings',
        'Rescue inhaler and symptom monitoring triggers',
      ],
      color: 'from-rose-500/20 to-pink-500/20 border-rose-400/30',
    },
  ];

  const filteredPresets = useMemo(() => {
    return searchDelhiLocations(searchQuery);
  }, [searchQuery]);

  const handleRequestGeo = () => {
    setGeoLocating(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setGeoLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const { location: nearest } = findNearestDelhiLocation(latitude, longitude);

        const loc = {
          name: nearest.name,
          lat: latitude,
          lon: longitude,
        };
        setSelectedLoc(loc);
        setGeoLocating(false);
        onComplete(selectedPersona, loc);
      },
      (err) => {
        console.warn('Geolocation denied or timed out:', err);
        setGeoError('Location permission denied. Please select your Delhi NCR area below.');
        setGeoLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-stone-900 border border-white/20 rounded-[32px] shadow-2xl p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto">
        {/* Step indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-serif text-lg font-bold">AirWatch Profile Setup</span>
          </div>
          <div className="text-xs font-mono text-white/50 uppercase tracking-wider">
            Step {step === 'persona' ? '1 of 2' : '2 of 2'}
          </div>
        </div>

        {step === 'persona' ? (
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                Choose Your Active Profile
              </h2>
              <p className="text-xs sm:text-sm text-white/70 mt-1">
                Advisories and safety limits are customized to your specific daily needs.
              </p>
            </div>

            <div className="space-y-3">
              {personas.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPersona(p.id)}
                    className={`
                      w-full text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative
                      bg-gradient-to-r ${p.color}
                      ${isSelected
                        ? 'border-white ring-2 ring-white/60 shadow-lg scale-[1.01]'
                        : 'border-white/10 hover:border-white/30 opacity-80 hover:opacity-100'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm sm:text-base text-white">
                            {p.title}
                          </div>
                          <div className="text-xs text-white/80 mt-0.5">{p.tagline}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-white text-stone-900 flex items-center justify-center shrink-0 ml-2">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] text-white/80">
                      {p.bullets.map((b, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span className="line-clamp-1">{b}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep('location')}
                className="px-6 py-3 rounded-xl bg-white text-stone-900 font-bold hover:bg-stone-100 transition-all cursor-pointer shadow-lg flex items-center gap-2 text-sm"
              >
                <span>Continue to Location</span>
                <Navigation className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                Select Your Delhi NCR Location
              </h2>
              <p className="text-xs sm:text-sm text-white/70 mt-1">
                Real-time CPCB and AQICN continuous ambient air monitoring stations.
              </p>
            </div>

            {/* Geolocation CTA */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm">Use Current GPS Location</div>
                  <div className="text-xs text-white/70">Detect nearest monitoring station</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRequestGeo}
                disabled={geoLocating}
                className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {geoLocating ? 'Detecting...' : 'Detect GPS'}
              </button>
            </div>

            {geoError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-xs text-rose-200">
                {geoError}
              </div>
            )}

            {/* Preset Selector */}
            <div>
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3 top-3 text-white/50" />
                <input
                  type="text"
                  placeholder="Search NCR area (e.g. Anand Vihar, Noida, Gurugram)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                {filteredPresets.map((preset) => {
                  const isSelected = selectedLoc.name.toLowerCase().includes(preset.name.toLowerCase());
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        setSelectedLoc({
                          name: preset.name,
                          lat: preset.lat,
                          lon: preset.lon,
                        })
                      }
                      className={`
                        p-3 rounded-xl border text-left transition-all cursor-pointer
                        ${isSelected
                          ? 'bg-white text-stone-900 border-white font-bold shadow-md'
                          : 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10'
                        }
                      `}
                    >
                      <div className="text-sm font-semibold truncate">{preset.name}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-stone-600' : 'text-white/50'}`}>
                        {preset.district}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep('persona')}
                className="px-4 py-2 text-sm text-white/70 hover:text-white cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => onComplete(selectedPersona, selectedLoc)}
                className="px-6 py-3 rounded-xl bg-white text-stone-900 font-bold hover:bg-stone-100 transition-all cursor-pointer shadow-lg flex items-center gap-2 text-sm"
              >
                <span>Save & Enter</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
