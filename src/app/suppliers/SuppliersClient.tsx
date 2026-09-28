'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Mail,
  Building2,
  FileCheck,
  AlertCircle,
  Download,
  RotateCcw,
  Scale
} from 'lucide-react';
import { SupplierGuidance } from '@/lib/types';

interface StepItem {
  id: string;
  stepNumber: number;
  stepTitle: string;
  description: string;
  items: string[];
}

interface SuppliersClientProps {
  initialGuidance: SupplierGuidance[];
}

export default function SuppliersClient({ initialGuidance }: SuppliersClientProps) {
  const allGuidance = initialGuidance;

  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('ZA');
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const activeGuidance = useMemo(() => {
    return allGuidance.find((g) => g.countryCode === selectedCountryCode) || allGuidance[0];
  }, [allGuidance, selectedCountryCode]);

  // Structured 5-step compliance builder mapped for each jurisdiction
  const fiveSteps: StepItem[] = useMemo(() => {
    switch (selectedCountryCode) {
      case 'ZA':
        return [
          {
            id: 'za-step-1',
            stepNumber: 1,
            stepTitle: 'Corporate & Statutory Registration',
            description: 'Establish verified South African corporate entity standing and fiscal compliance.',
            items: [
              'Valid South African Company Registration (CIPC documentation)',
              'Valid SARS Tax Compliance PIN / Good Standing Status',
              'Bank Account Confirmation Letter (stamped within last 3 months)',
            ],
          },
          {
            id: 'za-step-2',
            stepNumber: 2,
            stepTitle: 'Health, Safety & Mine Compliance',
            description: 'Align with strict statutory mine health and safety requirements for deep underground works.',
            items: [
              'Valid Letter of Good Standing with the Compensation Commissioner (COIDA / FEM)',
              'Mandatory Mine Health and Safety Act (MHSA) compliance protocols for onsite contractors',
              'Baseline medical fitness certifications for personnel visiting operational surface or underground works',
            ],
          },
          {
            id: 'za-step-3',
            stepNumber: 3,
            stepTitle: 'Host Community & B-BBEE Alignment',
            description: 'Prioritize economic participation of host communities surrounding South Deep (West Rand).',
            items: [
              'Broad-Based Black Economic Empowerment (B-BBEE) verification certificate or sworn affidavit',
              'Proof of business address (Host community proof of residence within West Rand / Westonaria / Rand West City if claiming local status)',
              'Ownership disclosure (51%+ Historically Disadvantaged South African ownership verified)',
            ],
          },
          {
            id: 'za-step-4',
            stepNumber: 4,
            stepTitle: 'Operational & Insurance Capability',
            description: 'Ensure adequate commercial insurance and technical capacity for mine delivery.',
            items: [
              'Public & Products Liability Insurance cover certificate',
              'Equipment and mechanized mobile plant maintenance records (if supplying machinery)',
            ],
          },
          {
            id: 'za-step-5',
            stepNumber: 5,
            stepTitle: 'Governance, Ethics & Anti-Corruption',
            description: 'Uphold uncompromising corporate integrity and transparency standards.',
            items: [
              'Formal acceptance of Gold Fields Group Code of Conduct & Supplier Code of Business Conduct',
              'Anti-bribery, conflict of interest declaration, and third-party compliance vetting clearance',
            ],
          },
        ];

      case 'GH':
        return [
          {
            id: 'gh-step-1',
            stepNumber: 1,
            stepTitle: 'Minerals Commission & Statutory Incorporation',
            description: 'Formal regulatory accreditation with the Ghanaian mining inspectorate.',
            items: [
              'Minerals Commission of Ghana Supplier Registration Certificate',
              'Registrar General\'s Department Certificate of Incorporation and Commencement of Business',
              'Ghana Revenue Authority (GRA) Tax Clearance Certificate',
            ],
          },
          {
            id: 'gh-step-2',
            stepNumber: 2,
            stepTitle: 'Social Security & Environmental Clearances',
            description: 'Workforce protection and environmental stewardship compliance.',
            items: [
              'Social Security and National Insurance Trust (SSNIT) Clearance Certificate',
              'Environmental Protection Agency (EPA) permit (for hazardous materials or chemical transport)',
            ],
          },
          {
            id: 'gh-step-3',
            stepNumber: 3,
            stepTitle: 'Local Content Regulations (L.I. 2431)',
            description: 'Strict adherence to domestic industrial procurement mandates.',
            items: [
              'Strict compliance with Minerals Commission Procurement List mandates (domestic equity verification)',
              'Host Community status verification by local Traditional Council (Tarkwa / Apinto / Bosomtwe)',
            ],
          },
          {
            id: 'gh-step-4',
            stepNumber: 4,
            stepTitle: 'Safety Management Plan',
            description: 'Operational contractor safety plan aligned with Ghanaian mining law.',
            items: [
              'Contractor safety management plan aligned with Ghana Inspectorate Division regulations',
              'Certified staff PPE and site health induction register',
            ],
          },
          {
            id: 'gh-step-5',
            stepNumber: 5,
            stepTitle: 'Governance & Human Rights Safeguards',
            description: 'Adherence to international labor standards and anti-corruption covenants.',
            items: [
              'Formal adherence to Gold Fields Anti-Corruption, Modern Slavery, and Child Labour Policies',
              'Acceptance of independent audit rights and confidential Speak Up compliance',
            ],
          },
        ];

      case 'AU':
        return [
          {
            id: 'au-step-1',
            stepNumber: 1,
            stepTitle: 'Australian Corporate Standing',
            description: 'Statutory registration and Australian corporate identification.',
            items: [
              'Valid Australian Business Number (ABN) and Australian Company Number (ACN)',
              'Australian Taxation Office (ATO) GST registration standing',
            ],
          },
          {
            id: 'au-step-2',
            stepNumber: 2,
            stepTitle: 'Statutory Insurances & Workers Comp',
            description: 'Mandatory commercial protection covering Western Australian remote operations.',
            items: [
              'Public & Products Liability Insurance ($20M minimum for operational site work)',
              'Workers\' Compensation Insurance complying with Western Australia statutory requirements',
            ],
          },
          {
            id: 'au-step-3',
            stepNumber: 3,
            stepTitle: 'Indigenous Business & Regional Content',
            description: 'Supporting Aboriginal and Torres Strait Islander enterprise participation.',
            items: [
              'Aboriginal business participation declaration (e.g. Supply Nation registration if applicable)',
              'Commitment to regional procurement in the Goldfields-Esperance and Pilbara regions',
            ],
          },
          {
            id: 'au-step-4',
            stepNumber: 4,
            stepTitle: 'Occupational Health & Mobile Plant Safety',
            description: 'ISO safety standards and fly-in-fly-out (FIFO) operational health surveillance.',
            items: [
              'Safety Management System documentation certified to AS/NZS ISO 45001 or equivalent',
              'Vehicle safety specifications matching Gold Fields Australia surface/underground mobile plant standards',
              'Comprehensive site induction and health surveillance for FIFO contractor personnel',
            ],
          },
          {
            id: 'au-step-5',
            stepNumber: 5,
            stepTitle: 'Modern Slavery & Supply Chain Integrity',
            description: 'Compliance with Australia\'s Commonwealth Modern Slavery Act 2018.',
            items: [
              'Modern Slavery Act self-assessment and supply chain transparency declaration',
              'Gold Fields Australia Supplier Code of Conduct formal sign-off',
            ],
          },
        ];

      case 'AM':
      default:
        return [
          {
            id: 'am-step-1',
            stepNumber: 1,
            stepTitle: 'National Fiscal Registration',
            description: 'Verified corporate tax and commercial registration in Chile or Peru.',
            items: [
              'National Tax Identification (RUT in Chile, RUC in Peru)',
              'Certificate of Good Standing with labor authorities (Certificado de Antecedentes Laborales)',
            ],
          },
          {
            id: 'am-step-2',
            stepNumber: 2,
            stepTitle: 'High-Altitude Health & Survival Standards',
            description: 'Rigorous medical and vehicle protocols for operations above 3,500m (Salares Norte).',
            items: [
              'High-altitude medical fitness protocols for personnel working above 3,500m',
              'Mandatory high-altitude driving and emergency survival equipment for transport contractors',
            ],
          },
          {
            id: 'am-step-3',
            stepNumber: 3,
            stepTitle: 'Indigenous & Local Community Register',
            description: 'Prioritizing local Colla communities in Atacama and Hualgayoc in Cajamarca.',
            items: [
              'Local community commercial register confirmation (Diego de Almagro / Cajamarca)',
              'Commitment to host community employment and micro-enterprise subcontracting',
            ],
          },
          {
            id: 'am-step-4',
            stepNumber: 4,
            stepTitle: 'Environmental & Hazardous Materials Safety',
            description: 'Zero tolerance for chemical spill risks and high-Andean environmental protection.',
            items: [
              'Civil liability and environmental occupational risk insurance policies',
              'Hazardous materials transport certification compliant with national transport authorities',
            ],
          },
          {
            id: 'am-step-5',
            stepNumber: 5,
            stepTitle: 'Human Rights & Anti-Bribery Compliance',
            description: 'Rigorous vetting aligned with international anti-corruption frameworks.',
            items: [
              'Acceptance of Gold Fields Human Rights, Anti-Bribery, and Ethical Conduct Codes',
              'Binding agreement to independent audit rights and confidential Speak Up reporting',
            ],
          },
        ];
    }
  }, [selectedCountryCode]);

  // Checklist completion calculation
  const allCurrentItemKeys = useMemo(() => {
    const keys: string[] = [];
    fiveSteps.forEach((step) => {
      step.items.forEach((_, idx) => {
        keys.push(`${step.id}-${idx}`);
      });
    });
    return keys;
  }, [fiveSteps]);

  const completedCount = useMemo(() => {
    return allCurrentItemKeys.filter((key) => completedItems[key]).length;
  }, [allCurrentItemKeys, completedItems]);

  const progressPercentage = Math.round(
    (completedCount / (allCurrentItemKeys.length || 1)) * 100
  );

  const toggleItem = (key: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = () => {
    const updated: Record<string, boolean> = { ...completedItems };
    allCurrentItemKeys.forEach((key) => {
      updated[key] = true;
    });
    setCompletedItems(updated);
  };

  const handleReset = () => {
    const updated: Record<string, boolean> = { ...completedItems };
    allCurrentItemKeys.forEach((key) => {
      delete updated[key];
    });
    setCompletedItems(updated);
  };

  // Download checklist text file
  const handleDownloadChecklist = () => {
    let report = `GOLD FIELDS SUPPLIER PRE-QUALIFICATION CHECKLIST\n`;
    report += `Jurisdiction: ${activeGuidance.country}\n`;
    report += `Generated: ${new Date().toLocaleDateString()}\n`;
    report += `Progress: ${completedCount}/${allCurrentItemKeys.length} items verified (${progressPercentage}%)\n\n`;
    report += `MANDATORY DISCLOSURE:\nRegistration does not guarantee contract awards or tenders; it qualifies suppliers to participate in competitive tenders.\n\n`;

    fiveSteps.forEach((step) => {
      report += `\nSTEP ${step.stepNumber}: ${step.stepTitle.toUpperCase()}\n`;
      report += `${step.description}\n`;
      step.items.forEach((item, idx) => {
        const checked = completedItems[`${step.id}-${idx}`] ? '[X]' : '[ ]';
        report += `  ${checked} ${item}\n`;
      });
    });

    report += `\nOFFICIAL REGISTRATION PORTAL:\n${activeGuidance.officialPortalName}\nURL: ${activeGuidance.officialPortalUrl}\n`;
    report += `Procurement Support Contact: ${activeGuidance.contactEmail}\n`;
    report += `Speak Up Whistleblowing Channel: ${activeGuidance.speakUpUrl}\n`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GoldFields-${selectedCountryCode}-Supplier-Checklist.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-0">
      {/* ============================================================ */}
      {/* 1. HERO SECTION & PROCUREMENT OVERVIEW                       */}
      {/* ============================================================ */}
      <section className="relative min-h-[480px] flex items-center bg-navy-dark overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/nav-suppliers.jpg"
            alt="Gold Fields Supplier and Contractor Community"
            fill
            priority
            className="object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/95 to-navy-dark/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-black/30" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10 w-full">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-dark/30 border border-gold-mineral/40 text-gold-light text-xs font-semibold uppercase tracking-widest backdrop-blur-xs">
              <Building2 className="w-3.5 h-3.5 text-gold" />
              <span>Supply Chain Stewardship</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] font-display">
              Suppliers & Ethical <br />
              <span className="text-gold-light font-normal italic">Procurement Partnerships.</span>
            </h1>

            <p className="text-base sm:text-lg text-mist/90 max-w-2xl font-normal leading-relaxed">
              We partner with local and global enterprises that share our commitment to safety, human dignity, environmental excellence, and host community economic empowerment.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#checklist-builder"
                className="px-6 py-3.5 rounded-lg bg-gold hover:bg-gold-light text-navy-dark font-bold text-sm shadow-card transition-all flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>Open 5-Step Checklist</span>
              </a>

              <a
                href="#portals"
                className="px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all flex items-center gap-2"
              >
                <span>Vendor Portals</span>
                <ExternalLink className="w-4 h-4 text-mist" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. PROMINENT MANDATORY DISCLOSURE BANNER                     */}
      {/* ============================================================ */}
      <section className="bg-editorial-surface border-b border-mist py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-6 sm:p-7 shadow-subtle flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-amber-200/70 text-amber-900 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-amber-800" />
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900">
                  Mandatory Legal Disclosure
                </span>
                <span className="text-xs font-semibold text-amber-950">
                  Competitive Tender Protocol
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-navy leading-snug">
                &ldquo;Registration does not guarantee contract awards or tenders; it qualifies suppliers to participate in competitive tenders.&rdquo;
              </p>
              <p className="text-xs text-ink-muted leading-relaxed">
                All procurement decisions at Gold Fields are conducted strictly on competitive commercial merit, safety record, technical qualification, ESG adherence, and localized statutory compliance. Vendor onboarding enables participation in competitive requests for proposals (RFPs) and tenders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. COUNTRY SELECTION & 5-STEP COMPLIANCE CHECKLIST BUILDER    */}
      {/* ============================================================ */}
      <section id="checklist-builder" className="py-16 px-6 bg-editorial">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block mb-2">
              Interactive Compliance Tool
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy">
              5-Step Compliance & Pre-Qualification Checklist
            </h2>
            <p className="text-sm text-ink-muted mt-2">
              Select your operating country below to generate a tailored compliance roadmap before initiating formal onboarding on our e-procurement portals.
            </p>
          </div>

          {/* Country Selection Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-mist pb-4">
            <button
              onClick={() => setSelectedCountryCode('ZA')}
              className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedCountryCode === 'ZA'
                  ? 'bg-navy text-white shadow-card'
                  : 'bg-white text-ink-muted hover:text-navy border border-mist'
              }`}
            >
              <span>South Africa (South Deep & HQ)</span>
            </button>

            <button
              onClick={() => setSelectedCountryCode('GH')}
              className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedCountryCode === 'GH'
                  ? 'bg-navy text-white shadow-card'
                  : 'bg-white text-ink-muted hover:text-navy border border-mist'
              }`}
            >
              <span>Ghana (Tarkwa & Regional)</span>
            </button>

            <button
              onClick={() => setSelectedCountryCode('AU')}
              className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedCountryCode === 'AU'
                  ? 'bg-navy text-white shadow-card'
                  : 'bg-white text-ink-muted hover:text-navy border border-mist'
              }`}
            >
              <span>Australia (Agnew, Granny Smith, Gruyere, St Ives)</span>
            </button>

            <button
              onClick={() => setSelectedCountryCode('AM')}
              className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedCountryCode === 'AM'
                  ? 'bg-navy text-white shadow-card'
                  : 'bg-white text-ink-muted hover:text-navy border border-mist'
              }`}
            >
              <span>Americas (Salares Norte Chile & Cerro Corona Peru)</span>
            </button>
          </div>

          {/* Regional Context Summary Bar */}
          <div className="bg-white p-6 rounded-2xl border border-mist shadow-subtle space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-mist">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block">
                  Regional Focus
                </span>
                <h3 className="text-xl font-bold text-navy">
                  {activeGuidance.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-ink-muted">Inquiries:</span>
                <a
                  href={`mailto:${activeGuidance.contactEmail}`}
                  className="font-bold text-navy hover:text-gold-dark inline-flex items-center gap-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{activeGuidance.contactEmail}</span>
                </a>
              </div>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              {activeGuidance.overview}
            </p>

            <div className="p-3 bg-editorial rounded-lg border border-mist/80 text-xs text-ink-muted">
              <strong className="text-navy">Host Community Policy: </strong>
              {activeGuidance.localContentPolicy}
            </div>
          </div>

          {/* Checklist Progress Meter */}
          <div className="bg-white p-6 rounded-2xl border border-mist shadow-subtle space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-navy uppercase tracking-wider">
                Verification Readiness Progress
              </span>
              <span className="font-bold text-navy tabular-nums">
                {completedCount} of {allCurrentItemKeys.length} items checked ({progressPercentage}%)
              </span>
            </div>

            <div className="w-full h-3 bg-mist-light rounded-full overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-navy font-semibold hover:underline"
                >
                  Check all items
                </button>
                <span className="text-mist">•</span>
                <button
                  onClick={handleReset}
                  className="text-ink-muted hover:text-navy inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset checklist</span>
                </button>
              </div>

              <button
                onClick={handleDownloadChecklist}
                className="px-4 py-2 bg-navy hover:bg-navy-light text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Compliance Summary (.txt)</span>
              </button>
            </div>
          </div>

          {/* The 5 Steps */}
          <div className="space-y-6">
            {fiveSteps.map((step) => {
              const stepCompleted = step.items.every((_, idx) =>
                completedItems[`${step.id}-${idx}`]
              );

              return (
                <div
                  key={step.id}
                  className={`p-6 rounded-2xl bg-white border transition-all duration-200 shadow-subtle ${
                    stepCompleted
                      ? 'border-forest/60 bg-forest-light/10'
                      : 'border-mist'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          stepCompleted
                            ? 'bg-forest text-white'
                            : 'bg-navy text-gold'
                        }`}
                      >
                        {stepCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          `0${step.stepNumber}`
                        )}
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-navy">
                          Step {step.stepNumber}: {step.stepTitle}
                        </h4>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        stepCompleted
                          ? 'bg-forest-light text-forest'
                          : 'bg-mist text-ink-muted'
                      }`}
                    >
                      {stepCompleted ? 'Step Complete' : 'Pending Verification'}
                    </span>
                  </div>

                  {/* Checklist Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {step.items.map((item, idx) => {
                      const itemKey = `${step.id}-${idx}`;
                      const isChecked = !!completedItems[itemKey];

                      return (
                        <label
                          key={itemKey}
                          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-forest-light/30 border-forest/40'
                              : 'bg-editorial hover:bg-mist/60 border-mist'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleItem(itemKey)}
                            className="mt-0.5 h-4 w-4 rounded border-mist text-navy focus:ring-gold-mineral cursor-pointer"
                          />
                          <span
                            className={`text-xs leading-relaxed ${
                              isChecked
                                ? 'text-forest font-semibold line-through decoration-forest/40'
                                : 'text-ink'
                            }`}
                          >
                            {item}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. OFFICIAL VENDOR REGISTRATION PORTALS                      */}
      {/* ============================================================ */}
      <section id="portals" className="py-20 px-6 bg-white border-t border-mist">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block mb-2">
              Official Access Points
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy">
              Regional Vendor Registration Portals
            </h2>
            <p className="text-sm text-ink-muted mt-2">
              Once statutory documentation is prepared, submit formal registration through the designated official electronic procurement platform for your operational region.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* South Africa */}
            <div className="bg-editorial rounded-2xl border border-mist p-6 shadow-subtle flex flex-col justify-between hover:shadow-card transition-shadow">
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded bg-navy text-white text-[10px] font-bold uppercase tracking-wider inline-block">
                  South Africa
                </span>
                <h3 className="text-lg font-bold text-navy">
                  Coupa Supplier Portal & SA E-Procurement
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Official system for South Deep mine contracts, operational equipment tenders, and West Rand community supplier incubators.
                </p>
                <div className="pt-2 text-[11px] text-ink-subtle">
                  Managed via Coupa Electronic Gateway
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-mist/80 space-y-2">
                <a
                  href="https://www.goldfields.com/south-africa.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-navy hover:bg-navy-light text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Access Coupa Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-[10px] text-ink-muted block text-center">
                  Email: southafricasuppliers@goldfields.com
                </span>
              </div>
            </div>

            {/* Ghana */}
            <div className="bg-editorial rounded-2xl border border-mist p-6 shadow-subtle flex flex-col justify-between hover:shadow-card transition-shadow">
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded bg-navy text-white text-[10px] font-bold uppercase tracking-wider inline-block">
                  Ghana
                </span>
                <h3 className="text-lg font-bold text-navy">
                  Minerals Commission & Tarkwa Portal
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Requires Minerals Commission Supplier Registration Certificate before accessing Gold Fields Ghana e-tender repository.
                </p>
                <div className="pt-2 text-[11px] text-ink-subtle">
                  L.I. 2431 Domestic Procurement List compliance
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-mist/80 space-y-2">
                <a
                  href="https://www.goldfields.com/ghana.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-navy hover:bg-navy-light text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Ghana Vendor System</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-[10px] text-ink-muted block text-center">
                  Email: ghanasuppliers@goldfields.com
                </span>
              </div>
            </div>

            {/* Australia */}
            <div className="bg-editorial rounded-2xl border border-mist p-6 shadow-subtle flex flex-col justify-between hover:shadow-card transition-shadow">
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded bg-navy text-white text-[10px] font-bold uppercase tracking-wider inline-block">
                  Australia
                </span>
                <h3 className="text-lg font-bold text-navy">
                  Gold Fields Australia Prequalification
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Serving Agnew, Granny Smith, Gruyere JV, and St Ives complexes in Western Australia. Rigorous FIFO safety checks.
                </p>
                <div className="pt-2 text-[11px] text-ink-subtle">
                  Supply Nation partner declarations supported
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-mist/80 space-y-2">
                <a
                  href="https://www.goldfields.com/australia.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-navy hover:bg-navy-light text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Australia Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-[10px] text-ink-muted block text-center">
                  Email: australiasuppliers@goldfields.com
                </span>
              </div>
            </div>

            {/* Americas */}
            <div className="bg-editorial rounded-2xl border border-mist p-6 shadow-subtle flex flex-col justify-between hover:shadow-card transition-shadow">
              <div className="space-y-3">
                <span className="px-2.5 py-1 rounded bg-navy text-white text-[10px] font-bold uppercase tracking-wider inline-block">
                  Americas (Chile & Peru)
                </span>
                <h3 className="text-lg font-bold text-navy">
                  Registro de Proveedores Americas
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Supplier enrollment for Salares Norte high-altitude operations (Chile) and Cerro Corona copper-gold porphyry (Peru).
                </p>
                <div className="pt-2 text-[11px] text-ink-subtle">
                  High-altitude safety & Colla community register
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-mist/80 space-y-2">
                <a
                  href="https://www.goldfields.com/americas.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-navy hover:bg-navy-light text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Americas Registro</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-[10px] text-ink-muted block text-center">
                  Email: americassuppliers@goldfields.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. SPEAK UP WHISTLEBLOWING INTEGRATION                       */}
      {/* ============================================================ */}
      <section className="py-20 px-6 bg-navy-dark text-white border-t border-navy-surface">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="bg-navy rounded-3xl border border-mist/15 p-8 sm:p-12 shadow-elevated grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-dark/30 border border-gold-mineral/40 text-gold-light text-xs font-semibold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-gold" />
                <span>Speak Up Anonymous Whistleblowing Platform</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Zero Tolerance for Bribery, Fraud, or Procurement Irregularities
              </h2>

              <p className="text-sm text-mist/90 leading-relaxed max-w-2xl">
                Gold Fields enforces an uncompromising anti-corruption policy across all procurement touchpoints. Suppliers, contractors, tenderers, and employees are required to report any solicitation of bribes, conflicts of interest, safety infractions, or unfair tender practices.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="bg-navy-surface/80 p-3.5 rounded-xl border border-mist/10">
                  <span className="text-gold font-bold block mb-1">100% Anonymous</span>
                  <p className="text-mist/80">Administered independently by EthicsPoint / NAVEX Global outside Gold Fields systems.</p>
                </div>
                <div className="bg-navy-surface/80 p-3.5 rounded-xl border border-mist/10">
                  <span className="text-gold font-bold block mb-1">Anti-Retaliation</span>
                  <p className="text-mist/80">Strict contractual protection against commercial retaliation or tender discrimination.</p>
                </div>
                <div className="bg-navy-surface/80 p-3.5 rounded-xl border border-mist/10">
                  <span className="text-gold font-bold block mb-1">24/7 Availability</span>
                  <p className="text-mist/80">Multi-lingual telephone hotlines and secure web intake available 365 days a year.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-navy-surface p-6 rounded-2xl border border-mist/10 space-y-4 text-center">
              <Scale className="w-10 h-10 text-gold mx-auto" />
              <h3 className="text-lg font-bold text-white">Independent Hotline Access</h3>
              <p className="text-xs text-mist/80">
                Submit a confidential report online or contact your regional toll-free hotline:
              </p>

              <div className="space-y-1.5 text-xs text-left bg-navy-dark/70 p-3.5 rounded-xl border border-mist/10 font-mono text-mist">
                <div>South Africa: <span className="text-white font-semibold">0800 203 712</span></div>
                <div>Australia: <span className="text-white font-semibold">1800 121 888</span></div>
                <div>Ghana: <span className="text-white font-semibold">+233 21 770 189</span></div>
                <div>Chile: <span className="text-white font-semibold">800 835 180</span></div>
                <div>Peru: <span className="text-white font-semibold">0800 700 76</span></div>
              </div>

              <a
                href="https://secure.ethicspoint.eu/domain/media/en/gui/114521/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-gold hover:bg-gold-light text-navy-dark font-bold text-xs shadow-card transition-all inline-flex items-center justify-center gap-2"
              >
                <span>Report via Speak Up Secure Web</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
