'use client';

import React, { useState } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  Terminal,
  ArrowRight,
  GitBranch,
  X
} from 'lucide-react';
import { CodeDiffViewer } from './CodeDiffViewer';

interface PRPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: any;
  onApproved: () => void;
}

export const PRPreviewModal: React.FC<PRPreviewModalProps> = ({
  isOpen,
  onClose,
  incident,
  onApproved
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [revisionPrompt, setRevisionPrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !incident) return null;

  let patchData: any = null;
  try {
    if (typeof incident.ai_proposed_patch === 'string') {
      patchData = JSON.parse(incident.ai_proposed_patch);
    } else {
      patchData = incident.ai_proposed_patch;
    }
  } catch {
    patchData = null;
  }

  // Handle HITL Approval & Auto-Deployment
  const handleApprove = async () => {
    setIsApproving(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/sre/approve-and-deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: incident.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve and deploy fix');

      setSuccessMsg(data.message || 'Fix approved, PR merged, and post-deploy probe verified!');
      setTimeout(() => {
        onApproved();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsApproving(false);
    }
  };

  // Handle Reject / Dismiss
  const handleReject = async () => {
    if (!confirm('Are you sure you want to dismiss this fix and close the GitHub PR?')) return;
    setIsRejecting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/sre/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: incident.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dismiss incident');

      onApproved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsRejecting(false);
    }
  };

  // Handle AI Revision Request
  const handleRegenerate = async () => {
    if (!revisionPrompt.trim()) return;
    setIsRegenerating(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/sre/diagnose-and-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: incident.id,
          customPrompt: revisionPrompt
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to regenerate fix');

      setRevisionPrompt('');
      onApproved(); // triggers reload in parent
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-[#0B1019] border border-slate-200 dark:border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-[#1E293B] flex items-center justify-between bg-slate-50/80 dark:bg-[#0E1522]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Autonomous SRE Remediation &amp; HITL Approval
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Human Sign-Off Required
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Incident Ref: <code className="font-mono text-slate-700 dark:text-slate-300">{incident.id}</code> • {incident.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Status Message Alerts */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* GitHub PR Pipeline Status Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-[#0E1522] border border-slate-200/80 dark:border-[#1E293B] text-xs">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                Target Repository &amp; Branch
              </span>
              <div className="text-slate-800 dark:text-slate-200 font-mono space-y-0.5">
                <div className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1">
                  <span>{incident.repo_owner || 'MalcolmGov'}/{incident.repo_name || 'MoveDigital'}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500">
                  <GitBranch className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{incident.pr_branch || 'sre/pending-branch'}</span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                GitHub Pull Request
              </span>
              {incident.pr_url ? (
                <a
                  href={incident.pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 font-semibold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  <span>PR #{incident.pr_number} on {incident.repo_name || 'MoveDigital'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-slate-500 font-mono">Staged / Local Patch</span>
              )}
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                Risk Rating &amp; Policy
              </span>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {incident.risk_level || 'LOW'} RISK
                </span>
                <span className="text-slate-500 text-[11px]">HITL Gated</span>
              </div>
            </div>
          </div>

          {/* Root Cause Diagnosis */}
          <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
            <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-300 font-bold text-xs uppercase tracking-wider">
              <Terminal className="w-4 h-4 text-indigo-500" />
              <span>AI SRE Diagnostic Finding</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {incident.ai_diagnosis || 'Automated synthetic probe identified route integrity deviation. The AI SRE agent analyzed local route context and generated a precision surgical patch.'}
            </p>
          </div>

          {/* Interactive Code Diff Viewer */}
          {patchData ? (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Proposed Code Diff &amp; Replacement Range
              </span>
              <CodeDiffViewer
                filePath={patchData.filePath || 'src/app/sustainability/page.tsx'}
                startLine={patchData.startLine || 20}
                endLine={patchData.endLine || 26}
                originalCode={patchData.originalCode || ''}
                replacementCode={patchData.replacementCode || ''}
                explanation={patchData.explanation}
                confidence={patchData.confidence || 'high'}
                riskLevel={patchData.riskLevel || 'low'}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 dark:bg-[#0E1522] rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
              No code patch generated yet for this incident.
            </div>
          )}

          {/* AI Prompt Revision Field */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0E1522] border border-slate-200 dark:border-[#1E293B] space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
              <span>Iterate or Refine Fix with AI Prompt</span>
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={revisionPrompt}
                onChange={(e) => setRevisionPrompt(e.target.value)}
                placeholder="e.g. Also ensure defensive null-checks or use an alternative disclosure URL..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0B1019] border border-slate-300 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white"
                disabled={isRegenerating}
              />
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isRegenerating || !revisionPrompt.trim()}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition disabled:opacity-50 flex items-center space-x-1.5"
              >
                {isRegenerating ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Regenerating...</span>
                  </>
                ) : (
                  <>
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Regenerate Fix</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-slate-200 dark:border-[#1E293B] bg-slate-50/80 dark:bg-[#0E1522] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReject}
            disabled={isRejecting || isApproving}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-semibold transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject / Dismiss Incident</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isApproving ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Merging PR &amp; Deploying...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve &amp; Auto-Deploy Fix</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
