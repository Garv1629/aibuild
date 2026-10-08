/**
 * Utility functions for handling direct file uploads (Images & Videos)
 * Automatically uploads to backend storage (Supabase Storage / Persistent CDN)
 */
import { api } from '../services/api';

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };
    reader.onerror = () => reject(reader.error || new Error('Error reading file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Optimizes an uploaded image file and persists to Supabase Storage / Server Storage
 */
export async function processImageUpload(file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.85): Promise<string> {
  // If it's a GIF or SVG, read directly and upload
  let dataUrl: string;
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    dataUrl = await readFileAsDataUrl(file);
  } else {
    const rawDataUrl = await readFileAsDataUrl(file);
    dataUrl = await new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const hasAlpha = file.type === 'image/png';
        const outputType = hasAlpha ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(outputType, hasAlpha ? undefined : quality));
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    });
  }

  // Upload to persistent storage (Supabase Storage / Server Disk)
  try {
    const res = await api.uploadMedia(dataUrl, file.name, file.type);
    if (res && res.url) {
      return res.url;
    }
  } catch (err) {
    console.warn('[MediaUpload] Server upload fallback to data URL:', err);
  }

  return dataUrl;
}

/**
 * Reads uploaded video file and persists to Supabase Storage / Server Storage
 */
export async function processVideoUpload(file: File): Promise<string> {
  if (file.size > 50 * 1024 * 1024) {
    throw new Error('Video file size exceeds 50MB. Please upload an optimized web video clip (MP4/WebM).');
  }

  const rawDataUrl = await readFileAsDataUrl(file);

  try {
    const res = await api.uploadMedia(rawDataUrl, file.name, file.type);
    if (res && res.url) {
      return res.url;
    }
  } catch (err) {
    console.warn('[MediaUpload] Video upload fallback to data URL:', err);
  }

  return rawDataUrl;
}

/**
 * Format bytes into human readable format (e.g. "2.4 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Checks whether a given media URL or Data URL represents a video
 */
export function isVideoMedia(url: string | undefined | null): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return (
    clean.startsWith('data:video') ||
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.ogg') ||
    clean.includes('.mp4?') ||
    clean.includes('.webm?') ||
    clean.includes('.mov?') ||
    clean.includes('mixkit.co/videos') ||
    clean.includes('/videos/') ||
    clean.includes('video/') ||
    clean.includes('supabase.co/storage/v1/object/public/cms-media')
  );
}
