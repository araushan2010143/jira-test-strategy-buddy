import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Settings } from '../types';

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
  isConfigured: boolean;
}

const defaults: Settings = {
  jiraEmail: '',
  jiraToken: '',
  jiraBaseUrl: '',
  groqApiKey: '',
  groqModel: 'openai/gpt-oss-120b',
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem('tsb-settings');
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem('tsb-settings', JSON.stringify(next));
      return next;
    });
  };

  const isConfigured = Boolean(
    settings.jiraEmail &&
    settings.jiraToken &&
    settings.jiraBaseUrl &&
    settings.groqApiKey
  );

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isConfigured }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
