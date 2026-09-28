'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { Clock, RefreshCw, CheckCircle2, AlertTriangle, Calendar, Layers, Activity } from 'lucide-react';

export default function AdminScheduledPage() {
  const { user } = useAdminAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [workerResult, setWorkerResult] = useState<string | null>(null);

  const loadWorkerStatus = async () => {
    try {
      const res = await fetch('/api/admin/worker/status');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerStatus();
  }, []);

  const handleRunNow = async () => {
    setRunning(true);
    setWorkerResult(null);
    try {
      const res = await fetch('/api/admin/worker/run', { method: 'POST' });
      const json = await res.json();
      setWorkerResult(json.message || 'Worker run completed.');
      loadWorkerStatus();
    } catch (err: any) {
      setWorkerResult('Worker execution failed: ' + err.message);
    } finally {
      setRunning(false);
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
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#C99700] uppercase font-bold tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Automated Publishing Daemon</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Scheduled Releases &amp; Worker Engine</h1>
          <p className="text-xs text-gray-400 mt-1">
            Zero-downtime automated publishing for market embargoes (JSE &amp; NYSE) with dual SAST/UTC timestamp auditing.
          </p>
        </div>

        <button
          onClick={handleRunNow}
          disabled={running}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:from-[#E5BE48] hover:to-[#C49534] text-black font-semibold text-xs transition shadow-md shadow-[#C99700]/20 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
          <span>{running ? 'Executing Worker...' : 'Execute Worker Now'}</span>
        </button>
      </div>

      {workerResult && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{workerResult}</span>
        </div>
      )}

      {/* Jobs Queue Table */}
      <div className="bg-[#0B1019] border border-[#1C2638] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1C2638] flex items-center justify-between">
          <h2 className="text-xs uppercase font-bold tracking-wider text-gray-400 flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#C99700]" />
            <span>Scheduled Publishing Jobs Queue</span>
          </h2>
          <span className="text-[11px] text-gray-500">Dual-timezone timestamps</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#0E1522] text-gray-400 border-b border-[#1C2638] uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Job ID &amp; Type</th>
                <th className="py-3 px-4">Target Collection</th>
                <th className="py-3 px-4">Scheduled Execution</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162030]">
              {data?.jobs && data.jobs.length > 0 ? (
                data.jobs.map((job: any) => (
                  <tr key={job.id} className="hover:bg-[#0E1624] transition">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-white">
                      <div>{job.id}</div>
                      <div className="text-gray-500 uppercase text-[9px]">{job.job_type}</div>
                    </td>
                    <td className="py-3.5 px-4 uppercase font-semibold text-gray-300">
                      {job.target_collection}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div>SAST: {new Date(job.scheduled_at).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}</div>
                      <div className="text-gray-500">UTC: {new Date(job.scheduled_at).toLocaleString('en-GB', { timeZone: 'UTC' })}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                          job.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : job.status === 'pending'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-red-950 text-red-300 border border-red-800'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {job.created_by_name || 'System Admin'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No scheduled jobs in queue. You can schedule items for release from any collection editor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Worker Audit Logs */}
      <div className="bg-[#0B1019] border border-[#1C2638] rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Worker &amp; State Machine Activity Log</span>
        </h3>

        <div className="space-y-2">
          {data?.logs && data.logs.length > 0 ? (
            data.logs.map((log: any) => (
              <div key={log.id} className="p-3 rounded-xl bg-[#080D14] border border-[#162030] text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white">{log.action}</span>
                  <span className="text-gray-500 ml-2 font-mono text-[11px]">
                    target: {log.collection}/{log.record_id}
                  </span>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    actor: {log.actor_name} • result: <span className="text-emerald-400">{log.result}</span>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-500">No worker logs recorded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
