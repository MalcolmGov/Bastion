'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Search,
  Globe2,
  Check,
  Copy,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  FileCheck2,
  Send,
  X,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import type { SectionInstance } from '@/lib/studio/types';

interface InEditorContentAgentProps {
  section: SectionInstance | null | undefined;
  onApplyField: (field: string, newValue: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export function InEditorContentAgent({
  section,
  onApplyField,
  onClose,
  isModal = false
}: InEditorContentAgentProps) {
  // Available target fields in the current section
  const availableFields = React.useMemo(() => {
    if (!section) return [];
    const fields: Array<{ key: string; label: string; value: string }> = [];
    if (section.props.title) fields.push({ key: 'title', label: 'Section Headline', value: String(section.props.title) });
    if (section.props.subtitle) fields.push({ key: 'subtitle', label: 'Subtitle', value: String(section.props.subtitle) });
    if (section.props.description) fields.push({ key: 'description', label: 'Description', value: String(section.props.description) });
    if (section.props.eyebrow) fields.push({ key: 'eyebrow', label: 'Eyebrow / Badge', value: String(section.props.eyebrow) });
    if (section.props.quote) fields.push({ key: 'quote', label: 'Executive Quote', value: String(section.props.quote) });
    if (section.props.primaryCta?.label) fields.push({ key: 'primaryCta.label', label: 'Primary CTA Label', value: String(section.props.primaryCta.label) });
    if (section.props.ctaText) fields.push({ key: 'ctaText', label: 'CTA Button Text', value: String(section.props.ctaText) });
    return fields;
  }, [section]);

  const [activeTab, setActiveTab] = useState<'reframe' | 'compliance' | 'seo' | 'translate'>('reframe');
  const [selectedFieldKey, setSelectedFieldKey] = useState<string>('title');
  const [customText, setCustomText] = useState<string>('');
  const [tone, setTone] = useState<'investor' | 'sustainability' | 'executive' | 'punchy'>('investor');
  const [customInstruction, setCustomInstruction] = useState<string>('');
  const [targetLang, setTargetLang] = useState<'es' | 'fr' | 'zu' | 'af'>('es');

  const [loading, setLoading] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [response, setResponse] = useState<any>(null);

  // Sync customText when active field or section changes
  useEffect(() => {
    if (availableFields.length > 0) {
      const current = availableFields.find(f => f.key === selectedFieldKey) || availableFields[0];
      setSelectedFieldKey(current.key);
      setCustomText(current.value);
    } else if (section) {
      setCustomText(section.props.title || section.props.description || 'Gold Fields creates enduring value beyond mining.');
    }
  }, [selectedFieldKey, section, availableFields]);

  // Execute Agent Action
  const handleExecute = async (overrideTab?: 'reframe' | 'compliance' | 'seo' | 'translate') => {
    const tabToRun = overrideTab || activeTab;
    if (!customText.trim()) return;

    setLoading(true);
    setResponse(null);
    setApplied(false);

    try {
      const res = await fetch('/api/admin/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: tabToRun,
          text: customText,
          tone,
          field: selectedFieldKey,
          instruction: customInstruction,
          targetLanguage: targetLang,
          clientContext: 'Gold Fields'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        alert(data.error || 'Content agent processing failed.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Network error communicating with Bastion AI agent.');
    } finally {
      setLoading(false);
    }
  };

  // Apply result directly into section state
  const handleApply = () => {
    if (!response) return;
    let textToApply = '';
    if (activeTab === 'reframe') textToApply = response.rewritten;
    if (activeTab === 'compliance') textToApply = response.compliantRewrite;
    if (activeTab === 'translate') textToApply = response.translated;
    if (activeTab === 'seo') textToApply = response.seo?.metaTitle || '';

    if (!textToApply) return;

    if (selectedFieldKey === 'primaryCta.label' && section?.props.primaryCta) {
      onApplyField('primaryCta', { ...section.props.primaryCta, label: textToApply } as any);
    } else {
      onApplyField(selectedFieldKey, textToApply);
    }

    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex flex-col ${isModal ? 'bg-[#0F1420] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden' : 'space-y-4'}`}>
      {/* Header bar */}
      <div className="p-4 border-b border-[#1E293B] bg-[#121927] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Bastion AI Content Agent</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
                JSE / SENS Ready
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Corporate reframing, regulatory audit & multi-region localization
            </div>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3 flex items-center space-x-1 border-b border-[#1E293B] text-xs">
        {[
          { id: 'reframe', label: 'Tone Reframe', icon: Sparkles },
          { id: 'compliance', label: 'SENS Compliance', icon: ShieldCheck },
          { id: 'seo', label: 'SEO & Metadata', icon: Search },
          { id: 'translate', label: 'Localization', icon: Globe2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                setResponse(null);
              }}
              className={`pb-2.5 px-2.5 font-semibold flex items-center space-x-1.5 transition border-b-2 ${
                isActive
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Body Area */}
      <div className="p-4 space-y-4 text-xs">
        {/* Field Selector */}
        {availableFields.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Target Section Field
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Block: {section?.componentId}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableFields.map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    setSelectedFieldKey(f.key);
                    setCustomText(f.value);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition border ${
                    selectedFieldKey === f.key
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold'
                      : 'bg-[#141C2A] border-[#222E42] text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Text Area */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Source Text
          </label>
          <textarea
            rows={3}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Type or paste copy to transform..."
            className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-[#232F42] text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* TAB 1: REFRAME OPTIONS */}
        {activeTab === 'reframe' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Target Tone Voice
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'investor', label: '📊 Institutional Investor', desc: 'AISC discipline, capital allocation, yield' },
                  { id: 'sustainability', label: '🌱 ESG & Decarbonization', desc: '2030 science targets, 50MW solar, zero-harm' },
                  { id: 'executive', label: '🏛️ Executive & Governance', desc: 'Authoritative Board & CEO leadership' },
                  { id: 'punchy', label: '⚡ High-Impact & Concise', desc: 'Mobile scan velocity, active verbs' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id as any)}
                    className={`p-2 rounded-xl border text-left transition ${
                      tone === t.id
                        ? 'bg-indigo-950/60 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-[#121927] border-[#202C3F] text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <div className="font-bold text-[11px] text-slate-200">{t.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Custom Instruction (Optional)
              </label>
              <input
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="e.g. Highlight Chilean Salares Norte commissioning..."
                className="w-full px-3 py-1.5 rounded-xl bg-[#0B0F19] border border-[#232F42] text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* TAB 2: COMPLIANCE AUDIT INFO */}
        {activeTab === 'compliance' && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>JSE SENS & SAMREC Speculative Filter</span>
            </div>
            The compliance agent evaluates text for forward-looking price claims, unhedged operational outcomes, and emotive non-GAAP assertions to ensure publication safety.
          </div>
        )}

        {/* TAB 3: SEO INFO */}
        {activeTab === 'seo' && (
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-sky-400">
              <Search className="w-3.5 h-3.5" />
              <span>Automated Structured Metadata</span>
            </div>
            Generates OpenGraph titles, meta descriptions capped at 155 characters for Google SERPs, and social press sharing cards.
          </div>
        )}

        {/* TAB 4: TRANSLATION LANGUAGES */}
        {activeTab === 'translate' && (
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Target Operating Hub Language
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'es', label: '🇪🇸 Spanish', desc: 'Chile (Salares Norte) & Peru' },
                { id: 'fr', label: '🇫🇷 French', desc: 'Ghana (Tarkwa & Damang)' },
                { id: 'zu', label: '🇿🇦 isiZulu', desc: 'South Deep & Gauteng' },
                { id: 'af', label: '🇿🇦 Afrikaans', desc: 'Technical Operations' }
              ].map(l => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setTargetLang(l.id as any)}
                  className={`p-2 rounded-xl border text-left transition ${
                    targetLang === l.id
                      ? 'bg-sky-950/60 border-sky-400 text-white ring-1 ring-sky-400'
                      : 'bg-[#121927] border-[#202C3F] text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <div className="font-bold text-[11px] text-white">{l.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{l.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Execute Button */}
        <button
          type="button"
          disabled={loading || !customText.trim()}
          onClick={() => handleExecute()}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition shadow-lg shadow-indigo-600/20 disabled:opacity-40"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing & Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {activeTab === 'reframe' && 'Generate Corporate Reframe'}
                {activeTab === 'compliance' && 'Run Regulatory SENS Audit'}
                {activeTab === 'seo' && 'Generate SEO Metadata'}
                {activeTab === 'translate' && 'Translate to Regional Language'}
              </span>
            </>
          )}
        </button>

        {/* RESPONSE PREVIEW CARD */}
        {response && (
          <div className="p-4 rounded-2xl bg-[#0B0F19] border border-indigo-900/60 space-y-3 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Agent Output</span>
              </span>

              {response.compliant !== undefined && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  response.compliant
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  Grade: {response.grade} &bull; {response.compliant ? 'Compliant' : `${response.issuesCount} Issues`}
                </span>
              )}
            </div>

            {/* Content Display based on action */}
            {activeTab === 'reframe' && (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs leading-relaxed font-medium">
                  {response.rewritten}
                </div>
                {response.rationale && (
                  <p className="text-[11px] text-slate-400 italic">
                    &bull; {response.rationale}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="space-y-3">
                {response.issues && response.issues.length > 0 ? (
                  <div className="space-y-2">
                    {response.issues.map((iss: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/50 text-[11px] space-y-1">
                        <div className="font-bold text-rose-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>Flagged: &quot;{iss.flag}&quot;</span>
                          <span className="text-[9px] uppercase px-1 rounded bg-rose-900 text-rose-200 ml-auto">
                            {iss.severity}
                          </span>
                        </div>
                        <div className="text-slate-300 text-[10px]">{iss.reason}</div>
                        <div className="text-emerald-400 text-[10px] font-mono">
                          Safe alternative: {iss.safeReplacement}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/50 text-emerald-300 text-[11px] flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Zero speculative phrases detected. Full SAMREC / JSE compliance confirmed.</span>
                  </div>
                )}

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Compliant Safe Rewrite
                  </div>
                  <div className="p-3 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs leading-relaxed">
                    {response.compliantRewrite}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && response.seo && (
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Meta Title (SERP)</span>
                  <div className="p-2 rounded-lg bg-[#141C2A] border border-[#232F42] text-white font-medium mt-0.5">
                    {response.seo.metaTitle}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Meta Description ({response.seo.characterCount} chars)</span>
                  <div className="p-2 rounded-lg bg-[#141C2A] border border-[#232F42] text-slate-300 mt-0.5 text-[11px] leading-relaxed">
                    {response.seo.metaDescription}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Target Index Keywords</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(response.seo.keywords || []).map((k: string, kidx: number) => (
                      <span key={kidx} className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[10px]">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'translate' && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  Localized Copy ({response.languageLabel})
                </div>
                <div className="p-3 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs leading-relaxed font-medium">
                  {response.translated}
                </div>
              </div>
            )}

            {/* Action Bar: Apply or Copy */}
            <div className="pt-2 flex items-center space-x-2">
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
              >
                {applied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Applied to Section!</span>
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Apply to {selectedFieldKey}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const text = activeTab === 'reframe' ? response.rewritten
                    : activeTab === 'compliance' ? response.compliantRewrite
                    : activeTab === 'translate' ? response.translated
                    : response.seo?.metaTitle || '';
                  handleCopy(text);
                }}
                className="p-2 rounded-xl bg-[#141C2A] hover:bg-[#1C2536] border border-[#232F42] text-slate-300 hover:text-white transition"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
