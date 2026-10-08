import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from './db.js';
import { verifySessionToken, verifyOwnerPin, updateOwnerPin } from './auth.js';
import { supabaseClient } from './supabase.js';
import { emailService } from './email.js';
import type { IncomingMessage, ServerResponse } from 'http';

const PUBLIC_UPLOADS_DIR = path.resolve(process.cwd(), 'public/uploads');
if (!fs.existsSync(PUBLIC_UPLOADS_DIR)) {
  fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true });
}

// Helper to parse JSON body from incoming Node.js request
export async function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // 50MB max body limit for media/images
      if (body.length > 50 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Request payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', (err) => reject(err));
  });
}

// Standardized HTTP Security Headers Policy
export function applySecurityHeaders(res: ServerResponse, isApi = false) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), vr=(), accelerometer=(), gyroscope=(), magnetometer=()'
  );
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://images.unsplash.com https://*.figma.site https://shrug-person-78902957.figma.site https://*.supabase.co https://*.supabase.in https://*.githubusercontent.com https://res.cloudinary.com https://images.pexels.com; media-src 'self' blob: data: https://*.supabase.co https://*.supabase.in https://commondatastorage.googleapis.com https://assets.mixkit.co https://player.vimeo.com https://*.vimeo.com; connect-src 'self' http://localhost:* http://127.0.0.1:* https://*.supabase.co https://*.supabase.in https://api.github.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self';"
  );

  if (isApi) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}

// Send JSON helper
export function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  applySecurityHeaders(res, true);
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.end(JSON.stringify(data));
}

export function sendError(res: ServerResponse, statusCode: number, message: string, details?: any) {
  sendJson(res, statusCode, {
    success: false,
    error: message,
    ...(details ? { details } : {}),
  });
}

// Server-side Route Authorization Guard
export function requireAdmin(req: IncomingMessage, res: ServerResponse): boolean {
  const authHeader = (req.headers['authorization'] as string) || '';
  if (!verifySessionToken(authHeader)) {
    sendError(res, 401, 'Unauthorized: Administrator authorization token required');
    return false;
  }
  return true;
}

// Main API request handler
export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '/';
  const method = req.method || 'GET';

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.end();
    return true;
  }

  // Parse path and query
  const [pathname, queryString] = url.split('?');
  const params = new URLSearchParams(queryString || '');

  // Only handle /api routes
  if (!pathname.startsWith('/api/') && pathname !== '/api') {
    return false;
  }

  const authHeader = (req.headers['authorization'] as string) || '';
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || '';

  try {
    // -------------------------------------------------------------
    // 0. HEALTH CHECK & DATABASE STATUS
    // -------------------------------------------------------------
    if (pathname === '/api/health' && method === 'GET') {
      sendJson(res, 200, {
        status: 'online',
        database: 'connected',
        supabaseConfigured: supabaseClient.isConfigured(),
        timestamp: new Date().toISOString(),
        version: '2.0.0',
      });
      return true;
    }

    // -------------------------------------------------------------
    // 1. MEDIA UPLOAD (SUPABASE STORAGE + LOCAL DISK FALLBACK)
    // -------------------------------------------------------------
    if (pathname === '/api/upload' && method === 'POST') {
      if (!requireAdmin(req, res)) return true;
      const body = await parseJsonBody(req);
      const { fileName, fileData, mimeType } = body;

      if (!fileData) {
        sendError(res, 400, 'File data is required');
        return true;
      }

      // Validate allowed media extensions
      const ALLOWED_EXTENSIONS = new Set([
        '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif',
        '.mp4', '.webm', '.mov', '.ogg',
        '.pdf', '.json', '.glb', '.gltf', '.hdr', '.bin'
      ]);

      const rawExt = path.extname(fileName || '').toLowerCase();
      if (fileName && rawExt && !ALLOWED_EXTENSIONS.has(rawExt)) {
        sendError(res, 400, `Forbidden file type "${rawExt}". Only safe media assets (images, videos, 3D models, PDF) are allowed.`);
        return true;
      }

      // Convert base64 / data URL to Buffer
      let buffer: Buffer;
      let detectedMime = mimeType || 'application/octet-stream';

      if (typeof fileData === 'string' && fileData.startsWith('data:')) {
        const matches = fileData.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          detectedMime = matches[1];
          buffer = Buffer.from(matches[2], 'base64');
        } else {
          buffer = Buffer.from(fileData);
        }
      } else if (typeof fileData === 'string') {
        buffer = Buffer.from(fileData, 'base64');
      } else {
        buffer = Buffer.from(fileData);
      }

      // Check max file size (50MB)
      if (buffer.length > 50 * 1024 * 1024) {
        sendError(res, 413, 'File size exceeds maximum 50MB limit');
        return true;
      }

      const safeName = (fileName || `upload_${Date.now()}`)
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/^\.+/, ''); // Prevent leading dot hidden files / path traversal

      // Try Supabase Storage first if configured
      if (supabaseClient.isConfigured()) {
        try {
          const supabaseResult = await supabaseClient.uploadMedia(buffer, safeName, detectedMime);
          db.addAuditLog('MEDIA_UPLOAD', `Uploaded "${safeName}" to Supabase Storage`, 'info', ip, userAgent);
          sendJson(res, 200, {
            success: true,
            url: supabaseResult.url,
            storage: 'supabase',
            path: supabaseResult.path,
          });
          return true;
        } catch (supabaseErr: any) {
          console.warn('[Supabase Storage Warning] Falling back to local disk storage:', supabaseErr.message);
        }
      }

      // Local Disk Storage Fallback
      const uniqueFileName = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}_${safeName}`;
      const filePath = path.join(PUBLIC_UPLOADS_DIR, uniqueFileName);
      fs.writeFileSync(filePath, buffer);

      const publicUrl = `/uploads/${uniqueFileName}`;
      db.addAuditLog('MEDIA_UPLOAD', `Saved "${safeName}" to persistent storage`, 'info', ip, userAgent);
      sendJson(res, 200, {
        success: true,
        url: publicUrl,
        storage: 'local',
        path: uniqueFileName,
      });
      return true;
    }

    // -------------------------------------------------------------
    // 2. AUTHENTICATION & PIN ENDPOINTS
    // -------------------------------------------------------------
    if (pathname === '/api/auth/verify-pin' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { pin } = body;
      if (!pin) {
        sendError(res, 400, 'PIN is required');
        return true;
      }
      const result = await verifyOwnerPin(pin, ip, userAgent);
      if (result.success) {
        sendJson(res, 200, result);
      } else {
        sendJson(res, 401, result);
      }
      return true;
    }

    if (pathname === '/api/auth/update-pin' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { currentPin, newPin } = body;
      if (!currentPin || !newPin) {
        sendError(res, 400, 'Current PIN and New PIN are required');
        return true;
      }
      const result = await updateOwnerPin(currentPin, newPin, ip, userAgent);
      if (result.success) {
        sendJson(res, 200, result);
      } else {
        sendError(res, 400, result.message);
      }
      return true;
    }

    if (pathname === '/api/auth/audit-logs' && method === 'GET') {
      if (!requireAdmin(req, res)) return true;
      const limit = parseInt(params.get('limit') || '100', 10);
      const logs = db.getAuditLogs(limit);
      sendJson(res, 200, { success: true, logs });
      return true;
    }

    if (pathname === '/api/auth/audit-logs' && method === 'POST') {
      const body = await parseJsonBody(req);
      const { action, details, severity } = body;
      if (!action || !details) {
        sendError(res, 400, 'Action and details are required');
        return true;
      }
      const log = db.addAuditLog(action, details, severity || 'info', ip, userAgent);
      sendJson(res, 201, { success: true, log });
      return true;
    }

    // -------------------------------------------------------------
    // 3. SITE SETTINGS & CONTENT ENDPOINTS (DRAFT & PUBLISH)
    // -------------------------------------------------------------
    if (pathname === '/api/site-settings' && method === 'GET') {
      const hasValidAuth = verifySessionToken(authHeader);
      const isAdmin = (params.get('admin') === 'true' || params.get('preview') === 'draft') && hasValidAuth;
      if (isAdmin) {
        const adminSettings = db.getSiteSettingsAdmin();
        sendJson(res, 200, { success: true, data: adminSettings });
      } else {
        const settings = db.getSiteSettings(false);
        sendJson(res, 200, { success: true, data: settings });
      }
      return true;
    }

    if ((pathname === '/api/site-settings/draft' || pathname === '/api/site-settings') && (method === 'POST' || method === 'PUT') && (pathname.endsWith('/draft') || params.get('draft') === 'true')) {
      if (!requireAdmin(req, res)) return true;
      const body = await parseJsonBody(req);
      const result = db.saveSiteSettingsDraft(body);
      db.addAuditLog('DRAFT_SAVE', 'Saved website content draft to database', 'info', ip, userAgent);
      sendJson(res, 200, {
        success: true,
        data: result.draft,
        adminState: result,
        status: result.status,
        message: 'Draft saved successfully to database.',
      });
      return true;
    }

    if (pathname === '/api/site-settings/publish' && method === 'POST') {
      if (!requireAdmin(req, res)) return true;
      const body = await parseJsonBody(req);
      const result = db.publishSiteSettings(body && Object.keys(body).length > 0 ? body : undefined);
      db.addAuditLog('CONTENT_PUBLISH', 'Published website content live to public website', 'info', ip, userAgent);
      sendJson(res, 200, {
        success: true,
        data: result.published,
        adminState: result,
        status: result.status,
        message: 'Website content published live!',
      });
      return true;
    }

    if (pathname === '/api/site-settings/revert' && method === 'POST') {
      if (!requireAdmin(req, res)) return true;
      const result = db.revertSiteSettingsDraft();
      db.addAuditLog('DRAFT_REVERT', 'Discarded website content draft, reverted to published', 'info', ip, userAgent);
      sendJson(res, 200, {
        success: true,
        data: result.published,
        adminState: result,
        status: result.status,
        message: 'Draft discarded, reverted to published version.',
      });
      return true;
    }

    if (pathname === '/api/site-settings' && method === 'PUT') {
      if (!requireAdmin(req, res)) return true;
      const body = await parseJsonBody(req);
      const result = db.publishSiteSettings(body);
      db.addAuditLog('CONTENT_UPDATE', 'Website content & site settings updated and published', 'info', ip, userAgent);
      sendJson(res, 200, { success: true, data: result.published, adminState: result, message: 'Site settings saved successfully' });
      return true;
    }

    // -------------------------------------------------------------
    // 4. PROJECTS / PORTFOLIO ENDPOINTS (DRAFT, PUBLISH & SAFE DELETE)
    // -------------------------------------------------------------
    if (pathname === '/api/projects' && method === 'GET') {
      const hasValidAuth = verifySessionToken(authHeader);
      const includeAll = (params.get('all') === 'true' || params.get('admin') === 'true') && hasValidAuth;
      const includeDeleted = (params.get('include_deleted') === 'true' || params.get('trash') === 'true') && hasValidAuth;
      const projects = db.getProjects(includeAll, includeDeleted);
      sendJson(res, 200, { success: true, data: projects });
      return true;
    }

    if (pathname === '/api/projects' && method === 'POST') {
      if (!requireAdmin(req, res)) return true;
      const body = await parseJsonBody(req);
      if (!body.title || !body.title.trim()) {
        sendError(res, 400, 'Project title is required');
        return true;
      }
      const project = db.createProject(body);
      db.addAuditLog('PROJECT_CREATE', `Created project "${project.title}" with status "${project.status}" (${project.id})`, 'info', ip, userAgent);
      sendJson(res, 201, { success: true, data: project, message: 'Project created successfully' });
      return true;
    }

    if (pathname === '/api/projects/reorder' && method === 'POST') {
      if (!requireAdmin(req, res)) return true;
      const body = await parseJsonBody(req);
      const list = body.projects || body.orderedIds || (Array.isArray(body) ? body : null);
      if (!Array.isArray(list)) {
        sendError(res, 400, 'Array of projects or project IDs is required for reordering');
        return true;
      }
      const reordered = db.reorderProjects(list);
      db.addAuditLog('PROJECT_REORDER', `Project catalog order rearranged in database (${list.length} items)`, 'info', ip, userAgent);
      sendJson(res, 200, { success: true, data: reordered, message: 'Projects reordered successfully' });
      return true;
    }

    // Handle /api/projects/:id/publish, unpublish, draft, restore
    const projectActionMatch = pathname.match(/^\/api\/projects\/([^/]+)\/(publish|unpublish|draft|restore)$/);
    if (projectActionMatch && method === 'POST') {
      if (!requireAdmin(req, res)) return true;
      const projectId = projectActionMatch[1];
      const action = projectActionMatch[2];
      let updated: any;
      if (action === 'publish') {
        updated = db.publishProject(projectId);
        db.addAuditLog('PROJECT_PUBLISH', `Published project "${updated.title}" live (${projectId})`, 'info', ip, userAgent);
      } else if (action === 'unpublish') {
        updated = db.unpublishProject(projectId);
        db.addAuditLog('PROJECT_UNPUBLISH', `Unpublished project "${updated.title}" (${projectId})`, 'info', ip, userAgent);
      } else if (action === 'restore') {
        updated = db.restoreProject(projectId);
        db.addAuditLog('PROJECT_RESTORE', `Restored project "${updated.title}" from trash (${projectId})`, 'info', ip, userAgent);
      } else {
        updated = db.draftProject(projectId);
        db.addAuditLog('PROJECT_DRAFT', `Set project "${updated.title}" as draft (${projectId})`, 'info', ip, userAgent);
      }
      sendJson(res, 200, { success: true, data: updated, message: `Project status set to ${action}` });
      return true;
    }

    // Handle /api/projects/:id
    const projectMatch = pathname.match(/^\/api\/projects\/([^/]+)$/);
    if (projectMatch) {
      const projectId = projectMatch[1];

      if (method === 'GET') {
        const project = db.getProjectById(projectId);
        if (!project) {
          sendError(res, 404, `Project with ID ${projectId} not found`);
          return true;
        }
        sendJson(res, 200, { success: true, data: project });
        return true;
      }

      if (method === 'PUT' || method === 'PATCH') {
        if (!requireAdmin(req, res)) return true;
        const body = await parseJsonBody(req);
        const updated = db.updateProject(projectId, body);
        db.addAuditLog('PROJECT_UPDATE', `Updated project "${updated.title}" in database (${projectId})`, 'info', ip, userAgent);
        sendJson(res, 200, { success: true, data: updated, message: 'Project updated successfully' });
        return true;
      }

      if (method === 'DELETE') {
        if (!requireAdmin(req, res)) return true;
        const permanent = params.get('permanent') === 'true';
        const existing = db.getProjectById(projectId);
        const deleted = db.deleteProject(projectId, permanent);
        if (!deleted) {
          sendError(res, 404, `Project with ID ${projectId} not found`);
          return true;
        }
        db.addAuditLog('PROJECT_DELETE', `${permanent ? 'Permanently deleted' : 'Moved to trash (soft-delete)'} project "${existing?.title || projectId}"`, 'warning', ip, userAgent);
        sendJson(res, 200, { success: true, message: permanent ? 'Project permanently deleted' : 'Project moved to trash safely' });
        return true;
      }
    }

    // -------------------------------------------------------------
    // 5. REVIEWS & RATINGS ENDPOINTS (SAFE DELETE & RESTORE)
    // -------------------------------------------------------------
    if (pathname === '/api/reviews' && method === 'GET') {
      const hasValidAuth = verifySessionToken(authHeader);
      const includeAll = params.get('all') === 'true' && hasValidAuth;
      const includeDeleted = (params.get('include_deleted') === 'true' || params.get('trash') === 'true') && hasValidAuth;
      const reviews = db.getReviews(includeAll, includeDeleted);
      sendJson(res, 200, { success: true, data: reviews });
      return true;
    }

    if (pathname === '/api/reviews' && method === 'POST') {
      const body = await parseJsonBody(req);
      if (!body.author || !body.author.trim() || !body.comment || !body.comment.trim()) {
        sendError(res, 400, 'Author name and review comment are required');
        return true;
      }
      const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
      const review = db.createReview({
        ...body,
        author: body.author.trim().slice(0, 100),
        comment: body.comment.trim().slice(0, 2000),
        company: (body.company || '').trim().slice(0, 100),
        role: (body.role || '').trim().slice(0, 100),
        rating,
        status: 'pending', // Public review submissions always start in pending moderation
      });
      db.addAuditLog('REVIEW_CREATE', `Added review by "${review.author}" to database (pending moderation)`, 'info', ip, userAgent);
      sendJson(res, 201, { success: true, data: review, message: 'Review submitted for moderation' });
      return true;
    }

    if (pathname === '/api/reviews/reorder' && method === 'POST') {
      if (!requireAdmin(req, res)) return true;
      const body = await parseJsonBody(req);
      const list = body.reviews || body.orderedIds || (Array.isArray(body) ? body : null);
      if (!Array.isArray(list)) {
        sendError(res, 400, 'Array of reviews or review IDs is required for reordering');
        return true;
      }
      const reordered = db.reorderReviews(list);
      db.addAuditLog('REVIEW_REORDER', `Reviews feed order rearranged in database (${list.length} items)`, 'info', ip, userAgent);
      sendJson(res, 200, { success: true, data: reordered, message: 'Reviews reordered successfully' });
      return true;
    }

    const reviewActionMatch = pathname.match(/^\/api\/reviews\/([^/]+)\/restore$/);
    if (reviewActionMatch && method === 'POST') {
      if (!requireAdmin(req, res)) return true;
      const reviewId = reviewActionMatch[1];
      const restored = db.restoreReview(reviewId);
      db.addAuditLog('REVIEW_RESTORE', `Restored review ${reviewId} from trash`, 'info', ip, userAgent);
      sendJson(res, 200, { success: true, data: restored, message: 'Review restored successfully' });
      return true;
    }

    const reviewMatch = pathname.match(/^\/api\/reviews\/([^/]+)$/);
    if (reviewMatch) {
      const reviewId = reviewMatch[1];

      if (method === 'PUT' || method === 'PATCH') {
        if (!requireAdmin(req, res)) return true;
        const body = await parseJsonBody(req);
        const updated = db.updateReview(reviewId, body);
        db.addAuditLog('REVIEW_UPDATE', `Updated review ${reviewId} in database (status: ${updated.status})`, 'info', ip, userAgent);
        sendJson(res, 200, { success: true, data: updated, message: 'Review updated successfully' });
        return true;
      }

      if (method === 'DELETE') {
        if (!requireAdmin(req, res)) return true;
        const permanent = params.get('permanent') === 'true';
        const deleted = db.deleteReview(reviewId, permanent);
        if (!deleted) {
          sendError(res, 404, `Review with ID ${reviewId} not found`);
          return true;
        }
        db.addAuditLog('REVIEW_DELETE', `${permanent ? 'Permanently deleted' : 'Moved to trash'} review ${reviewId}`, 'warning', ip, userAgent);
        sendJson(res, 200, { success: true, message: permanent ? 'Review permanently deleted' : 'Review moved to trash safely' });
        return true;
      }
    }

    // -------------------------------------------------------------
    // 6. INQUIRIES & MESSAGES ENDPOINTS (SAFE DELETE & RESTORE)
    // -------------------------------------------------------------
    if (pathname === '/api/messages' && method === 'GET') {
      if (!requireAdmin(req, res)) return true;
      const includeDeleted = params.get('include_deleted') === 'true';
      const messages = db.getMessages(includeDeleted);
      sendJson(res, 200, { success: true, data: messages });
      return true;
    }

    if (pathname === '/api/messages' && method === 'POST') {
      const body = await parseJsonBody(req);
      if (!body.email || !body.email.trim() || !body.message || !body.message.trim()) {
        sendError(res, 400, 'Valid email and project brief message are required');
        return true;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email.trim())) {
        sendError(res, 400, 'Invalid email address format');
        return true;
      }
      const message = db.createMessage({
        ...body,
        email: body.email.trim().toLowerCase().slice(0, 100),
        name: (body.name || 'Anonymous').trim().slice(0, 100),
        company: (body.company || '').trim().slice(0, 100),
        budget: (body.budget || '').trim().slice(0, 50),
        timeline: (body.timeline || '').trim().slice(0, 50),
        message: body.message.trim().slice(0, 5000),
      });

      // Dispatch async lead notification via Resend
      emailService.sendNewLeadNotification({
        name: message.name,
        email: message.email,
        company: message.company,
        projectType: message.projectType,
        budget: message.budget,
        timeline: message.timeline,
        message: message.message,
      }).catch((e) => console.warn('[EmailNotification error]:', e.message));

      db.addAuditLog('INQUIRY_RECEIVED', `Received lead inquiry from "${message.name}" <${message.email}>`, 'info', ip, userAgent);
      sendJson(res, 201, { success: true, data: message, message: 'Inquiry received successfully' });
      return true;
    }

    const messageActionMatch = pathname.match(/^\/api\/messages\/([^/]+)\/restore$/);
    if (messageActionMatch && method === 'POST') {
      if (!requireAdmin(req, res)) return true;
      const messageId = messageActionMatch[1];
      const restored = db.restoreMessage(messageId);
      db.addAuditLog('INQUIRY_RESTORE', `Restored message ${messageId} from trash`, 'info', ip, userAgent);
      sendJson(res, 200, { success: true, data: restored, message: 'Message restored successfully' });
      return true;
    }

    const messageMatch = pathname.match(/^\/api\/messages\/([^/]+)$/);
    if (messageMatch) {
      const messageId = messageMatch[1];

      if (method === 'PUT' || method === 'PATCH') {
        if (!requireAdmin(req, res)) return true;
        const body = await parseJsonBody(req);
        const status = body.status || 'read';
        const updated = db.updateMessageStatus(messageId, status);
        db.addAuditLog('INQUIRY_STATUS_UPDATE', `Updated message ${messageId} status to "${status}" in database`, 'info', ip, userAgent);
        sendJson(res, 200, { success: true, data: updated, message: 'Message status updated' });
        return true;
      }

      if (method === 'DELETE') {
        if (!requireAdmin(req, res)) return true;
        const permanent = params.get('permanent') === 'true';
        const deleted = db.deleteMessage(messageId, permanent);
        if (!deleted) {
          sendError(res, 404, `Message with ID ${messageId} not found`);
          return true;
        }
        db.addAuditLog('INQUIRY_DELETE', `${permanent ? 'Permanently deleted' : 'Moved to trash'} message ${messageId}`, 'info', ip, userAgent);
        sendJson(res, 200, { success: true, message: permanent ? 'Message permanently deleted' : 'Message moved to trash safely' });
        return true;
      }
    }

    // -------------------------------------------------------------
    // 7. SAVED SCOPE QUOTES / PROPOSALS (SAFE DELETE & RESTORE)
    // -------------------------------------------------------------
    if (pathname === '/api/quotes' && method === 'GET') {
      if (!requireAdmin(req, res)) return true;
      const includeDeleted = params.get('include_deleted') === 'true';
      const quotes = db.getSavedQuotes(includeDeleted);
      sendJson(res, 200, { success: true, data: quotes });
      return true;
    }

    if (pathname === '/api/quotes' && method === 'POST') {
      const body = await parseJsonBody(req);
      if (!body.clientEmail || !body.clientEmail.trim()) {
        sendError(res, 400, 'Valid client email address is required');
        return true;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.clientEmail.trim())) {
        sendError(res, 400, 'Invalid email address format');
        return true;
      }
      const quote = db.createSavedQuote({
        ...body,
        clientEmail: body.clientEmail.trim().toLowerCase().slice(0, 100),
        clientName: (body.clientName || 'Anonymous').trim().slice(0, 100),
        company: (body.company || '').trim().slice(0, 100),
      });

      // Dispatch async proposal email via Resend
      emailService.sendNewQuoteNotification({
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        serviceCategory: quote.serviceCategory,
        budgetRange: quote.budgetRange,
        turnaroundTime: quote.turnaroundTime,
        deliverables: quote.deliverables,
        notes: quote.notes,
      }).catch((e) => console.warn('[QuoteEmail error]:', e.message));

      db.addAuditLog('QUOTE_CREATE', `Saved proposal quote for "${quote.clientName}" in database`, 'info', ip, userAgent);
      sendJson(res, 201, { success: true, data: quote, message: 'Quote saved successfully' });
      return true;
    }

    const quoteActionMatch = pathname.match(/^\/api\/quotes\/([^/]+)\/restore$/);
    if (quoteActionMatch && method === 'POST') {
      if (!requireAdmin(req, res)) return true;
      const quoteId = quoteActionMatch[1];
      const restored = db.restoreSavedQuote(quoteId);
      db.addAuditLog('QUOTE_RESTORE', `Restored quote ${quoteId} from trash`, 'info', ip, userAgent);
      sendJson(res, 200, { success: true, data: restored, message: 'Quote restored successfully' });
      return true;
    }

    const quoteMatch = pathname.match(/^\/api\/quotes\/([^/]+)$/);
    if (quoteMatch) {
      const quoteId = quoteMatch[1];

      if (method === 'PUT' || method === 'PATCH') {
        if (!requireAdmin(req, res)) return true;
        const body = await parseJsonBody(req);
        const updated = db.updateSavedQuote(quoteId, body);
        sendJson(res, 200, { success: true, data: updated, message: 'Quote updated successfully' });
        return true;
      }

      if (method === 'DELETE') {
        if (!requireAdmin(req, res)) return true;
        const permanent = params.get('permanent') === 'true';
        const deleted = db.deleteSavedQuote(quoteId, permanent);
        if (!deleted) {
          sendError(res, 404, `Quote with ID ${quoteId} not found`);
          return true;
        }
        db.addAuditLog('QUOTE_DELETE', `${permanent ? 'Permanently deleted' : 'Moved to trash'} quote ${quoteId}`, 'info', ip, userAgent);
        sendJson(res, 200, { success: true, message: permanent ? 'Quote permanently deleted' : 'Quote moved to trash safely' });
        return true;
      }
    }

    // -------------------------------------------------------------
    // 8. ESTIMATOR SETTINGS
    // -------------------------------------------------------------
    if (pathname === '/api/estimator-settings' && method === 'GET') {
      const settings = db.getEstimatorSettings();
      sendJson(res, 200, { success: true, data: settings });
      return true;
    }

    if (pathname === '/api/estimator-settings' && method === 'PUT') {
      if (!requireAdmin(req, res)) return true;
      const body = await parseJsonBody(req);
      const updated = db.updateEstimatorSettings(body);
      db.addAuditLog('ESTIMATOR_UPDATE', 'Updated Scope Estimator configuration & pricing rates in database', 'info', ip, userAgent);
      sendJson(res, 200, { success: true, data: updated, message: 'Estimator settings saved successfully' });
      return true;
    }

    // -------------------------------------------------------------
    // 9. VERSION HISTORY
    // -------------------------------------------------------------
    if (pathname === '/api/versions' && method === 'GET') {
      if (!requireAdmin(req, res)) return true;
      const entityType = params.get('entity_type') || 'all';
      const limit = parseInt(params.get('limit') || '50', 10);
      const versions = db.getVersions(entityType, limit);
      sendJson(res, 200, { success: true, data: versions, total: versions.length });
      return true;
    }

    if (pathname.startsWith('/api/versions/') && method === 'GET') {
      if (!requireAdmin(req, res)) return true;
      const id = pathname.replace('/api/versions/', '');
      const ver = db.getVersionById(id);
      if (!ver) {
        sendError(res, 404, `Version with ID "${id}" not found`);
        return true;
      }
      sendJson(res, 200, { success: true, data: ver });
      return true;
    }

    if (pathname.startsWith('/api/versions/') && pathname.endsWith('/restore') && method === 'POST') {
      if (!requireAdmin(req, res)) return true;
      const parts = pathname.split('/');
      const versionId = parts[3];
      try {
        const body = await parseJsonBody(req).catch(() => ({}));
        const author = body.author || 'Executive Admin';
        const result = await db.restoreVersion(versionId, author);
        db.addAuditLog('VERSION_RESTORE', `Restored content snapshot from version "${versionId}"`, 'warning', ip, userAgent);
        sendJson(res, 200, {
          success: true,
          message: 'Version restored successfully. A new current version has been recorded.',
          data: result,
        });
        return true;
      } catch (err: any) {
        sendError(res, 400, err.message || 'Failed to restore version');
        return true;
      }
    }

    // -------------------------------------------------------------
    // 10. RESET TO FACTORY DEFAULTS
    // -------------------------------------------------------------
    if (pathname === '/api/reset-defaults' && method === 'POST') {
      if (!requireAdmin(req, res)) return true;
      db.resetToDefaults();
      db.addAuditLog('DATA_RESET', 'Entire website catalog restored to factory defaults', 'critical', ip, userAgent);
      sendJson(res, 200, {
        success: true,
        message: 'Website data restored to defaults',
        siteSettings: db.getSiteSettings(),
        projects: db.getProjects(),
        reviews: db.getReviews(true),
        messages: db.getMessages(),
        savedQuotes: db.getSavedQuotes(),
        estimatorSettings: db.getEstimatorSettings(),
      });
      return true;
    }

    // Unknown API route
    sendError(res, 404, `API route ${method} ${pathname} not found`);
    return true;
  } catch (err: any) {
    console.error(`[API Error] ${method} ${pathname}:`, err);
    const details = process.env.NODE_ENV === 'production' ? undefined : err.message;
    sendError(res, 500, 'Internal Server Error', details);
    return true;
  }
}
