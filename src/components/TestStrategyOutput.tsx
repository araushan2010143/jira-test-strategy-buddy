import { useState } from 'react';
import {
  Target, Globe, Crosshair, Wrench, Package, Users,
  CheckSquare, AlertTriangle, ChevronDown, ChevronUp,
  Copy, Printer, Check, Calendar, Clock, RefreshCw
} from 'lucide-react';
import type { GeneratedStrategy, SchedulePhase } from '../types';

interface Props {
  result: GeneratedStrategy;
  onReset: () => void;
}

interface SectionConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const SECTIONS: SectionConfig[] = [
  { id: 'objective',        title: 'Objective',            icon: <Target size={16} />,      color: 'text-violet-600 dark:text-violet-400', bgColor: 'bg-violet-100 dark:bg-violet-900/40' },
  { id: 'scope',            title: 'Scope',                icon: <Globe size={16} />,       color: 'text-blue-600 dark:text-blue-400',    bgColor: 'bg-blue-100 dark:bg-blue-900/40' },
  { id: 'focusAreas',       title: 'Focus Areas',          icon: <Crosshair size={16} />,   color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-100 dark:bg-emerald-900/40' },
  { id: 'approach',         title: 'Approach',             icon: <Wrench size={16} />,      color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/40' },
  { id: 'deliverables',     title: 'Deliverables',         icon: <Package size={16} />,     color: 'text-pink-600 dark:text-pink-400',    bgColor: 'bg-pink-100 dark:bg-pink-900/40' },
  { id: 'teamAndSchedule',  title: 'Team & Schedule',      icon: <Users size={16} />,       color: 'text-cyan-600 dark:text-cyan-400',    bgColor: 'bg-cyan-100 dark:bg-cyan-900/40' },
  { id: 'entryExitCriteria',title: 'Entry & Exit Criteria',icon: <CheckSquare size={16} />, color: 'text-teal-600 dark:text-teal-400',   bgColor: 'bg-teal-100 dark:bg-teal-900/40' },
  { id: 'risks',            title: 'Risks',                icon: <AlertTriangle size={16} />,color: 'text-red-600 dark:text-red-400',    bgColor: 'bg-red-100 dark:bg-red-900/40' },
];

function BulletList({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${color.replace('text-', 'bg-').split(' ')[0]}`} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function SectionCard({ config, children, defaultOpen = true }: {
  config: SectionConfig;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="strategy-section">
      <div className="strategy-section-header" onClick={() => setOpen(o => !o)}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bgColor}`}>
          <span className={config.color}>{config.icon}</span>
        </div>
        <h3 className="flex-1 font-semibold text-sm text-slate-900 dark:text-slate-100">{config.title}</h3>
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </div>
      {open && <div className="px-5 py-4 animate-fade-in">{children}</div>}
    </div>
  );
}

export default function TestStrategyOutput({ result, onReset }: Props) {
  const [copied, setCopied] = useState(false);
  const { strategy, ticketId, ticketSummary, generatedAt } = result;

  const handleCopy = async () => {
    const text = formatAsText(result);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => window.print();

  return (
    <div className="max-w-3xl mx-auto w-full space-y-4 animate-slide-up">
      {/* Result header */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                {ticketId}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Clock size={11} />
                {new Date(generatedAt).toLocaleString()}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{ticketSummary}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Generated with GROQ AI · RICE-POT · B.L.A.S.T. Framework
            </p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button onClick={onReset} className="btn-secondary">
              <RefreshCw size={14} />
              <span className="hidden sm:inline">New</span>
            </button>
            <button onClick={handleCopy} className="btn-secondary">
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button onClick={handlePrint} className="btn-primary">
              <Printer size={14} />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Objective */}
      <SectionCard config={SECTIONS[0]}>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{strategy.objective}</p>
      </SectionCard>

      {/* Scope */}
      <SectionCard config={SECTIONS[1]}>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2.5">In Scope</h4>
            <BulletList items={strategy.scope.inScope} color="text-emerald-500" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider mb-2.5">Out of Scope</h4>
            <BulletList items={strategy.scope.outOfScope} color="text-red-400" />
          </div>
        </div>
      </SectionCard>

      {/* Focus Areas */}
      <SectionCard config={SECTIONS[2]}>
        <div className="flex flex-wrap gap-2">
          {strategy.focusAreas.map((area, i) => (
            <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {area}
            </span>
          ))}
        </div>
      </SectionCard>

      {/* Approach */}
      <SectionCard config={SECTIONS[3]}>
        <BulletList items={strategy.approach} color="text-orange-500" />
      </SectionCard>

      {/* Deliverables */}
      <SectionCard config={SECTIONS[4]}>
        <div className="space-y-2">
          {strategy.deliverables.map((d, i) => (
            <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
              <Package size={13} className="text-pink-500 shrink-0" />
              <span className="text-sm text-slate-700 dark:text-slate-300">{d}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Team & Schedule */}
      <SectionCard config={SECTIONS[5]}>
        <div className="flex gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
            <Users size={14} className="text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-medium text-cyan-700 dark:text-cyan-300">{strategy.teamAndSchedule.teamSize}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20">
            <Clock size={14} className="text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-medium text-cyan-700 dark:text-cyan-300">{strategy.teamAndSchedule.duration}</span>
          </div>
        </div>
        <div className="space-y-2">
          {strategy.teamAndSchedule.schedule.map((phase: SchedulePhase, i: number) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
              <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center shrink-0">
                <Calendar size={11} className="text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{phase.phase}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{phase.activities}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Entry & Exit Criteria */}
      <SectionCard config={SECTIONS[6]}>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <h4 className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-2.5">Entry Criteria</h4>
            <BulletList items={strategy.entryExitCriteria.entryCriteria} color="text-teal-500" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2.5">Exit Criteria</h4>
            <BulletList items={strategy.entryExitCriteria.exitCriteria} color="text-slate-400" />
          </div>
        </div>
      </SectionCard>

      {/* Risks */}
      <SectionCard config={SECTIONS[7]}>
        <div className="space-y-2">
          {strategy.risks.map((risk, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
              <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-300">{risk}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function formatAsText(result: GeneratedStrategy): string {
  const { strategy, ticketId, ticketSummary, generatedAt } = result;
  const s = strategy;
  return `TEST STRATEGY — ${ticketId}
Generated: ${new Date(generatedAt).toLocaleString()}
${ticketSummary}

OBJECTIVE
${s.objective}

SCOPE
In Scope:
${s.scope.inScope.map(i => `  • ${i}`).join('\n')}

Out of Scope:
${s.scope.outOfScope.map(i => `  • ${i}`).join('\n')}

FOCUS AREAS
${s.focusAreas.map(i => `  • ${i}`).join('\n')}

APPROACH
${s.approach.map(i => `  • ${i}`).join('\n')}

DELIVERABLES
${s.deliverables.map(i => `  • ${i}`).join('\n')}

TEAM & SCHEDULE
Team Size: ${s.teamAndSchedule.teamSize}
Duration: ${s.teamAndSchedule.duration}
${s.teamAndSchedule.schedule.map(p => `  [${p.phase}] ${p.activities}`).join('\n')}

ENTRY & EXIT CRITERIA
Entry:
${s.entryExitCriteria.entryCriteria.map(i => `  • ${i}`).join('\n')}
Exit:
${s.entryExitCriteria.exitCriteria.map(i => `  • ${i}`).join('\n')}

RISKS
${s.risks.map(i => `  ⚠ ${i}`).join('\n')}

---
Generated by Test Strategy Buddy · B.L.A.S.T. Framework · RICE-POT Prompting
`;
}
