/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isSupabaseConfigured } from './supabase.ts';
import { api } from './api.ts';
import type { MediaAsset } from '../utils/portfolio.ts';

export interface UploadResult {
  asset: MediaAsset;
  provider: 'supabase' | 'local';
  warning?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
]);

const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_SIZE_BYTES = 60 * 1024 * 1024; // 60MB

/**
 * Upload a media file (Image or Video) to cloud Supabase Storage or persistent storage
 */
export async function uploadMediaFile(
  file: File,
  options?: { title?: string; tags?: string[] }
): Promise<UploadResult> {
  const isVideo = file.type.startsWith('video/');

  // Validation: Check allowed MIME type
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    throw new Error(`Unsupported file format (${file.type}). Please upload a standard image (PNG, JPG, WebP, SVG, GIF) or video (MP4, WebM).`);
  }

  // Validation: Check file size limits
  const maxBytes = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  if (file.size > maxBytes) {
    const limitMb = Math.round(maxBytes / (1024 * 1024));
    throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is ${limitMb}MB.`);
  }

  const fileExt = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();
  const uniqueFileName = `${Date.now()}_${cleanBaseName}.${fileExt}`;
  const assetTitle = options?.title?.trim() || file.name.replace(/\.[^/.]+$/, '');
  const id = `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 1. Upload to Supabase Storage Bucket
  if (isSupabaseConfigured) {
    try {
      const storagePath = `uploads/${uniqueFileName}`;
      const { data, error } = await supabase.storage
        .from('portfolio-media')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from('portfolio-media')
          .getPublicUrl(storagePath);

        const asset: MediaAsset = {
          id,
          title: assetTitle,
          fileName: file.name,
          url: urlData.publicUrl,
          type: isVideo ? 'video' : 'image',
          mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
          sizeBytes: file.size,
          storageProvider: 'supabase',
          storagePath,
          createdAt: new Date().toISOString(),
          tags: options?.tags || [isVideo ? 'Video' : 'Image'],
        };

        // Persist media record to Supabase database
        await api.upsertMediaAsset(asset);

        return { asset, provider: 'supabase' };
      } else if (error) {
        console.warn('Supabase storage returned error:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase storage upload failed:', err);
    }
  }

  // 2. Fallback to Local Data URL
  const base64Url = await fileToBase64(file);
  const asset: MediaAsset = {
    id,
    title: assetTitle,
    fileName: file.name,
    url: base64Url,
    type: isVideo ? 'video' : 'image',
    mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
    sizeBytes: file.size,
    storageProvider: 'local',
    createdAt: new Date().toISOString(),
    tags: options?.tags || [isVideo ? 'Video' : 'Image'],
  };

  return {
    asset,
    provider: 'local',
    warning: isSupabaseConfigured
      ? 'Cloud storage upload was unsuccessful; cached locally.'
      : 'Saved locally. Configure Supabase storage for cloud media hosting.',
  };
}

/**
 * Delete a media file from Supabase storage or local store
 */
export async function deleteMediaFile(asset: MediaAsset): Promise<boolean> {
  if (asset.storageProvider === 'supabase' && isSupabaseConfigured) {
    try {
      if (asset.storagePath) {
        await supabase.storage.from('portfolio-media').remove([asset.storagePath]);
      }
      await api.deleteMediaAsset(asset.id);
      return true;
    } catch (err) {
      console.warn('Failed to delete from Supabase storage:', err);
    }
  }
  return true;
}

/**
 * Helper to convert file to data URL
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
