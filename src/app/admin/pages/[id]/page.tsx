'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import {
  Save,
  Send,
  CheckCircle,
  Eye,
  History,
  Monitor,
  Tablet,
  Smartphone,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Layers,
  Settings,
  Globe,
  ArrowLeft,
  AlertCircle,
  Shield,
  Clock,
  Sparkles
} from 'lucide-react';

interface Block {
  id: string;
  type: 'hero' | 'metrics' | 'operations' | 'sustainability' | 'cta' | 'reporting';
  title: string;
  subtitle?: string;
  badge?: string;
  bgImage?: string;
  ctaText?: string;
  ctaLink?: string;
  visible: boolean;
}

export default function AdminPageBuilder() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user, hasPerm } = useAdminAuth();

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<any>(null);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);

  // Page Builder State
  const [pageTitle, setPageTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string>('hero_block');

  // Preview & Viewport State
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'inspector' | 'seo' | 'history'>('inspector');
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/admin/content/pages/${id}`);
        if (!res.ok) throw new Error('Failed to load page');
        const json = await res.json();

        setRecord(json.record);
        setRevisions(json.revisions || []);
        setApprovals(json.approvals || []);
        setPageTitle(json.record.title || '');
        setPageSlug(json.record.slug || '');

        const draft = json.draft?.data || json.published?.data || {};
        setSeoDesc(draft.meta?.description || 'Gold Fields corporate page overview.');

        // Initialize structured blocks
        if (draft.blocks && Array.isArray(draft.blocks)) {
          setBlocks(draft.blocks);
        } else {
          // Default default blocks if new
          setBlocks([
            {
              id: 'hero_block',
              type: 'hero',
              title: draft.hero?.title || 'Creating enduring value beyond mining.',
              subtitle: draft.hero?.subtitle || 'Discover our globally diversified operations and sustainable economic value.',
              badge: draft.hero?.badge || 'Gold Fields Flagship • Global Production',
              bgImage: draft.hero?.bgImage || '/assets/goldfields-3d-mining-hero.jpg',
              ctaText: 'Explore Operations',
              ctaLink: '/operations',
              visible: true
            },
            {
              id: 'metrics_block',
              type: 'metrics',
              title: 'H1 2026 Production & Financial Telemetry',
              subtitle: 'Operational momentum across South Africa, Australia, Ghana, Peru, and Chile.',
              badge: 'Real-Time Disclosures',
              visible: true
            },
            {
              id: 'reporting_block',
              type: 'reporting',
              title: 'Corporate Reporting & Financial Disclosures',
              subtitle: 'Interim financial booklet, mineral reserve statement, and climate report.',
              badge: 'JSE SENS / NYSE Disclosures',
              visible: true
            },
            {
              id: 'sustainability_block',
              type: 'sustainability',
              title: '2030 ESG Commitments & Decarbonization',
              subtitle: 'Khanyisa solar plant, 50% renewable power target, and zero-harm culture.',
              badge: 'Science-Based Targets',
              visible: true
            }
          ]);
        }
      } catch (err: any) {
        console.error(err);
        setNotification({ type: 'error', msg: err.message || 'Error loading page' });
      } finally {
        setLoading(false);
      }
    }

    if (id) loadData();
  }, [id]);

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) || blocks[0];

  const updateSelectedBlock = (updates: Partial<Block>) => {
    if (!selectedBlock) return;
    setBlocks(blocks.map((b) => (b.id === selectedBlock.id ? { ...b, ...updates } : b)));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= blocks.length) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[newIdx];
    newBlocks[newIdx] = temp;
    setBlocks(newBlocks);
  };

  const toggleVisibility = (blockId: string) => {
    setBlocks(blocks.map((b) => (b.id === blockId ? { ...b, visible: !b.visible } : b)));
  };

  const addBlock = () => {
    const newId = `block_${Date.now()}`;
    const newBlock: Block = {
      id: newId,
      type: 'cta',
      title: 'New Content Section',
      subtitle: 'Section description and key messages.',
      badge: 'Corporate Update',
      visible: true
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newId);
  };

  // Save Draft (creates new revision)
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setNotification(null);
    try {
      const payload = {
        title: pageTitle,
        slug: pageSlug,
        data: {
          title: pageTitle,
          slug: pageSlug,
          hero: {
            badge: blocks.find((b) => b.type === 'hero')?.badge,
            title: blocks.find((b) => b.type === 'hero')?.title,
            subtitle: blocks.find((b) => b.type === 'hero')?.subtitle,
            bgImage: blocks.find((b) => b.type === 'hero')?.bgImage
          },
          meta: {
            description: seoDesc
          },
          blocks
        }
      };

      const res = await fetch(`/api/admin/content/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      setNotification({ type: 'success', msg: `Draft revision v${data.revisionNumber} saved!` });
      // Refresh record status
      setRecord((prev: any) => ({ ...prev, status: 'draft' }));
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', msg: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Workflow Action (Submit for review, Approve, Publish)
  const handleWorkflow = async (action: string) => {
    setIsSaving(true);
    setNotification(null);
    try {
      const res = await fetch(`/api/admin/content/pages/${id}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Workflow action failed');

      setNotification({ type: 'success', msg: `Page status updated to ${data.newStatus}!` });
      setRecord((prev: any) => ({ ...prev, status: data.newStatus }));
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', msg: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-2 border-[#C99700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -m-6 lg:-m-8">
      {/* Top Header & Workflow Bar */}
      <div className="h-14 border-b border-[#1E293B] bg-[#0A0F17] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/pages"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A2536] transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">{pageTitle || 'Untitled Page'}</span>
              <span className="text-xs font-mono text-gray-500">/{pageSlug}</span>
              <span
                className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                  record?.status === 'published'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : record?.status === 'in_review'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : record?.status === 'approved'
                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                    : 'bg-gray-800 text-gray-300 border border-gray-700'
                }`}
              >
                {record?.status || 'Draft'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {notification && (
            <span
              className={`text-xs px-3 py-1 rounded-lg ${
                notification.type === 'success'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-red-950 text-red-300 border border-red-800'
              }`}
            >
              {notification.msg}
            </span>
          )}

          {/* Viewport Toggles */}
          <div className="hidden md:flex items-center bg-[#101725] rounded-xl border border-[#1E2A3C] p-1 space-x-1">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewport === 'desktop' ? 'bg-[#1E2E44] text-[#C99700]' : 'text-gray-400 hover:text-white'
              }`}
              title="Desktop View (1280px)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewport === 'tablet' ? 'bg-[#1E2E44] text-[#C99700]' : 'text-gray-400 hover:text-white'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-lg text-xs transition ${
                viewport === 'mobile' ? 'bg-[#1E2E44] text-[#C99700]' : 'text-gray-400 hover:text-white'
              }`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#172336] hover:bg-[#20314C] border border-[#273B57] text-xs font-medium text-gray-200 hover:text-white transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-[#C99700]" />
            <span>Save Draft</span>
          </button>

          {/* Workflow Action Buttons depending on role & status */}
          {record?.status === 'draft' && (
            <button
              onClick={() => handleWorkflow('submit_review')}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#1C2C40] hover:bg-[#263C57] border border-[#2F496B] text-xs font-semibold text-amber-300 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Review</span>
            </button>
          )}

          {record?.status === 'in_review' && hasPerm('content:approve') && (
            <button
              onClick={() => handleWorkflow('approve')}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-800/80 border border-blue-600 text-xs font-semibold text-blue-200 transition"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          )}

          {(record?.status === 'approved' || user?.role === 'platform_admin') && (
            <button
              onClick={() => handleWorkflow('publish')}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:from-[#E5BE48] hover:to-[#C49534] text-xs font-bold text-black transition shadow-md shadow-[#C99700]/20"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Publish Live</span>
            </button>
          )}

          {/* Preview Public Link */}
          <Link
            href={pageSlug === 'home' ? '/' : `/${pageSlug}`}
            target="_blank"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A2536] transition"
            title="Open Live Website"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 3-Panel Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Block Tree & Outline (w-64) */}
        <div className="w-72 bg-[#0B1019] border-r border-[#1E293B] flex flex-col justify-between shrink-0">
          <div className="p-3 border-b border-[#1E293B] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-[#C99700]" />
              <span>Page Blocks ({blocks.length})</span>
            </span>

            <button
              onClick={addBlock}
              className="p-1 rounded-lg bg-[#141F30] hover:bg-[#1F2F4A] text-gray-300 hover:text-white transition"
              title="Add Block"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Block List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {blocks.map((b, idx) => {
              const isSelected = b.id === selectedBlockId;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBlockId(b.id)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#142033] border-[#C99700]/50 text-white shadow-sm'
                      : 'bg-[#0E1522] border-[#1C2638] text-gray-400 hover:bg-[#121A2A] hover:text-gray-200'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="font-semibold truncate text-xs">{b.title}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-mono mt-0.5">
                      {b.type}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => moveBlock(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-gray-500 hover:text-gray-200 disabled:opacity-20"
                    >
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveBlock(idx, 'down')}
                      disabled={idx === blocks.length - 1}
                      className="p-1 text-gray-500 hover:text-gray-200 disabled:opacity-20"
                    >
                      <MoveDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-[#1E293B] text-[11px] text-gray-500 text-center">
            Click block to inspect &amp; edit properties
          </div>
        </div>

        {/* Center Panel: Live Responsive Preview Canvas */}
        <div className="flex-1 bg-[#05070B] overflow-y-auto p-6 flex flex-col items-center">
          <div
            className={`transition-all duration-300 w-full rounded-2xl overflow-hidden border border-[#212C3D] shadow-2xl bg-[#0B111A] ${
              viewport === 'desktop'
                ? 'max-w-5xl'
                : viewport === 'tablet'
                ? 'max-w-2xl'
                : 'max-w-sm'
            }`}
          >
            {/* Simulated Browser Bar */}
            <div className="bg-[#121A26] px-4 py-2 border-b border-[#212C3D] flex items-center justify-between text-[11px] text-gray-400 font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-gray-300">https://goldfields.com/{pageSlug}</span>
              </div>
              <span className="uppercase text-[9px] font-bold text-[#C99700] px-1.5 py-0.5 rounded bg-[#C99700]/10 border border-[#C99700]/30">
                Live Studio Canvas
              </span>
            </div>

            {/* Canvas Blocks Preview */}
            <div className="divide-y divide-[#1B273A]">
              {blocks
                .filter((b) => b.visible)
                .map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBlockId(b.id)}
                    className={`relative transition cursor-pointer p-8 ${
                      selectedBlockId === b.id ? 'ring-2 ring-[#C99700] ring-inset' : 'hover:opacity-95'
                    }`}
                  >
                    {b.type === 'hero' && (
                      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0F1726] to-[#0A0E17] border border-[#22334D] p-8 text-center sm:text-left">
                        {b.badge && (
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#C99700]/20 text-[#E6C657] border border-[#C99700]/40 mb-4">
                            {b.badge}
                          </div>
                        )}
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
                          {b.title}
                        </h2>
                        <p className="text-sm text-gray-300 max-w-2xl leading-relaxed mb-6">
                          {b.subtitle}
                        </p>
                        {b.ctaText && (
                          <div className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] text-black text-xs font-bold shadow-lg">
                            {b.ctaText}
                          </div>
                        )}
                      </div>
                    )}

                    {b.type === 'metrics' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                            {b.title}
                          </h3>
                          <span className="text-[10px] text-emerald-400 font-mono">H1 2026 AUDITED</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            { label: 'Attributable Production', value: '1,054 koz' },
                            { label: 'AISC Cost Guidance', value: '$1,385 /oz' },
                            { label: 'Adjusted Free Cash Flow', value: '$485M' },
                            { label: 'Renewable Power Share', value: '54%' }
                          ].map((m) => (
                            <div key={m.label} className="p-3.5 rounded-xl bg-[#090E17] border border-[#1E2B3E]">
                              <div className="text-lg font-bold text-white font-mono">{m.value}</div>
                              <div className="text-[10px] text-gray-400 mt-1">{m.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {b.type === 'reporting' && (
                      <div className="p-6 rounded-2xl bg-[#0A1019] border border-[#1E2B3E] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase font-bold text-white tracking-wider">
                            {b.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                            Regulated
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{b.subtitle}</p>
                      </div>
                    )}

                    {b.type === 'sustainability' && (
                      <div className="p-6 rounded-2xl bg-[#0A1019] border border-[#1E2B3E] space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs uppercase font-bold text-white tracking-wider">
                            {b.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                            2030 Science-Based
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{b.subtitle}</p>
                      </div>
                    )}

                    {b.type === 'cta' && (
                      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111A29] to-[#0A101A] border border-[#1E2B3E] text-center space-y-2">
                        <h4 className="text-base font-bold text-white">{b.title}</h4>
                        <p className="text-xs text-gray-400">{b.subtitle}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Property Inspector & SEO & History (w-80) */}
        <div className="w-80 bg-[#0B1019] border-l border-[#1E293B] flex flex-col justify-between shrink-0">
          <div>
            {/* Inspector Tabs */}
            <div className="flex border-b border-[#1E293B] bg-[#0E1522]">
              <button
                onClick={() => setActiveTab('inspector')}
                className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition ${
                  activeTab === 'inspector'
                    ? 'border-[#C99700] text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Block
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition ${
                  activeTab === 'seo'
                    ? 'border-[#C99700] text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                SEO &amp; Meta
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition ${
                  activeTab === 'history'
                    ? 'border-[#C99700] text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                History ({revisions.length})
              </button>
            </div>

            {/* Tab 1: Block Inspector */}
            {activeTab === 'inspector' && selectedBlock && (
              <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                    Block Title / Heading
                  </label>
                  <input
                    type="text"
                    value={selectedBlock.title || ''}
                    onChange={(e) => updateSelectedBlock({ title: e.target.value })}
                    className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C99700]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                    Badge / Eyebrow Text
                  </label>
                  <input
                    type="text"
                    value={selectedBlock.badge || ''}
                    onChange={(e) => updateSelectedBlock({ badge: e.target.value })}
                    className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C99700]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                    Subtitle / Paragraph
                  </label>
                  <textarea
                    rows={4}
                    value={selectedBlock.subtitle || ''}
                    onChange={(e) => updateSelectedBlock({ subtitle: e.target.value })}
                    className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C99700] resize-none"
                  />
                </div>

                {selectedBlock.type === 'hero' && (
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                      Background Image Asset
                    </label>
                    <input
                      type="text"
                      value={selectedBlock.bgImage || ''}
                      onChange={(e) => updateSelectedBlock({ bgImage: e.target.value })}
                      placeholder="/assets/goldfields-3d-mining-hero.jpg"
                      className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C99700]"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-[#1C2638] flex items-center justify-between">
                  <button
                    onClick={() => toggleVisibility(selectedBlock.id)}
                    className="text-xs text-gray-300 hover:text-white"
                  >
                    {selectedBlock.visible ? 'Hide from page' : 'Show on page'}
                  </button>
                  <button
                    onClick={() => {
                      setBlocks(blocks.filter((b) => b.id !== selectedBlock.id));
                      setSelectedBlockId(blocks[0]?.id || '');
                    }}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Block</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: SEO & Meta */}
            {activeTab === 'seo' && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C99700]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={pageSlug}
                    onChange={(e) => setPageSlug(e.target.value)}
                    className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C99700]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    rows={4}
                    value={seoDesc}
                    onChange={(e) => setSeoDesc(e.target.value)}
                    className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C99700] resize-none"
                  />
                  <div className="text-[10px] text-gray-500 mt-1">
                    {seoDesc.length} / 160 characters recommended
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Revision History */}
            {activeTab === 'history' && (
              <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-220px)]">
                {revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3 rounded-xl bg-[#080D14] border border-[#1C2638] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-white">v{rev.revision_number}</span>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono ${
                          rev.status === 'published'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      by {rev.author_name || 'Sarah Jenkins'}
                    </div>
                    <div className="text-[10px] font-mono text-gray-500">
                      {new Date(rev.created_at).toLocaleString()}
                    </div>
                    <div className="text-[9px] font-mono text-gray-600 truncate">
                      SHA: {rev.content_hash}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#1E293B] bg-[#0E1522] text-[11px] text-gray-500 flex items-center justify-between">
            <span>Gold Fields Studio Engine</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Autosync Ready</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
