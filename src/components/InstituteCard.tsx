import React, { useState } from 'react';
import { Band, HourPoint } from '../types.ts';
import { GlassCard } from '../design/GlassCard.tsx';
import {
  School,
  Sun,
  Activity,
  ShieldAlert,
  Volume2,
  Coffee,
  Trophy,
  Bus,
  Copy,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface InstituteCardProps {
  currentAqi: number;
  currentBand: Band;
  currentPm25: number;
  hourly?: HourPoint[];
  className?: string;
}

interface ActivityGuideline {
  id: string;
  title: string;
  timing: string;
  icon: React.ElementType;
  status: 'allowed' | 'restricted' | 'banned';
  statusLabel: string;
  recommendation: string;
  notes: string;
}

export const InstituteCard: React.FC<InstituteCardProps> = ({
  currentAqi,
  currentBand,
  currentPm25,
  hourly = [],
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  // Derive guidelines based on current band
  const getGuidelines = (band: Band, aqi: number): ActivityGuideline[] => {
    switch (band) {
      case 'good':
        return [
          {
            id: 'assembly',
            title: 'Morning Prayer & Assembly',
            timing: '07:30 AM – 08:30 AM',
            icon: Volume2,
            status: 'allowed',
            statusLabel: 'Allowed Outdoors',
            recommendation: 'Full open-ground assembly and morning prayers permitted.',
            notes: 'Ideal atmospheric conditions; deep breathing & yoga routines encouraged.',
          },
          {
            id: 'recess',
            title: 'Recess & Free Play Break',
            timing: '10:30 AM – 11:30 AM',
            icon: Coffee,
            status: 'allowed',
            statusLabel: 'Unrestricted Playground Play',
            recommendation: 'Open playground play, tag, and courtyard games fully permitted.',
            notes: 'Normal hydration breaks.',
          },
          {
            id: 'sports',
            title: 'Outdoor Sports & P.E. Classes',
            timing: 'All Day (Weather Permitting)',
            icon: Trophy,
            status: 'allowed',
            statusLabel: 'All Outdoor Sports Permitted',
            recommendation: 'Competitive football, cricket, athletic sprints, and fitness drills allowed.',
            notes: 'Full sports curriculum can proceed without air restrictions.',
          },
          {
            id: 'transit',
            title: 'Campus Transit & Gate Dismissal',
            timing: 'Morning Arrival & Afternoon Dispersal',
            icon: Bus,
            status: 'allowed',
            statusLabel: 'Standard Protocol',
            recommendation: 'Normal arrival and bus boarding procedures.',
            notes: 'No masks or restrictions required.',
          },
        ];

      case 'satisfactory':
        return [
          {
            id: 'assembly',
            title: 'Morning Prayer & Assembly',
            timing: '07:30 AM – 08:30 AM',
            icon: Volume2,
            status: 'allowed',
            statusLabel: 'Allowed Outdoors (Max 25m)',
            recommendation: 'Outdoor assembly permitted. Keep open-ground duration under 25–30 minutes.',
            notes: 'Advise sensitive/asthmatic students to step into shade if needed.',
          },
          {
            id: 'recess',
            title: 'Recess & Free Play Break',
            timing: '10:30 AM – 11:30 AM',
            icon: Coffee,
            status: 'allowed',
            statusLabel: 'Normal Outdoor Recess',
            recommendation: 'Open playground play allowed with standard supervision.',
            notes: 'Ensure drinking water stations are readily accessible.',
          },
          {
            id: 'sports',
            title: 'Outdoor Sports & P.E. Classes',
            timing: 'Morning & Afternoon',
            icon: Trophy,
            status: 'allowed',
            statusLabel: 'Regular Sports Allowed',
            recommendation: 'Outdoor sports permitted. Allow frequent hydration rests for high-intensity cardio.',
            notes: 'Students with chronic cough or dust allergies should be excused from heavy sprints.',
          },
          {
            id: 'transit',
            title: 'Campus Transit & Gate Dismissal',
            timing: 'Morning Arrival & Afternoon Dispersal',
            icon: Bus,
            status: 'allowed',
            statusLabel: 'Standard Protocol',
            recommendation: 'Routine arrival & bus bay operations.',
            notes: 'Inhaler availability in campus infirmary advised.',
          },
        ];

      case 'moderate':
        return [
          {
            id: 'assembly',
            title: 'Morning Prayer & Assembly',
            timing: '07:30 AM – 08:30 AM',
            icon: Volume2,
            status: 'restricted',
            statusLabel: 'Shorten to <15m or Shift Indoors',
            recommendation: 'Limit outdoor assembly to max 15 minutes. Nursery & Primary classes should assemble indoors.',
            notes: 'Delhi morning inversion traps smoke; shift prayer to classroom intercom if hazy.',
          },
          {
            id: 'recess',
            title: 'Recess & Free Play Break',
            timing: '10:30 AM – 11:30 AM',
            icon: Coffee,
            status: 'restricted',
            statusLabel: 'Light Play Only (No High Exertion)',
            recommendation: 'Gentle outdoor play and courtyard walking permitted. Discourage high-speed running games.',
            notes: 'Keep library and indoor game rooms open for students with respiratory sensitivity.',
          },
          {
            id: 'sports',
            title: 'Outdoor Sports & P.E. Classes',
            timing: '12:00 PM – 03:00 PM (Safest Window)',
            icon: Trophy,
            status: 'restricted',
            statusLabel: 'Modify Drills / Move High Cardio Indoors',
            recommendation: 'Suspend cross-country & endurance sprints outdoors. Skill drills, table tennis, and yoga encouraged.',
            notes: 'If outdoor sports are scheduled, prioritize the midday solar dispersion window (1 PM – 3 PM).',
          },
          {
            id: 'transit',
            title: 'Campus Transit & Gate Dismissal',
            timing: 'Morning Arrival & Afternoon Dispersal',
            icon: Bus,
            status: 'restricted',
            statusLabel: 'Sensitive Mask Advisory',
            recommendation: 'Cloth or surgical masks recommended for students with asthma during morning bus transit.',
            notes: 'Keep bus windows rolled up along busy arterial traffic corridors.',
          },
        ];

      case 'poor':
        return [
          {
            id: 'assembly',
            title: 'Morning Prayer & Assembly',
            timing: '07:30 AM – 08:30 AM',
            icon: Volume2,
            status: 'banned',
            statusLabel: 'Strictly Move Indoors',
            recommendation: 'Conduct morning prayers inside classrooms via PA system or auditorium with windows closed.',
            notes: 'Do not assemble children on open grounds during morning cold inversion.',
          },
          {
            id: 'recess',
            title: 'Recess & Free Play Break',
            timing: '10:30 AM – 11:30 AM',
            icon: Coffee,
            status: 'restricted',
            statusLabel: 'Indoor Recess Recommended',
            recommendation: 'Restrict students to indoor corridors, classrooms, and covered courtyards. No running games.',
            notes: 'Heavy breathing in PM2.5 > 100 µg/m³ causes airway irritation.',
          },
          {
            id: 'sports',
            title: 'Outdoor Sports & P.E. Classes',
            timing: 'All Day',
            icon: Trophy,
            status: 'banned',
            statusLabel: 'All Outdoor Sports Suspended',
            recommendation: 'Cancel all outdoor sports periods, football, and cricket matches. Move P.E. to indoor gymnasium.',
            notes: 'Substitute with indoor physical fitness, chess, yoga, or wellness lectures.',
          },
          {
            id: 'transit',
            title: 'Campus Transit & Gate Dismissal',
            timing: 'Morning Arrival & Afternoon Dispersal',
            icon: Bus,
            status: 'restricted',
            statusLabel: 'Masking Advised for All',
            recommendation: 'Advise all students, security staff, and bus monitors to wear masks during peak commute.',
            notes: 'Keep gate dismissal brisk to minimize open-air pickup waiting time.',
          },
        ];

      case 'very_poor':
        return [
          {
            id: 'assembly',
            title: 'Morning Prayer & Assembly',
            timing: '07:30 AM – 08:30 AM',
            icon: Volume2,
            status: 'banned',
            statusLabel: 'Outdoor Assembly Prohibited',
            recommendation: 'Mandatory indoor morning prayer inside classrooms. Zero outdoor congregation permitted.',
            notes: 'Severe respiratory risk for growing lungs; windows must remain closed.',
          },
          {
            id: 'recess',
            title: 'Recess & Free Play Break',
            timing: '10:30 AM – 11:30 AM',
            icon: Coffee,
            status: 'banned',
            statusLabel: 'Strictly Indoors Only',
            recommendation: 'Mandatory classroom recess. Students must remain indoors; supervise corridor doors.',
            notes: 'Running outside during Very Poor air triggers acute pediatric bronchospasms.',
          },
          {
            id: 'sports',
            title: 'Outdoor Sports & P.E. Classes',
            timing: 'All Day',
            icon: Trophy,
            status: 'banned',
            statusLabel: 'Completely Suspended',
            recommendation: 'Zero outdoor athletics or training. Strictly prohibit sports grounds and athletic meets.',
            notes: 'Postpone inter-school tournaments; replace with indoor classroom instruction.',
          },
          {
            id: 'transit',
            title: 'Campus Transit & Gate Dismissal',
            timing: 'Morning Arrival & Afternoon Dispersal',
            icon: Bus,
            status: 'banned',
            statusLabel: 'N95 / FFP2 Mandatory',
            recommendation: 'Mandatory N95 / FFP2 respirators for gate guards, bus conductors, and students.',
            notes: 'Enforce CAQM Stage II DG set ban on school campus premises.',
          },
        ];

      case 'severe':
      default:
        return [
          {
            id: 'assembly',
            title: 'Morning Prayer & Assembly',
            timing: '07:30 AM – 08:30 AM',
            icon: Volume2,
            status: 'banned',
            statusLabel: 'Strictly Prohibited by CAQM',
            recommendation: 'Emergency air hazard. All outdoor events and assemblies legally prohibited under GRAP.',
            notes: 'Check Delhi Directorate of Education (DoE) notification for school closure / hybrid mode.',
          },
          {
            id: 'recess',
            title: 'Recess & Free Play Break',
            timing: '10:30 AM – 11:30 AM',
            icon: Coffee,
            status: 'banned',
            statusLabel: 'Strict Indoor Confinement',
            recommendation: 'Students must remain strictly confined inside closed rooms with air purifiers active if present.',
            notes: 'Keep doors sealed; avoid outdoor passage between school blocks.',
          },
          {
            id: 'sports',
            title: 'Outdoor Sports & P.E. Classes',
            timing: 'All Day',
            icon: Trophy,
            status: 'banned',
            statusLabel: 'Strictly Prohibited by Law',
            recommendation: 'All physical training, sports, and outdoor activities prohibited. Severe health emergency.',
            notes: 'Exercising in Severe air causes immediate pulmonary inflammation.',
          },
          {
            id: 'transit',
            title: 'Campus Transit & Gate Dismissal',
            timing: 'Emergency Protocol',
            icon: Bus,
            status: 'banned',
            statusLabel: 'GRAP Stage Directive Active',
            recommendation: 'Strict enforcement of CAQM/DoE hybrid school orders (Primary/Middle closed depending on stage).',
            notes: 'Full N95 compliance for essential campus maintenance and security staff.',
          },
        ];
    }
  };

  const guidelines = getGuidelines(currentBand, currentAqi);

  // Status Badge styles
  const getBadgeStyle = (status: ActivityGuideline['status']) => {
    switch (status) {
      case 'allowed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'restricted':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'banned':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  // Official DoE / CAQM Directive Status
  const getGrapDirective = (aqi: number) => {
    if (aqi > 450) {
      return {
        stage: 'CAQM GRAP Stage IV (Emergency Directive)',
        summary: 'Primary & Secondary schools shift to hybrid/online mode as mandated by Delhi DoE.',
        color: 'border-rose-500/60 bg-rose-950/70 text-rose-200',
      };
    }
    if (aqi >= 401) {
      return {
        stage: 'CAQM GRAP Stage III (Severe)',
        summary: 'In-person classes for primary grades (up to Class V) discontinued. Strict ban on open sports.',
        color: 'border-rose-500/50 bg-rose-950/50 text-rose-200',
      };
    }
    if (aqi >= 301) {
      return {
        stage: 'CAQM GRAP Stage II (Very Poor)',
        summary: 'Diesel generators banned for school events. Daily campus water sprinkling mandated.',
        color: 'border-purple-500/40 bg-purple-950/50 text-purple-200',
      };
    }
    if (aqi >= 201) {
      return {
        stage: 'CAQM GRAP Stage I (Poor)',
        summary: 'Dust suppression mandated. Open burning strictly banned around school perimeter.',
        color: 'border-amber-500/40 bg-amber-950/40 text-amber-200',
      };
    }
    return {
      stage: 'Standard Campus Hygiene & Wellness',
      summary: 'Air quality within acceptable thresholds. Follow routine physical education schedule.',
      color: 'border-emerald-500/30 bg-emerald-950/30 text-emerald-200',
    };
  };

  const directive = getGrapDirective(currentAqi);

  // Copy advisory for staff briefing
  const handleCopyBriefing = () => {
    const text = `📋 AIRWATCH CAMPUS & SCHOOL ADVISORY
Date: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
Current AQI: ${currentAqi} (${currentBand.toUpperCase()}) | PM2.5: ${Math.round(currentPm25)} µg/m³
Government Directive: ${directive.stage}

ACTIVITY DIRECTIVES:
• MORNING PRAYER / ASSEMBLY: ${guidelines[0].statusLabel}
  ${guidelines[0].recommendation}
• RECESS & FREE PLAY: ${guidelines[1].statusLabel}
  ${guidelines[1].recommendation}
• OUTDOOR SPORTS & P.E.: ${guidelines[2].statusLabel}
  ${guidelines[2].recommendation}
• COMMUTE & GATE PROTOCOL: ${guidelines[3].statusLabel}
  ${guidelines[3].recommendation}

Generated via AirWatch (CPCB Standard Alignment)`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <GlassCard className={`space-y-4 ${className}`}>
      {/* Header with Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base sm:text-lg font-bold text-white tracking-tight">
                Institute & School Campus Advisory
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 uppercase font-semibold">
                Institute Profile
              </span>
            </div>
            <p className="text-xs text-white/60">
              Operational safety protocols for principals, teachers, and physical education directors
            </p>
          </div>
        </div>

        {/* Copy Briefing Button */}
        <button
          type="button"
          onClick={handleCopyBriefing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Copy formatted summary for teacher & staff morning notice"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-white/70" />
              <span>Copy Staff Briefing</span>
            </>
          )}
        </button>
      </div>

      {/* Official Government Directive Banner */}
      <div className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${directive.color}`}>
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold tracking-wide">{directive.stage}</div>
          <div className="text-[11px] opacity-90 mt-0.5">{directive.summary}</div>
        </div>
      </div>

      {/* 4 Core Campus Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {guidelines.map((item) => {
          const Icon = item.icon;
          const badgeClass = getBadgeStyle(item.status);

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-black/30 border border-white/15 backdrop-blur-md flex flex-col justify-between hover:border-white/25 transition-colors shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2.5 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white/10 text-white shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{item.title}</h4>
                      <span className="text-[10px] text-amber-300/80 font-mono font-medium block mt-0.5">{item.timing}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 text-center leading-none ${badgeClass}`}
                  >
                    {item.statusLabel}
                  </span>
                </div>

                <p className="text-xs text-white/95 font-medium mt-1.5 leading-relaxed">
                  {item.recommendation}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-start gap-2 text-[11px] text-white/70 leading-normal">
                <Info className="w-3.5 h-3.5 text-white/50 shrink-0 mt-0.5" />
                <span className="break-words">{item.notes}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Safe Afternoon Window Tip */}
      {currentBand !== 'good' && currentBand !== 'satisfactory' && (
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/70 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Diurnal Advisory for P.E. Dept:</strong> Atmospheric boundary layer expands between <strong>01:00 PM – 03:30 PM</strong>, cutting pollution by ~35%. Reschedule any essential outdoor movement to this solar window.
            </span>
          </div>
        </div>
      )}
    </GlassCard>
  );
};
