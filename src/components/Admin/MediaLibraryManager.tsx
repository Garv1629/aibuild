/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Film,
  Search,
  Filter,
  Play,
  X,
  AlertCircle,
  Cloud,
  HardDrive,
  Info,
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext.tsx';
import { MediaAsset } from '../../utils/portfolio.ts';
import { uploadMediaFile, deleteMediaFile } from '../../services/storage.ts';
import { isSupabaseConfigured } from '../../services/supabase.ts';
import { useAuth } from '../../context/AuthContext.tsx';

export const MediaLibraryManager: React.FC = () => {
  const { data, addMediaAsset, updateMediaAsset, deleteMediaAsset } = usePortfolio();
  const { session } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const assets = data.mediaAssets || [];

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.tags && asset.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesType = filterType === 'all' ? true : asset.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalBytes = assets.reduce((acc, a) => acc + (a.sizeBytes || 0), 0);
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadMediaFile(file, { authToken: session?.token });
        addMediaAsset(res.asset);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to upload media asset.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyUrl = (asset: MediaAsset) => {
    navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    const target = assets.find((a) => a.id === id);
    if (target) {
      await deleteMediaFile(target, session?.token);
      deleteMediaAsset(id);
    }
    setConfirmDeleteId(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-body">
      {/* Top Banner: Storage Status & Metric Overview */}
      <div className="p-5 rounded-3xl liquid-glass border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white tracking-tight">
              Media & Creative Assets Library
            </h3>
            {isSupabaseConfigured ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span>Supabase Storage Connected</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-amber-400" />
                <span>Local Persistent Storage Mode</span>
              </span>
            )}
          </div>
          <p className="text-xs text-muted max-w-xl leading-relaxed">
            Upload, preview, organize, and copy direct links for images and videos across your web development, AI video, UGC video, and e-book showcases.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-2 rounded-2xl bg-white/[0.03] border border-white/10 text-right">
            <div className="text-[10px] font-mono text-white/50">Total Assets</div>
            <div className="text-lg font-display text-white">{assets.length} items</div>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-white/[0.03] border border-white/10 text-right">
            <div className="text-[10px] font-mono text-white/50">Storage Used</div>
            <div className="text-lg font-display text-sky-300">{formatBytes(totalBytes)}</div>
          </div>
        </div>
      </div>

      {/* Cloud Configuration Notice when not connected */}
      {!isSupabaseConfigured && (
        <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-400/20 flex items-start gap-3">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs text-white/80 leading-relaxed font-mono">
            <strong className="text-white">Supabase Cloud Storage Note:</strong> Uploaded assets currently persist in browser storage. To enable permanent cross-device cloud storage with global CDN delivery, add <code className="text-sky-300 bg-black/40 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="text-sky-300 bg-black/40 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> to your <code className="text-sky-300 bg-black/40 px-1 py-0.5 rounded">.env</code> file.
          </div>
        </div>
      )}

      {/* Upload Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all ${
          isDragOver
            ? 'border-sky-400 bg-sky-500/10 scale-[1.01]'
            : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.03]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
            {isUploading ? (
              <span className="w-5 h-5 border-2 border-sky-300/30 border-t-sky-300 rounded-full animate-spin" />
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white">
              {isUploading ? 'Uploading & Processing Media Asset...' : 'Upload Media to Portfolio Library'}
            </h4>
            <p className="text-xs text-muted mt-1 font-mono">
              Drag & drop images (JPG, PNG, WebP, SVG) or videos (MP4, WebM) here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sky-400 hover:text-sky-300 underline underline-offset-2 cursor-pointer font-medium"
              >
                browse local files
              </button>
            </p>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono text-white/40 pt-1">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-sky-400" />
              <span>Images up to 25MB</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Film className="w-3 h-3 text-sky-400" />
              <span>Videos up to 100MB</span>
            </span>
          </div>
        </div>

        {uploadError && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-mono flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl liquid-glass flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets by title, filename, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full liquid-glass-input text-xs font-mono pl-9 pr-3 py-2 rounded-xl text-white placeholder-white/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono cursor-pointer transition-all ${
              filterType === 'all'
                ? 'liquid-glass-pill-active text-white font-medium shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            All ({assets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('image')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono cursor-pointer transition-all flex items-center gap-1 ${
              filterType === 'image'
                ? 'liquid-glass-pill-active text-white font-medium shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-3 h-3 text-sky-400" />
            <span>Images ({assets.filter((a) => a.type === 'image').length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('video')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono cursor-pointer transition-all flex items-center gap-1 ${
              filterType === 'video'
                ? 'liquid-glass-pill-active text-white font-medium shadow-md'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Video className="w-3 h-3 text-sky-400" />
            <span>Videos ({assets.filter((a) => a.type === 'video').length})</span>
          </button>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="liquid-glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-white/25 transition-all group flex flex-col justify-between"
          >
            {/* Media Preview Box */}
            <div className="relative aspect-video bg-black/60 overflow-hidden cursor-pointer" onClick={() => setPreviewAsset(asset)}>
              {asset.type === 'video' ? (
                <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-tr from-slate-900 to-indigo-950">
                  <video
                    src={asset.url}
                    muted
                    preload="metadata"
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-black/60 border border-white/30 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-sky-500/80 transition-all shadow-lg">
                      <Play className="w-4 h-4 ml-0.5 fill-current" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 left-2 text-[9px] font-mono px-2 py-0.5 rounded-md bg-black/80 text-white/90 flex items-center gap-1">
                    <Film className="w-3 h-3 text-sky-400" />
                    <span>Video</span>
                  </span>
                </div>
              ) : (
                <img
                  src={asset.url}
                  alt={asset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}

              {/* Provider Badge */}
              <span className="absolute top-2 right-2 text-[9px] font-mono px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-white/80 border border-white/10">
                {asset.storageProvider === 'supabase' ? 'Cloud' : 'Local'}
              </span>
            </div>

            {/* Asset Metadata & Actions */}
            <div className="p-3.5 space-y-2.5">
              <div>
                <h4 className="text-xs font-semibold text-white truncate" title={asset.title}>
                  {asset.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40 mt-0.5">
                  <span className="truncate max-w-[130px]">{asset.fileName}</span>
                  <span>{formatBytes(asset.sizeBytes)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(asset)}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    copiedId === asset.id
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50'
                      : 'liquid-glass-pill text-white/80 hover:text-white hover:bg-white/15'
                  }`}
                  title="Copy permanent media URL to clipboard"
                >
                  {copiedId === asset.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-sky-400" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewAsset(asset)}
                  className="p-1.5 rounded-xl liquid-glass-pill hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                  title="Preview media in high-resolution"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(asset.id)}
                  className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                  title="Delete media asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="p-12 text-center liquid-glass rounded-3xl text-muted text-xs font-mono space-y-2">
          <p>No media assets found matching the selected criteria.</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-sky-400 hover:text-sky-300 underline underline-offset-2"
          >
            Upload your first media file
          </button>
        </div>
      )}

      {/* High-Resolution Preview Modal */}
      {previewAsset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-4xl w-full liquid-glass-modal rounded-3xl overflow-hidden border border-white/20 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h4 className="text-sm font-semibold text-white">{previewAsset.title}</h4>
                <p className="text-[11px] font-mono text-white/50">{previewAsset.fileName} • {formatBytes(previewAsset.sizeBytes)}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="p-1.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[65vh] flex items-center justify-center overflow-hidden rounded-2xl bg-black/60">
              {previewAsset.type === 'video' ? (
                <video
                  src={previewAsset.url}
                  controls
                  autoPlay
                  className="max-h-[65vh] w-auto max-w-full rounded-xl"
                />
              ) : (
                <img
                  src={previewAsset.url}
                  alt={previewAsset.title}
                  className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl"
                />
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <input
                type="text"
                readOnly
                value={previewAsset.url}
                className="liquid-glass-input text-xs font-mono px-3 py-1.5 rounded-xl text-white/80 w-3/4 truncate"
              />
              <button
                type="button"
                onClick={() => handleCopyUrl(previewAsset)}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy URL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="liquid-glass-modal rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border border-white/20 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center border border-red-500/30">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-semibold text-white">Delete Media Asset?</h4>
            <p className="text-xs text-muted leading-relaxed font-mono">
              Are you sure you want to permanently delete this media asset? References in existing projects may become broken.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl liquid-glass-pill text-white text-xs font-mono hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-semibold cursor-pointer shadow-md"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
