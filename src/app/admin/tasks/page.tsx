'use client';

import { CompositionReviewQueue } from '@/components/studio/editor/CompositionReviewQueue';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Shield,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Diff,
  Eye,
  FileText,
  AlertTriangle,
  RotateCcw,
  Send,
  Lock,
  Unlock,
  Key,
  Calendar,
  Sparkles,
  X,
  ExternalLink,
  Layers,
  Columns,
  List,
  RefreshCw,
  Hash,
  Award,
} from 'lucide-react';
import type { FieldDiff, LineDiffItem, RecordDiffSummary } from '@/lib/diff/diffEngine';

interface DiffPayload {
  record: {
    id: string;
    collection: string;
    slug: string;
    title: string;
    status: string;
    clientId: string | null;
    clientName: string;
    ownerName: string;
    updatedAt: string;
  };
  publishedRevision: {
    id: string;
    revisionNumber: number;
    contentHash: string;
    authorName: string;
    createdAt: string;
    data: any;
  } | null;
  draftRevision: {
    id: string;
    revisionNumber: number;
    contentHash: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    status: string;
    reviewComments: string | null;
    createdAt: string;
    data: any;
  } | null;
  diffSummary: {
    totalAdditions: number;
    totalDeletions: number;
    fieldsChanged: number;
    contentHashChanged: boolean;
  };
  fieldDiffs: FieldDiff[];
  governance: {
    isSensitive: boolean;
    isAuthor: boolean;
    twoPersonRuleApplies: boolean;
    twoPersonMessage: string;
    approvals: Array<{
      id: string;
      reviewerName: string;
      reviewerRole: string;
      decision: string;
      comment: string | null;
      contentHashAtApproval: string | null;
      createdAt: string;
    }>;
  };
}

export default function AdminTasksPage() {
  const { user, hasPerm } = useAdminAuth();
  const { activeClient, clients, setActiveClientId } = useStudioWorkspace();

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<'all' | 'stage1' | 'stage2' | 'history'>('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Visual Diff Modal State
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [diffData, setDiffData] = useState<DiffPayload | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'unified' | 'preview'>('split');
  const [selectedField, setSelectedField] = useState<string>('all');
  const [commentInput, setCommentInput] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const query = activeClient?.id ? `?clientId=${encodeURIComponent(activeClient.id)}` : '';
      const res = await fetch(`/api/admin/dashboard${query}`);
      if (res.ok) {
        const json = await res.json();
        setTasks(json.pendingItems || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [activeClient?.id]);

  // Filter tasks by active stage tab
  const filteredTasks = useMemo(() => {
    return tasks.filter((item) => {
      // Client scoping if applicable
      if (activeClient?.id && item.client_id && item.client_id !== activeClient.id) {
        return false;
      }

      if (activeStage === 'stage1') {
        return item.status === 'in_review' || item.status === 'changes_requested';
      }
      if (activeStage === 'stage2') {
        return item.status === 'approved';
      }
      if (activeStage === 'history') {
        return item.status === 'published';
      }
      return true; // 'all'
    });
  }, [tasks, activeStage, activeClient]);

  // Open Visual Diff Inspector
  const handleOpenDiff = async (item: any) => {
    setSelectedTask(item);
    setDiffLoading(true);
    setDiffData(null);
    setSelectedField('all');
    setViewMode('split');

    try {
      const res = await fetch(`/api/admin/content/${item.collection}/${item.id}/diff`);
      if (!res.ok) throw new Error('Failed to load visual diff');
      const data = await res.json();
      setDiffData(data);
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Error loading diff' });
    } finally {
      setDiffLoading(false);
    }
  };

  // Execute Workflow Action
  const handleWorkflowAction = async (action: string, comments?: string) => {
    if (!selectedTask) return;
    setActionInProgress(action);
    setMessage(null);

    try {
      const res = await fetch(
        `/api/admin/content/${selectedTask.collection}/${selectedTask.id}/workflow`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            comments:
              comments ||
              (action === 'approve'
                ? `Compliance review sign-off granted by ${user?.name || 'Administrator'} (${user?.role || 'admin'})`
                : action === 'publish'
                ? `Executive rollout sign-off granted by ${user?.name || 'Administrator'}`
                : 'Changes requested'),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      setMessage({
        type: 'success',
        text: `Successfully executed ${action.replace('_', ' ').toUpperCase()} on "${selectedTask.title}".`,
      });

      setShowCommentModal(false);
      setSelectedTask(null);
      setDiffData(null);
      loadTasks();
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200 p-4 md:p-8">
      <CompositionReviewQueue clientId={activeClient?.id} />
      {/* Top Banner & Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2 text-xs text-bastion-blue dark:text-sky-400 uppercase font-bold tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Multi-Stage Governance Matrix &amp; Visual Diffs</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Review, Approval &amp; Release Matrix
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Strict 3-stage corporate workflow: <strong>Author (Draft)</strong> &rarr;{' '}
            <strong>Legal/IR Officer (Compliance Review)</strong> &rarr;{' '}
            <strong>Executive Director (Cryptographic Sign-Off &amp; Live Rollout)</strong>.
            Independent review helps protect the integrity of corporate disclosures.
          </p>
        </div>

        {/* User context badge */}
        <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0A0D14] border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 self-start md:self-auto shrink-0">
          <UserCheck className="w-4 h-4 text-emerald-500" />
          <span>
            Active Reviewer: <strong className="text-slate-900 dark:text-white">{user?.name || 'Malcolm Govender'}</strong>{' '}
            <span className="text-[10px] font-mono uppercase bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded ml-1">
              {user?.role || 'admin'}
            </span>
          </span>
        </div>
      </div>

      {/* Two-Person Rule Callout */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-3">
        <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Two-Person Regulatory Rule Enforced: </span>
          <span>
            Under JSE Listings Requirements and King IV Principle 1, authors of price-sensitive disclosures, SENS announcements, and financial reports cannot approve their own release. An independent Compliance Officer or Executive must inspect the visual diff and sign off.
          </span>
        </div>
      </div>

      {/* Notification Feedback */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between shadow-2xs ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-[11px] font-bold px-2 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stage Pipeline Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <button
            onClick={() => setActiveStage('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeStage === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Pending ({tasks.length})
          </button>
          <button
            onClick={() => setActiveStage('stage1')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeStage === 'stage1'
                ? 'bg-bastion-blue text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Stage 1: Compliance Review</span>
            <span className="text-[10px] font-mono px-1 rounded bg-black/20 text-white">
              {tasks.filter((t) => t.status === 'in_review' || t.status === 'changes_requested').length}
            </span>
          </button>
          <button
            onClick={() => setActiveStage('stage2')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
              activeStage === 'stage2'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Stage 2: Executive Sign-Off</span>
            <span className="text-[10px] font-mono px-1 rounded bg-black/20 text-white">
              {tasks.filter((t) => t.status === 'approved').length}
            </span>
          </button>
        </div>

        {/* Client Fleet Filter */}
        <div className="flex items-center space-x-2 bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-2xs">
          <span className="text-[11px] text-slate-400 font-medium">Portfolio:</span>
          <select
            value={activeClient?.id || 'all'}
            onChange={(e) => setActiveClientId(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 outline-hidden cursor-pointer"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Task Queue List */}
      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs transition-colors">
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Items Requiring Editorial Attention ({filteredTasks.length})</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">Sorted by modification timestamp</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-6 h-6 text-bastion-blue animate-spin" />
            <span className="text-xs">Loading editorial approval queue...</span>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTasks.map((item) => {
              const isSensitive = item.collection === 'reports' || item.collection === 'news';
              const isAuthor = item.owner_id === user?.id || item.author_id === user?.id;
              const authorLocked = isSensitive && isAuthor;

              return (
                <div
                  key={item.id}
                  className="p-5 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-[#151D2E] transition"
                >
                  <div className="space-y-1.5 min-w-0 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {item.collection}
                      </span>
                      <span
                        className={`text-[10px] uppercase px-2 py-0.5 rounded-md font-bold ${
                          item.status === 'in_review'
                            ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : item.status === 'approved'
                            ? 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : item.status === 'changes_requested'
                            ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {item.status === 'in_review'
                          ? 'Stage 1: Compliance Review'
                          : item.status === 'approved'
                          ? 'Stage 2: Executive Sign-off'
                          : item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2">
                      <span>
                        Author: <strong className="text-slate-700 dark:text-slate-300">{item.owner_name || 'Malcolm Govender'}</strong>
                      </span>
                      <span>&bull;</span>
                      <span>Updated {new Date(item.updated_at).toLocaleString()}</span>
                      {authorLocked && (
                        <>
                          <span>&bull;</span>
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            <Lock className="w-3 h-3" />
                            <span>Two-Person Locked</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-auto">
                    {/* Primary Button: Inspect Visual Diff */}
                    <button
                      onClick={() => handleOpenDiff(item)}
                      className="px-3.5 py-2 rounded-xl bg-bastion-blue hover:bg-blue-600 text-white font-bold text-xs tracking-tight shadow-md hover:shadow-lg transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Diff className="w-3.5 h-3.5" />
                      <span>Inspect Visual Diff</span>
                    </button>

                    {/* Quick Link to Editor/Inspector */}
                    <Link
                      href={`/admin/${item.collection}/${item.id}`}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition"
                      title="Inspect record fields"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Publishing Queue Clear
            </h3>
            <p className="mt-1 text-slate-500">
              All editorial items for this client have been reviewed and approved through the multi-stage governance pipeline.
            </p>
          </div>
        )}
      </div>

      {/* Side-by-Side Visual Diff Inspector Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-[#111726] text-slate-900 dark:text-slate-100 w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 md:px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-3 min-w-0 pr-4">
                <div className="p-2 rounded-xl bg-bastion-blue text-white shadow-xs shrink-0">
                  <Diff className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-sm md:text-base tracking-tight truncate">
                      {selectedTask.title}
                    </h3>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      {selectedTask.collection}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Comparing <strong>Live Production (v{diffData?.publishedRevision?.revisionNumber || 1})</strong> vs{' '}
                    <strong>Staged Draft (v{diffData?.draftRevision?.revisionNumber || 2})</strong>
                  </div>
                </div>
              </div>

              {/* View Mode Switcher & Close */}
              <div className="flex items-center space-x-3 shrink-0">
                <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                      viewMode === 'split' ? 'bg-bastion-blue text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Columns className="w-3.5 h-3.5" />
                    <span>Split View</span>
                  </button>
                  <button
                    onClick={() => setViewMode('unified')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                      viewMode === 'unified' ? 'bg-bastion-blue text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Unified Diff</span>
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
                      viewMode === 'preview' ? 'bg-bastion-blue text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Live Preview</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            {diffLoading ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-bastion-blue animate-spin" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Calculating LCS line and token visual diffs...
                </p>
              </div>
            ) : !diffData ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Failed to compute diff between revisions.
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {/* Diff Metrics Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Additions
                    </div>
                    <div className="text-lg font-black text-emerald-500 mt-0.5">
                      +{diffData.diffSummary.totalAdditions} lines
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Deletions
                    </div>
                    <div className="text-lg font-black text-rose-500 mt-0.5">
                      -{diffData.diffSummary.totalDeletions} lines
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Fields Changed
                    </div>
                    <div className="text-lg font-black text-bastion-blue dark:text-sky-400 mt-0.5">
                      {diffData.diffSummary.fieldsChanged} modified
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Cryptographic SHA-256
                    </div>
                    <div className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 mt-1 truncate">
                      {diffData.draftRevision?.contentHash.substring(0, 16)}...
                    </div>
                  </div>
                </div>

                {/* Two-Person Governance Alert in Modal */}
                {diffData.governance.twoPersonRuleApplies && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex items-center space-x-2.5">
                    <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{diffData.governance.twoPersonMessage}</span>
                  </div>
                )}

                {/* View Mode 1: Split View (Side-by-Side) */}
                {viewMode === 'split' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Column 1: Live Production */}
                      <div className="p-3 rounded-t-xl bg-slate-100 dark:bg-slate-800 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span>Live Production (v{diffData.publishedRevision?.revisionNumber || 1})</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {diffData.publishedRevision?.createdAt
                            ? new Date(diffData.publishedRevision.createdAt).toLocaleDateString()
                            : 'Baseline'}
                        </span>
                      </div>

                      {/* Column 2: Staged Revision */}
                      <div className="p-3 rounded-t-xl bg-emerald-50 dark:bg-emerald-950/60 font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center justify-between border-b-2 border-emerald-500">
                        <span>Staged Draft (v{diffData.draftRevision?.revisionNumber || 2})</span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          Pending Approval
                        </span>
                      </div>
                    </div>

                    {/* Field-by-Field Comparisons */}
                    {diffData.fieldDiffs.map((fd) => (
                      <div
                        key={fd.fieldName}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                      >
                        <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {fd.fieldLabel}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {fd.status.toUpperCase()} (+{fd.additions} / -{fd.deletions})
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 text-xs font-mono">
                          {/* Old Value */}
                          <div className="p-4 bg-rose-50/20 dark:bg-rose-950/10 leading-relaxed overflow-x-auto text-slate-700 dark:text-slate-300">
                            {fd.oldValue ? (
                              typeof fd.oldValue === 'object' ? (
                                <pre className="whitespace-pre-wrap">{JSON.stringify(fd.oldValue, null, 2)}</pre>
                              ) : (
                                <span>{String(fd.oldValue)}</span>
                              )
                            ) : (
                              <span className="text-slate-400 italic">[Empty field]</span>
                            )}
                          </div>

                          {/* New Value */}
                          <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/10 leading-relaxed overflow-x-auto text-slate-900 dark:text-white font-medium">
                            {fd.newValue ? (
                              typeof fd.newValue === 'object' ? (
                                <pre className="whitespace-pre-wrap">{JSON.stringify(fd.newValue, null, 2)}</pre>
                              ) : (
                                <span>{String(fd.newValue)}</span>
                              )
                            ) : (
                              <span className="text-slate-400 italic">[Deleted field]</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* View Mode 2: Unified Diff */}
                {viewMode === 'unified' && (
                  <div className="space-y-4">
                    {diffData.fieldDiffs.map((fd) => (
                      <div
                        key={fd.fieldName}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden font-mono text-xs"
                      >
                        <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-between">
                          <span>@@ {fd.fieldLabel} @@</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            +{fd.additions} lines, -{fd.deletions} lines
                          </span>
                        </div>
                        <div className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                          {fd.lineDiff && fd.lineDiff.length > 0 ? (
                            fd.lineDiff.map((ld, lIdx) => (
                              <div
                                key={lIdx}
                                className={`px-4 py-1.5 flex items-start space-x-3 ${
                                  ld.type === 'added'
                                    ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
                                    : ld.type === 'removed'
                                    ? 'bg-rose-500/15 text-rose-800 dark:text-rose-300 line-through'
                                    : ld.type === 'modified'
                                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-200'
                                    : 'text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                <span className="w-6 text-[10px] text-slate-400 select-none shrink-0">
                                  {ld.type === 'added' ? '+' : ld.type === 'removed' ? '-' : ' '}
                                </span>
                                <span className="flex-1 whitespace-pre-wrap break-all">
                                  {ld.type === 'added' ? ld.newContent : ld.oldContent || ld.newContent}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 text-slate-400 italic">No line-level changes.</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* View Mode 3: Live Visual Preview */}
                {viewMode === 'preview' && (
                  <div className="p-6 md:p-8 rounded-2xl bg-white text-slate-900 border border-slate-300 shadow-md space-y-4">
                    <div className="border-b pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-bastion-blue">
                        Live Preview Mode &bull; {diffData.record.collection.toUpperCase()}
                      </span>
                      <h2 className="text-2xl font-black text-slate-900 mt-1">
                        {diffData.draftRevision?.data?.title || diffData.record.title}
                      </h2>
                      <div className="text-xs text-slate-500 mt-1">
                        Client Entity: <strong>{diffData.record.clientName}</strong> &bull; Author:{' '}
                        <strong>{diffData.draftRevision?.authorName}</strong>
                      </div>
                    </div>

                    {diffData.draftRevision?.data?.summary && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 leading-relaxed italic">
                        {diffData.draftRevision.data.summary}
                      </div>
                    )}

                    <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap pt-2">
                      {diffData.draftRevision?.data?.content ||
                        diffData.draftRevision?.data?.body_html ||
                        diffData.draftRevision?.data?.body ||
                        'Preview content rendered according to Bastion corporate brand guidelines.'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Action Bar */}
            <div className="p-4 md:px-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {diffData?.governance.twoPersonRuleApplies ? (
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    Two-Person Rule: Independent reviewer required
                  </span>
                ) : (
                  <span>Ready for Stage Sign-Off</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {/* Request Changes Button */}
                <button
                  onClick={() => {
                    setPendingAction('request_changes');
                    setShowCommentModal(true);
                  }}
                  disabled={!!actionInProgress}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-700 font-bold text-xs tracking-tight transition cursor-pointer"
                >
                  Request Changes
                </button>

                {/* Stage 2 Approval Button */}
                {selectedTask.status === 'in_review' && hasPerm('content:approve') && !diffData?.governance.twoPersonRuleApplies && (
                  <button
                    onClick={() => handleWorkflowAction('approve')}
                    disabled={!!actionInProgress}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs tracking-tight shadow-md hover:shadow-lg transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{actionInProgress === 'approve' ? 'Signing Off...' : 'Compliance Sign-Off (Stage 2)'}</span>
                  </button>
                )}

                {/* Stage 3 Publish Button */}
                {hasPerm('content:publish') && !diffData?.governance.twoPersonRuleApplies && (
                  <button
                    onClick={() => handleWorkflowAction('publish')}
                    disabled={!!actionInProgress}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-tight shadow-md hover:shadow-lg transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{actionInProgress === 'publish' ? 'Deploying...' : 'Executive Sign-Off & Live Deploy (Stage 3)'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Feedback Comments Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111726] text-slate-900 dark:text-slate-100 w-full max-w-md rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Compliance Review Feedback Notes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide actionable guidance for the content author explaining the regulatory corrections required.
            </p>
            <textarea
              rows={4}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="e.g. Please verify the Q3 headline earnings per share figure against the audited financial statements before resubmission..."
              className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-bastion-blue"
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleWorkflowAction('request_changes', commentInput)}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
