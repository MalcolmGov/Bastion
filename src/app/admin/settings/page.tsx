'use client';

import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Key,
  Shield,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

export default function WorkspaceSettingsAndExportPage() {
  const { activeClient, activeSite, refreshClients } = useStudioWorkspace();

  const [isExporting, setIsExporting] = useState(false);
  const [exportedJson, setExportedJson] = useState<string | null>(null);

  const [importJson, setImportJson] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const siteId = activeSite?.id || 'site_apex_strategy';
      const res = await fetch(`/api/admin/package/export?siteId=${siteId}`);
      if (!res.ok) throw new Error('Failed to export project package');
      const data = await res.json();
      const formatted = JSON.stringify(data, null, 2);
      setExportedJson(formatted);

      // Trigger browser download
      const blob = new Blob([formatted], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `move-studio-${activeSite?.slug || 'project'}-package.json`;
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
        body: JSON.stringify(parsed)
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
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold font-mono uppercase text-sky-400">Move Studio Platform</span>
          <span className="text-slate-600">•</span>
          <span className="text-xs text-slate-400">Settings & Portability</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
          Workspace Settings & Project Package Portability
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Export schema-compliant project packages with full brand kits, compositions, and an Antigravity AI coding assistant brief.
        </p>
      </div>

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
            <li>Antigravity AI Implementation Prompt Brief (ready for autonomous coding agents)</li>
            <li>Zero secrets, private tokens, or credential leaks</li>
          </ul>
        </div>

        {exportedJson && (
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Generated Antigravity AI Implementation Brief
            </div>
            <pre className="p-4 rounded-xl bg-[#070B12] border border-[#1E293B] text-[11px] font-mono text-sky-300 max-h-60 overflow-y-auto leading-relaxed">
              {JSON.parse(exportedJson).antigravityImplementationBrief}
            </pre>
          </div>
        )}
      </div>

      {/* Part 2: Import Package */}
      <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800 flex items-center justify-center text-indigo-400">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Import Move Studio Project Package</h2>
            <div className="text-xs text-slate-400">
              Paste or upload a valid schema-compliant project manifest.
            </div>
          </div>
        </div>

        <textarea
          rows={5}
          value={importJson}
          onChange={(e) => setImportJson(e.target.value)}
          placeholder="Paste Move Studio package JSON here..."
          className="w-full p-4 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
        />

        {importNotice && (
          <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
            importNotice.startsWith('✓') ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-rose-950/60 border border-rose-800 text-rose-300'
          }`}>
            {importNotice.startsWith('✓') ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{importNotice}</span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            disabled={isImporting || !importJson.trim()}
            onClick={handleImport}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs transition shadow-sm flex items-center space-x-2"
          >
            {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Validate & Restore Project</span>
          </button>
        </div>
      </div>

      {/* Part 3: Active Integrations & Health */}
      <div className="p-6 rounded-2xl bg-[#0D121B] border border-[#1E293B] space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Integration Adapters & Environment Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Database Engine</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                Connected
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">SQLite (studio.db) via @libsql/client</div>
          </div>

          <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">AI Model Provider</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-sky-950 text-sky-400 border border-sky-800">
                Deterministic Engine
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">Move Studio Local Heuristics</div>
          </div>

          <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Analytics Adapter</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-400 border border-slate-700">
                Not Configured
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">Zero telemetry leakage</div>
          </div>
        </div>
      </div>
    </div>
  );
}
