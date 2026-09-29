'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { CheckSquare, Clock, AlertCircle, CheckCircle, ChevronRight, Shield, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AdminTasksPage() {
  const { user, hasPerm } = useAdminAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
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
  }, []);

  const handleQuickApprove = async (item: any) => {
    setApprovingId(item.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/content/${item.collection}/${item.id}/workflow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          comments: `Compliance sign-off granted by ${user?.name || 'Administrator'} (${user?.role || 'admin'})`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approval failed');

      setMessage({ type: 'success', text: `Approved and published ${item.title}!` });
      loadTasks();
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-bastion-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center space-x-2 text-xs text-bastion-blue dark:text-sky-400 uppercase font-bold tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Editorial Governance &amp; Two-Person Review</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Review &amp; Publishing Queue
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Ensure regulatory accuracy, legal compliance, and brand integrity before public website dissemination. Published changes trigger instantaneous edge cache revalidation.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0A0D14] border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 self-start md:self-auto shrink-0">
          <UserCheck className="w-4 h-4 text-emerald-500" />
          <span>Active Reviewer: <strong className="text-slate-900 dark:text-white">{user?.name || 'Administrator'}</strong></span>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-2 shadow-2xs ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Task List */}
      <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs transition-colors">
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Items Requiring Editorial Attention ({tasks.length})</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">Sorted by modification date</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {tasks.length > 0 ? (
            tasks.map((item) => (
              <div key={item.id} className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-[#151D2E] transition">
                <div className="space-y-1 min-w-0 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">{item.title}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.collection}
                    </span>
                    <span
                      className={`text-[10px] uppercase px-2 py-0.5 rounded-md font-semibold ${
                        item.status === 'in_review'
                          ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : item.status === 'approved'
                          ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Author: <span className="text-slate-700 dark:text-slate-300 font-medium">{item.owner_name || 'Malcolm Govender'}</span> &bull; Updated {new Date(item.updated_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
                  {hasPerm('content:approve') && item.status === 'in_review' && (
                    <button
                      onClick={() => handleQuickApprove(item)}
                      disabled={approvingId === item.id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition disabled:opacity-50 flex items-center space-x-1 shadow-2xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                      <span>{approvingId === item.id ? 'Approving...' : 'Sign Off & Publish'}</span>
                    </button>
                  )}

                  <Link
                    href={`/admin/${item.collection}/${item.id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center space-x-1 font-medium shadow-2xs"
                  >
                    <span>Inspect Details</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>All items have been reviewed and approved. Publishing queue is clear!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
