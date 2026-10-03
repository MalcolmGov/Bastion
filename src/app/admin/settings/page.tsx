'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Key,
  Shield,
  RefreshCw,
  Copy,
  Check,
  Send,
  Globe,
  Radio,
  ExternalLink,
  Code2,
  Zap,
  Activity,
  Server
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

/** A random secret from the browser's crypto source. The receiving site has to be given the same value. */
function generateSecret(prefix: string): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return prefix + Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** The line under a secret field: a warning when the stored value was a public demo secret, otherwise an optional hint. */
function SecretNote({ unsafe, warning, hint }: Readonly<{ unsafe: boolean; warning: string; hint?: string }>) {
  if (unsafe) return <p className="text-[11px] text-rose-400">{warning}</p>;
  return hint ? <p className="text-[11px] text-slate-500">{hint}</p> : null;
}

export default function WorkspaceSettingsAndExportPage() {
  const { activeClient, activeSite, refreshClients } = useStudioWorkspace();
  const isGoldFields = activeClient?.id === 'client_goldfields';

  const [activeTab, setActiveTab] = useState<'headless' | 'packages'>('headless');

  // Headless Integration State
  const [loadingHeadless, setLoadingHeadless] = useState(true);
  const [apiKey, setApiKey] = useState('');
  // Nothing here is pre-filled: an empty field means "not configured", and a secret is only ever one the user saved or generated.
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [previewUrlPattern, setPreviewUrlPattern] = useState('');
  const [previewSecret, setPreviewSecret] = useState('');
  const [unsafeSecrets, setUnsafeSecrets] = useState<string[]>([]);
  const [recentDeliveries, setRecentDeliveries] = useState<any[]>([]);

  // Action states
  const [isSavingHeadless, setIsSavingHeadless] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; status?: number; latencyMs?: number; error?: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Package Export/Import State
  const [isExporting, setIsExporting] = useState(false);
  const [exportedJson, setExportedJson] = useState<string | null>(null);
  const [importJson, setImportJson] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const siteId = activeSite?.id || 'site_goldfields_flagship';

  useEffect(() => {
    async function loadHeadlessSettings() {
      try {
        setLoadingHeadless(true);
        const res = await fetch(`/api/admin/settings/headless?siteId=${siteId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.headless) {
            setApiKey(data.headless.apiKey || '');
            setWebhookUrl(data.headless.webhookUrl || '');
            setWebhookSecret(data.headless.webhookSecret || '');
            setPreviewUrlPattern(data.headless.previewUrlPattern || '');
            setPreviewSecret(data.headless.previewSecret || '');
          }
          setUnsafeSecrets(data.unsafeSecrets || []);
          setRecentDeliveries(data.recentDeliveries || []);
        }
      } catch (err) {
        console.error('Failed to load headless settings:', err);
      } finally {
        setLoadingHeadless(false);
      }
    }

    loadHeadlessSettings();
  }, [siteId]);

  const handleSaveHeadless = async () => {
    setIsSavingHeadless(true);
    setSaveNotice(null);
    try {
      const res = await fetch('/api/admin/settings/headless', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          siteId,
          headless: {
            apiKey,
            webhookUrl,
            webhookSecret,
            previewUrlPattern,
            previewSecret,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save headless settings');
      }
      setSaveFailed(false);
      setUnsafeSecrets([]);
      setSaveNotice('✓ Headless API & Webhook settings updated successfully!');
      setTimeout(() => setSaveNotice(null), 3000);
    } catch (err: any) {
      setSaveFailed(true);
      setSaveNotice(`Error: ${err.message}`);
    } finally {
      setIsSavingHeadless(false);
    }
  };

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const res = await fetch('/api/admin/settings/headless', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ping',
          siteId,
        }),
      });

      const data = await res.json();
      setPingResult(data);

      // Refresh recent deliveries
      const refreshRes = await fetch(`/api/admin/settings/headless?siteId=${siteId}`);
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setRecentDeliveries(refreshData.recentDeliveries || []);
      }
    } catch (err: any) {
      setPingResult({ success: false, error: err.message });
    } finally {
      setIsPinging(false);
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/admin/package/export?siteId=${siteId}`);
      if (!res.ok) throw new Error('Failed to export project package');
      const data = await res.json();
      const formatted = JSON.stringify(data, null, 2);
      setExportedJson(formatted);

      const blob = new Blob([formatted], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${activeSite?.slug || 'export'}-package.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importJson.trim()) return;
    setIsImporting(true);
    setImportNotice(null);
    try {
      const parsed = JSON.parse(importJson);
      const res = await fetch('/api/admin/package/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      setImportNotice(`✓ Successfully imported project package for site: "${data.slug}"!`);
      setImportJson('');
      await refreshClients();
    } catch (err: any) {
      setImportNotice(`Import Error: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold font-mono uppercase text-amber-400">
            {isGoldFields ? 'Gold Fields Corporate Portal' : 'Bastion Enterprise CMS'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400">Operated by Bastion Group</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
          Headless API & Webhook Integration
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Configure secure REST API endpoints, real-time cache revalidation webhooks, and live draft preview connections for Bastion’s website.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#1E293B] pb-3 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('headless')}
          className={`px-4 py-2 rounded-xl font-semibold transition flex items-center space-x-2 ${
            activeTab === 'headless'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Bastion Headless API & Webhooks</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-2 rounded-xl font-semibold transition flex items-center space-x-2 ${
            activeTab === 'packages'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Package Export & Portability</span>
        </button>
      </div>

      {/* TAB 1: HEADLESS INTEGRATION */}
      {activeTab === 'headless' && (
        <div className="space-y-6">
          {/* Card 1: API Endpoints & Auth */}
          <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Bastion Content API Endpoints</h2>
                  <div className="text-xs text-slate-400">
                    Active client: <strong className="text-white">{activeClient?.name || 'Gold Fields Limited'}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  ● Endpoints Active
                </span>
              </div>
            </div>

            {/* API Endpoints List */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Production REST Endpoints (JSON over HTTPS)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                {[
                  { route: 'GET /api/content/operations', desc: '10 Mining Operations, coordinates, outputs' },
                  { route: 'GET /api/content/reports', desc: 'Quarterly financial PDFs & disclosures' },
                  { route: 'GET /api/content/news', desc: 'Regulatory SENS announcements & news' },
                  { route: 'GET /api/content/sustainability', desc: 'ESG 2030 targets & scorecards' },
                  { route: 'GET /api/content/pages', desc: 'Modular page blocks & layouts' },
                  { route: 'GET /api/content/media', desc: 'Media assets, logos & photography' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#141C2A] border border-[#232F42] flex items-center justify-between">
                    <div>
                      <div className="text-amber-400 font-bold">{item.route}</div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">{item.desc}</div>
                    </div>
                    <a
                      href={item.route.replace('GET ', '')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
                      title="Inspect API JSON"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Bearer Token */}
            <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Scoped API Bearer Token</span>
                <span className="text-[10px] text-slate-500">Provide to Bastion developers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-[#0A0F18] border border-[#1E293B] font-mono text-xs text-sky-400 truncate">
                  {apiKey}
                </div>
                <button
                  type="button"
                  onClick={handleCopyApiKey}
                  className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-bold transition flex items-center space-x-1.5"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Webhook Cache Invalidation */}
          <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Instant Webhook Cache Invalidation</h2>
                  <div className="text-xs text-slate-400">
                    Notifies Bastion’s website immediately on publish (Target latency: &lt; 500ms)
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isPinging}
                onClick={handleTestPing}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-sm"
              >
                {isPinging ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Send Test Webhook Ping</span>
              </button>
            </div>

            {/* Ping Result Notification */}
            {pingResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
                  pingResult.success
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {pingResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span>
                    {pingResult.success
                      ? `✓ Webhook ping delivered successfully (${pingResult.status || 200} OK)`
                      : `Webhook delivery notice: ${pingResult.error || 'Connection refused or simulated'}`}
                  </span>
                </div>
                {pingResult.latencyMs !== undefined && (
                  <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-black/40">
                    Latency: {pingResult.latencyMs}ms
                  </span>
                )}
              </div>
            )}

            {/* Inputs: Webhook URL & Secret */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-semibold uppercase text-[11px] text-slate-400">
                  Bastion Webhook Endpoint URL
                </label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://your-site.example/api/webhooks/cms-update"
                  className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold uppercase text-[11px] text-slate-400">
                    HMAC SHA-256 Webhook Secret
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setWebhookSecret(generateSecret('whsec_'));
                      setUnsafeSecrets((prev) => prev.filter((field) => field !== 'webhookSecret'));
                    }}
                    className="text-[11px] font-semibold text-amber-400 hover:text-amber-300"
                  >
                    Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="Not set: deliveries are paused until you add a secret"
                  className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs font-mono"
                />
                <SecretNote
                  unsafe={unsafeSecrets.includes('webhookSecret')}
                  warning="The secret saved for this site was a public demo value, so webhook deliveries are paused. Generate a new secret and save."
                  hint="Your receiving site checks each delivery against this secret, so paste the same value into its environment."
                />
              </div>
            </div>

            {/* Card 3: Preview URL Pattern */}
            <div className="pt-4 border-t border-[#1E293B] space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Live Draft Preview Route Configuration
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block font-semibold uppercase text-[11px] text-slate-400">
                    Bastion Staging / Preview URL Pattern
                  </label>
                  <input
                    type="text"
                    value={previewUrlPattern}
                    onChange={(e) => setPreviewUrlPattern(e.target.value)}
                    placeholder="https://preview.your-site.example/{slug}?preview=true"
                    className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold uppercase text-[11px] text-slate-400">
                      Draft Verification Token
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewSecret(generateSecret('prev_'));
                        setUnsafeSecrets((prev) => prev.filter((field) => field !== 'previewSecret'));
                      }}
                      className="text-[11px] font-semibold text-amber-400 hover:text-amber-300"
                    >
                      Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={previewSecret}
                    onChange={(e) => setPreviewSecret(e.target.value)}
                    placeholder="Not set"
                    className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs font-mono"
                  />
                  <SecretNote
                    unsafe={unsafeSecrets.includes('previewSecret')}
                    warning="The token saved for this site was a public demo value. Generate a new one and save."
                    hint={
                      activeSite?.slug
                        ? `Opens this site's drafts for 12 hours: /api/preview?site=${activeSite.slug}&secret=<token>&slug=<page>. Changing or clearing the token ends every pass already issued. At least 16 characters.`
                        : 'Opens this site\'s drafts for 12 hours through /api/preview?site=<site>&secret=<token>. Changing or clearing the token ends every pass already issued. At least 16 characters.'
                    }
                  />
                </div>
              </div>
            </div>

            {/* Save Notice */}
            {saveNotice && (
              <div className={`p-3 rounded-xl border text-xs ${saveFailed ? 'bg-rose-950/60 border-rose-500/40 text-rose-300' : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'}`}>
                {saveNotice}
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={isSavingHeadless}
                onClick={handleSaveHeadless}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition shadow-sm flex items-center space-x-2"
              >
                {isSavingHeadless ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Save Headless Configuration</span>
              </button>
            </div>
          </div>

          {/* Card 3: Recent Webhook Deliveries Audit */}
          <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Outbound Webhook Deliveries
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {recentDeliveries.length} recorded events
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#1E293B] bg-[#0A0F18]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1E293B] bg-[#101726] text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-2.5 px-3">Event</th>
                    <th className="py-2.5 px-3">Target Endpoint</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Latency</th>
                    <th className="py-2.5 px-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A2333] font-mono text-[11px]">
                  {recentDeliveries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 font-sans">
                        No webhook deliveries recorded yet. Publish an item or click "Send Test Webhook Ping".
                      </td>
                    </tr>
                  ) : (
                    recentDeliveries.map((deliv, idx) => (
                      <tr key={deliv.id || idx} className="hover:bg-[#121A2B]/40 transition">
                        <td className="py-2.5 px-3 font-bold text-amber-400">{deliv.event}</td>
                        <td className="py-2.5 px-3 text-slate-300 truncate max-w-[200px]">{deliv.targetUrl}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              deliv.status === 'success' || deliv.responseStatus === 200
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {deliv.responseStatus || (deliv.status === 'success' ? 200 : 500)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-400">{deliv.latencyMs || 120}ms</td>
                        <td className="py-2.5 px-3 text-right text-slate-500">
                          {new Date(deliv.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PACKAGES & PORTABILITY */}
      {activeTab === 'packages' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Part 1: Export Package */}
          <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-950/60 border border-sky-800 flex items-center justify-center text-sky-400">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Export Portable Project Package</h2>
                  <div className="text-xs text-slate-400">
                    Package for: <strong className="text-white">{activeSite?.name || 'Active Website'}</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isExporting}
                onClick={handleExport}
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition shadow-sm flex items-center space-x-2"
              >
                {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>Download Project Package (.JSON)</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-white">Included in Package Manifest:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px]">
                <li>Approved Brand Kit tokens (colors, typography scale, logos, radii)</li>
                <li>Page compositions and component section trees</li>
                <li>Sitemap and redirect mappings</li>
                <li>Antigravity AI Implementation Prompt Brief</li>
                <li>Zero secrets, private tokens, or credential leaks</li>
              </ul>
            </div>
          </div>

          {/* Part 2: Import Package */}
          <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800 flex items-center justify-center text-indigo-400">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Import Bastion Studio Project Package</h2>
                <div className="text-xs text-slate-400">Import pre-configured client sites into the database</div>
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Paste project package JSON manifest here..."
                rows={4}
                className="w-full p-4 rounded-xl bg-[#070B12] border border-[#1E293B] text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
              />

              {importNotice && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    importNotice.startsWith('✓')
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                      : 'bg-rose-950/50 border-rose-500 text-rose-300'
                  }`}
                >
                  {importNotice}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isImporting || !importJson.trim()}
                  onClick={handleImport}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition disabled:opacity-50 flex items-center space-x-2"
                >
                  {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>Import Package</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
