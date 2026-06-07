import { useState } from 'react';
import Header from './components/Header';
import SettingsModal from './components/SettingsModal';
import JiraInput from './components/JiraInput';
import TestStrategyOutput from './components/TestStrategyOutput';
import { useSettings } from './context/SettingsContext';
import { fetchJiraTicket, generateTestStrategy } from './utils/api';
import type { GeneratedStrategy, LoadingState } from './types';

export default function App() {
  const { settings } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedStrategy | null>(null);

  const handleGenerate = async (ticketId: string) => {
    setError(null);
    setResult(null);
    setLoadingState('fetching-jira');

    try {
      const ticket = await fetchJiraTicket(settings, ticketId);
      setLoadingState('generating');
      const strategy = await generateTestStrategy(settings, ticket);
      setResult(strategy);
      setLoadingState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoadingState('error');
    }
  };

  const handleReset = () => {
    setResult(null);
    setLoadingState('idle');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Header onOpenSettings={() => setShowSettings(true)} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {!result && (
          <JiraInput
            onGenerate={handleGenerate}
            loadingState={loadingState}
            error={error}
          />
        )}

        {result && (
          <TestStrategyOutput result={result} onReset={handleReset} />
        )}

        <footer className="text-center pt-6 pb-2">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            Built with{' '}
            <span className="font-semibold text-violet-500">B.L.A.S.T. Framework</span>
            {' · '}
            <span className="font-semibold text-violet-500">RICE-POT Prompting</span>
            {' · '}
            <span className="font-semibold">GROQ AI</span>
            {' · '}
            <span className="font-semibold">JIRA Cloud</span>
          </p>
        </footer>
      </main>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}
