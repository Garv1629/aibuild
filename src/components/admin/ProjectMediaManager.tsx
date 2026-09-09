import React, { useState, useRef } from 'react';
import { ServiceMediaItem } from '../../types';
import {
  Film,
  Image as ImageIcon,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Link as LinkIcon,
  Clock,
  Sparkles,
  AlertCircle,
  Check,
  X,
  Repeat,
  RefreshCw,
  ArrowLeftRight,
} from 'lucide-react';
import { processImageUpload, processVideoUpload, isVideoMedia } from '../../utils/mediaUpload';

interface ProjectMediaManagerProps {
  projectTitle: string;
  items: ServiceMediaItem[];
  onChange: (items: ServiceMediaItem[]) => void;
}

export const ProjectMediaManager: React.FC<ProjectMediaManagerProps> = ({
  projectTitle,
  items,
  onChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Add URL Modal State
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState<'video' | 'image'>('video');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlDuration, setUrlDuration] = useState(4);

  // Replace Modal State
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [replaceUrl, setReplaceUrl] = useState('');
  const [replaceType, setReplaceType] = useState<'video' | 'image'>('video');
  const [replaceTitle, setReplaceTitle] = useState('');
  const [replaceDuration, setReplaceDuration] = useState(4);

  // Global & Row Drag-and-Drop
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);
  const [dragOverRowIndex, setDragOverRowIndex] = useState<number | null>(null);

  // File Inputs
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const generalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Per-item replace file inputs
  const targetReplaceIndexRef = useRef<number | null>(null);
  const replaceSingleVideoInputRef = useRef<HTMLInputElement | null>(null);
  const replaceSinglePhotoInputRef = useRef<HTMLInputElement | null>(null);

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const addItems = (newItems: ServiceMediaItem[]) => {
    onChange([...items, ...newItems]);
    showNotification(`Added ${newItems.length} new ${newItems.length === 1 ? 'clip' : 'clips'} to playlist`);
  };

  // Bulk / Add Video Upload
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const added: ServiceMediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await processVideoUpload(file);
        added.push({
          id: `pvid-${Date.now()}-${i}`,
          type: 'video',
          url: dataUrl,
          title: file.name.replace(/\.[^/.]+$/, ''),
        });
      }
      addItems(added);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload video');
    } finally {
      setIsUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  // Bulk / Add Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const added: ServiceMediaItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await processImageUpload(file);
        added.push({
          id: `pimg-${Date.now()}-${i}`,
          type: 'image',
          url: dataUrl,
          title: file.name.replace(/\.[^/.]+$/, ''),
          duration: 4,
        });
      }
      addItems(added);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setIsUploading(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  // Global Drop
  const handleDropFiles = async (fileList: FileList) => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const added: ServiceMediaItem[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        if (file.type.startsWith('video/')) {
          const dataUrl = await processVideoUpload(file);
          added.push({
            id: `pvid-${Date.now()}-${i}`,
            type: 'video',
            url: dataUrl,
            title: file.name.replace(/\.[^/.]+$/, ''),
          });
        } else if (file.type.startsWith('image/')) {
          const dataUrl = await processImageUpload(file);
          added.push({
            id: `pimg-${Date.now()}-${i}`,
            type: 'image',
            url: dataUrl,
            title: file.name.replace(/\.[^/.]+$/, ''),
            duration: 4,
          });
        }
      }
      if (added.length > 0) {
        addItems(added);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to process dropped files');
    } finally {
      setIsUploading(false);
    }
  };

  // Add from URL
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const url = urlInput.trim();
    const resolvedType = isVideoMedia(url) ? 'video' : urlType;

    const newItem: ServiceMediaItem = {
      id: `purl-${Date.now()}`,
      type: resolvedType,
      url,
      title: urlTitle.trim() || `${projectTitle || 'Project'} ${resolvedType === 'video' ? 'Clip' : 'Visual'}`,
      duration: resolvedType === 'image' ? Number(urlDuration) || 4 : undefined,
    };

    addItems([newItem]);
    setUrlInput('');
    setUrlTitle('');
    setIsUrlModalOpen(false);
  };

  // Replace Single Item via File
  const triggerReplaceWithVideo = (index: number) => {
    targetReplaceIndexRef.current = index;
    if (replaceSingleVideoInputRef.current) {
      replaceSingleVideoInputRef.current.value = '';
      replaceSingleVideoInputRef.current.click();
    }
  };

  const triggerReplaceWithPhoto = (index: number) => {
    targetReplaceIndexRef.current = index;
    if (replaceSinglePhotoInputRef.current) {
      replaceSinglePhotoInputRef.current.value = '';
      replaceSinglePhotoInputRef.current.click();
    }
  };

  const handleSingleVideoReplaceSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = targetReplaceIndexRef.current;
    if (!file || index === null || index < 0 || index >= items.length) return;

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const dataUrl = await processVideoUpload(file);
      const updated = [...items];
      const prev = updated[index];
      updated[index] = {
        ...prev,
        type: 'video',
        url: dataUrl,
        title: file.name.replace(/\.[^/.]+$/, '') || prev.title,
        duration: undefined,
      };
      onChange(updated);
      showNotification(`Replaced clip #${index + 1} with video "${file.name}"`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to replace video');
    } finally {
      setIsUploading(false);
      targetReplaceIndexRef.current = null;
      if (replaceSingleVideoInputRef.current) replaceSingleVideoInputRef.current.value = '';
    }
  };

  const handleSinglePhotoReplaceSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = targetReplaceIndexRef.current;
    if (!file || index === null || index < 0 || index >= items.length) return;

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const dataUrl = await processImageUpload(file);
      const updated = [...items];
      const prev = updated[index];
      updated[index] = {
        ...prev,
        type: 'image',
        url: dataUrl,
        title: file.name.replace(/\.[^/.]+$/, '') || prev.title,
        duration: prev.duration || 4,
      };
      onChange(updated);
      showNotification(`Replaced clip #${index + 1} with photo "${file.name}"`);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to replace photo');
    } finally {
      setIsUploading(false);
      targetReplaceIndexRef.current = null;
      if (replaceSinglePhotoInputRef.current) replaceSinglePhotoInputRef.current.value = '';
    }
  };

  // Replace Single Item via Drop
  const handleDropOnRow = async (index: number, file: File) => {
    if (index < 0 || index >= items.length) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const updated = [...items];
      const prev = updated[index];

      if (file.type.startsWith('video/')) {
        const dataUrl = await processVideoUpload(file);
        updated[index] = {
          ...prev,
          type: 'video',
          url: dataUrl,
          title: file.name.replace(/\.[^/.]+$/, '') || prev.title,
          duration: undefined,
        };
        showNotification(`Replaced clip #${index + 1} with video "${file.name}"`);
      } else {
        const dataUrl = await processImageUpload(file);
        updated[index] = {
          ...prev,
          type: 'image',
          url: dataUrl,
          title: file.name.replace(/\.[^/.]+$/, '') || prev.title,
          duration: prev.duration || 4,
        };
        showNotification(`Replaced clip #${index + 1} with photo "${file.name}"`);
      }
      onChange(updated);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to replace item from drop');
    } finally {
      setIsUploading(false);
      setDragOverRowIndex(null);
    }
  };

  // Open Replace Modal
  const openReplaceModal = (index: number) => {
    const item = items[index];
    if (!item) return;
    setReplacingIndex(index);
    setReplaceType(item.type);
    setReplaceUrl(item.url);
    setReplaceTitle(item.title || '');
    setReplaceDuration(item.duration || 4);
    setIsReplaceModalOpen(true);
  };

  const handleReplaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replacingIndex === null || !replaceUrl.trim()) return;

    const url = replaceUrl.trim();
    const resolvedType = isVideoMedia(url) ? 'video' : replaceType;

    const updated = [...items];
    const prev = updated[replacingIndex];
    updated[replacingIndex] = {
      ...prev,
      type: resolvedType,
      url,
      title: replaceTitle.trim() || prev.title,
      duration: resolvedType === 'image' ? Number(replaceDuration) || 4 : undefined,
    };

    onChange(updated);
    showNotification(`Replaced clip #${replacingIndex + 1} with ${resolvedType}`);
    setIsReplaceModalOpen(false);
    setReplacingIndex(null);
    setReplaceUrl('');
    setReplaceTitle('');
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    onChange(reordered);
  };

  const removeItem = (index: number) => {
    const removedTitle = items[index]?.title || `Clip #${index + 1}`;
    onChange(items.filter((_, i) => i !== index));
    showNotification(`Removed "${removedTitle}" from playlist`);
  };

  const updateItemField = (index: number, field: keyof ServiceMediaItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const videoCount = items.filter((m) => m.type === 'video').length;
  const imageCount = items.filter((m) => m.type === 'image').length;

  return (
    <div className="space-y-4 rounded-2xl bg-white border border-[#E5E7EB] p-5 sm:p-6 shadow-xs relative">
      {/* Hidden single-file replacement inputs */}
      <input
        ref={replaceSingleVideoInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={handleSingleVideoReplaceSelected}
      />
      <input
        ref={replaceSinglePhotoInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        className="hidden"
        onChange={handleSinglePhotoReplaceSelected}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#202526] text-white">
              <Film className="w-4 h-4 text-[#D8A9A8]" />
            </span>
            <h4 className="text-sm font-label-small font-bold uppercase tracking-wider text-[#202526]">
              Continuous Zero-Cut Showcase Playlist
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E7EBE9] text-[#202526] flex items-center gap-1">
              <Repeat className="w-3 h-3 text-[#D8A9A8]" />
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs text-[#596769] font-sans-clean mt-1">
            Add multiple videos &amp; images, or <strong>replace images with videos and vice versa</strong> at any position.
          </p>
        </div>

        {/* Action Buttons: Add Video, Add Photo, Add URL */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Upload Videos */}
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
            title="Upload MP4/WebM videos"
          >
            <Film className="w-3.5 h-3.5 text-[#D8A9A8]" />
            <span>+ Video Clip</span>
          </button>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            multiple
            className="hidden"
            onChange={handleVideoUpload}
          />

          {/* Upload Photos */}
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-[#F3F4F6] text-[#202526] border border-[#E5E7EB] text-xs font-btn uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-transform active:scale-95"
            title="Upload PNG/JPG/WebP photos"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#596769]" />
            <span>+ Photo</span>
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            onChange={handlePhotoUpload}
          />

          {/* Add Web URL */}
          <button
            type="button"
            onClick={() => setIsUrlModalOpen(true)}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-[#F3F4F6] text-[#596769] hover:text-[#202526] border border-[#E5E7EB] text-xs font-btn uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            title="Add media from web URL"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Add URL</span>
          </button>
        </div>
      </div>

      {/* Inline Feedback Toast */}
      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successToast}</span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-rose-500 hover:text-rose-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Drag & Drop Add Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsGlobalDragging(true);
        }}
        onDragLeave={() => setIsGlobalDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsGlobalDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleDropFiles(e.dataTransfer.files);
          }
        }}
        onClick={() => generalFileInputRef.current?.click()}
        className={`w-full py-4 px-4 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
          isGlobalDragging
            ? 'border-[#D8A9A8] bg-[#D8A9A8]/10 text-[#202526]'
            : 'border-[#E5E7EB] hover:border-[#CBDCDE] bg-[#F8F9FA] text-[#596769]'
        }`}
      >
        <Upload className="w-5 h-5 text-[#D8A9A8]" />
        <span className="text-xs font-label-small uppercase font-medium tracking-wider">
          {isUploading
            ? 'Processing and compressing files...'
            : 'Drop videos & photos here to add to project showcase'}
        </span>
        <span className="text-[11px] text-[#71717A]">
          Supports MP4, WebM, PNG, JPG, WebP &bull; You can also drag files directly onto any row below to replace it
        </span>
        <input
          ref={generalFileInputRef}
          type="file"
          accept="video/*,image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleDropFiles(e.target.files);
          }}
        />
      </div>

      {/* Media Playlist List */}
      {items.length === 0 ? (
        <div className="py-6 text-center text-xs text-[#71717A] bg-[#F8F9FA] rounded-xl border border-[#E5E7EB]">
          No clips in playlist. Click <strong>+ Video Clip</strong> or <strong>+ Photo</strong> above to add media.
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-[#71717A] px-1 font-mono uppercase">
            <span>Playlist Order ({videoCount} Videos, {imageCount} Photos)</span>
            <span className="flex items-center gap-1">
              <ArrowLeftRight className="w-3 h-3 text-[#D8A9A8]" />
              Replace / Swap Enabled
            </span>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => {
              const isDragOver = dragOverRowIndex === idx;

              return (
                <div
                  key={item.id || idx}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverRowIndex(idx);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverRowIndex(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleDropOnRow(idx, e.dataTransfer.files[0]);
                    }
                  }}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border transition-all shadow-2xs group relative ${
                    isDragOver
                      ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-300'
                      : 'bg-[#F8F9FA] hover:bg-white border-[#E5E7EB] hover:border-[#CBDCDE]'
                  }`}
                >
                  {/* Drop Overlay Hint */}
                  {isDragOver && (
                    <div className="absolute inset-0 bg-white/95 rounded-xl flex items-center justify-center gap-2 z-20 pointer-events-none border-2 border-dashed border-[#D8A9A8]">
                      <RefreshCw className="w-4 h-4 text-[#D8A9A8] animate-spin" />
                      <span className="text-xs font-strong uppercase text-[#202526]">
                        Drop file here to replace clip #{idx + 1}
                      </span>
                    </div>
                  )}

                  {/* Left Controls: Index & Order Arrows */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="w-5 text-center font-mono text-xs font-bold text-[#596769]">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveItem(idx, 'up')}
                          className="p-1 rounded hover:bg-[#E5E7EB] text-[#596769] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === items.length - 1}
                          onClick={() => moveItem(idx, 'down')}
                          className="p-1 rounded hover:bg-[#E5E7EB] text-[#596769] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Media Thumbnail */}
                    <div className="w-16 h-12 rounded-lg bg-[#202526] overflow-hidden shrink-0 border border-[#E5E7EB] relative">
                      {item.type === 'video' ? (
                        <>
                          <video
                            src={item.url}
                            poster={item.poster}
                            className="w-full h-full object-cover"
                            muted
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <Film className="w-4 h-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>

                  {/* Center Info & Title Inputs */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                          item.type === 'video'
                            ? 'bg-[#202526] text-white'
                            : 'bg-[#E7EBE9] text-[#202526]'
                        }`}
                      >
                        {item.type}
                      </span>

                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => updateItemField(idx, 'title', e.target.value)}
                        placeholder="Clip title or label..."
                        className="text-xs text-[#202526] font-medium bg-transparent border-b border-transparent hover:border-[#CBDCDE] focus:border-[#D8A9A8] focus:bg-white px-1 py-0.5 rounded focus:outline-none flex-1 min-w-[120px] truncate"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#596769]">
                      {item.type === 'image' && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-[#D8A9A8]" />
                          <span>Duration:</span>
                          <select
                            value={item.duration || 4}
                            onChange={(e) => updateItemField(idx, 'duration', Number(e.target.value))}
                            className="bg-white border border-[#E5E7EB] rounded px-1.5 py-0.5 text-[10px] font-mono"
                          >
                            <option value={2}>2s</option>
                            <option value={3}>3s</option>
                            <option value={4}>4s (Standard)</option>
                            <option value={6}>6s</option>
                            <option value={8}>8s</option>
                          </select>
                        </div>
                      )}

                      {item.type === 'video' && (
                        <span className="text-[10px] text-[#71717A] font-mono">
                          Continuous motion clip
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Replacement & Action Controls */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E7EB] w-full sm:w-auto justify-between sm:justify-end">
                    {/* Direct Quick Replace Button */}
                    {item.type === 'image' ? (
                      <button
                        type="button"
                        onClick={() => triggerReplaceWithVideo(idx)}
                        disabled={isUploading}
                        className="px-2.5 py-1.5 rounded-lg bg-[#202526] hover:bg-[#111314] text-white text-[11px] font-label-small uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                        title="Replace this photo with a video clip (keeps same position)"
                      >
                        <Film className="w-3.5 h-3.5 text-[#D8A9A8]" />
                        <span>Replace with Video</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => triggerReplaceWithPhoto(idx)}
                        disabled={isUploading}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#F3F4F6] text-[#202526] border border-[#E5E7EB] text-[11px] font-label-small uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                        title="Replace this video with a photo (keeps same position)"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#596769]" />
                        <span>Replace with Photo</span>
                      </button>
                    )}

                    {/* Extended Replace (URL / Options) */}
                    <button
                      type="button"
                      onClick={() => openReplaceModal(idx)}
                      className="p-1.5 rounded-lg text-[#596769] hover:text-[#202526] hover:bg-[#E5E7EB] transition-colors cursor-pointer"
                      title="Replace via URL or customize replacement details"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1.5 rounded-lg text-[#596769] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove clip from playlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Media from URL Modal */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-label-small font-bold uppercase tracking-wider text-[#202526] flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#D8A9A8]" /> Add Media from Web URL
              </h4>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="p-1 text-[#596769] hover:text-[#202526] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUrl} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1">
                  Media Type
                </label>
                <div className="flex items-center gap-4 text-xs font-label-small">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="urlType"
                      checked={urlType === 'video'}
                      onChange={() => setUrlType('video')}
                    />
                    Video (MP4/WebM URL)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="urlType"
                      checked={urlType === 'image'}
                      onChange={() => setUrlType('image')}
                    />
                    Photo (JPG/PNG/WebP URL)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1">
                  Direct Web URL
                </label>
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://assets.mixkit.co/videos/preview/example.mp4"
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#202526] focus:border-[#D8A9A8] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1">
                  Title / Label (Optional)
                </label>
                <input
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="e.g. Hero Dynamic Motion"
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#202526] focus:border-[#D8A9A8] focus:bg-white focus:outline-none"
                />
              </div>

              {urlType === 'image' && (
                <div>
                  <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1">
                    Display Duration (Seconds)
                  </label>
                  <select
                    value={urlDuration}
                    onChange={(e) => setUrlDuration(Number(e.target.value))}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#202526] focus:border-[#D8A9A8] focus:bg-white focus:outline-none"
                  >
                    <option value={2}>2 Seconds</option>
                    <option value={3}>3 Seconds</option>
                    <option value={4}>4 Seconds (Standard)</option>
                    <option value={6}>6 Seconds</option>
                    <option value={8}>8 Seconds</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#E5E7EB] text-xs font-btn uppercase text-[#596769] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  Add to Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Replace Media Modal */}
      {isReplaceModalOpen && replacingIndex !== null && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-label-small font-bold uppercase tracking-wider text-[#202526] flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#D8A9A8]" />
                  Replace Clip #{replacingIndex + 1}
                </h4>
                <p className="text-[11px] text-[#596769] mt-0.5">
                  Swap with a new video or photo while keeping this exact sequence order.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReplaceModalOpen(false)}
                className="p-1 text-[#596769] hover:text-[#202526] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Upload Buttons Inside Modal */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const idx = replacingIndex;
                  setIsReplaceModalOpen(false);
                  triggerReplaceWithVideo(idx);
                }}
                className="py-2 px-3 rounded-xl bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Film className="w-3.5 h-3.5 text-[#D8A9A8]" />
                <span>Upload Video</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const idx = replacingIndex;
                  setIsReplaceModalOpen(false);
                  triggerReplaceWithPhoto(idx);
                }}
                className="py-2 px-3 rounded-xl bg-white hover:bg-[#F3F4F6] text-[#202526] border border-[#E5E7EB] text-xs font-btn uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#596769]" />
                <span>Upload Photo</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#E5E7EB]" />
              <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-[#71717A]">
                or replace with URL
              </span>
              <div className="flex-grow border-t border-[#E5E7EB]" />
            </div>

            <form onSubmit={handleReplaceSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1">
                  Target Format
                </label>
                <div className="flex items-center gap-4 text-xs font-label-small">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="replaceType"
                      checked={replaceType === 'video'}
                      onChange={() => setReplaceType('video')}
                    />
                    Video (MP4/WebM)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="replaceType"
                      checked={replaceType === 'image'}
                      onChange={() => setReplaceType('image')}
                    />
                    Photo (JPG/PNG/WebP)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1">
                  Replacement Media URL
                </label>
                <input
                  type="url"
                  required
                  value={replaceUrl}
                  onChange={(e) => setReplaceUrl(e.target.value)}
                  placeholder="https://...mp4 or https://...jpg"
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#202526] focus:border-[#D8A9A8] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1">
                  Title / Label
                </label>
                <input
                  type="text"
                  value={replaceTitle}
                  onChange={(e) => setReplaceTitle(e.target.value)}
                  placeholder="New clip title..."
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#202526] focus:border-[#D8A9A8] focus:bg-white focus:outline-none"
                />
              </div>

              {replaceType === 'image' && (
                <div>
                  <label className="block text-xs uppercase tracking-wider font-label-small font-medium text-[#596769] mb-1">
                    Photo Display Duration
                  </label>
                  <select
                    value={replaceDuration}
                    onChange={(e) => setReplaceDuration(Number(e.target.value))}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3.5 py-2 text-xs text-[#202526] focus:border-[#D8A9A8] focus:bg-white focus:outline-none"
                  >
                    <option value={2}>2 Seconds</option>
                    <option value={3}>3 Seconds</option>
                    <option value={4}>4 Seconds (Standard)</option>
                    <option value={6}>6 Seconds</option>
                    <option value={8}>8 Seconds</option>
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsReplaceModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#E5E7EB] text-xs font-btn uppercase text-[#596769] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  Confirm Replace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
