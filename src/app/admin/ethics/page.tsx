'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageSquare,
  Clock,
  User,
  Scale,
  Building2,
  Check,
  X,
  FileText,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  EyeOff,
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

interface WhistleblowerReport {
  id: string;
  clientId: string;
  trackingCode: string;
  category: string;
  severity: string;
  jurisdiction: string;
  subject: string;
  details: string;
  status: 'received' | 'under_investigation' | 'substantiated' | 'dismissed' | 'resolved';
  assignedInvestigatorId?: string | null;
  resolutionSummary?: string | null;
  createdAt: string;
  updatedAt: string;
  messagesCount?: number;
  messages?: Array<{
    id: string;
    senderType: 'whistleblower' | 'investigator';
    message: string;
    createdAt: string;
  }>;
}

export default function AdminEthicsPage() {
  const { activeClient } = useStudioWorkspace();
  const clientId = activeClient?.id || 'client_goldfields';

  const [reports, setReports] = useState<WhistleblowerReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedReport, setSelectedReport] = useState<WhistleblowerReport | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Status Update State
  const [newStatus, setNewStatus] = useState<string>('');
  const [resolutionSummary, setResolutionSummary] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  // Messaging State
  const [replyText, setReplyText] = useState<string>('');
  const [sendingReply, setSendingReply] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchReports();
  }, [clientId]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/ethics?clientId=${clientId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch reports');
      setReports(data.reports || []);
      if (data.reports?.length > 0 && !selectedReport) {
        setSelectedReport(data.reports[0]);
        setNewStatus(data.reports[0].status);
        setResolutionSummary(data.reports[0].resolutionSummary || '');
      }
    } catch (err: any) {
      console.error('Fetch ethics reports error:', err);
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReport = (r: WhistleblowerReport) => {
    setSelectedReport(r);
    setNewStatus(r.status);
    setResolutionSummary(r.resolutionSummary || '');
    setReplyText('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setUpdatingStatus(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/ethics/${selectedReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          resolutionSummary: resolutionSummary || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update report status');

      setFeedback({ message: 'Investigation status updated successfully', type: 'success' });
      // Update local state
      const updated = {
        ...selectedReport,
        status: newStatus as any,
        resolutionSummary: resolutionSummary || null,
      };
      setSelectedReport(updated);
      setReports(reports.map((r) => (r.id === updated.id ? updated : r)));
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendInvestigatorReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !replyText.trim()) return;

    setSendingReply(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/ethics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: selectedReport.id,
          message: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send encrypted message');

      setFeedback({ message: 'Encrypted response delivered to anonymous case thread.', type: 'success' });
      setReplyText('');

      // Append message to selectedReport
      const newMsg = {
        id: data.message?.id || String(Date.now()),
        senderType: 'investigator' as const,
        message: replyText.trim(),
        createdAt: new Date().toISOString(),
      };

      const updated = {
        ...selectedReport,
        messages: [...(selectedReport.messages || []), newMsg],
      };
      setSelectedReport(updated);
      setReports(reports.map((r) => (r.id === updated.id ? updated : r)));
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setSendingReply(false);
    }
  };

  // Metrics
  const totalCount = reports.length;
  const activeCount = reports.filter(
    (r) => r.status === 'received' || r.status === 'under_investigation'
  ).length;
  const highSeverityCount = reports.filter(
    (r) => r.severity === 'high' || r.severity === 'critical'
  ).length;
  const resolvedCount = reports.filter(
    (r) => r.status === 'resolved' || r.status === 'substantiated'
  ).length;

  const filteredReports = reports.filter((r) => {
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || r.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      r.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSeverity && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Compliance Assurance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5" />
            Protected Disclosures Act 26 of 2000 &bull; King IV Principle 1
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Confidential Ombudsman Triage &amp; Investigation Desk
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Encrypted disclosures inbox with zero-IP retention. Direct bidirectional confidential channel to anonymous reporters.
          </p>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition self-start md:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Reports</span>
        </button>
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

      {/* Metric Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0F141C] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Disclosures</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-display">
            {totalCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Tenant: {activeClient?.name || 'Gold Fields'}</div>
        </div>

        <div className="bg-white dark:bg-[#0F141C] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400">Active Enquiries</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-display">
            {activeCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Awaiting resolution</div>
        </div>

        <div className="bg-white dark:bg-[#0F141C] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-medium text-red-600 dark:text-red-400">High / Critical</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1 font-display">
            {highSeverityCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Requires Board notification</div>
        </div>

        <div className="bg-white dark:bg-[#0F141C] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Substantiated / Resolved</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-display">
            {resolvedCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Compliance closed</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#0F141C] p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tracking code, narrative, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="bribery_corruption">Bribery &amp; Corruption</option>
            <option value="environmental">Environmental Harm</option>
            <option value="fraud_financial">Fraud &amp; Financial Misconduct</option>
            <option value="health_safety">Health &amp; Safety</option>
            <option value="human_rights">Human Rights &amp; Labour</option>
            <option value="harassment">Harassment / Discrimination</option>
            <option value="other">Other / Governance</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="received">Received</option>
            <option value="under_investigation">Under Investigation</option>
            <option value="substantiated">Substantiated</option>
            <option value="dismissed">Dismissed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout: Report List & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Report List */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0F141C] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Disclosures ({filteredReports.length})
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
              <EyeOff className="w-3 h-3" />
              <span>Zero-IP Logging</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[700px] overflow-y-auto">
            {filteredReports.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                No whistleblower reports match your criteria.
              </div>
            ) : (
              filteredReports.map((r) => {
                const isSelected = selectedReport?.id === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => handleSelectReport(r)}
                    className={`w-full text-left p-3.5 transition flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {r.trackingCode}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          r.severity === 'critical'
                            ? 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 border border-red-300'
                            : r.severity === 'high'
                            ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {r.severity}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {r.subject}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{r.category.replace('_', ' ').toUpperCase()}</span>
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Report Inspector & Thread */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0F141C] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {selectedReport ? (
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                      {selectedReport.trackingCode}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Jurisdiction: {selectedReport.jurisdiction}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedReport.subject}
                  </h2>
                  <div className="text-xs text-slate-400 mt-1">
                    Received: {new Date(selectedReport.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="shrink-0">
                  <span
                    className={`inline-block text-xs font-bold uppercase px-3 py-1 rounded-full ${
                      selectedReport.status === 'resolved' || selectedReport.status === 'substantiated'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300'
                        : selectedReport.status === 'under_investigation'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {selectedReport.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Decrypted Incident Narrative */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Confidential Narrative (AES-256-GCM Decrypted)
                </h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedReport.details}
                </div>
              </div>

              {/* Investigation Status & Outcome Logger */}
              <form
                onSubmit={handleUpdateStatus}
                className="p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Investigation Outcome &amp; Status
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Case Status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="received">Received / Intake</option>
                      <option value="under_investigation">Under Formal Investigation</option>
                      <option value="substantiated">Substantiated (Violations Found)</option>
                      <option value="dismissed">Dismissed (Unsubstantiated)</option>
                      <option value="resolved">Resolved &amp; Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Resolution Findings Summary
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Audit completed, disciplinary sanctions issued..."
                      value={resolutionSummary}
                      onChange={(e) => setResolutionSummary(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updatingStatus}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
                  >
                    {updatingStatus ? 'Updating...' : 'Save Case Resolution'}
                  </button>
                </div>
              </form>

              {/* Bidirectional Encrypted Dialogue Channel */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Encrypted Whistleblower Dialogue</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    AES-256 Bidirectional Wire
                  </span>
                </div>

                {/* Messages Thread */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  {(!selectedReport.messages || selectedReport.messages.length === 0) ? (
                    <div className="text-center text-xs text-slate-400 py-4">
                      No dialogue messages yet. Send an enquiry or update to the anonymous whistleblower below.
                    </div>
                  ) : (
                    selectedReport.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl text-xs max-w-[85%] ${
                          m.senderType === 'investigator'
                            ? 'ml-auto bg-emerald-600 text-white'
                            : 'mr-auto bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-80">
                          <span className="font-semibold uppercase tracking-wider">
                            {m.senderType === 'investigator' ? 'Compliance Ombudsman' : 'Anonymous Reporter'}
                          </span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Reply Input */}
                <form onSubmit={handleSendInvestigatorReply} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Send confidential query or instruction to reporter..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-xs text-slate-400">
              Select a whistleblower case from the left panel to inspect details and respond.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
