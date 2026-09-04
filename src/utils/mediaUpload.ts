/**
 * Utility functions for handling direct file uploads (Images & Videos)
 * Converts user files into base64 Data URLs with automatic optimization.
 */

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
 * Optimizes an uploaded image file into a crisp, compressed Data URL to prevent local storage quota overflow
 */
export async function processImageUpload(file: File, maxWidth = 1600, maxHeight = 1600, quality = 0.85): Promise<string> {
  // If it's a GIF or SVG, do not run canvas compression to preserve animation and vector crispness
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return readFileAsDataUrl(file);
  }

  const rawDataUrl = await readFileAsDataUrl(file);

  return new Promise((resolve) => {
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

      // Output as optimized JPEG or WEBP depending on transparency
      const hasAlpha = file.type === 'image/png';
      const outputType = hasAlpha ? 'image/png' : 'image/jpeg';
      const optimizedUrl = canvas.toDataURL(outputType, hasAlpha ? undefined : quality);

      resolve(optimizedUrl);
    };
    img.onerror = () => resolve(rawDataUrl);
    img.src = rawDataUrl;
  });
}

/**
 * Reads uploaded video file (MP4, WebM, MOV, etc.) into Data URL with validation
 */
export async function processVideoUpload(file: File): Promise<string> {
  // Max recommended size for client-side storage is ~15MB
  if (file.size > 25 * 1024 * 1024) {
    throw new Error('Video file size exceeds 25MB. Please upload an optimized web video clip (MP4/WebM).');
  }

  return readFileAsDataUrl(file);
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
