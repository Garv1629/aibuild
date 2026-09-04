import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  RefreshCw,
  AlertCircle,
  FileImage,
} from 'lucide-react';
import { processImageUpload, formatFileSize } from '../../utils/mediaUpload';

interface MultiMediaUploaderProps {
  label: string;
  images: string[];
  onChange: (images: string[]) => void;
  helperText?: string;
}

export const MultiMediaUploader: React.FC<MultiMediaUploaderProps> = ({
  label,
  images,
  onChange,
  helperText,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    setErrorMessage(null);
    setIsUploading(true);

    try {
      const uploadPromises = Array.from(files).map((f) => processImageUpload(f));
      const newUrls = await Promise.all(uploadPromises);
      onChange([...images, ...newUrls]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading images';
      setErrorMessage(msg);
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
      handleFiles(e.dataTransfer.files);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs uppercase tracking-[0.14em] font-label-small font-medium text-[#202526] flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#D8A9A8]" />
          {label} ({images.length} Assets)
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-btn font-medium uppercase tracking-wider text-[#202526] hover:text-[#D8A9A8] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-[#D8A9A8]" /> Upload Media
        </button>
      </div>

      {helperText && <p className="text-xs text-[#596769] font-sans-clean">{helperText}</p>}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        onChange={onInputChange}
        className="hidden"
      />

      {/* Grid of uploaded images */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {images
          .filter((url) => Boolean(url && url.trim()))
          .map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative aspect-video rounded-2xl overflow-hidden bg-[#F3F4F6] border border-[#E5E7EB] group shadow-xs"
            >
              <img
                src={imgUrl}
                alt={`Media ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-strong text-[#202526] border border-[#E5E7EB] shadow-xs">
              #{idx + 1}
            </span>
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-1.5 right-1.5 p-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
              title="Remove photo"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Upload Add Card Dropzone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
            isDragging
              ? 'border-[#D8A9A8] bg-[#D8A9A8]/10'
              : 'border-[#E5E7EB] hover:border-[#D8A9A8] bg-[#F8F9FA] hover:bg-white'
          }`}
        >
          {isUploading ? (
            <div className="w-5 h-5 rounded-full border-2 border-[#D8A9A8] border-t-transparent animate-spin" />
          ) : (
            <>
              <Upload className="w-4 h-4 text-[#D8A9A8]" />
              <span className="text-[10px] font-label-small uppercase tracking-wider text-[#202526] font-medium">
                + Add Media
              </span>
            </>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="text-xs text-rose-600 flex items-center gap-1.5 font-label-small uppercase tracking-wider">
          <AlertCircle className="w-3.5 h-3.5" /> {errorMessage}
        </div>
      )}
    </div>
  );
};
