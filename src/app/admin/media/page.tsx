'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import { FocalPointPicker } from '@/components/studio/FocalPointPicker';
import {
  Image as ImageIcon,
  Search,
  Filter,
  Copy,
  Check,
  FileText,
  ExternalLink,
  Shield,
  Layers,
  UploadCloud,
  X,
  Folder,
  FolderOpen,
  Target,
  AlertCircle,
  Trash2,
  Eye,
  Download,
  SlidersHorizontal,
  ArrowUpDown,
  CheckSquare,
  Square,
  Sparkles,
  RefreshCw,
  FolderInput
} from 'lucide-react';

export default function AdminMediaPage() {
  const { user } = useAdminAuth();
  const { activeClient, portalViewMode } = useStudioWorkspace();
  const isClientPortal = portalViewMode === 'client';

  const [assets, setAssets] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Selection & Bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkFolderTarget, setBulkFolderTarget] = useState('corporate');

  // Inspection / Metadata Modal State
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Quick Preview / Lightbox Modal State
  const [previewAsset, setPreviewAsset] = useState<any>(null);

  // Delete Confirmation State
  const [assetToDelete, setAssetToDelete] = useState<any | null>(null);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadFolder, setUploadFolder] = useState('corporate');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Edit metadata & focal point state
  const [editAlt, setEditAlt] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editFolderId, setEditFolderId] = useState('corporate');
  const [editFocalX, setEditFocalX] = useState(0.5);
  const [editFocalY, setEditFocalY] = useState(0.5);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Available folder taxonomy based on corporate client vs agency view
  const availableFolders = isClientPortal
    ? [
        { id: 'corporate', name: 'Corporate & Leadership', slug: 'corporate' },
        { id: 'operations', name: 'Operations & Facilities', slug: 'operations' },
        { id: 'sustainability', name: 'Sustainability & ESG', slug: 'sustainability' },
        { id: 'brand', name: 'Brand Assets & Logos', slug: 'brand' },
        { id: 'documents', name: 'Documents & Reports', slug: 'documents' }
      ]
    : [
        { id: 'corporate', name: 'Corporate & Board', slug: 'corporate' },
        { id: 'operations', name: 'Operations & Facilities', slug: 'operations' },
        { id: 'sustainability', name: 'Sustainability & ESG', slug: 'sustainability' },
        { id: 'brand', name: 'Brand DNA & Logos', slug: 'brand' },
        { id: 'sens', name: 'SENS & Disclosures', slug: 'sens' }
      ];

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAssets = React.useCallback(async () => {
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (formatFilter !== 'all') q.set('mime', formatFilter);
      if (selectedFolder !== 'all') q.set('folder', selectedFolder);
      if (sortBy) q.set('sort', sortBy);
      if (activeClient?.id) q.set('clientId', activeClient.id);

      const res = await fetch(`/api/admin/media?${q.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setAssets(json.assets || []);
        if (json.folders && json.folders.length > 0) {
          setFolders(json.folders);
        }
        if (json.folderCounts) {
          setFolderCounts(json.folderCounts);
        }
      }
    } catch (err) {
      console.error('Failed to load media assets:', err);
    } finally {
      setLoading(false);
    }
  }, [search, formatFilter, selectedFolder, sortBy, activeClient?.id]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  const handleSelect = (asset: any) => {
    setSelectedAsset(asset);
    setEditAlt(asset.alt_text || '');
    setEditCaption(asset.caption || '');
    setEditFolderId(asset.folder_id || 'corporate');
    setEditFocalX(typeof asset.focal_x === 'number' ? asset.focal_x : 0.5);
    setEditFocalY(typeof asset.focal_y === 'number' ? asset.focal_y : 0.5);
    setSaveSuccess(false);
  };

  const handleCopy = (url: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    showToast('Asset CDN URL copied to clipboard!');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const toggleSelectAsset = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === assets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(assets.map((a) => a.id));
    }
  };

  const handleSaveMetadata = async () => {
    if (!selectedAsset) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/media', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAsset.id,
          alt_text: editAlt,
          caption: editCaption,
          folder_id: editFolderId,
          focal_x: editFocalX,
          focal_y: editFocalY,
          clientId: activeClient?.id
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setSelectedAsset({
          ...selectedAsset,
          alt_text: editAlt,
          caption: editCaption,
          folder_id: editFolderId,
          focal_x: editFocalX,
          focal_y: editFocalY
        });
        showToast('Asset metadata & focal point updated successfully!');
        loadAssets();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update asset metadata', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/media?id=${encodeURIComponent(assetToDelete.id)}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== assetToDelete.id));
        setSelectedIds((prev) => prev.filter((id) => id !== assetToDelete.id));
        if (selectedAsset?.id === assetToDelete.id) {
          setSelectedAsset(null);
        }
        if (previewAsset?.id === assetToDelete.id) {
          setPreviewAsset(null);
        }
        showToast(`Asset "${assetToDelete.filename}" deleted successfully.`);
        setAssetToDelete(null);
        loadAssets();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete asset', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting asset', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeleting(true);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`Deleted ${data.deletedCount || selectedIds.length} assets.`);
        setSelectedIds([]);
        setShowBatchDeleteModal(false);
        loadAssets();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete selected assets', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error during batch deletion', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBatchMove = async (targetFolder: string) => {
    if (selectedIds.length === 0) return;
    try {
      for (const id of selectedIds) {
        await fetch('/api/admin/media', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, folder_id: targetFolder, clientId: activeClient?.id })
        });
      }
      showToast(`Moved ${selectedIds.length} assets to folder.`);
      setSelectedIds([]);
      loadAssets();
    } catch (err) {
      showToast('Failed to move assets', 'error');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      if (uploadAlt) formData.append('alt_text', uploadAlt);
      if (uploadFolder) formData.append('folder_id', uploadFolder);
      if (activeClient?.id) formData.append('clientId', activeClient.id);

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setUploadSuccess(true);
      setFileToUpload(null);
      setUploadAlt('');
      showToast(`Asset "${data.asset?.filename || 'File'}" uploaded successfully!`);
      loadAssets();
      setTimeout(() => {
        setUploadSuccess(false);
        setShowUpload(false);
      }, 2000);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-3 rounded-xl border shadow-xl flex items-center space-x-2 text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200/80 dark:border-[#1C2638] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-sky-600 dark:text-sky-400 uppercase font-bold tracking-wider mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>Digital Asset Management (DAM) &bull; Focal Point Cropping</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Corporate Media &amp; Asset Library
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Subject-aware hotspot cropping, folder categorization, and automated multi-aspect ratio rendering.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            type="button"
            onClick={loadAssets}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#141C2A] dark:hover:bg-[#1E2838] dark:text-gray-300 border border-slate-200 dark:border-[#202C3F] transition cursor-pointer"
            title="Refresh Asset Library"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-white font-semibold text-xs transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Media Asset</span>
          </button>
        </div>
      </div>

      {/* Upload Drawer / Form */}
      {showUpload && (
        <form
          onSubmit={handleUploadSubmit}
          className="p-6 rounded-2xl bg-white dark:bg-[#0F1726] border border-slate-200 dark:border-[#23354E] shadow-sm space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#23354E] pb-3">
            <span className="font-bold text-sm text-slate-900 dark:text-white">Upload New Asset</span>
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Target Folder
              </label>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#080D14] border border-slate-200 dark:border-[#202C3F] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              >
                {availableFolders.map((fld) => (
                  <option key={fld.id} value={fld.slug}>
                    {fld.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Select File (JPG, PNG, SVG, PDF)
              </label>
              <input
                type="file"
                required
                onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                className="w-full bg-slate-50 dark:bg-[#080D14] border border-slate-200 dark:border-[#202C3F] rounded-xl p-2 text-xs text-slate-700 dark:text-gray-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 dark:file:bg-[#142033] dark:file:text-sky-300 hover:file:bg-slate-300 dark:hover:file:bg-[#1E2E48]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Initial Alt Text (WCAG)
              </label>
              <input
                type="text"
                value={uploadAlt}
                onChange={(e) => setUploadAlt(e.target.value)}
                placeholder="Describe image or document purpose..."
                className="w-full bg-slate-50 dark:bg-[#080D14] border border-slate-200 dark:border-[#202C3F] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-red-950/80 dark:border-red-800 dark:text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Asset uploaded and cataloged in Media Lake!</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !fileToUpload}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-sky-500 dark:hover:bg-sky-400 font-semibold text-xs transition disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isUploading ? 'Uploading & Processing...' : 'Upload Asset'}
            </button>
          </div>
        </form>
      )}

      {/* DAM Folder Tabs & Search/Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200/80 dark:border-[#1C2638] shadow-xs space-y-3">
        {/* Folder Navigation Chips (hidden scrollbar for clean appearance) */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0">
            <Folder className="w-3.5 h-3.5 text-sky-500" />
            <span>Folders:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedFolder('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              selectedFolder === 'all'
                ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#141C2A] dark:text-gray-400 dark:hover:text-white dark:hover:bg-[#1A2536]'
            }`}
          >
            <span>All Assets</span>
            <span className="text-[10px] opacity-75 font-mono">({assets.length})</span>
          </button>

          {availableFolders.map((fld) => {
            const count = folderCounts[fld.slug] ?? 0;
            return (
              <button
                key={fld.id}
                type="button"
                onClick={() => setSelectedFolder(fld.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 shrink-0 ${
                  selectedFolder === fld.slug
                    ? 'bg-slate-900 text-white dark:bg-sky-500 dark:text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#141C2A] dark:text-gray-400 dark:hover:text-white dark:hover:bg-[#1A2536]'
                }`}
              >
                <span>{fld.name}</span>
                {count > 0 && <span className="text-[10px] opacity-75 font-mono">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Filter / Search Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#1C2638] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 dark:text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadAssets()}
              placeholder="Search assets by filename or alt text..."
              className="w-full bg-slate-50 dark:bg-[#080D14] border border-slate-200 dark:border-[#202C3F] rounded-xl pl-10 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-sky-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Format Chips */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'All Formats' },
                { id: 'image', label: 'Images (JPG/PNG)' },
                { id: 'svg', label: 'Vectors (SVG)' },
                { id: 'pdf', label: 'Documents (PDF)' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormatFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                    formatFilter === f.id
                      ? 'bg-slate-900 text-white dark:bg-sky-500/20 dark:text-sky-300 dark:border dark:border-sky-500/40 font-semibold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-[#0E1522] dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center space-x-1 pl-2 border-l border-slate-200 dark:border-slate-800">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-100 dark:bg-[#0E1522] border border-slate-200 dark:border-[#1E2B3E] rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name_asc">Name (A-Z)</option>
                <option value="name_desc">Name (Z-A)</option>
                <option value="size_desc">Size (Largest)</option>
                <option value="size_asc">Size (Smallest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Multi-Select Floating Action Bar */}
        {selectedIds.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-[#1C2638] flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-[#101726] p-3 rounded-xl">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-white">
              <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px]">
                {selectedIds.length}
              </span>
              <span>{selectedIds.length === 1 ? '1 asset selected' : `${selectedIds.length} assets selected`}</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <select
                  value={bulkFolderTarget}
                  onChange={(e) => setBulkFolderTarget(e.target.value)}
                  className="bg-white dark:bg-[#080D14] border border-slate-200 dark:border-[#202C3F] rounded-lg px-2.5 py-1 text-xs text-slate-800 dark:text-white focus:outline-none"
                >
                  {availableFolders.map((f) => (
                    <option key={f.id} value={f.slug}>
                      Move to {f.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleBatchMove(bulkFolderTarget)}
                  className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer"
                >
                  Apply Move
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(true)}
                className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 dark:border-rose-800 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {assets.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0B1019] border border-slate-200/80 dark:border-[#1C2638] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div className="text-sm font-semibold text-slate-900 dark:text-white">No media assets found</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {search
              ? 'Try adjusting your search query or format filter.'
              : 'Upload your first corporate asset to begin managing high-res images and documents.'}
          </p>
          {!search && (
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-sky-500 text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload First Asset</span>
            </button>
          )}
        </div>
      )}

      {/* Select All Bar (when assets exist) */}
      {assets.length > 0 && (
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center space-x-1.5 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            {selectedIds.length === assets.length ? (
              <CheckSquare className="w-4 h-4 text-sky-500" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>Select All ({assets.length} assets)</span>
          </button>

          <span className="text-[11px] font-mono">
            Showing {assets.length} {assets.length === 1 ? 'asset' : 'assets'}
          </span>
        </div>
      )}

      {/* Grid of Media Assets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {assets.map((asset) => {
          const isPdf = asset.mime_type?.includes('pdf') || asset.filename.endsWith('.pdf');
          const isImage = !isPdf;
          const fx = Math.round((asset.focal_x ?? 0.5) * 100);
          const fy = Math.round((asset.focal_y ?? 0.5) * 100);
          const hasImgError = imgErrors[asset.id];
          const isSelected = selectedIds.includes(asset.id);

          return (
            <div
              key={asset.id}
              onClick={() => handleSelect(asset)}
              className={`group relative bg-white dark:bg-[#0B1019] border rounded-2xl overflow-hidden cursor-pointer transition shadow-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                  : 'border-slate-200/80 dark:border-[#1C2638] hover:border-slate-400 dark:hover:border-sky-500/70'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-square w-full bg-slate-100 dark:bg-[#070B12] flex items-center justify-center overflow-hidden">
                {isImage && !hasImgError ? (
                  <>
                    <img
                      src={asset.url}
                      alt={asset.alt_text || asset.filename}
                      onError={() => setImgErrors((prev) => ({ ...prev, [asset.id]: true }))}
                      className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                      style={{ objectPosition: `${fx}% ${fy}%` }}
                    />
                    {/* Focal point indicator dot on hover */}
                    <div
                      className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-sky-400 ring-2 ring-white opacity-0 group-hover:opacity-100 transition pointer-events-none"
                      style={{ left: `${fx}%`, top: `${fy}%` }}
                    />
                  </>
                ) : isPdf ? (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <FileText className="w-10 h-10 text-rose-500 mb-1" />
                    <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase">
                      PDF Document
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <ImageIcon className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-1" />
                    <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 uppercase">
                      {asset.filename.split('.').pop() || 'IMAGE'}
                    </span>
                  </div>
                )}

                {/* Selection Checkbox (always visible if selected, or on hover) */}
                <button
                  type="button"
                  onClick={(e) => toggleSelectAsset(asset.id, e)}
                  className={`absolute top-2 left-2 z-10 p-1 rounded-md transition ${
                    isSelected
                      ? 'bg-sky-500 text-white opacity-100'
                      : 'bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70'
                  }`}
                  title={isSelected ? 'Deselect asset' : 'Select asset'}
                >
                  {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                </button>

                {/* Format Tag */}
                <div className="absolute top-2 right-2 opacity-90 group-hover:opacity-100 transition pointer-events-none">
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/75 text-white border border-white/20 backdrop-blur-xs">
                    {asset.mime_type ? asset.mime_type.split('/')[1] : 'asset'}
                  </span>
                </div>

                {/* Hover Quick Action Buttons */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewAsset(asset);
                    }}
                    className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-md transition hover:scale-105 cursor-pointer"
                    title="Quick Preview Lightbox"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleCopy(asset.url, e)}
                    className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-md transition hover:scale-105 cursor-pointer"
                    title="Copy Public CDN URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(asset);
                    }}
                    className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-md transition hover:scale-105 cursor-pointer"
                    title="Edit Focal Point & Metadata"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAssetToDelete(asset);
                    }}
                    className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-md transition hover:scale-105 cursor-pointer"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Meta Footer */}
              <div className="p-3 bg-white dark:bg-[#0B1019] border-t border-slate-100 dark:border-[#1C2638]">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                  {asset.filename}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-gray-400 font-mono mt-0.5 flex items-center justify-between">
                  <span>{(asset.size_bytes / 1024).toFixed(1)} KB</span>
                  {isImage && (
                    <span className="text-sky-600 dark:text-sky-400 font-mono text-[9px] flex items-center gap-0.5">
                      <Target className="w-2.5 h-2.5" />
                      <span>
                        {fx}:{fy}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK PREVIEW / LIGHTBOX MODAL */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0B1019] border border-slate-200 dark:border-[#1E2B3E] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-[#1E2B3E] flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <ImageIcon className="w-4 h-4 text-sky-500 shrink-0" />
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {previewAsset.filename}
                </span>
                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                  {(previewAsset.size_bytes / 1024).toFixed(1)} KB
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media Canvas */}
            <div className="flex-1 bg-slate-100 dark:bg-[#05070C] p-4 flex items-center justify-center overflow-auto min-h-[300px]">
              {!previewAsset.mime_type?.includes('pdf') ? (
                <img
                  src={previewAsset.url}
                  alt={previewAsset.alt_text || previewAsset.filename}
                  className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg"
                />
              ) : (
                <div className="p-8 text-center bg-white dark:bg-[#0B1019] rounded-xl border border-slate-200 dark:border-[#1E2B3E] space-y-3">
                  <FileText className="w-16 h-16 text-rose-500 mx-auto" />
                  <div className="text-sm font-bold text-slate-900 dark:text-white">PDF Document</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click below to open or download the complete PDF disclosure.
                  </p>
                  <a
                    href={previewAsset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-sky-500 text-xs font-semibold shadow-xs"
                  >
                    <span>Open PDF in New Tab</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-slate-200 dark:border-[#1E2B3E] bg-slate-50 dark:bg-[#0E1522] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px] truncate max-w-xs">
                {previewAsset.url}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleCopy(previewAsset.url)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 dark:bg-[#141E2D] dark:hover:bg-[#1E2E44] border border-slate-200 dark:border-[#24354D] text-slate-700 dark:text-slate-200 font-medium transition flex items-center space-x-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>

                <a
                  href={previewAsset.url}
                  download={previewAsset.filename}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 dark:bg-[#141E2D] dark:hover:bg-[#1E2E44] border border-slate-200 dark:border-[#24354D] text-slate-700 dark:text-slate-200 font-medium transition flex items-center space-x-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const toEdit = previewAsset;
                    setPreviewAsset(null);
                    handleSelect(toEdit);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-sky-600 dark:hover:bg-sky-500 font-medium transition flex items-center space-x-1 cursor-pointer shadow-xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Edit Crop &amp; Meta</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const toDelete = previewAsset;
                    setPreviewAsset(null);
                    setAssetToDelete(toDelete);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 dark:border-rose-800 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL ASSET INSPECTION & FOCAL POINT MODAL */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0B1019] border border-slate-200 dark:border-[#1E2B3E] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-[#1E2B3E] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-sky-500" />
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-md">
                  {selectedAsset.filename}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAsset(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1A2536] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Interactive Focal Point Picker for Images */}
              {!selectedAsset.mime_type?.includes('pdf') ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#080D14] border border-slate-200 dark:border-[#1C2638]">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
                    <span>Interactive Focal Point (Click image to reposition subject hotspot)</span>
                    <span className="font-mono text-sky-600 dark:text-sky-400 text-[11px]">
                      {Math.round(editFocalX * 100)}% : {Math.round(editFocalY * 100)}%
                    </span>
                  </div>
                  <FocalPointPicker
                    imageUrl={selectedAsset.url}
                    initialX={editFocalX}
                    initialY={editFocalY}
                    onChange={(x, y) => {
                      setEditFocalX(x);
                      setEditFocalY(y);
                    }}
                  />
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center bg-slate-50 dark:bg-[#070B12] rounded-xl border border-slate-200 dark:border-[#1A2536]">
                  <FileText className="w-16 h-16 text-rose-500 mb-2" />
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Document Asset (PDF)</span>
                </div>
              )}

              {/* Folder Assignment & URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-gray-400 mb-1">
                    Assign to Folder
                  </label>
                  <select
                    value={editFolderId}
                    onChange={(e) => setEditFolderId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#080D14] border border-slate-200 dark:border-[#202C3F] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  >
                    {availableFolders.map((fld) => (
                      <option key={fld.id} value={fld.slug}>
                        {fld.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-gray-400 mb-1">
                    Public CDN Asset URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedAsset.url}
                      className="flex-1 bg-slate-50 dark:bg-[#080D14] border border-slate-200 dark:border-[#202C3F] rounded-xl px-3 py-2 text-xs font-mono text-slate-700 dark:text-gray-300 truncate"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleCopy(selectedAsset.url, e)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-[#142033] dark:hover:bg-[#1C2C44] dark:border-[#22334D] text-xs font-semibold dark:text-sky-300 transition flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedUrl === selectedAsset.url ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Alt Text (WCAG Compliance) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] uppercase font-bold text-slate-600 dark:text-gray-400">
                    Alt Text (WCAG 2.2 AA Accessibility)
                  </label>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Required for SEO &amp; Screen Readers
                  </span>
                </div>
                <input
                  type="text"
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                  placeholder="Describe image content for accessibility..."
                  className="w-full bg-slate-50 dark:bg-[#080D14] border border-slate-200 dark:border-[#202C3F] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-slate-600 dark:text-gray-400 mb-1">
                  Caption / Editorial Description
                </label>
                <textarea
                  rows={2}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080D14] border border-slate-200 dark:border-[#202C3F] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Asset metadata and focal point updated successfully!</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-[#1E2B3E] bg-slate-50 dark:bg-[#0E1522] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <a
                  href={selectedAsset.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white flex items-center space-x-1"
                >
                  <span>Open Raw File</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const toDelete = selectedAsset;
                    setAssetToDelete(toDelete);
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Asset</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedAsset(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMetadata}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-gradient-to-r dark:from-sky-500 dark:to-indigo-600 dark:hover:from-sky-400 dark:hover:to-indigo-500 font-bold text-xs transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : 'Save Changes & Focal Point'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE ASSET DELETE CONFIRMATION MODAL */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-rose-900/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Media Asset?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-slate-800 dark:text-slate-200 font-mono">{assetToDelete.filename}</strong>?
                This will remove the file from your corporate storage lake. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-[#1E293B]">
              <button
                type="button"
                onClick={() => setAssetToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Asset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH DELETE CONFIRMATION MODAL */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0D121B] border border-slate-200 dark:border-rose-900/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete {selectedIds.length} Media Assets?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                You have selected {selectedIds.length} assets for deletion. This will permanently remove them from
                your corporate storage. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-[#1E293B]">
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : `Delete ${selectedIds.length} Assets`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
