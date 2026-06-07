import { Settings, Zap } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useSettings } from '../context/SettingsContext';

interface Props {
  onOpenSettings: () => void;
}

export default function Header({ onOpenSettings }: Props) {
  const { isConfigured } = useSettings();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 dark:text-white text-sm">Test Strategy</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 leading-none">
              BUDDY
            </span>
          </div>
        </div>

        {/* Tagline — hidden on mobile */}
        <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 font-medium">
          JIRA → AI-powered Test Strategy · Built with B.L.A.S.T. + RICE-POT
        </p>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={onOpenSettings}
            className={`btn-ghost rounded-lg flex items-center gap-1.5 text-xs px-2.5 py-1.5 ${
              !isConfigured
                ? 'ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-slate-950 text-amber-600 dark:text-amber-400'
                : ''
            }`}
          >
            <Settings size={15} />
            <span className="hidden sm:inline">{isConfigured ? 'Settings' : 'Configure'}</span>
            {!isConfigured && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
