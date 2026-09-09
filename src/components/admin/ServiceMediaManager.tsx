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
} from 'lucide-react';
import { processImageUpload, processVideoUpload } from '../../utils/mediaUpload';

interface ServiceMediaManagerProps {
  disciplineTitle: string;
  items: ServiceMediaItem[];
  onChange: (items: ServiceMediaItem[]) => void;
}

export const ServiceMediaManager: React.FC<ServiceMediaManagerProps> = ({
  disciplineTitle,
  items,
  onChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState<'video' | 'image'>('video');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlDuration, setUrlDuration] = useState(4);
  const [isDragging, setIsDragging] = useState(false);

  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const generalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Add new media items helper
  const addItems = (newItems: ServiceMediaItem[]) => {
    onChange([...items, ...newItems]);
  };

  // Upload video handler
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
          id: `vid-${Date.now()}-${i}`,
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

  // Upload photo handler
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
          id: `img-${Date.now()}-${i}`,
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

  // Drag & drop general handler (images or videos)
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
            id: `vid-${Date.now()}-${i}`,
            type: 'video',
            url: dataUrl,
            title: file.name.replace(/\.[^/.]+$/, ''),
          });
        } else if (file.type.startsWith('image/')) {
          const dataUrl = await processImageUpload(file);
          added.push({
            id: `img-${Date.now()}-${i}`,
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

  // Manual URL submission
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const newItem: ServiceMediaItem = {
      id: `url-${Date.now()}`,
      type: urlType,
      url: urlInput.trim(),
      title: urlTitle.trim() || `${disciplineTitle} ${urlType === 'video' ? 'Clip' : 'Visual'}`,
      duration: urlType === 'image' ? Number(urlDuration) || 4 : undefined,
    };

    addItems([newItem]);
    setUrlInput('');
    setUrlTitle('');
    setIsUrlModalOpen(false);
  };

  // Reordering
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    onChange(reordered);
  };

  // Delete
  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  // Update item field
  const updateItemField = (index: number, field: keyof ServiceMediaItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4 pt-4 border-t border-[#E5E7EB]">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D8A9A8]" />
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[#202526]">
              Seamless Multi-Media Reel ({items.length} clips)
            </h5>
          </div>
          <p className="text-[11px] text-[#596769] font-sans-clean mt-0.5">
            Clips play back-to-back with zero cuts and smooth crossfades. Upload multiple videos and photos without limit.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Add Preset Video */}
          <button
            type="button"
            onClick={() => {
              const presets = [
                {
                  title: 'Creator Product Demo',
                  url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-showing-a-product-to-the-camera-43666-large.mp4',
                  poster: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
                },
                {
                  title: 'Dynamic Social Hook',
                  url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-doing-gymnastics-exercises-in-nature-41566-large.mp4',
                  poster: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
                },
                {
                  title: 'AI Neural Cinema',
                  url: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-signals-31910-large.mp4',
                  poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
                },
                {
                  title: 'Hyperspeed 3D Tunnel',
                  url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-abstract-tunnel-with-glowing-lines-41584-large.mp4',
                  poster: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80',
                },
                {
                  title: 'Interactive Web Dashboard',
                  url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-31911-large.mp4',
                  poster: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
                },
                {
                  title: 'Cloud Edge Infrastructure',
                  url: 'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-racks-of-servers-and-cables-31518-large.mp4',
                  poster: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80',
                },
              ];
              // Pick next preset not already in items, or random
              const existingUrls = new Set(items.map((i) => i.url));
              const available = presets.find((p) => !existingUrls.has(p.url)) || presets[items.length % presets.length];
              addItems([
                {
                  id: `preset-${Date.now()}`,
                  type: 'video',
                  url: available.url,
                  poster: available.poster,
                  title: `${disciplineTitle} - ${available.title}`,
                },
              ]);
            }}
            className="px-3 py-1.5 rounded-full bg-[#D8A9A8] hover:bg-[#c99594] text-[#202526] text-[11px] font-btn font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Add high-def sample video to test continuous zero-cut playback"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#202526]" />
            <span>+ Preset Video</span>
          </button>

          {/* Upload Video Button */}
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-[11px] font-btn font-medium uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Film className="w-3.5 h-3.5 text-[#D8A9A8]" />
            <span>+ Upload Video</span>
          </button>

          {/* Upload Photo Button */}
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 rounded-full bg-[#202526] hover:bg-[#111314] text-white text-[11px] font-btn font-medium uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#AFC7C5]" />
            <span>+ Photo</span>
          </button>

          {/* Paste URL Button */}
          <button
            type="button"
            onClick={() => setIsUrlModalOpen((prev) => !prev)}
            className="px-3 py-1.5 rounded-full bg-white hover:bg-[#F3F4F6] text-[#202526] border border-[#E5E7EB] text-[11px] font-btn font-medium uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <LinkIcon className="w-3 h-3 text-[#596769]" />
            <span>Link URL</span>
          </button>
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={videoInputRef}
        type="file"
        multiple
        accept="video/mp4,video/webm,video/quicktime"
        onChange={handleVideoUpload}
        className="hidden"
      />
      <input
        ref={photoInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Direct URL Form Drawer */}
      {isUrlModalOpen && (
        <form
          onSubmit={handleAddUrl}
          className="p-4 rounded-2xl bg-white border border-[#D8A9A8]/40 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#202526] flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-[#D8A9A8]" />
              Add Direct Web Media URL
            </span>
            <button
              type="button"
              onClick={() => setIsUrlModalOpen(false)}
              className="text-[#596769] hover:text-[#202526] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-mono uppercase text-[#596769] mb-1">
                Media Format
              </label>
              <select
                value={urlType}
                onChange={(e) => setUrlType(e.target.value as 'video' | 'image')}
                className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#202526] focus:outline-none focus:border-[#D8A9A8]"
              >
                <option value="video">Video (.mp4, .webm)</option>
                <option value="image">Photo (.jpg, .png, .webp)</option>
              </select>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-[10px] font-mono uppercase text-[#596769] mb-1">
                Media Direct URL
              </label>
              <input
                type="url"
                required
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/asset.mp4"
                className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#202526] focus:outline-none focus:border-[#D8A9A8]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[10px] font-mono uppercase text-[#596769] mb-1">
                {urlType === 'image' ? 'Display Duration' : 'Title Tag'}
              </label>
              {urlType === 'image' ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={urlDuration}
                    onChange={(e) => setUrlDuration(Number(e.target.value))}
                    className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#202526] font-mono focus:outline-none focus:border-[#D8A9A8]"
                  />
                  <span className="text-xs text-[#596769] font-mono">sec</span>
                </div>
              ) : (
                <input
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="Showcase Clip"
                  className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs text-[#202526] focus:outline-none focus:border-[#D8A9A8]"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsUrlModalOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-[#596769] hover:bg-[#F3F4F6] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#202526] hover:bg-[#111314] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Add to Playlist
            </button>
          </div>
        </form>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleDropFiles(e.dataTransfer.files);
          }
        }}
        className={`p-3.5 rounded-2xl border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left ${
          isDragging
            ? 'border-[#D8A9A8] bg-[#D8A9A8]/10'
            : 'border-[#E5E7EB] hover:border-[#D8A9A8]/60 bg-white'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#596769]">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#202526]">
              Drag &amp; drop videos (.mp4, .webm) or photos (.png, .jpg, .webp) here
            </p>
            <p className="text-[10px] text-[#596769]">
              Zero-cut transitions &bull; Continuous sequential reel &bull; Lag-free engine
            </p>
          </div>
        </div>

        {isUploading && (
          <div className="flex items-center gap-2 text-xs font-mono text-[#D8A9A8]">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-[#D8A9A8] border-t-transparent animate-spin" />
            <span>Processing upload...</span>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Playlist Grid */}
      {items.length === 0 ? (
        <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] text-center text-xs text-[#596769] font-mono">
          No media clips added yet. Use "+ Video" or "+ Photo" to build this discipline's seamless reel.
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3 rounded-2xl bg-white border border-[#E5E7EB] hover:border-[#D8A9A8]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs transition-colors group"
            >
              {/* Left: Thumbnail, Badge, Type & Title */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Thumbnail Preview */}
                <div className="w-16 h-12 rounded-xl overflow-hidden bg-[#202526] shrink-0 border border-[#E5E7EB] relative">
                  {item.type === 'video' ? (
                    <video
                      src={item.url}
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title || 'Media thumbnail'}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-black/70 text-[8px] font-mono text-white">
                    #{idx + 1}
                  </span>
                </div>

                {/* Info & Name Input */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        item.type === 'video'
                          ? 'bg-[#202526] text-[#D8A9A8]'
                          : 'bg-[#E7EBE9] text-[#202526]'
                      }`}
                    >
                      {item.type === 'video' ? (
                        <Film className="w-2.5 h-2.5" />
                      ) : (
                        <ImageIcon className="w-2.5 h-2.5" />
                      )}
                      <span>{item.type}</span>
                    </span>

                    {item.type === 'image' && (
                      <div className="flex items-center gap-1 text-[10px] text-[#596769] font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{item.duration || 4}s hold</span>
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    value={item.title || ''}
                    onChange={(e) => updateItemField(idx, 'title', e.target.value)}
                    placeholder="Clip title or description"
                    className="w-full text-xs font-semibold text-[#202526] bg-transparent border-b border-transparent hover:border-[#E5E7EB] focus:border-[#D8A9A8] focus:outline-none py-0.5"
                  />
                </div>
              </div>

              {/* Right: Duration Adjustment (for image), Reorder & Remove Controls */}
              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-[#F3F4F6]">
                {item.type === 'image' && (
                  <div className="flex items-center gap-1 bg-[#F8F9FA] px-2 py-1 rounded-xl border border-[#E5E7EB]">
                    <span className="text-[10px] text-[#596769] font-mono">Hold:</span>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={item.duration || 4}
                      onChange={(e) => updateItemField(idx, 'duration', Number(e.target.value))}
                      className="w-10 text-xs font-mono font-bold text-center bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] text-[#596769] font-mono">s</span>
                  </div>
                )}

                {/* Move Up */}
                <button
                  type="button"
                  onClick={() => moveItem(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] disabled:opacity-30 disabled:hover:bg-[#F3F4F6] text-[#202526] cursor-pointer transition-colors"
                  title="Move earlier in playlist"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  onClick={() => moveItem(idx, 'down')}
                  disabled={idx === items.length - 1}
                  className="p-1.5 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] disabled:opacity-30 disabled:hover:bg-[#F3F4F6] text-[#202526] cursor-pointer transition-colors"
                  title="Move later in playlist"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                {/* Remove Item */}
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer transition-colors"
                  title="Remove from playlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
