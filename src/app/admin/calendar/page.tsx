'use client';

import React, { useEffect, useState } from 'react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import { useDashboardCustomizer } from '@/components/admin/DashboardCustomizerProvider';
import {
  Calendar,
  CalendarCheck,
  Clock,
  Video,
  MapPin,
  Download,
  Plus,
  Trash2,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Filter,
  Layers,
  Info
} from 'lucide-react';
import {
  CalendarEventType,
  FinancialCalendarEvent,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_COLORS,
  calculateDividendTax
} from '@/lib/ir/types';

export default function AdminCalendarPage() {
  const { activeClient } = useStudioWorkspace();
  const { primaryColor } = useDashboardCustomizer();

  const [events, setEvents] = useState<FinancialCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Event Form State
  const [formTitle, setFormTitle] = useState('');
  const [formEventType, setFormEventType] = useState<CalendarEventType>('results_announcement');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('10:00 SAST');
  const [formLocation, setFormLocation] = useState('Johannesburg & Live Global Webcast');
  const [formWebcastUrl, setFormWebcastUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDividendRate, setFormDividendRate] = useState<string>('');

  const loadEvents = async () => {
    try {
      setLoading(true);
      const query = activeClient?.id ? `?clientId=${encodeURIComponent(activeClient.id)}` : '';
      const res = await fetch(`/api/admin/ir/calendar${query}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Failed to load IR calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [activeClient?.id]);

  const filteredEvents = events.filter((ev) => {
    if (activeFilter === 'all') return true;
    return ev.eventType === activeFilter;
  });

  // Calculate Next Upcoming Event for Top Spotlight Banner
  const nowStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = events
    .filter((e) => e.eventDate >= nowStr)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

  // Handle Create Event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDate) {
      setFeedbackMsg({ type: 'error', text: 'Event Title and Date are mandatory.' });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: formTitle.trim(),
        eventType: formEventType,
        eventDate: formDate,
        timeSast: formTime.trim() || '10:00 SAST',
        location: formLocation.trim() || undefined,
        webcastUrl: formWebcastUrl.trim() || undefined,
        description: formDescription.trim() || undefined,
        dividendRateCents: formDividendRate ? Number(formDividendRate) : undefined,
        clientId: activeClient?.id,
      };

      const res = await fetch('/api/admin/ir/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to schedule event');
      }

      setFeedbackMsg({ type: 'success', text: 'IR Event successfully scheduled and calendar invites generated.' });
      setIsCreateModalOpen(false);
      // Reset form
      setFormTitle('');
      setFormDate('');
      setFormWebcastUrl('');
      setFormDescription('');
      setFormDividendRate('');
      loadEvents();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error creating event' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Event
  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to remove this scheduled IR event from the corporate calendar?')) return;
    try {
      const res = await fetch(`/api/admin/ir/calendar/${id}?clientId=${encodeURIComponent(activeClient?.id || '')}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((ev) => ev.id !== id));
        setFeedbackMsg({ type: 'success', text: 'Event removed from calendar.' });
      }
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  // Download RFC 5545 .ics file
  const handleDownloadIcs = (event: FinancialCalendarEvent) => {
    const cleanDate = event.eventDate.replace(/-/g, '');
    const dtStart = `${cleanDate}T080000Z`;
    const dtEnd = `${cleanDate}T093000Z`;
    const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const clientName = activeClient?.name || 'Corporate';

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:-//${clientName}//Investor Relations Calendar//EN`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${event.id}@${clientName.toLowerCase().replace(/\\s+/g, '')}.com`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${event.title} - ${clientName}`,
      `DESCRIPTION:${event.description || event.title}`,
      `LOCATION:${event.location || 'Johannesburg, South Africa & Virtual Webcast'}`,
      event.webcastUrl ? `URL:${event.webcastUrl}` : '',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\\r\\n');

    const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <div 
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}30` }}
              className="w-10 h-10 rounded-xl border flex items-center justify-center font-bold shadow-xs"
            >
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Investor Relations &amp; Financial Calendar
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Manage executive results webcasts, AGM voting timetables, and dividend milestones with instant .ICS calendar exports.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, #3B82F6)`,
              boxShadow: `0 4px 14px ${primaryColor}40`
            }}
            className="px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center space-x-2 cursor-pointer hover:opacity-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule IR Event</span>
          </button>
        </div>
      </div>

      {/* Notifications / Toast */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            &times;
          </button>
        </div>
      )}

      {/* Spotlight: Next Upcoming Corporate Milestone */}
      {nextEvent && (
        <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0E1525] to-slate-900 border border-slate-700/80 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 border border-amber-400/40 text-amber-300">
                  Next Milestone
                </span>
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>{nextEvent.eventDate} &bull; {nextEvent.timeSast}</span>
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                {nextEvent.title}
              </h2>
              {nextEvent.description && (
                <p className="text-xs md:text-sm text-slate-300 max-w-2xl line-clamp-2">
                  {nextEvent.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{nextEvent.location || 'Virtual Webcast'}</span>
                </span>
                {nextEvent.webcastUrl && (
                  <a
                    href={nextEvent.webcastUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-2"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Watch Webcast Live</span>
                  </a>
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleDownloadIcs(nextEvent)}
                className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs flex items-center space-x-2 transition shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4 text-sky-600" />
                <span>Download .ICS Calendar File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#0E1522] border border-slate-200/80 dark:border-slate-800">
        {[
          { id: 'all', label: 'All IR Events' },
          { id: 'results_announcement', label: 'Financial Results' },
          { id: 'webcast', label: 'Webcasts & Calls' },
          { id: 'dividend_dates', label: 'Dividend Timetables' },
          { id: 'agm', label: 'AGM & Voting' },
          { id: 'capital_markets_day', label: 'Investor Days' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0D121B] border border-slate-200/80 dark:border-slate-800 space-y-3">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No IR events scheduled</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Schedule your upcoming quarterly financial announcements, investor roadshows, or AGM dates to give market participants instant access to calendar reminders.
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer transition hover:opacity-90 inline-flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule First IR Event</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvents.map((event) => {
            const colors = EVENT_TYPE_COLORS[event.eventType] || EVENT_TYPE_COLORS.results_announcement;
            const label = EVENT_TYPE_LABELS[event.eventType] || 'Corporate Event';
            const isPast = event.eventDate < nowStr;

            return (
              <div
                key={event.id}
                className={`p-5 rounded-2xl bg-white dark:bg-[#0D121B] border transition hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between space-y-4 ${
                  isPast ? 'opacity-70 border-slate-200 dark:border-slate-800' : 'border-slate-200/80 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide border ${colors.bg} ${colors.text} ${colors.border}`}
                    >
                      {label}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{event.eventDate} &bull; {event.timeSast}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Dividend Tax Box if Dividend Event */}
                  {event.dividendRateCents !== undefined && event.dividendRateCents > 0 && (
                    <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                          Gross Dividend:
                        </span>
                        <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200">
                          {event.dividendRateCents} ZAR cents / share
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-emerald-700/80 dark:text-emerald-400">
                        <span>Net (after 20% SA DWT):</span>
                        <span className="font-mono">
                          {(event.dividendRateCents * 0.8).toFixed(1)} cents / share
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Metadata: Location & Webcast */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    {event.location && (
                      <div className="flex items-center space-x-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                    {event.webcastUrl && (
                      <div className="flex items-center space-x-1.5 truncate">
                        <Video className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <a
                          href={event.webcastUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-600 dark:text-sky-400 hover:underline truncate"
                        >
                          {event.webcastUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => handleDownloadIcs(event)}
                    title="Export .ics file for Google Calendar, Outlook, or Apple Calendar"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-1.5 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-500" />
                    <span>.ICS Calendar File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(event.id)}
                    title="Delete Event"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule IR Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0D131F] border border-slate-200 dark:border-[#1E2E44] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CalendarCheck className="w-5 h-5 text-sky-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Schedule Corporate IR Event
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 2026 Operational & Financial Results Webcast"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141C2A] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Type
                  </label>
                  <select
                    value={formEventType}
                    onChange={(e) => setFormEventType(e.target.value as CalendarEventType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141C2A] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="results_announcement">Financial Results</option>
                    <option value="webcast">Executive Webcast / Audio Call</option>
                    <option value="dividend_dates">Dividend Milestone</option>
                    <option value="agm">Annual General Meeting (AGM)</option>
                    <option value="capital_markets_day">Capital Markets Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141C2A] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Time (SAST / UTC)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 SAST / 08:00 GMT"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141C2A] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Johannesburg & Virtual Webcast"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141C2A] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Live Webcast URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://webcast.corpcms.com/live"
                  value={formWebcastUrl}
                  onChange={(e) => setFormWebcastUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141C2A] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              {formEventType === 'dividend_dates' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Gross Dividend Rate (SA cents per share)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 450"
                    value={formDividendRate}
                    onChange={(e) => setFormDividendRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141C2A] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Investor Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Executive presentation by CEO and CFO, followed by live institutional Q&amp;A session."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#141C2A] text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, #3B82F6)`
                  }}
                  className="px-4 py-2 rounded-xl text-white text-xs font-bold cursor-pointer hover:opacity-95 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Scheduling...' : 'Save & Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
