'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
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
  Target
} from 'lucide-react';

export default function AdminMediaPage() {
  const { user } = useAdminAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

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

  const loadAssets = React.useCallback(async () => {
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (formatFilter !== 'all') q.set('mime', formatFilter);
      if (selectedFolder !== 'all') q.set('folder', selectedFolder);

      const res = await fetch(`/api/admin/media?${q.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setAssets(json.assets || []);
        if (json.folders && json.folders.length > 0) {
          setFolders(json.folders);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, formatFilter, selectedFolder]);

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

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
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
          focal_y: editFocalY
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
        loadAssets();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
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

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setUploadSuccess(true);
      setFileToUpload(null);
      setUploadAlt('');
      loadAssets();
      setTimeout(() => {
        setUploadSuccess(false);
        setShowUpload(false);
      }, 2500);
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
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
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#C99700] uppercase font-bold tracking-wider mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>Digital Asset Management (DAM) &bull; Focal Point Cropping</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Corporate Media Lake</h1>
          <p className="text-xs text-gray-400 mt-1">
            Subject-aware hotspot cropping, folder categorization, and automated multi-aspect ratio rendering.
          </p>
        </div>

        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:from-[#E5BE48] hover:to-[#C49534] text-black font-semibold text-xs transition shadow-md shadow-[#C99700]/20 flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Media Asset</span>
        </button>
      </div>

      {/* Upload Drawer / Form */}
      {showUpload && (
        <form
          onSubmit={handleUploadSubmit}
          className="p-6 rounded-2xl bg-[#0F1726] border border-[#23354E] space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#23354E] pb-3">
            <span className="font-bold text-sm text-white">Upload New Asset</span>
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Target Folder
              </label>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C99700]"
              >
                <option value="corporate">Corporate &amp; Board</option>
                <option value="operations">Operations &amp; Facilities</option>
                <option value="sustainability">Sustainability &amp; ESG</option>
                <option value="brand">Brand DNA &amp; Logos</option>
                <option value="sens">SENS &amp; Disclosures</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Select File (JPG, PNG, SVG, PDF)
              </label>
              <input
                type="file"
                required
                onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
                className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl p-2 text-xs text-gray-300 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#142033] file:text-[#E6C657] hover:file:bg-[#1E2E48]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Initial Alt Text (WCAG)
              </label>
              <input
                type="text"
                value={uploadAlt}
                onChange={(e) => setUploadAlt(e.target.value)}
                placeholder="Describe image or document purpose..."
                className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C99700]"
              />
            </div>
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs">
              {uploadError}
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs">
              Asset uploaded and cataloged in Bastion Media Lake!
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !fileToUpload}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38728] hover:from-[#E5BE48] hover:to-[#C49534] text-black font-semibold text-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? 'Uploading & Processing...' : 'Upload Asset'}
            </button>
          </div>
        </form>
      )}

      {/* DAM Folder Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0B1019] border border-[#1C2638] space-y-3">
        {/* Folder Navigation Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Folder className="w-3.5 h-3.5 text-[#C99700]" />
            <span>Folders:</span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedFolder('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
              selectedFolder === 'all'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-[#141C2A] text-gray-400 hover:text-white hover:bg-[#1A2536]'
            }`}
          >
            <span>All Assets</span>
            <span className="text-[10px] opacity-75 font-mono">({assets.length})</span>
          </button>

          {[
            { id: 'corporate', name: 'Corporate & Board', slug: 'corporate' },
            { id: 'operations', name: 'Operations & Facilities', slug: 'operations' },
            { id: 'sustainability', name: 'Sustainability & ESG', slug: 'sustainability' },
            { id: 'brand', name: 'Brand DNA & Logos', slug: 'brand' },
            { id: 'sens', name: 'SENS & Disclosures', slug: 'sens' }
          ].map((fld) => (
            <button
              key={fld.id}
              type="button"
              onClick={() => setSelectedFolder(fld.slug)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center space-x-1.5 ${
                selectedFolder === fld.slug
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-[#141C2A] text-gray-400 hover:text-white hover:bg-[#1A2536]'
              }`}
            >
              <span>{fld.name}</span>
            </button>
          ))}
        </div>

        {/* Filter / Search Bar */}
        <div className="pt-2 border-t border-[#1C2638] flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadAssets()}
              placeholder="Search assets by filename or alt text..."
              className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C99700]"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
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
                    ? 'bg-[#C99700]/20 text-[#E6C657] border border-[#C99700]/40 font-semibold'
                    : 'bg-[#0E1522] text-gray-400 hover:text-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Media Assets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {assets.map((asset) => {
          const isPdf = asset.mime_type?.includes('pdf') || asset.filename.endsWith('.pdf');
          const isImage = !isPdf;
          const fx = Math.round((asset.focal_x ?? 0.5) * 100);
          const fy = Math.round((asset.focal_y ?? 0.5) * 100);

          return (
            <div
              key={asset.id}
              onClick={() => handleSelect(asset)}
              className="group bg-[#0B1019] border border-[#1C2638] hover:border-sky-500/70 rounded-2xl overflow-hidden cursor-pointer transition flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full bg-[#070B12] flex items-center justify-center overflow-hidden">
                {isImage ? (
                  <>
                    <img
                      src={asset.url}
                      alt={asset.alt_text || asset.filename}
                      className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                      style={{ objectPosition: `${fx}% ${fy}%` }}
                    />
                    {/* Focal point indicator dot on hover */}
                    <div
                      className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-sky-400 ring-2 ring-white opacity-0 group-hover:opacity-100 transition pointer-events-none"
                      style={{ left: `${fx}%`, top: `${fy}%` }}
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <FileText className="w-10 h-10 text-red-400 mb-1" />
                    <span className="text-[10px] font-mono text-gray-400 uppercase">PDF Report</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/80 text-sky-300 border border-sky-500/30 backdrop-blur-sm">
                    {asset.mime_type.split('/')[1] || 'asset'}
                  </span>
                </div>
              </div>

              <div className="p-3 border-t border-[#1C2638]">
                <div className="text-xs font-semibold text-white truncate group-hover:text-sky-400 transition">
                  {asset.filename}
                </div>
                <div className="text-[10px] text-gray-500 font-mono mt-0.5 flex items-center justify-between">
                  <span>{(asset.size_bytes / 1024).toFixed(1)} KB</span>
                  {isImage && (
                    <span className="text-sky-400/80 font-mono text-[9px] flex items-center gap-0.5">
                      <Target className="w-2.5 h-2.5" />
                      <span>{fx}:{fy}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Asset Inspection & Focal Point Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0B1019] border border-[#1E2B3E] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#1E2B3E] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-sm text-white truncate max-w-md">{selectedAsset.filename}</span>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A2536] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Interactive Focal Point Picker for Images */}
              {!selectedAsset.mime_type?.includes('pdf') ? (
                <div className="p-4 rounded-xl bg-[#080D14] border border-[#1C2638]">
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
                <div className="py-12 flex flex-col items-center bg-[#070B12] rounded-xl border border-[#1A2536]">
                  <FileText className="w-16 h-16 text-red-400 mb-2" />
                  <span className="text-sm font-semibold text-white">Document Asset (PDF)</span>
                </div>
              )}

              {/* Folder Assignment & URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                    Assign to Folder
                  </label>
                  <select
                    value={editFolderId}
                    onChange={(e) => setEditFolderId(e.target.value)}
                    className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="corporate">Corporate &amp; Board</option>
                    <option value="operations">Operations &amp; Facilities</option>
                    <option value="sustainability">Sustainability &amp; ESG</option>
                    <option value="brand">Brand DNA &amp; Logos</option>
                    <option value="sens">SENS &amp; Disclosures</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                    Public CDN Asset URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={selectedAsset.url}
                      className="flex-1 bg-[#080D14] border border-[#202C3F] rounded-xl px-3 py-2 text-xs font-mono text-gray-300 truncate"
                    />
                    <button
                      onClick={() => handleCopy(selectedAsset.url)}
                      className="px-3 py-2 rounded-xl bg-[#142033] hover:bg-[#1C2C44] border border-[#22334D] text-xs font-semibold text-sky-300 transition flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedUrl === selectedAsset.url ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
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
                  <label className="text-[11px] uppercase font-bold text-gray-400">
                    Alt Text (WCAG 2.2 AA Accessibility)
                  </label>
                  <span className="text-[10px] text-emerald-400">Required for SEO &amp; Screen Readers</span>
                </div>
                <input
                  type="text"
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                  placeholder="Describe image content for accessibility..."
                  className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="block text-[11px] uppercase font-bold text-gray-400 mb-1">
                  Caption / Editorial Description
                </label>
                <textarea
                  rows={2}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Asset metadata and focal point updated successfully!</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#1E2B3E] bg-[#0E1522] flex items-center justify-between">
              <a
                href={selectedAsset.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-gray-400 hover:text-white flex items-center space-x-1"
              >
                <span>Open Raw File</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={handleSaveMetadata}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs transition shadow-md shadow-sky-950/50 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save Changes & Focal Point'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
