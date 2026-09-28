'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from './AdminAuthProvider';
import {
  Save,
  Send,
  CheckCircle,
  Eye,
  ArrowLeft,
  Clock,
  Shield,
  Layers,
  Code,
  FileText,
  AlertCircle,
  History,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface RecordEditorProps {
  collection: string;
  id: string;
  collectionTitle: string;
}

export function RecordEditor({ collection, id, collectionTitle }: RecordEditorProps) {
  const router = useRouter();
  const { user, hasPerm } = useAdminAuth();

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<any>(null);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);

  // Form data
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [jsonData, setJsonData] = useState<string>('{}');
  const [activeTab, setActiveTab] = useState<'form' | 'json' | 'revisions'>('form');

  // Workflow state
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/admin/content/${collection}/${id}`);
        if (!res.ok) throw new Error('Failed to load record');
        const json = await res.json();

        setRecord(json.record);
        setRevisions(json.revisions || []);
        setApprovals(json.approvals || []);
        setTitle(json.record.title || '');
        setSlug(json.record.slug || '');

        const dataObj = json.draft?.data || json.published?.data || {};
        setJsonData(JSON.stringify(dataObj, null, 2));
      } catch (err: any) {
        console.error(err);
        setNotification({ type: 'error', msg: err.message || 'Error loading' });
      } finally {
        setLoading(false);
      }
    }

    if (id) loadData();
  }, [collection, id]);

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setNotification(null);
    try {
      let parsedData = {};
      try {
        parsedData = JSON.parse(jsonData);
      } catch (e) {
        throw new Error('Invalid JSON format in data payload');
      }

      const res = await fetch(`/api/admin/content/${collection}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          data: parsedData
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      setNotification({ type: 'success', msg: `Saved as Draft revision v${data.revisionNumber}!` });
      setRecord((prev: any) => ({ ...prev, status: 'draft' }));
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', msg: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleWorkflow = async (action: string) => {
    setIsSaving(true);
    setNotification(null);
    try {
      const res = await fetch(`/api/admin/content/${collection}/${id}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Workflow action failed');

      setNotification({ type: 'success', msg: `Status updated to ${data.newStatus}!` });
      setRecord((prev: any) => ({ ...prev, status: data.newStatus }));
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({ type: 'error', msg: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#C99700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B1019] border border-[#1C2638]">
        <div className="flex items-center space-x-3">
          <Link
            href={`/admin/${collection}`}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A2536] transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-mono text-gray-500">{collection}</span>
              <span className="text-gray-600">•</span>
              <span className="text-xs font-mono text-[#C99700]">/{slug}</span>
              <span
                className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                  record?.status === 'published'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : record?.status === 'in_review'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : record?.status === 'approved'
                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                    : 'bg-gray-800 text-gray-300 border border-gray-700'
                }`}
              >
                {record?.status || 'draft'}
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight mt-0.5">{title}</h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 flex-wrap">
          {notification && (
            <span
              className={`text-xs px-3 py-1 rounded-lg ${
                notification.type === 'success'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-red-950 text-red-300 border border-red-800'
              }`}
            >
              {notification.msg}
            </span>
          )}

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#162235] hover:bg-[#20314C] border border-[#273B57] text-xs font-medium text-gray-200 hover:text-white transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-[#C99700]" />
            <span>Save Draft</span>
          </button>

          {record?.status === 'draft' && (
            <button
              onClick={() => handleWorkflow('submit_review')}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#1B293C] hover:bg-[#253952] border border-[#2F4766] text-xs font-semibold text-amber-300 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Review</span>
            </button>
          )}

          {record?.status === 'in_review' && hasPerm('content:approve') && (
            <button
              onClick={() => handleWorkflow('approve')}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-900/60 hover:bg-blue-800/80 border border-blue-600 text-xs font-semibold text-blue-200 transition"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approve (2-Person Sign-off)</span>
            </button>
          )}

          {(record?.status === 'approved' || user?.role === 'platform_admin') && (
            <button
              onClick={() => handleWorkflow('publish')}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:from-[#E5BE48] hover:to-[#C49534] text-xs font-bold text-black transition shadow-md shadow-[#C99700]/20"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Publish Live</span>
            </button>
          )}
        </div>
      </div>

      {/* Two Columns: Editor and Meta/Revisions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Main Form / JSON Editor */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#0B1019] border border-[#1C2638] rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-[#1C2638] bg-[#0E1522]">
              <button
                onClick={() => setActiveTab('form')}
                className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'form'
                    ? 'border-[#C99700] text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Form Fields</span>
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`flex items-center space-x-2 px-5 py-3 text-xs font-semibold border-b-2 transition ${
                  activeTab === 'json'
                    ? 'border-[#C99700] text-white'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Structured JSON</span>
              </button>
            </div>

            {/* Form View */}
            {activeTab === 'form' && (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Record Title / Heading
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C99700]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#C99700]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Payload Fields ({collection})
                    </label>
                    <span className="text-[10px] text-gray-500 font-mono">Synced to JSON tab</span>
                  </div>
                  <textarea
                    rows={12}
                    value={jsonData}
                    onChange={(e) => setJsonData(e.target.value)}
                    className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl p-4 font-mono text-xs text-gray-200 focus:outline-none focus:border-[#C99700] resize-y"
                  />
                </div>
              </div>
            )}

            {/* JSON View */}
            {activeTab === 'json' && (
              <div className="p-6 space-y-2">
                <p className="text-xs text-gray-400">
                  Direct raw JSON editing with schema preservation and LibSQL integrity hashing.
                </p>
                <textarea
                  rows={20}
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl p-4 font-mono text-xs text-[#E6C657] focus:outline-none focus:border-[#C99700] resize-y"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Meta, Approvals & Revision Trail */}
        <div className="lg:col-span-4 space-y-4">
          {/* Metadata Card */}
          <div className="p-5 rounded-2xl bg-[#0B1019] border border-[#1C2638] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <Shield className="w-3.5 h-3.5 text-[#C99700]" />
              <span>Governance &amp; Metadata</span>
            </h3>

            <div className="space-y-2 text-xs divide-y divide-[#162030]">
              <div className="flex justify-between py-1.5 text-gray-400">
                <span>Record ID</span>
                <span className="font-mono text-gray-300 truncate max-w-[150px]">{record?.id}</span>
              </div>
              <div className="flex justify-between py-1.5 text-gray-400">
                <span>Created Date</span>
                <span className="text-gray-300 font-mono">
                  {new Date(record?.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 text-gray-400">
                <span>Last Updated</span>
                <span className="text-gray-300 font-mono">
                  {new Date(record?.updated_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 text-gray-400">
                <span>Author</span>
                <span className="text-white font-medium">{record?.owner_name || 'Sarah Jenkins'}</span>
              </div>
            </div>
          </div>

          {/* Approvals Card (Two-person sign-off) */}
          <div className="p-5 rounded-2xl bg-[#0B1019] border border-[#1C2638] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Compliance Approvals ({approvals.length})</span>
            </h3>

            {approvals.length > 0 ? (
              <div className="space-y-2">
                {approvals.map((app) => (
                  <div key={app.id} className="p-3 rounded-xl bg-[#080D14] border border-[#1A2536] text-xs">
                    <div className="flex items-center justify-between font-semibold text-white">
                      <span>{app.reviewer_name}</span>
                      <span className="text-emerald-400 text-[10px] uppercase">{app.decision}</span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">{app.comment}</div>
                    <div className="text-[10px] font-mono text-gray-600 mt-1">
                      {new Date(app.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500 py-2">
                No formal approvals logged yet. Submitting for review will request compliance sign-off.
              </div>
            )}
          </div>

          {/* Revisions Trail */}
          <div className="p-5 rounded-2xl bg-[#0B1019] border border-[#1C2638] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <History className="w-3.5 h-3.5 text-[#C99700]" />
              <span>Revision Trail ({revisions.length})</span>
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {revisions.map((rev) => (
                <div key={rev.id} className="p-2.5 rounded-xl bg-[#080D14] border border-[#1A2536] text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-white">v{rev.revision_number}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-mono bg-gray-800 text-gray-300">
                      {rev.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400">by {rev.author_name || 'System Admin'}</div>
                  <div className="text-[10px] font-mono text-gray-600">
                    {new Date(rev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
