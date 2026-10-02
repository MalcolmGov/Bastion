'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Building,
  Globe,
  Palette,
  Layers,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Edit3,
  Sliders,
  Lock,
  Mail,
  Zap,
  Phone,
  MapPin,
  FileText,
  Radio,
  Eye,
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
  Filter
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

interface ClientOnboardingWizardProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const PACKAGES = [
  {
    id: 'Silver',
    name: 'Silver Package',
    badge: 'Essential Presence',
    tagline: 'Standard Corporate Presence & Statutory Disclosures',
    recommended: false,
    accentColor: '#64748B',
    defaultAmount: '45,000',
    description: 'Foundation corporate website with executive leadership, regulatory disclosures, and single-editor client CMS.',
    defaultServices: [
      'corporate_flagship',
      'leadership_governance',
      'regulatory_disclosures',
      'contact_directory',
      'ssl_ddos_shield',
      'cms_single_editor'
    ]
  },
  {
    id: 'Gold',
    name: 'Gold Package',
    badge: 'Enterprise Flagship (Recommended)',
    tagline: 'High-Velocity Investor Relations & Live Regulatory Wires',
    recommended: true,
    accentColor: '#F59E0B',
    defaultAmount: '85,000',
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
      'cms_multi_editor'
    ]
  },
  {
    id: 'Platinum',
    name: 'Platinum Package',
    badge: 'Institutional Sovereign',
    tagline: 'Institutional Infrastructure, Procurement RFP Engine & 24/7 Fiduciary SLA',
    recommended: false,
    accentColor: '#8B5CF6',
    defaultAmount: '180,000',
    description: 'Sovereign-grade multi-platform architecture with supplier tender portal, automated SARS/CIPC validation, enterprise SSO, and 24/7 fiduciary SLA.',
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
      'cms_multi_editor',
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
  { id: 'cms_single_editor', name: 'Client CMS Editor License (1 Seat)', category: 'CMS Access', desc: 'Single-seat client portal access for real-time page edits and media uploads.' },
  { id: 'cms_multi_editor', name: 'Client CMS Multi-Seat & Two-Person Approval Matrix', category: 'CMS Access', desc: 'Unlimited client seats with dual-custody review workflows and audit ledger.' },
  { id: 'fiduciary_sla', name: '24/7 Dedicated Account Director & Fiduciary SLA', category: 'Executive SLA', desc: 'Round-the-clock priority incident escalation and dedicated engineering team.' }
];

const PRESETS = [
  {
    name: 'Vodacom Group',
    industry: 'telecom',
    industryLabel: 'Telecommunications & 5G',
    domain: 'vodacom.co.za',
    primaryColor: '#E60000',
    secondaryColor: '#0F172A',
    accentColor: '#E60000',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    designCollectionId: 'contemporary',
    blueprintId: 'corporate',
    headquarters: 'Midrand, Johannesburg, South Africa',
    contactName: 'Nombuso Khumalo',
    contactEmail: 'nombuso.khumalo@vodacom.co.za',
    contactRole: 'Head of Digital Communications',
    tagline: 'Further together. Empowering Africa through digital inclusion and enterprise connectivity.',
    legalEntityName: 'Vodacom Group Limited',
    registrationNumber: '1993/005461/06',
    vatNumber: '4010118149',
    billingAddress: 'Vodacom Corporate Park, 082 Vodacom Boulevard, Midrand, Johannesburg, 1685, South Africa',
    billingContactName: 'Nombuso Khumalo',
    billingEmail: 'accounts.payable@vodacom.co.za',
    billingPhone: '+27 11 546 1000',
    currency: 'R',
    paymentTerms: 'Net 30 Days',
    poNumberRequired: true,
    packageTier: 'Gold',
    packageAmount: '125,000'
  },
  {
    name: 'Solaris Clean Energy',
    industry: 'renewable_energy',
    industryLabel: 'Clean Energy & Renewables',
    domain: 'solarisenergy.co.za',
    primaryColor: '#10B981',
    secondaryColor: '#064E3B',
    accentColor: '#059669',
    headingFont: 'Montserrat',
    bodyFont: 'Inter',
    designCollectionId: 'contemporary',
    blueprintId: 'corporate',
    headquarters: 'Cape Town, South Africa',
    contactName: 'Tariq Al-Mansoor',
    contactEmail: 'tariq@solariscleanenergy.com',
    contactRole: 'Chief Sustainability Officer',
    tagline: 'Empowering enterprise decarbonization with commercial solar grids and certified ESG telemetry.',
    legalEntityName: 'Solaris Clean Energy (Pty) Ltd',
    registrationNumber: '2021/892014/07',
    vatNumber: '4910283746',
    billingAddress: 'Victoria & Alfred Waterfront, Silo District, Cape Town, 8001, South Africa',
    billingContactName: 'Tariq Al-Mansoor',
    billingEmail: 'finance@solarisenergy.co.za',
    billingPhone: '+27 21 408 7600',
    currency: 'R',
    paymentTerms: 'Net 14 Days',
    poNumberRequired: false,
    packageTier: 'Silver',
    packageAmount: '65,000'
  },
  {
    name: 'Apex Advisory Partners',
    industry: 'professional_services',
    industryLabel: 'Financial Advisory & M&A',
    domain: 'apexadvisory.com',
    primaryColor: '#2563EB',
    secondaryColor: '#0F172A',
    accentColor: '#0284C7',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    designCollectionId: 'editorial',
    blueprintId: 'professional_services',
    headquarters: 'Sandton & London',
    contactName: 'Alexandra Vance',
    contactEmail: 'alexandra.vance@apexadvisory.com',
    contactRole: 'Managing Partner',
    tagline: 'Discreet institutional advisory, cross-border M&A transactions, and private capital structuring.',
    legalEntityName: 'Apex Advisory Partners (Pty) Ltd',
    registrationNumber: '2018/341920/07',
    vatNumber: '4720194812',
    billingAddress: 'Katherine & West Building, 114 West Street, Sandton, 2196, South Africa',
    billingContactName: 'Alexandra Vance',
    billingEmail: 'invoices@apexadvisory.co.za',
    billingPhone: '+27 11 884 2100',
    currency: 'R',
    paymentTerms: 'Net 14 Days',
    poNumberRequired: false,
    packageTier: 'Gold',
    packageAmount: '95,000'
  },
  {
    name: 'Gold Fields Limited',
    industry: 'mining_resources',
    industryLabel: 'Mining & Resources',
    domain: 'goldfields.com',
    primaryColor: '#C99700',
    secondaryColor: '#18181B',
    accentColor: '#D97706',
    headingFont: 'Cinzel',
    bodyFont: 'Inter',
    designCollectionId: 'editorial',
    blueprintId: 'corporate',
    headquarters: '150 Helen Road, Sandton, Johannesburg',
    contactName: 'Sipho Dlamini',
    contactEmail: 'communications@goldfields.com',
    contactRole: 'Head of Investor Relations',
    tagline: 'Globally diversified gold mining producer committed to sustainable modern stewardship.',
    legalEntityName: 'Gold Fields Limited',
    registrationNumber: '1968/004880/06',
    vatNumber: '4690104820',
    billingAddress: '150 Helen Road, Sandown, Sandton, Johannesburg, 2196, South Africa',
    billingContactName: 'Sipho Dlamini',
    billingEmail: 'accounts.payable@goldfields.com',
    billingPhone: '+27 11 562 9700',
    currency: 'R',
    paymentTerms: 'Net 30 Days',
    poNumberRequired: true,
    packageTier: 'Platinum',
    packageAmount: '250,000'
  },
  {
    name: 'Discovery Health',
    industry: 'healthcare',
    industryLabel: 'Healthcare & Life Sciences',
    domain: 'discovery.co.za',
    primaryColor: '#D97706',
    secondaryColor: '#1E293B',
    accentColor: '#F59E0B',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    designCollectionId: 'contemporary',
    blueprintId: 'corporate',
    headquarters: '1 Discovery Place, Sandton',
    contactName: 'Dr. Ryan Noach',
    contactEmail: 'corporate@discovery.co.za',
    contactRole: 'Chief Executive Officer',
    tagline: 'Making people healthier and enhancing and protecting their lives through shared-value insurance.',
    legalEntityName: 'Discovery Limited',
    registrationNumber: '1999/007789/06',
    vatNumber: '4380182910',
    billingAddress: '1 Discovery Place, Sandhurst, Sandton, 2196, South Africa',
    billingContactName: 'Dr. Ryan Noach',
    billingEmail: 'procurement@discovery.co.za',
    billingPhone: '+27 11 529 2888',
    currency: 'R',
    paymentTerms: 'Net 30 Days',
    poNumberRequired: true,
    packageTier: 'Platinum',
    packageAmount: '180,000'
  },
  {
    name: 'Anglo American',
    industry: 'mining_resources',
    industryLabel: 'Mining & Natural Resources',
    domain: 'angloamerican.com',
    primaryColor: '#0284C7',
    secondaryColor: '#0F172A',
    accentColor: '#2563EB',
    headingFont: 'Plus Jakarta Sans',
    bodyFont: 'Inter',
    designCollectionId: 'editorial',
    blueprintId: 'corporate',
    headquarters: 'London & Johannesburg',
    contactName: 'Mark Cutifani',
    contactEmail: 'stakeholders@angloamerican.com',
    contactRole: 'Executive Director',
    tagline: 'Re-imagining mining to improve people’s lives across diamonds, copper, and future-enabling metals.',
    legalEntityName: 'Anglo American South Africa (Pty) Ltd',
    registrationNumber: '1917/005309/07',
    vatNumber: '4120108392',
    billingAddress: '55 Marshall Street, Marshalltown, Johannesburg, 2001, South Africa',
    billingContactName: 'Mark Cutifani',
    billingEmail: 'za.procurement@angloamerican.com',
    billingPhone: '+27 11 638 9111',
    currency: 'R',
    paymentTerms: 'Net 30 Days',
    poNumberRequired: true,
    packageTier: 'Platinum',
    packageAmount: '320,000'
  }
];

const FONT_PAIRS = [
  { id: 'pair-modern', label: 'Plus Jakarta Sans + Inter', heading: 'Plus Jakarta Sans', body: 'Inter', style: 'Modern Corporate' },
  { id: 'pair-editorial', label: 'Playfair Display + Inter', heading: 'Playfair Display', body: 'Inter', style: 'Prestige & Editorial' },
  { id: 'pair-institutional', label: 'Cinzel + Plus Jakarta Sans', heading: 'Cinzel', body: 'Plus Jakarta Sans', style: 'Institutional Heritage' },
  { id: 'pair-clean', label: 'Montserrat + Roboto', heading: 'Montserrat', body: 'Roboto', style: 'High-Tech & Infrastructure' }
];

export function ClientOnboardingWizard({ onClose, isModal = false }: ClientOnboardingWizardProps) {
  const router = useRouter();
  const { refreshClients, setActiveClientId, setPortalViewMode } = useStudioWorkspace();

  // Wizard Step: 1 to 6
  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1: Corporate Profile
  const [clientName, setClientName] = useState('');
  const [industry, setIndustry] = useState('telecom');
  const [primaryDomain, setPrimaryDomain] = useState('');
  const [headquarters, setHeadquarters] = useState('Johannesburg, South Africa');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRole, setContactRole] = useState('Head of Digital Communications');
  const [contactPhone, setContactPhone] = useState('+27 11 000 0000');
  const [tagline, setTagline] = useState('');

  // STEP 1: Corporate Tax & Billing Compliance Particulars
  const [legalEntityName, setLegalEntityName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [billingContactName, setBillingContactName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [billingPhone, setBillingPhone] = useState('+27 11 000 0000');
  const [billingAddress, setBillingAddress] = useState('');
  const [currency, setCurrency] = useState('R');
  const [paymentTerms, setPaymentTerms] = useState('Net 30 Days');
  const [poNumberRequired, setPoNumberRequired] = useState(false);

  // STEP 2: Tiered Packages & Commercial Pricing (Silver, Gold, Platinum)
  const [packageTier, setPackageTier] = useState<'Silver' | 'Gold' | 'Platinum'>('Gold');
  const [selectedServices, setSelectedServices] = useState<string[]>(
    PACKAGES.find(p => p.id === 'Gold')?.defaultServices || []
  );
  const [packageAmount, setPackageAmount] = useState('85,000');
  const [packageCurrency, setPackageCurrency] = useState('R');
  const [packageBillingCycle, setPackageBillingCycle] = useState('Monthly Retainer');
  const [packageNotes, setPackageNotes] = useState('Case-by-case corporate agreement approved by Bastion Executive Team.');
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState('all');

  // STEP 3: Brand DNA & Styles
  const [logoUrl, setLogoUrl] = useState('/assets/logo-placeholder.svg');
  const [primaryBrandColor, setPrimaryBrandColor] = useState('#2563EB');
  const [secondaryBrandColor, setSecondaryBrandColor] = useState('#0F172A');
  const [accentBrandColor, setAccentBrandColor] = useState('#0284C7');
  const [headingFont, setHeadingFont] = useState('Plus Jakarta Sans');
  const [bodyFont, setBodyFont] = useState('Inter');
  const [designCollectionId, setDesignCollectionId] = useState<'editorial' | 'contemporary' | 'immersive'>('contemporary');

  // STEP 4: Blueprint & Modules
  const [blueprintId, setBlueprintId] = useState<'corporate' | 'professional_services' | 'hospitality'>('corporate');
  const [modules, setModules] = useState({
    executiveLeadership: true,
    regulatoryDisclosures: true,
    esgReporting: true,
    newsroomMedia: true,
    careersTalent: true,
    stakeholderInquiries: true,
    edgeCdnPurge: true
  });
  const [starterPages, setStarterPages] = useState({
    home: true,
    about: true,
    operations: true,
    sustainability: true,
    investors: true,
    contact: true
  });

  // STEP 5: Client User Provisioning
  const [provisionUser, setProvisionUser] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'content_editor' | 'reviewer' | 'platform_admin'>('content_editor');
  const [userPassword, setUserPassword] = useState('');

  // STEP 6: Provisioning Execution & Results
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningPhase, setProvisioningPhase] = useState(0);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [provisionResult, setProvisionResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Welcome Email Resend State
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ ok: boolean; message: string } | null>(null);

  // Apply quick preset
  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setClientName(preset.name);
    setIndustry(preset.industry);
    setPrimaryDomain(preset.domain);
    setPrimaryBrandColor(preset.primaryColor);
    setSecondaryBrandColor(preset.secondaryColor);
    setAccentBrandColor(preset.accentColor);
    setHeadingFont(preset.headingFont);
    setBodyFont(preset.bodyFont);
    setDesignCollectionId(preset.designCollectionId as any);
    setBlueprintId(preset.blueprintId as any);
    setHeadquarters(preset.headquarters);
    setContactName(preset.contactName);
    setContactEmail(preset.contactEmail);
    setContactRole(preset.contactRole);
    setTagline(preset.tagline);

    // Tax Compliance & Billing
    setLegalEntityName(preset.legalEntityName || preset.name);
    setRegistrationNumber(preset.registrationNumber || '');
    setVatNumber(preset.vatNumber || '');
    setBillingAddress(preset.billingAddress || preset.headquarters || '');
    setBillingContactName(preset.billingContactName || preset.contactName || '');
    setBillingEmail(preset.billingEmail || preset.contactEmail || '');
    setBillingPhone(preset.billingPhone || '+27 11 000 0000');
    setCurrency(preset.currency || 'R');
    setPaymentTerms(preset.paymentTerms || 'Net 30 Days');
    setPoNumberRequired(preset.poNumberRequired || false);

    // Package Tier & Commercial Pricing
    const tier = (preset.packageTier as any) || 'Gold';
    setPackageTier(tier);
    const matchedPkg = PACKAGES.find(p => p.id === tier);
    if (matchedPkg) {
      setSelectedServices([...matchedPkg.defaultServices]);
      setPackageAmount(preset.packageAmount || matchedPkg.defaultAmount);
    }

    // Prefill user credentials
    setUserName(preset.contactName);
    setUserEmail(preset.contactEmail);
    const cleanPwd = `${preset.name.replace(/[^a-zA-Z0-9]/g, '')}2026!`;
    setUserPassword(cleanPwd);
  };

  const handleNameChange = (val: string) => {
    setClientName(val);
    if (!legalEntityName) setLegalEntityName(val);
    if (!userName) setUserName(`${val} Lead Editor`);
    if (!userEmail && primaryDomain) setUserEmail(`communications@${primaryDomain}`);
    setUserPassword(`${val.replace(/[^a-zA-Z0-9]/g, '')}2026!`);
  };

  const handlePackageTierSelect = (tier: 'Silver' | 'Gold' | 'Platinum') => {
    setPackageTier(tier);
    const pkg = PACKAGES.find(p => p.id === tier);
    if (pkg) {
      setSelectedServices([...pkg.defaultServices]);
      setPackageAmount(pkg.defaultAmount);
    }
  };

  const handleToggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSelectAllServices = () => {
    setSelectedServices(AVAILABLE_SERVICES.map(s => s.id));
  };

  const handleResetToTierDefaults = () => {
    const pkg = PACKAGES.find(p => p.id === packageTier);
    if (pkg) setSelectedServices([...pkg.defaultServices]);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Immediate Resend Welcome Email Trigger
  const handleResendWelcomeEmail = async () => {
    const targetEmail = userEmail.trim() || provisionResult?.user?.email || 'malcolm@movedigital.africa';
    setIsResendingEmail(true);
    setResendStatus(null);

    try {
      const res = await fetch('/api/admin/users/resend-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          clientName: clientName || provisionResult?.client?.name || 'Bastion Group',
          roleTitle: userRole === 'platform_admin' ? 'Platform Administrator' : 'Corporate Content Editor',
          password: userPassword || `${clientName.replace(/[^a-zA-Z0-9]/g, '')}2026!`,
          name: userName || contactName
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch email');

      setResendStatus({
        ok: data.success,
        message: data.message
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

  // Execute End-to-End Client Provisioning
  const handleExecuteProvisioning = async () => {
    setIsProvisioning(true);
    setProvisionError(null);
    setProvisioningPhase(1);

    try {
      // Phase 1: Database Tenant & Schema
      await new Promise(r => setTimeout(r, 400));
      setProvisioningPhase(2);

      // Phase 2: Page Compositions Assembly
      await new Promise(r => setTimeout(r, 400));
      setProvisioningPhase(3);

      // Phase 3: Brand DNA & Tokens
      await new Promise(r => setTimeout(r, 400));
      setProvisioningPhase(4);

      // Phase 4: Edge CDN & Commercial SLA
      await new Promise(r => setTimeout(r, 400));
      setProvisioningPhase(5);

      // Call API
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName.trim(),
          industry,
          primaryDomain: primaryDomain.trim() || undefined,
          blueprintId,
          designCollectionId,
          primaryBrandColor,
          secondaryBrandColor,
          accentBrandColor,
          headingFont,
          bodyFont,
          tagline: tagline.trim() || undefined,
          contactInfo: {
            name: contactName,
            email: contactEmail,
            role: contactRole,
            phone: contactPhone,
            address: headquarters
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
          packageAmount: packageAmount.trim(),
          packageCurrency,
          packageBillingCycle,
          packageNotes: packageNotes.trim(),
          enabledModules: modules,
          initialUser: provisionUser && userEmail.trim() ? {
            name: userName.trim() || `${clientName} Administrator`,
            email: userEmail.trim(),
            role: userRole,
            password: userPassword.trim()
          } : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete client provisioning');

      setProvisioningPhase(6);
      await new Promise(r => setTimeout(r, 400));

      await refreshClients();
      if (data.client?.id) {
        setActiveClientId(data.client.id);
      }
      setProvisionResult(data);
    } catch (err: any) {
      console.error('Onboarding execution error:', err);
      setProvisionError(err.message || 'Provisioning failed');
    } finally {
      setIsProvisioning(false);
    }
  };

  const steps = [
    { num: 1, title: 'Corporate Profile', subtitle: 'Identity & Domain' },
    { num: 2, title: 'Commercial Package', subtitle: 'Tier & Custom Pricing' },
    { num: 3, title: 'Brand DNA', subtitle: 'Theme & Typography' },
    { num: 4, title: 'Architecture', subtitle: 'Blueprint & Modules' },
    { num: 5, title: 'Client Access', subtitle: 'User & CMS Role' },
    { num: 6, title: 'Launch', subtitle: 'Deploy & Credentials' },
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
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Bastion Multi-Tenant Provisioning
                </span>
                <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                <span className="text-[11px] font-bold text-slate-500">Tiered Packages &amp; Resend</span>
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

        {/* Step Indicator Tracker (6 Steps) */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-white/70 dark:bg-[#0F141C]/80 overflow-x-auto">
          <div className="grid grid-cols-6 gap-2 sm:gap-3 min-w-[580px]">
            {steps.map((s) => {
              const isActive = currentStep === s.num;
              const isPassed = currentStep > s.num || (provisionResult && s.num === 6);
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
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate hidden md:inline">
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

          {/* STEP 1: Corporate Profile & Presets */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Presets Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Quick 1-Click Enterprise Presets
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400">
                    Auto-fills profile, compliance &amp; package tier
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 group hover:border-purple-300 dark:hover:border-purple-700 ${
                        clientName === preset.name
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 ring-2 ring-purple-500/20'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {preset.name}
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: preset.primaryColor }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="truncate">{preset.industryLabel}</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">{preset.packageTier}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Organization Profile Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Corporate Client Name <span className="text-purple-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Vodacom Group, Anglo American"
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
                    <option value="telecom">Telecommunications &amp; Techco</option>
                    <option value="mining_resources">Mining &amp; Natural Resources</option>
                    <option value="renewable_energy">Clean Energy &amp; Renewables</option>
                    <option value="professional_services">Financial Advisory &amp; M&amp;A</option>
                    <option value="wealth_management">Private Wealth &amp; Family Office</option>
                    <option value="healthcare">Healthcare &amp; Life Sciences</option>
                    <option value="corporate">General Enterprise Corporate</option>
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
                      placeholder="e.g. vodacom.co.za"
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
                      placeholder="e.g. Sandton, Johannesburg, South Africa"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Primary Contact Row */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Primary Corporate Contact (Executive Sponsor)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Contact Name (e.g. Nombuso Khumalo)"
                    className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Work Email (e.g. nombuso@vodacom.co.za)"
                    className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    placeholder="Title / Role (e.g. Head of IR)"
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
                      placeholder="e.g. Vodacom Group Limited"
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
                      placeholder="e.g. 1993/005461/06"
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
                      placeholder="e.g. 4010118149"
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
                      placeholder="e.g. Accounts Department"
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
                      placeholder="e.g. accounts.payable@vodacom.co.za"
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
                      placeholder="+27 11 546 1000"
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
                    placeholder="e.g. Vodacom Corporate Park, 082 Vodacom Boulevard, Midrand, Johannesburg, 1685, South Africa"
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

              {/* Tagline */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Corporate Tagline / Mission Statement
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Further together. Empowering tomorrow through digital connectivity."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Commercial Package & Manual Pricing (Silver, Gold, Platinum) */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top Explanatory Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border border-amber-500/20 flex items-start gap-3">
                <Tag className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Tailored Corporate Packages &amp; Custom Commercial Agreement
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                    Select a core package tier (Silver, Gold, or Platinum), customize the included service deliverables, and manually enter the agreed commercial price for this client.
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

                        <div className="space-y-3">
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

                        <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {pkg.defaultServices.length} Core Services
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                            Guide: ~R{pkg.defaultAmount}/mo
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Manual Pricing & Billing Agreement Row */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/70 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                        2. Case-by-Case Commercial Pricing (Manual Entry)
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Enter the agreed commercial price for {clientName || 'this client'}
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
                      value={packageCurrency}
                      onChange={(e) => {
                        setPackageCurrency(e.target.value);
                        setCurrency(e.target.value);
                      }}
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
                      Agreed Commercial Amount <span className="text-purple-600">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400 font-mono">
                        {packageCurrency}
                      </span>
                      <input
                        type="text"
                        required
                        value={packageAmount}
                        onChange={(e) => setPackageAmount(e.target.value)}
                        placeholder="e.g. 85,000"
                        className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Billing Cycle / Cadence
                    </label>
                    <select
                      value={packageBillingCycle}
                      onChange={(e) => setPackageBillingCycle(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                    >
                      <option value="Monthly Retainer">Monthly Retainer</option>
                      <option value="Annual Contract (Billed Annually)">Annual Contract (Billed Annually)</option>
                      <option value="Project Milestones (Once-off Implementation)">Project Milestones (Once-off Implementation)</option>
                      <option value="Quarterly Advance">Quarterly Advance</option>
                    </select>
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

              {/* Service Deliverables Dropdown / Multi-Select */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      3. Choose Included Services &amp; Deliverables ({selectedServices.length} Selected)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Customize individual service modules for this proposal or contract.
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto p-1">
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
                      Summary: <span className="text-purple-600 dark:text-purple-400">{packageTier} Tier</span> &bull; {packageCurrency}{packageAmount || '0'} ({packageBillingCycle})
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400">
                    {selectedServices.length} Services Selected
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Brand DNA & Styles */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Brand Logo Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="sm:col-span-8 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Corporate Logo (Vector SVG or Transparent PNG)
                  </label>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="/assets/logo.svg or https://example.com/logo.svg"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-400">
                    Approved logo will be automatically optimized and deployed across header, footer, and favicon.
                  </span>
                </div>

                <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Logo Preview</div>
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-base shadow-xs"
                    style={{ backgroundColor: primaryBrandColor }}
                  >
                    {clientName ? clientName.substring(0, 2).toUpperCase() : 'CO'}
                  </div>
                </div>
              </div>

              {/* Color System */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Brand Color Palette
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Primary Color */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Primary Brand</span>
                      <span className="w-5 h-5 rounded-md border border-black/10" style={{ backgroundColor: primaryBrandColor }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryBrandColor}
                        onChange={(e) => setPrimaryBrandColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={primaryBrandColor}
                        onChange={(e) => setPrimaryBrandColor(e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase font-bold"
                      />
                    </div>
                  </div>

                  {/* Secondary Tone */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Secondary / Slate</span>
                      <span className="w-5 h-5 rounded-md border border-black/10" style={{ backgroundColor: secondaryBrandColor }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryBrandColor}
                        onChange={(e) => setSecondaryBrandColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={secondaryBrandColor}
                        onChange={(e) => setSecondaryBrandColor(e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase font-bold"
                      />
                    </div>
                  </div>

                  {/* Accent Highlight */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Accent CTA</span>
                      <span className="w-5 h-5 rounded-md border border-black/10" style={{ backgroundColor: accentBrandColor }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentBrandColor}
                        onChange={(e) => setAccentBrandColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={accentBrandColor}
                        onChange={(e) => setAccentBrandColor(e.target.value)}
                        className="w-full px-2 py-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography System */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Curated Corporate Font Pairings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FONT_PAIRS.map((pair) => (
                    <button
                      key={pair.id}
                      type="button"
                      onClick={() => {
                        setHeadingFont(pair.heading);
                        setBodyFont(pair.body);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        headingFont === pair.heading
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                          {pair.style}
                        </span>
                        {headingFont === pair.heading && <Check className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {pair.label}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        The quick brown fox jumps over the lazy dog.
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Design Collection Mood */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Design Collection Aesthetic
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'editorial', title: 'Editorial & Prestige', desc: 'Dignified institutional pacing, serif accents, and premium white papers.' },
                    { id: 'contemporary', title: 'Contemporary High-Tech', desc: 'Precision geometry, sharp hairline grids, high-contrast badges.' },
                    { id: 'immersive', title: 'Immersive & Dynamic', desc: 'Generous photography, cinematic cards, subtle elevation glows.' }
                  ].map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setDesignCollectionId(col.id as any)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        designCollectionId === col.id
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        {col.title}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {col.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Corporate Blueprint & Modules */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Blueprint Archetype */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Website Blueprint Architecture
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'corporate', title: 'Enterprise Corporate Flagship', desc: 'Complete corporate presence with leadership, governance, investor disclosures, and ESG reporting.' },
                    { id: 'professional_services', title: 'Professional & Advisory Practice', desc: 'Practice areas, cross-border transaction track record, client case studies, and partner bios.' },
                  ].map((bp) => (
                    <button
                      key={bp.id}
                      type="button"
                      onClick={() => setBlueprintId(bp.id as any)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        blueprintId === bp.id
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20'
                          : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{bp.title}</span>
                        {blueprintId === bp.id && <Check className="w-4 h-4 text-purple-600" />}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {bp.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enterprise Feature Modules */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Enabled Feature Modules
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'executiveLeadership', label: 'Executive Leadership & Governance', desc: 'Board member bios, committee charters, and fiduciary oversight.' },
                    { key: 'regulatoryDisclosures', label: 'Real-Time SENS & Market Wire', desc: 'Instant regulatory announcements and financial statement sync.' },
                    { key: 'esgReporting', label: 'ESG & Sustainability Tracker', desc: 'Net Zero 2030 targets, carbon audits, and community investments.' },
                    { key: 'newsroomMedia', label: 'Corporate Newsroom & Media Assets', desc: 'High-res image downloads, press kits, and executive quotes.' },
                    { key: 'careersTalent', label: 'Careers & Talent Portal', desc: 'Job openings, employer brand storytelling, and application forms.' },
                    { key: 'edgeCdnPurge', label: 'Autonomous Edge CDN & Invalidation', desc: 'Sub-500ms purge broadcast upon any live content sign-off.' },
                  ].map((mod) => {
                    const isChecked = (modules as any)[mod.key];
                    return (
                      <label
                        key={mod.key}
                        className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800'
                            : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => setModules({ ...modules, [mod.key]: e.target.checked })}
                          className="mt-1 rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">{mod.label}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{mod.desc}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Starter Pages Selection */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                  Initial Starter Page Compositions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { key: 'home', label: 'Homepage' },
                    { key: 'about', label: 'About & Governance' },
                    { key: 'operations', label: 'Operations & Solutions' },
                    { key: 'sustainability', label: 'Sustainability (ESG)' },
                    { key: 'investors', label: 'Investor Relations' },
                    { key: 'contact', label: 'Contact & Offices' },
                  ].map((pageItem) => {
                    const isChecked = (starterPages as any)[pageItem.key];
                    return (
                      <label
                        key={pageItem.key}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-white dark:bg-slate-900 border-purple-400 text-slate-900 dark:text-white shadow-2xs'
                            : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{pageItem.label}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => setStarterPages({ ...starterPages, [pageItem.key]: e.target.checked })}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Client User Provisioning & White-Label Access */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Enable Provisioning Toggle */}
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-purple-950 dark:text-purple-200">
                    Provision Client CMS Workspace Access
                  </div>
                  <p className="text-xs text-purple-700 dark:text-purple-400 font-medium">
                    Automatically create a client user account and deliver login credentials directly via Resend transactional email.
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
                        placeholder="e.g. nombuso.khumalo@vodacom.co.za"
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
                        <option value="content_editor">Client Content Editor (No-Code updates, media uploads)</option>
                        <option value="reviewer">Compliance Reviewer (Review &amp; approve changes)</option>
                        <option value="platform_admin">Client Administrator (Full portal &amp; user management)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Temporary Access Password
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => setUserPassword(`${clientName.replace(/[^a-zA-Z0-9]/g, '')}${Math.floor(1000 + Math.random() * 9000)}!`)}
                          className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          title="Generate new password"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Commercial Agreement Summary */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      Assigned Tier: <strong className="text-purple-600 dark:text-purple-400">{packageTier}</strong> ({selectedServices.length} Services)
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {packageCurrency}{packageAmount} / {packageBillingCycle}
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
                        Dispatches on Launch
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                      <div><strong className="text-slate-900 dark:text-white">To:</strong> {userEmail || 'client@corporate.co.za'}</div>
                      <div><strong className="text-slate-900 dark:text-white">Subject:</strong> Welcome to {clientName || 'Corporate'} Content Studio — Bastion Group</div>
                      <div className="pt-2 text-slate-500">
                        &quot;Your corporate website is deployed on Bastion Edge infrastructure. Log in at <strong>https://zaraai.digital/admin/login</strong> with temporary password: <strong>{userPassword}</strong> to publish real-time content updates.&quot;
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Automated Edge Provisioning Execution & Results */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* If Still Provisioning or Not Started */}
              {!provisionResult && (
                <div className="p-8 text-center space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 mx-auto flex items-center justify-center border border-purple-200 dark:border-purple-800 shadow-md">
                    {isProvisioning ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <Zap className="w-8 h-8 text-purple-600" />
                    )}
                  </div>

                  <div className="space-y-1 max-w-md mx-auto">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {isProvisioning ? 'Orchestrating Corporate Edge Deployment...' : `Ready to Provision ${clientName || 'Corporate Client'}`}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Bastion will generate multi-tenant database partitions, assign the {packageTier} commercial package ({selectedServices.length} services), assemble pages, and dispatch welcome credentials via Resend.
                    </p>
                  </div>

                  {/* Provisioning Phase Steps */}
                  <div className="max-w-md mx-auto space-y-2.5 text-left">
                    {[
                      { step: 1, label: 'Provisioning Client Tenant in SQLite Scope' },
                      { step: 2, label: `Assigning ${packageTier} Package (${packageCurrency}${packageAmount})` },
                      { step: 3, label: 'Assembling Starter Page Compositions via WebsiteAssembler' },
                      { step: 4, label: 'Compiling Brand DNA Tokens & Typography Manifest' },
                      { step: 5, label: 'Setting up Global Edge CDN Invalidation Route' },
                      { step: 6, label: 'Creating Client User Account & Dispatching Resend Email' },
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

                  {provisionError && (
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold max-w-md mx-auto">
                      {provisionError}
                    </div>
                  )}

                  {!isProvisioning && (
                    <button
                      type="button"
                      onClick={handleExecuteProvisioning}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-sm tracking-wider uppercase transition shadow-xl shadow-purple-500/30 cursor-pointer inline-flex items-center gap-2 active:scale-[0.98]"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Execute Full Onboarding &amp; Deploy Website</span>
                    </button>
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
                          Client Onboarding &amp; Deployment Complete!
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white">
                          {provisionResult.client?.name} is Live on Bastion CMS
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono px-3 py-1 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                        {packageTier} Package
                      </span>
                      <span className="text-xs font-bold font-mono px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        100% PRODUCTION READY
                      </span>
                    </div>
                  </div>

                  {/* Commercial Agreement Summary Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Tag className="w-4 h-4 text-purple-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Commercial Agreement: {packageTier} Tier
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {selectedServices.length} Selected Services &bull; {packageNotes}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {packageCurrency}{packageAmount}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        {packageBillingCycle}
                      </span>
                    </div>
                  </div>

                  {/* 3 Launchpad Action Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Action 1: View Live Site */}
                    <Link
                      href={`/sites/${provisionResult.website?.slug}`}
                      target="_blank"
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-4 group"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                          <Globe className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          View Live Corporate Website
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Browse the deployed website with brand typography and assembled starter pages.
                        </p>
                      </div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <span>Open Live Preview</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </span>
                    </Link>

                    {/* Action 2: Visual Page Editor */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveClientId(provisionResult.client?.id);
                        router.push('/admin/editor');
                      }}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-4 group text-left cursor-pointer"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                          <Edit3 className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Launch Visual Page Editor
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Customize typography, box model spacing, hero text, and live visual sections.
                        </p>
                      </div>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                        <span>Launch Canvas Editor</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </button>

                    {/* Action 3: Switch to Client CMS Mode */}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveClientId(provisionResult.client?.id);
                        setPortalViewMode('client');
                        router.push('/admin');
                      }}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-4 group text-left cursor-pointer"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                          <Radio className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Enter Client CMS Mode
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Experience the exact distraction-free CMS interface provided to this client.
                        </p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span>Open Client Portal</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  </div>

                  {/* Client Access Credentials Pack */}
                  {provisionResult.user && (
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Lock className="w-4 h-4 text-purple-600" />
                          <span>Client User Credentials Pack</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(`Login URL: ${provisionResult.user.loginUrl || 'https://zaraai.digital/admin/login'}\nEmail: ${provisionResult.user.email}\nPassword: ${provisionResult.user.temporaryPassword}\nClient: ${provisionResult.client.name}`, 'credentials')}
                          className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          {copiedKey === 'credentials' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'credentials' ? 'Copied!' : 'Copy Credentials'}</span>
                        </button>
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
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Temporary Password</span>
                          <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{provisionResult.user.temporaryPassword}</span>
                        </div>
                      </div>

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

            {currentStep < 6 ? (
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
