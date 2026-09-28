'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { CheckSquare, Clock, AlertCircle, CheckCircle, ChevronRight, Shield, UserCheck } from 'lucide-react';

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
          comments: `Compliance sign-off granted by ${user?.name} (${user?.role})`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Approval failed');

      setMessage({ type: 'success', text: `Approved ${item.title}!` });
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
        <div className="w-8 h-8 border-2 border-[#C99700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0E1624] to-[#121B2A] border border-[#1E2D44] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#C99700] uppercase font-bold tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Editorial Governance &amp; Two-Person Review</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Review &amp; Sign-off Queue</h1>
          <p className="text-xs text-gray-400 mt-1">
            Ensure regulatory accuracy, legal compliance, and ESG verification before public dissemination.
          </p>
        </div>

        <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#080D14] border border-[#1B273A] text-xs text-gray-300">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Active Reviewer: <strong className="text-white">{user?.name}</strong></span>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
              : 'bg-red-950/80 text-red-300 border border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Task List */}
      <div className="bg-[#0B1019] border border-[#1C2638] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1C2638] flex items-center justify-between">
          <h2 className="text-xs uppercase font-bold tracking-wider text-gray-400 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Items Requiring Editorial Attention ({tasks.length})</span>
          </h2>
          <span className="text-[11px] text-gray-500">Sorted by updated time</span>
        </div>

        <div className="divide-y divide-[#152030]">
          {tasks.length > 0 ? (
            tasks.map((item) => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#0E1522] transition">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-semibold text-sm text-white">{item.title}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#162337] text-gray-300 border border-[#233550]">
                      {item.collection}
                    </span>
                    <span
                      className={`text-[10px] uppercase px-2 py-0.5 rounded font-semibold ${
                        item.status === 'in_review'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                          : item.status === 'approved'
                          ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
                          : 'bg-gray-800 text-gray-300'
                      }`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Author: <span className="text-gray-300">{item.owner_name || 'Sarah Jenkins'}</span> • Updated {new Date(item.updated_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {hasPerm('content:approve') && item.status === 'in_review' && (
                    <button
                      onClick={() => handleQuickApprove(item)}
                      disabled={approvingId === item.id}
                      className="px-3 py-1.5 rounded-xl bg-blue-900/70 hover:bg-blue-800 border border-blue-600 text-xs font-semibold text-white transition disabled:opacity-50 flex items-center space-x-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-blue-300" />
                      <span>{approvingId === item.id ? 'Approving...' : 'Sign Off'}</span>
                    </button>
                  )}

                  <Link
                    href={`/admin/${item.collection}/${item.id}`}
                    className="px-3 py-1.5 rounded-xl bg-[#141F30] hover:bg-[#1D2C44] border border-[#22334D] text-xs text-gray-200 hover:text-white transition flex items-center space-x-1"
                  >
                    <span>Inspect Details</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#C99700]" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500 text-xs">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <span>All items have been reviewed and approved. Queue is clear!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
