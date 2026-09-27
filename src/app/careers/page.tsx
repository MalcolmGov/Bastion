'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Briefcase,
  MapPin,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Search,
  CheckCircle2,
  Users,
  ArrowRight,
  GraduationCap,
  Globe2,
  Cpu,
  HelpCircle,
  Filter
} from 'lucide-react';
import { ContentRepository } from '@/lib/adapters/ContentRepository';
import { JobListing } from '@/lib/types';

const DISCIPLINE_OPTIONS = [
  { label: 'All Disciplines', value: 'All' },
  { label: 'Mining Engineering', value: 'Mining Engineering' },
  { label: 'Geology', value: 'Geology & Exploration' },
  { label: 'Metallurgy', value: 'Metallurgy & Processing' },
  { label: 'Microgrid / Automation', value: 'Digital & Automation' },
  { label: 'Environment', value: 'Health, Safety & Environment' },
  { label: 'Supply Chain', value: 'Finance & Supply Chain' },
];

const COUNTRY_OPTIONS = [
  'All Countries',
  'South Africa',
  'Australia',
  'Ghana',
  'Chile',
  'Canada',
];

export default function CareersPage() {
  const allJobs = useMemo(() => ContentRepository.getJobs(), []);

  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All Countries');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Filter logic
  const filteredJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const matchDiscipline =
        selectedDiscipline === 'All' || job.discipline === selectedDiscipline;
      const matchCountry =
        selectedCountry === 'All Countries' || job.country === selectedCountry;
      const matchQuery =
        !searchQuery.trim() ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.summary.toLowerCase().includes(searchQuery.toLowerCase());

      return matchDiscipline && matchCountry && matchQuery;
    });
  }, [allJobs, selectedDiscipline, selectedCountry, searchQuery]);

  const handleAskAI = (job?: JobListing) => {
    const prompt = job
      ? `Tell me about the requirements and operational context for the ${job.title} role at ${job.location}.`
      : 'Help me find an engineering, geology, metallurgy, or automation role at Gold Fields based on my experience.';

    window.dispatchEvent(
      new CustomEvent('open-assistant', {
        detail: {
          prompt,
          context: 'Careers Discovery',
        },
      })
    );
  };

  return (
    <div className="space-y-0">
      {/* ============================================================ */}
      {/* 1. HERO SECTION & CULTURE OVERVIEW                           */}
      {/* ============================================================ */}
      <section className="relative min-h-[520px] flex items-center bg-navy-dark overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/nav-people.jpg"
            alt="Gold Fields Team and Culture"
            fill
            priority
            className="object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/95 to-navy-dark/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-black/30" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10 w-full">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-dark/30 border border-gold-mineral/40 text-gold-light text-xs font-semibold uppercase tracking-widest backdrop-blur-xs">
              <Users className="w-3.5 h-3.5 text-gold" />
              <span>People, Culture & Careers</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] font-display">
              Build an enduring career <br />
              <span className="text-gold-light font-normal italic">at the frontier of mining.</span>
            </h1>

            <p className="text-base sm:text-lg text-mist/90 max-w-2xl font-normal leading-relaxed">
              We are a team of over 20,000 innovators, engineers, geologists, and technicians across six nations. We combine deep-level mechanization, high-altitude metallurgy, and hybrid renewable microgrids with a relentless culture of safety and inclusion.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#roles"
                className="px-6 py-3.5 rounded-lg bg-gold hover:bg-gold-light text-navy-dark font-bold text-sm shadow-card transition-all flex items-center gap-2 group"
              >
                <span>Explore Open Roles</span>
                <ArrowRight className="w-4 h-4 text-navy-dark group-hover:translate-x-1 transition-transform" />
              </a>

              <button
                onClick={() => handleAskAI()}
                className="px-6 py-3.5 rounded-lg bg-navy-surface hover:bg-navy-light text-white font-semibold text-sm border border-gold-mineral/40 shadow-subtle transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-gold" />
                <span>Ask AI to help find a role</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. GLOBAL PRESENCE & WORKFORCE SNAPSHOT STRIP               */}
      {/* ============================================================ */}
      <section className="bg-white border-b border-mist py-6 px-6 shadow-subtle">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-3 border-r last:border-0 border-mist">
            <span className="text-2xl sm:text-3xl font-extrabold text-navy block tabular-nums">20,000+</span>
            <span className="text-xs text-ink-muted mt-1 block">Global Employees & Contractors</span>
          </div>
          <div className="p-3 border-r last:border-0 border-mist">
            <span className="text-2xl sm:text-3xl font-extrabold text-navy block tabular-nums">26.2%</span>
            <span className="text-xs text-ink-muted mt-1 block">Female Workforce Representation</span>
          </div>
          <div className="p-3 border-r last:border-0 border-mist">
            <span className="text-2xl sm:text-3xl font-extrabold text-navy block tabular-nums">6</span>
            <span className="text-xs text-ink-muted mt-1 block">Operating Jurisdictions Globally</span>
          </div>
          <div className="p-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-forest block">Zero</span>
            <span className="text-xs text-ink-muted mt-1 block">Fatalities Recorded (H1 2026)</span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. CULTURE, VALUES & LEARNING ACADEMIES                      */}
      {/* ============================================================ */}
      <section className="py-20 px-6 bg-editorial">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block mb-2">
              Our Operating Culture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy">
              Five Values that Guide Every Shift
            </h2>
            <p className="text-sm text-ink-muted mt-2">
              Our values are not abstract statements — they determine our daily operating licenses and how we care for one another.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl border border-mist shadow-subtle hover:border-gold-mineral transition-colors">
              <span className="w-8 h-8 rounded-lg bg-navy text-gold flex items-center justify-center font-bold text-xs mb-3">01</span>
              <h3 className="text-base font-bold text-navy mb-1.5">Safety</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                If we cannot mine safely, we will not mine. Zero harm is our non-negotiable operational standard.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-mist shadow-subtle hover:border-gold-mineral transition-colors">
              <span className="w-8 h-8 rounded-lg bg-navy text-gold flex items-center justify-center font-bold text-xs mb-3">02</span>
              <h3 className="text-base font-bold text-navy mb-1.5">Respect</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                We treat each other with dignity, cultivate inclusive workplaces, and celebrate cultural diversity.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-mist shadow-subtle hover:border-gold-mineral transition-colors">
              <span className="w-8 h-8 rounded-lg bg-navy text-gold flex items-center justify-center font-bold text-xs mb-3">03</span>
              <h3 className="text-base font-bold text-navy mb-1.5">Integrity</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                We behave ethically, deliver on our commitments, and speak up without fear of retaliation.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-mist shadow-subtle hover:border-gold-mineral transition-colors">
              <span className="w-8 h-8 rounded-lg bg-navy text-gold flex items-center justify-center font-bold text-xs mb-3">04</span>
              <h3 className="text-base font-bold text-navy mb-1.5">Responsibility</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                We safeguard environmental resources, conserve water, and create enduring host community value.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-mist shadow-subtle hover:border-gold-mineral transition-colors">
              <span className="w-8 h-8 rounded-lg bg-navy text-gold flex items-center justify-center font-bold text-xs mb-3">05</span>
              <h3 className="text-base font-bold text-navy mb-1.5">Collaboration</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                We partner across borders, disciplines, and unions to drive shared technological excellence.
              </p>
            </div>
          </div>

          {/* Development Academies Split */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="bg-white p-6 rounded-2xl border border-mist shadow-subtle flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-navy/10 text-navy flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-navy" />
                </div>
                <h4 className="text-lg font-bold text-navy">Mechanised Skills Academy</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Based at South Deep in South Africa, training operators and engineers in state-of-the-art underground simulators, automated drill rigs, and telemetry.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-mist text-xs font-semibold text-gold-dark">
                Location: South Africa (Westonaria)
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-mist shadow-subtle flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-gold-dark" />
                </div>
                <h4 className="text-lg font-bold text-navy">Graduate Development</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  A structured two-year rotational programme across Australian and Ghanaian mining complexes covering geotechnical engineering, metallurgy, and mine planning.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-mist text-xs font-semibold text-gold-dark">
                Location: Australia & Ghana
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-mist shadow-subtle flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-forest-light text-forest flex items-center justify-center">
                  <Globe2 className="w-5 h-5 text-forest" />
                </div>
                <h4 className="text-lg font-bold text-navy">Global Technical Mobility</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Opportunities for mid-career specialists to transfer technical expertise between high-altitude Salares Norte (Chile) and Western Australian microgrids.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-mist text-xs font-semibold text-gold-dark">
                Location: Trans-National Exchange
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. FILTERABLE JOB DISCOVERY DEMONSTRATION                    */}
      {/* ============================================================ */}
      <section id="roles" className="py-20 px-6 bg-white border-t border-mist">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header & AI Trigger Bar */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-mist">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block mb-2">
                Opportunities
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy">
                Filterable Job Discovery
              </h2>
              <p className="text-sm text-ink-muted mt-2 max-w-xl">
                Explore illustrative career opportunities across our global operations. Roles featured here demonstrate our operational disciplines.
              </p>
            </div>

            {/* Prominent "Ask AI to help find a role" trigger button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => handleAskAI()}
                className="px-5 py-3 rounded-xl bg-navy hover:bg-navy-light text-white text-xs font-bold shadow-subtle transition-all flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 text-gold group-hover:scale-110 transition-transform" />
                <span>Ask AI to help find a role</span>
              </button>

              <a
                href="https://careers.goldfields.com/utm_source=corpsite"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-editorial hover:bg-mist text-ink text-xs font-semibold border border-mist transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Official Careers Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
              </a>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-editorial p-4 sm:p-6 rounded-2xl border border-mist shadow-subtle space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-navy uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-gold-dark" />
              <span>Filter Vacancies</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
              {/* Discipline Dropdown */}
              <div className="lg:col-span-4">
                <label htmlFor="discipline-select" className="block text-xs font-semibold text-ink-muted mb-1">
                  Discipline
                </label>
                <select
                  id="discipline-select"
                  value={selectedDiscipline}
                  onChange={(e) => setSelectedDiscipline(e.target.value)}
                  className="w-full text-xs bg-white border border-mist rounded-lg px-3 py-2.5 text-ink focus:outline-none focus:border-gold-mineral"
                >
                  {DISCIPLINE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Country Dropdown */}
              <div className="lg:col-span-3">
                <label htmlFor="country-select" className="block text-xs font-semibold text-ink-muted mb-1">
                  Country
                </label>
                <select
                  id="country-select"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full text-xs bg-white border border-mist rounded-lg px-3 py-2.5 text-ink focus:outline-none focus:border-gold-mineral"
                >
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search text input */}
              <div className="lg:col-span-5">
                <label htmlFor="keyword-search" className="block text-xs font-semibold text-ink-muted mb-1">
                  Keyword Search
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-ink-subtle absolute left-3 top-3" />
                  <input
                    id="keyword-search"
                    type="text"
                    placeholder="Search by title, location or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs bg-white border border-mist rounded-lg pl-9 pr-3 py-2.5 text-ink focus:outline-none focus:border-gold-mineral placeholder:text-ink-subtle"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-ink-subtle hover:text-ink text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stats & active filter reset */}
            <div className="flex items-center justify-between pt-2 text-xs text-ink-muted border-t border-mist/60">
              <span>
                Showing <strong>{filteredJobs.length}</strong> of {allJobs.length} demonstration listings
              </span>
              {(selectedDiscipline !== 'All' ||
                selectedCountry !== 'All Countries' ||
                searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedDiscipline('All');
                    setSelectedCountry('All Countries');
                    setSearchQuery('');
                  }}
                  className="text-gold-dark hover:underline font-semibold"
                >
                  Reset all filters
                </button>
              )}
            </div>
          </div>

          {/* Job Listings Grid */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="bg-editorial rounded-2xl border border-mist p-12 text-center space-y-4">
                <Briefcase className="w-12 h-12 text-ink-subtle mx-auto stroke-1" />
                <h3 className="text-lg font-bold text-navy">No Demonstration Roles Found</h3>
                <p className="text-xs text-ink-muted max-w-md mx-auto">
                  No roles match your current filter selection. Try selecting &quot;All Disciplines&quot; or ask our AI assistant for guidance across open positions.
                </p>
                <button
                  onClick={() => {
                    setSelectedDiscipline('All');
                    setSelectedCountry('All Countries');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-colors"
                >
                  View All Roles
                </button>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isExpanded = expandedJobId === job.id;

                return (
                  <div
                    key={job.id}
                    className="p-6 rounded-2xl bg-white border border-mist hover:border-gold-mineral transition-all duration-200 shadow-subtle hover:shadow-card space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        {/* Badges strip */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Visible Demonstration Listing badge */}
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gold-light text-gold-dark border border-gold/40">
                            <HelpCircle className="w-3 h-3 text-gold-dark" />
                            <span>Demonstration Listing</span>
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-navy/10 text-navy">
                            {job.discipline}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-mist text-ink-muted">
                            {job.employmentType}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-navy leading-snug">
                          {job.title}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-xs text-ink-muted">
                          <MapPin className="w-3.5 h-3.5 text-gold-dark shrink-0" />
                          <span>{job.location}</span>
                          <span className="text-mist">•</span>
                          <span className="font-semibold text-ink">{job.country}</span>
                        </div>

                        <p className="text-xs text-ink-muted leading-relaxed pt-1">
                          {job.summary}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row lg:flex-col gap-2 shrink-0 pt-2 lg:pt-0">
                        {/* Link to official careers URL */}
                        <a
                          href={job.officialPortalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 lg:flex-none px-4 py-2.5 rounded-lg bg-gold hover:bg-gold-light text-navy-dark text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
                        >
                          <span>Apply on Official Portal</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => handleAskAI(job)}
                          className="px-3 py-2 rounded-lg bg-editorial hover:bg-mist text-ink text-xs font-medium border border-mist transition-colors inline-flex items-center justify-center gap-1.5"
                          title="Ask AI about this role"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
                          <span>Ask AI</span>
                        </button>
                      </div>
                    </div>

                    {/* Collapsible Key Responsibilities */}
                    <div className="pt-2 border-t border-mist/60">
                      <button
                        onClick={() =>
                          setExpandedJobId(isExpanded ? null : job.id)
                        }
                        className="text-xs font-semibold text-navy hover:text-gold-dark flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'Hide Key Responsibilities' : 'View Key Responsibilities (4)'}</span>
                        <ArrowRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="mt-3 p-4 rounded-xl bg-editorial space-y-2 text-xs text-ink-muted animate-in fade-in duration-200">
                          <span className="font-bold text-navy block text-[11px] uppercase tracking-wider">
                            Core Deliverables:
                          </span>
                          <ul className="space-y-1.5">
                            {job.keyResponsibilities.map((resp, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                                <span>{resp}</span>
                              </li>
                            ))}
                          </ul>
                          <p className="text-[11px] text-ink-subtle pt-2 italic">
                            *This listing is an illustrative profile created for this digital concept prototype. Official applications and candidate evaluations are administered solely through the Gold Fields corporate SAP SuccessFactors portal.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. RECRUITMENT FRAUD DISCLAIMER & INTEGRITY NOTICE           */}
      {/* ============================================================ */}
      <section className="py-12 px-6 bg-editorial border-t border-mist">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl border border-mist p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-gold-dark" />
            </div>

            <div className="space-y-1 flex-1">
              <h3 className="text-base font-bold text-navy">
                Recruitment Fraud Awareness Notice
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Gold Fields will <strong>never</strong> request money, deposits, processing fees, or bank details from candidates at any stage of the recruitment process. All legitimate vacancies and formal appointment offers are issued exclusively through authorized corporate emails ending in <code>@goldfields.com</code>.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Link
                href="/contact"
                className="px-4 py-2 text-xs font-semibold text-navy hover:text-gold-dark border border-mist rounded-lg transition-colors"
              >
                Contact HR
              </Link>
              <a
                href="https://secure.ethicspoint.eu/domain/media/en/gui/114521/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-xs font-bold text-gold-dark hover:text-navy transition-colors inline-flex items-center gap-1"
              >
                <span>Report Fraud via Speak Up</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
