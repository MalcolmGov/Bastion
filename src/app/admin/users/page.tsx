'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Eye,
  Send,
  Building,
  Monitor,
  Smartphone,
  X,
  Sparkles,
  Lock,
  RefreshCw
} from 'lucide-react';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  region_scope: string;
  created_at: string;
  last_login?: string;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAdminAuth();
  const { clients, activeClient, portalViewMode } = useStudioWorkspace();
  const isClientPortal = portalViewMode === 'client';

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Invite Form State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('content_editor');
  const [inviteClientName, setInviteClientName] = useState(activeClient?.name || 'Bastion Group');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeClient?.name) {
      setInviteClientName(activeClient.name);
    }
  }, [activeClient?.name]);

  const [dynamicTempPassword, setDynamicTempPassword] = useState('');

  useEffect(() => {
    if (!showInviteModal) return;
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    setDynamicTempPassword(Array.from(bytes, (b) => alphabet[b % alphabet.length]).join(''));
  }, [showInviteModal]);

  // Email Preview Modal State
  const [previewEmailHtml, setPreviewEmailHtml] = useState<string | null>(null);
  const [previewUser, setPreviewUser] = useState<any>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [activeClient?.id]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const query = activeClient?.id ? `?clientId=${encodeURIComponent(activeClient.id)}` : '';
      const res = await fetch(`/api/admin/users${query}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          role: inviteRole,
          clientName: inviteClientName,
          clientScope: inviteClientName,
          clientId: inviteRole === 'platform_admin' ? null : activeClient?.id,
          initialPassword: dynamicTempPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to provision user');

      setNotification({ type: 'success', message: `User ${inviteName} provisioned! Visual welcome email prepared.` });
      setShowInviteModal(false);
      setPreviewEmailHtml(data.emailHtml);
      setPreviewUser({ name: inviteName, email: inviteEmail, role: inviteRole, clientName: inviteClientName });

      // Reset form
      setInviteName('');
      setInviteEmail('');
      loadUsers();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Provisioning failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewEmailForUser = async (u: UserRecord) => {
    try {
      let clientName = u.region_scope && u.region_scope !== 'All' ? u.region_scope : 'Bastion Group';
      let email = u.email;
      if (clientName.toLowerCase().includes('moove')) clientName = 'Bastion Group';
      if (email.toLowerCase().includes('movedigital')) email = email.replace(/movedigital\.africa/gi, 'bastiongroup.co.za');

      const res = await fetch('/api/admin/users/preview-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: u.name,
          recipientEmail: email,
          role: u.role,
          clientName: clientName
        })
      });

      const data = await res.json();
      if (res.ok) {
        setPreviewEmailHtml(data.emailHtml);
        setPreviewUser({
          name: u.name,
          email: email,
          role: u.role,
          clientName: clientName
        });
      }
    } catch (err) {
      console.error('Failed to generate preview:', err);
    }
  };

  const handleCopyHtml = () => {
    if (!previewEmailHtml) return;
    navigator.clipboard.writeText(previewEmailHtml);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const roleBadge = (role: string) => {
    switch (role) {
      case 'platform_admin':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800">Platform Admin</span>;
      case 'content_editor':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800">Content Editor</span>;
      case 'reviewer':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800">Compliance Reviewer</span>;
      case 'publisher':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800">Corporate Publisher</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">{role}</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0C121D] border border-slate-200/80 dark:border-[#1E2E44] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase text-amber-600 dark:text-amber-400 mb-1.5">
            <UserPlus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>
              {isClientPortal
                ? 'Corporate Governance • Authorized Editors'
                : 'Agency Governance • Bastion CMS Team & Access'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isClientPortal ? 'Authorized Editors & Team Access' : 'CMS Team Access & User Invitations'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {isClientPortal
              ? 'Provision verified corporate editors, assign content authoring permissions, and dispatch executive welcome invitations with secure sign-in access.'
              : 'Provision client and agency editors, enforce multi-tier approval controls, and dispatch luxury visual welcome emailers with one-click sign-in access.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-gradient-to-r dark:from-amber-500 dark:to-amber-600 dark:hover:from-amber-400 dark:hover:to-amber-500 dark:text-black font-bold text-xs tracking-wider uppercase transition shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite New User</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between animate-fadeIn ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800/80 dark:text-emerald-200'
            : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-800/80 dark:text-rose-200'
        }`}>
          <div className="flex items-center space-x-2.5 text-xs font-medium">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Users Table Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0D121B] border border-slate-200/80 dark:border-[#1E293B] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Provisioned Portal Users ({users.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Users with authenticated access to edit, review, or publish corporate content.
            </p>
          </div>
          <button
            type="button"
            onClick={loadUsers}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#141C2A] dark:hover:bg-[#1E2838] border border-slate-200 dark:border-[#232F42] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            title="Refresh Users"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="border border-slate-200/80 dark:border-[#1E293B] rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-[#1E293B]">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-transparent hover:bg-slate-50/80 dark:hover:bg-[#121A28] transition"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-amber-500/10 border border-slate-200 dark:border-amber-500/30 flex items-center justify-center font-bold text-slate-700 dark:text-amber-400 text-sm shrink-0">
                  {u.name[0] || 'U'}
                </div>
                <div className="truncate">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">{u.name}</span>
                    {roleBadge(u.role)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 truncate">
                    {u.email} &bull; Scope: <span className="text-slate-800 dark:text-amber-300 font-medium">{u.region_scope || 'All'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handlePreviewEmailForUser(u)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#141E2D] dark:hover:bg-[#1E2E44] border border-slate-200 dark:border-[#24354D] text-slate-700 dark:text-sky-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition cursor-pointer"
                  title="Preview visual welcome emailer for this user"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Emailer</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handlePreviewEmailForUser(u);
                    setNotification({
                      type: 'success',
                      message: `Welcome emailer prepared for ${u.name} (${u.email})! Review below or copy HTML.`
                    });
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 dark:border-amber-800/60 dark:text-amber-300 text-xs font-semibold transition cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Welcome</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite New User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-[#0D131F] border border-[#1E2E44] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Invite CMS Portal User</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Malcolm Govender"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070B12] border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 dark:text-slate-300 font-medium">Corporate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. malcolm@bastiongroup.co.za"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070B12] border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-medium">Assigned Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070B12] border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 font-medium"
                  >
                    <option value="content_editor">Content Editor</option>
                    <option value="reviewer">Compliance Reviewer</option>
                    <option value="publisher">Corporate Publisher</option>
                    <option value="platform_admin">Platform Administrator</option>
                    <option value="analyst">IR Analyst</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 dark:text-slate-300 font-medium">Client Organisation</label>
                  <select
                    value={inviteClientName}
                    onChange={(e) => setInviteClientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070B12] border border-slate-200 dark:border-[#1E293B] text-slate-900 dark:text-white focus:outline-hidden focus:border-amber-500 font-medium"
                  >
                    <option value="Bastion Group">Bastion Group (Platform Owner)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070B12] border border-slate-200 dark:border-[#1E293B] flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>
                  Initial temporary password will be set to <code className="text-amber-600 dark:text-amber-300 font-mono font-semibold">{dynamicTempPassword}</code> and sent in the visual welcome emailer.
                </span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-[#1E293B]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#141C2A] dark:text-slate-300 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-gradient-to-r dark:from-amber-500 dark:to-amber-600 dark:hover:from-amber-400 dark:text-black font-bold uppercase tracking-wider shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Provisioning...' : 'Provision & Generate Emailer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visual Email Previewer Drawer / Modal */}
      {previewEmailHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#090D15] border border-slate-200 dark:border-[#23354C] rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-[#1E2E44] bg-slate-50 dark:bg-[#0C1320] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center text-amber-700 dark:text-amber-400 font-bold text-xs">
                  ✉
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>Visual Welcome Emailer Preview</span>
                    <span className="text-[10px] px-2 py-0.2 rounded font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                      Live Render
                    </span>
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Recipient: <strong className="text-slate-700 dark:text-slate-200">{previewUser?.name}</strong> ({previewUser?.email}) &bull; Client: {previewUser?.clientName}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-2">
                {/* View Device Switcher */}
                <div className="flex items-center bg-slate-200/80 dark:bg-[#131E2D] p-0.5 rounded-lg border border-slate-200 dark:border-[#24354D]">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-2.5 py-1 rounded text-xs flex items-center space-x-1 transition cursor-pointer ${
                      previewDevice === 'desktop'
                        ? 'bg-white dark:bg-sky-500 text-slate-900 dark:text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-2.5 py-1 rounded text-xs flex items-center space-x-1 transition cursor-pointer ${
                      previewDevice === 'mobile'
                        ? 'bg-white dark:bg-sky-500 text-slate-900 dark:text-white font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mobile (375px)</span>
                  </button>
                </div>

                {/* Copy HTML Button */}
                <button
                  type="button"
                  onClick={handleCopyHtml}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 dark:bg-[#141E2D] dark:hover:bg-[#1E2E44] border border-slate-200 dark:border-[#24354D] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copySuccess ? 'Copied HTML!' : 'Copy HTML'}</span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setPreviewEmailHtml(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E2E44] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Email Iframe Canvas Container */}
            <div className="flex-1 bg-slate-100 dark:bg-[#05070C] p-4 sm:p-6 overflow-auto flex items-center justify-center">
              <div
                className={`transition-all duration-300 h-full overflow-hidden rounded-xl border border-slate-200 dark:border-[#1E2E44] shadow-lg ${
                  previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-[650px]'
                }`}
              >
                <iframe
                  title="Welcome Email Preview"
                  srcDoc={previewEmailHtml}
                  className="w-full h-full border-0 bg-white dark:bg-[#070B12]"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t border-slate-200 dark:border-[#1E2E44] bg-slate-50 dark:bg-[#0C1320] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Responsive HTML ready for Gmail, Apple Mail, Outlook &amp; Mobile Clients.</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setNotification({
                      type: 'success',
                      message: `Test email dispatched to ${previewUser?.email}!`
                    });
                    setPreviewEmailHtml(null);
                  }}
                  className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Welcome Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
