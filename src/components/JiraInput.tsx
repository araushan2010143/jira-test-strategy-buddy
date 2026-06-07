import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Search, Loader2, AlertCircle, Ticket } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import type { LoadingState } from '../types';

interface Props {
  onGenerate: (ticketId: string) => void;
  loadingState: LoadingState;
  error: string | null;
}

export default function JiraInput({ onGenerate, loadingState, error }: Props) {
  const [ticketId, setTicketId] = useState('');
  const { isConfigured } = useSettings();
  const isLoading = loadingState === 'fetching-jira' || loadingState === 'generating';

  const handleSubmit = () => {
    const trimmed = ticketId.trim().toUpperCase();
    if (trimmed) onGenerate(trimmed);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const loadingLabel =
    loadingState === 'fetching-jira' ? 'Fetching JIRA ticket...' :
    loadingState === 'generating' ? 'Generating strategy with GROQ AI...' : '';

  return (
    <div className="card max-w-2xl mx-auto w-full">
      <div className="p-6 sm:p-8">
        {/* Title block */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg mb-4">
            <Ticket size={28} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Test Strategy Buddy
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Enter a JIRA ticket ID to automatically generate a professional, enterprise-grade test strategy document using GROQ AI.
          </p>
        </div>

        {/* Input group */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              className="input-field pl-9 font-mono uppercase tracking-wider"
              placeholder="e.g. KAN-4, VWO-48, PROJ-123"
              value={ticketId}
              onChange={e => setTicketId(e.target.value.toUpperCase())}
              onKeyDown={handleKey}
              disabled={isLoading || !isConfigured}
              maxLength={30}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !ticketId.trim() || !isConfigured}
            className="btn-primary justify-center sm:w-auto w-full"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>

        {/* Not configured warning */}
        {!isConfigured && (
          <p className="mt-3 text-xs text-center text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5">
            <AlertCircle size={13} />
            Configure JIRA and GROQ credentials in Settings first
          </p>
        )}

        {/* Loading states */}
        {isLoading && (
          <div className="mt-6 flex flex-col items-center gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-violet-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{loadingLabel}</p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full animate-pulse"
                style={{ width: loadingState === 'fetching-jira' ? '40%' : '80%', transition: 'width 0.8s ease' }}
              />
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-fade-in">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Error</p>
              <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
