'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  MapPin,
  Lock,
  BadgeCheck,
  X,
  Send,
  Coins
} from 'lucide-react';
import { BrandHeader } from '@/components/brand/BrandHeader';
import { BrandFooter } from '@/components/brand/BrandFooter';

interface Tender {
  id: string;
  tenderNumber: string;
  title: string;
  category: string;
  description: string;
  estimatedValue: string | null;
  closingDate: string;
  status: string;
  minBbbeeLevel: number;
  cidbGrading: string | null;
  hostCommunityMandate: boolean;
  scopeDocumentUrl: string | null;
  submissionsCount?: number;
}

export default function SupplierTendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Bid Modal State
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [vendorName, setVendorName] = useState<string>('');
  const [cipcReg, setCipcReg] = useState<string>('');
  const [sarsPin, setSarsPin] = useState<string>('');
  const [bbbeeLevel, setBbbeeLevel] = useState<number>(2);
  const [hostCommunity, setHostCommunity] = useState<boolean>(true);
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [bidAmount, setBidAmount] = useState<string>('');
  const [submittingBid, setSubmittingBid] = useState<boolean>(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tenders?clientId=client_goldfields');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load corporate tenders.');
      setTenders(data.tenders || []);
    } catch (err: any) {
      console.error('Fetch tenders error:', err);
      setError(err.message || 'Error loading active tenders.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBidModal = (tender: Tender) => {
    setSelectedTender(tender);
    setBidError(null);
    setSubmittedRef(null);
    setVendorName('');
    setCipcReg('');
    setSarsPin('');
    setBbbeeLevel(tender.minBbbeeLevel || 2);
    setHostCommunity(tender.hostCommunityMandate);
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setBidAmount('');
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTender) return;

    setSubmittingBid(true);
    setBidError(null);

    try {
      const res = await fetch('/api/tenders/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenderId: selectedTender.id,
          clientId: 'client_goldfields',
          vendorName,
          cipcRegistrationNumber: cipcReg,
          sarsTaxPin: sarsPin,
          bbbeeLevel,
          hostCommunityRegistered: hostCommunity,
          contactName,
          contactEmail,
          contactPhone,
          bidAmount: bidAmount ? parseFloat(bidAmount) : undefined,
          currency: 'ZAR',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit tender bid.');
      }

      setSubmittedRef(data.submission?.referenceCode || 'BID-RECEIVED');
      // Refresh list to update submission count
      fetchTenders();
    } catch (err: any) {
      setBidError(err.message || 'Bid submission failed. Verify statutory credentials.');
    } finally {
      setSubmittingBid(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'Renewable Energy & Power', label: 'Renewable Energy' },
    { id: 'Mining Operations & Underground', label: 'Mining Operations' },
    { id: 'Environmental & Tailings', label: 'Environmental & Tailings' },
    { id: 'Engineering & Construction', label: 'Engineering' },
    { id: 'Information Technology', label: 'Technology & Digital' },
  ];

  const filteredTenders = tenders.filter((t) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      t.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes(t.category.toLowerCase());
    const matchesQuery =
      searchQuery === '' ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tenderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans selection:bg-gold/30 selection:text-gold-light">
      <BrandHeader />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-mist/60 mb-6 font-mono">
          <Link href="/" className="hover:text-gold-light transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-mist/40" />
          <Link href="/suppliers" className="hover:text-gold-light transition-colors">
            Suppliers
          </Link>
          <ChevronRight className="w-3 h-3 text-mist/40" />
          <span className="text-gold-light font-medium">Corporate Tender Board</span>
        </nav>

        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-surface via-slate-800 to-navy-dark border border-gold/20 p-8 sm:p-12 mb-10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-light text-xs font-semibold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4 text-gold" />
              Mining Charter III &amp; B-BBEE Verified Procurement
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display mb-4">
              Corporate Supplier Tenders &amp; Requests for Proposals (RFPs)
            </h1>
            <p className="text-mist/90 text-sm sm:text-base leading-relaxed mb-6">
              Gold Fields is dedicated to transparent, competitive, and empowering procurement. We invite qualified enterprise suppliers, engineering contractors, and West Rand host community vendors to tender for active operational scopes at South Deep and corporate facilities.
            </p>

            {/* Statutory Compliance Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-700/60">
              <div className="flex items-center gap-2 text-xs text-mist/80">
                <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>CIPC Validated</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-mist/80">
                <BadgeCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SARS TCS PIN Checked</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-mist/80">
                <BadgeCheck className="w-4 h-4 text-gold shrink-0" />
                <span>B-BBEE Levels 1–8</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-mist/80">
                <MapPin className="w-4 h-4 text-turquoise-bright shrink-0" />
                <span>Host Community Priority</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gold text-slate-950 font-bold shadow-md shadow-gold/20'
                    : 'bg-slate-800 text-mist/70 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-mist/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search RFP number, scope, keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-mist/40 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
            />
          </div>
        </div>

        {/* Tenders Grid / State */}
        {loading ? (
          <div className="p-16 text-center text-mist/60 bg-slate-800/40 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium">Loading published corporate RFPs...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-950/30 border border-red-800/50 rounded-2xl text-center text-red-300">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <p className="font-semibold text-sm mb-1">{error}</p>
            <button
              onClick={fetchTenders}
              className="mt-3 px-4 py-1.5 rounded-lg bg-red-800/50 hover:bg-red-700 text-xs font-medium transition"
            >
              Retry
            </button>
          </div>
        ) : filteredTenders.length === 0 ? (
          <div className="p-16 text-center text-mist/60 bg-slate-800/40 rounded-2xl border border-slate-800">
            <FileText className="w-12 h-12 mx-auto mb-3 text-mist/30" />
            <h3 className="text-base font-bold text-white mb-1">No Active Tenders Found</h3>
            <p className="text-xs text-mist/70 max-w-md mx-auto">
              There are currently no active RFPs matching your search criteria. Check back regularly or view supplier prequalification guidelines.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenders.map((tender) => (
              <div
                key={tender.id}
                className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-gold/50 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-xl hover:shadow-gold/5 relative overflow-hidden"
              >
                {/* Accent top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-turquoise-bright to-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Top metadata */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-bold text-gold-light bg-gold/10 px-2 py-0.5 rounded border border-gold/20">
                      {tender.tenderNumber}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      Active RFP
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-gold-light transition-colors line-clamp-2">
                    {tender.title}
                  </h3>

                  {/* Category */}
                  <div className="text-xs text-mist/60 mb-3 flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-mist/50" />
                    <span>{tender.category}</span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-mist/80 leading-relaxed mb-4 line-clamp-3">
                    {tender.description}
                  </p>

                  {/* Compliance Matrix Chips */}
                  <div className="space-y-1.5 py-3 border-y border-slate-700/60 mb-4 text-xs">
                    <div className="flex items-center justify-between text-mist/80">
                      <span className="text-mist/50">Estimated Value:</span>
                      <span className="font-semibold text-white">
                        {tender.estimatedValue || 'Undisclosed (Schedule of Rates)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-mist/80">
                      <span className="text-mist/50">Min B-BBEE Level:</span>
                      <span className="font-semibold text-gold-light">
                        Level {tender.minBbbeeLevel} or better
                      </span>
                    </div>
                    {tender.cidbGrading && (
                      <div className="flex items-center justify-between text-mist/80">
                        <span className="text-mist/50">CIDB Grading:</span>
                        <span className="font-semibold text-white font-mono">
                          {tender.cidbGrading}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-mist/80">
                      <span className="text-mist/50">Host Community Mandate:</span>
                      <span
                        className={`font-semibold ${
                          tender.hostCommunityMandate ? 'text-turquoise-bright' : 'text-mist/50'
                        }`}
                      >
                        {tender.hostCommunityMandate ? 'Required (51%+ local JV)' : 'Recommended'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div>
                  <div className="flex items-center justify-between text-xs text-mist/60 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-mist/50" />
                      <span>Closes: {new Date(tender.closingDate).toLocaleDateString()}</span>
                    </div>
                    <span className="text-[11px] text-mist/50">
                      {tender.submissionsCount || 0} Bids Lodged
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenBidModal(tender)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gold hover:bg-gold-light text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-gold/20 hover:shadow-gold/30 transition-all cursor-pointer"
                  >
                    <span>Submit Tender Bid</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Protection & Anti-Corruption Notice */}
        <section className="mt-14 bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">
                Zero Tolerance for Procurement Irregularity &amp; Bribery
              </h4>
              <p className="text-xs text-mist/80 max-w-2xl leading-relaxed">
                Gold Fields enforces an uncompromised standard of ethics under King IV Principles. If any employee, agent, or representative solicits fees, gratuities, or advantages during this tender process, report it immediately on our zero-IP encrypted Whistleblower Hotline.
              </p>
            </div>
          </div>
          <Link
            href="/ethics"
            className="px-4 py-2.5 rounded-xl bg-navy-surface hover:bg-slate-700 border border-gold/30 text-gold-light hover:text-white text-xs font-semibold inline-flex items-center gap-2 transition shrink-0"
          >
            <span>Speak Up Hotline</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </section>
      </main>

      {/* Tender Bid Submission Modal */}
      {selectedTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-gold/30 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedTender(null)}
              className="absolute top-5 right-5 text-mist/50 hover:text-white transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {submittedRef ? (
              /* Success Confirmation View */
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Tender Bid Lodged Successfully</h3>
                <p className="text-xs text-mist/80 max-w-md mx-auto mb-6">
                  Your bid for RFP <strong className="text-white">{selectedTender.tenderNumber}</strong> has been timestamped and encrypted in our procurement vault.
                </p>

                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 max-w-sm mx-auto mb-6 text-left">
                  <div className="text-[10px] uppercase font-bold text-mist/50 mb-1">
                    Procurement Reference Code:
                  </div>
                  <div className="font-mono text-base font-extrabold text-gold-light">
                    {submittedRef}
                  </div>
                  <div className="text-[11px] text-mist/60 mt-1">
                    Quote this code in all correspondence with the Gold Fields Bid Evaluation Committee.
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTender(null)}
                  className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-slate-950 font-bold text-xs transition"
                >
                  Return to Tender Board
                </button>
              </div>
            ) : (
              /* Submission Form View */
              <div>
                <div className="mb-6">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gold-light mb-1">
                    Formal Request for Proposal
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedTender.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-mist/60 mt-1 font-mono">
                    <span>{selectedTender.tenderNumber}</span>
                    <span>&bull;</span>
                    <span>Min B-BBEE: Level {selectedTender.minBbbeeLevel}</span>
                  </div>
                </div>

                {bidError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{bidError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitBid} className="space-y-4">
                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-semibold text-mist/90 mb-1">
                      Registered Legal Vendor / Entity Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rand Western Engineering (Pty) Ltd"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-mist/40 focus:outline-none focus:border-gold"
                    />
                  </div>

                  {/* Statutory CIPC & SARS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-mist/90 mb-1">
                        CIPC Registration Number *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="YYYY/NNNNNN/NN (e.g. 2018/123456/07)"
                        value={cipcReg}
                        onChange={(e) => setCipcReg(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-mist/40 focus:outline-none focus:border-gold font-mono"
                      />
                      <span className="text-[10px] text-mist/50 mt-0.5 block">
                        Strict South African statutory format
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-mist/90 mb-1">
                        SARS Tax Compliance Status (TCS) PIN *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="9-10 Alphanumeric characters"
                        value={sarsPin}
                        onChange={(e) => setSarsPin(e.target.value.toUpperCase())}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-mist/40 focus:outline-none focus:border-gold font-mono uppercase"
                      />
                      <span className="text-[10px] text-mist/50 mt-0.5 block">
                        Verified via SARS eFiling system
                      </span>
                    </div>
                  </div>

                  {/* B-BBEE Level & Host Community */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-mist/90 mb-1">
                        B-BBEE Contributor Level *
                      </label>
                      <select
                        value={bbbeeLevel}
                        onChange={(e) => setBbbeeLevel(parseInt(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-gold"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => (
                          <option key={lvl} value={lvl}>
                            Level {lvl} {lvl === 1 ? '(135% Recognition)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hostCommunity}
                          onChange={(e) => setHostCommunity(e.target.checked)}
                          className="rounded border-slate-700 text-gold focus:ring-gold"
                        />
                        <span className="text-xs text-mist/90 select-none">
                          Host Community Resident / Local Vendor
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-mist/90 mb-1">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-mist/40 focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-mist/90 mb-1">
                        Corporate Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="tenders@vendor.co.za"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-mist/40 focus:outline-none focus:border-gold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-mist/90 mb-1">
                        Direct Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+27 11 000 0000"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-mist/40 focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>

                  {/* Commercial Bid Amount */}
                  <div>
                    <label className="block text-xs font-semibold text-mist/90 mb-1">
                      Indicative Tender Price / Proposed Bid Amount (ZAR, excl. VAT)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-mist/40 font-mono">
                        R
                      </span>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 14500000"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-xs text-white placeholder-mist/40 focus:outline-none focus:border-gold font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-mist/50 mt-0.5 block">
                      Optional at initial expression of interest stage; required for formal commercial adjudication.
                    </span>
                  </div>

                  {/* Legal Attestation */}
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-[11px] text-mist/70 leading-relaxed">
                    By submitting this bid, the tenderer warrants that all statutory certifications (CIPC, SARS TCS PIN, B-BBEE) are valid, and agrees to Gold Fields Supplier Code of Conduct and POPIA compliance protocols.
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedTender(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-mist/80 text-xs font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingBid}
                      className="px-6 py-2 rounded-xl bg-gold hover:bg-gold-light disabled:opacity-50 text-slate-950 text-xs font-bold transition flex items-center gap-2"
                    >
                      {submittingBid ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>Vetting &amp; Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Formal Tender Bid</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <BrandFooter />
    </div>
  );
}
