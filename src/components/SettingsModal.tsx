import { useState } from 'react';
import { X, Eye, EyeOff, CheckCircle2, AlertCircle, Settings } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import type { Settings as SettingsType } from '../types';

interface Props {
  onClose: () => void;
}

interface FieldConfig {
  key: keyof SettingsType;
  label: string;
  placeholder: string;
  hint: string;
  secret?: boolean;
}

const FIELDS: FieldConfig[] = [
  {
    key: 'jiraBaseUrl',
    label: 'JIRA Base URL',
    placeholder: 'https://yourcompany.atlassian.net',
    hint: 'Your Atlassian cloud instance URL (no trailing slash)',
  },
  {
    key: 'jiraEmail',
    label: 'JIRA Email',
    placeholder: 'you@company.com',
    hint: 'The email address linked to your Atlassian account',
  },
  {
    key: 'jiraToken',
    label: 'JIRA API Token',
    placeholder: 'ATATT3xFf...',
    hint: 'Generate at id.atlassian.com → Security → API tokens',
    secret: true,
  },
  {
    key: 'groqApiKey',
    label: 'GROQ API Key',
    placeholder: 'gsk_...',
    hint: 'Get your free key at console.groq.com',
    secret: true,
  },
  {
    key: 'groqModel',
    label: 'GROQ Model',
    placeholder: 'openai/gpt-oss-120b',
    hint: 'Model ID to use for generation (default: openai/gpt-oss-120b)',
  },
];

export default function SettingsModal({ onClose }: Props) {
  const { settings, updateSettings, isConfigured } = useSettings();
  const [local, setLocal] = useState({ ...settings });
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateSettings(local);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  const toggle = (key: string) => setVisible(v => ({ ...v, [key]: !v[key] }));

  const isValid = Boolean(
    local.jiraEmail && local.jiraToken && local.jiraBaseUrl && local.groqApiKey
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
              <Settings size={16} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Configuration</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Saved locally in your browser</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost rounded-full w-8 h-8 p-0 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        {/* Status banner */}
        <div className={`mx-5 mt-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
          isConfigured
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
            : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
        }`}>
          {isConfigured ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {isConfigured ? 'All required fields configured' : 'Please fill in all required fields to continue'}
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {FIELDS.map(({ key, label, placeholder, hint, secret }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {label}
                {key !== 'groqModel' && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <div className="relative">
                <input
                  type={secret && !visible[key] ? 'password' : 'text'}
                  className="input-field pr-10"
                  placeholder={placeholder}
                  value={local[key]}
                  onChange={e => setLocal(prev => ({ ...prev, [key]: e.target.value }))}
                  autoComplete="off"
                />
                {secret && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    onClick={() => toggle(key)}
                  >
                    {visible[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!isValid || saved}
            className="btn-primary min-w-[100px] justify-center"
          >
            {saved ? (
              <>
                <CheckCircle2 size={15} />
                Saved!
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
