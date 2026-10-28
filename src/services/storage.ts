/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, isSupabaseConfigured } from './supabase.ts';
import { api } from './api.ts';
import { MediaAsset } from '../utils/portfolio.ts';

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
 * Upload a media file (Image or Video) to cloud Supabase Storage or persistent local storage
 */
export async function uploadMediaFile(
  file: File,
  options?: { title?: string; tags?: string[]; authToken?: string }
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

  // 1. Try Supabase Storage if configured
  if (isSupabaseConfigured) {
    try {
      const storagePath = `uploads/${uniqueFileName}`;
      const { data, error } = await supabase.storage
        .from('portfolio-media')
        .upload(storagePath, file, options?.authToken);

      if (!error && data?.publicUrl) {
        const asset: MediaAsset = {
          id,
          title: assetTitle,
          fileName: file.name,
          url: data.publicUrl,
          type: isVideo ? 'video' : 'image',
          mimeType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
          sizeBytes: file.size,
          storageProvider: 'supabase',
          storagePath,
          createdAt: new Date().toISOString(),
          tags: options?.tags || [isVideo ? 'Video' : 'Image'],
        };

        // Persist media record to Supabase database
        await api.upsertMediaAsset(asset, options?.authToken);

        return { asset, provider: 'supabase' };
      }
    } catch (err) {
      console.warn('Supabase storage upload failed, falling back to persistent local storage:', err);
    }
  }

  // 2. Fallback: Convert to Base64 Data URL for persistent browser storage
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
      ? 'Cloud upload failed; saved to local persistent storage.'
      : 'Saved to local browser storage. Configure Supabase storage in .env for permanent cross-device cloud persistence.',
  };
}

/**
 * Delete a media file from Supabase storage or local store
 */
export async function deleteMediaFile(asset: MediaAsset, authToken?: string): Promise<boolean> {
  if (asset.storageProvider === 'supabase' && isSupabaseConfigured) {
    try {
      if (asset.storagePath) {
        await supabase.storage.from('portfolio-media').remove([asset.storagePath], authToken);
      }
      await api.deleteMediaAsset(asset.id, authToken);
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

