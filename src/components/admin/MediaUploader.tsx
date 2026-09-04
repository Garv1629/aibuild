import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video,
  Film,
  Trash2,
  Check,
  AlertCircle,
  Link as LinkIcon,
  RefreshCw,
  Eye,
  FileText,
} from 'lucide-react';
import { processImageUpload, processVideoUpload, formatFileSize } from '../../utils/mediaUpload';

interface MediaUploaderProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  acceptType?: 'image' | 'video' | 'both';
  helperText?: string;
  placeholderText?: string;
  aspectRatio?: string;
  previewHeight?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  label,
  value,
  onChange,
  acceptType = 'image',
  helperText,
  placeholderText,
  aspectRatio,
  previewHeight = 'h-36',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo =
    acceptType === 'video' ||
    value.startsWith('data:video') ||
    value.endsWith('.mp4') ||
    value.endsWith('.webm') ||
    value.endsWith('.mov') ||
    value.includes('mixkit.co/videos') ||
    value.includes('mp4');

  const acceptedMimeTypes =
    acceptType === 'video'
      ? 'video/mp4,video/webm,video/quicktime,video/ogg'
      : acceptType === 'both'
      ? 'image/*,video/mp4,video/webm,video/quicktime,video/ogg'
      : 'image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif';

  const handleFile = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    setFileName(file.name);
    setFileSize(formatFileSize(file.size));

    try {
      if (file.type.startsWith('video/') || acceptType === 'video') {
        const videoDataUrl = await processVideoUpload(file);
        onChange(videoDataUrl);
      } else {
        const imageDataUrl = await processImageUpload(file);
        onChange(imageDataUrl);
      }
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process file';
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    onChange('');
    setFileName(null);
    setFileSize(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="block text-xs uppercase tracking-[0.14em] font-label-small font-medium text-[#202526] flex items-center gap-1.5">
          {acceptType === 'video' ? (
            <Video className="w-3.5 h-3.5 text-[#D8A9A8]" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5 text-[#D8A9A8]" />
          )}
          {label}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-label-small uppercase tracking-wider text-[#596769] hover:text-[#202526] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <LinkIcon className="w-2.5 h-2.5" />
            {showUrlInput ? 'Direct File Upload' : 'Paste Web Link'}
          </button>
        </div>
      </div>

      {helperText && <p className="text-xs text-[#596769] font-sans-clean">{helperText}</p>}

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedMimeTypes}
        onChange={onInputChange}
        className="hidden"
      />

      {/* Direct URL input fallback toggle */}
      {showUrlInput ? (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholderText || 'https://images.unsplash.com/... or https://...'}
            className="w-full bg-[#F8F9FA] border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-xs text-[#202526] font-sans-clean focus:outline-none focus:border-[#D8A9A8] focus:bg-white"
          />
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors cursor-pointer"
              title="Clear"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : null}

      {/* Main Upload Dropzone & Live Preview */}
      {value && value.trim() ? (
        <div className="relative rounded-2xl bg-white border border-[#E5E7EB] p-4 overflow-hidden group shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Visual Media Preview */}
            <div
              className={`relative w-full sm:w-48 ${previewHeight} rounded-xl overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] shrink-0 flex items-center justify-center`}
              style={aspectRatio ? { aspectRatio } : undefined}
            >
              {isVideo ? (
                <video
                  src={value}
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={value}
                  alt="Uploaded Media Preview"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              )}

              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[9px] font-label-small uppercase tracking-wider text-[#D8A9A8] border border-white/10 flex items-center gap-1">
                {isVideo ? <Film className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                {isVideo ? 'Video' : 'Photo'}
              </div>
            </div>

            {/* Uploaded File Info & Replace Action */}
            <div className="flex-1 w-full space-y-2 font-sans-clean">
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-label-small font-medium uppercase tracking-wider">
                <Check className="w-3.5 h-3.5" />
                <span>Asset Ready for Live Site</span>
              </div>

              {fileName && (
                <div className="flex items-center gap-2 text-xs text-[#202526] font-sans-clean truncate">
                  <FileText className="w-3.5 h-3.5 text-[#D8A9A8] shrink-0" />
                  <span className="truncate">{fileName}</span>
                  {fileSize && <span className="text-[#71717A]">({fileSize})</span>}
                </div>
              )}

              <p className="text-xs text-[#71717A] line-clamp-1">
                {value.startsWith('data:') ? 'Stored directly in studio asset repository' : value}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#202526] hover:bg-[#111314] text-white text-xs font-btn font-medium uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3 h-3 text-[#D8A9A8]" /> Replace
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-btn font-medium uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-[#D8A9A8] bg-[#D8A9A8]/10 scale-[1.01]'
              : 'border-[#E5E7EB] hover:border-[#D8A9A8] bg-[#F8F9FA]/80 hover:bg-white'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <div className="w-7 h-7 rounded-full border-2 border-[#D8A9A8] border-t-transparent animate-spin" />
              <p className="text-xs font-label-small uppercase tracking-wider text-[#D8A9A8]">Encoding &amp; Optimizing Media...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2.5 font-sans-clean">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-[#D8A9A8] group-hover:scale-105 transition-transform shadow-xs">
                {acceptType === 'video' ? (
                  <Video className="w-5 h-5 text-[#D8A9A8]" />
                ) : (
                  <Upload className="w-5 h-5 text-[#D8A9A8]" />
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-[#202526]">
                  <span className="text-[#202526] font-semibold underline underline-offset-2">Click to select files</span> or drag and drop
                </p>
                <p className="text-[11px] text-[#71717A] font-sans-clean mt-0.5">
                  {acceptType === 'video'
                    ? 'MP4, WebM, MOV clips (auto compressed & looped)'
                    : acceptType === 'both'
                    ? 'Photos, Videos, PNG, JPG, GIF, WebM'
                    : 'PNG, JPG, WebP, SVG high-resolution formats'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success & Error alerts */}
      {uploadSuccess && (
        <div className="text-xs text-emerald-600 flex items-center gap-1.5 font-label-small uppercase tracking-wider animate-fadeIn">
          <Check className="w-3.5 h-3.5" /> Media Asset Synchronized Successfully
        </div>
      )}
      {uploadError && (
        <div className="text-xs text-rose-600 flex items-center gap-1.5 font-label-small uppercase tracking-wider animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5" /> {uploadError}
        </div>
      )}
    </div>
  );
};
