'use client';

import React, { useState, useEffect } from 'react';
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
  Plus,
  RefreshCw,
  X,
  BadgeCheck,
  Check,
  MapPin,
  TrendingUp,
  Download,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

interface Tender {
  id: string;
  clientId: string;
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
  createdAt: string;
  submissionsCount?: number;
}

interface TenderSubmission {
  id: string;
  tenderId: string;
  clientId: string;
  referenceCode: string;
  vendorName: string;
  cipcRegistrationNumber: string;
  sarsTaxPin: string;
  bbbeeLevel: number;
  hostCommunityRegistered: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  bidAmount: number | null;
  currency: string;
  status: 'submitted' | 'compliant' | 'shortlisted' | 'rejected' | 'awarded';
  complianceNotes: string | null;
  createdAt: string;
  tenderTitle?: string;
  tenderNumber?: string;
}

export default function AdminTendersPage() {
  const { activeClient } = useStudioWorkspace();
  const clientId = activeClient?.id || 'client_goldfields';

  const [activeTab, setActiveTab] = useState<'tenders' | 'submissions'>('tenders');
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [submissions, setSubmissions] = useState<TenderSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTenderFilter, setSelectedTenderFilter] = useState<string>('all');

  // Create Tender Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTenderNumber, setNewTenderNumber] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Mining Operations & Underground');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newEstimatedValue, setNewEstimatedValue] = useState<string>('');
  const [newClosingDate, setNewClosingDate] = useState<string>('');
  const [newMinBbbee, setNewMinBbbee] = useState<number>(4);
  const [newCidb, setNewCidb] = useState<string>('');
  const [newHostMandate, setNewHostMandate] = useState<boolean>(true);
  const [creatingTender, setCreatingTender] = useState<boolean>(false);

  // Selected Submission Detail
  const [selectedSubmission, setSelectedSubmission] = useState<TenderSubmission | null>(null);
  const [evaluatingStatus, setEvaluatingStatus] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [clientId, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tenders') {
        const res = await fetch(`/api/admin/tenders?clientId=${clientId}&view=tenders`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch tenders');
        setTenders(data.tenders || []);
      } else {
        const res = await fetch(`/api/admin/tenders?clientId=${clientId}&view=submissions`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch submissions');
        setSubmissions(data.submissions || []);
      }
    } catch (err: any) {
      console.error('Fetch tenders data error:', err);
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTender(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          tenderNumber: newTenderNumber,
          title: newTitle,
          category: newCategory,
          description: newDescription,
          estimatedValue: newEstimatedValue || undefined,
          closingDate: newClosingDate,
          minBbbeeLevel: newMinBbbee,
          cidbGrading: newCidb || undefined,
          hostCommunityMandate: newHostMandate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create tender');

      setFeedback({ message: `Tender ${newTenderNumber} published successfully.`, type: 'success' });
      setShowCreateModal(false);
      // Reset form
      setNewTenderNumber('');
      setNewTitle('');
      setNewDescription('');
      setNewEstimatedValue('');
      setNewClosingDate('');
      fetchData();
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setCreatingTender(false);
    }
  };

  const handleUpdateSubmissionStatus = async (
    submissionId: string,
    status: 'compliant' | 'shortlisted' | 'rejected' | 'awarded'
  ) => {
    setEvaluatingStatus(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/tenders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          status,
          notes: `Evaluated by Procurement Officer on ${new Date().toLocaleDateString()}. Status: ${status}.`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update submission');

      setFeedback({ message: `Submission marked as ${status}.`, type: 'success' });

      // Update local state
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? { ...s, status } : s))
      );
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission({ ...selectedSubmission, status });
      }
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setEvaluatingStatus(false);
    }
  };

  // Metrics
  const activeTendersCount = tenders.filter((t) => t.status === 'active').length;
  const totalSubmissionsCount = tenders.reduce((acc, t) => acc + (t.submissionsCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold-light text-xs font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            CIPC, SARS TCS PIN &amp; B-BBEE Procurement Engine
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Corporate Tender Management &amp; Bid Vetting Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Publish RFPs, adjudicate statutory company compliance, and evaluate vendor proposals with automated B-BBEE verification.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold hover:bg-gold-light text-slate-950 font-bold text-xs shadow-md shadow-gold/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish New RFP</span>
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-300'
              : 'bg-red-950/40 border border-red-800/50 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-mist/40 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0F141C] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Active RFPs Published</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-display">
            {activeTendersCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Tenant: {activeClient?.name || 'Gold Fields'}</div>
        </div>

        <div className="bg-white dark:bg-[#0F141C] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-medium text-gold">Total Vendor Bids Lodged</div>
          <div className="text-2xl font-bold text-gold mt-1 font-display">
            {totalSubmissionsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Across all active scopes</div>
        </div>

        <div className="bg-white dark:bg-[#0F141C] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Statutory Compliance Rate</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-display">
            100%
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Pre-validated via CIPC &amp; SARS</div>
        </div>

        <div className="bg-white dark:bg-[#0F141C] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-medium text-turquoise-bright">Public Portal Status</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live at /suppliers/tenders</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Accepting submissions</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('tenders')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'tenders'
              ? 'border-gold text-gold-dark dark:text-gold-light'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Active Tender RFPs ({tenders.length})
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'submissions'
              ? 'border-gold text-gold-dark dark:text-gold-light'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Vendor Bid Submissions ({submissions.length})
        </button>
      </div>

      {/* Tab 1: Tender RFPs */}
      {activeTab === 'tenders' && (
        <div className="bg-white dark:bg-[#0F141C] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Corporate Request for Proposals (RFPs)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">RFP Number</th>
                  <th className="p-3.5">Title &amp; Category</th>
                  <th className="p-3.5">Min B-BBEE</th>
                  <th className="p-3.5">Est. Value</th>
                  <th className="p-3.5">Closing Date</th>
                  <th className="p-3.5">Bids</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tenders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No corporate tenders published yet. Click "Publish New RFP" to launch.
                    </td>
                  </tr>
                ) : (
                  tenders.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                        {t.tenderNumber}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{t.title}</div>
                        <div className="text-[11px] text-slate-400">{t.category}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-gold/10 text-gold-dark dark:text-gold-light border border-gold/20">
                          Level {t.minBbbeeLevel}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono">
                        {t.estimatedValue || 'Schedule of Rates'}
                      </td>
                      <td className="p-3.5">
                        {new Date(t.closingDate).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 font-mono font-bold">
                        {t.submissionsCount || 0}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Vendor Bid Submissions */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0F141C] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Vendor Bid Proposals &amp; Statutory Dossiers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Ref Code</th>
                    <th className="p-3.5">Vendor Name</th>
                    <th className="p-3.5">CIPC Reg #</th>
                    <th className="p-3.5">SARS TCS PIN</th>
                    <th className="p-3.5">B-BBEE</th>
                    <th className="p-3.5">Host Community</th>
                    <th className="p-3.5">Bid Price</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Adjudication</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No vendor tender bids submitted yet. Bids lodged on /suppliers/tenders appear here automatically.
                      </td>
                    </tr>
                  ) : (
                    submissions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-mono font-bold text-gold-dark dark:text-gold-light">
                          {s.referenceCode}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                          <div>{s.vendorName}</div>
                          <div className="text-[10px] text-slate-400">{s.contactEmail} &bull; {s.contactPhone}</div>
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>{s.cipcRegistrationNumber}</span>
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 uppercase">
                            <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>{s.sarsTaxPin}</span>
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-gold/10 text-gold-dark dark:text-gold-light border border-gold/20">
                            Level {s.bbbeeLevel}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {s.hostCommunityRegistered ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-turquoise-bright bg-teal-950/60 border border-teal-800/40 flex items-center gap-1 w-fit">
                              <MapPin className="w-3 h-3" />
                              <span>Local Resident</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">National</span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono font-semibold text-slate-900 dark:text-white">
                          {s.bidAmount ? `R ${s.bidAmount.toLocaleString()}` : 'Rates only'}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              s.status === 'awarded'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300'
                                : s.status === 'shortlisted'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border border-purple-300'
                                : s.status === 'compliant'
                                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-300'
                                : s.status === 'rejected'
                                ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleUpdateSubmissionStatus(s.id, 'compliant')}
                              title="Mark Compliant"
                              className="p-1 rounded bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleUpdateSubmissionStatus(s.id, 'shortlisted')}
                              title="Shortlist for Committee"
                              className="p-1 rounded bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleUpdateSubmissionStatus(s.id, 'awarded')}
                              title="Award Contract"
                              className="p-1 rounded bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            >
                              <BadgeCheck className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleUpdateSubmissionStatus(s.id, 'rejected')}
                              title="Reject Bid"
                              className="p-1 rounded bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Publish RFP Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0F141C] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Publish New Corporate Tender RFP
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Create and publish an official Request for Proposals to the public supplier procurement portal.
            </p>

            <form onSubmit={handleCreateTender} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tender RFP Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="GF-2026-RFP-092"
                    value={newTenderNumber}
                    onChange={(e) => setNewTenderNumber(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Renewable Energy & Power">Renewable Energy &amp; Power</option>
                    <option value="Mining Operations & Underground">Mining Operations &amp; Underground</option>
                    <option value="Environmental & Tailings">Environmental &amp; Tailings</option>
                    <option value="Engineering & Construction">Engineering &amp; Construction</option>
                    <option value="Information Technology">Information Technology</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Scope Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Deep Solar Plant Expansion Phase II (40MW)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Scope Summary *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Full scope of engineering works, contractor deliverables, and statutory qualifications..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Value (ZAR)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. R45,000,000"
                    value={newEstimatedValue}
                    onChange={(e) => setNewEstimatedValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Closing Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newClosingDate}
                    onChange={(e) => setNewClosingDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Min B-BBEE Contributor Level
                  </label>
                  <select
                    value={newMinBbbee}
                    onChange={(e) => setNewMinBbbee(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Level {lvl}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CIDB Grading (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 8CE / 9GB"
                    value={newCidb}
                    onChange={(e) => setNewCidb(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={newHostMandate}
                    onChange={(e) => setNewHostMandate(e.target.checked)}
                    className="rounded text-gold focus:ring-gold"
                  />
                  <span>Enforce Host Community Economic Inclusion Mandate</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTender}
                  className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-light text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
                >
                  {creatingTender ? 'Publishing...' : 'Publish Live RFP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
