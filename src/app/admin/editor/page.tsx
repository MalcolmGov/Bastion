'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Undo2,
  Redo2,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Send,
  Layers,
  FileText,
  RotateCcw,
  History,
  Palette,
  Paintbrush,
  Droplet,
  Type,
  Grid,
  CircleDot,
  Sun,
  Moon,
  Star,
  Waves,
  Ban,
  Sidebar,
  PanelLeftClose,
  PanelRightClose,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Globe,
  CalendarCheck,
  Check,
  Key,
  Box,
  AlignLeft,
  AlignCenter,
  Square,
  Sparkle,
  Maximize,
  SlidersHorizontal,
  QrCode,
  Building2,
  Quote,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import { StudioComponentRenderer } from '@/components/studio/StudioComponentRenderer';
import { SectionLibraryDrawer } from '@/components/studio/SectionLibraryDrawer';
import { DynamicZonesBuilder } from '@/components/studio/DynamicZonesBuilder';
import { InEditorContentAgent } from '@/components/studio/InEditorContentAgent';
import { MultiModelAiCodingChat } from '@/components/studio/MultiModelAiCodingChat';
import { ApiKeysTab } from '@/components/studio/ApiKeysTab';
import { COMPONENT_REGISTRY } from '@/lib/studio/componentRegistry';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, getLocaleMeta } from '@/lib/i18n/locales';
import type { SectionInstance, DesignCollectionId, BackgroundPatternType } from '@/lib/studio/types';

const SOLID_SWATCHES = [
  { name: 'Obsidian Noir', hex: '#09090B' },
  { name: 'Executive Slate', hex: '#0F172A' },
  { name: 'Royal Navy', hex: '#082B49' },
  { name: 'Deep Emerald', hex: '#062E25' },
  { name: 'Rich Plum', hex: '#1E112A' },
  { name: 'Warm Charcoal', hex: '#18181B' },
  { name: 'Editorial Sand', hex: '#FAF8F5' },
  { name: 'Pure White', hex: '#FFFFFF' }
];

const GRADIENT_PRESETS = [
  {
    name: 'Cosmic Noir',
    css: 'linear-gradient(135deg, #09090B 0%, #18181B 50%, #0F172A 100%)',
    from: '#09090B',
    to: '#0F172A'
  },
  {
    name: 'Royal Navy Depth',
    css: 'linear-gradient(135deg, #021226 0%, #082B49 50%, #0E3D66 100%)',
    from: '#021226',
    to: '#0E3D66'
  },
  {
    name: 'Emerald Depth',
    css: 'linear-gradient(135deg, #021F17 0%, #064E3B 50%, #02231B 100%)',
    from: '#021F17',
    to: '#064E3B'
  },
  {
    name: 'Carbon Gold',
    css: 'linear-gradient(135deg, #121214 0%, #23221C 50%, #3D3522 100%)',
    from: '#121214',
    to: '#3D3522'
  },
  {
    name: 'Cyber Indigo',
    css: 'linear-gradient(135deg, #0F172A 0%, #312E81 50%, #1E1B4B 100%)',
    from: '#0F172A',
    to: '#1E1B4B'
  },
  {
    name: 'Velvet Sunset',
    css: 'linear-gradient(135deg, #18092B 0%, #3B0764 50%, #0F172A 100%)',
    from: '#18092B',
    to: '#0F172A'
  },
  {
    name: 'Warm Champagne (Light)',
    css: 'linear-gradient(135deg, #FAF7F2 0%, #EFE8DC 50%, #E5DAC9 100%)',
    from: '#FAF7F2',
    to: '#E5DAC9'
  },
  {
    name: 'Ice Pearl (Light)',
    css: 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 50%, #E2E8F0 100%)',
    from: '#FFFFFF',
    to: '#E2E8F0'
  }
];

const TEXT_COLOR_SWATCHES = [
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Slate Light', hex: '#F8FAFC' },
  { name: 'Muted Slate', hex: '#94A3B8' },
  { name: 'Warm Gold', hex: '#D4AF37' },
  { name: 'Sky Azure', hex: '#38BDF8' },
  { name: 'Dark Ink', hex: '#0F172A' }
];

const ACCENT_SWATCHES = [
  { name: 'Sky Electric', hex: '#0284C7' },
  { name: 'Royal Gold', hex: '#D4AF37' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Amber Glow', hex: '#F59E0B' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Crimson', hex: '#E11D48' }
];

const PATTERN_OPTIONS: { id: BackgroundPatternType; label: string; desc: string; icon: any }[] = [
  { id: 'none', label: 'None', desc: 'Clean background', icon: Ban },
  { id: 'grid', label: 'Cyber Grid', desc: 'Architectural tech lines', icon: Grid },
  { id: 'dots', label: 'Radial Dots', desc: 'Precision matrix stipple', icon: CircleDot },
  { id: 'glow_orbs', label: 'Ambient Glow', desc: 'Luminous dual bloom', icon: Sun },
  { id: 'mesh', label: 'Conic Mesh', desc: 'Multi-hue aura blend', icon: Palette },
  { id: 'galaxy', label: 'Galaxy Stars', desc: 'Celestial starlight nodes', icon: Star },
  { id: 'aurora', label: 'Aurora Wave', desc: 'Prismatic kinetic waves', icon: Waves },
];

const FONT_OPTIONS = [
  { id: 'sans', label: 'Modern Sans', preview: 'Aa', desc: 'Clean Swiss Tech (Inter / Geist)', fontClass: 'font-sans' },
  { id: 'serif', label: 'Editorial Serif', preview: 'Aa', desc: 'Luxury Institutional (Playfair / Merriweather)', fontClass: 'font-serif' },
  { id: 'mono', label: 'Precision Mono', preview: 'Aa', desc: 'Engineering & Quant (JetBrains Mono)', fontClass: 'font-mono' },
];

const HEADING_SCALE_OPTIONS = [
  { id: 'compact', label: 'Compact', desc: '3xl / 4xl' },
  { id: 'normal', label: 'Balanced', desc: '4xl / 5xl' },
  { id: 'hero', label: 'Hero', desc: '5xl / 6xl' },
  { id: 'ultra', label: 'Ultra Display', desc: '7xl / 8xl' },
];

const LETTER_SPACING_OPTIONS = [
  { id: 'tighter', label: '-0.05em', name: 'Tighter' },
  { id: 'tight', label: '-0.025em', name: 'Tight' },
  { id: 'normal', label: '0', name: 'Normal' },
  { id: 'wide', label: '+0.025em', name: 'Wide' },
  { id: 'expanded', label: '+0.05em', name: 'Expanded' },
];

const CONTAINER_WIDTH_OPTIONS = [
  { id: 'compact', label: 'Compact', detail: 'max-w-4xl (896px)' },
  { id: 'standard', label: 'Standard', detail: 'max-w-6xl (1152px)' },
  { id: 'wide', label: 'Wide', detail: 'max-w-7xl (1280px)' },
  { id: 'full', label: 'Full Bleed', detail: '100% Bleed' },
];

const BORDER_RADIUS_OPTIONS = [
  { id: 'none', label: '0px', name: 'Sharp', iconClass: 'rounded-none' },
  { id: 'sm', label: '2px', name: 'Subtle', iconClass: 'rounded-xs' },
  { id: 'md', label: '6px', name: 'Soft', iconClass: 'rounded-md' },
  { id: 'lg', label: '8px', name: 'Standard', iconClass: 'rounded-lg' },
  { id: 'xl', label: '12px', name: 'Curved', iconClass: 'rounded-xl' },
  { id: '2xl', label: '16px', name: 'Glass', iconClass: 'rounded-2xl' },
  { id: 'full', label: '99px', name: 'Pill', iconClass: 'rounded-full' },
];

const GLOW_OPTIONS = [
  { id: 'none', name: 'None', color: 'transparent' },
  { id: 'blue', name: 'Cyan Bloom', color: '#38BDF8' },
  { id: 'gold', name: 'Royal Gold', color: '#F59E0B' },
  { id: 'emerald', name: 'Emerald', color: '#10B981' },
  { id: 'purple', name: 'Deep Violet', color: '#A855F7' },
  { id: 'rose', name: 'Rose Bloom', color: '#F43F5E' },
];

const PADDING_OPTIONS = [
  { id: 'py-8', label: '32px', name: 'Minimal' },
  { id: 'py-12', label: '48px', name: 'Compact' },
  { id: 'py-16', label: '64px', name: 'Standard' },
  { id: 'py-20', label: '80px', name: 'Balanced' },
  { id: 'py-24', label: '96px', name: 'Relaxed' },
  { id: 'py-28', label: '112px', name: 'Spacious' },
  { id: 'py-36', label: '144px', name: 'Epic' },
];

function VisualWebsiteEditorContent() {
  const searchParams = useSearchParams();
  const siteSlugParam = searchParams.get('siteSlug') || searchParams.get('siteId');
  const { activeClient, activeSite, setActiveClientId, setActiveSiteId } = useStudioWorkspace();

  const siteSlug = siteSlugParam || activeSite?.slug || 'apex-advisory';

  // Responsive Viewport: 'desktop' | 'tablet' | 'mobile'
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Canvas Theme: 'auto' | 'light' | 'dark'
  const [canvasTheme, setCanvasTheme] = useState<'auto' | 'light' | 'dark'>('auto');

  // Active page
  const [activePageSlug, setActivePageSlug] = useState(searchParams.get('pageSlug') || 'home');

  // Loaded site, brand kit, and compositions
  const [siteData, setSiteData] = useState<any>(null);
  const [brandKit, setBrandKit] = useState<any>(null);
  const [sections, setSections] = useState<SectionInstance[]>([]);

  // Compute if canvas should render in dark theme
  const isCanvasDark =
    canvasTheme === 'dark' ||
    (canvasTheme === 'auto' &&
      sections.some(
        s =>
          s.styles?.theme === 'dark' ||
          (s.styles as any)?.theme === 'dark' ||
          s.styles?.backgroundColor?.includes('5, 8, 15') ||
          s.styles?.backgroundColor === '#0A0D14' ||
          s.styles?.backgroundColor === '#09090B' ||
          s.styles?.backgroundColor === '#070B12' ||
          s.styles?.backgroundColor === '#05080F'
      ));

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [focusedFieldPath, setFocusedFieldPath] = useState<string | null>(null);

  // Undo / Redo history
  const [history, setHistory] = useState<SectionInstance[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState(false);
  const [savedTime, setSavedTime] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // AI Assistant Panel state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Inspector Active Tab: 'content' | 'design' | 'ai' | 'keys'
  const [inspectorTab, setInspectorTab] = useState<'content' | 'design' | 'ai' | 'keys'>('content');
  const [isLocaleMenuOpen, setIsLocaleMenuOpen] = useState(false);

  // Dynamic Zones Builder Left Panel Mode: 'dynamic_zones' | 'outline' | 'brand_vault'
  const [leftPanelMode, setLeftPanelMode] = useState<'dynamic_zones' | 'outline' | 'brand_vault'>('dynamic_zones');
  const [isContentAgentModalOpen, setIsContentAgentModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedQrUrl, setCopiedQrUrl] = useState(false);

  // Collapsible panels & Zen focus mode
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);

  const toggleZenMode = () => {
    if (isZenMode) {
      setIsZenMode(false);
      setIsLeftPanelOpen(true);
      setIsRightPanelOpen(true);
    } else {
      setIsZenMode(true);
      setIsLeftPanelOpen(false);
      setIsRightPanelOpen(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('set-admin-sidebar-collapsed', { detail: { collapsed: true } }));
      }
    }
  };

  // Resizable Panel Widths (Mouse Drag & Expand/Collapse)
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(320);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(440);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Restore saved panel widths from localStorage
  useEffect(() => {
    try {
      const savedLeft = localStorage.getItem('bastion_editor_left_panel_width');
      if (savedLeft) {
        const val = parseInt(savedLeft, 10);
        if (!isNaN(val) && val >= 220 && val <= 600) setLeftPanelWidth(val);
      }
      const savedRight = localStorage.getItem('bastion_editor_right_panel_width');
      if (savedRight) {
        const val = parseInt(savedRight, 10);
        if (!isNaN(val) && val >= 320 && val <= 850) setRightPanelWidth(val);
      }
    } catch {}
  }, []);

  // Global mousemove and mouseup listeners for smooth panel dragging
  useEffect(() => {
    if (!isDraggingLeft && !isDraggingRight) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!editorContainerRef.current) return;
      const rect = editorContainerRef.current.getBoundingClientRect();

      if (isDraggingLeft) {
        const newWidth = Math.round(e.clientX - rect.left);
        if (newWidth < 140) {
          setIsLeftPanelOpen(false);
        } else {
          setIsLeftPanelOpen(true);
          const clamped = Math.max(220, Math.min(600, newWidth));
          setLeftPanelWidth(clamped);
          try { localStorage.setItem('bastion_editor_left_panel_width', String(clamped)); } catch {}
        }
      } else if (isDraggingRight) {
        const newWidth = Math.round(rect.right - e.clientX);
        if (newWidth < 160) {
          setIsRightPanelOpen(false);
        } else {
          setIsRightPanelOpen(true);
          const clamped = Math.max(340, Math.min(850, newWidth));
          setRightPanelWidth(clamped);
          try { localStorage.setItem('bastion_editor_right_panel_width', String(clamped)); } catch {}
        }
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingLeft, isDraggingRight]);

  // Gradient Custom Builder State
  const [customGradDir, setCustomGradDir] = useState('135deg');
  const [customGradFrom, setCustomGradFrom] = useState('#09090B');
  const [customGradTo, setCustomGradTo] = useState('#0F172A');

  // Multi-Locale (i18n) Engine State
  const [selectedLocale, setSelectedLocale] = useState<string>(DEFAULT_LOCALE);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationNotice, setTranslationNotice] = useState<string | null>(null);

  // Content Releases Bundling State
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [availableReleases, setAvailableReleases] = useState<any[]>([]);
  const [selectedReleaseId, setSelectedReleaseId] = useState<string>('');
  const [releaseNote, setReleaseNote] = useState('');
  const [isAddingToRelease, setIsAddingToRelease] = useState(false);
  const [releaseStatusMsg, setReleaseStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Page Composition Version History & Rollback State
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [rollbackStatusMsg, setRollbackStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentVersionNumber, setCurrentVersionNumber] = useState<number>(1);

  // Fetch composition from API
  useEffect(() => {
    async function loadComposition() {
      try {
        const res = await fetch(`/api/admin/editor?siteId=${siteSlug}&pageSlug=${activePageSlug}`);
        if (res.ok) {
          const data = await res.json();
          setSiteData(data.site);
          setBrandKit(data.brandKit);

          if (data.site?.id && data.site?.clientId) {
            setActiveClientId(data.site.clientId);
            setActiveSiteId(data.site.id);
          }

          const comp = data.compositions?.find((c: any) => c.pageSlug === activePageSlug) || data.compositions?.[0];
          if (comp?.sections) {
            setSections(comp.sections);
            setHistory([comp.sections]);
            setHistoryIndex(0);
            if (comp.sections[0]) {
              setSelectedSectionId(comp.sections[0].id);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load editor composition:', err);
      }
    }
    loadComposition();
  }, [siteSlug, activePageSlug]);

  const updateSections = (newSections: SectionInstance[], recordHistory = true) => {
    setSections(newSections);
    setHasUnsavedChanges(true);
    if (recordHistory) {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(newSections);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setSections(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setSections(next);
    }
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIdx, 0, moved);
    updateSections(reordered);
  };

  const handleToggleVisibility = (id: string) => {
    const updated = sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s);
    updateSections(updated);
  };

  const handleDuplicateSection = (index: number) => {
    const item = sections[index];
    const clone: SectionInstance = {
      ...item,
      id: `sec_${Date.now()}`,
      props: JSON.parse(JSON.stringify(item.props))
    };
    const updated = [...sections];
    updated.splice(index + 1, 0, clone);
    updateSections(updated);
    setSelectedSectionId(clone.id);
  };

  const handleDeleteSection = (id: string) => {
    if (sections.length <= 1) return;
    const updated = sections.filter(s => s.id !== id);
    updateSections(updated);
    if (selectedSectionId === id) {
      setSelectedSectionId(updated[0]?.id || null);
    }
  };

  const handleMoveUpById = (sectionId: string) => {
    const idx = sections.findIndex(s => s.id === sectionId);
    if (idx > 0) handleMoveSection(idx, 'up');
  };

  const handleMoveDownById = (sectionId: string) => {
    const idx = sections.findIndex(s => s.id === sectionId);
    if (idx !== -1 && idx < sections.length - 1) handleMoveSection(idx, 'down');
  };

  const handleDuplicateById = (sectionId: string) => {
    const idx = sections.findIndex(s => s.id === sectionId);
    if (idx !== -1) handleDuplicateSection(idx);
  };

  const handleSelectField = (sectionId: string, fieldPath: string) => {
    setSelectedSectionId(sectionId);
    setFocusedFieldPath(fieldPath);
    if (!isRightPanelOpen) setIsRightPanelOpen(true);
    setInspectorTab('content');

    setTimeout(() => {
      const el = document.getElementById(`field-${fieldPath}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
        el.classList.add('ring-2', 'ring-cyan-400');
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-cyan-400');
        }, 1500);
      }
    }, 120);
  };

  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const handleInsertSection = (componentId: string) => {
    const regComp = COMPONENT_REGISTRY[componentId];
    const newId = `sec_${siteSlug || 'site'}_${componentId}_${Date.now()}`;
    const newSection: SectionInstance = {
      id: newId,
      componentId,
      variant: regComp?.variants[0]?.id || 'default',
      visible: true,
      props: regComp ? JSON.parse(JSON.stringify(regComp.defaultProps)) : {},
      styles: {
        backgroundType: 'solid',
        backgroundColor: '#0A0D14',
        headingColor: '#FFFFFF',
        textColor: '#94A3B8',
        accentColor: '#38BDF8',
        paddingY: 'py-24'
      }
    };

    let insertIdx = sections.length;
    if (selectedSectionId) {
      const selIdx = sections.findIndex(s => s.id === selectedSectionId);
      if (selIdx !== -1) insertIdx = selIdx + 1;
    } else {
      const ftrIdx = sections.findIndex(s => s.componentId === 'footer');
      if (ftrIdx !== -1) insertIdx = ftrIdx;
    }

    const updated = [...sections.slice(0, insertIdx), newSection, ...sections.slice(insertIdx)];
    updateSections(updated);
    setSelectedSectionId(newId);
  };

  const CORPORATE_BRAND_VAULT = [
    {
      id: 'bv_executive_quote',
      title: 'Executive Quote & Signature',
      category: 'Leadership & Vision',
      icon: Quote,
      description: 'Prominent C-Suite message with high-contrast portrait, name, designation, and corporate signature line.',
      componentId: 'rich_text',
      variant: 'editorial_quote',
      defaultProps: {
        headline: 'A Message from our Leadership',
        quote: 'Our commitment to sustainable mining, operational discipline, and shareholder value creation remains unwavering.',
        author: 'Malcolm Govender',
        title: 'Chief Executive Officer',
        organization: 'Corporate Board of Directors'
      }
    },
    {
      id: 'bv_financial_metrics',
      title: 'Key Operating & Financial Metrics',
      category: 'Investor Relations',
      icon: TrendingUp,
      description: '4-pillar statistical counter displaying gold production, revenue, EBITDA margin, and dividend yield.',
      componentId: 'hero',
      variant: 'contemporary_bold',
      defaultProps: {
        headline: 'Unlocking Long-Term Sustainable Value',
        subheadline: 'Proven operational excellence across our global asset portfolio.',
        primaryButtonText: 'View Q3 2026 Results',
        primaryButtonUrl: '/admin/calendar',
        secondaryButtonText: 'Download Integrated Report',
        secondaryButtonUrl: '/admin/reports',
        stats: [
          { label: 'Gold Equivalent Ounces', value: '2.4Moz', subtext: '+4.2% YoY Growth' },
          { label: 'All-In Sustaining Costs', value: '$1,190/oz', subtext: 'Top Quartile Efficiency' },
          { label: 'Interim Dividend', value: '450cps', subtext: 'Paid Oct 2026' },
          { label: 'Renewable Power Mix', value: '42%', subtext: 'On track for 2030' }
        ]
      }
    },
    {
      id: 'bv_esg_targets',
      title: '2030 ESG Strategic Targets',
      category: 'Sustainability & Governance',
      icon: ShieldCheck,
      description: 'Structured 3-column scorecard showing Net-Zero carbon progress, water stewardship, and community impact.',
      componentId: 'services_grid',
      variant: 'cards_3col',
      defaultProps: {
        headline: 'Our 2030 ESG Commitments',
        subheadline: 'Targeted sustainability pillars aligned with UN SDGs and King IV principles.',
        services: [
          {
            title: 'Decarbonization & Clean Energy',
            description: 'Achieve 50% net reduction in Scope 1 & 2 carbon emissions by 2030, powered by renewable microgrids.',
            deliverables: ['Khanyisa Solar Plant', 'Agnew Wind Hybrid', 'Scope 1 & 2 Net Zero by 2050']
          },
          {
            title: 'Water Stewardship & Tailings',
            description: 'Zero catastrophic tailings failures, full GISTM compliance, and 85% water recycled across all operations.',
            deliverables: ['Dry Stack Tailings', 'Real-time Satellite InSAR', 'Zero Harm Protocol']
          },
          {
            title: 'Community Shared Value',
            description: 'Investing in host community health, local procurement, and enterprise development programs.',
            deliverables: ['80% Local Workforce', 'Community Clinics', 'Tertiary STEM Bursaries']
          }
        ]
      }
    },
    {
      id: 'bv_ir_contact',
      title: 'Investor Relations & Media Inquiries',
      category: 'Corporate Comms',
      icon: Building2,
      description: 'Corporate affairs contact box with spokesperson details, JSE sponsor accreditation, and registered office.',
      componentId: 'cta',
      variant: 'split_card',
      defaultProps: {
        headline: 'Institutional Investor & Analyst Inquiries',
        subheadline: 'For investor relations inquiries, financial releases, or executive interview requests, reach our team directly.',
        buttonText: 'Schedule IR Briefing',
        buttonUrl: 'mailto:ir@goldfields.com',
        contactInfo: {
          phone: '+27 11 562 9700',
          email: 'investors@goldfields.com',
          hours: 'Mon - Fri: 08:00 - 17:00 SAST'
        }
      }
    }
  ];

  const handleInsertCorporateBlock = (block: typeof CORPORATE_BRAND_VAULT[0]) => {
    const newId = `sec_${siteSlug || 'site'}_${block.componentId}_${Date.now()}`;
    const newSection: SectionInstance = {
      id: newId,
      componentId: block.componentId,
      variant: block.variant,
      visible: true,
      props: JSON.parse(JSON.stringify(block.defaultProps)),
      styles: {
        backgroundType: 'solid',
        backgroundColor: '#0A0D14',
        headingColor: '#FFFFFF',
        textColor: '#94A3B8',
        accentColor: '#38BDF8',
        paddingY: 'py-24'
      }
    };

    let insertIdx = sections.length;
    if (selectedSectionId) {
      const selIdx = sections.findIndex(s => s.id === selectedSectionId);
      if (selIdx !== -1) insertIdx = selIdx + 1;
    } else {
      const ftrIdx = sections.findIndex(s => s.componentId === 'footer');
      if (ftrIdx !== -1) insertIdx = ftrIdx;
    }

    const updated = [...sections.slice(0, insertIdx), newSection, ...sections.slice(insertIdx)];
    updateSections(updated);
    setSelectedSectionId(newId);
  };

  const handlePropChange = (field: string, val: any) => {
    if (!selectedSectionId) return;
    const updated = sections.map(s => {
      if (s.id !== selectedSectionId) return s;
      return {
        ...s,
        props: {
          ...s.props,
          [field]: val
        }
      };
    });
    updateSections(updated);
  };

  const handleMultiplePropsChange = (newProps: Record<string, any>, newStyles?: Record<string, any>, explicitTargetId?: string) => {
    let targetId: string | null | undefined = explicitTargetId;

    if (!targetId || !sections.some(s => s.id === targetId)) {
      if (newProps?.brandName || newProps?.logoDarkUrl || newProps?.logoUrl || newProps?.allLinks) {
        const headerSec = sections.find(s => s.componentId === 'header');
        if (headerSec) targetId = headerSec.id;
      } else if (newProps?.copyright || newProps?.officeAddress || newProps?.socialLinks) {
        const footerSec = sections.find(s => s.componentId === 'footer');
        if (footerSec) targetId = footerSec.id;
      } else if (newProps?.services) {
        const servicesSec = sections.find(s => s.componentId === 'services_grid');
        if (servicesSec) targetId = servicesSec.id;
      } else if (newProps?.title || newProps?.badge || newProps?.stats || newProps?.titleColor || newStyles?.headingColor || newStyles?.textColor) {
        const heroSec = sections.find(s => s.componentId === 'hero');
        if (heroSec) targetId = heroSec.id;
      }
    }

    if (!targetId) {
      targetId = selectedSectionId || (sections.length > 0 ? sections[0].id : null);
    }
    if (!targetId) return;

    setSelectedSectionId(targetId);

    // If newStyles targets dark theme, activate dark canvas wrapper
    if (newStyles?.theme === 'dark' || newStyles?.backgroundColor?.includes('5, 8, 15') || newStyles?.backgroundColor === '#0A0D14' || newStyles?.backgroundColor === '#070B12') {
      setCanvasTheme('dark');
    }

    const updated = sections.map(s => {
      if (s.id !== targetId) return s;

      const mergedProps: Record<string, any> = { ...s.props };
      for (const [k, v] of Object.entries(newProps || {})) {
        if (v !== undefined && v !== null) {
          if (typeof v === 'object' && !Array.isArray(v) && typeof mergedProps[k] === 'object' && !Array.isArray(mergedProps[k])) {
            mergedProps[k] = { ...mergedProps[k], ...v };
          } else {
            mergedProps[k] = v;
          }
        }
      }

      return {
        ...s,
        props: mergedProps,
        styles: newStyles ? { ...(s.styles || {}), ...newStyles } : s.styles
      };
    });

    updateSections(updated);
  };

  const handleApplyDarkThemeToAllSections = () => {
    setCanvasTheme('dark');
    const updated = sections.map(s => {
      const darkStyles: Record<string, any> = {
        theme: 'dark',
        textColor: '#F8FAFC',
        borderColor: 'rgba(255, 255, 255, 0.08)'
      };

      if (s.componentId === 'header') {
        darkStyles.backgroundColor = 'rgba(5, 8, 15, 0.85)';
        darkStyles.backgroundType = 'solid';
        darkStyles.backdropBlur = '16px';
        darkStyles.bottomAccentLine = 'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.5) 50%, transparent 100%)';
        darkStyles.brandTextColor = '#F8FAFC';
      } else if (s.componentId === 'hero') {
        darkStyles.backgroundColor = '#070B12';
        darkStyles.backgroundType = 'solid';
        darkStyles.headingColor = '#FFFFFF';
        darkStyles.accentColor = '#38BDF8';
      } else if (s.componentId === 'services_grid') {
        darkStyles.backgroundColor = '#090D16';
        darkStyles.backgroundType = 'solid';
      } else if (s.componentId === 'cta') {
        darkStyles.backgroundColor = '#070B12';
        darkStyles.backgroundType = 'solid';
      } else if (s.componentId === 'footer') {
        darkStyles.backgroundColor = '#05080F';
        darkStyles.backgroundType = 'solid';
      } else {
        darkStyles.backgroundColor = '#070B12';
        darkStyles.backgroundType = 'solid';
      }

      return {
        ...s,
        styles: { ...(s.styles || {}), ...darkStyles }
      };
    });

    updateSections(updated);
  };

  const handleVariantChange = (variantId: string) => {
    if (!selectedSectionId) return;
    const updated = sections.map(s => {
      if (s.id !== selectedSectionId) return s;
      return { ...s, variant: variantId };
    });
    updateSections(updated);
  };

  const handleStyleChange = (field: string, val: any) => {
    if (!selectedSectionId) return;
    const updated = sections.map(s => {
      if (s.id !== selectedSectionId) return s;
      const currentStyles = s.styles || {};
      const newStyles = { ...currentStyles, [field]: val };
      return {
        ...s,
        styles: newStyles
      };
    });
    updateSections(updated);
  };

  const handleApplyGradientPreset = (gradientStr: string, presetName: string, from?: string, to?: string) => {
    if (!selectedSectionId) return;
    if (from) setCustomGradFrom(from);
    if (to) setCustomGradTo(to);
    const updated: SectionInstance[] = sections.map(s => {
      if (s.id !== selectedSectionId) return s;
      return {
        ...s,
        styles: {
          ...s.styles,
          backgroundType: 'gradient' as const,
          gradient: gradientStr,
          gradientPreset: presetName,
          ...(from ? { gradientFrom: from } : {}),
          ...(to ? { gradientTo: to } : {})
        }
      };
    });
    updateSections(updated);
  };

  const handleUpdateCustomGradient = (dir: string, from: string, to: string) => {
    const grad = dir === 'radial'
      ? `radial-gradient(circle at center, ${from} 0%, ${to} 100%)`
      : `linear-gradient(${dir}, ${from} 0%, ${to} 100%)`;
    if (!selectedSectionId) return;
    const updated: SectionInstance[] = sections.map(s => {
      if (s.id !== selectedSectionId) return s;
      return {
        ...s,
        styles: {
          ...s.styles,
          backgroundType: 'gradient' as const,
          gradient: grad,
          gradientDirection: dir,
          gradientFrom: from,
          gradientTo: to
        }
      };
    });
    updateSections(updated);
  };

  const handleResetSectionStyles = () => {
    if (!selectedSectionId) return;
    const updated: SectionInstance[] = sections.map(s => {
      if (s.id !== selectedSectionId) return s;
      return {
        ...s,
        styles: {
          backgroundType: 'default' as const,
          backgroundColor: undefined,
          gradient: undefined,
          textColor: undefined,
          headingColor: undefined,
          accentColor: undefined,
          paddingY: undefined
        }
      };
    });
    updateSections(updated);
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: siteData?.id || siteSlug,
          pageSlug: activePageSlug,
          sections,
          title: `${siteData?.name || 'Site'} — ${activePageSlug.toUpperCase()}`,
          status: 'draft'
        })
      });
      if (res.ok) {
        const saveRes = await res.json();
        if (saveRes.version) {
          setCurrentVersionNumber(Number(saveRes.version));
        }
        setSavedTime(new Date().toLocaleTimeString());
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.warn('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeployPublish = async () => {
    setIsDeploying(true);
    setDeploySuccess(false);
    try {
      const res = await fetch('/api/admin/editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: siteData?.id || siteSlug,
          pageSlug: activePageSlug,
          sections,
          title: `${siteData?.name || 'Site'} — ${activePageSlug.toUpperCase()}`,
          status: 'published'
        })
      });
      if (res.ok) {
        const saveRes = await res.json();
        if (saveRes.version) {
          setCurrentVersionNumber(Number(saveRes.version));
        }
        setSavedTime(new Date().toLocaleTimeString());
        setHasUnsavedChanges(false);
        setDeploySuccess(true);
        setTimeout(() => setDeploySuccess(false), 4000);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to deploy updates');
      }
    } catch (err) {
      console.warn('Deploy error:', err);
    } finally {
      setIsDeploying(false);
    }
  };

  // Open Content Release Bundling Modal
  const handleOpenReleaseModal = async () => {
    setIsReleaseModalOpen(true);
    setReleaseStatusMsg(null);
    try {
      const res = await fetch(`/api/admin/releases?siteId=${siteData?.id || siteSlug}`);
      if (res.ok) {
        const data = await res.json();
        const nonPublished = (data.releases || []).filter((r: any) => r.status !== 'published');
        setAvailableReleases(nonPublished);
        if (nonPublished.length > 0 && !selectedReleaseId) {
          setSelectedReleaseId(nonPublished[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load releases:', err);
    }
  };

  // Bundle Page Composition into Content Release
  const handleConfirmAddToRelease = async () => {
    if (!selectedReleaseId) {
      setReleaseStatusMsg({ type: 'error', text: 'Please select a release to bundle into.' });
      return;
    }

    try {
      setIsAddingToRelease(true);
      setReleaseStatusMsg(null);

      const targetRelease = availableReleases.find(r => r.id === selectedReleaseId);
      const res = await fetch(`/api/admin/releases/${selectedReleaseId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType: 'page',
          itemId: `${siteData?.id || siteSlug}:${activePageSlug}`,
          title: `${siteData?.name || 'Website'} - ${activePageSlug.toUpperCase()} (${selectedLocale.toUpperCase()})`,
          action: 'publish',
          changesSummary: releaseNote.trim() || `Bundled ${sections.length} blocks in ${selectedLocale.toUpperCase()} locale`,
          snapshot: { sections, locale: selectedLocale }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add item to release');

      setReleaseStatusMsg({
        type: 'success',
        text: `Successfully bundled "${activePageSlug.toUpperCase()}" into ${targetRelease?.name || 'release'}!`
      });
      setTimeout(() => {
        setIsReleaseModalOpen(false);
        setReleaseStatusMsg(null);
        setReleaseNote('');
      }, 1800);
    } catch (err: any) {
      setReleaseStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsAddingToRelease(false);
    }
  };

  // Open Version History Modal & Fetch Historical Snapshots
  const handleOpenVersionModal = async () => {
    setIsVersionModalOpen(true);
    setIsLoadingVersions(true);
    setRollbackStatusMsg(null);
    try {
      const siteId = siteData?.id || siteSlug;
      const res = await fetch(`/api/admin/editor/versions?siteId=${siteId}&pageSlug=${activePageSlug}`);
      if (res.ok) {
        const data = await res.json();
        setVersionHistory(data.versions || []);
      }
    } catch (err) {
      console.error('Failed to load version history:', err);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  // Roll back to an immutable historical version snapshot
  const handleRollback = async (targetVersion: number) => {
    if (!confirm(`Are you sure you want to roll back this page to Version ${targetVersion}? A new version will be created preserving your audit history.`)) {
      return;
    }
    setIsRollingBack(true);
    setRollbackStatusMsg(null);
    try {
      const siteId = siteData?.id || siteSlug;
      const res = await fetch('/api/admin/editor/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          pageSlug: activePageSlug,
          targetVersion
        })
      });
      const data = await res.json();
      if (res.ok) {
        setRollbackStatusMsg({ type: 'success', text: `Successfully restored Version ${targetVersion} as Version ${data.newVersion}!` });
        if (data.sections) {
          updateSections(data.sections, true);
        }
        if (data.newVersion) {
          setCurrentVersionNumber(Number(data.newVersion));
        }
        setSavedTime(new Date().toLocaleTimeString());
        // Refresh version list
        handleOpenVersionModal();
      } else {
        setRollbackStatusMsg({ type: 'error', text: data.error || 'Failed to roll back version.' });
      }
    } catch (err: any) {
      setRollbackStatusMsg({ type: 'error', text: err.message || 'Rollback error' });
    } finally {
      setIsRollingBack(false);
    }
  };

  // In-Editor AI Translation for the Selected Section
  const handleTranslateSection = async (targetLocale: string) => {
    if (!selectedSection) return;

    try {
      setIsTranslating(true);
      setTranslationNotice(null);

      const fieldsToTranslate: Record<string, string> = {};
      if (selectedSection.props.title) fieldsToTranslate.title = selectedSection.props.title;
      if (selectedSection.props.subtitle) fieldsToTranslate.subtitle = selectedSection.props.subtitle;
      if (selectedSection.props.description) fieldsToTranslate.description = selectedSection.props.description;
      if (selectedSection.props.badge) fieldsToTranslate.badge = selectedSection.props.badge;
      if (selectedSection.props.eyebrow) fieldsToTranslate.eyebrow = selectedSection.props.eyebrow;
      if (selectedSection.props.ctaText) fieldsToTranslate.ctaText = selectedSection.props.ctaText;

      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLocale,
          sourceLocale: 'en',
          fields: fieldsToTranslate,
          context: 'Bastion Corporate Website & Disclosures'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Translation failed');

      if (data.translatedFields) {
        const updatedProps = { ...selectedSection.props };
        Object.entries(data.translatedFields).forEach(([k, v]) => {
          updatedProps[k] = v;
        });

        const updatedSections = sections.map(s => s.id === selectedSection.id ? { ...s, props: updatedProps } : s);
        updateSections(updatedSections);
        setTranslationNotice(`Translated into ${data.targetLocaleName || targetLocale.toUpperCase()}! Financial metrics preserved.`);
        setTimeout(() => setTranslationNotice(null), 4000);
      }
    } catch (err: any) {
      setTranslationNotice(`Translation error: ${err.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleAIAction = async (action: string) => {
    if (!selectedSection) return;
    setAiLoading(true);
    setAiNotice(null);

    try {
      const res = await fetch('/api/admin/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          inputContent: selectedSection.props.title || selectedSection.props.quote || '',
          prompt: aiPrompt,
          context: {
            brandKit,
            componentId: selectedSection.componentId,
            currentVariant: selectedSection.variant,
            composition: { sections }
          }
        })
      });

      const data = await res.json();
      if (data.result && selectedSection.props.title) {
        handlePropChange('title', data.result);
      }
      if (data.suggestedVariant) {
        handleVariantChange(data.suggestedVariant);
      }
      if (data.reorderedSectionIds) {
        const reordered = data.reorderedSectionIds
          .map((id: string) => sections.find(s => s.id === id))
          .filter(Boolean) as SectionInstance[];
        if (reordered.length === sections.length) {
          updateSections(reordered);
        }
      }
      setAiNotice(`${data.explanation} (${data.providerNotice})`);
      setAiPrompt('');
    } catch (err: any) {
      setAiNotice(`AI execution notice: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const selectedSection = sections.find(s => s.id === selectedSectionId);
  const collection: DesignCollectionId = (siteData?.designCollectionId as any) || 'contemporary';
  const registeredComp = selectedSection ? COMPONENT_REGISTRY[selectedSection.componentId] : null;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-slate-100 dark:bg-[#070B12] -m-6 lg:-m-8 select-none">
      {/* Top Editor Toolbar */}
      <div className="h-14 bg-white dark:bg-[#0A0D14] border-b border-slate-200 dark:border-[#1E293B] px-4 lg:px-6 flex items-center justify-between z-30 shrink-0 gap-3">
        <div className="flex items-center space-x-2.5 text-xs min-w-0">
          {/* Main Bastion Sidebar Toggle */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('toggle-admin-sidebar'));
              }
            }}
            title="Toggle Bastion Navigation Sidebar (⌘B)"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
          >
            <Sidebar className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 truncate">
            <span className="font-bold text-slate-900 dark:text-white tracking-wide truncate">{siteData?.name || 'Bastion Editor'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-blue-50 dark:bg-sky-950 text-bastion-blue dark:text-sky-400 border border-blue-200 dark:border-sky-800 shrink-0">
              {collection.toUpperCase()}
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

          {/* Page Selector Pill */}
          <div className="hidden md:flex space-x-1 bg-slate-100 dark:bg-[#141C2A] p-1 rounded-lg border border-slate-200 dark:border-[#232F42] shrink-0">
            {['home', 'about', 'services', 'contact'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setActivePageSlug(p)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold capitalize transition ${
                  activePageSlug === p
                    ? 'bg-bastion text-white dark:bg-sky-500 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Compact Multi-Locale (i18n) Dropdown */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsLocaleMenuOpen(!isLocaleMenuOpen)}
              title="Change active preview locale"
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#141C2A] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#232F42] text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{getLocaleMeta(selectedLocale).flag}</span>
              <span className="uppercase font-mono">{selectedLocale}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isLocaleMenuOpen && (
              <div className="absolute left-0 mt-1 w-44 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800/60">
                  Select Language
                </div>
                {SUPPORTED_LOCALES.map((loc) => (
                  <button
                    key={loc.code}
                    type="button"
                    onClick={() => {
                      setSelectedLocale(loc.code);
                      setIsLocaleMenuOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/70 transition cursor-pointer ${
                      selectedLocale === loc.code ? 'text-sky-500 font-bold bg-sky-50/50 dark:bg-sky-950/30' : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{loc.flag}</span>
                      <span>{loc.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{loc.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Viewport & Panel Controls */}
        <div className="flex items-center space-x-2">
          {/* Viewport Width Controls */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-[#141C2A] p-1 rounded-xl border border-slate-200 dark:border-[#232F42]">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              title="Desktop Viewport (1440px)"
              className={`p-1.5 rounded-lg transition ${
                viewport === 'desktop' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              title="Tablet Viewport (768px)"
              className={`p-1.5 rounded-lg transition ${
                viewport === 'tablet' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              title="Mobile Viewport (375px)"
              className={`p-1.5 rounded-lg transition ${
                viewport === 'mobile' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsQrModalOpen(true)}
              title="Executive Phone Preview (Scan QR code)"
              className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-500/20 transition flex items-center space-x-1 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden xl:inline text-[10px] font-bold">QR</span>
            </button>
          </div>

          {/* Canvas Theme Toggle (Light / Dark) */}
          <button
            type="button"
            onClick={() => setCanvasTheme(isCanvasDark ? 'light' : 'dark')}
            title={isCanvasDark ? 'Switch Canvas Preview to Light Mode' : 'Switch Canvas Preview to Dark Mode'}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
              isCanvasDark
                ? 'bg-slate-800 border-slate-700 text-sky-300 hover:text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isCanvasDark ? <Moon className="w-3.5 h-3.5 text-sky-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span className="hidden md:inline">{isCanvasDark ? 'Dark Canvas' : 'Light Canvas'}</span>
          </button>

          {/* Panel Visibility & Focus Controls */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-[#141C2A] p-1 rounded-xl border border-slate-200 dark:border-[#232F42]">
            <button
              type="button"
              onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
              title={isLeftPanelOpen ? 'Collapse Dynamic Zones Panel' : 'Expand Dynamic Zones Panel'}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                isLeftPanelOpen ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Blocks</span>
            </button>

            <button
              type="button"
              onClick={toggleZenMode}
              title={isZenMode ? 'Exit Zen Focus Mode' : 'Zen Focus Mode (Hide Panels)'}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                isZenMode ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{isZenMode ? 'Exit Zen' : 'Zen'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
              title={isRightPanelOpen ? 'Collapse Inspector Panel' : 'Expand Inspector Panel'}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                isRightPanelOpen ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Inspector</span>
            </button>
          </div>
        </div>

        {/* Undo/Redo & Save Actions */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <button
              type="button"
              disabled={historyIndex <= 0}
              onClick={handleUndo}
              title="Undo change"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={historyIndex >= history.length - 1}
              onClick={handleRedo}
              title="Redo change"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <span className="text-slate-600">|</span>

          {hasUnsavedChanges ? (
            <span className="text-[11px] text-amber-400 font-medium">Unsaved changes</span>
          ) : savedTime ? (
            <span className="text-[11px] text-slate-500 font-mono">Saved at {savedTime}</span>
          ) : null}

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving || isDeploying}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={handleDeployPublish}
            disabled={isDeploying || isSaving}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
            title="Deploy and publish live website updates with zero code"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isDeploying ? 'Deploying...' : deploySuccess ? 'Deployed Live!' : 'Deploy Updates'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenVersionModal}
            title="Page Version History & Rollback"
            className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer border bg-slate-100 dark:bg-[#141C2A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#232F42] hover:text-white hover:border-slate-600"
          >
            <History className="w-3.5 h-3.5 text-indigo-400" />
            <span>v{currentVersionNumber} History</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRightPanelOpen(true);
              setInspectorTab('keys');
            }}
            title="Manage AI API Keys (Claude, OpenAI, Gemini, DeepSeek, Qwen)"
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer border ${
              inspectorTab === 'keys' && isRightPanelOpen
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-xs'
                : 'bg-slate-100 dark:bg-[#141C2A] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#232F42] hover:text-white hover:border-slate-600'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">API Keys</span>
          </button>

          <button
            type="button"
            onClick={handleOpenReleaseModal}
            title="Bundle page into scheduled or draft release"
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add to Release</span>
          </button>

          <a
            href={`/sites/${siteSlug}?preview=true`}
            target="_blank"
            title="Open live preview in new tab"
            className="p-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 3-Panel Main Area */}
      <div ref={editorContainerRef} className={`flex-1 flex overflow-hidden relative ${isDraggingLeft || isDraggingRight ? 'select-none' : ''}`}>
        {/* LEFT PANEL: Dynamic Zones Manager / Outline Tree */}
        <div
          style={{ width: isLeftPanelOpen ? leftPanelWidth : 0 }}
          className={`${
            isLeftPanelOpen ? '' : 'border-r-0'
          } ${isDraggingLeft ? '' : 'transition-[width] duration-200 ease-out'} bg-white dark:bg-[#0A0D14] border-r border-slate-200 dark:border-[#1E293B] flex flex-col justify-between shrink-0 overflow-hidden relative`}
        >
          {/* View Mode Switcher Header */}
          <div className="p-2.5 border-b border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#0E1522] flex items-center justify-between text-xs w-full">
            <div className="flex items-center space-x-1 bg-[#141C2A] p-0.5 rounded-lg border border-[#232F42]">
              <button
                type="button"
                onClick={() => setLeftPanelMode('dynamic_zones')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition flex items-center space-x-1 ${
                  leftPanelMode === 'dynamic_zones'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Dynamic Zones</span>
              </button>
              <button
                type="button"
                onClick={() => setLeftPanelMode('outline')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition flex items-center space-x-1 ${
                  leftPanelMode === 'outline'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Tree</span>
              </button>
              <button
                type="button"
                onClick={() => setLeftPanelMode('brand_vault')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition flex items-center space-x-1 ${
                  leftPanelMode === 'brand_vault'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3 h-3 text-amber-400" />
                <span>Vault</span>
              </button>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setIsContentAgentModalOpen(true)}
                title="Open Bastion AI Content Agent"
                className="px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white transition text-[10px] font-bold flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Agent</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLeftPanelOpen(false)}
                title="Collapse panel"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* DYNAMIC ZONES VIEW */}
          {leftPanelMode === 'dynamic_zones' ? (
            <div className="flex-1 overflow-hidden w-full">
              <DynamicZonesBuilder
                sections={sections}
                selectedSectionId={selectedSectionId}
                onSelectSection={(id) => {
                  setSelectedSectionId(id);
                  if (!isRightPanelOpen) setIsRightPanelOpen(true);
                }}
                onUpdateSections={updateSections}
                onOpenLibrary={() => setIsLibraryOpen(true)}
                onCollapsePanel={() => setIsLeftPanelOpen(false)}
                onOpenContentAgent={(secId) => {
                  setSelectedSectionId(secId);
                  setIsContentAgentModalOpen(true);
                }}
              />
            </div>
          ) : leftPanelMode === 'brand_vault' ? (
            /* CORPORATE BRAND VAULT ("SAVED BLOCKS") VIEW */
            <div className="flex-1 flex flex-col justify-between overflow-hidden w-full">
              <div className="p-3 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-[10px] flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>Brand Vault ({CORPORATE_BRAND_VAULT.length})</span>
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pre-approved corporate layout blocks</p>
                </div>
              </div>

              <div className="flex-1 p-2 space-y-2.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                {CORPORATE_BRAND_VAULT.map((block) => {
                  const Icon = block.icon;
                  return (
                    <div
                      key={block.id}
                      className="p-3 rounded-xl border border-slate-200/80 dark:border-[#1E293B] bg-slate-50/60 dark:bg-[#141C2A] hover:border-amber-400/50 transition group space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          {block.category}
                        </span>
                        <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {block.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                          {block.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInsertCorporateBlock(block)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-white border border-amber-500/30 text-[11px] font-bold flex items-center justify-center space-x-1 transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Insert Block</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* COMPACT TREE OUTLINE VIEW */
            <div className="flex-1 flex flex-col justify-between overflow-hidden w-full">
              <div className="p-3 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Page Structure ({sections.length})
                </span>
                <button
                  type="button"
                  onClick={() => setIsLibraryOpen(true)}
                  className="px-2 py-1 rounded bg-sky-500/20 hover:bg-sky-500 border border-sky-400/30 hover:border-sky-400 text-sky-300 hover:text-white text-[10px] font-bold flex items-center space-x-1 transition shadow-xs"
                  title="Add Section"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Block</span>
                </button>
              </div>

              <div className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                {sections.map((sec, idx) => {
                  const isSelected = sec.id === selectedSectionId;
                  return (
                    <div
                      key={sec.id}
                      onClick={() => {
                        setSelectedSectionId(sec.id);
                        if (!isRightPanelOpen) setIsRightPanelOpen(true);
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between group ${
                        isSelected
                          ? 'bg-sky-950/70 border-sky-500 text-white ring-1 ring-sky-500'
                          : 'bg-[#141C2A] border-[#1E293B] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="font-mono text-[10px] text-slate-500">0{idx + 1}</span>
                        <span className="font-medium truncate capitalize">
                          {sec.componentId.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 'up'); }}
                          className="p-1 hover:text-white text-slate-400"
                        >
                          <MoveUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleMoveSection(idx, 'down'); }}
                          className="p-1 hover:text-white text-slate-400"
                        >
                          <MoveDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleToggleVisibility(sec.id); }}
                          className="p-1 hover:text-white text-slate-400"
                        >
                          {sec.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-rose-400" />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDeleteSection(sec.id); }}
                          className="p-1 hover:text-rose-400 text-slate-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Quick Add Section Button */}
                <button
                  type="button"
                  onClick={() => setIsLibraryOpen(true)}
                  className="w-full mt-2 py-2.5 px-3 rounded-xl border border-dashed border-sky-500/40 hover:border-sky-400 bg-sky-500/5 hover:bg-sky-500/10 text-sky-300 hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section Block</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* LEFT SPLITTER RESIZE HANDLE (Drag & Expand/Collapse) */}
        {isLeftPanelOpen && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDraggingLeft(true);
            }}
            onDoubleClick={() => setLeftPanelWidth(320)}
            title="Drag to resize Dynamic Zones panel • Double-click to reset (320px)"
            className={`w-2.5 -ml-1.5 z-30 cursor-col-resize flex items-center justify-center transition-colors group relative hover:bg-sky-500/25 active:bg-sky-500/40 select-none ${
              isDraggingLeft ? 'bg-sky-500/50' : ''
            }`}
          >
            <div className={`w-0.5 h-8 rounded-full bg-slate-700/80 group-hover:bg-sky-400 group-hover:h-16 transition-all ${
              isDraggingLeft ? 'bg-sky-400 h-16 shadow-xs' : ''
            }`} />
          </div>
        )}

        {/* CENTER CANVAS: Responsive Live Website Preview */}
        <div className="flex-1 bg-[#05070B] overflow-y-auto p-6 flex justify-center items-start relative min-w-0">
          {/* Floating trigger to re-open left blocks panel */}
          {!isLeftPanelOpen && (
            <button
              type="button"
              onClick={() => setIsLeftPanelOpen(true)}
              className="absolute left-4 top-4 z-20 px-3 py-1.5 rounded-xl bg-[#0A0D14]/90 border border-slate-800 text-slate-300 hover:text-white shadow-xl backdrop-blur-md text-xs font-semibold flex items-center space-x-2 transition hover:scale-105 cursor-pointer"
              title="Open Dynamic Zones Panel"
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Blocks ({sections.length})</span>
            </button>
          )}

          {/* Floating trigger to re-open right inspector */}
          {!isRightPanelOpen && selectedSection && (
            <button
              type="button"
              onClick={() => setIsRightPanelOpen(true)}
              className="absolute right-4 top-4 z-20 px-3 py-1.5 rounded-xl bg-[#0A0D14]/90 border border-slate-800 text-slate-300 hover:text-white shadow-xl backdrop-blur-md text-xs font-semibold flex items-center space-x-2 transition hover:scale-105 cursor-pointer"
              title="Open Inspector Panel"
            >
              <Sliders className="w-3.5 h-3.5 text-sky-400" />
              <span>Inspector</span>
            </button>
          )}

          <div
            className={`transition-all duration-300 shadow-2xl ${
              isCanvasDark ? 'bg-[#05080F] text-slate-100 border-slate-800' : 'bg-white text-slate-900 border-slate-700/60'
            } overflow-hidden ${
              viewport === 'desktop'
                ? 'w-full max-w-[1280px] rounded-xl border'
                : viewport === 'tablet'
                ? 'w-[768px] rounded-xl border'
                : 'w-[375px] rounded-[44px] border-[8px] border-slate-800 dark:border-slate-700 shadow-2xl relative my-4'
            }`}
          >
            {viewport === 'mobile' && (
              <div className="w-full bg-slate-800 dark:bg-slate-700 py-2 flex items-center justify-center select-none">
                <div className="w-24 h-4 bg-black rounded-full mx-auto flex items-center justify-end px-2">
                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                </div>
              </div>
            )}
            {sections.map((sec) => (
              <StudioComponentRenderer
                key={sec.id}
                section={sec}
                collection={collection}
                isEditor={true}
                isSelected={sec.id === selectedSectionId}
                focusedFieldPath={sec.id === selectedSectionId ? focusedFieldPath : null}
                onSelectSection={(id) => {
                  setSelectedSectionId(id);
                  if (!isRightPanelOpen) setIsRightPanelOpen(true);
                }}
                onSelectField={handleSelectField}
                onMoveUp={handleMoveUpById}
                onMoveDown={handleMoveDownById}
                onDuplicate={handleDuplicateById}
                onDelete={handleDeleteSection}
                onAiPolish={(id) => {
                  setSelectedSectionId(id);
                  setIsContentAgentModalOpen(true);
                }}
                onQuickStyleChange={(id, key, val) => {
                  setSelectedSectionId(id);
                  handleStyleChange(key, val);
                }}
                onOpenDesignTab={(id) => {
                  setSelectedSectionId(id);
                  setInspectorTab('design');
                  if (!isRightPanelOpen) setIsRightPanelOpen(true);
                }}
              />
            ))}
            {viewport === 'mobile' && (
              <div className="w-full bg-slate-800 dark:bg-slate-700 py-2 flex items-center justify-center select-none">
                <div className="w-28 h-1 bg-white/30 rounded-full mx-auto" />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SPLITTER RESIZE HANDLE (Drag & Expand/Collapse) */}
        {isRightPanelOpen && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDraggingRight(true);
            }}
            onDoubleClick={() => setRightPanelWidth(440)}
            title="Drag to resize Inspector & AI Studio • Double-click to reset (440px)"
            className={`w-2.5 -mr-1.5 z-30 cursor-col-resize flex items-center justify-center transition-colors group relative hover:bg-sky-500/25 active:bg-sky-500/40 select-none ${
              isDraggingRight ? 'bg-sky-500/50' : ''
            }`}
          >
            <div className={`w-0.5 h-8 rounded-full bg-slate-700/80 group-hover:bg-sky-400 group-hover:h-16 transition-all ${
              isDraggingRight ? 'bg-sky-400 h-16 shadow-xs' : ''
            }`} />
          </div>
        )}

        {/* RIGHT PANEL: Selected Section Inspector & Design Studio */}
        <div
          style={{ width: isRightPanelOpen ? rightPanelWidth : 0 }}
          className={`${
            isRightPanelOpen ? '' : 'border-l-0'
          } ${isDraggingRight ? '' : 'transition-[width] duration-200 ease-out'} bg-[#0A0D14] border-l border-[#1E293B] flex flex-col justify-between shrink-0 overflow-y-auto overflow-x-hidden relative`}
        >
          <div className="p-4 space-y-4 w-full">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs text-sky-400 font-bold uppercase tracking-wider truncate">
                  <Sliders className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {selectedSection ? `Block: ${selectedSection.componentId.replace('_', ' ')}` : 'Inspector & AI Studio'}
                  </span>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  {selectedSection && (
                    <button
                      type="button"
                      onClick={handleResetSectionStyles}
                      title="Reset styling to blueprint defaults"
                      className="px-2 py-0.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-[10px] flex items-center space-x-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsRightPanelOpen(false)}
                    title="Collapse Inspector"
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {selectedSection
                  ? 'Customize content copy, layout variants, colors, and gradients.'
                  : 'Select a block on canvas or configure AI coding models & credentials.'}
              </div>
            </div>

            {/* Navigation Tabs: Content | Design | AI Polish | API Keys */}
            <div className="flex p-1 rounded-xl bg-[#141C2A] border border-[#232F42] text-xs gap-1">
              <button
                id="tab-btn-content"
                type="button"
                onClick={() => setInspectorTab('content')}
                className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition cursor-pointer ${
                  inspectorTab === 'content'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Content</span>
              </button>
              <button
                id="tab-btn-design"
                type="button"
                onClick={() => setInspectorTab('design')}
                className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition cursor-pointer ${
                  inspectorTab === 'design'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Design</span>
              </button>
              <button
                id="tab-btn-ai"
                type="button"
                onClick={() => setInspectorTab('ai')}
                className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition cursor-pointer ${
                  inspectorTab === 'ai'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Polish</span>
              </button>
              <button
                id="tab-btn-keys"
                type="button"
                onClick={() => setInspectorTab('keys')}
                className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition cursor-pointer ${
                  inspectorTab === 'keys'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keys</span>
              </button>
            </div>

            {/* TAB 1: CONTENT & COPY */}
            {inspectorTab === 'content' && (
              selectedSection ? (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* AI Translation & Multi-Locale Bar */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/40 via-sky-950/40 to-slate-900 border border-purple-500/30 flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center space-x-2 min-w-0">
                      <Globe className="w-4 h-4 text-purple-400 shrink-0" />
                      <div className="truncate">
                        <div className="text-[11px] font-bold text-white flex items-center gap-1.5 truncate">
                          <span>{getLocaleMeta(selectedLocale).flag} {getLocaleMeta(selectedLocale).name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {selectedLocale === 'en' ? 'Preserves AISC, EBITDA & SENS' : `Translating into ${selectedLocale.toUpperCase()}`}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isTranslating}
                      onClick={() => handleTranslateSection(selectedLocale === 'en' ? 'es' : selectedLocale)}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
                    >
                      <Sparkles className="w-3 h-3 text-purple-200" />
                      <span>{isTranslating ? 'Translating...' : selectedLocale === 'en' ? 'Translate (ES)' : `Translate (${selectedLocale.toUpperCase()})`}</span>
                    </button>
                  </div>

                  {translationNotice && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-medium flex items-center space-x-2 animate-in fade-in">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{translationNotice}</span>
                    </div>
                  )}

                  {/* Layout Variant Dropdown */}
                  {registeredComp?.variants && registeredComp.variants.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold uppercase text-slate-400">
                        Component Layout Variant
                      </label>
                      <select
                        value={selectedSection.variant}
                        onChange={(e) => handleVariantChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs focus:outline-none focus:border-sky-500"
                      >
                        {registeredComp.variants.map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Eyebrow / Badge */}
                  {(selectedSection.props.eyebrow !== undefined || selectedSection.props.badge !== undefined) && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                        Badge / Eyebrow Tag
                      </label>
                      <input
                        id="field-eyebrow"
                        type="text"
                        value={selectedSection.props.eyebrow !== undefined ? (selectedSection.props.eyebrow || '') : (selectedSection.props.badge || '')}
                        onChange={(e) => {
                          if (selectedSection.props.eyebrow !== undefined) handlePropChange('eyebrow', e.target.value);
                          else handlePropChange('badge', e.target.value);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs focus:outline-none focus:border-sky-500 transition-all"
                      />
                    </div>
                  )}

                  {/* Section Headline */}
                  {selectedSection.props.title !== undefined && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                        Section Headline
                      </label>
                      <textarea
                        id="field-title"
                        rows={3}
                        value={selectedSection.props.title || ''}
                        onChange={(e) => handlePropChange('title', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs leading-relaxed focus:outline-none focus:border-sky-500 transition-all"
                      />
                    </div>
                  )}

                  {/* Section Subtitle */}
                  {(selectedSection.props.subtitle !== undefined || selectedSection.props.description !== undefined) && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                        Supporting Subtitle / Paragraph
                      </label>
                      <textarea
                        id="field-subtitle"
                        rows={3}
                        value={selectedSection.props.subtitle !== undefined ? (selectedSection.props.subtitle || '') : (selectedSection.props.description || '')}
                        onChange={(e) => {
                          if (selectedSection.props.subtitle !== undefined) handlePropChange('subtitle', e.target.value);
                          else handlePropChange('description', e.target.value);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs leading-relaxed focus:outline-none focus:border-sky-500 transition-all"
                      />
                    </div>
                  )}

                  {/* Primary CTA */}
                  {selectedSection.props.primaryCta && (
                    <div id="field-primaryCta" className="space-y-2 p-3 rounded-xl bg-[#141C2A] border border-[#232F42] transition-all">
                      <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wide">
                        Primary CTA Button
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Button Label</label>
                        <input
                          type="text"
                          value={selectedSection.props.primaryCta.label || ''}
                          onChange={(e) => handlePropChange('primaryCta', { ...selectedSection.props.primaryCta, label: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-white text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-1">Target Link (href)</label>
                        <input
                          type="text"
                          value={selectedSection.props.primaryCta.href || ''}
                          onChange={(e) => handlePropChange('primaryCta', { ...selectedSection.props.primaryCta, href: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-white text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Standalone ctaText (Header, CTA) */}
                  {selectedSection.props.ctaText !== undefined && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1.5">
                        Action CTA Button Text
                      </label>
                      <input
                        type="text"
                        value={selectedSection.props.ctaText || ''}
                        onChange={(e) => handlePropChange('ctaText', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  )}

                  {/* PRICING PLANS COMPONENT FIELDS */}
                  {selectedSection.componentId === 'pricing' && (
                    <div className="space-y-4 pt-3 border-t border-[#232F42]">
                      <div>
                        <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                          Annual Savings Badge
                        </label>
                        <input
                          type="text"
                          value={selectedSection.props.annualSavingsNote || ''}
                          onChange={(e) => handlePropChange('annualSavingsNote', e.target.value)}
                          placeholder="e.g. Save 20% on annual billing"
                          className="w-full px-3 py-2 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[11px] font-bold uppercase text-sky-400">
                          Pricing Tiers ({selectedSection.props.plans?.length || 0})
                        </label>
                        {(selectedSection.props.plans || []).map((plan: any, pIdx: number) => (
                          <div key={pIdx} className="p-3 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-xs">{plan.name}</span>
                              <label className="flex items-center space-x-1.5 text-[10px] text-slate-400 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={plan.isPopular || false}
                                  onChange={(e) => {
                                    const nextPlans = [...selectedSection.props.plans];
                                    nextPlans[pIdx] = { ...plan, isPopular: e.target.checked };
                                    handlePropChange('plans', nextPlans);
                                  }}
                                  className="rounded border-slate-700 bg-slate-900 text-sky-500"
                                />
                                <span>Featured Tier</span>
                              </label>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">Monthly</label>
                                <input
                                  type="text"
                                  value={plan.monthlyPrice || ''}
                                  onChange={(e) => {
                                    const nextPlans = [...selectedSection.props.plans];
                                    nextPlans[pIdx] = { ...plan, monthlyPrice: e.target.value };
                                    handlePropChange('plans', nextPlans);
                                  }}
                                  className="w-full px-2 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-white text-xs"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] text-slate-400 mb-0.5">Annual</label>
                                <input
                                  type="text"
                                  value={plan.annualPrice || ''}
                                  onChange={(e) => {
                                    const nextPlans = [...selectedSection.props.plans];
                                    nextPlans[pIdx] = { ...plan, annualPrice: e.target.value };
                                    handlePropChange('plans', nextPlans);
                                  }}
                                  className="w-full px-2 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-white text-xs"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FAQ ACCORDION COMPONENT FIELDS */}
                  {selectedSection.componentId === 'faq' && (
                    <div className="space-y-4 pt-3 border-t border-[#232F42]">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase text-sky-400">
                          FAQ Questions ({selectedSection.props.items?.length || 0})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const nextItems = [
                              ...(selectedSection.props.items || []),
                              { question: 'New Question', answer: 'Provide comprehensive answer details here.' }
                            ];
                            handlePropChange('items', nextItems);
                          }}
                          className="px-2 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white text-[10px] font-semibold flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add FAQ</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(selectedSection.props.items || []).map((faq: any, fIdx: number) => (
                          <div key={fIdx} className="p-3 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-slate-400">Q{fIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextItems = selectedSection.props.items.filter((_: any, i: number) => i !== fIdx);
                                  handlePropChange('items', nextItems);
                                }}
                                className="text-slate-500 hover:text-rose-400 p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={faq.question || ''}
                              onChange={(e) => {
                                const nextItems = [...selectedSection.props.items];
                                nextItems[fIdx] = { ...faq, question: e.target.value };
                                handlePropChange('items', nextItems);
                              }}
                              placeholder="Question headline..."
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-white text-xs font-semibold"
                            />
                            <textarea
                              rows={2}
                              value={faq.answer || ''}
                              onChange={(e) => {
                                const nextItems = [...selectedSection.props.items];
                                nextItems[fIdx] = { ...faq, answer: e.target.value };
                                handlePropChange('items', nextItems);
                              }}
                              placeholder="Answer explanation..."
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-slate-300 text-xs leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PROCESS ROADMAP COMPONENT FIELDS */}
                  {selectedSection.componentId === 'process' && (
                    <div className="space-y-4 pt-3 border-t border-[#232F42]">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase text-sky-400">
                          Process Steps ({selectedSection.props.steps?.length || 0})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const count = (selectedSection.props.steps || []).length;
                            const nextSteps = [
                              ...(selectedSection.props.steps || []),
                              { number: `0${count + 1}`, title: `Step ${count + 1}`, description: 'Step description and key milestones.' }
                            ];
                            handlePropChange('steps', nextSteps);
                          }}
                          className="px-2 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white text-[10px] font-semibold flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Step</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(selectedSection.props.steps || []).map((step: any, sIdx: number) => (
                          <div key={sIdx} className="p-3 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                value={step.number || `0${sIdx + 1}`}
                                onChange={(e) => {
                                  const nextSteps = [...selectedSection.props.steps];
                                  nextSteps[sIdx] = { ...step, number: e.target.value };
                                  handlePropChange('steps', nextSteps);
                                }}
                                className="w-12 px-1.5 py-0.5 rounded bg-[#0E1522] border border-[#222E42] text-sky-400 font-mono text-[10px] font-bold text-center"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const nextSteps = selectedSection.props.steps.filter((_: any, i: number) => i !== sIdx);
                                  handlePropChange('steps', nextSteps);
                                }}
                                className="text-slate-500 hover:text-rose-400 p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={step.title || ''}
                              onChange={(e) => {
                                const nextSteps = [...selectedSection.props.steps];
                                nextSteps[sIdx] = { ...step, title: e.target.value };
                                handlePropChange('steps', nextSteps);
                              }}
                              placeholder="Step title..."
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-white text-xs font-semibold"
                            />
                            <textarea
                              rows={2}
                              value={step.description || ''}
                              onChange={(e) => {
                                const nextSteps = [...selectedSection.props.steps];
                                nextSteps[sIdx] = { ...step, description: e.target.value };
                                handlePropChange('steps', nextSteps);
                              }}
                              placeholder="Step description..."
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-slate-300 text-xs leading-relaxed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TESTIMONIALS COMPONENT FIELDS */}
                  {selectedSection.componentId === 'testimonials' && (
                    <div className="space-y-4 pt-3 border-t border-[#232F42]">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase text-sky-400">
                          Reviews & Endorsements ({selectedSection.props.items?.length || 0})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const nextItems = [
                              ...(selectedSection.props.items || []),
                              { quote: 'Outstanding execution and precision results.', author: 'Executive Name', role: 'Partner', company: 'Company LLC', rating: 5, verified: true }
                            ];
                            handlePropChange('items', nextItems);
                          }}
                          className="px-2 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-white text-[10px] font-semibold flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Review</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(selectedSection.props.items || []).map((t: any, tIdx: number) => (
                          <div key={tIdx} className="p-3 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-white">{t.author || 'Reviewer'}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextItems = selectedSection.props.items.filter((_: any, i: number) => i !== tIdx);
                                  handlePropChange('items', nextItems);
                                }}
                                className="text-slate-500 hover:text-rose-400 p-0.5"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <textarea
                              rows={2}
                              value={t.quote || ''}
                              onChange={(e) => {
                                const nextItems = [...selectedSection.props.items];
                                nextItems[tIdx] = { ...t, quote: e.target.value };
                                handlePropChange('items', nextItems);
                              }}
                              placeholder="Testimonial quote..."
                              className="w-full px-2.5 py-1.5 rounded-lg bg-[#0E1522] border border-[#222E42] text-slate-200 text-xs italic"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={t.author || ''}
                                onChange={(e) => {
                                  const nextItems = [...selectedSection.props.items];
                                  nextItems[tIdx] = { ...t, author: e.target.value };
                                  handlePropChange('items', nextItems);
                                }}
                                placeholder="Author name"
                                className="w-full px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white text-[11px]"
                              />
                              <input
                                type="text"
                                value={t.company || ''}
                                onChange={(e) => {
                                  const nextItems = [...selectedSection.props.items];
                                  nextItems[tIdx] = { ...t, company: e.target.value };
                                  handlePropChange('items', nextItems);
                                }}
                                placeholder="Company"
                                className="w-full px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white text-[11px]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MAP & BUSINESS HOURS COMPONENT FIELDS */}
                  {selectedSection.componentId === 'map_hours' && (
                    <div className="space-y-4 pt-3 border-t border-[#232F42]">
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase text-sky-400">
                          Office Location & Contacts
                        </label>
                        <input
                          type="text"
                          value={selectedSection.props.city || ''}
                          onChange={(e) => handlePropChange('city', e.target.value)}
                          placeholder="City / Region"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#141C2A] border border-[#232F42] text-white text-xs"
                        />
                        <input
                          type="text"
                          value={selectedSection.props.address || ''}
                          onChange={(e) => handlePropChange('address', e.target.value)}
                          placeholder="Street Address"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#141C2A] border border-[#232F42] text-white text-xs"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={selectedSection.props.phone || ''}
                            onChange={(e) => handlePropChange('phone', e.target.value)}
                            placeholder="Phone Number"
                            className="w-full px-2 py-1.5 rounded-lg bg-[#141C2A] border border-[#232F42] text-white text-xs"
                          />
                          <input
                            type="text"
                            value={selectedSection.props.email || ''}
                            onChange={(e) => handlePropChange('email', e.target.value)}
                            placeholder="Email Address"
                            className="w-full px-2 py-1.5 rounded-lg bg-[#141C2A] border border-[#232F42] text-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold uppercase text-slate-400">
                          Operating Hours
                        </label>
                        {(selectedSection.props.hours || []).map((h: any, hIdx: number) => (
                          <div key={hIdx} className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={h.day || ''}
                              onChange={(e) => {
                                const nextHours = [...selectedSection.props.hours];
                                nextHours[hIdx] = { ...h, day: e.target.value };
                                handlePropChange('hours', nextHours);
                              }}
                              className="px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white text-xs"
                            />
                            <input
                              type="text"
                              value={h.time || ''}
                              onChange={(e) => {
                                const nextHours = [...selectedSection.props.hours];
                                nextHours[hIdx] = { ...h, time: e.target.value };
                                handlePropChange('hours', nextHours);
                              }}
                              className="px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  Select a section in the preview canvas to inspect its properties.
                </div>
              )
            )}

            {/* TAB 2: DESIGN & COLORS */}
            {inspectorTab === 'design' && (
              selectedSection ? (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Background Mode Toggle */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold uppercase text-slate-400">
                      Background Fill Mode
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#141C2A] border border-[#232F42] text-xs">
                      <button
                        type="button"
                        onClick={() => handleStyleChange('backgroundType', 'solid')}
                        className={`py-1.5 rounded-lg font-medium transition ${
                          selectedSection.styles?.backgroundType === 'solid'
                            ? 'bg-sky-500 text-white font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Solid
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStyleChange('backgroundType', 'gradient')}
                        className={`py-1.5 rounded-lg font-medium transition ${
                          selectedSection.styles?.backgroundType === 'gradient'
                            ? 'bg-sky-500 text-white font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Gradient
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStyleChange('backgroundType', 'default')}
                        className={`py-1.5 rounded-lg font-medium transition ${
                          !selectedSection.styles?.backgroundType || selectedSection.styles?.backgroundType === 'default'
                            ? 'bg-slate-700 text-white font-semibold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Default
                      </button>
                    </div>
                  </div>

                  {/* SOLID COLOR PICKER */}
                  {selectedSection.styles?.backgroundType === 'solid' && (
                    <div className="p-3.5 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-300">Section Background Color</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={selectedSection.styles?.backgroundColor || '#09090B'}
                            onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                            className="w-7 h-7 rounded-lg border border-slate-600 cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={selectedSection.styles?.backgroundColor || '#09090B'}
                            onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                            className="w-20 px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white font-mono text-[11px] uppercase"
                          />
                        </div>
                      </div>

                      {/* Luxury Palette Swatches */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Luxury Curated Swatches
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {SOLID_SWATCHES.map((sw, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleStyleChange('backgroundColor', sw.hex)}
                              title={`${sw.name} (${sw.hex})`}
                              className={`h-9 rounded-lg border transition transform hover:scale-105 flex flex-col justify-end p-1 text-[9px] font-mono ${
                                selectedSection.styles?.backgroundColor?.toLowerCase() === sw.hex.toLowerCase()
                                  ? 'ring-2 ring-sky-400 border-white'
                                  : 'border-white/10'
                              }`}
                              style={{ backgroundColor: sw.hex }}
                            >
                              <span className={`truncate ${sw.hex === '#FFFFFF' || sw.hex === '#FAF8F5' ? 'text-black font-bold' : 'text-white/80'}`}>
                                {sw.name.split(' ')[0]}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GRADIENT BUILDER & PRESETS */}
                  {selectedSection.styles?.backgroundType === 'gradient' && (
                    <div className="p-3.5 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-4">
                      {/* One-Click Presets */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-300">Luxury Gradient Presets</span>
                          <span className="text-[10px] text-sky-400 font-mono">1-Click Apply</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {GRADIENT_PRESETS.map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleApplyGradientPreset(p.css, p.name, p.from, p.to)}
                              className={`h-14 rounded-xl border p-2 text-left flex flex-col justify-between transition group transform hover:scale-[1.02] shadow-sm ${
                                selectedSection.styles?.gradient === p.css
                                  ? 'ring-2 ring-sky-400 border-white'
                                  : 'border-white/10'
                              }`}
                              style={{ background: p.css }}
                            >
                              <span className={`text-[10px] font-bold leading-tight ${p.name.includes('Light') ? 'text-slate-900' : 'text-white'}`}>
                                {p.name}
                              </span>
                              <span className={`text-[9px] font-mono opacity-70 ${p.name.includes('Light') ? 'text-slate-700' : 'text-white'}`}>
                                {p.from} → {p.to}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Dual-Color Builder */}
                      <div className="space-y-2.5 pt-3 border-t border-slate-800">
                        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                          Custom Gradient Builder
                        </div>

                        {/* Direction */}
                        <div className="grid grid-cols-4 gap-1 text-[10px]">
                          {[
                            { label: 'Diagonal', val: '135deg' },
                            { label: 'Horizontal', val: 'to right' },
                            { label: 'Vertical', val: 'to bottom' },
                            { label: 'Radial', val: 'radial' }
                          ].map((d) => (
                            <button
                              key={d.val}
                              type="button"
                              onClick={() => {
                                setCustomGradDir(d.val);
                                handleUpdateCustomGradient(d.val, customGradFrom, customGradTo);
                              }}
                              className={`py-1 rounded border text-center transition ${
                                customGradDir === d.val
                                  ? 'bg-sky-600 border-sky-400 text-white font-bold'
                                  : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white'
                              }`}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>

                        {/* Color From & To */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Start Color</label>
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="color"
                                value={customGradFrom}
                                onChange={(e) => {
                                  setCustomGradFrom(e.target.value);
                                  handleUpdateCustomGradient(customGradDir, e.target.value, customGradTo);
                                }}
                                className="w-6 h-6 rounded cursor-pointer border border-slate-600 bg-transparent"
                              />
                              <input
                                type="text"
                                value={customGradFrom}
                                onChange={(e) => {
                                  setCustomGradFrom(e.target.value);
                                  handleUpdateCustomGradient(customGradDir, e.target.value, customGradTo);
                                }}
                                className="w-full px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white font-mono text-[10px] uppercase"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">End Color</label>
                            <div className="flex items-center space-x-1.5">
                              <input
                                type="color"
                                value={customGradTo}
                                onChange={(e) => {
                                  setCustomGradTo(e.target.value);
                                  handleUpdateCustomGradient(customGradDir, customGradFrom, e.target.value);
                                }}
                                className="w-6 h-6 rounded cursor-pointer border border-slate-600 bg-transparent"
                              />
                              <input
                                type="text"
                                value={customGradTo}
                                onChange={(e) => {
                                  setCustomGradTo(e.target.value);
                                  handleUpdateCustomGradient(customGradDir, customGradFrom, e.target.value);
                                }}
                                className="w-full px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white font-mono text-[10px] uppercase"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Live gradient output preview */}
                        {selectedSection.styles?.gradient && (
                          <div
                            className="h-6 w-full rounded-lg border border-white/20 shadow-inner mt-1"
                            style={{ background: selectedSection.styles.gradient }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* AMBIENT FX & BACKGROUND TEXTURES */}
                  <div className="p-3.5 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                          Ambient FX & Textures
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 capitalize">
                        {selectedSection.styles?.backgroundPattern && selectedSection.styles.backgroundPattern !== 'none'
                          ? selectedSection.styles.backgroundPattern.replace('_', ' ')
                          : 'None'}
                      </span>
                    </div>

                    {/* Pattern Selection Cards */}
                    <div className="grid grid-cols-2 gap-2">
                      {PATTERN_OPTIONS.map((pat) => {
                        const Icon = pat.icon;
                        const isCurrent =
                          (!selectedSection.styles?.backgroundPattern && pat.id === 'none') ||
                          selectedSection.styles?.backgroundPattern === pat.id;
                        return (
                          <button
                            key={pat.id}
                            type="button"
                            onClick={() => handleStyleChange('backgroundPattern', pat.id)}
                            className={`p-2.5 rounded-xl border text-left flex items-start space-x-2.5 transition group ${
                              isCurrent
                                ? 'bg-sky-950/60 border-sky-400 ring-1 ring-sky-400 text-white shadow-sm'
                                : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white hover:border-slate-600'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg border mt-0.5 ${
                              isCurrent
                                ? 'bg-sky-500/20 border-sky-400/40 text-sky-300'
                                : 'bg-[#141C2A] border-[#222E42] text-slate-400 group-hover:text-white'
                            }`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold truncate leading-tight">
                                {pat.label}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                {pat.desc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Opacity / Intensity Controls (active when a pattern is chosen) */}
                    {selectedSection.styles?.backgroundPattern && selectedSection.styles.backgroundPattern !== 'none' && (
                      <div className="pt-3 border-t border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">Texture Intensity</span>
                          <span className="text-sky-400 font-mono text-[11px] font-semibold">
                            {Math.round((selectedSection.styles?.patternOpacity ?? 0.35) * 100)}%
                          </span>
                        </div>

                        {/* Preset quick buttons */}
                        <div className="grid grid-cols-4 gap-1 text-[10px]">
                          {[
                            { label: 'Subtle', val: 0.15 },
                            { label: 'Balanced', val: 0.35 },
                            { label: 'Vivid', val: 0.60 },
                            { label: 'Max', val: 0.90 }
                          ].map((op) => {
                            const currentVal = selectedSection.styles?.patternOpacity ?? 0.35;
                            const isMatch = Math.abs(currentVal - op.val) < 0.05;
                            return (
                              <button
                                key={op.label}
                                type="button"
                                onClick={() => handleStyleChange('patternOpacity', op.val)}
                                className={`py-1 rounded border text-center font-medium transition ${
                                  isMatch
                                    ? 'bg-sky-600 border-sky-400 text-white font-bold'
                                    : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white'
                                }`}
                              >
                                {op.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Continuous Precision Slider */}
                        <div className="flex items-center space-x-2 pt-0.5">
                          <input
                            type="range"
                            min="0.05"
                            max="1.0"
                            step="0.05"
                            value={selectedSection.styles?.patternOpacity ?? 0.35}
                            onChange={(e) => handleStyleChange('patternOpacity', parseFloat(e.target.value))}
                            className="w-full accent-sky-500 cursor-pointer h-1.5 bg-[#0E1522] rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TYPOGRAPHY COLORS: HEADINGS & BODY */}
                  <div className="p-3.5 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-4">
                    <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                      Text & Typography Colors
                    </div>

                    {/* Heading Color */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Headings (H1/H2)</span>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="color"
                            value={selectedSection.styles?.headingColor || '#FFFFFF'}
                            onChange={(e) => handleStyleChange('headingColor', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-slate-600 bg-transparent"
                          />
                          <input
                            type="text"
                            value={selectedSection.styles?.headingColor || '#FFFFFF'}
                            onChange={(e) => handleStyleChange('headingColor', e.target.value)}
                            className="w-20 px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white font-mono text-[10px] uppercase"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {TEXT_COLOR_SWATCHES.map((sw, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleStyleChange('headingColor', sw.hex)}
                            title={sw.name}
                            className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition"
                            style={{ backgroundColor: sw.hex }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Body Text Color */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Body & Paragraphs</span>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="color"
                            value={selectedSection.styles?.textColor || '#CBD5E1'}
                            onChange={(e) => handleStyleChange('textColor', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-slate-600 bg-transparent"
                          />
                          <input
                            type="text"
                            value={selectedSection.styles?.textColor || '#CBD5E1'}
                            onChange={(e) => handleStyleChange('textColor', e.target.value)}
                            className="w-20 px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white font-mono text-[10px] uppercase"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {TEXT_COLOR_SWATCHES.map((sw, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleStyleChange('textColor', sw.hex)}
                            title={sw.name}
                            className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition"
                            style={{ backgroundColor: sw.hex }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Accent & Button CTA</span>
                        <div className="flex items-center space-x-1.5">
                          <input
                            type="color"
                            value={selectedSection.styles?.accentColor || '#0284C7'}
                            onChange={(e) => handleStyleChange('accentColor', e.target.value)}
                            className="w-6 h-6 rounded cursor-pointer border border-slate-600 bg-transparent"
                          />
                          <input
                            type="text"
                            value={selectedSection.styles?.accentColor || '#0284C7'}
                            onChange={(e) => handleStyleChange('accentColor', e.target.value)}
                            className="w-20 px-2 py-1 rounded bg-[#0E1522] border border-[#222E42] text-white font-mono text-[10px] uppercase"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {ACCENT_SWATCHES.map((sw, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleStyleChange('accentColor', sw.hex)}
                            title={sw.name}
                            className="w-5 h-5 rounded-full border border-white/20 hover:scale-110 transition"
                            style={{ backgroundColor: sw.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* SUITE 1: INTERACTIVE BOX MODEL & LAYOUT SPACING */}
                  <div className="p-3.5 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Box className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                          Box Model & Layout Spacing
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {selectedSection.styles?.paddingY || 'py-20 md:py-28'}
                      </span>
                    </div>

                    {/* Interactive 2D Box Model Diagram */}
                    <div className="p-2.5 rounded-xl bg-[#0A0D14] border border-[#1E293B] text-center text-xs relative select-none">
                      {/* Outer: Margin / Container Bounds */}
                      <div className="border border-dashed border-sky-500/40 rounded-lg p-2.5 bg-sky-950/20 relative">
                        <div className="flex items-center justify-between text-[9px] uppercase font-mono font-bold text-sky-400/80 mb-1.5 px-1">
                          <span>CONTAINER: {selectedSection.styles?.containerWidth || 'wide (max-w-7xl)'}</span>
                          <span>MARGIN: AUTO</span>
                        </div>

                        {/* Inner: Padding Top & Bottom */}
                        <div className="border border-indigo-500/40 rounded-md p-3 bg-indigo-950/30 space-y-1.5">
                          <div className="text-[10px] font-mono text-indigo-300 font-bold flex items-center justify-center space-x-1">
                            <span>PADDING-Y:</span>
                            <span className="bg-indigo-900/60 px-1.5 py-0.5 rounded border border-indigo-400/30 text-white">
                              {selectedSection.styles?.paddingY ? selectedSection.styles.paddingY.replace('py-', '') + ' (rem unit)' : 'Default (py-20)'}
                            </span>
                          </div>

                          {/* Center Content Block */}
                          <div className="bg-[#141C2A] border border-slate-700/60 rounded py-2 px-3 text-[10px] font-semibold text-slate-200 flex items-center justify-between">
                            <span className="truncate">Block: {selectedSection.componentId.replace('_', ' ')}</span>
                            <span className="text-[9px] text-slate-400 font-mono capitalize">{selectedSection.styles?.alignment || 'left'} align</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Container Width Bounds */}
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[10px] font-semibold uppercase text-slate-400">
                        Container Max Width Constraint
                      </label>
                      <div className="grid grid-cols-4 gap-1 text-[10px]">
                        {CONTAINER_WIDTH_OPTIONS.map((cw) => {
                          const isCurrent = (!selectedSection.styles?.containerWidth && cw.id === 'wide') ||
                            selectedSection.styles?.containerWidth === cw.id;
                          return (
                            <button
                              key={cw.id}
                              type="button"
                              onClick={() => handleStyleChange('containerWidth', cw.id)}
                              title={cw.detail}
                              className={`py-1.5 rounded-lg border text-center font-medium transition ${
                                isCurrent
                                  ? 'bg-sky-600 border-sky-400 text-white font-bold'
                                  : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white'
                              }`}
                            >
                              <div>{cw.label}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Vertical Padding Steppers */}
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[10px] font-semibold uppercase text-slate-400">
                        Block Vertical Padding
                      </label>
                      <div className="grid grid-cols-4 gap-1 text-[10px]">
                        {PADDING_OPTIONS.map((pad) => {
                          const isCurrent = (!selectedSection.styles?.paddingY && pad.id === 'py-20') ||
                            selectedSection.styles?.paddingY === pad.id;
                          return (
                            <button
                              key={pad.id}
                              type="button"
                              onClick={() => handleStyleChange('paddingY', pad.id)}
                              title={`${pad.name} (${pad.label})`}
                              className={`py-1 rounded-lg border text-center font-medium transition ${
                                isCurrent
                                  ? 'bg-sky-600 border-sky-400 text-white font-bold'
                                  : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white'
                              }`}
                            >
                              <div className="font-mono text-[9px]">{pad.label}</div>
                              <div className="text-[8px] opacity-75">{pad.name}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SUITE 2: TYPOGRAPHY ENGINE & PAIRINGS */}
                  <div className="p-3.5 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Type className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                          Typography Engine
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 capitalize">
                        {selectedSection.styles?.fontFamily || 'Sans'}
                      </span>
                    </div>

                    {/* Font Family Selector Cards */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold uppercase text-slate-400">
                        Font Family & Pairing
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {FONT_OPTIONS.map((font) => {
                          const isCurrent = (!selectedSection.styles?.fontFamily && font.id === 'sans') ||
                            selectedSection.styles?.fontFamily === font.id;
                          return (
                            <button
                              key={font.id}
                              type="button"
                              onClick={() => handleStyleChange('fontFamily', font.id)}
                              className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-between ${
                                isCurrent
                                  ? 'bg-sky-950/70 border-sky-400 ring-1 ring-sky-400 text-white shadow-sm'
                                  : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white'
                              }`}
                            >
                              <span className={`text-xl font-bold mb-0.5 ${font.fontClass}`}>
                                {font.preview}
                              </span>
                              <span className="text-[10px] font-semibold truncate w-full">
                                {font.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Heading Scale Multiplier */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <label className="block text-[10px] font-semibold uppercase text-slate-400">
                          Heading Scale Multiplier
                        </label>
                        <span className="text-[10px] text-sky-400 font-mono capitalize">
                          {selectedSection.styles?.headingScale || 'Balanced'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-[10px]">
                        {HEADING_SCALE_OPTIONS.map((hs) => {
                          const isCurrent = (!selectedSection.styles?.headingScale && hs.id === 'normal') ||
                            selectedSection.styles?.headingScale === hs.id;
                          return (
                            <button
                              key={hs.id}
                              type="button"
                              onClick={() => handleStyleChange('headingScale', hs.id)}
                              title={hs.desc}
                              className={`py-1 rounded border text-center font-medium transition ${
                                isCurrent
                                  ? 'bg-sky-600 border-sky-400 text-white font-bold'
                                  : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white'
                              }`}
                            >
                              <div>{hs.label}</div>
                              <div className="text-[8px] opacity-75 font-mono">{hs.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Letter Spacing / Tracking */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <label className="block text-[10px] font-semibold uppercase text-slate-400">
                          Tracking / Letter Spacing
                        </label>
                        <span className="text-[10px] text-sky-400 font-mono">
                          {selectedSection.styles?.letterSpacing || 'normal (0)'}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 text-[10px]">
                        {LETTER_SPACING_OPTIONS.map((ls) => {
                          const isCurrent = (!selectedSection.styles?.letterSpacing && ls.id === 'normal') ||
                            selectedSection.styles?.letterSpacing === ls.id;
                          return (
                            <button
                              key={ls.id}
                              type="button"
                              onClick={() => handleStyleChange('letterSpacing', ls.id)}
                              title={ls.name}
                              className={`py-1 rounded border text-center font-medium transition ${
                                isCurrent
                                  ? 'bg-sky-600 border-sky-400 text-white font-bold'
                                  : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white'
                              }`}
                            >
                              <div className="text-[9px] font-mono">{ls.label}</div>
                              <div className="text-[8px] opacity-75">{ls.name}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Text Alignment */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-800">
                      <label className="block text-[10px] font-semibold uppercase text-slate-400">
                        Content & Heading Alignment
                      </label>
                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        {[
                          { id: 'left', label: 'Left', icon: AlignLeft },
                          { id: 'center', label: 'Center', icon: AlignCenter },
                          { id: 'split', label: 'Split', icon: Square }
                        ].map((al) => {
                          const Icon = al.icon;
                          const isCurrent = (!selectedSection.styles?.alignment && al.id === 'left') ||
                            selectedSection.styles?.alignment === al.id;
                          return (
                            <button
                              key={al.id}
                              type="button"
                              onClick={() => handleStyleChange('alignment', al.id)}
                              className={`py-1.5 px-2 rounded-lg border flex items-center justify-center space-x-1.5 transition ${
                                isCurrent
                                  ? 'bg-sky-600 border-sky-400 text-white font-bold'
                                  : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              <span className="text-[11px]">{al.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* SUITE 3: GEOMETRY, GLASSMORPHISM & AMBIENT GLOW */}
                  <div className="p-3.5 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkle className="w-3.5 h-3.5 text-sky-400" />
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                          Geometry & Ambient Glow
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 capitalize">
                        {selectedSection.styles?.borderRadius || 'Default'}
                      </span>
                    </div>

                    {/* Corner Radius Controls */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold uppercase text-slate-400">
                        Card & Element Corner Radius
                      </label>
                      <div className="grid grid-cols-7 gap-1 text-[10px]">
                        {BORDER_RADIUS_OPTIONS.map((br) => {
                          const isCurrent = (!selectedSection.styles?.borderRadius && br.id === 'xl') ||
                            selectedSection.styles?.borderRadius === br.id;
                          return (
                            <button
                              key={br.id}
                              type="button"
                              onClick={() => handleStyleChange('borderRadius', br.id)}
                              title={`${br.name} (${br.label})`}
                              className={`py-1.5 rounded border text-center flex flex-col items-center justify-center transition ${
                                isCurrent
                                  ? 'bg-sky-600 border-sky-400 text-white font-bold'
                                  : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white'
                              }`}
                            >
                              <div className={`w-3.5 h-3.5 border border-current mb-0.5 ${br.iconClass}`} />
                              <div className="text-[8px] font-mono">{br.label}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Frosted Glass Backdrop Blur */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[10px] font-semibold uppercase">Frosted Glass Blur</span>
                        <span className="text-sky-400 font-mono text-[11px] font-semibold">
                          {selectedSection.styles?.glassBlurPx !== undefined ? `${selectedSection.styles.glassBlurPx}px` : '16px (Default)'}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-[10px]">
                        {[
                          { label: 'Off', val: 0 },
                          { label: 'Subtle (8px)', val: 8 },
                          { label: 'Glass (16px)', val: 16 },
                          { label: 'Deep (24px)', val: 24 }
                        ].map((bl) => {
                          const currentVal = selectedSection.styles?.glassBlurPx !== undefined ? selectedSection.styles.glassBlurPx : 16;
                          const isCurrent = currentVal === bl.val;
                          return (
                            <button
                              key={bl.label}
                              type="button"
                              onClick={() => {
                                handleStyleChange('glassBlurPx', bl.val);
                                handleStyleChange('frostedGlass', bl.val > 0);
                              }}
                              className={`py-1 rounded border text-center font-medium transition ${
                                isCurrent
                                  ? 'bg-sky-600 border-sky-400 text-white font-bold'
                                  : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white'
                              }`}
                            >
                              {bl.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Luminous Ambient Accent Glow */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[10px] font-semibold uppercase">Ambient Luminous Glow Bloom</span>
                        <span className="text-sky-400 font-mono text-[10px] capitalize">
                          {selectedSection.styles?.glowEffect || 'None'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {GLOW_OPTIONS.map((gl) => {
                          const isCurrent = (!selectedSection.styles?.glowEffect && gl.id === 'none') ||
                            selectedSection.styles?.glowEffect === gl.id;
                          return (
                            <button
                              key={gl.id}
                              type="button"
                              onClick={() => handleStyleChange('glowEffect', gl.id)}
                              className={`p-2 rounded-xl border text-center flex items-center space-x-2 transition ${
                                isCurrent
                                  ? 'bg-sky-950/70 border-sky-400 ring-1 ring-sky-400 text-white shadow-sm'
                                  : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white'
                              }`}
                            >
                              <div
                                className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                                style={{
                                  backgroundColor: gl.color,
                                  boxShadow: gl.id !== 'none' ? `0 0 8px ${gl.color}` : 'none'
                                }}
                              />
                              <span className="text-[10px] font-semibold truncate leading-tight">
                                {gl.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Border Accents & Hairlines */}
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 text-[10px] font-semibold uppercase">Border Dividers & Hairlines</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={selectedSection.styles?.borderColor || '#232F42'}
                            onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                            className="w-5 h-5 rounded cursor-pointer border border-slate-600 bg-transparent"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleStyleChange('borderTop', !selectedSection.styles?.borderTop)}
                          className={`py-1.5 px-2 rounded-lg border text-center font-medium transition ${
                            selectedSection.styles?.borderTop
                              ? 'bg-sky-600 border-sky-400 text-white font-bold'
                              : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white'
                          }`}
                        >
                          Border Top
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStyleChange('borderBottom', !selectedSection.styles?.borderBottom)}
                          className={`py-1.5 px-2 rounded-lg border text-center font-medium transition ${
                            selectedSection.styles?.borderBottom
                              ? 'bg-sky-600 border-sky-400 text-white font-bold'
                              : 'bg-[#0E1522] border-[#222E42] text-slate-400 hover:text-white'
                          }`}
                        >
                          Border Bottom
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  Select a section in the preview canvas to customize colors and styling.
                </div>
              )
            )}

            {/* TAB 3: MULTI-MODEL AI CODING & POLISH CHAT (Kept mounted to preserve conversation history) */}
            <div className={inspectorTab === 'ai' ? 'block animate-in fade-in duration-150' : 'hidden'}>
              <MultiModelAiCodingChat
                section={selectedSection}
                allSections={sections}
                onSelectSection={(secId) => setSelectedSectionId(secId)}
                onApplyField={handlePropChange}
                onApplyMultipleProps={handleMultiplePropsChange}
                onApplyDarkThemeToAllSections={handleApplyDarkThemeToAllSections}
                onSwitchToKeysTab={() => setInspectorTab('keys')}
                pageContext={{
                  pageSlug: activePageSlug,
                  siteName: siteData?.name || 'Gold Fields / Bastion',
                  totalSections: sections.length
                }}
                brandKit={brandKit}
              />
            </div>

            {/* TAB 4: API KEYS CREDENTIAL MANAGEMENT (Kept mounted) */}
            <div className={inspectorTab === 'keys' ? 'block animate-in fade-in duration-150' : 'hidden'}>
              <ApiKeysTab />
            </div>
          </div>
        </div>
      </div>

      {/* Section Library Drawer */}
      <SectionLibraryDrawer
        open={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelectComponent={handleInsertSection}
      />

      {/* Full Bastion AI Content Agent Modal */}
      {isContentAgentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <InEditorContentAgent
              section={selectedSection}
              onApplyField={handlePropChange}
              onClose={() => setIsContentAgentModalOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* Add To Release Bundling Modal */}
      {isReleaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <CalendarCheck className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold">Bundle Page into Content Release</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReleaseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Bundle the current <strong className="text-white">{activePageSlug.toUpperCase()}</strong> page layout ({sections.length} blocks, {getLocaleMeta(selectedLocale).name}) into an atomic release for scheduled deployment.
            </p>

            {releaseStatusMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                releaseStatusMsg.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
              }`}>
                {releaseStatusMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{releaseStatusMsg.text}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Select Target Release
                </label>
                {availableReleases.length === 0 ? (
                  <div className="p-3 rounded-xl bg-[#0A0D14] border border-slate-800 text-slate-400 text-center">
                    No active draft or scheduled releases found.
                    <a href="/admin/releases" target="_blank" className="text-purple-400 font-bold ml-1 underline">
                      Create one in Releases Manager
                    </a>
                  </div>
                ) : (
                  <select
                    value={selectedReleaseId}
                    onChange={(e) => setSelectedReleaseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0A0D14] border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  >
                    {availableReleases.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} [{r.status.toUpperCase()}] &bull; {r.itemCount || 0} items bundled
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Revision Summary / Embargo Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Updated executive metrics and multi-lingual banners"
                  value={releaseNote}
                  onChange={(e) => setReleaseNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0A0D14] border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#0A0D14] border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Bundled Page:</span>
                  <span className="text-white font-mono">{activePageSlug}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected Locale:</span>
                  <span className="text-purple-300 font-semibold">{getLocaleMeta(selectedLocale).flag} {getLocaleMeta(selectedLocale).name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Dynamic Blocks:</span>
                  <span className="text-white font-mono">{sections.length}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsReleaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isAddingToRelease || availableReleases.length === 0}
                  onClick={handleConfirmAddToRelease}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>{isAddingToRelease ? 'Bundling...' : 'Bundle Page Into Release'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Composition Version History & Rollback Modal */}
      {isVersionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <History className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">Page Version History & Rollback</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVersionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Review immutable historical revisions for <strong className="text-white">{activePageSlug.toUpperCase()}</strong>. You are currently editing <span className="text-indigo-400 font-mono font-semibold">v{currentVersionNumber}</span>.
            </p>

            {rollbackStatusMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                rollbackStatusMsg.type === 'success'
                  ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
              }`}>
                {rollbackStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{rollbackStatusMsg.text}</span>
              </div>
            )}

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800/60">
              {isLoadingVersions ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading version snapshots...</div>
              ) : versionHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">No previous version snapshots recorded yet.</div>
              ) : (
                versionHistory.map((ver) => {
                  const isCurrent = ver.version === currentVersionNumber;
                  return (
                    <div
                      key={ver.id}
                      className={`pt-3 pb-2 flex items-center justify-between text-xs rounded-xl px-3 transition ${
                        isCurrent ? 'bg-indigo-950/40 border border-indigo-500/30' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                            isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                          }`}>
                            v{ver.version}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                            ver.status === 'published' ? 'bg-emerald-900/60 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {ver.status}
                          </span>
                          <span className="text-slate-400 font-medium">{ver.sectionCount} blocks</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          {ver.changeSummary || 'Snapshot'} &bull; <span className="text-slate-500">{ver.createdByName}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {new Date(ver.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div>
                        {isCurrent ? (
                          <span className="text-[11px] font-semibold text-indigo-400 px-2.5 py-1 rounded-lg bg-indigo-900/40 border border-indigo-700/40">
                            Current Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isRollingBack}
                            onClick={() => handleRollback(ver.version)}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center space-x-1 cursor-pointer transition shadow-xs disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{isRollingBack ? 'Restoring...' : 'Rollback'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsVersionModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Executive Mobile Phone Preview QR Modal */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0D131F] border border-slate-200 dark:border-[#1E2E44] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Executive Mobile QR Preview</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Boardroom &amp; C-Suite Live Phone Verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="text-center space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Scan with your iPhone or Android camera to instantly view and test this page draft on your personal phone before giving executive sign-off.
              </p>

              {/* QR Image Box */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 inline-block shadow-inner mx-auto">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/sites/${siteSlug}?preview=true`
                      : `http://localhost:3010/sites/${siteSlug}?preview=true`
                  )}`}
                  alt="Executive Mobile Preview QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>

              {/* Direct Link & Copy */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="text"
                  readOnly
                  value={
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/sites/${siteSlug}?preview=true`
                      : `http://localhost:3010/sites/${siteSlug}?preview=true`
                  }
                  className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#141C2A] text-slate-600 dark:text-slate-300 text-[11px] font-mono select-all focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = typeof window !== 'undefined'
                      ? `${window.location.origin}/sites/${siteSlug}?preview=true`
                      : `http://localhost:3010/sites/${siteSlug}?preview=true`;
                    navigator.clipboard.writeText(url);
                    setCopiedQrUrl(true);
                    setTimeout(() => setCopiedQrUrl(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition hover:opacity-90 shrink-0 cursor-pointer"
                >
                  {copiedQrUrl ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Local Staging Draft Active &bull; Real-time Viewport</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VisualWebsiteEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen bg-[#080C14] text-white flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400 font-mono">Loading Bastion Studio Editor...</span>
          </div>
        </div>
      }
    >
      <VisualWebsiteEditorContent />
    </Suspense>
  );
}
