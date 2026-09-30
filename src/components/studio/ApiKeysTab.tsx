'use client';

import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  Sparkles,
  Lock,
  Cpu
} from 'lucide-react';

export interface StoredApiKeys {
  anthropic?: string;
  openai?: string;
  gemini?: string;
  deepseek?: string;
  qwen?: string;
}

const STORAGE_KEY = 'bastion_ai_keys_v1';

const PROVIDER_CONFIGS = [
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    models: 'Claude Opus 5.5, Sonnet 5.5, Fable 5.1, 3.7 Sonnet',
    placeholder: 'sk-ant-api03-...',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    helpUrl: 'https://console.anthropic.com/settings/keys'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: 'GPT-6 Astra, GPT-6 Sol, GPT-6 Luna, o3-mini, GPT-4o',
    placeholder: 'sk-proj-... or sk-...',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    helpUrl: 'https://platform.openai.com/api-keys'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    models: 'Gemini 2.0 Flash, Gemini 1.5 Pro',
    placeholder: 'AIzaSy...',
    badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    helpUrl: 'https://aistudio.google.com/app/apikey'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek (Chinese Frontier)',
    models: 'DeepSeek-V3, DeepSeek-R1 (Reasoning)',
    placeholder: 'sk-...',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    helpUrl: 'https://platform.deepseek.com/api_keys'
  },
  {
    id: 'qwen',
    name: 'Qwen / Alibaba (Chinese Frontier)',
    models: 'Qwen 2.5 Coder 32B, Qwen Max',
    placeholder: 'sk-... (DashScope or OpenRouter sk-or-...)',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    helpUrl: 'https://dashscope.console.aliyun.com/'
  }
] as const;

export function getStoredApiKeys(): StoredApiKeys {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function ApiKeysTab() {
  const [keys, setKeys] = useState<StoredApiKeys>({});
  const [showMask, setShowMask] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<
    Record<string, { loading: boolean; valid?: boolean; latencyMs?: number; error?: string }>
  >({});
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    setKeys(getStoredApiKeys());
  }, []);

  const handleKeyChange = (providerId: keyof StoredApiKeys, val: string) => {
    setKeys(prev => ({ ...prev, [providerId]: val }));
    // Reset test result on edit
    if (testResults[providerId]) {
      setTestResults(prev => {
        const next = { ...prev };
        delete next[providerId];
        return next;
      });
    }
  };

  const handleSave = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    setSaveNotice('API keys securely saved to local storage!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleClearAll = () => {
    if (confirm('Clear all stored AI API keys from this browser?')) {
      localStorage.removeItem(STORAGE_KEY);
      setKeys({});
      setTestResults({});
      setSaveNotice('All keys cleared.');
      setTimeout(() => setSaveNotice(null), 2500);
    }
  };

  const handleTestKey = async (providerId: string) => {
    const apiKey = (keys as any)[providerId];
    if (!apiKey?.trim()) {
      setTestResults(prev => ({
        ...prev,
        [providerId]: { loading: false, valid: false, error: 'Enter a key first' }
      }));
      return;
    }

    setTestResults(prev => ({ ...prev, [providerId]: { loading: true } }));

    try {
      const res = await fetch('/api/admin/editor/ai-polish/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId, apiKey: apiKey.trim() })
      });
      const data = await res.json();
      setTestResults(prev => ({
        ...prev,
        [providerId]: {
          loading: false,
          valid: data.valid,
          latencyMs: data.latencyMs,
          error: data.error
        }
      }));
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        [providerId]: { loading: false, valid: false, error: err.message || 'Network error' }
      }));
    }
  };

  const configuredCount = Object.values(keys).filter(k => Boolean(k?.trim())).length;

  return (
    <div className="space-y-4 animate-in fade-in duration-150 text-xs">
      {/* Privacy & Security Header Card */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-blue-500/30 text-white shadow-xs">
        <div className="flex items-center space-x-2 mb-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-xs">Private Credential Management</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 ml-auto">
            {configuredCount} / {PROVIDER_CONFIGS.length} Active
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Your keys are stored exclusively in your browser's local storage and used directly to authenticate requests to Claude, OpenAI, Gemini, DeepSeek, and Qwen. They are never written to version control.
        </p>
      </div>

      {saveNotice && (
        <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 flex items-center space-x-2 text-[11px]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Provider API Key Rows */}
      <div className="space-y-3">
        {PROVIDER_CONFIGS.map(prov => {
          const keyVal = (keys as any)[prov.id] || '';
          const isConfigured = Boolean(keyVal.trim());
          const isVisible = Boolean(showMask[prov.id]);
          const testState = testResults[prov.id];

          return (
            <div
              key={prov.id}
              className="p-3.5 rounded-xl bg-[#111726] border border-[#232F42] hover:border-slate-700 transition space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-white text-xs">{prov.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${prov.badgeColor}`}>
                    {isConfigured ? 'Ready' : 'Not Set'}
                  </span>
                </div>
                <a
                  href={prov.helpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-slate-400 hover:text-sky-400 flex items-center space-x-1"
                  title={`Get ${prov.name} API key`}
                >
                  <span>Get Key</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <div className="text-[10px] text-slate-400 font-mono">
                Supported: {prov.models}
              </div>

              {/* Input & Action controls */}
              <div className="flex items-center space-x-1.5">
                <div className="relative flex-1">
                  <input
                    type={isVisible ? 'text' : 'password'}
                    value={keyVal}
                    onChange={e => handleKeyChange(prov.id as any, e.target.value)}
                    placeholder={prov.placeholder}
                    className="w-full px-3 py-1.5 pr-8 rounded-lg bg-[#0A0D14] border border-[#232F42] text-white text-xs font-mono focus:outline-none focus:border-sky-500 placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMask(prev => ({ ...prev, [prov.id]: !prev[prov.id] }))}
                    className="absolute right-2 top-2 text-slate-500 hover:text-slate-300"
                    title={isVisible ? 'Hide key' : 'Show key'}
                  >
                    {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!isConfigured || testState?.loading}
                  onClick={() => handleTestKey(prov.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#141C2A] hover:bg-[#1E293B] border border-[#2B3B52] text-slate-200 hover:text-white text-[11px] font-semibold flex items-center space-x-1 disabled:opacity-40 cursor-pointer"
                  title="Test key connection"
                >
                  <RefreshCw className={`w-3 h-3 ${testState?.loading ? 'animate-spin text-sky-400' : ''}`} />
                  <span>Test</span>
                </button>
              </div>

              {/* Test Connection Result Alert */}
              {testState && (
                <div
                  className={`p-2 rounded-lg text-[10px] flex items-center space-x-1.5 ${
                    testState.valid
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      : testState.loading
                      ? 'bg-sky-950/50 text-sky-300 border border-sky-500/30'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {testState.loading ? (
                    <RefreshCw className="w-3 h-3 animate-spin shrink-0" />
                  ) : testState.valid ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                  )}
                  <span className="truncate">
                    {testState.loading
                      ? 'Validating credentials with live probe...'
                      : testState.valid
                      ? `Connection verified! (${testState.latencyMs}ms latency)`
                      : testState.error || 'Invalid API key or unauthorized request'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#232F42]">
        <button
          type="button"
          onClick={handleClearAll}
          className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear All Keys</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Save API Keys</span>
        </button>
      </div>
    </div>
  );
}
