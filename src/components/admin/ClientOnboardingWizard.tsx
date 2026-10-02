'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Building,
  Globe,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Mail,
  Zap,
  Phone,
  MapPin,
  FileText,
  X,
  Receipt,
  Loader2,
  Tag,
  Briefcase,
  Crown,
  Award,
  DollarSign,
  Send,
  AlertCircle,
  CheckSquare,
  Square,
  Shield
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

interface ClientOnboardingWizardProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const INDUSTRIES = [
  { value: 'financial_services', label: 'Financial Services, Banking & Capital Markets' },
  { value: 'telecommunications', label: 'Telecommunications, 5G & Techco Infrastructure' },
  { value: 'mining_resources', label: 'Mining, Metals & Natural Resources' },
  { value: 'clean_energy', label: 'Clean Energy, Power Utilities & Renewables' },
  { value: 'private_equity', label: 'Private Equity, Venture Capital & Asset Management' },
  { value: 'healthcare_pharma', label: 'Healthcare, Pharmaceuticals & Life Sciences' },
  { value: 'professional_services', label: 'Professional Services, Legal, Audit & M&A' },
  { value: 'real_estate_reits', label: 'Real Estate Development, Commercial Property & REITs' },
  { value: 'retail_fmcg', label: 'Retail, FMCG & Consumer Brands' },
  { value: 'logistics_freight', label: 'Logistics, Supply Chain, Maritime & Freight' },
  { value: 'manufacturing_industrial', label: 'Industrial Manufacturing, Engineering & Heavy Plants' },
  { value: 'aviation_aerospace', label: 'Aviation, Aerospace & Defense' },
  { value: 'public_sector_soe', label: 'Public Sector, State-Owned Enterprises (SOE) & Regulators' },
  { value: 'agriculture_forestry', label: 'Agriculture, Agro-Processing & Forestry' },
  { value: 'media_broadcasting', label: 'Media, Entertainment, Publishing & Broadcasting' },
  { value: 'hospitality_tourism', label: 'Hospitality, Leisure, Gaming & Tourism' },
  { value: 'technology_saas', label: 'Technology, Enterprise Cloud & Software (SaaS)' },
  { value: 'automotive_mobility', label: 'Automotive, Mobility & Electric Vehicles' },
  { value: 'chemicals_materials', label: 'Chemicals, Petrochemicals & Specialized Materials' },
  { value: 'conglomerate_holding', label: 'Diversified Holding Conglomerate & Family Office' },
  { value: 'corporate', label: 'General Enterprise Corporate' }
];

export const PACKAGES = [
  {
    id: 'Silver',
    name: 'Silver Package',
    badge: 'Essential Corporate',
    tagline: 'Standard Corporate Presence & Statutory Disclosures',
    recommended: false,
    accentColor: '#64748B',
    defaultUpfront: '85,000',
    defaultRetainer: '25,000',
    description: 'Foundation corporate website with executive leadership, regulatory disclosures, and multi-user client CMS access.',
    defaultServices: [
      'corporate_flagship',
      'leadership_governance',
      'regulatory_disclosures',
      'contact_directory',
      'ssl_ddos_shield',
      'cms_unlimited_seats'
    ]
  },
  {
    id: 'Gold',
    name: 'Gold Package',
    badge: 'Enterprise Flagship (Recommended)',
    tagline: 'High-Velocity Investor Relations & Live Regulatory Wires',
    recommended: true,
    accentColor: '#F59E0B',
    defaultUpfront: '150,000',
    defaultRetainer: '45,000',
    description: 'Comprehensive IR suite featuring real-time SENS teleprinter, interactive results studio, ESG tracking, and encrypted whistleblower hotline.',
    defaultServices: [
      'corporate_flagship',
      'leadership_governance',
      'regulatory_disclosures',
      'contact_directory',
      'ssl_ddos_shield',
      'sens_teleprinter',
      'financial_results_studio',
      'esg_tracker',
      'whistleblower_hotline',
      'newsroom_media',
      'cms_unlimited_seats'
    ]
  },
  {
    id: 'Platinum',
    name: 'Platinum Package',
    badge: 'Institutional Sovereign',
    tagline: 'Institutional Infrastructure, Procurement RFP Engine & 24/7 Fiduciary SLA',
    recommended: false,
    accentColor: '#8B5CF6',
    defaultUpfront: '320,000',
    defaultRetainer: '95,000',
    description: 'Sovereign-grade architecture with supplier tender portal, automated SARS/CIPC validation, enterprise SSO, and 24/7 fiduciary SLA.',
    defaultServices: [
      'corporate_flagship',
      'leadership_governance',
      'regulatory_disclosures',
      'contact_directory',
      'ssl_ddos_shield',
      'sens_teleprinter',
      'financial_results_studio',
      'esg_tracker',
      'whistleblower_hotline',
      'newsroom_media',
      'cms_unlimited_seats',
      'tender_rfp_portal',
      'sars_cipc_verification',
      'edge_cdn_invalidation',
      'enterprise_sso',
      'multiregion_l10n',
      'fiduciary_sla'
    ]
  }
];

export const AVAILABLE_SERVICES = [
  { id: 'corporate_flagship', name: 'Enterprise Corporate Flagship Website', category: 'Core Platform', desc: 'Mobile-responsive corporate flagship deployed on Bastion Edge with sub-50ms TTFB.' },
  { id: 'leadership_governance', name: 'Executive Leadership & Board Governance', category: 'Core Platform', desc: 'Board charters, director bios, and King IV fiduciary committee registers.' },
  { id: 'regulatory_disclosures', name: 'Statutory Reports & Regulatory Document Archive', category: 'Investor Relations', desc: 'Compliant annual reports, interim filings, and categorized PDF library.' },
  { id: 'contact_directory', name: 'Multi-Branch Corporate Office Directory', category: 'Core Platform', desc: 'Interactive regional maps, branch routing, and stakeholder inquiry triage.' },
  { id: 'ssl_ddos_shield', name: 'Strict Transport HSTS & Autonomous DDoS Defense', category: 'Security & Infra', desc: 'Zero-trust SSL certificates, automated rate-limiting, and web application firewall.' },
  { id: 'sens_teleprinter', name: 'Real-Time SENS Teleprinter & Market Wire', category: 'Investor Relations', desc: 'Instant regulatory announcements, price-sensitive disclosures, and JSE/LSE sync.' },
  { id: 'financial_results_studio', name: 'Interactive Financial Results Studio & Spreadsheets', category: 'Investor Relations', desc: 'Balance sheet equations, income statements, segmental analysis, and CSV/PDF export.' },
  { id: 'esg_tracker', name: 'ESG Net Zero 2030 Telemetry & Sustainability Hub', category: 'Sustainability', desc: 'Scope 1-3 carbon emissions, water recycling telemetry, and CSI community metrics.' },
  { id: 'whistleblower_hotline', name: 'Encrypted Anonymous Whistleblower Hotline (Zero-IP)', category: 'Governance', desc: 'Protected Disclosures Act compliant encrypted reporting with zero IP logging.' },
  { id: 'newsroom_media', name: 'Corporate Newsroom & Broadcast Media Kit', category: 'Communications', desc: 'High-res leadership headshots, executive soundbites, and PR distribution.' },
  { id: 'tender_rfp_portal', name: 'Corporate Tender Board & Supplier Procurement Engine', category: 'Procurement', desc: 'Electronic bid submissions, tender specification downloads, and audit logs.' },
  { id: 'sars_cipc_verification', name: 'SARS TCS Tax Compliance & CIPC Reg Validation', category: 'Procurement', desc: 'Automated 10-digit tax PIN and CIPC enterprise registration validation.' },
  { id: 'edge_cdn_invalidation', name: 'Sub-500ms Autonomous Edge CDN Cache Purge', category: 'Security & Infra', desc: 'Autonomous global edge cache invalidation broadcast on content sign-off.' },
  { id: 'enterprise_sso', name: 'Enterprise Single Sign-On (Okta / Azure AD / SAML)', category: 'Security & Infra', desc: 'Identity federation with centralized RBAC role synchronization.' },
  { id: 'multiregion_l10n', name: 'Multi-Region Routing & Internationalization', category: 'Core Platform', desc: 'Localized regional paths, multi-currency display, and language routing.' },
  { id: 'cms_unlimited_seats', name: 'Corporate CMS Portal & Unlimited Client Seats', category: 'CMS Access', desc: 'Unlimited team seats with role-based access control (RBAC), drafts, and media asset management.' },
  { id: 'cms_dual_custody', name: 'Dual-Custody Two-Person Approval Governance Matrix', category: 'CMS Access', desc: 'Enforced multi-stakeholder sign-off and permanent cryptographic audit trail before publication.' },
  { id: 'fiduciary_sla', name: '24/7 Dedicated Account Director & Fiduciary SLA', category: 'Executive SLA', desc: 'Round-the-clock priority incident escalation and dedicated engineering team.' }
];

export function ClientOnboardingWizard({ onClose, isModal = false }: ClientOnboardingWizardProps) {
  const router = useRouter();
  const { refreshClients, setActiveClientId } = useStudioWorkspace();

  // 4 Streamlined Steps for Company & Business Onboarding
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1: Corporate Profile
  const [clientName, setClientName] = useState('');
  const [industry, setIndustry] = useState('financial_services');
  const [primaryDomain, setPrimaryDomain] = useState('');
  const [headquarters, setHeadquarters] = useState('Johannesburg, South Africa');
  const [tagline, setTagline] = useState('');

  // Primary Executive Contact
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRole, setContactRole] = useState('Head of Corporate Affairs');
  const [contactPhone, setContactPhone] = useState('+27 11 000 0000');

  // Tax & CIPC Compliance Particulars
  const [legalEntityName, setLegalEntityName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [billingContactName, setBillingContactName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [billingPhone, setBillingPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [currency, setCurrency] = useState('R');
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days');
  const [poNumberRequired, setPoNumberRequired] = useState(true);

  // STEP 2: Commercial Agreement (Split Upfront Implementation + Monthly Retainer)
  const [packageTier, setPackageTier] = useState<'Silver' | 'Gold' | 'Platinum'>('Gold');
  const [upfrontAmount, setUpfrontAmount] = useState('150,000');
  const [monthlyRetainer, setMonthlyRetainer] = useState('45,000');
  const [selectedServices, setSelectedServices] = useState<string[]>(PACKAGES[1].defaultServices);
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('all');
  const [packageNotes, setPackageNotes] = useState('Enterprise retainer agreement: Includes full cloud hosting, Edge CDN, and continuous SLA support.');

  // STEP 3: Client User Access & Invite
  const [provisionUser, setProvisionUser] = useState<boolean>(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'content_editor' | 'reviewer' | 'platform_admin'>('content_editor');

  // Execution & Launchpad State
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningPhase, setProvisioningPhase] = useState(0);
  const [provisionResult, setProvisionResult] = useState<any>(null);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  // Clipboard & Resend state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const handleNameChange = (val: string) => {
    setClientName(val);
    if (!legalEntityName || legalEntityName === clientName) {
      setLegalEntityName(val ? `${val} (Pty) Ltd` : '');
    }
    if (!userName) {
      setUserName(val ? `${val} Administrator` : '');
    }
  };

  const handlePackageTierSelect = (tierId: 'Silver' | 'Gold' | 'Platinum') => {
    setPackageTier(tierId);
    const pkg = PACKAGES.find(p => p.id === tierId);
    if (pkg) {
      setUpfrontAmount(pkg.defaultUpfront);
      setMonthlyRetainer(pkg.defaultRetainer);
      setSelectedServices(pkg.defaultServices);
    }
  };

  const handleToggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleSelectAllServices = () => {
    setSelectedServices(AVAILABLE_SERVICES.map(s => s.id));
  };

  const handleResetToTierDefaults = () => {
    const pkg = PACKAGES.find(p => p.id === packageTier);
    if (pkg) {
      setSelectedServices(pkg.defaultServices);
      setUpfrontAmount(pkg.defaultUpfront);
      setMonthlyRetainer(pkg.defaultRetainer);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Re-trigger transactional email dispatch
  const handleResendWelcomeEmail = async () => {
    if (!provisionResult?.client?.id || !provisionResult?.user?.email) return;
    setIsResendingEmail(true);
    setResendStatus(null);
    try {
      const res = await fetch('/api/admin/users/resend-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: provisionResult.user.email,
          clientId: provisionResult.client.id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch email via Resend');
      setResendStatus({
        ok: true,
        message: data.delivery?.status === 'delivered'
          ? `Dispatched successfully to ${provisionResult.user.email} (Resend ID: ${data.delivery.providerMessageId})`
          : `Dispatched in simulated dev mode to ${provisionResult.user.email}`
      });
    } catch (err: any) {
      setResendStatus({
        ok: false,
        message: err.message || 'Error communicating with Resend delivery service.'
      });
    } finally {
      setIsResendingEmail(false);
    }
  };

  // Execute End-to-End Corporate Client Provisioning
  const handleExecuteProvisioning = async () => {
    setIsProvisioning(true);
    setProvisionError(null);
    setProvisioningPhase(1);

    try {
      // Phase 1: Database Tenant & Schema
      await new Promise(r => setTimeout(r, 350));
      setProvisioningPhase(2);

      // Phase 2: Commercial Agreement & Retainer Lock
      await new Promise(r => setTimeout(r, 350));
      setProvisioningPhase(3);

      // Phase 3: Client User & Token Provisioning
      await new Promise(r => setTimeout(r, 350));
      setProvisioningPhase(4);

      // Call API
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName.trim(),
          industry,
          primaryDomain: primaryDomain.trim() || undefined,
          tagline: tagline.trim() || undefined,
          contactInfo: {
            name: contactName.trim(),
            email: contactEmail.trim(),
            role: contactRole.trim(),
            phone: contactPhone.trim(),
            address: headquarters.trim()
          },
          billingDetails: {
            legalEntityName: legalEntityName.trim() || clientName.trim(),
            registrationNumber: registrationNumber.trim(),
            vatNumber: vatNumber.trim(),
            billingAddress: billingAddress.trim() || headquarters.trim(),
            billingContactName: billingContactName.trim() || contactName.trim(),
            billingEmail: billingEmail.trim() || contactEmail.trim(),
            billingPhone: billingPhone.trim() || contactPhone.trim(),
            currency: currency || 'R',
            paymentTerms: paymentTerms || 'Net 30 Days',
            poNumberRequired: poNumberRequired
          },
          packageTier,
          packageServices: selectedServices,
          upfrontAmount: upfrontAmount.trim(),
          monthlyRetainer: monthlyRetainer.trim(),
          currency,
          packageNotes: packageNotes.trim(),
          initialUser: provisionUser && userEmail.trim() ? {
            name: userName.trim() || `${clientName} Administrator`,
            email: userEmail.trim(),
            role: userRole
          } : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete client onboarding');

      await refreshClients();
      if (data.client?.id) {
        setActiveClientId(data.client.id);
      }
      setProvisionResult(data);
    } catch (err: any) {
      console.error('Onboarding execution error:', err);
      setProvisionError(err.message || 'Onboarding failed');
    } finally {
      setIsProvisioning(false);
    }
  };

  const steps = [
    { num: 1, title: 'Corporate Profile', subtitle: 'Identity, Domain & CIPC' },
    { num: 2, title: 'Commercial Agreement', subtitle: 'Upfront Setup & Monthly Retainer' },
    { num: 3, title: 'Authorized Access', subtitle: 'User Invitation & Role' },
    { num: 4, title: 'Review & Onboard', subtitle: 'Confirm & Provision Workspace' },
  ];

  const filteredServices = AVAILABLE_SERVICES.filter(s => {
    if (serviceCategoryFilter === 'all') return true;
    if (serviceCategoryFilter === 'core') return s.category === 'Core Platform';
    if (serviceCategoryFilter === 'ir') return s.category === 'Investor Relations';
    if (serviceCategoryFilter === 'governance') return s.category === 'Governance' || s.category === 'Sustainability';
    if (serviceCategoryFilter === 'procurement') return s.category === 'Procurement';
    if (serviceCategoryFilter === 'infra') return s.category === 'Security & Infra' || s.category === 'CMS Access' || s.category === 'Executive SLA';
    return true;
  });

  return (
    <div className={`w-full ${isModal ? 'max-w-4xl mx-auto p-4 sm:p-6' : 'max-w-5xl mx-auto'}`}>
      {/* Top Wizard Container Card */}
      <div className="rounded-3xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-xl overflow-hidden backdrop-blur-2xl">
        
        {/* Wizard Header Bar */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Bastion Multi-Tenant Registry
                </span>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <span className="text-[11px] font-bold text-slate-500">Corporate Client Onboarding</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-display">
                Onboard Corporate Client
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Step Indicator Tracker (4 Steps) */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-white/70 dark:bg-[#0F141C]/80 overflow-x-auto">
          <div className="grid grid-cols-4 gap-2 sm:gap-3 min-w-[500px]">
            {steps.map((s) => {
              const isActive = currentStep === s.num;
              const isPassed = currentStep > s.num || (provisionResult && s.num === 4);
              return (
                <div
                  key={s.num}
                  className={`flex flex-col gap-1 transition-all ${
                    isActive ? 'opacity-100' : isPassed ? 'opacity-90' : 'opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-xs shadow-purple-500/40 ring-4 ring-purple-100 dark:ring-purple-950/60'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5" /> : s.num}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {s.title}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isActive ? 'bg-purple-600 w-1/2' : isPassed ? 'bg-emerald-500 w-full' : 'w-0'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Main Content Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* STEP 1: Corporate Profile & Tax Compliance (Presets Removed) */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Organization Profile Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Corporate Client Name <span className="text-purple-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Standard Bank Group, Vodacom Group"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Industry / Sector <span className="text-purple-600">*</span>
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind.value} value={ind.value}>
                        {ind.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Primary Production Domain
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={primaryDomain}
                      onChange={(e) => setPrimaryDomain(e.target.value)}
                      placeholder="e.g. standardbank.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Headquarters / Jurisdiction
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={headquarters}
                      onChange={(e) => setHeadquarters(e.target.value)}
                      placeholder="e.g. Rosebank, Johannesburg, South Africa"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Corporate Tagline / Mission Statement
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Africa is our home, we drive her growth."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Primary Contact Row */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Primary Corporate Contact (Executive Sponsor)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Contact Name"
                    className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Corporate Work Email"
                    className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    placeholder="Title / Role"
                    className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Direct Telephone"
                    className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Corporate Tax Compliance & Billing Particulars Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        Corporate Tax Compliance &amp; Billing Particulars
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Populates on official Quotations, Tax Invoices, and Master Service Agreements
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 shrink-0 self-start sm:self-auto">
                    ✓ SARS &amp; CIPC Compliant
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Registered Legal Entity Name
                    </label>
                    <input
                      type="text"
                      value={legalEntityName}
                      onChange={(e) => setLegalEntityName(e.target.value)}
                      placeholder="e.g. Standard Bank of South Africa Limited"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Company Reg Number (CIPC)
                    </label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="e.g. 1962/000738/06"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      VAT / Tax ID (SARS 10-digit)
                    </label>
                    <input
                      type="text"
                      value={vatNumber}
                      onChange={(e) => setVatNumber(e.target.value)}
                      placeholder="e.g. 4100105461"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Accounts Payable Contact Person
                    </label>
                    <input
                      type="text"
                      value={billingContactName}
                      onChange={(e) => setBillingContactName(e.target.value)}
                      placeholder="e.g. Accounts Payable Department"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Billing / Invoicing Email
                    </label>
                    <input
                      type="email"
                      value={billingEmail}
                      onChange={(e) => setBillingEmail(e.target.value)}
                      placeholder="e.g. accounts.payable@corporate.co.za"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Billing Direct Telephone
                    </label>
                    <input
                      type="text"
                      value={billingPhone}
                      onChange={(e) => setBillingPhone(e.target.value)}
                      placeholder="+27 11 636 9111"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Registered Physical Billing Address
                  </label>
                  <input
                    type="text"
                    value={billingAddress}
                    onChange={(e) => setBillingAddress(e.target.value)}
                    placeholder="e.g. 5 Simmonds Street, Selby, Johannesburg, 2001, South Africa"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Billing Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold"
                    >
                      <option value="R">ZAR (R) - South Africa</option>
                      <option value="$">USD ($) - International</option>
                      <option value="€">EUR (€) - European Union</option>
                      <option value="£">GBP (£) - United Kingdom</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      Commercial Payment Terms
                    </label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold"
                    >
                      <option value="Net 30 Days">Net 30 Days (Standard Corporate)</option>
                      <option value="Net 14 Days">Net 14 Days (Accelerated)</option>
                      <option value="Net 7 Days">Net 7 Days (Short Term)</option>
                      <option value="Due on Receipt">Due on Receipt / Deposit</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-3 sm:pt-5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 font-medium select-none">
                      <input
                        type="checkbox"
                        checked={poNumberRequired}
                        onChange={(e) => setPoNumberRequired(e.target.checked)}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                      />
                      <span>Require Client PO on Invoices</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Commercial Agreement (Split Upfront Fee + Monthly Retainer) */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top Explanatory Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/20 flex items-start gap-3">
                <Tag className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Dual-Structure Commercial Agreement (Upfront Implementation + Monthly Retainer)
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    Define the upfront implementation fee for system setup and the ongoing monthly retainer for cloud hosting, Edge CDN, and continuous SLA support. Unlimited client seats are included across all tiers.
                  </p>
                </div>
              </div>

              {/* 3 Package Tier Cards */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  1. Select Commercial Package Tier
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {PACKAGES.map((pkg) => {
                    const isSelected = packageTier === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => handlePackageTierSelect(pkg.id as any)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                          isSelected
                            ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {pkg.recommended && (
                          <span className="absolute -top-2.5 right-4 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
                            Recommended
                          </span>
                        )}

                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {pkg.id === 'Silver' && <Award className="w-5 h-5 text-slate-400" />}
                              {pkg.id === 'Gold' && <Crown className="w-5 h-5 text-amber-500" />}
                              {pkg.id === 'Platinum' && <Sparkles className="w-5 h-5 text-purple-500" />}
                              <span className="text-base font-black text-slate-900 dark:text-white">
                                {pkg.name}
                              </span>
                            </div>
                            <span
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                                isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </span>
                          </div>

                          <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                            {pkg.badge}
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {pkg.description}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-[11px] text-slate-500">Upfront Setup:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">~R{pkg.defaultUpfront}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-[11px] text-slate-500">Monthly Retainer:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">~R{pkg.defaultRetainer}/mo</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Split Pricing Entry: Upfront Fee vs Monthly Retainer */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        2. Agreed Commercial Pricing (Split Structure)
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Enter the agreed upfront implementation fee and monthly support/hosting retainer for {clientName || 'this corporate client'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                    Negotiated Commercials
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Billing Currency <span className="text-purple-600">*</span>
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                    >
                      <option value="R">ZAR (R) - South Africa</option>
                      <option value="$">USD ($) - International</option>
                      <option value="€">EUR (€) - European Union</option>
                      <option value="£">GBP (£) - United Kingdom</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Upfront Implementation &amp; Setup Fee <span className="text-purple-600">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400 font-mono">
                        {currency}
                      </span>
                      <input
                        type="text"
                        required
                        value={upfrontAmount}
                        onChange={(e) => setUpfrontAmount(e.target.value)}
                        placeholder="e.g. 150,000"
                        className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block">Once-off setup, discovery &amp; deployment</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Monthly Retainer (Hosting &amp; SLA) <span className="text-purple-600">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400 font-mono">
                        {currency}
                      </span>
                      <input
                        type="text"
                        required
                        value={monthlyRetainer}
                        onChange={(e) => setMonthlyRetainer(e.target.value)}
                        placeholder="e.g. 45,000"
                        className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold text-emerald-600 dark:text-emerald-400"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block">Billed monthly: Edge CDN, 24/7 SLA &amp; support</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Commercial Notes / Scope Memo
                  </label>
                  <input
                    type="text"
                    value={packageNotes}
                    onChange={(e) => setPackageNotes(e.target.value)}
                    placeholder="e.g. Case-by-case quote approved by Bastion Executive Team. Includes 12-month SLA."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Service Deliverables Checklist (No Seat Limitations) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      3. Choose Included Services &amp; Deliverables ({selectedServices.length} Selected)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      All packages include unlimited team seats and corporate multi-user access.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllServices}
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:hover:text-purple-400 cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                    <button
                      type="button"
                      onClick={handleResetToTierDefaults}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer"
                    >
                      Reset to {packageTier} Defaults
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: 'all', label: 'All Services' },
                    { id: 'core', label: 'Core Platform' },
                    { id: 'ir', label: 'Investor Relations' },
                    { id: 'governance', label: 'Governance & ESG' },
                    { id: 'procurement', label: 'Procurement & Tenders' },
                    { id: 'infra', label: 'Infra & SLA' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setServiceCategoryFilter(cat.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        serviceCategoryFilter === cat.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Services Grid Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto p-1">
                  {filteredServices.map((svc) => {
                    const isChecked = selectedServices.includes(svc.id);
                    return (
                      <div
                        key={svc.id}
                        onClick={() => handleToggleService(svc.id)}
                        className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition select-none ${
                          isChecked
                            ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-400 dark:border-purple-700'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                          )}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {svc.name}
                            </span>
                            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                              {svc.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">
                            {svc.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Package Banner Summary */}
                <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/80 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Commercial Summary: <span className="text-purple-600 dark:text-purple-400">{packageTier} Tier</span> &bull; Upfront: {currency}{upfrontAmount || '0'} + Retainer: {currency}{monthlyRetainer || '0'}/mo
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400">
                    {selectedServices.length} Services Selected (Unlimited Seats)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Authorized Client Access (Direct Password Setup via Email Link) */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Enable Provisioning Toggle */}
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-purple-950 dark:text-purple-200">
                    Provision Corporate Client User Access
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-400 font-medium">
                    Automatically create a client user account and deliver a secure password creation link directly via Resend email.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={provisionUser}
                  onChange={(e) => setProvisionUser(e.target.checked)}
                  className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
              </div>

              {provisionUser && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Client User Full Name <span className="text-purple-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="e.g. Nombuso Khumalo"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Client Work Email <span className="text-purple-600">*</span>
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="e.g. malcolmgov24@gmail.com"
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Client CMS Access Role
                      </label>
                      <select
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                      >
                        <option value="content_editor">Corporate Content Editor (Draft releases, update content, media assets)</option>
                        <option value="reviewer">Compliance Reviewer (Review statutory disclosures &amp; approve changes)</option>
                        <option value="platform_admin">Corporate Administrator (Full client portal &amp; team management)</option>
                      </select>
                    </div>

                    {/* Clean Security Info Box (No Temp Password) */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          Direct Password Creation Link
                        </span>
                        <p className="text-slate-500 mt-0.5 leading-relaxed">
                          No temporary passwords needed. A secure 48-hour invitation link will be dispatched to this email. The user sets their own password upon first click.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Commercial Agreement Summary */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      Commercial Package: <strong className="text-purple-600 dark:text-purple-400">{packageTier}</strong> ({selectedServices.length} Services)
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {currency}{upfrontAmount} Setup + {currency}{monthlyRetainer}/mo Retainer
                    </span>
                  </div>

                  {/* Welcome Email Preview */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-purple-600" />
                        <span>Welcome Credentials Notification Preview (Resend REST API)</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200">
                        Dispatches on Onboard
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                      <div><strong className="text-slate-900 dark:text-white">To:</strong> {userEmail || 'client@corporate.co.za'}</div>
                      <div><strong className="text-slate-900 dark:text-white">Subject:</strong> Welcome to {clientName || 'Corporate'} CMS Portal — Bastion Group</div>
                      <div className="pt-2 text-slate-500">
                        &quot;Your enterprise CMS access for <strong>{clientName || 'your company'}</strong> is provisioned. Click the secure invitation link below to set your password and access your dedicated corporate workspace.&quot;
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Review & Onboard (Dedicated for Company & Business Onboarding) */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* If Still Provisioning or Not Started */}
              {!provisionResult && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-purple-500/20 space-y-1">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                      Final Review &bull; Corporate Onboarding
                    </span>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      Confirm Corporate Client Onboarding for {clientName || 'New Client'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Website creation and brand extraction is a separate standalone process that you can launch immediately after onboarding.
                    </p>
                  </div>

                  {/* Summary Review Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Card 1: Corporate Profile */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <Building className="w-4 h-4 text-purple-600" />
                        <span>Corporate Entity</span>
                      </div>
                      <div className="space-y-1 text-slate-600 dark:text-slate-400 pt-1">
                        <div><strong>Name:</strong> {clientName || 'N/A'}</div>
                        <div><strong>Industry:</strong> {INDUSTRIES.find(i => i.value === industry)?.label || industry}</div>
                        <div><strong>Domain:</strong> {primaryDomain || 'Not assigned yet'}</div>
                        <div><strong>Legal Entity:</strong> {legalEntityName || clientName}</div>
                        {registrationNumber && <div><strong>CIPC Reg:</strong> {registrationNumber}</div>}
                        {vatNumber && <div><strong>SARS VAT:</strong> {vatNumber}</div>}
                      </div>
                    </div>

                    {/* Card 2: Commercial Agreement */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <span>Commercial Agreement</span>
                      </div>
                      <div className="space-y-1 text-slate-600 dark:text-slate-400 pt-1">
                        <div><strong>Tier:</strong> {packageTier} Package</div>
                        <div><strong>Upfront Setup:</strong> <span className="font-mono font-bold text-slate-900 dark:text-white">{currency}{upfrontAmount}</span></div>
                        <div><strong>Monthly Retainer:</strong> <span className="font-mono font-bold text-emerald-600">{currency}{monthlyRetainer}/mo</span></div>
                        <div><strong>Payment Terms:</strong> {paymentTerms}</div>
                        <div><strong>Seats:</strong> Unlimited Client Seats</div>
                        <div><strong>Services:</strong> {selectedServices.length} Selected</div>
                      </div>
                    </div>

                    {/* Card 3: Authorized Access */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>Authorized User Access</span>
                      </div>
                      <div className="space-y-1 text-slate-600 dark:text-slate-400 pt-1">
                        {provisionUser && userEmail ? (
                          <>
                            <div><strong>User Name:</strong> {userName || `${clientName} Administrator`}</div>
                            <div><strong>Work Email:</strong> {userEmail}</div>
                            <div><strong>Role:</strong> {userRole}</div>
                            <div className="text-emerald-600 font-semibold pt-1">
                              ✓ Secure invite email dispatched via Resend
                            </div>
                          </>
                        ) : (
                          <div className="text-slate-400 italic">No user provisioned at this time.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Provisioning Phase Steps when executing */}
                  {isProvisioning && (
                    <div className="max-w-md mx-auto space-y-2 text-left pt-2">
                      {[
                        { step: 1, label: 'Creating Corporate Tenant Registry in Database' },
                        { step: 2, label: `Locking ${packageTier} Commercials (${currency}${upfrontAmount} + ${currency}${monthlyRetainer}/mo)` },
                        { step: 3, label: 'Setting up DAM Asset Partition & Shell Workspace' },
                        { step: 4, label: 'Generating Secure Invite Token & Dispatching Resend Email' },
                      ].map((phaseItem) => (
                        <div
                          key={phaseItem.step}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                            provisioningPhase > phaseItem.step
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300 font-bold'
                              : provisioningPhase === phaseItem.step
                              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 text-purple-800 dark:text-purple-300 font-bold animate-pulse'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {provisioningPhase > phaseItem.step ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : provisioningPhase === phaseItem.step ? (
                              <Loader2 className="w-4 h-4 text-purple-600 animate-spin shrink-0" />
                            ) : (
                              <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">
                                {phaseItem.step}
                              </span>
                            )}
                            <span>{phaseItem.label}</span>
                          </div>
                          <span className="text-[10px] uppercase font-mono">
                            {provisioningPhase > phaseItem.step ? 'DONE' : provisioningPhase === phaseItem.step ? 'ACTIVE' : 'QUEUED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {provisionError && (
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
                      {provisionError}
                    </div>
                  )}

                  {!isProvisioning && (
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={handleExecuteProvisioning}
                        className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-sm tracking-wider uppercase transition shadow-xl shadow-purple-500/30 cursor-pointer inline-flex items-center gap-2 active:scale-[0.98]"
                      >
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>Onboard Corporate Client</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Once Provisioning Completed Successfully */}
              {provisionResult && (
                <div className="space-y-6">
                  {/* Top Success Banner */}
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-indigo-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          Corporate Client Onboarded Successfully!
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">
                          {provisionResult.client?.name} Registered on Bastion Platform
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono px-3 py-1 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                        {packageTier} Package
                      </span>
                      <span className="text-xs font-bold font-mono px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        TENANT READY
                      </span>
                    </div>
                  </div>

                  {/* Commercial Agreement Summary Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Tag className="w-4 h-4 text-purple-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Locked Agreement: {packageTier} Package ({selectedServices.length} Included Deliverables)
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Upfront Implementation: {currency}{upfrontAmount} &bull; Retainer: {currency}{monthlyRetainer}/mo &bull; Terms: {paymentTerms}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {currency}{monthlyRetainer}/mo
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        Ongoing Hosting &amp; SLA
                      </span>
                    </div>
                  </div>

                  {/* Client Access Invitation Pack */}
                  {provisionResult.user && (
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Lock className="w-4 h-4 text-purple-600" />
                          <span>Authorized User Access &amp; Password Setup</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Client User</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{provisionResult.user.name}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Login Email</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">{provisionResult.user.email}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Account Activation</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Password set by user via invite</span>
                        </div>
                      </div>

                      {/* Direct Invite Setup URL */}
                      {provisionResult.user.inviteUrl && (
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-purple-200 dark:border-purple-900/50 flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0">
                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase block">
                              Secure One-Click Password Creation Link
                            </span>
                            <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 truncate block">
                              {provisionResult.user.inviteUrl}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopy(provisionResult.user.inviteUrl, 'inviteUrl')}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer transition"
                            >
                              {copiedKey === 'inviteUrl' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedKey === 'inviteUrl' ? 'Copied' : 'Copy Link'}</span>
                            </button>
                            <a
                              href={provisionResult.user.inviteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-[11px] font-bold text-white flex items-center gap-1 cursor-pointer transition"
                            >
                              <span>Test Setup Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Resend Welcome Email Service Status Card */}
                      <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                Resend Transactional Delivery Status
                              </span>
                              {provisionResult.emailDelivery?.status === 'delivered' ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.2 rounded border border-emerald-300">
                                  ✓ Delivered via Resend
                                </span>
                              ) : provisionResult.emailDelivery?.status === 'simulated_dev' ? (
                                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 dark:bg-blue-950 px-2 py-0.2 rounded border border-blue-300">
                                  Simulated Mode
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950 px-2 py-0.2 rounded border border-amber-300">
                                  Pending Key
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Recipient: <strong className="font-mono text-slate-700 dark:text-slate-300">{provisionResult.user.email}</strong>
                              {provisionResult.emailDelivery?.providerMessageId && ` (ID: ${provisionResult.emailDelivery.providerMessageId})`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleResendWelcomeEmail}
                            disabled={isResendingEmail}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {isResendingEmail ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>{isResendingEmail ? 'Sending...' : 'Resend Welcome Email'}</span>
                          </button>
                        </div>
                      </div>

                      {resendStatus && (
                        <div
                          className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                            resendStatus.ok
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {resendStatus.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                          <span>{resendStatus.message}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3 Next-Step Action Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Action 1: Website Creation & Brand Extraction (Standalone Process) */}
                    <Link
                      href={`/admin/create?clientId=${provisionResult.client?.id}${primaryDomain ? `&domain=${encodeURIComponent(primaryDomain)}` : ''}`}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/80 hover:border-purple-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-4 group ring-2 ring-purple-500/10"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Launch Website Builder &amp; AI Extractor
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Extract Brand DNA from domain, select blueprints, and design page compositions.
                        </p>
                      </div>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <span>Launch Website Studio</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>

                    {/* Action 2: Enter Client CMS Mode */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveClientId(provisionResult.client?.id);
                        router.push('/admin');
                      }}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-4 group text-left cursor-pointer"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Enter Client CMS Workspace
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Access the isolated client content management portal and DAM library.
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span>Open Client Portal</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </button>

                    {/* Action 3: View Corporate Clients Directory */}
                    <button
                      type="button"
                      onClick={() => {
                        router.push('/admin/clients');
                      }}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-4 group text-left cursor-pointer"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                          <Building className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Manage Corporate Clients
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Review commercial agreements, edit corporate profiles, and manage tenants.
                        </p>
                      </div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <span>Open Clients Directory</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  </div>

                  {/* Reset or Close Button */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setProvisionResult(null);
                        setCurrentStep(1);
                        setClientName('');
                        setPrimaryDomain('');
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      Onboard Another Client
                    </button>
                    {onClose && (
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Done
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Wizard Bottom Navigation Buttons */}
        {!provisionResult && (
          <div className="p-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isProvisioning}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && !clientName.trim()) {
                    alert('Please enter a Corporate Client Name.');
                    return;
                  }
                  setCurrentStep(currentStep + 1);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md shadow-purple-500/20 cursor-pointer transition active:scale-[0.98]"
              >
                <span>Continue to {steps[currentStep].title}</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
}
