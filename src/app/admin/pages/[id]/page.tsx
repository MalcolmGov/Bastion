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
  Sparkles,
  HelpCircle,
  Copy,
  Edit3,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Wand2,
  FileText,
  BarChart3,
  Leaf,
  Compass,
  Briefcase,
  ExternalLink
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

interface BlockPreset {
  type: Block['type'];
  name: string;
  category: string;
  description: string;
  icon: React.ElementType;
  defaultData: Omit<Block, 'id'>;
}

const BLOCK_PRESETS: BlockPreset[] = [
  {
    type: 'hero',
    name: '3D Hero & Strategic Vision',
    category: 'Header / Keynote',
    description: 'Executive dark banner with brushed gold accents, corporate eyebrow badge, and high-impact headline.',
    icon: Sparkles,
    defaultData: {
      type: 'hero',
      title: 'Creating enduring value beyond mining.',
      subtitle: 'Discover our globally diversified portfolio delivering safe, profitable gold production across three continents.',
      badge: 'Gold Fields Flagship • Global Production',
      bgImage: '/assets/goldfields-3d-mining-hero.jpg',
      ctaText: 'Explore Operations',
      ctaLink: '/operations',
      visible: true
    }
  },
  {
    type: 'metrics',
    name: 'Production & Financial Telemetry',
    category: 'Investor / JSE / NYSE',
    description: '4-column audited KPI counters showing production koz, AISC cost guidance, cash flow, and renewable share.',
    icon: BarChart3,
    defaultData: {
      type: 'metrics',
      title: 'H1 2026 Production & Financial Telemetry',
      subtitle: 'Consistent operational delivery across South Africa, Australia, Ghana, Peru, and Chile.',
      badge: 'Audited SENS / SEC Disclosures',
      visible: true
    }
  },
  {
    type: 'sustainability',
    name: '2030 ESG & Decarbonization Targets',
    category: 'ESG / Sustainability',
    description: 'Highlights Khanyisa 50MW solar plant, 50% renewable power roadmap, and zero-harm workplace safety.',
    icon: Leaf,
    defaultData: {
      type: 'sustainability',
      title: '2030 ESG Commitments & Decarbonization',
      subtitle: 'Khanyisa solar plant, 50% renewable power target, and zero-harm culture across all host communities.',
      badge: 'Science-Based Targets (SBTi)',
      visible: true
    }
  },
  {
    type: 'reporting',
    name: 'Corporate Disclosures & Financial Booklet',
    category: 'Reporting & Compliance',
    description: 'Regulated disclosure section featuring downloadable interim booklet, mineral reserve statement, and climate report.',
    icon: FileText,
    defaultData: {
      type: 'reporting',
      title: 'Corporate Reporting & Financial Disclosures',
      subtitle: 'Interim financial booklet, audited mineral reserve statement, and climate resilience report.',
      badge: 'JSE SENS / NYSE Disclosures',
      visible: true
    }
  },
  {
    type: 'operations',
    name: 'Global Mining Operations Portfolio',
    category: 'Assets & Production',
    description: 'Interactive tier-1 mine portfolio spanning South Deep, Tarkwa, St Ives, and Salares Norte.',
    icon: Compass,
    defaultData: {
      type: 'operations',
      title: 'Globally Diversified Tier-1 Assets',
      subtitle: 'High-margin, low-carbon operational footprint across world-class mining jurisdictions.',
      badge: 'Operational Footprint',
      visible: true
    }
  },
  {
    type: 'cta',
    name: 'Executive Keynote & Action Callout',
    category: 'Engagement & Careers',
    description: 'Full-width executive callout for leadership statements, annual general meeting invitations, or career opportunities.',
    icon: Briefcase,
    defaultData: {
      type: 'cta',
      title: 'Partnering with Host Communities for Enduring Prosperity',
      subtitle: 'Explore our local procurement frameworks, socio-economic development funds, and career opportunities.',
      badge: 'Community Stewardship',
      visible: true
    }
  }
];

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

  // Interactive Guided Tour State
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  // Template Modal State
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);

  // AI Copilot State
  const [aiGeneratingField, setAiGeneratingField] = useState<'title' | 'subtitle' | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{
    field: 'title' | 'subtitle';
    text: string;
    rationale: string;
    tone: string;
  } | null>(null);
  const [customAiPrompt, setCustomAiPrompt] = useState('');

  useEffect(() => {
    // Check if user has previously dismissed or seen tour
    const tourDismissed = localStorage.getItem('gf_studio_tour_seen');
    if (!tourDismissed) {
      setShowWelcomeBanner(true);
    }

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
          if (draft.blocks.length > 0) {
            setSelectedBlockId(draft.blocks[0].id);
          }
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

  const duplicateBlock = (blockId: string) => {
    const blockToDup = blocks.find((b) => b.id === blockId);
    if (!blockToDup) return;
    const newBlock: Block = {
      ...blockToDup,
      id: `block_${Date.now()}`,
      title: `${blockToDup.title} (Copy)`
    };
    const index = blocks.findIndex((b) => b.id === blockId);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
    setSelectedBlockId(newBlock.id);
    setNotification({ type: 'success', msg: `Duplicated "${blockToDup.title}"` });
    setTimeout(() => setNotification(null), 3000);
  };

  const removeBlock = (blockId: string) => {
    if (blocks.length <= 1) {
      setNotification({ type: 'error', msg: 'A page must have at least one block.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    const remaining = blocks.filter((b) => b.id !== blockId);
    setBlocks(remaining);
    if (selectedBlockId === blockId) {
      setSelectedBlockId(remaining[0]?.id || '');
    }
    setNotification({ type: 'success', msg: 'Block removed' });
    setTimeout(() => setNotification(null), 2500);
  };

  const toggleVisibility = (blockId: string) => {
    setBlocks(blocks.map((b) => (b.id === blockId ? { ...b, visible: !b.visible } : b)));
  };

  const handleAddPreset = (preset: BlockPreset) => {
    const newId = `block_${Date.now()}`;
    const newBlock: Block = {
      ...preset.defaultData,
      id: newId
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newId);
    setIsPresetModalOpen(false);
    setActiveTab('inspector');
    setNotification({ type: 'success', msg: `Added "${preset.name}" to page` });
    setTimeout(() => setNotification(null), 3500);
  };

  // AI Copilot Tone Transform Handler
  const handleAiPolish = async (field: 'title' | 'subtitle', tone: string) => {
    if (!selectedBlock) return;
    const currentText = field === 'title' ? selectedBlock.title : selectedBlock.subtitle || '';
    if (!currentText.trim()) {
      setNotification({ type: 'error', msg: `Please enter some ${field} text first` });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setAiGeneratingField(field);
    try {
      const res = await fetch('/api/admin/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentText,
          tone,
          field,
          instruction: customAiPrompt
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI Copilot failed');

      setAiSuggestion({
        field,
        text: data.rewritten,
        rationale: data.rationale,
        tone
      });
    } catch (err: any) {
      setNotification({ type: 'error', msg: err.message || 'AI request failed' });
    } finally {
      setAiGeneratingField(null);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion || !selectedBlock) return;
    if (aiSuggestion.field === 'title') {
      updateSelectedBlock({ title: aiSuggestion.text });
    } else {
      updateSelectedBlock({ subtitle: aiSuggestion.text });
    }
    setAiSuggestion(null);
    setCustomAiPrompt('');
    setNotification({ type: 'success', msg: 'AI revision applied to block!' });
    setTimeout(() => setNotification(null), 3000);
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

  const startTour = () => {
    setShowWelcomeBanner(false);
    setTourStep(0);
    setIsTourOpen(true);
    localStorage.setItem('gf_studio_tour_seen', 'true');
  };

  const dismissTourBanner = () => {
    setShowWelcomeBanner(false);
    localStorage.setItem('gf_studio_tour_seen', 'true');
  };

  const TOUR_STEPS = [
    {
      title: '1. Block Structure Tree',
      subtitle: 'The Left Panel (Outline)',
      description:
        'Your page is composed of modular Gold Fields blocks. Click any block in the list to inspect it, use the ↑ and ↓ arrows to reorder, or click the gold "+" button to insert pre-designed executive section templates.',
      targetId: 'tour-block-tree'
    },
    {
      title: '2. Live WYSIWYG Canvas',
      subtitle: 'The Center Panel (Preview)',
      description:
        'Hover over any section on the canvas to see instant action shortcuts (Edit, Duplicate, Move, Delete). Click anywhere directly on the preview to select that section. Use the top viewport switcher to verify Desktop, Tablet, and Mobile layouts.',
      targetId: 'tour-canvas'
    },
    {
      title: '3. Property Inspector & AI Copilot',
      subtitle: 'The Right Panel (Editing & Tone)',
      description:
        'Edit titles, body paragraphs, badges, and imagery with real-time feedback. Click "✨ Polish with AI Copilot" to instantly transform draft copy into Investor Relations, ESG, or Executive tone with 1 click.',
      targetId: 'tour-inspector'
    },
    {
      title: '4. Enterprise Governance & Publishing',
      subtitle: 'The Top Workflow Bar',
      description:
        'Save drafts safely with full SHA-256 version history. Generate a Secret Executive Preview link to share with directors before go-live. Submit for compliance review, or publish live when approved.',
      targetId: 'tour-topbar'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-2 border-[#C99700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] -m-6 lg:-m-8 relative select-none">
      {/* Top Header & Workflow Bar */}
      <div
        id="tour-topbar"
        className={`h-14 border-b border-[#1E293B] bg-[#0A0F17] px-6 flex items-center justify-between shrink-0 transition-all ${
          isTourOpen && tourStep === 3 ? 'ring-2 ring-[#C99700] ring-offset-2 ring-offset-[#0A0F17] z-40' : ''
        }`}
      >
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

          {/* Interactive Guided Tour Trigger Button */}
          <button
            onClick={startTour}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#1A2536] hover:bg-[#22334A] border border-[#2B3E58] text-xs font-medium text-[#E6C657] hover:text-white transition shadow-sm"
            title="Start Interactive Guided Tour"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C99700] animate-pulse" />
            <span>Interactive Guide</span>
          </button>

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

          {/* Shareable Secret Preview Link */}
          <button
            onClick={() => {
              const url = `${window.location.origin}/api/preview?secret=gf_preview_secret_token_2026&collection=pages&slug=${pageSlug}`;
              navigator.clipboard.writeText(url);
              setNotification({ type: 'success', msg: 'Secret Executive Preview link copied to clipboard!' });
              setTimeout(() => setNotification(null), 3500);
            }}
            title="Generate shareable secret preview link"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#142033] hover:bg-[#1E2E48] border border-[#243754] text-xs font-medium text-[#E6C657] transition"
          >
            <span>Share Preview</span>
          </button>

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

      {/* Optional First-Time Welcome Banner */}
      {showWelcomeBanner && (
        <div className="bg-gradient-to-r from-[#172436] via-[#1E2E45] to-[#121B28] border-b border-[#2C4160] px-6 py-2.5 flex items-center justify-between text-xs text-gray-200">
          <div className="flex items-center space-x-3">
            <span className="p-1 rounded-lg bg-[#C99700]/20 text-[#E6C657]">
              <Sparkles className="w-4 h-4" />
            </span>
            <span>
              <strong className="text-white">New to Gold Fields Studio?</strong> Learn how to easily edit blocks, use the AI writing assistant, and publish with our interactive guide.
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={startTour}
              className="px-3 py-1 rounded-lg bg-[#C99700] hover:bg-[#D4A316] text-black font-semibold text-xs transition"
            >
              Start 45s Tour
            </button>
            <button
              onClick={dismissTourBanner}
              className="p-1 text-gray-400 hover:text-white transition"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3-Panel Main Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Block Tree & Outline (w-72) */}
        <div
          id="tour-block-tree"
          className={`w-72 bg-[#0B1019] border-r border-[#1E293B] flex flex-col justify-between shrink-0 transition-all ${
            isTourOpen && tourStep === 0 ? 'ring-2 ring-[#C99700] ring-inset z-40' : ''
          }`}
        >
          <div className="p-3 border-b border-[#1E293B] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-[#C99700]" />
              <span>Page Blocks ({blocks.length})</span>
            </span>

            <button
              onClick={() => setIsPresetModalOpen(true)}
              className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-[#141F30] hover:bg-[#1F2F4A] text-[#E6C657] hover:text-white transition text-xs font-medium border border-[#20314A]"
              title="Add Section Preset"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Block</span>
            </button>
          </div>

          {/* Block List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {blocks.map((b, idx) => {
              const isSelected = b.id === selectedBlockId;
              return (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBlockId(b.id);
                    setActiveTab('inspector');
                  }}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#142033] border-[#C99700]/70 text-white shadow-md'
                      : 'bg-[#0E1522] border-[#1C2638] text-gray-400 hover:bg-[#121A2A] hover:text-gray-200'
                  }`}
                >
                  <div className="overflow-hidden flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C99700] shrink-0" />
                    <div className="truncate">
                      <div className="font-semibold truncate text-xs">{b.title}</div>
                      <div className="text-[10px] text-gray-500 uppercase font-mono mt-0.5">
                        {b.type}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => moveBlock(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-gray-500 hover:text-gray-200 disabled:opacity-20"
                      title="Move Up"
                    >
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveBlock(idx, 'down')}
                      disabled={idx === blocks.length - 1}
                      className="p-1 text-gray-500 hover:text-gray-200 disabled:opacity-20"
                      title="Move Down"
                    >
                      <MoveDown className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => duplicateBlock(b.id)}
                      className="p-1 text-gray-500 hover:text-[#E6C657]"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-[#1E293B] text-[11px] text-gray-400 text-center flex items-center justify-center space-x-1.5 bg-[#080C14]">
            <Edit3 className="w-3 h-3 text-[#C99700]" />
            <span>Click any block to inspect &amp; edit</span>
          </div>
        </div>

        {/* Center Panel: Live Responsive Preview Canvas */}
        <div
          id="tour-canvas"
          className={`flex-1 bg-[#05070B] overflow-y-auto p-6 flex flex-col items-center relative transition-all ${
            isTourOpen && tourStep === 1 ? 'ring-2 ring-[#C99700] ring-inset z-40' : ''
          }`}
        >
          {/* Quick Notice above canvas */}
          <div className="w-full max-w-5xl mb-3 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Interactive WYSIWYG Canvas • Hover to act, click to edit</span>
            </span>
            <button
              onClick={() => setIsPresetModalOpen(true)}
              className="text-[#E6C657] hover:text-white flex items-center space-x-1 transition font-medium"
            >
              <Plus className="w-3 h-3" />
              <span>Add New Section</span>
            </button>
          </div>

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
                .map((b, idx) => {
                  const isSelected = selectedBlockId === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        setSelectedBlockId(b.id);
                        setActiveTab('inspector');
                      }}
                      className={`group relative transition cursor-pointer p-8 ${
                        isSelected
                          ? 'ring-2 ring-[#C99700] ring-inset bg-[#0E1522]/30'
                          : 'hover:bg-[#0E1522]/20'
                      }`}
                    >
                      {/* Floating Canvas Quick-Actions Bar */}
                      <div
                        className={`absolute top-3 right-4 z-20 flex items-center space-x-1 bg-[#0A1019]/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border transition-opacity ${
                          isSelected
                            ? 'border-[#C99700]/70 opacity-100 shadow-lg'
                            : 'border-[#1E293B] opacity-0 group-hover:opacity-100'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[10px] uppercase font-bold font-mono text-[#E6C657] mr-1.5">
                          {b.type}
                        </span>

                        <button
                          onClick={() => {
                            setSelectedBlockId(b.id);
                            setActiveTab('inspector');
                          }}
                          className="p-1 rounded text-gray-300 hover:text-white hover:bg-[#1A2638] transition"
                          title="Edit in Inspector"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#C99700]" />
                        </button>
                        <button
                          onClick={() => moveBlock(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-gray-300 hover:text-white hover:bg-[#1A2638] transition disabled:opacity-25"
                          title="Move Section Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveBlock(idx, 'down')}
                          disabled={idx === blocks.length - 1}
                          className="p-1 rounded text-gray-300 hover:text-white hover:bg-[#1A2638] transition disabled:opacity-25"
                          title="Move Section Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => duplicateBlock(b.id)}
                          className="p-1 rounded text-gray-300 hover:text-[#E6C657] hover:bg-[#1A2638] transition"
                          title="Duplicate Section"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeBlock(b.id)}
                          className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-950/40 transition"
                          title="Delete Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Active Section Corner Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 z-10 flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-[#C99700] text-black text-[9px] font-extrabold uppercase tracking-wider shadow">
                          <span>ACTIVE SECTION</span>
                        </div>
                      )}

                      {/* Block Type 1: Hero */}
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

                      {/* Block Type 2: Metrics Telemetry */}
                      {b.type === 'metrics' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              {b.badge && (
                                <span className="text-[10px] text-[#C99700] uppercase font-bold tracking-wider">
                                  {b.badge}
                                </span>
                              )}
                              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                                {b.title}
                              </h3>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-mono">H1 2026 AUDITED</span>
                          </div>
                          {b.subtitle && <p className="text-xs text-gray-400">{b.subtitle}</p>}
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

                      {/* Block Type 3: Corporate Reporting */}
                      {b.type === 'reporting' && (
                        <div className="p-6 rounded-2xl bg-[#0A1019] border border-[#1E2B3E] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase font-bold text-white tracking-wider">
                              {b.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                              {b.badge || 'Regulated SENS / SEC'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{b.subtitle}</p>
                          <div className="pt-2 flex flex-wrap gap-2">
                            {['H1 2026 Results Booklet (PDF)', 'Mineral Resources & Reserves 2025', 'Taskforce for Climate-Related Financial Disclosures'].map((doc) => (
                              <div key={doc} className="px-3 py-1.5 rounded-lg bg-[#111A29] border border-[#22334A] text-[11px] text-gray-300 flex items-center space-x-1.5">
                                <FileText className="w-3 h-3 text-[#C99700]" />
                                <span>{doc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Block Type 4: ESG Sustainability */}
                      {b.type === 'sustainability' && (
                        <div className="p-6 rounded-2xl bg-[#0A1019] border border-[#1E2B3E] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase font-bold text-white tracking-wider">
                              {b.title}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                              {b.badge || '2030 Science-Based'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{b.subtitle}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                            <div className="p-3 rounded-xl bg-[#0E1624] border border-[#1E2E44]">
                              <div className="text-base font-bold text-emerald-400 font-mono">50MW</div>
                              <div className="text-[10px] text-gray-300 font-medium">Khanyisa Solar Plant</div>
                              <div className="text-[9px] text-gray-500 mt-0.5">Displacing 110,000t CO2e/yr</div>
                            </div>
                            <div className="p-3 rounded-xl bg-[#0E1624] border border-[#1E2E44]">
                              <div className="text-base font-bold text-emerald-400 font-mono">50%</div>
                              <div className="text-[10px] text-gray-300 font-medium">Renewable Electricity Target</div>
                              <div className="text-[9px] text-gray-500 mt-0.5">By 2030 across all operations</div>
                            </div>
                            <div className="p-3 rounded-xl bg-[#0E1624] border border-[#1E2E44]">
                              <div className="text-base font-bold text-emerald-400 font-mono">Zero</div>
                              <div className="text-[10px] text-gray-300 font-medium">Harm Workplace Culture</div>
                              <div className="text-[9px] text-gray-500 mt-0.5">Courageous leadership standard</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Block Type 5: Operations Portfolio */}
                      {b.type === 'operations' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-[#C99700] uppercase font-bold tracking-wider">
                                {b.badge || 'Tier-1 Asset Portfolio'}
                              </span>
                              <h3 className="text-base font-bold text-white">{b.title}</h3>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">GLOBAL HUBS</span>
                          </div>
                          {b.subtitle && <p className="text-xs text-gray-400">{b.subtitle}</p>}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { name: 'South Deep', country: 'South Africa', type: 'Deep-Level Underground', status: 'Ramp-up' },
                              { name: 'Tarkwa & Damang', country: 'Ghana', type: 'Open Pit Bulk Gold', status: 'Expanding' },
                              { name: 'Salares Norte', country: 'Chile', type: 'High-Altitude Epithermal', status: 'Commissioning' }
                            ].map((op) => (
                              <div key={op.name} className="p-3.5 rounded-xl bg-[#090E17] border border-[#1E2B3E]">
                                <div className="text-xs font-bold text-white">{op.name}</div>
                                <div className="text-[10px] text-[#C99700] mt-0.5">{op.country}</div>
                                <div className="text-[10px] text-gray-400 mt-1">{op.type}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Block Type 6: CTA / Executive Callout */}
                      {b.type === 'cta' && (
                        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111A29] to-[#0A101A] border border-[#1E2B3E] text-center space-y-2">
                          {b.badge && (
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#C99700] mb-1">
                              {b.badge}
                            </span>
                          )}
                          <h4 className="text-base font-bold text-white">{b.title}</h4>
                          <p className="text-xs text-gray-400 max-w-lg mx-auto">{b.subtitle}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Right Panel: Property Inspector & AI Copilot (w-80) */}
        <div
          id="tour-inspector"
          className={`w-80 bg-[#0B1019] border-l border-[#1E293B] flex flex-col justify-between shrink-0 transition-all ${
            isTourOpen && tourStep === 2 ? 'ring-2 ring-[#C99700] ring-inset z-40' : ''
          }`}
        >
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
                {/* Block Title Field with AI Copilot */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] uppercase font-bold text-gray-400">
                      Block Title / Heading
                    </label>
                  </div>
                  <input
                    type="text"
                    value={selectedBlock.title || ''}
                    onChange={(e) => updateSelectedBlock({ title: e.target.value })}
                    className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C99700]"
                  />

                  {/* AI Copilot Quick Tone Launcher for Title */}
                  <div className="mt-1.5 p-2 rounded-xl bg-[#0D1522] border border-[#1C293D] space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[#E6C657] font-semibold">
                      <span className="flex items-center space-x-1">
                        <Wand2 className="w-3 h-3 text-[#C99700]" />
                        <span>✨ AI Tone Polish</span>
                      </span>
                      {aiGeneratingField === 'title' && (
                        <span className="text-[9px] text-[#C99700] animate-pulse">Generating...</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <button
                        onClick={() => handleAiPolish('title', 'investor')}
                        disabled={aiGeneratingField !== null}
                        className="px-2 py-1 rounded bg-[#131D2D] hover:bg-[#1B2940] text-gray-300 hover:text-white text-left transition disabled:opacity-50"
                      >
                        📈 Investor Relations
                      </button>
                      <button
                        onClick={() => handleAiPolish('title', 'punchy')}
                        disabled={aiGeneratingField !== null}
                        className="px-2 py-1 rounded bg-[#131D2D] hover:bg-[#1B2940] text-gray-300 hover:text-white text-left transition disabled:opacity-50"
                      >
                        ⚡ Punchy &amp; Direct
                      </button>
                      <button
                        onClick={() => handleAiPolish('title', 'sustainability')}
                        disabled={aiGeneratingField !== null}
                        className="px-2 py-1 rounded bg-[#131D2D] hover:bg-[#1B2940] text-gray-300 hover:text-white text-left transition disabled:opacity-50"
                      >
                        🌿 ESG &amp; Decarb
                      </button>
                      <button
                        onClick={() => handleAiPolish('title', 'executive')}
                        disabled={aiGeneratingField !== null}
                        className="px-2 py-1 rounded bg-[#131D2D] hover:bg-[#1B2940] text-gray-300 hover:text-white text-left transition disabled:opacity-50"
                      >
                        🏛️ Executive Vision
                      </button>
                    </div>
                  </div>
                </div>

                {/* Eyebrow Badge */}
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

                {/* Subtitle / Paragraph Field with AI Copilot */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] uppercase font-bold text-gray-400">
                      Subtitle / Paragraph
                    </label>
                  </div>
                  <textarea
                    rows={4}
                    value={selectedBlock.subtitle || ''}
                    onChange={(e) => updateSelectedBlock({ subtitle: e.target.value })}
                    className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C99700] resize-none"
                  />

                  {/* AI Copilot Quick Tone Launcher for Subtitle */}
                  <div className="mt-1.5 p-2 rounded-xl bg-[#0D1522] border border-[#1C293D] space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[#E6C657] font-semibold">
                      <span className="flex items-center space-x-1">
                        <Wand2 className="w-3 h-3 text-[#C99700]" />
                        <span>✨ AI Paragraph Polish</span>
                      </span>
                      {aiGeneratingField === 'subtitle' && (
                        <span className="text-[9px] text-[#C99700] animate-pulse">Generating...</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      <button
                        onClick={() => handleAiPolish('subtitle', 'investor')}
                        disabled={aiGeneratingField !== null}
                        className="px-2 py-1 rounded bg-[#131D2D] hover:bg-[#1B2940] text-gray-300 hover:text-white text-left transition disabled:opacity-50"
                      >
                        📈 Add AISC / IR Context
                      </button>
                      <button
                        onClick={() => handleAiPolish('subtitle', 'punchy')}
                        disabled={aiGeneratingField !== null}
                        className="px-2 py-1 rounded bg-[#131D2D] hover:bg-[#1B2940] text-gray-300 hover:text-white text-left transition disabled:opacity-50"
                      >
                        ⚡ Make Concise
                      </button>
                      <button
                        onClick={() => handleAiPolish('subtitle', 'sustainability')}
                        disabled={aiGeneratingField !== null}
                        className="px-2 py-1 rounded bg-[#131D2D] hover:bg-[#1B2940] text-gray-300 hover:text-white text-left transition disabled:opacity-50"
                      >
                        🌿 Add Khanyisa Solar
                      </button>
                      <button
                        onClick={() => handleAiPolish('subtitle', 'executive')}
                        disabled={aiGeneratingField !== null}
                        className="px-2 py-1 rounded bg-[#131D2D] hover:bg-[#1B2940] text-gray-300 hover:text-white text-left transition disabled:opacity-50"
                      >
                        🏛️ Leadership Tone
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Suggestion Review & Apply Card */}
                {aiSuggestion && (
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#131E2E] to-[#0E1624] border border-[#C99700]/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#E6C657]">
                      <span className="flex items-center space-x-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#C99700]" />
                        <span>AI Suggestion ({aiSuggestion.field})</span>
                      </span>
                      <button
                        onClick={() => setAiSuggestion(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-2 rounded-lg bg-[#070B12] text-xs text-white border border-[#202E42]">
                      &ldquo;{aiSuggestion.text}&rdquo;
                    </div>
                    <div className="text-[10px] text-gray-400 italic">
                      {aiSuggestion.rationale}
                    </div>
                    <div className="pt-1 flex items-center space-x-2">
                      <button
                        onClick={applyAiSuggestion}
                        className="flex-1 py-1.5 rounded-lg bg-[#C99700] hover:bg-[#D4A316] text-black font-bold text-xs transition flex items-center justify-center space-x-1 shadow"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply Rewrite</span>
                      </button>
                      <button
                        onClick={() => setAiSuggestion(null)}
                        className="px-3 py-1.5 rounded-lg bg-[#141F30] hover:bg-[#1C2C42] text-gray-300 text-xs transition"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                )}

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
                    onClick={() => removeBlock(selectedBlock.id)}
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

      {/* Visual Add Block Preset Modal */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1522] border border-[#22334A] rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1C2A3E] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#C99700]" />
                  <span>Insert Corporate Section Preset</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Select a pre-designed, brand-approved Gold Fields section template.
                </p>
              </div>
              <button
                onClick={() => setIsPresetModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#162235] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
              {BLOCK_PRESETS.map((preset) => {
                const IconComp = preset.icon;
                return (
                  <div
                    key={preset.name}
                    onClick={() => handleAddPreset(preset)}
                    className="p-4 rounded-xl bg-[#090F18] border border-[#1A273B] hover:border-[#C99700]/70 hover:bg-[#121B2A] transition cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="p-2 rounded-lg bg-[#142033] text-[#E6C657] group-hover:bg-[#C99700] group-hover:text-black transition">
                            <IconComp className="w-4 h-4" />
                          </span>
                          <span className="font-bold text-xs text-white group-hover:text-[#E6C657] transition">
                            {preset.name}
                          </span>
                        </div>
                        <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-[#101927] text-gray-400 border border-[#1E2E44]">
                          {preset.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#162234] flex items-center justify-between text-[11px] text-[#C99700] font-semibold">
                      <span>Click to Insert</span>
                      <Plus className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[#1C2A3E] flex items-center justify-end">
              <button
                onClick={() => setIsPresetModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#162234] hover:bg-[#20314A] text-xs font-semibold text-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Guided Tour Spotlight Card */}
      {isTourOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Subtle Dimming Backdrop */}
          <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={() => setIsTourOpen(false)} />

          {/* Floating Guidance Card */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg bg-[#0C1320] border-2 border-[#C99700] rounded-2xl p-6 shadow-2xl pointer-events-auto text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-[#C99700]/20 text-[#E6C657]">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {TOUR_STEPS[tourStep].title}
                  </h4>
                  <span className="text-[11px] text-[#C99700] font-medium">
                    {TOUR_STEPS[tourStep].subtitle}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-mono text-gray-400">
                  {tourStep + 1} / {TOUR_STEPS.length}
                </span>
                <button
                  onClick={() => setIsTourOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A2638] transition ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {TOUR_STEPS[tourStep].description}
            </p>

            {/* Stepper Progress Dots & Buttons */}
            <div className="pt-2 border-t border-[#1C2A3D] flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <span
                    key={i}
                    onClick={() => setTourStep(i)}
                    className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                      i === tourStep ? 'bg-[#C99700] w-5' : 'bg-gray-600 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-2">
                {tourStep > 0 && (
                  <button
                    onClick={() => setTourStep(tourStep - 1)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#141F30] hover:bg-[#1C2B42] text-xs font-medium text-gray-300 transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                )}

                {tourStep < TOUR_STEPS.length - 1 ? (
                  <button
                    onClick={() => setTourStep(tourStep + 1)}
                    className="flex items-center space-x-1 px-4 py-1.5 rounded-xl bg-[#C99700] hover:bg-[#D4A316] text-black text-xs font-bold transition shadow"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsTourOpen(false)}
                    className="flex items-center space-x-1 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold transition shadow"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Got It &amp; Start Editing</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
