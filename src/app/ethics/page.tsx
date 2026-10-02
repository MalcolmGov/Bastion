'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  EyeOff,
  AlertTriangle,
  Send,
  Search,
  CheckCircle2,
  Copy,
  MessageSquare,
  FileText,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { BrandHeader } from '@/components/brand/BrandHeader';
import { BrandFooter } from '@/components/brand/BrandFooter';

interface CaseStatus {
  id: string;
  trackingCode: string;
  category: string;
  severity: string;
  status: string;
  subject: string;
  details: string;
  createdAt: string;
  resolutionSummary?: string | null;
}

interface CaseMessage {
  id: string;
  senderType: 'whistleblower' | 'investigator';
  message: string;
  createdAt: string;
}

export default function WhistleblowerPage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');

  // Submission Form State
  const [category, setCategory] = useState<string>('bribery_corruption');
  const [severity, setSeverity] = useState<string>('medium');
  const [jurisdiction, setJurisdiction] = useState<string>('ZA');
  const [subject, setSubject] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [incidentDate, setIncidentDate] = useState<string>('');
  const [involvedParties, setInvolvedParties] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Success Modal Credentials
  const [credentials, setCredentials] = useState<{
    trackingCode: string;
    accessKey: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Tracking State
  const [trackCode, setTrackCode] = useState<string>('');
  const [trackKey, setTrackKey] = useState<string>('');
  const [trackingLoading, setTrackingLoading] = useState<boolean>(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [activeCase, setActiveCase] = useState<{
    report: CaseStatus;
    messages: CaseMessage[];
  } | null>(null);

  // Reply State
  const [replyText, setReplyText] = useState<string>('');
  const [replyLoading, setReplyLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !details.trim()) {
      setSubmitError('Subject and detailed narrative are required.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/ethics/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          severity,
          jurisdiction,
          subject,
          details,
          incidentDate: incidentDate || undefined,
          involvedParties: involvedParties || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report.');
      }

      setCredentials({
        trackingCode: data.trackingCode,
        accessKey: data.accessKey,
      });

      // Clear form
      setSubject('');
      setDetails('');
      setIncidentDate('');
      setInvolvedParties('');
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackCode.trim() || !trackKey.trim()) {
      setTrackError('Both Tracking Code and Access Key are required.');
      return;
    }

    setTrackingLoading(true);
    setTrackError(null);

    try {
      const res = await fetch('/api/ethics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingCode: trackCode.trim(),
          accessKey: trackKey.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Case not found or invalid credentials.');
      }

      setActiveCase({
        report: data.report,
        messages: data.messages || [],
      });
    } catch (err: any) {
      setTrackError(err.message || 'Verification failed.');
      setActiveCase(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeCase) return;

    setReplyLoading(true);
    try {
      const res = await fetch('/api/ethics/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingCode: activeCase.report.trackingCode,
          accessKey: trackKey.trim(),
          message: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reply.');

      setActiveCase({
        ...activeCase,
        messages: [...activeCase.messages, data.message],
      });
      setReplyText('');
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setReplyLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!credentials) return;
    const text = `Tracking Code: ${credentials.trackingCode}\nAccess Key: ${credentials.accessKey}\nPortal: ${window.location.origin}/ethics`;
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <BrandHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Masthead Banner */}
        <div className="mb-10 text-center sm:text-left sm:flex sm:items-center sm:justify-between border-b border-slate-800 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Protected Disclosures Act 26 of 2000 & King IV Compliant
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Speak Up: Anonymous Ethics & Fraud Hotline
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
              An independent, end-to-end encrypted channel for reporting bribery, corruption, health & safety violations, and governance malpractice.
            </p>
          </div>

          <div className="mt-6 sm:mt-0 flex flex-col items-center sm:items-end gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-mono">
              <EyeOff className="w-4 h-4" />
              Zero IP Address Logging
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              AES-256-GCM Vault Encryption
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('submit')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'submit'
                ? 'border-gold text-gold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Submit Confidential Report
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('track')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'track'
                ? 'border-gold text-gold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Track Existing Case & Dialogue
          </button>
        </div>

        {/* Tab 1: Submit Anonymous Report */}
        {activeTab === 'submit' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">Absolute Anonymity Assured</p>
                <p className="mt-0.5 text-amber-200/90 leading-relaxed">
                  You are not asked for your name, email, or telephone. Your IP address is never recorded or logged. Upon submission, you will be issued a private <strong>Tracking Code</strong> and <strong>Access Key</strong> to track your report and converse securely with the independent ombudsman.
                </p>
              </div>
            </div>

            {submitError && (
              <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-sm text-rose-300">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Category of Concern *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-gold"
                  >
                    <option value="bribery_corruption">Bribery & Corruption</option>
                    <option value="tender_irregularity">Tender & Procurement Irregularity</option>
                    <option value="financial_fraud">Financial Fraud & Theft</option>
                    <option value="health_safety">Health & Safety Violation</option>
                    <option value="environmental">Environmental Non-Compliance</option>
                    <option value="harassment_discrimination">Harassment & Discrimination</option>
                    <option value="other">Other Governance Violation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Jurisdiction / Mine
                  </label>
                  <select
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-gold"
                  >
                    <option value="ZA">South Africa (South Deep / Corporate)</option>
                    <option value="GH">Ghana (Tarkwa & Damang)</option>
                    <option value="AU">Australia (St Ives, Agnew, Gruyere)</option>
                    <option value="PE">Americas (Cerro Corona / Salares Norte)</option>
                    <option value="GLOBAL">Global / Group Level</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Estimated Urgency / Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-gold"
                  >
                    <option value="low">Low (Administrative query)</option>
                    <option value="medium">Medium (Procedural concern)</option>
                    <option value="high">High (Material financial/safety breach)</option>
                    <option value="critical">Critical (Imminent danger / criminal fraud)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Summary / Incident Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Irregular contractor procurement tender award at West Shaft"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Approximate Date / Period
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mid-August 2026 or ongoing"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Involved Parties / Department (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Procurement Officer, Metallurgy Division"
                    value={involvedParties}
                    onChange={(e) => setInvolvedParties(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Detailed Narrative & Evidence Summary *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Please describe what happened in as much detail as possible: what occurred, where, who was involved, and any specific documents, emails, or transactions that can corroborate this report..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-sm text-slate-100 focus:outline-none focus:border-gold leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-gold hover:bg-gold-light px-6 py-3 text-sm font-bold text-slate-950 transition-colors disabled:opacity-60 shadow-lg shadow-gold/20"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Encrypting & Transmitting…' : 'Submit Confidential Report'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Track Existing Case */}
        {activeTab === 'track' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white mb-2">Track Case & Converse with Ombudsman</h2>
              <p className="text-sm text-slate-400 mb-6">
                Enter your issued Tracking Code and Access Key to inspect the investigation status and securely reply to questions.
              </p>

              {trackError && (
                <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-sm text-rose-300">
                  {trackError}
                </div>
              )}

              <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
                <input
                  type="text"
                  required
                  placeholder="Tracking Code (e.g. ETH-2026-X89J2)"
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-gold"
                />
                <input
                  type="password"
                  required
                  placeholder="Access Key (ak_...)"
                  value={trackKey}
                  onChange={(e) => setTrackKey(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-gold"
                />
                <button
                  type="submit"
                  disabled={trackingLoading}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-5 py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {trackingLoading ? 'Verifying…' : 'Verify'}
                </button>
              </form>
            </div>

            {/* Active Case Review & Dialogue */}
            {activeCase && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-mono uppercase text-slate-500">Case Reference</span>
                    <h3 className="text-xl font-bold font-mono text-gold">{activeCase.report.trackingCode}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        activeCase.report.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : activeCase.report.status === 'under_investigation'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {activeCase.report.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white text-base">{activeCase.report.subject}</h4>
                  <p className="mt-2 text-sm text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
                    {activeCase.report.details}
                  </p>
                </div>

                {activeCase.report.resolutionSummary && (
                  <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/30 p-4 text-sm text-emerald-200">
                    <p className="font-bold text-emerald-300">Ombudsman Resolution Summary:</p>
                    <p className="mt-1 leading-relaxed">{activeCase.report.resolutionSummary}</p>
                  </div>
                )}

                {/* Encrypted Dialogue History */}
                <div className="border-t border-slate-800 pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gold" />
                    Encrypted Case Dialogue ({activeCase.messages.length})
                  </h4>

                  {activeCase.messages.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No messages exchanged yet. You can post an update below.</p>
                  ) : (
                    <div className="space-y-3 mb-6">
                      {activeCase.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 rounded-2xl max-w-xl text-sm ${
                            msg.senderType === 'whistleblower'
                              ? 'ml-auto bg-amber-500/10 border border-amber-500/20 text-amber-100'
                              : 'mr-auto bg-slate-800 border border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] opacity-70 mb-1">
                            <span>{msg.senderType === 'whistleblower' ? 'You (Anonymous)' : 'Compliance Ombudsman'}</span>
                            <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Input */}
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="Send an anonymous message or clarify details for the ombudsman..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') void handleSendReply();
                      }}
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-gold"
                    />
                    <button
                      type="button"
                      onClick={handleSendReply}
                      disabled={replyLoading || !replyText.trim()}
                      className="rounded-xl bg-gold hover:bg-gold-light px-4 py-2.5 text-xs font-bold text-slate-950 transition-colors disabled:opacity-50"
                    >
                      {replyLoading ? 'Sending…' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Credentials Reveal Modal */}
        {credentials && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
                <div>
                  <h3 className="text-xl font-bold text-white">Report Successfully Encrypted</h3>
                  <p className="text-xs text-slate-400">Your protected disclosure has been safely filed.</p>
                </div>
              </div>

              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs text-amber-200">
                <p className="font-bold text-amber-300">CRITICAL: Save These Credentials</p>
                <p className="mt-1">
                  Because no personal identifiers or emails are kept, <strong>these credentials cannot be recovered or reset</strong> if lost.
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Case Tracking Code</span>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-gold font-bold text-base flex items-center justify-between">
                    <span>{credentials.trackingCode}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-1">Confidential Access Key</span>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 break-all flex items-center justify-between">
                    <span>{credentials.accessKey}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={copyCredentials}
                  className="flex-1 rounded-xl bg-gold hover:bg-gold-light py-3 px-4 text-xs font-bold text-slate-950 flex items-center justify-center gap-2 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {copiedKey ? 'Copied to Clipboard!' : 'Copy Credentials to Clipboard'}
                </button>
                <button
                  type="button"
                  onClick={() => setCredentials(null)}
                  className="rounded-xl border border-slate-700 hover:bg-slate-800 py-3 px-4 text-xs font-semibold text-slate-300"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <BrandFooter />
    </div>
  );
}
