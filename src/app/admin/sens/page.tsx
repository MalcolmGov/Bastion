'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Newspaper,
  Calendar,
  CalendarDays,
  FileSpreadsheet,
  Download,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Building2,
  TrendingUp,
  FileText,
  Calculator,
  Lock,
  Share2,
  Trash2,
  X,
  ChevronRight,
  Sparkles,
  Printer
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import type { SensAnnouncement, SensType, FinancialCalendarEvent, CalendarEventType, InvestorReport, ReportType } from '@/lib/ir/types';
import { SENS_TYPE_LABELS, SENS_TYPE_COLORS, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, REPORT_TYPE_LABELS, calculateDividendTax } from '@/lib/ir/types';

export default function SensAndIrHubPage() {
  const { activeClient, activeSite } = useStudioWorkspace();

  const [activeTab, setActiveTab] = useState<'sens' | 'calendar' | 'reports'>('sens');
  const [loading, setLoading] = useState(true);

  // SENS State
  const [announcements, setAnnouncements] = useState<SensAnnouncement[]>([]);
  const [sensSearch, setSensSearch] = useState('');
  const [sensTypeFilter, setSensTypeFilter] = useState<string>('all');
  const [priceSensitiveOnly, setPriceSensitiveOnly] = useState(false);
  const [selectedSens, setSelectedSens] = useState<SensAnnouncement | null>(null);
  const [showCreateSensModal, setShowCreateSensModal] = useState(false);

  // New SENS Form State
  const [newHeadline, setNewHeadline] = useState('');
  const [newType, setNewType] = useState<SensType>('trading_statement');
  const [newJseCode, setNewJseCode] = useState('JSE: GFI');
  const [newIsin, setNewIsin] = useState('ZAE000018123');
  const [newBodyHtml, setNewBodyHtml] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newIsPriceSensitive, setNewIsPriceSensitive] = useState(true);
  const [newSponsor, setNewSponsor] = useState('J.P. Morgan Equities South Africa (Pty) Ltd');
  const [submittingSens, setSubmittingSens] = useState(false);

  // Calendar State
  const [events, setEvents] = useState<FinancialCalendarEvent[]>([]);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<CalendarEventType>('results_announcement');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00 SAST');
  const [newEventLocation, setNewEventLocation] = useState('Johannesburg & Virtual Global Webcast');
  const [newEventDividendCents, setNewEventDividendCents] = useState<string>('');
  const [submittingEvent, setSubmittingEvent] = useState(false);

  // Reports State
  const [reports, setReports] = useState<any[]>([]);

  // Dividend Calculator State
  const [calculatorShares, setCalculatorShares] = useState<number>(10000);
  const [selectedDividendCents, setSelectedDividendCents] = useState<number>(350);

  // Auto-adjust default JSE code according to active client
  useEffect(() => {
    if (activeClient?.id?.includes('vodacom')) {
      setNewJseCode('JSE: VOD');
      setNewIsin('ZAE000132577');
      setNewSponsor('Nedbank Corporate and Investing Banking');
    } else {
      setNewJseCode('JSE: GFI');
      setNewIsin('ZAE000018123');
      setNewSponsor('J.P. Morgan Equities South Africa (Pty) Ltd');
    }
  }, [activeClient?.id]);

  // Fetch announcements, events & reports
  const fetchData = async () => {
    if (!activeClient?.id) return;
    setLoading(true);
    try {
      const [sensRes, calRes, repRes] = await Promise.all([
        fetch(`/api/admin/ir/sens?clientId=${activeClient.id}`),
        fetch(`/api/admin/ir/calendar?clientId=${activeClient.id}`),
        fetch(`/api/admin/ir/reports?clientId=${activeClient.id}`),
      ]);

      if (sensRes.ok) {
        const data = await sensRes.json();
        setAnnouncements(data.announcements || []);
      }
      if (calRes.ok) {
        const data = await calRes.json();
        setEvents(data.events || []);
      }
      if (repRes.ok) {
        const data = await repRes.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error('Failed to load IR data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeClient?.id]);

  // Filtered SENS
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      if (sensTypeFilter !== 'all' && a.announcementType !== sensTypeFilter) return false;
      if (priceSensitiveOnly && !a.isPriceSensitive) return false;
      if (sensSearch.trim()) {
        const q = sensSearch.toLowerCase();
        return a.headline.toLowerCase().includes(q) || (a.summary && a.summary.toLowerCase().includes(q));
      }
      return true;
    });
  }, [announcements, sensTypeFilter, priceSensitiveOnly, sensSearch]);

  // Handle SENS creation
  const handleCreateSens = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHeadline || !newBodyHtml) return;

    setSubmittingSens(true);
    try {
      const res = await fetch('/api/admin/ir/sens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: activeClient?.id,
          siteId: activeSite?.id,
          headline: newHeadline,
          announcementType: newType,
          jseCode: newJseCode,
          isinCode: newIsin,
          bodyHtml: newBodyHtml,
          summary: newSummary || newHeadline,
          isPriceSensitive: newIsPriceSensitive,
          sponsor: newSponsor,
          releasedAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setShowCreateSensModal(false);
        setNewHeadline('');
        setNewBodyHtml('');
        setNewSummary('');
        await fetchData();
      }
    } catch (err) {
      console.error('Error creating SENS:', err);
    } finally {
      setSubmittingSens(false);
    }
  };

  // Handle Calendar event creation
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;

    setSubmittingEvent(true);
    try {
      const res = await fetch('/api/admin/ir/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: activeClient?.id,
          siteId: activeSite?.id,
          title: newEventTitle,
          eventType: newEventType,
          eventDate: newEventDate,
          timeSast: newEventTime,
          location: newEventLocation,
          dividendRateCents: newEventDividendCents ? parseFloat(newEventDividendCents) : undefined,
        }),
      });

      if (res.ok) {
        setShowCreateEventModal(false);
        setNewEventTitle('');
        setNewEventDate('');
        setNewEventDividendCents('');
        await fetchData();
      }
    } catch (err) {
      console.error('Error creating event:', err);
    } finally {
      setSubmittingEvent(false);
    }
  };

  // Delete SENS
  const handleDeleteSens = async (id: string) => {
    if (!confirm('Are you sure you want to retract and delete this SENS announcement?')) return;
    try {
      const res = await fetch(`/api/admin/ir/sens/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        if (selectedSens?.id === id) setSelectedSens(null);
      }
    } catch (err) {
      console.error('Error deleting SENS:', err);
    }
  };

  // Calculate dividend for interactive widget
  const dividendCalc = useMemo(() => {
    return calculateDividendTax(selectedDividendCents, calculatorShares, 0.2);
  }, [selectedDividendCents, calculatorShares]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* HEADER SECTION */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0E1522] border border-slate-200/90 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  JSE SENS &amp; Investor Relations Command
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950 font-mono">
                  JSE LISTINGS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Stock Exchange News Service disclosures, financial calendar, and dividend distribution for{' '}
                <strong className="text-slate-700 dark:text-slate-200">{activeClient?.name || 'Corporate Fleet'}</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {activeTab === 'sens' ? (
            <button
              onClick={() => setShowCreateSensModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>New SENS Release</span>
            </button>
          ) : (
            <button
              onClick={() => setShowCreateEventModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add IR Event</span>
            </button>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* NAVIGATION TABS */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('sens')}
          className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'sens'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>SENS Regulatory Disclosures</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {announcements.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'calendar'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Financial Calendar &amp; Dividend Hub</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {events.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'reports'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Results Presentations &amp; Downloads</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {reports.length}
          </span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: SENS ANNOUNCEMENTS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'sens' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0E1522] p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={sensSearch}
                onChange={(e) => setSensSearch(e.target.value)}
                placeholder="Search SENS announcements, keywords or headline..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={sensTypeFilter}
                onChange={(e) => setSensTypeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium"
              >
                <option value="all">All Regulatory Categories</option>
                <option value="results">Financial Results</option>
                <option value="trading_statement">Trading Statements</option>
                <option value="dividend">Dividend Declarations</option>
                <option value="directorate">Board &amp; Directorate</option>
                <option value="esg_tailings">ESG &amp; Tailings</option>
              </select>

              <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={priceSensitiveOnly}
                  onChange={(e) => setPriceSensitiveOnly(e.target.checked)}
                  className="rounded text-sky-500 focus:ring-0"
                />
                <span className="text-[11px] text-red-600 dark:text-red-400 font-bold uppercase">Price-Sensitive</span>
              </label>
            </div>
          </div>

          {/* SENS Items List */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading SENS releases...</div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0E1522] border border-slate-200/90 dark:border-slate-800 space-y-2">
              <Newspaper className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No SENS announcements found</div>
              <p className="text-xs text-slate-500">Create a new regulatory announcement or adjust your search filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAnnouncements.map((item) => {
                const color = SENS_TYPE_COLORS[item.announcementType] || SENS_TYPE_COLORS.general;
                const typeLabel = SENS_TYPE_LABELS[item.announcementType] || 'Corporate Announcement';
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#0E1522] border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                          {item.jseCode}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${color.bg} ${color.text} ${color.border}`}>
                          {typeLabel}
                        </span>
                        {item.isPriceSensitive && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400 border border-red-300 dark:border-red-800/60 animate-pulse">
                            <ShieldAlert className="w-3 h-3" />
                            Price Sensitive
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 font-mono">
                          {new Date(item.releasedAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })} SAST
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {item.headline}
                      </h3>

                      {item.summary && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {item.summary}
                        </p>
                      )}

                      <div className="text-[11px] text-slate-400 flex items-center space-x-2 pt-1 font-sans">
                        <span>JSE Sponsor: <strong className="text-slate-600 dark:text-slate-300 font-semibold">{item.sponsor}</strong></span>
                        {item.isinCode && (
                          <>
                            <span>&bull;</span>
                            <span>ISIN: <strong className="font-mono text-slate-600 dark:text-slate-300">{item.isinCode}</strong></span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => setSelectedSens(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Read Official SENS</span>
                      </button>

                      {item.pdfUrl && (
                        <a
                          href={item.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                          title="Download Official PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}

                      <button
                        onClick={() => handleDeleteSens(item.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 transition"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: FINANCIAL CALENDAR & DIVIDEND HUB */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Events Timeline (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Upcoming Investor Relations Events &amp; Results Timeline
              </h2>
            </div>

            {events.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0E1522] border border-slate-200/90 dark:border-slate-800 space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No events scheduled</div>
                <p className="text-xs text-slate-500">Add an AGM, Financial Results announcement or dividend payment date.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((ev) => {
                  const color = EVENT_TYPE_COLORS[ev.eventType] || EVENT_TYPE_COLORS.results_announcement;
                  const typeLabel = EVENT_TYPE_LABELS[ev.eventType] || 'Corporate Event';
                  return (
                    <div
                      key={ev.id}
                      className="p-5 rounded-2xl bg-white dark:bg-[#0E1522] border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${color.bg} ${color.text} ${color.border}`}>
                            {typeLabel}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {ev.eventDate} ({ev.timeSast})
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {ev.title}
                        </h3>

                        {ev.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {ev.description}
                          </p>
                        )}

                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                          {ev.location && <span>Location: <strong>{ev.location}</strong></span>}
                          {ev.dividendRateCents && (
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                              Dividend: <strong>{ev.dividendRateCents} SA cents per share</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {/* 1-Click iCalendar Download */}
                        <a
                          href={`/api/admin/ir/calendar/${ev.id}/ics`}
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 transition"
                          title="Download Apple / Google / Outlook Calendar (.ics)"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Add to Calendar (.ics)</span>
                        </a>

                        {ev.webcastUrl && (
                          <a
                            href={ev.webcastUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Webcast Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive South African Dividend Calculator (1 col) */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1522] border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    South African Dividend Calculator
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Statutory 20% DWT under Section 64E of Income Tax Act
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Dividend Rate (SA Cents / Share)
                  </label>
                  <input
                    type="number"
                    value={selectedDividendCents}
                    onChange={(e) => setSelectedDividendCents(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Number of Ordinary Shares Held
                  </label>
                  <input
                    type="number"
                    value={calculatorShares}
                    onChange={(e) => setCalculatorShares(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                {/* Calculation Output Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Gross Dividend Distribution:</span>
                    <strong className="font-mono text-slate-900 dark:text-slate-100">
                      R {dividendCalc.grossDividendRands.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>

                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Dividend Withholding Tax (20% DWT):</span>
                    <strong className="font-mono">
                      - R {dividendCalc.dwtTaxRands.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
                    <span>Net Payable to Shareholder:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base font-black">
                      R {dividendCalc.netDividendRands.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 leading-tight">
                  * Note: South African exempt entities (companies and pension funds) may submit DWT exemption declaration forms to claim 100% gross disbursement.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: INVESTOR REPORTS & DOWNLOADS */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0E1522] border border-slate-200/90 dark:border-slate-800 space-y-3 flex flex-col justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>FY {rep.fiscalYear} &bull; {rep.period}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold uppercase text-[9px]">
                      {rep.reportType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {rep.title}
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {(rep.filesizeBytes / (1024 * 1024)).toFixed(1)} MB PDF
                  </span>
                  <a
                    href={rep.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* SENS OFFICIAL READER MODAL (JSE EXCHANGE FORMAT) */}
      {/* ───────────────────────────────────────────────────────────── */}
      {selectedSens && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-[#0B1019] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col">
            {/* Modal Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-black uppercase bg-slate-900 text-white dark:bg-amber-400 dark:text-slate-950">
                  {selectedSens.jseCode}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  RELEASED: {new Date(selectedSens.releasedAt).toLocaleString('en-ZA')} SAST
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  title="Print / PDF"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedSens(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official JSE SENS Layout Body */}
            <div className="flex-1 overflow-y-auto py-6 space-y-4 font-serif text-sm leading-relaxed">
              <div className="text-center space-y-1 pb-4 border-b border-slate-100 dark:border-slate-800 font-sans">
                <div className="text-base font-black tracking-wider uppercase text-slate-900 dark:text-white">
                  {activeClient?.name || 'Gold Fields Limited'}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  (Incorporated in the Republic of South Africa) &bull; Reg: 1968/004880/06 &bull; JSE: {selectedSens.jseCode.replace('JSE: ', '')} &bull; ISIN: {selectedSens.isinCode || 'ZAE000018123'}
                </div>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase pt-1">
                  (&quot;The Company&quot; or &quot;The Group&quot;)
                </div>
              </div>

              <h2 className="text-lg font-bold font-sans text-slate-900 dark:text-white pt-2">
                {selectedSens.headline}
              </h2>

              {selectedSens.isPriceSensitive && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 font-sans text-xs text-red-800 dark:text-red-300">
                  <strong>JSE PRICE-SENSITIVE REGULATORY DISCLOSURE:</strong> Shareholders and the investing public are advised that this announcement contains material, non-public corporate information.
                </div>
              )}

              <div
                className="prose dark:prose-invert max-w-none text-xs leading-relaxed"
                dangerouslySetInnerHTML={{ __html: selectedSens.bodyHtml }}
              />

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 font-sans text-xs space-y-1 text-slate-500">
                <div>Johannesburg, South Africa</div>
                <div>{new Date(selectedSens.releasedAt).toLocaleDateString('en-ZA', { dateStyle: 'full' })}</div>
                <div className="pt-2 font-semibold">
                  JSE Sponsor: <strong className="text-slate-800 dark:text-slate-200">{selectedSens.sponsor}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* NEW SENS ANNOUNCEMENT MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showCreateSensModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0E1522] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <Newspaper className="w-5 h-5 text-sky-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Publish SENS Regulatory Announcement
                </h3>
              </div>
              <button
                onClick={() => setShowCreateSensModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSens} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  SENS Headline / Announcement Subject
                </label>
                <input
                  type="text"
                  required
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  placeholder="e.g. Reviewed Financial Results for the Six Months Ended 30 June 2026 and Interim Dividend"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Announcement Category
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as SensType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="results">Financial Results</option>
                    <option value="trading_statement">JSE Trading Statement</option>
                    <option value="dividend">Dividend Declaration</option>
                    <option value="directorate">Board / Directorate</option>
                    <option value="esg_tailings">ESG &amp; Tailings</option>
                    <option value="general">General Corporate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    JSE Stock Ticker Code
                  </label>
                  <input
                    type="text"
                    value={newJseCode}
                    onChange={(e) => setNewJseCode(e.target.value)}
                    placeholder="e.g. JSE: GFI"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    ISIN Identifier
                  </label>
                  <input
                    type="text"
                    value={newIsin}
                    onChange={(e) => setNewIsin(e.target.value)}
                    placeholder="e.g. ZAE000018123"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Summary / Executive Extract
                </label>
                <input
                  type="text"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Key metrics summary displayed on mobile newsfeed..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Full Announcement Text / HTML Body
                </label>
                <textarea
                  required
                  rows={6}
                  value={newBodyHtml}
                  onChange={(e) => setNewBodyHtml(e.target.value)}
                  placeholder="<p>Gold Fields Limited is pleased to announce...</p>"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    JSE Equity Sponsor
                  </label>
                  <input
                    type="text"
                    value={newSponsor}
                    onChange={(e) => setNewSponsor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="price_sens"
                    checked={newIsPriceSensitive}
                    onChange={(e) => setNewIsPriceSensitive(e.target.checked)}
                    className="rounded text-red-500 focus:ring-0"
                  />
                  <label htmlFor="price_sens" className="text-xs font-bold text-red-600 dark:text-red-400 cursor-pointer">
                    Flag as JSE Price-Sensitive Disclosure
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateSensModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSens}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {submittingSens ? 'Publishing...' : 'Publish to SENS Wire'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* NEW CALENDAR EVENT MODAL */}
      {/* ───────────────────────────────────────────────────────────── */}
      {showCreateEventModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E1522] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-sky-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Financial Calendar Event
                </h3>
              </div>
              <button onClick={() => setShowCreateEventModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. 2026 Annual General Meeting (AGM)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Event Type
                  </label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as CalendarEventType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="results_announcement">Results Announcement</option>
                    <option value="agm">AGM</option>
                    <option value="capital_markets_day">Capital Markets Day</option>
                    <option value="dividend_dates">Dividend Dates</option>
                    <option value="webcast">Webcast / Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Date (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Time (SAST)
                  </label>
                  <input
                    type="text"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Dividend Rate (Optional Cents)
                  </label>
                  <input
                    type="number"
                    value={newEventDividendCents}
                    onChange={(e) => setNewEventDividendCents(e.target.value)}
                    placeholder="e.g. 350"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070A0F] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateEventModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEvent}
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {submittingEvent ? 'Saving...' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
