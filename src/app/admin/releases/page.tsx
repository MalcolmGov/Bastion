'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import { useDashboardCustomizer } from '@/components/admin/DashboardCustomizerProvider';
import {
  Rocket,
  Calendar,
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Layers,
  FileText,
  Sparkles,
  ChevronRight,
  X,
  Send,
  Eye,
  RefreshCw,
  FolderPlus,
  Timer,
  Check,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

interface ContentRelease {
  id: string;
  clientId: string;
  siteId: string;
  name: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  scheduledAt?: string | null;
  publishedAt?: string | null;
  publishedBy?: string | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ReleaseItem {
  id: string;
  releaseId: string;
  itemType: string;
  itemId: string;
  title: string;
  action: string;
  changesSummary?: string;
  createdAt: string;
}

export default function AdminReleasesPage() {
  const { user } = useAdminAuth();
  const { activeClient, activeSite } = useStudioWorkspace();
  const { primaryColor, accentColor } = useDashboardCustomizer();

  const [releases, setReleases] = useState<ContentRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'scheduled' | 'draft' | 'published'>('all');
  
  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newReleaseName, setNewReleaseName] = useState('');
  const [newReleaseDescription, setNewReleaseDescription] = useState('');
  const [newReleaseDate, setNewReleaseDate] = useState('');
  const [newReleaseStatus, setNewReleaseStatus] = useState<'draft' | 'scheduled'>('draft');
  const [creating, setCreating] = useState(false);

  // Detail / Inspect Drawer
  const [selectedRelease, setSelectedRelease] = useState<ContentRelease | null>(null);
  const [releaseItems, setReleaseItems] = useState<ReleaseItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Manual Add Item Modal
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('page');
  const [newItemId, setNewItemId] = useState('');
  const [newItemSummary, setNewItemSummary] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  // Feedback Notification
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/releases?siteId=${activeSite?.id || 'site_goldfields_global'}`);
      if (res.ok) {
        const data = await res.json();
        setReleases(data.releases || []);
      }
    } catch (err: any) {
      console.error('Failed to load releases:', err);
      showNotification('error', 'Failed to fetch content releases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, [activeSite]);

  const loadReleaseDetails = async (release: ContentRelease) => {
    setSelectedRelease(release);
    try {
      setLoadingItems(true);
      const res = await fetch(`/api/admin/releases/${release.id}`);
      if (res.ok) {
        const data = await res.json();
        setReleaseItems(data.items || []);
      }
    } catch (err: any) {
      console.error('Failed to load items:', err);
      showNotification('error', 'Could not load release contents');
    } finally {
      setLoadingItems(false);
    }
  };

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReleaseName.trim()) return;

    try {
      setCreating(true);
      const res = await fetch('/api/admin/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: activeClient?.id || 'client_goldfields',
          siteId: activeSite?.id || 'site_goldfields_global',
          name: newReleaseName,
          description: newReleaseDescription,
          scheduledAt: newReleaseDate ? new Date(newReleaseDate).toISOString() : null,
          status: newReleaseDate ? 'scheduled' : newReleaseStatus
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create release');

      showNotification('success', `Release "${newReleaseName}" created successfully!`);
      setCreateModalOpen(false);
      setNewReleaseName('');
      setNewReleaseDescription('');
      setNewReleaseDate('');
      await fetchReleases();
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setCreating(false);
    }
  };

  const handlePublishNow = async (releaseId: string, releaseName: string) => {
    if (!confirm(`Are you sure you want to trigger atomic publishing for "${releaseName}"? All bundled pages and assets will go live globally.`)) {
      return;
    }

    try {
      setPublishingId(releaseId);
      const res = await fetch(`/api/admin/releases/${releaseId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publishedBy: user?.name || 'Administrator'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Publishing failed');

      showNotification('success', `Atomic drop successful: ${data.message}`);
      await fetchReleases();
      if (selectedRelease?.id === releaseId) {
        await loadReleaseDetails({ ...selectedRelease, status: 'published', publishedAt: new Date().toISOString() });
      }
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setPublishingId(null);
    }
  };

  const handleDeleteRelease = async (releaseId: string) => {
    if (!confirm('Are you sure you want to delete this release bundle? Bundled contents will not be deleted from CMS drafts.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/releases/${releaseId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete release');

      showNotification('success', 'Release bundle removed');
      if (selectedRelease?.id === releaseId) setSelectedRelease(null);
      await fetchReleases();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRelease || !newItemTitle.trim() || !newItemId.trim()) return;

    try {
      setAddingItem(true);
      const res = await fetch(`/api/admin/releases/${selectedRelease.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType: newItemType,
          itemId: newItemId,
          title: newItemTitle,
          action: 'update',
          changesSummary: newItemSummary || 'Bundled manual content update'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add item to release');

      showNotification('success', `Added "${newItemTitle}" to release!`);
      setAddItemModalOpen(false);
      setNewItemTitle('');
      setNewItemId('');
      setNewItemSummary('');
      await loadReleaseDetails(selectedRelease);
      await fetchReleases();
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setAddingItem(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!selectedRelease) return;
    try {
      const res = await fetch(`/api/admin/releases/${selectedRelease.id}/items?itemId=${itemId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to remove item');

      showNotification('success', 'Item unlinked from release');
      await loadReleaseDetails(selectedRelease);
      await fetchReleases();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  // Filtered releases
  const filteredReleases = releases.filter((rel) => {
    if (filterTab === 'all') return true;
    return rel.status === filterTab;
  });

  const scheduledCount = releases.filter(r => r.status === 'scheduled').length;
  const draftCount = releases.filter(r => r.status === 'draft').length;
  const publishedCount = releases.filter(r => r.status === 'published').length;
  const totalBundledItems = releases.reduce((sum, r) => sum + (r.itemCount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-bold tracking-wider uppercase" style={{ color: primaryColor }}>
            <Rocket className="w-4 h-4" />
            <span>Bastion Enterprise Governance &bull; Parity with Strapi &amp; Sanity</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Content Releases &amp; Scheduled Drops
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Orchestrate multi-document release campaigns, embargoed financial SENS announcements, and coordinated marketing drops. Bundled revisions deploy atomically with zero cache skew across global edge CDN nodes.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={fetchReleases}
            title="Refresh releases"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
              boxShadow: `0 4px 14px ${primaryColor}40`
            }}
            className="px-4 py-2.5 rounded-xl text-white font-bold text-xs flex items-center space-x-2 hover:opacity-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Release</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-2.5 shadow-2xs animate-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          )}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Scheduled Drops</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {scheduledCount}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1 flex items-center gap-1">
            <Timer className="w-3 h-3" />
            <span>Time-locked embargoes</span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Draft Bundles</span>
            <Layers className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {draftCount}
          </div>
          <div className="text-[11px] text-sky-600 dark:text-sky-400 font-medium mt-1">
            In active authoring &amp; review
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Published Releases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {publishedCount}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Atomically deployed to edge
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Bundled Items</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {totalBundledItems}
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
            Pages, zones &amp; disclosures
          </div>
        </div>
      </div>

      {/* Main Release Orchestration Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Releases List */}
        <div className={`${selectedRelease ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-[#111726] p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-1">
              {(['all', 'scheduled', 'draft', 'published'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterTab(tab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition capitalize cursor-pointer ${
                    filterTab === tab
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab === 'all' ? `All (${releases.length})` : `${tab} (${releases.filter(r => r.status === tab).length})`}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 px-3 font-mono">
              {filteredReleases.length} release{filteredReleases.length === 1 ? '' : 's'}
            </div>
          </div>

          {/* Release Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-20 bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredReleases.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#111726] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Layers className="w-10 h-10 mx-auto text-slate-400 opacity-60" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No releases in this view</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create a scheduled drop to bundle multi-page updates, or add pages directly from the Visual Editor.
              </p>
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="mt-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-slate-800 hover:opacity-90 cursor-pointer"
              >
                + New Release Bundle
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReleases.map((release) => {
                const isSelected = selectedRelease?.id === release.id;
                const isScheduled = release.status === 'scheduled';
                const isPublished = release.status === 'published';
                const isDraft = release.status === 'draft';

                return (
                  <div
                    key={release.id}
                    onClick={() => loadReleaseDetails(release)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-50/90 dark:bg-[#151D2E] border-bastion-blue dark:border-sky-500 shadow-md ring-1 ring-bastion-blue/20'
                        : 'bg-white dark:bg-[#111726] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center space-x-2.5">
                          {isScheduled && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300/40 flex items-center gap-1">
                              <Timer className="w-3 h-3 animate-spin text-amber-500" />
                              Scheduled Drop
                            </span>
                          )}
                          {isDraft && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-300/40">
                              Draft Campaign
                            </span>
                          )}
                          {isPublished && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Published
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400 font-mono">
                            {release.itemCount || 0} item{release.itemCount === 1 ? '' : 's'} bundled
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {release.name}
                        </h3>

                        {release.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                            {release.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {release.scheduledAt && (
                            <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400 font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Drop: {new Date(release.scheduledAt).toLocaleString()}</span>
                            </div>
                          )}
                          {release.publishedAt && (
                            <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Live since: {new Date(release.publishedAt).toLocaleDateString()}</span>
                            </div>
                          )}
                          <span>Created {new Date(release.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        {!isPublished && (
                          <button
                            type="button"
                            disabled={publishingId === release.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePublishNow(release.id, release.name);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            <span>{publishingId === release.id ? 'Deploying...' : 'Publish Now'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRelease(release.id);
                          }}
                          title="Delete Release"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-bastion-blue dark:text-sky-400 translate-x-1' : 'text-slate-400'}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Release Detail & Bundled Items Inspector */}
        {selectedRelease && (
          <div className="lg:col-span-5 space-y-4 animate-in slide-in-from-right-4 duration-200">
            <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between bg-slate-50/50 dark:bg-[#151D2E]/60">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Release Inspector
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {selectedRelease.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedRelease.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRelease(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Release Metadata */}
              <div className="p-5 space-y-4 border-b border-slate-100 dark:border-slate-800/80 text-xs">
                {selectedRelease.description && (
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedRelease.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0A0D14] border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-sans">Scheduled For</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">
                      {selectedRelease.scheduledAt ? new Date(selectedRelease.scheduledAt).toLocaleString() : 'Manual Drop'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-sans">Edge Deployment</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      Atomic Transaction
                    </span>
                  </div>
                </div>

                {selectedRelease.status !== 'published' && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={publishingId === selectedRelease.id}
                      onClick={() => handlePublishNow(selectedRelease.id, selectedRelease.name)}
                      className="w-full py-2.5 rounded-xl text-white font-bold text-xs bg-emerald-600 hover:bg-emerald-500 transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      <Rocket className="w-4 h-4" />
                      <span>{publishingId === selectedRelease.id ? 'Deploying Release...' : 'Publish Entire Release Now'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bundled Items Header */}
              <div className="p-4 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-bastion-blue dark:text-sky-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Bundled Content Items ({releaseItems.length})
                  </span>
                </div>

                {selectedRelease.status !== 'published' && (
                  <button
                    type="button"
                    onClick={() => setAddItemModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-bastion-blue dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Bundle Item</span>
                  </button>
                )}
              </div>

              {/* Bundled Items List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[380px] overflow-y-auto">
                {loadingItems ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : releaseItems.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-slate-400 opacity-60" />
                    <p className="font-medium">No items bundled into this release yet.</p>
                    <p className="text-[11px] text-slate-400">
                      Use the "Bundle Item" button or add pages directly from the Visual Page Editor.
                    </p>
                  </div>
                ) : (
                  releaseItems.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {item.itemType}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                            {item.action}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </div>
                        {item.changesSummary && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {item.changesSummary}
                          </div>
                        )}
                      </div>

                      {selectedRelease.status !== 'published' && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          title="Remove item from release"
                          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE RELEASE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <Rocket className="w-5 h-5 text-bastion-blue dark:text-sky-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Create Content Release
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRelease} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Release Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Financial Results & Production Update"
                  value={newReleaseName}
                  onChange={(e) => setNewReleaseName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0D14] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bastion-blue"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Campaign Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Embargoed until Johannesburg Stock Exchange (JSE) and NYSE simultaneous market open."
                  value={newReleaseDescription}
                  onChange={(e) => setNewReleaseDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0D14] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bastion-blue"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Scheduled Drop Date &amp; Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={newReleaseDate}
                  onChange={(e) => setNewReleaseDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0D14] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bastion-blue font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Leave blank to keep as a manual draft release. If scheduled, the automated release engine will publish upon reaching this timestamp.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`
                  }}
                  className="px-5 py-2 rounded-xl text-white font-bold hover:opacity-95 transition cursor-pointer disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Release Bundle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {addItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111726] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-bastion-blue dark:text-sky-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Bundle Content Item
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddItemModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 2026 Production Results Landing"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0D14] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bastion-blue"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Content Type
                  </label>
                  <select
                    value={newItemType}
                    onChange={(e) => setNewItemType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0D14] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bastion-blue"
                  >
                    <option value="page">Page</option>
                    <option value="article">Article / SENS</option>
                    <option value="dynamic_zone">Dynamic Zone</option>
                    <option value="operation">Operation</option>
                    <option value="report">Financial Report</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target ID / Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. page_home"
                    value={newItemId}
                    onChange={(e) => setNewItemId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0D14] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bastion-blue font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Revision Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Updated guidance metrics bar and hero banner"
                  value={newItemSummary}
                  onChange={(e) => setNewItemSummary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0D14] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bastion-blue"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAddItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingItem}
                  className="px-5 py-2 rounded-xl text-white font-bold bg-bastion-blue hover:bg-bastion-blue/90 cursor-pointer disabled:opacity-50"
                >
                  {addingItem ? 'Adding...' : 'Bundle Into Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
