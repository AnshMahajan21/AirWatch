/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AirWatch - Conversational Atmospheric Air Quality Assistant
 * Grounded in real-time CPCB IND-AQI telemetry, multi-pollutant sub-indices,
 * official health statements, and exposure budget.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AirResponse, Persona, PollutantKey, VerdictResponse } from '../types.ts';
import { calculateExposure } from '../lib/exposure.ts';
import { formatWindowRange } from '../lib/bestWindow.ts';
import { getCategoryName, getHealthStatement, POLLUTANT_CONFIG } from '../lib/aqi.ts';
import { Sparkles, Send, X, Bot, User, Loader2, ShieldCheck, Activity, Info } from 'lucide-react';
import { AirWatchLogo } from './AirWatchLogo.tsx';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AiAirChatbotProps {
  air: AirResponse;
  verdict: VerdictResponse;
  persona: Persona;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const QUICK_PROMPTS: Record<Persona, string[]> = {
  general: [
    'Can I go for an outdoor run today?',
    'When is the safest hour to step outside?',
    'What mask should I wear right now?',
    'What is the dominant pollutant today?',
  ],
  school: [
    'Is it safe for outdoor sports & PE today?',
    'Should the morning assembly be moved indoors?',
    'What advice should we give parents for tomorrow?',
    'When is the safest time for toddler recess?',
  ],
  medical: [
    'How high is the respiratory discomfort risk right now?',
    'When is the safest window for a gentle stroll?',
    'Should I run my air purifier on high speed?',
    'What symptoms should trigger medical care today?',
  ],
};

function renderInlineText(text: string, sender: 'user' | 'assistant'): React.ReactNode {
  const tokens = text.split(/(\*\*.*?\*\*|\*[^*]+?\*)/g);

  return tokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      const content = token.slice(2, -2);
      return (
        <strong
          key={i}
          className={`font-semibold ${
            sender === 'user' ? 'text-stone-950 font-bold' : 'text-amber-300 font-semibold'
          }`}
        >
          {content}
        </strong>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 2 && !token.startsWith('**')) {
      const content = token.slice(1, -1);
      return (
        <em key={i} className="italic opacity-90">
          {content}
        </em>
      );
    }
    return token;
  });
}

const FormattedChatMessage: React.FC<{ text: string; sender: 'user' | 'assistant' }> = ({
  text,
  sender,
}) => {
  const normalized = text.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');

  const nodes: React.ReactNode[] = [];
  let pendingListItems: string[] = [];

  const flushList = (key: string) => {
    if (pendingListItems.length > 0) {
      nodes.push(
        <ul key={key} className="space-y-1.5 my-2 pl-0.5">
          {pendingListItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[12px] leading-relaxed">
              <span
                className={`shrink-0 mt-0.5 font-bold ${
                  sender === 'user' ? 'text-stone-950' : 'text-amber-400'
                }`}
              >
                •
              </span>
              <span className="flex-1">
                {renderInlineText(item, sender)}
              </span>
            </li>
          ))}
        </ul>
      );
      pendingListItems = [];
    }
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(`flush-${lineIdx}`);
      return;
    }

    const headerMatch = trimmed.match(/^#{1,4}\s+(.*)$/);
    if (headerMatch) {
      flushList(`flush-${lineIdx}`);
      nodes.push(
        <div
          key={`header-${lineIdx}`}
          className={`font-semibold text-[13px] tracking-tight pb-1 mb-1.5 border-b flex items-center gap-1.5 ${
            sender === 'user'
              ? 'text-stone-950 border-stone-900/20'
              : 'text-amber-300 border-white/10'
          }`}
        >
          {renderInlineText(headerMatch[1], sender)}
        </div>
      );
      return;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      pendingListItems.push(bulletMatch[1]);
      return;
    }

    flushList(`flush-${lineIdx}`);
    nodes.push(
      <p
        key={`p-${lineIdx}`}
        className="text-[12px] leading-relaxed mb-2 last:mb-0"
      >
        {renderInlineText(trimmed, sender)}
      </p>
    );
  });

  flushList('flush-final');

  return <div className="space-y-0.5">{nodes}</div>;
};

export const AiAirChatbot: React.FC<AiAirChatbotProps> = ({
  air,
  verdict,
  persona,
  isOpen: controlledIsOpen,
  onOpenChange,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (onOpenChange) onOpenChange(val);
    else setInternalIsOpen(val);
  };

  const currentExposure = useMemo(() => {
    return calculateExposure(air.hourly || [], 2);
  }, [air.hourly]);

  const dominantKey: PollutantKey = air.current.dominantPollutant || air.dominantPollutant || 'pm25';
  const dominantName = POLLUTANT_CONFIG[dominantKey]?.name || dominantKey.toUpperCase();
  const categoryName = getCategoryName(air.current.aqi);
  const healthStatement = air.current.healthStatement || getHealthStatement(air.current.aqi);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your AirWatch Assistant. Current AQI at ${air.location.name} is **${air.current.aqi} (${categoryName})** with dominant pollutant **${dominantName}**.\n\n*Official CPCB Health Statement: "${healthStatement}"*\n\nYour 2-hour outdoor exposure budget is currently at ${currentExposure.budgetPct}%. How can I help you safely schedule activities today?`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const apiEndpoint = import.meta.env.VITE_API_URL 
        ? `${import.meta.env.VITE_API_URL}/chat` 
        : '/api/chat';

      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          context: {
            location: air.location.name,
            stationName: air.station?.name || 'Continuous Monitoring',
            source: air.station?.source || 'CPCB',
            aqi: air.current.aqi,
            band: air.current.band,
            category: categoryName,
            healthStatement,
            dominantPollutant: dominantName,
            pm25: air.current.pm25,
            pm10: air.current.pm10,
            budgetUsedPercent: currentExposure.budgetPct,
            inhaledDoseUg: currentExposure.pm25Dose,
            remainingMinutes: Math.max(0, Math.round((Math.max(0, 100 - currentExposure.budgetPct) / 100) * 120)),
            persona,
            action: verdict.action,
            headline: verdict.headline,
            bestWindow: verdict.bestWindow,
            peakWindow: verdict.peakWindow,
            avoidHours: verdict.avoidHours,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.reply || generateLocalAnswer(q, air, verdict, persona, currentExposure.budgetPct);
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            sender: 'assistant',
            text: replyText,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('API route unavailable');
      }
    } catch {
      const fallbackReply = generateLocalAnswer(q, air, verdict, persona, currentExposure.budgetPct);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Circular Floating Action Button (FAB) - Present at all times */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-60 w-10 h-10 sm:w-11 sm:h-11 rounded-full text-stone-950 shadow-xl shadow-black/50 border border-white/25 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group ${
          isOpen
            ? 'bg-emerald-500 ring-2 ring-emerald-300 shadow-emerald-500/40'
            : 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 hover:shadow-emerald-500/30'
        }`}
        title={isOpen ? 'Close AI Assistant' : 'Ask AI Assistant'}
        aria-label={isOpen ? 'Close AI Assistant' : 'Ask AI Assistant'}
      >
        <div className="flex items-center justify-center">
          {isOpen ? (
            <X className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-stone-950 transition-transform duration-200" />
          ) : (
            <Sparkles className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-stone-950 transition-transform duration-300 group-hover:rotate-12" />
          )}
        </div>
        {/* Subtle tooltip on hover */}
        <span className="pointer-events-none absolute right-full mr-2.5 px-2.5 py-1 rounded-lg bg-stone-900/95 text-white border border-white/15 text-[11px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-lg backdrop-blur-md hidden sm:block">
          {isOpen ? 'Close AI' : 'Ask AI'}
        </span>
      </button>

      {/* Slide-over Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-end justify-center sm:justify-end p-0 sm:p-4 sm:pb-20 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full sm:max-w-md h-[80vh] sm:h-[580px] mb-16 sm:mb-0 bg-stone-900 border border-white/20 sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden text-white">
            {/* Header with Given Logo Image & Active Telemetry */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <AirWatchLogo className="w-9 h-9 rounded-full ring-1 ring-white/20 shadow-md shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5 leading-none">
                    <span>AirWatch Assistant</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                      Live
                    </span>
                  </h3>
                  <div className="text-[11px] text-white/60 mt-1 flex items-center gap-1.5">
                    <span>{air.location.name}</span>
                    <span>•</span>
                    <span className="font-mono font-semibold text-amber-300">{air.current.aqi} AQI</span>
                    <span>•</span>
                    <span className="text-[10px] text-white/50">{dominantName}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Telemetry Status Strip */}
            <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between text-[11px] text-white/70">
              <span className="truncate max-w-[240px]">
                {categoryName}: <em>{healthStatement}</em>
              </span>
              <span className="font-mono text-amber-400 shrink-0 ml-2">
                {currentExposure.budgetPct}% Budget
              </span>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'assistant' && (
                    <AirWatchLogo className="w-6 h-6 rounded-full ring-1 ring-white/20 shrink-0 mt-0.5" />
                  )}

                  <div
                    className={`max-w-[84%] p-3.5 rounded-2xl leading-relaxed shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-amber-500 text-stone-950 font-medium rounded-tr-xs'
                        : 'bg-white/10 text-white/90 border border-white/10 rounded-tl-xs backdrop-blur-xs'
                    }`}
                  >
                    <FormattedChatMessage text={m.text} sender={m.sender} />
                    <div className={`text-[9px] mt-1.5 text-right font-mono ${m.sender === 'user' ? 'text-stone-900/60' : 'text-white/40'}`}>
                      {m.timestamp}
                    </div>
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-white/60 text-xs py-1.5 px-2 bg-white/5 rounded-xl border border-white/10 w-fit">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Synthesizing multi-pollutant telemetry...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="p-2.5 border-t border-white/10 bg-black/25 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_PROMPTS[persona]?.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 border border-white/15 text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-3 border-t border-white/10 bg-black/40 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about outdoor safety, masks, cleanest windows..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-xs text-white placeholder-white/40 focus:outline-hidden focus:border-amber-400 transition-colors"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 flex items-center justify-center cursor-pointer transition-colors shrink-0 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Grounded intelligent expert fallback function
function generateLocalAnswer(
  question: string,
  air: AirResponse,
  verdict: VerdictResponse,
  persona: Persona,
  budgetPct: number = 50
): string {
  const q = question.toLowerCase();
  const aqi = air.current.aqi;
  const loc = air.location.name;
  const dominantKey = air.current.dominantPollutant || air.dominantPollutant || 'pm25';
  const dominantName = POLLUTANT_CONFIG[dominantKey]?.name || 'PM2.5';
  const pm25 = Math.round(air.current.pm25 || 60);
  const pm10 = Math.round(air.current.pm10 || 120);
  const category = getCategoryName(aqi);
  const healthStatement = getHealthStatement(aqi);

  const bestTime = verdict.bestWindow
    ? formatWindowRange(verdict.bestWindow.startIso, verdict.bestWindow.endIso)
    : '1:00 PM – 4:00 PM';
  const peakTime = verdict.peakWindow
    ? formatWindowRange(verdict.peakWindow.startIso, verdict.peakWindow.endIso)
    : '7:00 PM – 10:00 PM';

  // 1. Yoga vs Cricket / Outside vs Inside Activities
  if (
    (q.includes('yoga') && (q.includes('cricket') || q.includes('outside') || q.includes('outdoor'))) ||
    (q.includes('inside') && q.includes('outside')) ||
    (q.includes('yoga') && q.includes('sports'))
  ) {
    if (aqi > 100) {
      return `Definitely choose **indoor yoga** over outdoor cricket today in ${loc}.\n\n• **Current Air Status**: AQI is **${aqi} (${category})** with dominant **${dominantName}** (${pm25} µg/m³).\n• **Aerobic Risk**: Playing cricket outdoors involves high pulmonary ventilation, forcing fine particulates deep into your lower airways.\n• **Recommendation**: Practice yoga indoors with windows shut and an air purifier running. If cricket is essential, confine play strictly to the afternoon solar window (**${bestTime}**) and avoid evening inversion (**${peakTime}**).`;
    }
    return `In ${loc}, current air is **${category}** (${aqi} AQI). Both indoor yoga and outdoor cricket can proceed safely today without restrictions!`;
  }

  // 2. Yoga / Pranayama / Deep Breathing
  if (q.includes('yoga') || q.includes('pranayama') || q.includes('breath') || q.includes('meditation')) {
    if (aqi > 100) {
      return `Practice yoga and pranayama **indoors** today in ${loc} (AQI: **${aqi} • ${category}**). Deep breathing techniques outdoors during moderate or poor air multiply particulate intake into your lungs. Keep windows sealed and run an indoor HEPA filter if available.`;
    }
    return `Air quality in ${loc} is **${category}** (${aqi} AQI). Morning yoga and outdoor pranayama in parks or gardens are safe today!`;
  }

  // 3. School Sports, P.E. Classes, Recess & Assemblies
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
      return `All outdoor sports and P.E. classes should be **strictly suspended** in ${loc} today.\n\n• **Current AQI**: ${aqi} (Severe / Very Poor).\n• **Action**: Move all physical training and recess indoors to classrooms or gymnasiums.\n• **Vulnerability**: Children inhale up to 50% more air per kg of body weight during exertion, causing rapid bronchial inflammation in high PM2.5 (${pm25} µg/m³).`;
    } else if (aqi > 200) {
      return `Outdoor sports and P.E. should be **canceled or moved indoors** in ${loc} (AQI **${aqi} • Poor**).\n\n• **Guidance**: Prohibit strenuous running, football, and cricket outside. Substitute with indoor wellness lectures, table tennis, or yoga.\n• **Transit**: Ensure students wear N95 masks during arrival and dismissal.`;
    } else if (aqi > 100) {
      return `Exercise **caution for outdoor sports & P.E.** in ${loc} today (AQI **${aqi} • ${category}**).\n\n• **Guidance**: Light drills are acceptable, but cap high-cardio sprints at 20–30 minutes.\n• **Safest Timing**: If outdoor sports periods are scheduled, prioritize the midday window (**${bestTime}**) when thermal boundary expansion lowers pollution by ~35%.\n• **Medical Exemption**: Students with asthma or wheezing should be excused from open-air cardio.`;
    }
    return `In ${loc}, air quality is **${category}** (${aqi} AQI). Outdoor sports, P.E. classes, and open playground recess are completely safe today!`;
  }

  // 4. Running, Jogging, Cycling, Walking & Workouts
  if (
    q.includes('run') ||
    q.includes('jog') ||
    q.includes('exercise') ||
    q.includes('workout') ||
    q.includes('walk') ||
    q.includes('cycle') ||
    q.includes('cycling') ||
    q.includes('gym') ||
    q.includes('cardio')
  ) {
    if (aqi > 200 || budgetPct >= 100) {
      return `At **${aqi} AQI (${category})** in ${loc} with **${budgetPct}%** of your daily safe exposure budget consumed, outdoor running is not advised. Heavy respiration draws fine ${dominantName} particles deep into pulmonary alveoli. Please move workouts indoors to a gym or home, or if essential, schedule light movement during the afternoon convective window (**${bestTime}**). Strictly avoid peak evening inversion (**${peakTime}**).`;
    } else if (aqi > 100) {
      return `Air quality in ${loc} is **${category}** (${aqi} AQI, dominant: ${dominantName}). You may exercise outside with caution, but target the cleanest diurnal window (**${bestTime}**) when solar heating deepens boundary layer mixing. Steer clear of peak hazard hours (**${peakTime}**).`;
    }
    return `Air quality in ${loc} is **${category}** (${aqi} AQI). Conditions are favorable for outdoor running, cycling, and sports without restrictions!`;
  }

  // 5. Masks & Respirators
  if (q.includes('mask') || q.includes('n95') || q.includes('wear') || q.includes('respirator') || q.includes('protection')) {
    if (aqi > 200) {
      return `A certified, well-fitted **N95 or FFP2 respirator** is strongly recommended in ${loc} today. Surgical and cloth masks do not filter fine ${dominantName} particles (${pm25} µg/m³). Ensure the nose wire is firmly contoured.`;
    } else if (aqi > 100) {
      return `Commuters and sensitive individuals in ${loc} should wear an N95 mask near traffic junctions. Casual park walkers away from busy roads may manage without if not in vulnerable health categories.`;
    }
    return `No mask is necessary in ${loc} today under **${category}** air quality (${aqi} AQI).`;
  }

  // 6. Windows, Purifiers & Indoor Ventilation
  if (q.includes('window') || q.includes('ventilate') || q.includes('purifier') || q.includes('indoor') || q.includes('ac')) {
    if (aqi > 150) {
      return `Keep residential and office windows closed in ${loc} today, especially during the nocturnal inversion (**${peakTime}**). Run indoor HEPA purifiers on medium-to-high speed. Brief cross-ventilation is acceptable only in the early afternoon (**${bestTime}**).`;
    }
    return `Opening windows is safe during the afternoon hours (**${bestTime}**). Run purifiers if anyone in the household has respiratory sensitivities.`;
  }

  // 7. Sensitive Health Conditions (Asthma, Elderly, Pregnancy, Children)
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
    return `**Health Advisory for Vulnerable Groups in ${loc}** (AQI **${aqi} • ${category}**):\n\n• *CPCB Health Directive*: "${healthStatement}"\n• **Protection**: Keep sensitive family members indoors with HEPA air filtration running.\n• **Preparedness**: Maintain quick-relief inhalers nearby. Strictly avoid outdoor transit during evening inversion hours (**${peakTime}**).`;
  }

  // 8. Safest Hours & Diurnal Timing
  if (q.includes('safest') || q.includes('time') || q.includes('when') || q.includes('hour') || q.includes('schedule')) {
    return `**Diurnal Timing Advisory for ${loc}**:\n\n• **Safest Window**: **${bestTime}** (solar heating expands the atmospheric boundary layer, diluting particulate concentrations by ~35%).\n• **Hazardous Inversion**: **${peakTime}** (cooling surface air traps smoke and vehicle emissions near ground level).\n• Schedule outdoor errands and workouts exclusively during the midday convective window.`;
  }

  // 9. Dominant Pollutant & Standards
  if (q.includes('dominant') || q.includes('pollutant') || q.includes('pm2.5') || q.includes('pm10') || q.includes('sub-index')) {
    return `The dominant pollutant in ${loc} right now is **${dominantName}** (PM2.5: ${pm25} µg/m³, PM10: ${pm10} µg/m³; AQI Sub-index: ${aqi}). Under CPCB standards, composite AQI represents the highest single sub-index. Official health classification: **${category}** (*"${healthStatement}"*).`;
  }

  // 10. Comprehensive Contextual Fallback
  return `**Air Quality Assessment for ${loc}** (AQI **${aqi} • ${category}**):\n\n• **Dominant Pollutant**: **${dominantName}** (${pm25} µg/m³). *"${healthStatement}"*\n• **Guidance**: ${aqi > 150 ? 'Move high-intensity cardio indoors and keep windows closed during smog peaks.' : 'Outdoor routines are acceptable with normal precautions.'}\n• **Diurnal Windows**: Safest outdoor window is **${bestTime}**, while peak hazard inversion occurs at **${peakTime}**.`;
}
