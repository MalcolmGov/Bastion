'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { History, Search, Shield, Filter, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminAuditPage() {
  const { user } = useAdminAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState('');

  const loadLogs = async () => {
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (selectedAction) q.set('action', selectedAction);

      const res = await fetch(`/api/admin/audit?${q.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setLogs(json.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedAction]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#C99700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#C99700] uppercase font-bold tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Immutable Regulatory Compliance Trail</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Audit Trail &amp; Access Log</h1>
          <p className="text-xs text-gray-400 mt-1">
            Every user authentication, draft modification, approval, and publishing event is permanently recorded with correlation IDs.
          </p>
        </div>

        <div className="text-xs font-mono text-gray-400 bg-[#080D14] border border-[#1E2B3E] px-3.5 py-2 rounded-xl">
          Total Logged Events: <span className="text-[#C99700] font-bold">{logs.length}</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0B1019] border border-[#1C2638] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, record ID or details..."
            className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C99700]"
          />
        </form>

        <div className="flex flex-wrap gap-1.5">
          {['', 'AUTH', 'CONTENT_CREATE', 'CONTENT_UPDATE', 'WORKFLOW', 'SCHEDULED'].map((act) => (
            <button
              key={act}
              onClick={() => setSelectedAction(act)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition ${
                selectedAction === act
                  ? 'bg-[#C99700]/20 text-[#E6C657] border border-[#C99700]/40 font-semibold'
                  : 'bg-[#0E1522] text-gray-400 hover:text-gray-200'
              }`}
            >
              {act ? act.replace('_', ' ') : 'All Actions'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0B1019] border border-[#1C2638] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0E1522] text-gray-400 border-b border-[#1C2638] uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Collection / Target</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162030]">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#0E1624] transition font-mono text-[11px]">
                    <td className="py-3 px-4 font-semibold text-white font-sans">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-gray-300 font-sans">
                      {log.actor_name}
                      <div className="text-[10px] text-gray-500 font-mono">{log.ip_address}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      <div>{log.collection}</div>
                      <div className="text-gray-500 text-[10px] truncate max-w-[140px]">{log.record_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                          log.result === 'success'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-300 border border-red-800'
                        }`}
                      >
                        {log.result}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-[10px] max-w-xs truncate">
                      {log.details_json}
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-[10px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 font-sans text-xs">
                    <History className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <span>No audit entries found matching filter.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
