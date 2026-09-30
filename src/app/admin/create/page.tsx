'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Globe,
  Upload,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Layers,
  Palette,
  Eye,
  Lock,
  Unlock,
  RefreshCw,
  ExternalLink,
  Sliders,
  Check,
  Building,
  Target,
  Image as ImageIcon,
  X,
  FileCode,
  ShieldCheck,
  Cpu,
  Pickaxe,
  TrendingUp,
  SunMedium,
  GitBranch,
  Code2,
  Key,
  ChevronRight
} from 'lucide-react';
import { BLUEPRINTS } from '@/lib/studio/blueprints';
import { DESIGN_COLLECTIONS } from '@/lib/studio/collections';
import type { BlueprintId, DesignCollectionId, DiscoveredPage } from '@/lib/studio/types';

function GitHubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function WebsiteCreationWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Step state: 1 to 6
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step A: Setup
  const [startPath, setStartPath] = useState<'import' | 'pack' | 'brief' | 'github'>('import');
  const [clientName, setClientName] = useState('');
  const [websiteName, setWebsiteName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [industry, setIndustry] = useState('mining_resources');
  const [targetAudience, setTargetAudience] = useState('');
  const [businessGoal, setBusinessGoal] = useState('');
  const [conversionAction, setConversionAction] = useState('');
  const [designIntent, setDesignIntent] = useState<'conservative' | 'bold'>('bold');
  const [language, setLanguage] = useState('English (UK)');

  // GitHub Repository & Developer Integration
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUser, setGithubUser] = useState<any>(null);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState('MalcolmGov/Goldfields');
  const [customRepoInput, setCustomRepoInput] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [isExtractingRepo, setIsExtractingRepo] = useState(false);
  const [repoExtractionResult, setRepoExtractionResult] = useState<any>(null);
  const [showPatModal, setShowPatModal] = useState(false);
  const [patInput, setPatInput] = useState('');
  const [isConnectingPat, setIsConnectingPat] = useState(false);
  const [linkRepoExpanded, setLinkRepoExpanded] = useState(false);

  // Brand & Content Pack Uploads (Option 2)
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ name: string; size: string }>>([]);
  const [primaryBrandColor, setPrimaryBrandColor] = useState('#0F172A');
  const [accentBrandColor, setAccentBrandColor] = useState('#2563EB');
  const [packBriefNotes, setPackBriefNotes] = useState('');

  // Step B: Import Scope
  const [isExtracting, setIsExtracting] = useState(false);
  const [maxPages, setMaxPages] = useState(10);
  const [discoveredPages, setDiscoveredPages] = useState<DiscoveredPage[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<Record<string, boolean>>({});
  const [extractError, setExtractError] = useState<string | null>(null);

  // Step C: Brand & Content Review
  const [extractedBrand, setExtractedBrand] = useState<any>(null);
  const [extractedContent, setExtractedContent] = useState<any>(null);
  const [provenanceData, setProvenanceData] = useState<any>({});
  const [approvedBrandTokens, setApprovedBrandTokens] = useState<Record<string, boolean>>({
    logo: true,
    colors: true,
    typography: true,
    facts: true
  });
  const [lockedTokens, setLockedTokens] = useState<Record<string, boolean>>({
    primaryColor: true,
    primaryLogo: true
  });

  // Step D: Design Selection
  const bpParam = searchParams.get('blueprint') as BlueprintId | null;
  const [selectedBlueprint, setSelectedBlueprint] = useState<BlueprintId>(
    bpParam && bpParam in BLUEPRINTS ? bpParam : 'mining_resources'
  );
  const [selectedCollection, setSelectedCollection] = useState<DesignCollectionId>('contemporary');
  const [previewDirection, setPreviewDirection] = useState<'direction_a' | 'direction_b'>('direction_a');

  // Step E: Assembly
  const [isAssembling, setIsAssembling] = useState(false);
  const [assemblyProgress, setAssemblyProgress] = useState(0);
  const [assemblyResult, setAssemblyResult] = useState<any>(null);

  // Handle Logo Upload for Option 2
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedLogo(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Documents Upload for Option 2
  const handleDocsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newDocs: Array<{ name: string; size: string }> = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const sizeMb = (f.size / (1024 * 1024)).toFixed(1);
      newDocs.push({
        name: f.name,
        size: `${sizeMb === '0.0' ? '<1' : sizeMb} MB`
      });
    }
    setUploadedDocs((prev) => [...prev, ...newDocs]);
  };

  // Check and load GitHub integration status on mount
  useEffect(() => {
    async function loadGitHub() {
      try {
        const res = await fetch('/api/admin/github/repos');
        if (res.ok) {
          const data = await res.json();
          setGithubConnected(data.isConnected);
          setGithubUser(data.user);
          if (data.repos && data.repos.length > 0) {
            setGithubRepos(data.repos);
            if (!selectedRepo) {
              setSelectedRepo(data.repos[0].full_name);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load GitHub integration:', err);
      }
    }
    loadGitHub();
  }, []);

  const handleConnectOAuth = async () => {
    try {
      const res = await fetch('/api/admin/github/connect');
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (err) {
      console.error('Failed to initiate GitHub OAuth:', err);
    }
  };

  const handleSavePat = async () => {
    if (!patInput.trim()) return;
    setIsConnectingPat(true);
    try {
      const res = await fetch('/api/admin/github/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: patInput.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setGithubConnected(true);
        setGithubUser(data.user);
        setShowPatModal(false);
        setPatInput('');
        const reposRes = await fetch('/api/admin/github/repos');
        if (reposRes.ok) {
          const repoData = await reposRes.json();
          setGithubRepos(repoData.repos || []);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to verify GitHub token.');
      }
    } catch (err: any) {
      alert(`Connection Error: ${err.message}`);
    } finally {
      setIsConnectingPat(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    if (!confirm('Disconnect GitHub account from Bastion Platform?')) return;
    try {
      await fetch('/api/admin/github/status', { method: 'DELETE' });
      setGithubConnected(false);
      setGithubUser(null);
    } catch (err) {
      console.warn('Failed to disconnect GitHub:', err);
    }
  };

  const handleExtractFromRepo = async () => {
    const targetRepo = customRepoInput.trim() || selectedRepo.trim();
    if (!targetRepo) {
      setExtractError('Please specify or select a GitHub repository.');
      return;
    }

    setIsExtractingRepo(true);
    setExtractError(null);

    try {
      const res = await fetch('/api/admin/github/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo: targetRepo, branch: selectedBranch.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to extract code from repository');

      const ext = data.extraction;
      setRepoExtractionResult(ext);

      // Auto-fill Client Organization Name if empty
      const repoCleanName = (ext.repoFullName.split('/')[1] || targetRepo)
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase());

      if (!clientName.trim()) {
        setClientName(repoCleanName);
      }
      if (!websiteName.trim()) {
        setWebsiteName(`${clientName.trim() || repoCleanName} Flagship`);
      }

      setPrimaryBrandColor(ext.brandTokens.primaryColor);
      setAccentBrandColor(ext.brandTokens.accentColor);

      setExtractedBrand({
        nameCandidate: clientName.trim() || repoCleanName,
        taglineCandidate: `${clientName.trim() || repoCleanName} — Digital Corporate Platform`,
        logos: ext.discoveredLogos.map((l: any) => ({
          url: l.url || '/assets/bastion-original-logo-hd.png',
          name: l.name,
          status: 'approved'
        })),
        colors: ext.brandTokens.palette.map((p: any) => ({
          name: p.name,
          hex: p.hex,
          value: p.hex,
          status: 'approved'
        })),
        typography: {
          headingFont: ext.brandTokens.typography.headingFont,
          bodyFont: ext.brandTokens.typography.bodyFont,
          headingWeight: '700',
          scaleRatio: 1.25,
          status: 'approved'
        },
        toneOfVoice: 'Engineered, institutional, and high-performance',
        approvedFacts: [
          `Source repository: ${ext.repoFullName} on branch ${ext.branch}.`,
          `Detected framework: ${ext.framework}.`,
          `Extracted ${ext.components.length} UI components and ${ext.pagesFound.length} page structures.`
        ]
      });

      setExtractedContent({
        tagline: `${clientName.trim() || repoCleanName} — Enterprise Excellence`,
        businessSummary: `Extracted from repository ${ext.repoFullName}. Production-ready multi-tenant web application.`,
        servicesFound: ext.components.map((c: any) => ({
          title: c.name,
          description: `Component extracted from ${c.path} (${c.category})`
        })),
        contactInfoFound: {
          email: 'developer@bastiongroup.co.za',
          address: 'Sandton Corporate Precinct, Johannesburg'
        },
        navigationFound: ext.pagesFound.map((p: any) => ({
          label: p.title,
          url: p.route
        })),
        socialLinks: [
          { platform: 'github', url: `https://github.com/${ext.repoFullName}` }
        ]
      });
    } catch (err: any) {
      setExtractError(err.message);
    } finally {
      setIsExtractingRepo(false);
    }
  };

  // Handle Option 1: URL Extraction (Step 1 -> Step 2)
  const handleStartExtraction = async () => {
    if (!sourceUrl.trim()) {
      setExtractError('Please enter an existing website URL to crawl, or switch to Option 2 (Brand Pack) or Option 3 (Business Brief).');
      return;
    }

    setIsExtracting(true);
    setExtractError(null);

    try {
      const res = await fetch('/api/admin/wizard/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: sourceUrl,
          maxPages,
          excludedPaths: ['/admin', '/login', '/wp-admin']
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to extract website');

      const result = data.result;
      setDiscoveredPages(result.discoveredPages || []);
      setExtractedBrand(result.brandCandidates);
      setExtractedContent(result.content);
      setProvenanceData(result.provenance || {});

      // Auto-populate client and website name if empty
      if (result.brandCandidates?.nameCandidate) {
        if (!clientName.trim()) setClientName(result.brandCandidates.nameCandidate);
        if (!websiteName.trim()) setWebsiteName(`${result.brandCandidates.nameCandidate} Flagship`);
      }

      // Select all by default
      const initialMap: Record<string, boolean> = {};
      result.discoveredPages.forEach((p: DiscoveredPage) => {
        initialMap[p.url] = p.status !== 'excluded';
      });
      setSelectedUrls(initialMap);

      setCurrentStep(2);
    } catch (err: any) {
      setExtractError(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle Option 2: Brand & Content Pack (Step 1 -> Step 3)
  const handleContinueFromPack = () => {
    if (!clientName.trim()) {
      setExtractError('Please specify a Client Organization Name before continuing.');
      return;
    }

    setExtractError(null);
    const finalWebName = websiteName.trim() || `${clientName} Corporate Portal`;
    setWebsiteName(finalWebName);

    const brandCandidate = {
      nameCandidate: clientName,
      taglineCandidate: packBriefNotes.split('.')[0] || `${clientName} — Corporate Excellence`,
      logos: [
        {
          url: uploadedLogo || '/assets/bastion-original-logo-hd.png',
          name: 'Primary Vector Logo',
          status: 'approved'
        }
      ],
      colors: [
        { name: 'Primary Brand', hex: primaryBrandColor, value: primaryBrandColor, status: 'approved' },
        { name: 'Corporate Dark', hex: '#1E293B', value: '#1E293B', status: 'approved' },
        { name: 'Accent Action', hex: accentBrandColor, value: accentBrandColor, status: 'approved' }
      ],
      typography: {
        headingFont: 'Plus Jakarta Sans',
        bodyFont: 'Inter',
        headingWeight: '700',
        scaleRatio: 1.25,
        status: 'approved'
      },
      toneOfVoice: 'Disciplined, executive, and forward-looking',
      approvedFacts: [
        `${clientName} operates with verified corporate standards and transparent governance.`,
        packBriefNotes || 'Delivering high-performance enterprise capabilities across commercial markets.',
        uploadedDocs.length > 0
          ? `Verified against ${uploadedDocs.length} uploaded brand documents (${uploadedDocs.map((d) => d.name).join(', ')}).`
          : 'Ingested from client brand kit repository.'
      ]
    };

    setExtractedBrand(brandCandidate);
    setExtractedContent({
      businessSummary: packBriefNotes || `${clientName} is a leading corporate organization operating with institutional discipline.`,
      servicesFound: [
        { title: 'Core Operations & Assets', description: 'Enterprise service delivery, capital governance, and operations.' },
        { title: 'Regulatory Compliance & ESG', description: 'Governance standards, annual disclosures, and investor reporting.' },
        { title: 'Strategic Partnerships', description: 'Stakeholder alignment and long-term commercial value creation.' }
      ],
      contactInfoFound: {
        email: `contact@${clientName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'client'}.com`,
        address: 'Sandton Corporate Precinct, Johannesburg'
      },
      navigationFound: [
        { label: 'About', url: '/about' },
        { label: 'Operations', url: '/operations' },
        { label: 'Governance', url: '/governance' },
        { label: 'Contact', url: '/contact' }
      ],
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com', handle: `@${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}` }
      ]
    });

    setCurrentStep(3);
  };

  // Handle Option 3: Business Brief (Step 1 -> Step 4)
  const handleContinueFromBrief = () => {
    if (!clientName.trim()) {
      setExtractError('Please specify a Client Organization Name before continuing.');
      return;
    }

    setExtractError(null);
    const finalWebName = websiteName.trim() || `${clientName} Global Flagship`;
    setWebsiteName(finalWebName);

    const brandCandidate = {
      nameCandidate: clientName,
      taglineCandidate: businessGoal || `${clientName} — Strategic Enterprise Solutions`,
      logos: [
        {
          url: '/assets/bastion-original-logo-hd.png',
          name: 'Executive Brand Mark',
          status: 'approved'
        }
      ],
      colors: [
        { name: 'Primary Brand', hex: primaryBrandColor, value: primaryBrandColor, status: 'approved' },
        { name: 'Corporate Dark', hex: '#1E293B', value: '#1E293B', status: 'approved' },
        { name: 'Accent Action', hex: accentBrandColor, value: accentBrandColor, status: 'approved' }
      ],
      typography: {
        headingFont: designIntent === 'conservative' ? 'Playfair Display' : 'Plus Jakarta Sans',
        bodyFont: 'Inter',
        headingWeight: '700',
        scaleRatio: 1.25,
        status: 'approved'
      },
      toneOfVoice:
        designIntent === 'conservative'
          ? 'Authoritative, institutional, and governance-driven'
          : 'Modern, decisive, and forward-looking',
      approvedFacts: [
        `${clientName} is engineered specifically to address ${targetAudience || 'enterprise clients and institutional stakeholders'}.`,
        `Core strategic objective: ${businessGoal || 'Driving sustained commercial growth and operational excellence'}.`,
        `Operates with strict regulatory compliance and executive stewardship.`
      ]
    };

    setExtractedBrand(brandCandidate);
    setExtractedContent({
      tagline: businessGoal || `${clientName} — Enterprise Excellence`,
      businessSummary: businessGoal || `${clientName} delivers premier capabilities for ${targetAudience || 'market leaders'}.`,
      servicesFound: [
        { title: 'Strategic Advisory & Operations', description: `Purpose-built capabilities serving ${targetAudience || 'corporate clients'}.` },
        { title: 'Governance & Asset Stewardship', description: 'Enterprise risk management, stakeholder reporting, and transparency.' },
        { title: 'Market Engagement', description: `Driving conversion through: ${conversionAction || 'Confidential Consultation'}.` }
      ],
      contactInfoFound: {
        email: `contact@${clientName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`,
        address: 'Sandton Corporate Precinct, Johannesburg'
      },
      navigationFound: [
        { label: 'About', url: '/about' },
        { label: 'Operations', url: '/operations' },
        { label: 'Governance', url: '/governance' },
        { label: 'Contact', url: '/contact' }
      ],
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com', handle: `@${clientName.toLowerCase().replace(/[^a-z0-9]/g, '')}` }
      ]
    });

    setCurrentStep(4);
  };

  // Handle Website Assembly (Step 4 -> Step 5)
  const handleAssembleWebsite = async () => {
    setIsAssembling(true);
    setCurrentStep(5);
    setAssemblyProgress(20);

    const safeClientName = clientName.trim() || 'Enterprise Client';
    const slug = safeClientName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const clientId = `client_${slug.replace(/-/g, '_')}`;

    try {
      setTimeout(() => setAssemblyProgress(50), 300);
      setTimeout(() => setAssemblyProgress(80), 700);

      const res = await fetch('/api/admin/wizard/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          clientName: safeClientName,
          websiteName: websiteName.trim() || `${safeClientName} Flagship`,
          websiteSlug: slug,
          blueprintId: selectedBlueprint,
          collectionId: selectedCollection,
          brandKit: {
            logos: {
              primary: extractedBrand?.logos?.[0] || {
                url: uploadedLogo || '/assets/bastion-original-logo-hd.png',
                status: 'approved'
              }
            },
            colors: {
              primary: extractedBrand?.colors?.[0]
                ? {
                    name: extractedBrand.colors[0].name,
                    value: extractedBrand.colors[0].hex || (extractedBrand.colors[0] as any).value || primaryBrandColor,
                    status: 'approved'
                  }
                : { name: 'Primary Brand', value: primaryBrandColor, status: 'approved' },
              secondary: extractedBrand?.colors?.[1]
                ? {
                    name: extractedBrand.colors[1].name,
                    value: extractedBrand.colors[1].hex || (extractedBrand.colors[1] as any).value || '#1E293B',
                    status: 'approved'
                  }
                : { name: 'Corporate Dark', value: '#1E293B', status: 'approved' },
              accent: extractedBrand?.colors?.[2]
                ? {
                    name: extractedBrand.colors[2].name,
                    value: extractedBrand.colors[2].hex || (extractedBrand.colors[2] as any).value || accentBrandColor,
                    status: 'approved'
                  }
                : { name: 'Accent', value: accentBrandColor, status: 'approved' },
              background: {
                name: 'Canvas',
                value: selectedCollection === 'immersive' ? '#09090B' : '#F8FAFC',
                status: 'approved'
              },
              surface: {
                name: 'Surface',
                value: selectedCollection === 'immersive' ? '#18181B' : '#FFFFFF',
                status: 'approved'
              },
              textPrimary: {
                name: 'Text Dark',
                value: selectedCollection === 'immersive' ? '#FFFFFF' : '#0F172A',
                status: 'approved'
              },
              textMuted: {
                name: 'Text Muted',
                value: selectedCollection === 'immersive' ? '#A1A1AA' : '#64748B',
                status: 'approved'
              },
              hairline: {
                name: 'Border',
                value: selectedCollection === 'immersive' ? '#27272A' : '#E2E8F0',
                status: 'approved'
              }
            },
            typography: {
              headingFont:
                extractedBrand?.typography?.headingFont ||
                (designIntent === 'conservative' ? 'Playfair Display' : 'Plus Jakarta Sans'),
              bodyFont: extractedBrand?.typography?.bodyFont || 'Inter',
              headingWeight: '700',
              scaleRatio: 1.25,
              status: 'approved'
            },
            voiceAndMessaging: {
              toneOfVoice:
                extractedBrand?.toneOfVoice ||
                (designIntent === 'conservative'
                  ? 'Authoritative and decisive corporate leadership'
                  : 'Modern, high-velocity enterprise clarity'),
              approvedFacts: extractedBrand?.approvedFacts || [
                `${safeClientName} provides verified corporate capabilities and institutional stewardship.`,
                `Operating with multi-stakeholder governance and strict ESG compliance.`
              ],
              tagline: extractedBrand?.taglineCandidate || `${safeClientName} — Enterprise Excellence`
            }
          },
          extractedContent: {
            tagline: extractedBrand?.taglineCandidate || `${safeClientName} — Enterprise Excellence`,
            services: extractedContent?.servicesFound || [
              { title: 'Core Operations', description: 'Enterprise service delivery and disciplined execution.' },
              { title: 'Governance & Asset Stewardship', description: 'Managing institutional assets with full regulatory compliance.' },
              { title: 'Strategic Partnerships', description: 'Building high-value cross-border stakeholder alliances.' }
            ],
            contactInfo: extractedContent?.contactInfoFound || {
              email: `contact@${slug || 'client'}.com`,
              address: 'Sandton Corporate Precinct, Johannesburg'
            },
            businessSummary:
              extractedContent?.businessSummary ||
              businessGoal ||
              `${safeClientName} is a premier enterprise organization delivering specialized capabilities across commercial markets.`,
            navigation: extractedContent?.navigationFound || [
              { label: 'About', url: '/about' },
              { label: 'Operations', url: '/operations' },
              { label: 'Governance', url: '/governance' },
              { label: 'Contact', url: '/contact' }
            ],
            socialLinks: extractedContent?.socialLinks || [],
            footerNavigation: extractedContent?.footerNavigation || []
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Assembly error');

      setAssemblyProgress(100);
      setAssemblyResult(data);
      setTimeout(() => setCurrentStep(6), 400);
    } catch (err: any) {
      alert(`Assembly Error: ${err.message}`);
      setCurrentStep(4);
    } finally {
      setIsAssembling(false);
    }
  };

  // Adaptive Stepper Headers based on starting path
  const stepsHeader =
    startPath === 'brief'
      ? [
          { num: 1, label: 'Brief' },
          { num: 4, label: 'Design' },
          { num: 5, label: 'Assembly' },
          { num: 6, label: 'Review' }
        ]
      : startPath === 'pack'
      ? [
          { num: 1, label: 'Brand Pack' },
          { num: 3, label: 'Brand Review' },
          { num: 4, label: 'Design' },
          { num: 5, label: 'Assembly' },
          { num: 6, label: 'Review' }
        ]
      : startPath === 'github'
      ? [
          { num: 1, label: 'Repository' },
          { num: 3, label: 'Code & Brand Review' },
          { num: 4, label: 'Design' },
          { num: 5, label: 'Assembly' },
          { num: 6, label: 'Review' }
        ]
      : [
          { num: 1, label: 'Setup' },
          { num: 2, label: 'Scope' },
          { num: 3, label: 'Brand & Facts' },
          { num: 4, label: 'Design' },
          { num: 5, label: 'Assembly' },
          { num: 6, label: 'Review' }
        ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Wizard Header & Stepper */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold font-mono uppercase text-sky-400">
                Bastion Studio Creation Engine
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-xs text-slate-400">Guided Client Onboarding</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Create Populated Client Website
            </h1>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-slate-400">Step {currentStep} of 6</span>
          </div>
        </div>

        {/* Stepper Bar */}
        <div
          className={`grid gap-2 pt-2 ${
            startPath === 'brief'
              ? 'grid-cols-4'
              : startPath === 'pack' || startPath === 'github'
              ? 'grid-cols-5'
              : 'grid-cols-6'
          }`}
        >
          {stepsHeader.map((s) => (
            <div key={s.num} className="space-y-1">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  s.num < currentStep
                    ? 'bg-emerald-500'
                    : s.num === currentStep
                    ? 'bg-sky-400 shadow-sm shadow-sky-400/50'
                    : 'bg-[#1E293B]'
                }`}
              />
              <div className="flex items-center space-x-1 text-[10px] font-medium text-slate-400 truncate">
                <span className="font-mono">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: PROJECT SETUP */}
      {currentStep === 1 && (
        <div className="bg-[#0E1522] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-8 animate-fadeIn">
          <div>
            <h2 className="text-lg font-bold text-white">Step A: Project Setup &amp; Starting Path</h2>
            <p className="text-xs text-slate-400 mt-1">
              Choose how to initialize the client project. Existing-site import is the primary recommended workflow.
            </p>
          </div>

          {/* Starting Paths Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => {
                setStartPath('import');
                setExtractError(null);
              }}
              className={`p-5 rounded-xl border text-left transition cursor-pointer ${
                startPath === 'import'
                  ? 'bg-sky-950/50 border-sky-500 ring-1 ring-sky-500 text-white'
                  : 'bg-[#141C2A] border-[#1E293B] text-slate-300 hover:border-slate-700'
              }`}
            >
              <Globe className="w-6 h-6 text-sky-400 mb-3" />
              <div className="text-sm font-bold">1. Import Existing Site</div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                Extract brand tokens, navigation, services, and copy from a public client URL.
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setStartPath('pack');
                setExtractError(null);
              }}
              className={`p-5 rounded-xl border text-left transition cursor-pointer ${
                startPath === 'pack'
                  ? 'bg-indigo-950/50 border-indigo-500 ring-1 ring-indigo-500 text-white'
                  : 'bg-[#141C2A] border-[#1E293B] text-slate-300 hover:border-slate-700'
              }`}
            >
              <Upload className="w-6 h-6 text-indigo-400 mb-3" />
              <div className="text-sm font-bold">2. Brand &amp; Content Pack</div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                Upload brand guidelines PDF, logo SVGs, and service copy briefs.
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setStartPath('brief');
                setExtractError(null);
              }}
              className={`p-5 rounded-xl border text-left transition cursor-pointer ${
                startPath === 'brief'
                  ? 'bg-emerald-950/50 border-emerald-500 ring-1 ring-emerald-500 text-white'
                  : 'bg-[#141C2A] border-[#1E293B] text-slate-300 hover:border-slate-700'
              }`}
            >
              <FileText className="w-6 h-6 text-emerald-400 mb-3" />
              <div className="text-sm font-bold">3. Start from Brief</div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                Define client industry, core goals, and target audience from scratch.
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setStartPath('github');
                setExtractError(null);
              }}
              className={`p-5 rounded-xl border text-left transition cursor-pointer ${
                startPath === 'github'
                  ? 'bg-purple-950/50 border-purple-500 ring-1 ring-purple-500 text-white'
                  : 'bg-[#141C2A] border-[#1E293B] text-slate-300 hover:border-slate-700'
              }`}
            >
              <GitHubIcon className="w-6 h-6 text-purple-400 mb-3" />
              <div className="text-sm font-bold">4. GitHub Repository Code</div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                Connect developer repo to extract AST components, brand tokens, and client code into CMS.
              </div>
            </button>
          </div>

          {/* PATH 1 FORM: IMPORT EXISTING SITE */}
          {startPath === 'import' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#1E293B]">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Client Organization Name
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Meridian Strategic Capital or Gold Fields"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-sky-500 placeholder:text-slate-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Website Project Name
                </label>
                <input
                  type="text"
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  placeholder="e.g. Meridian Corporate Flagship"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-sky-500 placeholder:text-slate-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Existing Website URL (Source for Ingestion)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://www.goldfields.com"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm font-mono focus:outline-none focus:border-sky-500 placeholder:text-slate-500"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
                  <span>Protected by SSRF security validation. Rejects internal IP ranges and loopbacks.</span>
                  {/* Quick 1-click test pills */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Quick Test:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSourceUrl('https://www.goldfields.com');
                        setClientName('Gold Fields Limited');
                        setWebsiteName('Gold Fields Flagship');
                        setIndustry('mining_resources');
                      }}
                      className="text-sky-400 hover:underline cursor-pointer font-medium"
                    >
                      Gold Fields
                    </button>
                    <span>&bull;</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSourceUrl('https://www.bastiongroup.co.za');
                        setClientName('Bastion Group');
                        setWebsiteName('Bastion Group SA');
                        setIndustry('corporate');
                      }}
                      className="text-sky-400 hover:underline cursor-pointer font-medium"
                    >
                      Bastion Group
                    </button>
                    <span>&bull;</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSourceUrl('https://www.exxaro.com');
                        setClientName('Exxaro Resources');
                        setWebsiteName('Exxaro Corporate Portal');
                        setIndustry('mining_resources');
                      }}
                      className="text-sky-400 hover:underline cursor-pointer font-medium"
                    >
                      Exxaro
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Industry Sector
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-sky-500"
                >
                  <option value="mining_resources">Mining &amp; Natural Resources</option>
                  <option value="corporate">Corporate Flagship &amp; Conglomerate</option>
                  <option value="wealth_private_equity">Sovereign Wealth &amp; Private Equity</option>
                  <option value="renewable_energy">Renewable Energy &amp; Infrastructure</option>
                  <option value="enterprise_tech">Enterprise Technology &amp; AI</option>
                  <option value="healthcare">Healthcare &amp; Life Sciences</option>
                  <option value="legal_advisory">Institutional Legal &amp; M&A Advisory</option>
                  <option value="hospitality_living">Luxury Living &amp; Boutique Hospitality</option>
                  <option value="professional_services">Professional Services &amp; Advisory</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Primary Conversion Action
                </label>
                <input
                  type="text"
                  value={conversionAction}
                  onChange={(e) => setConversionAction(e.target.value)}
                  placeholder="e.g. Schedule Confidential Discussion"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-sky-500 placeholder:text-slate-500 font-medium"
                />
              </div>
            </div>
          )}

          {/* PATH 2 FORM: BRAND & CONTENT PACK */}
          {startPath === 'pack' && (
            <div className="space-y-6 pt-4 border-t border-[#1E293B] animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Client Organization Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Solaris Clean Energy or Valen Wealth"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Website Project Name
                  </label>
                  <input
                    type="text"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    placeholder="e.g. Solaris Corporate Portal"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Industry Sector
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="renewable_energy">Renewable Energy &amp; Infrastructure</option>
                    <option value="mining_resources">Mining &amp; Natural Resources</option>
                    <option value="corporate">Corporate Flagship &amp; Conglomerate</option>
                    <option value="wealth_private_equity">Sovereign Wealth &amp; Private Equity</option>
                    <option value="enterprise_tech">Enterprise Technology &amp; AI</option>
                    <option value="healthcare">Healthcare &amp; Life Sciences</option>
                    <option value="legal_advisory">Institutional Legal &amp; M&A Advisory</option>
                    <option value="hospitality_living">Luxury Living &amp; Boutique Hospitality</option>
                    <option value="professional_services">Professional Services &amp; Advisory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Primary Conversion Action
                  </label>
                  <input
                    type="text"
                    value={conversionAction}
                    onChange={(e) => setConversionAction(e.target.value)}
                    placeholder="e.g. Request PPA Proposal or Retain Advisory"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 font-medium"
                  />
                </div>
              </div>

              {/* Upload Dropzones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Logo Upload Dropzone */}
                <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-400" />
                      <span>Vector Logo / Brand Mark</span>
                    </span>
                    {uploadedLogo && (
                      <button
                        type="button"
                        onClick={() => setUploadedLogo(null)}
                        className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {uploadedLogo ? (
                    <div className="h-24 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-3 relative overflow-hidden">
                      <img src={uploadedLogo} alt="Uploaded Logo" className="max-h-16 max-w-full object-contain" />
                    </div>
                  ) : (
                    <label className="h-24 rounded-lg border-2 border-dashed border-[#232F42] hover:border-indigo-500/60 bg-[#0A0D14] flex flex-col items-center justify-center cursor-pointer transition p-2 text-center group">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition" />
                      <span className="text-xs text-slate-300 font-medium mt-1">Upload SVG, PNG, or JPG</span>
                      <span className="text-[10px] text-slate-500">Max 5MB &bull; Transparent vector preferred</span>
                      <input type="file" accept=".svg,.png,.jpg,.jpeg" onChange={handleLogoUpload} className="hidden" />
                    </label>
                  )}

                  {!uploadedLogo && (
                    <button
                      type="button"
                      onClick={() => setUploadedLogo('/assets/bastion-original-logo-hd.png')}
                      className="text-[11px] text-indigo-400 hover:underline font-medium block"
                    >
                      Use standard Bastion corporate vector mark &rarr;
                    </button>
                  )}
                </div>

                {/* 2. Brand Guidelines Documents Dropzone */}
                <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-indigo-400" />
                      <span>Brand Guidelines &amp; Brief Documents</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{uploadedDocs.length} attached</span>
                  </div>

                  <label className="h-24 rounded-lg border-2 border-dashed border-[#232F42] hover:border-indigo-500/60 bg-[#0A0D14] flex flex-col items-center justify-center cursor-pointer transition p-2 text-center group">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition" />
                    <span className="text-xs text-slate-300 font-medium mt-1">Attach PDF, DOCX, or TXT</span>
                    <span className="text-[10px] text-slate-500">Brand guidelines, service catalogs, fact sheets</span>
                    <input type="file" multiple accept=".pdf,.docx,.txt,.json" onChange={handleDocsUpload} className="hidden" />
                  </label>

                  {uploadedDocs.length > 0 && (
                    <div className="space-y-1 max-h-20 overflow-y-auto">
                      {uploadedDocs.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-900/60 px-2 py-1 rounded">
                          <span className="truncate max-w-[180px]">{doc.name}</span>
                          <span className="text-slate-500 font-mono text-[10px]">{doc.size}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Color Presets & Textarea */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={primaryBrandColor}
                      onChange={(e) => setPrimaryBrandColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={primaryBrandColor}
                      onChange={(e) => setPrimaryBrandColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-[#141C2A] border border-[#232F42] text-white text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    CTA Accent Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={accentBrandColor}
                      onChange={(e) => setAccentBrandColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={accentBrandColor}
                      onChange={(e) => setAccentBrandColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-[#141C2A] border border-[#232F42] text-white text-xs font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Brief Notes &amp; Core Services (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={packBriefNotes}
                    onChange={(e) => setPackBriefNotes(e.target.value)}
                    placeholder="Paste key corporate facts, services overview, or executive talking points..."
                    className="w-full p-3 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-xs leading-relaxed focus:outline-none focus:border-indigo-500 placeholder:text-slate-500 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PATH 3 FORM: START FROM BUSINESS BRIEF */}
          {startPath === 'brief' && (
            <div className="space-y-6 pt-4 border-t border-[#1E293B] animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Client Organization Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Bowmans Legal Advisory or Meridian Capital"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Website Project Name
                  </label>
                  <input
                    type="text"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    placeholder="e.g. Bowmans Global Portal"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Industry Sector
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => {
                      setIndustry(e.target.value);
                      if (e.target.value in BLUEPRINTS) {
                        setSelectedBlueprint(e.target.value as BlueprintId);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="legal_advisory">Institutional Legal &amp; M&A Advisory</option>
                    <option value="wealth_private_equity">Sovereign Wealth &amp; Private Equity</option>
                    <option value="corporate">Corporate Flagship &amp; Conglomerate</option>
                    <option value="mining_resources">Mining &amp; Natural Resources</option>
                    <option value="renewable_energy">Renewable Energy &amp; Infrastructure</option>
                    <option value="enterprise_tech">Enterprise Technology &amp; AI</option>
                    <option value="healthcare">Healthcare &amp; Life Sciences</option>
                    <option value="hospitality_living">Luxury Living &amp; Boutique Hospitality</option>
                    <option value="professional_services">Professional Services &amp; Advisory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Primary Conversion Action
                  </label>
                  <input
                    type="text"
                    value={conversionAction}
                    onChange={(e) => setConversionAction(e.target.value)}
                    placeholder="e.g. Retain Advisory Team or Request Mandate Discussion"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-500 font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Core Business Goal / Value Proposition
                  </label>
                  <input
                    type="text"
                    value={businessGoal}
                    onChange={(e) => setBusinessGoal(e.target.value)}
                    placeholder="e.g. Drive cross-border M&A mandates, governance counsel, and dispute resolution"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-500 font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Target Stakeholders &amp; Audience
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Board directors, multinational CFOs, institutional fund managers, general counsels"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-emerald-500 placeholder:text-slate-500 font-medium"
                  />
                </div>
              </div>

              {/* Brand Demeanor & Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Brand Demeanor &amp; Typography Intent
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDesignIntent('conservative')}
                      className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                        designIntent === 'conservative'
                          ? 'border-emerald-500 bg-emerald-950/40 text-white'
                          : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">Authoritative</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Classic serif prestige &bull; Governance</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDesignIntent('bold')}
                      className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                        designIntent === 'bold'
                          ? 'border-emerald-500 bg-emerald-950/40 text-white'
                          : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">Modern &amp; Bold</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">High-contrast sans-serif &bull; Dynamic</div>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Executive Palette Theme
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { label: 'Corporate Slate', primary: '#0F172A', accent: '#0284C7' },
                      { label: 'Sovereign Gold', primary: '#1C1917', accent: '#C99700' },
                      { label: 'Private Wealth', primary: '#064E3B', accent: '#10B981' },
                      { label: 'Enterprise Indigo', primary: '#1E1B4B', accent: '#4F46E5' },
                      { label: 'Clean Energy', primary: '#042F2E', accent: '#0D9488' }
                    ].map((pal, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setPrimaryBrandColor(pal.primary);
                          setAccentBrandColor(pal.accent);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 flex items-center space-x-2 text-[11px] text-slate-300 cursor-pointer"
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pal.accent }} />
                        <span>{pal.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PATH 4 FORM: GITHUB REPOSITORY CODE */}
          {startPath === 'github' && (
            <div className="space-y-6 pt-4 border-t border-[#1E293B]">
              {/* GitHub Developer Account Status Banner */}
              <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-700/60 flex items-center justify-center text-purple-400 shrink-0">
                    <GitHubIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Developer GitHub Integration
                      </span>
                      {githubConnected ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Connected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                          Not Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {githubConnected && githubUser
                        ? `Connected as @${githubUser.username} (${githubUser.name || 'Developer'})`
                        : 'Connect via OAuth or Personal Access Token (PAT) to read repositories.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {githubConnected ? (
                    <button
                      type="button"
                      onClick={handleDisconnectGitHub}
                      className="px-3 py-1.5 rounded-lg border border-rose-800 text-rose-400 hover:bg-rose-950/40 text-xs font-medium transition cursor-pointer"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleConnectOAuth}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                      >
                        <GitHubIcon className="w-3.5 h-3.5" />
                        <span>OAuth Connect</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPatModal(true)}
                        className="px-3 py-1.5 rounded-lg border border-purple-700 text-purple-300 hover:bg-purple-950/40 text-xs font-medium flex items-center space-x-1.5 transition cursor-pointer"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Token (PAT)</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Repo & Branch Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Select Developer GitHub Repository
                  </label>
                  {githubRepos && githubRepos.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        value={selectedRepo}
                        onChange={(e) => {
                          setSelectedRepo(e.target.value);
                          setCustomRepoInput('');
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm focus:outline-none focus:border-purple-500 font-mono"
                      >
                        {githubRepos.map((repo) => (
                          <option key={repo.id || repo.full_name} value={repo.full_name}>
                            {repo.full_name} {repo.private ? '(Private)' : '(Public)'}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                        <span>Or specify custom repo:</span>
                        <input
                          type="text"
                          placeholder="e.g. MalcolmGov/Goldfields"
                          value={customRepoInput}
                          onChange={(e) => setCustomRepoInput(e.target.value)}
                          className="flex-1 px-2.5 py-1 rounded-lg bg-[#141C2A] border border-[#232F42] text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. MalcolmGov/Goldfields"
                      value={customRepoInput || selectedRepo}
                      onChange={(e) => {
                        setCustomRepoInput(e.target.value);
                        setSelectedRepo(e.target.value);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Repository Branch
                  </label>
                  <div className="relative">
                    <GitBranch className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="main"
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Organization & Website Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Target Client Organization
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gold Fields Limited"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Target Website Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Gold Fields Corporate Portal"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Extract Trigger Button */}
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-purple-200">
                  <div className="font-semibold text-white flex items-center space-x-1.5">
                    <Code2 className="w-4 h-4 text-purple-400" />
                    <span>Deep Code &amp; Component Extraction</span>
                  </div>
                  <p className="text-purple-300/80 mt-0.5">
                    Parses package.json, tailwind configs, React AST components, brand tokens, and routing structure directly from the repository.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isExtractingRepo}
                  onClick={handleExtractFromRepo}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg shrink-0 flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isExtractingRepo ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Parsing Repository...</span>
                    </>
                  ) : (
                    <>
                      <span>Extract Code &amp; Brand DNA</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Extraction Telemetry Card */}
              {repoExtractionResult && (
                <div className="p-5 rounded-xl bg-[#141C2A] border border-purple-700/60 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-bold text-white">
                        Repository Code &amp; Assets Successfully Indexed
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-700">
                      {repoExtractionResult.framework}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#0E1522] border border-[#232F42]">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">UI Components</div>
                      <div className="text-base font-bold text-white mt-1">
                        {repoExtractionResult.components.length}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {repoExtractionResult.components.slice(0, 2).map((c: any) => c.name).join(', ')}...
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0E1522] border border-[#232F42]">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Pages / Routes</div>
                      <div className="text-base font-bold text-white mt-1">
                        {repoExtractionResult.pagesFound.length}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {repoExtractionResult.pagesFound.slice(0, 2).map((p: any) => p.route).join(', ')}...
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0E1522] border border-[#232F42]">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Brand Palette</div>
                      <div className="flex items-center space-x-1 mt-1.5">
                        <div
                          className="w-4 h-4 rounded-full border border-slate-700"
                          style={{ backgroundColor: repoExtractionResult.brandTokens.primaryColor }}
                          title={`Primary: ${repoExtractionResult.brandTokens.primaryColor}`}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-slate-700"
                          style={{ backgroundColor: repoExtractionResult.brandTokens.accentColor }}
                          title={`Accent: ${repoExtractionResult.brandTokens.accentColor}`}
                        />
                        {repoExtractionResult.brandTokens.palette.slice(0, 3).map((p: any, i: number) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-slate-700"
                            style={{ backgroundColor: p.hex }}
                            title={p.name}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0E1522] border border-[#232F42]">
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Logos &amp; Icons</div>
                      <div className="text-base font-bold text-white mt-1">
                        {repoExtractionResult.discoveredLogos.length} Assets
                      </div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">
                        Brand SVGs extracted
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Optional Developer GitHub Repo Link for all paths */}
          {startPath !== 'github' && (
            <div className="pt-2 border-t border-[#1E293B]/60">
              <button
                type="button"
                onClick={() => setLinkRepoExpanded(!linkRepoExpanded)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-2 transition cursor-pointer"
              >
                <GitHubIcon className="w-3.5 h-3.5 text-purple-400" />
                <span>Link GitHub Repository (Optional for Developers)</span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${linkRepoExpanded ? 'rotate-90' : ''}`} />
              </button>

              {linkRepoExpanded && (
                <div className="mt-3 p-4 rounded-xl bg-[#141C2A] border border-[#232F42] grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Developer Repository
                    </label>
                    <select
                      value={selectedRepo}
                      onChange={(e) => setSelectedRepo(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0E1522] border border-[#232F42] text-white text-xs font-mono"
                    >
                      {githubRepos.map((r) => (
                        <option key={r.full_name} value={r.full_name}>
                          {r.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0E1522] border border-[#232F42] text-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {extractError && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{extractError}</span>
            </div>
          )}

          {/* Step 1 Actions Footer */}
          <div className="flex items-center justify-end pt-4 border-t border-[#1E293B]">
            {startPath === 'import' && (
              <button
                type="button"
                disabled={isExtracting}
                onClick={handleStartExtraction}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg flex items-center space-x-2 cursor-pointer"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Discovering Sitemap...</span>
                  </>
                ) : (
                  <>
                    <span>Discover Sitemap &amp; Scope</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            {startPath === 'pack' && (
              <button
                type="button"
                onClick={handleContinueFromPack}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg flex items-center space-x-2 cursor-pointer"
              >
                <span>Continue to Brand Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {startPath === 'brief' && (
              <button
                type="button"
                onClick={handleContinueFromBrief}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg flex items-center space-x-2 cursor-pointer"
              >
                <span>Synthesize Brand &amp; Continue to Design</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {startPath === 'github' && (
              <button
                type="button"
                disabled={isExtractingRepo}
                onClick={async () => {
                  if (!repoExtractionResult) {
                    await handleExtractFromRepo();
                  }
                  setCurrentStep(3);
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                <span>Continue to Code &amp; Brand Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: IMPORT SCOPE */}
      {currentStep === 2 && (
        <div className="bg-[#0E1522] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Step B: Import Scope &amp; Discovered Pages</h2>
              <p className="text-xs text-slate-400 mt-1">
                Found {discoveredPages.length} public pages. Select which pages to include in the assembled website draft.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-mono">Limit:</span>
              <select
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="px-2 py-1 rounded bg-[#141C2A] border border-[#232F42] text-white text-xs"
              >
                <option value={5}>5 pages</option>
                <option value={10}>10 pages</option>
                <option value={20}>20 pages</option>
              </select>
            </div>
          </div>

          {/* Discovered Pages List */}
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin">
            {discoveredPages.map((p) => (
              <div
                key={p.url}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                  selectedUrls[p.url]
                    ? 'bg-[#141C2A] border-sky-500/40 text-white'
                    : 'bg-[#0A0D14] border-[#1E293B] text-slate-400 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <input
                    type="checkbox"
                    checked={!!selectedUrls[p.url]}
                    onChange={(e) =>
                      setSelectedUrls({ ...selectedUrls, [p.url]: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-sky-500 focus:ring-sky-500 cursor-pointer"
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white truncate">{p.title}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{p.path}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0 text-xs">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] uppercase">
                    {p.pageType}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">{p.wordCount || 0} words</span>
                  <span className="text-emerald-400 text-xs flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ready</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg flex items-center space-x-2 cursor-pointer"
            >
              <span>Review Extracted Brand Tokens</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: BRAND & CONTENT REVIEW */}
      {currentStep === 3 && (
        <div className="bg-[#0E1522] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-8 animate-fadeIn">
          <div>
            <h2 className="text-lg font-bold text-white">Step C: Reviewed Brand Library &amp; Provenance</h2>
            <p className="text-xs text-slate-400 mt-1">
              Verify observed brand tokens and client facts before generating compositions. Lock tokens to prevent accidental AI mutation.
            </p>
          </div>

          {/* Tokens Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Logos */}
            <div className="p-5 rounded-xl bg-[#141C2A] border border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Brand Logo</span>
                <button
                  type="button"
                  onClick={() =>
                    setLockedTokens({ ...lockedTokens, primaryLogo: !lockedTokens.primaryLogo })
                  }
                  className="text-xs text-slate-400 hover:text-white"
                >
                  {lockedTokens.primaryLogo ? (
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-slate-400">
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </span>
                  )}
                </button>
              </div>

              <div className="h-28 rounded-lg bg-[#0A0D14] border border-[#1E293B] flex items-center justify-center p-3 relative">
                {extractedBrand?.logos?.[0]?.url || uploadedLogo ? (
                  <img
                    src={extractedBrand?.logos?.[0]?.url || uploadedLogo || '/assets/bastion-original-logo-hd.png'}
                    alt="Logo"
                    className="max-h-16 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-xs text-slate-500 font-mono">Default Vector Logo</div>
                )}
              </div>
            </div>

            {/* 2. Color Palette */}
            <div className="p-5 rounded-xl bg-[#141C2A] border border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Observed Colors</span>
                <span className="text-[10px] font-mono text-emerald-400">AA Contrast Passed</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Primary', val: extractedBrand?.colors?.[0]?.hex || primaryBrandColor },
                  { name: 'Dark', val: extractedBrand?.colors?.[1]?.hex || '#1E293B' },
                  { name: 'Accent', val: extractedBrand?.colors?.[2]?.hex || accentBrandColor }
                ].map((c, i) => (
                  <div key={i} className="space-y-1">
                    <div
                      className="h-14 rounded-lg border border-slate-700 shadow-inner"
                      style={{ backgroundColor: c.val }}
                    />
                    <div className="text-[10px] font-mono text-slate-400 text-center truncate">{c.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Typography */}
            <div className="p-5 rounded-xl bg-[#141C2A] border border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Typography Scale</span>
                <span className="text-[10px] font-mono text-sky-400">Google Fonts</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0A0D14] border border-[#1E293B] space-y-1.5">
                <div className="text-xs font-bold text-white font-sans">
                  {extractedBrand?.typography?.headingFont || 'Plus Jakarta Sans'}
                </div>
                <div className="text-[11px] text-slate-400 font-sans">
                  {extractedBrand?.typography?.bodyFont || 'Inter'}
                </div>
                <div className="text-[10px] font-mono text-slate-500 pt-1">
                  Scale: 1.25 Major Third
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={() => setCurrentStep(startPath === 'import' ? 2 : 1)}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg flex items-center space-x-2 cursor-pointer"
            >
              <span>Continue to Design Selection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DESIGN SELECTION */}
      {currentStep === 4 && (
        <div className="bg-[#0E1522] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-8 animate-fadeIn">
          <div>
            <h2 className="text-lg font-bold text-white">Step D: Blueprint &amp; Curated Design Collection</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select the foundational architecture and visual collection. Previews below are populated with the client&apos;s extracted material.
            </p>
          </div>

          {/* 1. Blueprint Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Select Website Blueprint ({Object.keys(BLUEPRINTS).length} Sector Templates)
              </span>
              <span className="text-[10px] text-sky-400 font-mono">Pre-Configured Information Architecture</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.values(BLUEPRINTS).map((bp) => (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => setSelectedBlueprint(bp.id)}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    selectedBlueprint === bp.id
                      ? 'bg-sky-950/60 border-sky-500 ring-1 ring-sky-500 text-white shadow-md'
                      : 'bg-[#141C2A] border-[#1E293B] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate text-white">{bp.name}</span>
                      <span
                        className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full border shrink-0"
                        style={{
                          backgroundColor: `${bp.accentColor}20`,
                          color: bp.accentColor,
                          borderColor: `${bp.accentColor}40`
                        }}
                      >
                        {bp.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {bp.tagline}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-sky-400 flex items-center justify-between">
                    <span>{bp.defaultPages.length} Pages</span>
                    <span className="truncate max-w-[110px] text-slate-500">
                      {bp.coreModules.slice(0, 2).join(', ')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Design Collection Selection */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Select Curated Design Collection
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.values(DESIGN_COLLECTIONS).map((dc) => (
                <button
                  key={dc.id}
                  type="button"
                  onClick={() => setSelectedCollection(dc.id)}
                  className={`p-5 rounded-xl border text-left transition cursor-pointer ${
                    selectedCollection === dc.id
                      ? 'bg-sky-950/50 border-sky-500 ring-1 ring-sky-500 text-white'
                      : 'bg-[#141C2A] border-[#1E293B] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-sm font-bold">{dc.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{dc.tagline}</div>
                  <div className="mt-3 text-[10px] font-mono text-indigo-400">
                    {dc.typography.headingFont.split(',')[0]} + {dc.typography.bodyFont.split(',')[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={() => setCurrentStep(startPath === 'brief' ? 1 : 3)}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleAssembleWebsite}
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-bold text-xs tracking-wider uppercase transition shadow-lg flex items-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Assemble Populated Website</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: ASSEMBLY IN PROGRESS */}
      {currentStep === 5 && (
        <div className="bg-[#0E1522] border border-[#1E293B] rounded-2xl p-12 text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center mx-auto text-sky-400 animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Assembling Website from Verified Components</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Mapping approved content into typed CMS records, applying {selectedCollection} tokens, and composing page trees...
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300"
                style={{ width: `${assemblyProgress}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-slate-500">{assemblyProgress}% Complete</div>
          </div>
        </div>
      )}

      {/* STEP 6: COMPLETION & REFINE */}
      {currentStep === 6 && (
        <div className="bg-[#0E1522] border border-[#1E293B] rounded-2xl p-6 sm:p-8 space-y-8 animate-fadeIn">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {clientName || 'Client'} Website Successfully Assembled!
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Populated with approved brand tokens and sector architecture. Ready for visual editing and publishing.
              </p>
            </div>
          </div>

          {assemblyResult?.gaps && assemblyResult.gaps.length > 0 && (
            <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span>Identified Content Gaps ({assemblyResult.gaps.length})</span>
              </div>
              <div className="space-y-2">
                {assemblyResult.gaps.map((g: any) => (
                  <div key={g.id} className="text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-amber-400 font-mono">&bull;</span>
                    <div>
                      <strong className="text-white">{g.message}</strong> &mdash; {g.suggestedAction}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[#1E293B]">
            <Link
              href="/admin/clients"
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
            >
              Return to Clients &amp; Websites
            </Link>

            <Link
              href={`/admin/editor?siteSlug=${clientName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs tracking-wider uppercase transition shadow-lg flex items-center space-x-2"
            >
              <span>Launch Visual Editor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* GitHub Personal Access Token (PAT) Modal */}
      {showPatModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E1522] border border-[#232F42] rounded-2xl max-w-md w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Connect via GitHub PAT</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPatModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Generate a classic or fine-grained Personal Access Token on GitHub with <code className="text-purple-300 bg-purple-950/60 px-1 py-0.5 rounded">repo</code> and <code className="text-purple-300 bg-purple-950/60 px-1 py-0.5 rounded">read:org</code> scopes to connect client repositories.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Personal Access Token
              </label>
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={patInput}
                onChange={(e) => setPatInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#141C2A] border border-[#232F42] text-white text-sm font-mono focus:outline-none focus:border-purple-500 placeholder-slate-600"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => setShowPatModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isConnectingPat || !patInput.trim()}
                onClick={handleSavePat}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition disabled:opacity-50 flex items-center space-x-2 cursor-pointer"
              >
                {isConnectingPat ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify &amp; Connect</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WebsiteCreationWizardPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading website creation wizard...</div>}>
      <WebsiteCreationWizardContent />
    </React.Suspense>
  );
}
