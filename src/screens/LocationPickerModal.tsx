/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - High Precision Delhi NCR Locality & GPS Picker
 * Fast search and GPS location selector covering all 11 revenue districts
 * and 95+ Delhi neighborhoods.
 */

import React, { useState, useMemo } from 'react';
import {
  ALL_DELHI_LOCATIONS,
  DELHI_DISTRICTS,
  DelhiLocation,
  findNearestDelhiLocation,
  searchDelhiLocations,
} from '../lib/delhiLocations.ts';
import { Search, MapPin, Navigation, X, Check, Compass, Radio } from 'lucide-react';

interface LocationPickerModalProps {
  currentLocationName: string;
  onSelectLocation: (loc: { name: string; lat: number; lon: number; district?: string }) => void;
  onClose: () => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  currentLocationName,
  onSelectLocation,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const filteredLocations = useMemo(() => {
    return searchDelhiLocations(searchQuery, selectedDistrict);
  }, [searchQuery, selectedDistrict]);

  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const { location: nearest, distanceKm } = findNearestDelhiLocation(latitude, longitude);
        setGpsLoading(false);
        onSelectLocation({
          name: nearest.name,
          lat: latitude,
          lon: longitude,
          district: nearest.district,
        });
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission was denied. Please select your area manually.');
        } else {
          setGpsError('Unable to retrieve GPS coordinates. Please select from the list.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-stone-900 border border-white/20 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Select Delhi NCR Locality</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                  {ALL_DELHI_LOCATIONS.length} Areas
                </span>
              </h2>
              <p className="text-[11px] text-white/60">
                11 Delhi Districts & Major Neighborhoods
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & GPS Bar */}
        <div className="p-4 border-b border-white/10 space-y-3 bg-black/20">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Saket, Anand Vihar, Rohini, Dwarka, Karol Bagh..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white placeholder-white/40 focus:outline-hidden focus:border-amber-400 transition-colors"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* GPS Locate Button */}
            <button
              type="button"
              onClick={handleGpsDetect}
              disabled={gpsLoading}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              title="Use Current Device GPS Location"
            >
              <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Use GPS</span>
            </button>
          </div>

          {gpsError && (
            <div className="text-[11px] text-rose-300 bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
              {gpsError}
            </div>
          )}

          {/* District Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {DELHI_DISTRICTS.map((dist) => (
              <button
                key={dist}
                type="button"
                onClick={() => setSelectedDistrict(dist)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  selectedDistrict === dist
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                }`}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>

        {/* Locality Grid List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredLocations.length === 0 ? (
            <div className="text-center py-10 text-white/50 text-xs">
              No matching areas found in {selectedDistrict}. Try another keyword or district filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredLocations.map((loc) => {
                const isSelected =
                  currentLocationName.toLowerCase() === loc.name.toLowerCase() ||
                  currentLocationName.toLowerCase().includes(loc.name.toLowerCase());

                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      onSelectLocation({
                        name: loc.name,
                        lat: loc.lat,
                        lon: loc.lon,
                        district: loc.district,
                      });
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/50'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="flex items-center gap-1.5">
                        <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-white/40'}`} />
                        <span className="font-semibold text-xs text-white truncate">{loc.name}</span>
                      </div>
                      <div className="text-[10px] text-white/50 pl-5 flex items-center gap-1.5 truncate">
                        <span>{loc.district}</span>
                        {loc.cpcbStationNear && <span>• {loc.cpcbStationNear}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-mono">
                        {loc.type}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
