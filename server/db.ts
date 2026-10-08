import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { supabaseClient } from './supabase.js';
import {
  initialProjects,
  initialWebsiteContent,
  initialReviews,
  initialMessages,
  initialSavedQuotes,
  initialEstimatorSettings,
} from './seedData.js';

export interface DbProject {
  id: string;
  number: string;
  title: string;
  category: string;
  tagline: string;
  col1_image1: string;
  col1_image2: string;
  col2_image: string;
  video_url?: string;
  media_type?: string;
  media_items_json: string;
  live_url?: string;
  tech_stack_json: string;
  featured: number | boolean;
  aspect_ratio?: string;
  display_order: number;
  status: string;
  published: number | boolean;
  published_at?: string;
  is_deleted?: number | boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbReview {
  id: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  status: string;
  is_featured: number | boolean;
  project_referenced?: string;
  display_order?: number;
  is_deleted?: number | boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  name: string;
  email: string;
  company?: string;
  project_type: string;
  budget: string;
  message: string;
  date: string;
  status: string;
  is_deleted?: number | boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbSavedQuote {
  id: string;
  client_name: string;
  client_email?: string;
  service_category: string;
  budget_range: string;
  turnaround_time: string;
  deliverables_json: string;
  notes?: string;
  status: string;
  is_deleted?: number | boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbSiteSettings {
  id: string;
  hero_json: string | Record<string, any>;
  marquee_json: string | Record<string, any>;
  about_json: string | Record<string, any>;
  services_json: string | Record<string, any>;
  contact_json: string | Record<string, any>;
  character_lighting_json: string | Record<string, any>;
  draft_json?: string | Record<string, any> | null;
  publish_status?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DbEstimatorSettings {
  id: string;
  is_enabled: number | boolean;
  modal_title: string;
  modal_subtitle: string;
  rush_surcharge_percentage: number;
  categories_json: string | Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DbAuditLog {
  id: string;
  action: string;
  details: string;
  severity: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface DbAdminAuth {
  id: string;
  pin_hash: string;
  salt: string;
  failed_attempts: number;
  lockout_until: number;
  created_at: string;
  updated_at: string;
}

export interface DbCmsVersion {
  id: string;
  version_number: number;
  entity_type: string;
  entity_id?: string;
  title: string;
  summary: string;
  content_json: string;
  author: string;
  created_at: string;
}

export function sanitizeVersionPayload(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeVersionPayload);
  const copy: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    const lower = k.toLowerCase();
    if (
      lower.includes('pin') ||
      lower.includes('hash') ||
      lower.includes('salt') ||
      lower.includes('passcode') ||
      lower.includes('password') ||
      lower.includes('secret') ||
      lower.includes('token')
    ) {
      continue;
    }
    copy[k] = sanitizeVersionPayload(v);
  }
  return copy;
}

// Data Directory for local persistence
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'cms.db');
const STORE_BACKUP_FILE = path.join(DATA_DIR, 'cms_store.json');

// Try loading native node:sqlite DatabaseSync
let sqliteDb: any = null;
try {
  const sqliteModule = await import('node:sqlite');
  if (sqliteModule && sqliteModule.DatabaseSync) {
    sqliteDb = new sqliteModule.DatabaseSync(DB_FILE);
    sqliteDb.exec('PRAGMA journal_mode = WAL;');
    sqliteDb.exec('PRAGMA synchronous = NORMAL;');
    sqliteDb.exec('PRAGMA busy_timeout = 5000;');
    sqliteDb.exec('PRAGMA temp_store = MEMORY;');
    sqliteDb.exec('PRAGMA foreign_keys = ON;');
    console.log('[Database] Native SQLite DatabaseSync loaded at:', DB_FILE);
  }
} catch (err: any) {
  console.log('[Database] SQLite native fallback:', err.message);
}

// Durable Fallback Data Store Structure
interface JsonStoreData {
  siteSettings: Record<string, any>;
  siteSettingsDraft?: Record<string, any> | null;
  sitePublishStatus?: string;
  sitePublishedAt?: string;
  projects: any[];
  reviews: any[];
  messages: any[];
  savedQuotes: any[];
  estimatorSettings: Record<string, any>;
  auditLogs: any[];
  adminAuth: {
    pinHash: string;
    salt: string;
    failedAttempts: number;
    lockoutUntil: number;
  };
  version: number;
  lastUpdated: string;
}

let jsonStore: JsonStoreData = {
  siteSettings: {},
  siteSettingsDraft: null,
  sitePublishStatus: 'published',
  sitePublishedAt: new Date().toISOString(),
  projects: [],
  reviews: [],
  messages: [],
  savedQuotes: [],
  estimatorSettings: {},
  auditLogs: [],
  adminAuth: {
    pinHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
    salt: '',
    failedAttempts: 0,
    lockoutUntil: 0,
  },
  version: 1,
  lastUpdated: new Date().toISOString(),
};

function loadJsonStore() {
  if (fs.existsSync(STORE_BACKUP_FILE)) {
    try {
      const raw = fs.readFileSync(STORE_BACKUP_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        jsonStore = { ...jsonStore, ...parsed };
      }
    } catch (e) {
      console.error('[Database] Failed to read JSON fallback store:', e);
    }
  }
}

function persistJsonStore() {
  try {
    jsonStore.lastUpdated = new Date().toISOString();
    const tmpFile = `${STORE_BACKUP_FILE}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(jsonStore, null, 2), 'utf-8');
    fs.renameSync(tmpFile, STORE_BACKUP_FILE);
  } catch (e) {
    console.error('[Database] Error saving JSON fallback store:', e);
  }
}

export class CmsDatabase {
  private initialized = false;

  constructor() {
    loadJsonStore();
  }

  public async init(): Promise<void> {
    if (this.initialized) return;

    if (sqliteDb) {
      this.initSqliteSchema();
    } else {
      this.initJsonStoreSeed();
    }

    // If Supabase is configured, initialize or sync schema
    if (supabaseClient.isConfigured()) {
      console.log('[Database] Supabase PostgreSQL integration ACTIVE');
      this.syncSupabaseIfEmpty().catch((err) => {
        console.warn('[Database] Supabase initial check:', err.message);
      });
    }

    this.initialized = true;
  }

  private initSqliteSchema() {
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id TEXT PRIMARY KEY,
        hero_json TEXT NOT NULL,
        marquee_json TEXT NOT NULL,
        about_json TEXT NOT NULL,
        services_json TEXT NOT NULL,
        contact_json TEXT NOT NULL,
        character_lighting_json TEXT NOT NULL,
        draft_json TEXT,
        publish_status TEXT DEFAULT 'published',
        published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT DEFAULT 'Executive Admin',
        updated_by TEXT DEFAULT 'Executive Admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        number TEXT NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        tagline TEXT NOT NULL,
        col1_image1 TEXT NOT NULL,
        col1_image2 TEXT NOT NULL,
        col2_image TEXT NOT NULL,
        video_url TEXT,
        media_type TEXT DEFAULT 'image',
        media_items_json TEXT NOT NULL DEFAULT '[]',
        live_url TEXT,
        tech_stack_json TEXT NOT NULL DEFAULT '[]',
        featured INTEGER DEFAULT 1,
        aspect_ratio TEXT DEFAULT 'auto',
        display_order INTEGER DEFAULT 0,
        status TEXT DEFAULT 'published',
        published INTEGER DEFAULT 1,
        published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_deleted INTEGER DEFAULT 0,
        deleted_at DATETIME,
        created_by TEXT DEFAULT 'Executive Admin',
        updated_by TEXT DEFAULT 'Executive Admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(display_order);
      CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
      CREATE INDEX IF NOT EXISTS idx_projects_deleted ON projects(is_deleted);

      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        author TEXT NOT NULL,
        role TEXT NOT NULL,
        company TEXT NOT NULL,
        avatar TEXT NOT NULL,
        rating REAL NOT NULL,
        comment TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'approved',
        is_featured INTEGER DEFAULT 0,
        project_referenced TEXT,
        display_order INTEGER DEFAULT 0,
        is_deleted INTEGER DEFAULT 0,
        deleted_at DATETIME,
        created_by TEXT DEFAULT 'Executive Admin',
        updated_by TEXT DEFAULT 'Executive Admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
      CREATE INDEX IF NOT EXISTS idx_reviews_deleted ON reviews(is_deleted);
      CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(display_order);

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        company TEXT,
        project_type TEXT NOT NULL,
        budget TEXT NOT NULL,
        message TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'unread',
        is_deleted INTEGER DEFAULT 0,
        deleted_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
      CREATE INDEX IF NOT EXISTS idx_messages_deleted ON messages(is_deleted);

      CREATE TABLE IF NOT EXISTS saved_quotes (
        id TEXT PRIMARY KEY,
        client_name TEXT NOT NULL,
        client_email TEXT,
        service_category TEXT NOT NULL,
        budget_range TEXT NOT NULL,
        turnaround_time TEXT NOT NULL,
        deliverables_json TEXT NOT NULL DEFAULT '[]',
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        is_deleted INTEGER DEFAULT 0,
        deleted_at DATETIME,
        created_by TEXT DEFAULT 'Executive Admin',
        updated_by TEXT DEFAULT 'Executive Admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_quotes_deleted ON saved_quotes(is_deleted);

      CREATE TABLE IF NOT EXISTS estimator_settings (
        id TEXT PRIMARY KEY,
        is_enabled INTEGER DEFAULT 1,
        modal_title TEXT NOT NULL,
        modal_subtitle TEXT NOT NULL,
        rush_surcharge_percentage REAL DEFAULT 25,
        categories_json TEXT NOT NULL,
        created_by TEXT DEFAULT 'Executive Admin',
        updated_by TEXT DEFAULT 'Executive Admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'info',
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

      CREATE TABLE IF NOT EXISTS admin_auth (
        id TEXT PRIMARY KEY,
        pin_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        failed_attempts INTEGER DEFAULT 0,
        lockout_until INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cms_versions (
        id TEXT PRIMARY KEY,
        version_number INTEGER NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        content_json TEXT NOT NULL,
        author TEXT DEFAULT 'Executive Admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_cms_versions_entity ON cms_versions(entity_type, created_at);
    `);

    // Safe column migrations for existing SQLite database files
    try { sqliteDb.exec('ALTER TABLE site_settings ADD COLUMN draft_json TEXT;'); } catch {}
    try { sqliteDb.exec("ALTER TABLE site_settings ADD COLUMN publish_status TEXT DEFAULT 'published';"); } catch {}
    try { sqliteDb.exec("ALTER TABLE site_settings ADD COLUMN published_at DATETIME DEFAULT CURRENT_TIMESTAMP;"); } catch {}
    try { sqliteDb.exec("ALTER TABLE site_settings ADD COLUMN created_by TEXT DEFAULT 'Executive Admin';"); } catch {}
    try { sqliteDb.exec("ALTER TABLE site_settings ADD COLUMN updated_by TEXT DEFAULT 'Executive Admin';"); } catch {}
    try { sqliteDb.exec("ALTER TABLE projects ADD COLUMN status TEXT DEFAULT 'published';"); } catch {}
    try { sqliteDb.exec("ALTER TABLE projects ADD COLUMN published INTEGER DEFAULT 1;"); } catch {}
    try { sqliteDb.exec("ALTER TABLE projects ADD COLUMN published_at DATETIME DEFAULT CURRENT_TIMESTAMP;"); } catch {}
    try { sqliteDb.exec("ALTER TABLE projects ADD COLUMN is_deleted INTEGER DEFAULT 0;"); } catch {}
    try { sqliteDb.exec("ALTER TABLE projects ADD COLUMN deleted_at DATETIME;"); } catch {}
    try { sqliteDb.exec("ALTER TABLE projects ADD COLUMN created_by TEXT DEFAULT 'Executive Admin';"); } catch {}
    try { sqliteDb.exec("ALTER TABLE projects ADD COLUMN updated_by TEXT DEFAULT 'Executive Admin';"); } catch {}
    try { sqliteDb.exec("ALTER TABLE reviews ADD COLUMN display_order INTEGER DEFAULT 0;"); } catch {}
    try { sqliteDb.exec("ALTER TABLE reviews ADD COLUMN is_deleted INTEGER DEFAULT 0;"); } catch {}
    try { sqliteDb.exec("ALTER TABLE reviews ADD COLUMN deleted_at DATETIME;"); } catch {}
    try { sqliteDb.exec("ALTER TABLE reviews ADD COLUMN created_by TEXT DEFAULT 'Executive Admin';"); } catch {}
    try { sqliteDb.exec("ALTER TABLE reviews ADD COLUMN updated_by TEXT DEFAULT 'Executive Admin';"); } catch {}
    try { sqliteDb.exec("CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(display_order);"); } catch {}
    try { sqliteDb.exec("ALTER TABLE messages ADD COLUMN is_deleted INTEGER DEFAULT 0;"); } catch {}
    try { sqliteDb.exec("ALTER TABLE messages ADD COLUMN deleted_at DATETIME;"); } catch {}
    try { sqliteDb.exec("ALTER TABLE saved_quotes ADD COLUMN is_deleted INTEGER DEFAULT 0;"); } catch {}
    try { sqliteDb.exec("ALTER TABLE saved_quotes ADD COLUMN deleted_at DATETIME;"); } catch {}
    try { sqliteDb.exec("ALTER TABLE saved_quotes ADD COLUMN created_by TEXT DEFAULT 'Executive Admin';"); } catch {}
    try { sqliteDb.exec("ALTER TABLE saved_quotes ADD COLUMN updated_by TEXT DEFAULT 'Executive Admin';"); } catch {}
    try { sqliteDb.exec("ALTER TABLE estimator_settings ADD COLUMN created_by TEXT DEFAULT 'Executive Admin';"); } catch {}
    try { sqliteDb.exec("ALTER TABLE estimator_settings ADD COLUMN updated_by TEXT DEFAULT 'Executive Admin';"); } catch {}

    this.seedSqliteIfEmpty();
  }

  private seedSqliteIfEmpty() {
    const countSettings = sqliteDb.prepare('SELECT COUNT(*) as count FROM site_settings').get() as { count: number };
    if (countSettings.count === 0) {
      console.log('[Database] Initializing default site settings in SQLite...');
      const stmt = sqliteDb.prepare(`
        INSERT INTO site_settings (id, hero_json, marquee_json, about_json, services_json, contact_json, character_lighting_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      stmt.run(
        'main_settings',
        JSON.stringify(initialWebsiteContent.hero),
        JSON.stringify(initialWebsiteContent.marquee),
        JSON.stringify(initialWebsiteContent.about),
        JSON.stringify(initialWebsiteContent.services),
        JSON.stringify(initialWebsiteContent.contact),
        JSON.stringify(initialWebsiteContent.characterLighting)
      );
    }

    const countProjects = sqliteDb.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
    if (countProjects.count === 0) {
      console.log('[Database] Seeding initial project catalog in SQLite...');
      const insertProj = sqliteDb.prepare(`
        INSERT INTO projects (id, number, title, category, tagline, col1_image1, col1_image2, col2_image, video_url, media_type, media_items_json, live_url, tech_stack_json, featured, aspect_ratio, display_order, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      initialProjects.forEach((p, idx) => {
        insertProj.run(
          p.id,
          p.number,
          p.title,
          p.category,
          p.tagline || '',
          p.col1Image1 || '',
          p.col1Image2 || '',
          p.col2Image || '',
          p.videoUrl || '',
          p.mediaType || 'image',
          JSON.stringify(p.mediaItems || []),
          p.liveUrl || '',
          JSON.stringify(p.techStack || []),
          p.featured ? 1 : 0,
          p.aspectRatio || 'auto',
          idx
        );
      });
    }

    const countReviews = sqliteDb.prepare('SELECT COUNT(*) as count FROM reviews').get() as { count: number };
    if (countReviews.count === 0) {
      const insertRev = sqliteDb.prepare(`
        INSERT INTO reviews (id, author, role, company, avatar, rating, comment, date, status, is_featured, project_referenced, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      initialReviews.forEach((r) => {
        insertRev.run(
          r.id,
          r.author,
          r.role,
          r.company,
          r.avatar,
          r.rating,
          r.comment,
          r.date,
          r.status,
          r.isFeatured ? 1 : 0,
          r.projectReferenced || null
        );
      });
    }

    const countMessages = sqliteDb.prepare('SELECT COUNT(*) as count FROM messages').get() as { count: number };
    if (countMessages.count === 0) {
      const insertMsg = sqliteDb.prepare(`
        INSERT INTO messages (id, name, email, company, project_type, budget, message, date, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      initialMessages.forEach((m) => {
        insertMsg.run(m.id, m.name, m.email, m.company || '', m.projectType, m.budget, m.message, m.date, m.status);
      });
    }

    const countQuotes = sqliteDb.prepare('SELECT COUNT(*) as count FROM saved_quotes').get() as { count: number };
    if (countQuotes.count === 0) {
      const insertQuote = sqliteDb.prepare(`
        INSERT INTO saved_quotes (id, client_name, client_email, service_category, budget_range, turnaround_time, deliverables_json, notes, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      initialSavedQuotes.forEach((q) => {
        insertQuote.run(
          q.id,
          q.clientName,
          q.clientEmail || null,
          q.serviceCategory,
          q.budgetRange,
          q.turnaroundTime,
          JSON.stringify(q.deliverables || []),
          q.notes || '',
          q.status
        );
      });
    }

    const countEstimator = sqliteDb.prepare('SELECT COUNT(*) as count FROM estimator_settings').get() as { count: number };
    if (countEstimator.count === 0) {
      const insertEst = sqliteDb.prepare(`
        INSERT INTO estimator_settings (id, is_enabled, modal_title, modal_subtitle, rush_surcharge_percentage, categories_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      insertEst.run(
        'main_estimator',
        initialEstimatorSettings.isEnabled ? 1 : 0,
        initialEstimatorSettings.modalTitle,
        initialEstimatorSettings.modalSubtitle,
        initialEstimatorSettings.rushSurchargePercentage,
        JSON.stringify(initialEstimatorSettings.categories)
      );
    }

    const countAuth = sqliteDb.prepare('SELECT COUNT(*) as count FROM admin_auth').get() as { count: number };
    if (countAuth.count === 0) {
      const defaultHash = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92';
      const salt = crypto.randomBytes(16).toString('hex');
      const insertAuth = sqliteDb.prepare(`
        INSERT INTO admin_auth (id, pin_hash, salt, failed_attempts, lockout_until, created_at, updated_at)
        VALUES (?, ?, ?, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      insertAuth.run('owner_auth', defaultHash, salt);
    }
  }

  private initJsonStoreSeed() {
    if (!jsonStore.siteSettings || Object.keys(jsonStore.siteSettings).length === 0) {
      jsonStore.siteSettings = initialWebsiteContent;
    }
    if (!jsonStore.projects || jsonStore.projects.length === 0) {
      jsonStore.projects = initialProjects;
    }
    if (!jsonStore.reviews || jsonStore.reviews.length === 0) {
      jsonStore.reviews = initialReviews;
    }
    if (!jsonStore.messages || jsonStore.messages.length === 0) {
      jsonStore.messages = initialMessages;
    }
    if (!jsonStore.savedQuotes || jsonStore.savedQuotes.length === 0) {
      jsonStore.savedQuotes = initialSavedQuotes;
    }
    if (!jsonStore.estimatorSettings || Object.keys(jsonStore.estimatorSettings).length === 0) {
      jsonStore.estimatorSettings = initialEstimatorSettings;
    }
    persistJsonStore();
  }

  private async syncSupabaseIfEmpty() {
    if (!supabaseClient.isConfigured()) return;
    try {
      const rows = await supabaseClient.getRows('projects', 'select=id&limit=1');
      if (!rows || rows.length === 0) {
        console.log('[Supabase] Seeding initial projects to Supabase PostgreSQL...');
        for (const p of initialProjects) {
          await supabaseClient.upsertRow('projects', {
            id: p.id,
            number: p.number,
            title: p.title,
            category: p.category,
            tagline: p.tagline,
            col1_image1: p.col1Image1,
            col1_image2: p.col1Image2,
            col2_image: p.col2Image,
            video_url: p.videoUrl || '',
            media_type: p.mediaType || 'image',
            media_items_json: p.mediaItems || [],
            live_url: p.liveUrl || '',
            tech_stack_json: p.techStack || [],
            featured: p.featured ?? true,
            aspect_ratio: p.aspectRatio || 'auto',
          });
        }
      }
    } catch (e: any) {
      console.warn('[Supabase Sync Notice]:', e.message);
    }
  }

  // ===================== SITE SETTINGS (DRAFT & PUBLISH) =====================
  public getSiteSettings(asDraft = false): any {
    this.init();
    if (sqliteDb) {
      const row = sqliteDb.prepare('SELECT * FROM site_settings WHERE id = ?').get('main_settings') as DbSiteSettings;
      if (!row) return initialWebsiteContent;

      const published = {
        hero: typeof row.hero_json === 'string' ? JSON.parse(row.hero_json) : row.hero_json,
        marquee: typeof row.marquee_json === 'string' ? JSON.parse(row.marquee_json) : row.marquee_json,
        about: typeof row.about_json === 'string' ? JSON.parse(row.about_json) : row.about_json,
        services: typeof row.services_json === 'string' ? JSON.parse(row.services_json) : row.services_json,
        contact: typeof row.contact_json === 'string' ? JSON.parse(row.contact_json) : row.contact_json,
        characterLighting: typeof row.character_lighting_json === 'string' ? JSON.parse(row.character_lighting_json) : row.character_lighting_json,
        updatedAt: row.updated_at,
      };

      if (!asDraft) {
        const filteredServices = published.services
          ? {
              ...published.services,
              items: (published.services.items || []).filter(
                (s: any) =>
                  !s.isDeleted &&
                  !s.deletedAt &&
                  s.status !== 'archived' &&
                  !s.isHidden &&
                  s.status !== 'hidden' &&
                  s.status !== 'unpublished'
              ),
            }
          : published.services;

        const filteredAbout = published.about
          ? {
              ...published.about,
              pillars: (published.about.pillars || []).filter(
                (p: any) => !p.isHidden && !p.isDeleted
              ),
            }
          : published.about;

        return {
          ...published,
          services: filteredServices,
          about: filteredAbout,
        };
      }

      if (row.draft_json) {
        try {
          const draftParsed = typeof row.draft_json === 'string' ? JSON.parse(row.draft_json) : row.draft_json;
          if (draftParsed && typeof draftParsed === 'object') {
            return {
              hero: { ...published.hero, ...(draftParsed.hero || {}) },
              marquee: { ...published.marquee, ...(draftParsed.marquee || {}) },
              about: { ...published.about, ...(draftParsed.about || {}) },
              services: draftParsed.services || published.services,
              contact: { ...published.contact, ...(draftParsed.contact || {}) },
              characterLighting: { ...(published.characterLighting || {}), ...(draftParsed.characterLighting || {}) },
              updatedAt: row.updated_at,
            };
          }
        } catch {}
      }
      return published;
    } else {
      const published = jsonStore.siteSettings || initialWebsiteContent;
      if (!asDraft) {
        const filteredServices = published.services
          ? {
              ...published.services,
              items: (published.services.items || []).filter(
                (s: any) =>
                  !s.isDeleted &&
                  !s.deletedAt &&
                  s.status !== 'archived' &&
                  !s.isHidden &&
                  s.status !== 'hidden' &&
                  s.status !== 'unpublished'
              ),
            }
          : published.services;

        const filteredAbout = published.about
          ? {
              ...published.about,
              pillars: (published.about.pillars || []).filter(
                (p: any) => !p.isHidden && !p.isDeleted
              ),
            }
          : published.about;

        return {
          ...published,
          services: filteredServices,
          about: filteredAbout,
        };
      }
      if (asDraft && jsonStore.siteSettingsDraft) {
        return {
          ...published,
          ...jsonStore.siteSettingsDraft,
          hero: { ...published.hero, ...(jsonStore.siteSettingsDraft.hero || {}) },
          about: { ...published.about, ...(jsonStore.siteSettingsDraft.about || {}) },
          contact: { ...published.contact, ...(jsonStore.siteSettingsDraft.contact || {}) },
          marquee: { ...published.marquee, ...(jsonStore.siteSettingsDraft.marquee || {}) },
          services: jsonStore.siteSettingsDraft.services || published.services,
          characterLighting: { ...(published.characterLighting || {}), ...(jsonStore.siteSettingsDraft.characterLighting || {}) },
        };
      }
      return published;
    }
  }

  public getSiteSettingsAdmin(): any {
    this.init();
    const published = this.getSiteSettings(false);
    const draft = this.getSiteSettings(true);

    let publishStatus: 'published' | 'draft' | 'modified' = 'published';
    let publishedAt: string | null = null;
    let updatedAt = new Date().toISOString();
    let hasDraftChanges = false;

    if (sqliteDb) {
      const row = sqliteDb.prepare('SELECT * FROM site_settings WHERE id = ?').get('main_settings') as DbSiteSettings;
      if (row) {
        publishStatus = (row.publish_status as any) || (row.draft_json ? 'modified' : 'published');
        publishedAt = row.published_at || row.updated_at;
        updatedAt = row.updated_at;
        hasDraftChanges = Boolean(row.draft_json);
      }
    } else {
      publishStatus = (jsonStore.sitePublishStatus as any) || (jsonStore.siteSettingsDraft ? 'modified' : 'published');
      publishedAt = jsonStore.sitePublishedAt || null;
      updatedAt = jsonStore.lastUpdated;
      hasDraftChanges = Boolean(jsonStore.siteSettingsDraft);
    }

    return {
      published,
      draft,
      current: draft,
      status: publishStatus,
      publishedAt,
      updatedAt,
      hasDraftChanges,
    };
  }

  public saveSiteSettingsDraft(content: any): any {
    this.init();
    const currentDraft = this.getSiteSettings(true);
    const mergedDraft = {
      hero: { ...currentDraft.hero, ...(content.hero || {}) },
      marquee: { ...currentDraft.marquee, ...(content.marquee || {}) },
      about: { ...currentDraft.about, ...(content.about || {}) },
      services: {
        heading: content.services?.heading ?? currentDraft.services?.heading ?? 'WHAT WE DO',
        subheading: content.services?.subheading ?? currentDraft.services?.subheading ?? '',
        items: content.services?.items ?? currentDraft.services?.items ?? [],
      },
      contact: { ...currentDraft.contact, ...(content.contact || {}) },
      characterLighting: { ...(currentDraft.characterLighting || {}), ...(content.characterLighting || {}) },
    };

    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        UPDATE site_settings
        SET draft_json = ?, publish_status = 'modified', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(JSON.stringify(mergedDraft), 'main_settings');
    } else {
      jsonStore.siteSettingsDraft = mergedDraft;
      jsonStore.sitePublishStatus = 'modified';
      persistJsonStore();
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.upsertRow('site_settings', {
        id: 'main_settings',
        draft_json: mergedDraft,
        publish_status: 'modified',
        updated_at: new Date().toISOString(),
      }).catch((e) => console.warn('[Supabase draft save notice]:', e.message));
    }

    return this.getSiteSettingsAdmin();
  }

  public publishSiteSettings(content?: any, recordHistory = true): any {
    this.init();
    const base = content ? content : this.getSiteSettings(true);
    const currentPublished = this.getSiteSettings(false);

    const mergedToPublish = {
      hero: { ...currentPublished.hero, ...(base.hero || {}) },
      marquee: { ...currentPublished.marquee, ...(base.marquee || {}) },
      about: { ...currentPublished.about, ...(base.about || {}) },
      services: {
        heading: base.services?.heading ?? currentPublished.services?.heading ?? 'WHAT WE DO',
        subheading: base.services?.subheading ?? currentPublished.services?.subheading ?? '',
        items: base.services?.items ?? currentPublished.services?.items ?? [],
      },
      contact: { ...currentPublished.contact, ...(base.contact || {}) },
      characterLighting: { ...(currentPublished.characterLighting || {}), ...(base.characterLighting || {}) },
    };

    const nowIso = new Date().toISOString();

    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        UPDATE site_settings
        SET hero_json = ?, marquee_json = ?, about_json = ?, services_json = ?, contact_json = ?, character_lighting_json = ?,
            draft_json = NULL, publish_status = 'published', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(
        JSON.stringify(mergedToPublish.hero),
        JSON.stringify(mergedToPublish.marquee),
        JSON.stringify(mergedToPublish.about),
        JSON.stringify(mergedToPublish.services),
        JSON.stringify(mergedToPublish.contact),
        JSON.stringify(mergedToPublish.characterLighting),
        'main_settings'
      );
    } else {
      jsonStore.siteSettings = mergedToPublish;
      jsonStore.siteSettingsDraft = null;
      jsonStore.sitePublishStatus = 'published';
      jsonStore.sitePublishedAt = nowIso;
      persistJsonStore();
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.upsertRow('site_settings', {
        id: 'main_settings',
        hero_json: mergedToPublish.hero,
        marquee_json: mergedToPublish.marquee,
        about_json: mergedToPublish.about,
        services_json: mergedToPublish.services,
        contact_json: mergedToPublish.contact,
        character_lighting_json: mergedToPublish.characterLighting,
        draft_json: null,
        publish_status: 'published',
        published_at: nowIso,
        updated_at: nowIso,
      }).catch((e) => console.warn('[Supabase site_settings publish warning]:', e.message));
    }

    if (recordHistory) {
      this.recordVersion(
        'site_content',
        undefined,
        mergedToPublish.hero?.title || 'Site Content & Hero Revision',
        `Published live website content update (${mergedToPublish.services?.items?.length || 0} services, hero headline updated)`,
        mergedToPublish
      );
    }

    return this.getSiteSettingsAdmin();
  }

  public revertSiteSettingsDraft(): any {
    this.init();
    if (sqliteDb) {
      sqliteDb.prepare(`
        UPDATE site_settings
        SET draft_json = NULL, publish_status = 'published', updated_at = CURRENT_TIMESTAMP
        WHERE id = 'main_settings'
      `).run();
    } else {
      jsonStore.siteSettingsDraft = null;
      jsonStore.sitePublishStatus = 'published';
      persistJsonStore();
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.upsertRow('site_settings', {
        id: 'main_settings',
        draft_json: null,
        publish_status: 'published',
        updated_at: new Date().toISOString(),
      }).catch(() => {});
    }

    return this.getSiteSettingsAdmin();
  }

  public updateSiteSettings(content: any): any {
    return this.publishSiteSettings(content);
  }

  // ===================== PROJECTS (DRAFT & PUBLISH) =====================
  // ===================== PROJECTS (DRAFT, PUBLISH & SAFE DELETION) =====================
  public getProjects(includeAll = false, includeDeleted = false): any[] {
    this.init();
    if (sqliteDb) {
      let query = '';
      if (includeAll && includeDeleted) {
        query = 'SELECT * FROM projects ORDER BY display_order ASC, created_at DESC';
      } else if (includeAll && !includeDeleted) {
        query = 'SELECT * FROM projects WHERE (is_deleted = 0 OR is_deleted IS NULL) ORDER BY display_order ASC, created_at DESC';
      } else {
        query = "SELECT * FROM projects WHERE (is_deleted = 0 OR is_deleted IS NULL) AND (status = 'published' OR (status IS NULL AND (featured = 1 OR published = 1))) ORDER BY display_order ASC, created_at DESC";
      }
      const rows = sqliteDb.prepare(query).all() as DbProject[];
      return rows.map((r) => ({
        id: r.id,
        number: r.number,
        title: r.title,
        category: r.category,
        tagline: r.tagline,
        col1Image1: r.col1_image1,
        col1Image2: r.col1_image2,
        col2Image: r.col2_image,
        videoUrl: r.video_url || '',
        mediaType: (r.media_type || 'image') as 'image' | 'video',
        mediaItems: typeof r.media_items_json === 'string' ? JSON.parse(r.media_items_json || '[]') : r.media_items_json,
        liveUrl: r.live_url || '',
        techStack: typeof r.tech_stack_json === 'string' ? JSON.parse(r.tech_stack_json || '[]') : r.tech_stack_json,
        featured: Boolean(r.featured),
        aspectRatio: (r.aspect_ratio || 'auto') as 'auto' | '16:9' | '9:16',
        displayOrder: r.display_order,
        status: (r.status || 'published') as 'draft' | 'published' | 'unpublished' | 'archived',
        published: Boolean(r.published ?? (r.status === 'published')),
        publishedAt: r.published_at,
        isDeleted: Boolean(r.is_deleted),
        deletedAt: r.deleted_at || null,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } else {
      const all = jsonStore.projects || [];
      if (includeAll && includeDeleted) return all;
      if (includeAll && !includeDeleted) return all.filter((p) => !p.isDeleted);
      return all.filter((p) => !p.isDeleted && (p.status || 'published') === 'published');
    }
  }

  public getProjectById(id: string): any | null {
    this.init();
    const projects = this.getProjects(true, true);
    return projects.find((p) => p.id === id) || null;
  }

  public createProject(project: any, recordHistory = true): any {
    this.init();
    const id = project.id || `proj-${Date.now()}`;
    const all = this.getProjects(true, true);
    const displayOrder = project.displayOrder !== undefined ? project.displayOrder : all.length;
    const number = project.number || (all.length + 1 < 10 ? `0${all.length + 1}` : `${all.length + 1}`);
    const status = project.status || 'published';
    const isPublished = status === 'published';
    const nowIso = new Date().toISOString();

    const normalized = {
      id,
      number,
      title: project.title || 'Untitled Project',
      category: project.category || 'UGC ADS',
      tagline: project.tagline || '',
      col1Image1: project.col1Image1 || '',
      col1Image2: project.col1Image2 || '',
      col2Image: project.col2Image || '',
      videoUrl: project.videoUrl || '',
      mediaType: project.mediaType || 'image',
      mediaItems: project.mediaItems || [],
      liveUrl: project.liveUrl || '',
      techStack: project.techStack || ['React', 'TypeScript', 'Tailwind'],
      featured: project.featured !== undefined ? project.featured : true,
      aspectRatio: project.aspectRatio || 'auto',
      displayOrder,
      status,
      published: isPublished,
      publishedAt: isPublished ? nowIso : null,
      isDeleted: false,
      deletedAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        INSERT INTO projects (id, number, title, category, tagline, col1_image1, col1_image2, col2_image, video_url, media_type, media_items_json, live_url, tech_stack_json, featured, aspect_ratio, display_order, status, published, published_at, is_deleted, deleted_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      stmt.run(
        normalized.id,
        normalized.number,
        normalized.title,
        normalized.category,
        normalized.tagline,
        normalized.col1Image1,
        normalized.col1Image2,
        normalized.col2Image,
        normalized.videoUrl,
        normalized.mediaType,
        JSON.stringify(normalized.mediaItems),
        normalized.liveUrl,
        JSON.stringify(normalized.techStack),
        normalized.featured ? 1 : 0,
        normalized.aspectRatio,
        normalized.displayOrder,
        normalized.status,
        normalized.published ? 1 : 0,
        normalized.publishedAt
      );
    } else {
      jsonStore.projects.unshift(normalized);
      persistJsonStore();
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.upsertRow('projects', {
        id: normalized.id,
        number: normalized.number,
        title: normalized.title,
        category: normalized.category,
        tagline: normalized.tagline,
        col1_image1: normalized.col1Image1,
        col1_image2: normalized.col1Image2,
        col2_image: normalized.col2Image,
        video_url: normalized.videoUrl,
        media_type: normalized.mediaType,
        media_items_json: normalized.mediaItems,
        live_url: normalized.liveUrl,
        tech_stack_json: normalized.techStack,
        featured: normalized.featured,
        aspect_ratio: normalized.aspectRatio,
        display_order: normalized.displayOrder,
        status: normalized.status,
        published: normalized.published,
        published_at: normalized.publishedAt,
        is_deleted: false,
        deleted_at: null,
        created_at: normalized.createdAt,
        updated_at: normalized.updatedAt,
      }).catch((e) => console.warn('[Supabase project create warning]:', e.message));
    }

    if (recordHistory) {
      this.recordVersion(
        'project',
        normalized.id,
        `Project: ${normalized.title}`,
        `Created new project #${normalized.number} (${normalized.category})`,
        normalized
      );
    }

    return normalized;
  }

  public updateProject(id: string, updates: any, recordHistory = true): any {
    this.init();
    const existing = this.getProjectById(id);
    if (!existing) {
      throw new Error(`Project with ID ${id} not found`);
    }

    const nextStatus = updates.status !== undefined ? updates.status : existing.status || 'published';
    const isPublished = nextStatus === 'published';
    const publishedAt = isPublished
      ? (existing.publishedAt || new Date().toISOString())
      : (updates.status === 'unpublished' || updates.status === 'draft' ? null : existing.publishedAt);

    const isDeleted = updates.isDeleted !== undefined ? Boolean(updates.isDeleted) : Boolean(existing.isDeleted);
    const deletedAt = updates.deletedAt !== undefined ? updates.deletedAt : (isDeleted ? (existing.deletedAt || new Date().toISOString()) : null);

    const updated = {
      ...existing,
      ...updates,
      status: nextStatus,
      published: isPublished,
      publishedAt,
      isDeleted,
      deletedAt,
      updatedAt: new Date().toISOString(),
    };

    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        UPDATE projects
        SET number = ?, title = ?, category = ?, tagline = ?, col1_image1 = ?, col1_image2 = ?, col2_image = ?, video_url = ?, media_type = ?, media_items_json = ?, live_url = ?, tech_stack_json = ?, featured = ?, aspect_ratio = ?, display_order = ?, status = ?, published = ?, published_at = ?, is_deleted = ?, deleted_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(
        updated.number,
        updated.title,
        updated.category,
        updated.tagline || '',
        updated.col1Image1 || '',
        updated.col1Image2 || '',
        updated.col2Image || '',
        updated.videoUrl || '',
        updated.mediaType || 'image',
        JSON.stringify(updated.mediaItems || []),
        updated.liveUrl || '',
        JSON.stringify(updated.techStack || []),
        updated.featured ? 1 : 0,
        updated.aspectRatio || 'auto',
        updated.displayOrder || 0,
        updated.status,
        updated.published ? 1 : 0,
        updated.publishedAt,
        updated.isDeleted ? 1 : 0,
        updated.deletedAt || null,
        id
      );
    } else {
      jsonStore.projects = jsonStore.projects.map((p) => (p.id === id ? updated : p));
      persistJsonStore();
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.updateRow('projects', id, {
        number: updated.number,
        title: updated.title,
        category: updated.category,
        tagline: updated.tagline,
        col1_image1: updated.col1Image1,
        col1_image2: updated.col1Image2,
        col2_image: updated.col2Image,
        video_url: updated.videoUrl,
        media_type: updated.mediaType,
        media_items_json: updated.mediaItems,
        live_url: updated.liveUrl,
        tech_stack_json: updated.techStack,
        featured: updated.featured,
        aspect_ratio: updated.aspectRatio,
        display_order: updated.displayOrder,
        status: updated.status,
        published: updated.published,
        published_at: updated.publishedAt,
        is_deleted: updated.isDeleted,
        deleted_at: updated.deletedAt,
        updated_at: updated.updatedAt,
      }).catch((e) => console.warn('[Supabase project update warning]:', e.message));
    }

    if (recordHistory) {
      this.recordVersion(
        'project',
        updated.id,
        `Project: ${updated.title}`,
        `Updated project details and assets (status: ${updated.status})`,
        updated
      );
    }

    return updated;
  }

  public publishProject(id: string): any {
    return this.updateProject(id, {
      status: 'published',
      published: true,
      isDeleted: false,
      deletedAt: null,
      publishedAt: new Date().toISOString(),
    });
  }

  public unpublishProject(id: string): any {
    return this.updateProject(id, {
      status: 'unpublished',
      published: false,
    });
  }

  public draftProject(id: string): any {
    return this.updateProject(id, {
      status: 'draft',
      published: false,
    });
  }

  public softDeleteProject(id: string, author = 'Executive Admin'): any {
    this.init();
    const existing = this.getProjectById(id);
    if (!existing) throw new Error(`Project with ID ${id} not found`);

    const updated = this.updateProject(
      id,
      {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        status: 'archived',
        published: false,
      },
      false
    );

    this.recordVersion(
      'project',
      id,
      `Deleted Project (Trash): ${existing.title}`,
      `Moved project to trash (soft-delete). Safe to restore anytime.`,
      updated,
      author
    );

    return updated;
  }

  public restoreProject(id: string, author = 'Executive Admin'): any {
    this.init();
    const existing = this.getProjectById(id);
    if (!existing) throw new Error(`Project with ID ${id} not found`);

    const updated = this.updateProject(
      id,
      {
        isDeleted: false,
        deletedAt: null,
        status: 'published',
        published: true,
        publishedAt: new Date().toISOString(),
      },
      false
    );

    this.recordVersion(
      'project',
      id,
      `Restored Project: ${existing.title}`,
      `Restored project from trash back to active catalog.`,
      updated,
      author
    );

    return updated;
  }

  public deleteProject(id: string, permanent = false, author = 'Executive Admin'): boolean {
    this.init();
    if (!permanent) {
      this.softDeleteProject(id, author);
      return true;
    }

    let deleted = false;
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('DELETE FROM projects WHERE id = ?');
      const res = stmt.run(id);
      deleted = res.changes > 0;
    } else {
      const initLen = jsonStore.projects.length;
      jsonStore.projects = jsonStore.projects.filter((p) => p.id !== id);
      persistJsonStore();
      deleted = jsonStore.projects.length < initLen;
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.deleteRow('projects', id).catch((e) => console.warn('[Supabase project delete warning]:', e.message));
    }

    return deleted;
  }

  public reorderProjects(orderedProjects: any[], author = 'Executive Admin'): any[] {
    this.init();
    const normalized = (orderedProjects || []).map((p, idx) => ({
      id: typeof p === 'string' ? p : p.id,
      displayOrder: idx,
    }));

    if (sqliteDb) {
      const stmt = sqliteDb.prepare('UPDATE projects SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      sqliteDb.exec('BEGIN TRANSACTION;');
      try {
        normalized.forEach((item) => {
          stmt.run(item.displayOrder, item.id);
        });
        sqliteDb.exec('COMMIT;');
      } catch (err) {
        sqliteDb.exec('ROLLBACK;');
        throw err;
      }
    } else {
      const map = new Map(normalized.map((item) => [item.id, item.displayOrder]));
      jsonStore.projects = (jsonStore.projects || [])
        .map((p) => ({
          ...p,
          displayOrder: map.has(p.id) ? map.get(p.id)! : (p.displayOrder ?? 0),
        }))
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      persistJsonStore();
    }

    if (supabaseClient.isConfigured()) {
      normalized.forEach((item) => {
        supabaseClient.updateRow('projects', item.id, { display_order: item.displayOrder }).catch(() => {});
      });
    }

    this.recordVersion(
      'project',
      'all_projects_reorder',
      'Projects Catalog Reordered',
      `Reordered ${normalized.length} portfolio case studies`,
      normalized,
      author
    );

    return this.getProjects(true, true);
  }

  // ===================== REVIEWS (SAFE DELETION, ORDERING & RESTORE) =====================
  public getReviews(includeAll = false, includeDeleted = false): any[] {
    this.init();
    if (sqliteDb) {
      let query = '';
      if (includeAll && includeDeleted) {
        query = 'SELECT * FROM reviews ORDER BY display_order ASC, created_at DESC';
      } else if (includeAll && !includeDeleted) {
        query = 'SELECT * FROM reviews WHERE (is_deleted = 0 OR is_deleted IS NULL) ORDER BY display_order ASC, created_at DESC';
      } else {
        query = "SELECT * FROM reviews WHERE (is_deleted = 0 OR is_deleted IS NULL) AND status = 'approved' ORDER BY display_order ASC, created_at DESC";
      }
      const rows = sqliteDb.prepare(query).all() as DbReview[];
      return rows.map((r) => ({
        id: r.id,
        author: r.author,
        role: r.role,
        company: r.company,
        avatar: r.avatar,
        rating: r.rating,
        comment: r.comment,
        date: r.date,
        status: r.status as 'approved' | 'pending' | 'rejected' | 'archived',
        isFeatured: Boolean(r.is_featured),
        projectReferenced: r.project_referenced,
        displayOrder: Number(r.display_order ?? 0),
        isDeleted: Boolean(r.is_deleted),
        deletedAt: r.deleted_at || null,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } else {
      const reviews = jsonStore.reviews || [];
      const sorted = [...reviews].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      if (includeAll && includeDeleted) return sorted;
      if (includeAll && !includeDeleted) return sorted.filter((r) => !r.isDeleted);
      return sorted.filter((r) => !r.isDeleted && r.status === 'approved');
    }
  }

  public reorderReviews(orderedReviews: any[], author = 'Executive Admin'): any[] {
    this.init();
    const normalized = (orderedReviews || []).map((r, idx) => ({
      id: typeof r === 'string' ? r : r.id,
      displayOrder: idx,
    }));

    if (sqliteDb) {
      const stmt = sqliteDb.prepare('UPDATE reviews SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      sqliteDb.exec('BEGIN TRANSACTION;');
      try {
        normalized.forEach((item) => {
          stmt.run(item.displayOrder, item.id);
        });
        sqliteDb.exec('COMMIT;');
      } catch (err) {
        sqliteDb.exec('ROLLBACK;');
        throw err;
      }
    } else {
      const map = new Map(normalized.map((item) => [item.id, item.displayOrder]));
      jsonStore.reviews = (jsonStore.reviews || [])
        .map((r) => ({
          ...r,
          displayOrder: map.has(r.id) ? map.get(r.id)! : (r.displayOrder ?? 0),
        }))
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      persistJsonStore();
    }

    if (supabaseClient.isConfigured()) {
      normalized.forEach((item) => {
        supabaseClient.updateRow('reviews', item.id, { display_order: item.displayOrder }).catch(() => {});
      });
    }

    this.recordVersion(
      'review',
      'all_reviews_reorder',
      'Reviews & Testimonials Reordered',
      `Reordered ${normalized.length} client testimonials`,
      normalized,
      author
    );

    return this.getReviews(true, true);
  }

  public createReview(review: any, recordHistory = true): any {
    this.init();
    const id = review.id || `rev-${Date.now()}`;
    const newRev = {
      id,
      author: review.author || 'Verified Client',
      role: review.role || 'Client',
      company: review.company || 'Digital Studio',
      avatar: review.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      rating: Math.max(1, Math.min(5, Number(review.rating) || 5)),
      comment: review.comment || '',
      date: review.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: review.status || 'approved',
      isFeatured: review.isFeatured ?? false,
      projectReferenced: review.projectReferenced || null,
      displayOrder: review.displayOrder !== undefined ? Number(review.displayOrder) : 0,
      isDeleted: false,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        INSERT INTO reviews (id, author, role, company, avatar, rating, comment, date, status, is_featured, project_referenced, display_order, is_deleted, deleted_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      stmt.run(
        newRev.id,
        newRev.author,
        newRev.role,
        newRev.company,
        newRev.avatar,
        newRev.rating,
        newRev.comment,
        newRev.date,
        newRev.status,
        newRev.isFeatured ? 1 : 0,
        newRev.projectReferenced,
        newRev.displayOrder
      );
    } else {
      jsonStore.reviews.unshift(newRev);
      persistJsonStore();
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.upsertRow('reviews', {
        id: newRev.id,
        author: newRev.author,
        role: newRev.role,
        company: newRev.company,
        avatar: newRev.avatar,
        rating: newRev.rating,
        comment: newRev.comment,
        date: newRev.date,
        status: newRev.status,
        is_featured: newRev.isFeatured,
        project_referenced: newRev.projectReferenced,
        display_order: newRev.displayOrder,
        is_deleted: false,
        deleted_at: null,
        created_at: newRev.createdAt,
        updated_at: newRev.updatedAt,
      }).catch((e) => console.warn('[Supabase review sync warning]:', e.message));
    }

    if (recordHistory) {
      this.recordVersion(
        'review',
        newRev.id,
        `New Review: ${newRev.author}`,
        `Created review by ${newRev.author} (${newRev.company})`,
        newRev
      );
    }

    return newRev;
  }

  public updateReview(id: string, updates: any, recordHistory = true): any {
    this.init();
    const all = this.getReviews(true, true);
    const existing = all.find((r) => r.id === id);
    if (!existing) throw new Error(`Review with ID ${id} not found`);

    const isDeleted = updates.isDeleted !== undefined ? Boolean(updates.isDeleted) : Boolean(existing.isDeleted);
    const deletedAt = updates.deletedAt !== undefined ? updates.deletedAt : (isDeleted ? (existing.deletedAt || new Date().toISOString()) : null);

    const updated = {
      ...existing,
      ...updates,
      rating: updates.rating !== undefined ? Math.max(1, Math.min(5, Number(updates.rating))) : existing.rating,
      displayOrder: updates.displayOrder !== undefined ? Number(updates.displayOrder) : (existing.displayOrder ?? 0),
      isDeleted,
      deletedAt,
      updatedAt: new Date().toISOString(),
    };

    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        UPDATE reviews
        SET author = ?, role = ?, company = ?, avatar = ?, rating = ?, comment = ?, date = ?, status = ?, is_featured = ?, project_referenced = ?, display_order = ?, is_deleted = ?, deleted_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(
        updated.author,
        updated.role,
        updated.company,
        updated.avatar,
        updated.rating,
        updated.comment,
        updated.date,
        updated.status,
        updated.isFeatured ? 1 : 0,
        updated.projectReferenced || null,
        updated.displayOrder,
        updated.isDeleted ? 1 : 0,
        updated.deletedAt || null,
        id
      );
    } else {
      jsonStore.reviews = jsonStore.reviews.map((r) => (r.id === id ? updated : r));
      persistJsonStore();
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.updateRow('reviews', id, {
        author: updated.author,
        role: updated.role,
        company: updated.company,
        avatar: updated.avatar,
        rating: updated.rating,
        comment: updated.comment,
        date: updated.date,
        status: updated.status,
        is_featured: updated.isFeatured,
        project_referenced: updated.projectReferenced,
        display_order: updated.displayOrder,
        is_deleted: updated.isDeleted,
        deleted_at: updated.deletedAt,
        updated_at: updated.updatedAt,
      }).catch((e) => console.warn('[Supabase review update warning]:', e.message));
    }

    if (recordHistory) {
      this.recordVersion(
        'review',
        id,
        `Updated Review: ${updated.author}`,
        `Updated rating (${updated.rating}/5) & testimonial content`,
        updated
      );
    }

    return updated;
  }

  public softDeleteReview(id: string, author = 'Executive Admin'): any {
    this.init();
    const existing = this.getReviews(true, true).find((r) => r.id === id);
    if (!existing) throw new Error(`Review with ID ${id} not found`);

    const updated = this.updateReview(
      id,
      {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
        status: 'archived',
      },
      false
    );

    this.recordVersion(
      'review',
      id,
      `Deleted Review (Trash): ${existing.author}`,
      `Moved review to trash. Safe to restore anytime.`,
      updated,
      author
    );

    return updated;
  }

  public restoreReview(id: string, author = 'Executive Admin'): any {
    this.init();
    const existing = this.getReviews(true, true).find((r) => r.id === id);
    if (!existing) throw new Error(`Review with ID ${id} not found`);

    const updated = this.updateReview(
      id,
      {
        isDeleted: false,
        deletedAt: null,
        status: 'approved',
      },
      false
    );

    this.recordVersion(
      'review',
      id,
      `Restored Review: ${existing.author}`,
      `Restored review from trash back to active testimonial list.`,
      updated,
      author
    );

    return updated;
  }

  public deleteReview(id: string, permanent = false, author = 'Executive Admin'): boolean {
    this.init();
    if (!permanent) {
      this.softDeleteReview(id, author);
      return true;
    }

    let deleted = false;
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('DELETE FROM reviews WHERE id = ?');
      const res = stmt.run(id);
      deleted = res.changes > 0;
    } else {
      const initLen = jsonStore.reviews.length;
      jsonStore.reviews = jsonStore.reviews.filter((r) => r.id !== id);
      persistJsonStore();
      deleted = jsonStore.reviews.length < initLen;
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.deleteRow('reviews', id).catch((e) => console.warn('[Supabase review delete warning]:', e.message));
    }

    return deleted;
  }

  // ===================== MESSAGES / INQUIRIES (SAFE DELETION) =====================
  public getMessages(includeDeleted = false): any[] {
    this.init();
    if (sqliteDb) {
      const query = includeDeleted
        ? 'SELECT * FROM messages ORDER BY created_at DESC'
        : 'SELECT * FROM messages WHERE (is_deleted = 0 OR is_deleted IS NULL) ORDER BY created_at DESC';
      const rows = sqliteDb.prepare(query).all() as DbMessage[];
      return rows.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        company: m.company,
        projectType: m.project_type,
        budget: m.budget,
        message: m.message,
        date: m.date,
        status: m.status as 'unread' | 'read' | 'replied' | 'archived',
        isDeleted: Boolean(m.is_deleted),
        deletedAt: m.deleted_at || null,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
      }));
    } else {
      const msgs = jsonStore.messages || [];
      return includeDeleted ? msgs : msgs.filter((m) => !m.isDeleted);
    }
  }

  public createMessage(msg: any): any {
    this.init();
    const id = msg.id || `msg-${Date.now()}`;
    const newMsg = {
      id,
      name: msg.name || 'Direct Visitor',
      email: msg.email || '',
      company: msg.company || 'Private Client',
      projectType: msg.projectType || 'AI Products',
      budget: msg.budget || 'Custom Scope',
      message: msg.message || '',
      date: msg.date || 'Just now',
      status: 'unread',
      isDeleted: false,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        INSERT INTO messages (id, name, email, company, project_type, budget, message, date, status, is_deleted, deleted_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      stmt.run(
        newMsg.id,
        newMsg.name,
        newMsg.email,
        newMsg.company,
        newMsg.projectType,
        newMsg.budget,
        newMsg.message,
        newMsg.date,
        newMsg.status
      );
    } else {
      jsonStore.messages.unshift(newMsg);
      persistJsonStore();
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.upsertRow('messages', {
        id: newMsg.id,
        name: newMsg.name,
        email: newMsg.email,
        company: newMsg.company,
        project_type: newMsg.projectType,
        budget: newMsg.budget,
        message: newMsg.message,
        date: newMsg.date,
        status: newMsg.status,
        is_deleted: false,
        deleted_at: null,
        created_at: newMsg.createdAt,
        updated_at: newMsg.updatedAt,
      }).catch((e) => console.warn('[Supabase message sync warning]:', e.message));
    }

    return newMsg;
  }

  public updateMessageStatus(id: string, status: string): any {
    this.init();
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('UPDATE messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      stmt.run(status, id);
      const row = sqliteDb.prepare('SELECT * FROM messages WHERE id = ?').get(id) as DbMessage;
      if (supabaseClient.isConfigured()) {
        supabaseClient.updateRow('messages', id, { status, updated_at: new Date().toISOString() }).catch(() => {});
      }
      return row;
    } else {
      const msg = jsonStore.messages.find((m) => m.id === id);
      if (msg) {
        msg.status = status;
        msg.updatedAt = new Date().toISOString();
        persistJsonStore();
      }
      if (supabaseClient.isConfigured()) {
        supabaseClient.updateRow('messages', id, { status, updated_at: new Date().toISOString() }).catch(() => {});
      }
      return msg;
    }
  }

  public softDeleteMessage(id: string): any {
    this.init();
    const nowIso = new Date().toISOString();
    if (sqliteDb) {
      sqliteDb.prepare('UPDATE messages SET is_deleted = 1, deleted_at = ?, status = "archived", updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(nowIso, id);
    } else {
      const msg = jsonStore.messages.find((m) => m.id === id);
      if (msg) {
        msg.isDeleted = true;
        msg.deletedAt = nowIso;
        msg.status = 'archived';
        persistJsonStore();
      }
    }
    if (supabaseClient.isConfigured()) {
      supabaseClient.updateRow('messages', id, { is_deleted: true, deleted_at: nowIso, status: 'archived' }).catch(() => {});
    }
    return { id, isDeleted: true, deletedAt: nowIso };
  }

  public restoreMessage(id: string): any {
    this.init();
    if (sqliteDb) {
      sqliteDb.prepare('UPDATE messages SET is_deleted = 0, deleted_at = NULL, status = "read", updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    } else {
      const msg = jsonStore.messages.find((m) => m.id === id);
      if (msg) {
        msg.isDeleted = false;
        msg.deletedAt = null;
        msg.status = 'read';
        persistJsonStore();
      }
    }
    if (supabaseClient.isConfigured()) {
      supabaseClient.updateRow('messages', id, { is_deleted: false, deleted_at: null, status: 'read' }).catch(() => {});
    }
    return { id, isDeleted: false };
  }

  public deleteMessage(id: string, permanent = false): boolean {
    this.init();
    if (!permanent) {
      this.softDeleteMessage(id);
      return true;
    }

    let deleted = false;
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('DELETE FROM messages WHERE id = ?');
      const res = stmt.run(id);
      deleted = res.changes > 0;
    } else {
      const initLen = jsonStore.messages.length;
      jsonStore.messages = jsonStore.messages.filter((m) => m.id !== id);
      persistJsonStore();
      deleted = jsonStore.messages.length < initLen;
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.deleteRow('messages', id).catch(() => {});
    }

    return deleted;
  }

  // ===================== SAVED QUOTES (SAFE DELETION) =====================
  public getSavedQuotes(includeDeleted = false): any[] {
    this.init();
    if (sqliteDb) {
      const query = includeDeleted
        ? 'SELECT * FROM saved_quotes ORDER BY created_at DESC'
        : 'SELECT * FROM saved_quotes WHERE (is_deleted = 0 OR is_deleted IS NULL) ORDER BY created_at DESC';
      const rows = sqliteDb.prepare(query).all() as DbSavedQuote[];
      return rows.map((q) => ({
        id: q.id,
        clientName: q.client_name,
        clientEmail: q.client_email,
        serviceCategory: q.service_category,
        budgetRange: q.budget_range,
        turnaroundTime: q.turnaround_time,
        deliverables: typeof q.deliverables_json === 'string' ? JSON.parse(q.deliverables_json || '[]') : q.deliverables_json,
        notes: q.notes || '',
        status: q.status,
        isDeleted: Boolean(q.is_deleted),
        deletedAt: q.deleted_at || null,
        createdAt: q.created_at,
        updatedAt: q.updated_at,
      }));
    } else {
      const quotes = jsonStore.savedQuotes || [];
      return includeDeleted ? quotes : quotes.filter((q) => !q.isDeleted);
    }
  }

  public createSavedQuote(quote: any): any {
    this.init();
    const id = quote.id || `sq-${Date.now()}`;
    const newQuote = {
      id,
      clientName: quote.clientName || 'Unnamed Client',
      clientEmail: quote.clientEmail || '',
      serviceCategory: quote.serviceCategory || '01 - UGC ADS',
      budgetRange: quote.budgetRange || '$5,000 – $10,000',
      turnaroundTime: quote.turnaroundTime || '5 – 10 Business Days',
      deliverables: quote.deliverables || [],
      notes: quote.notes || '',
      status: quote.status || 'draft',
      isDeleted: false,
      deletedAt: null,
      createdAt: quote.createdAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      updatedAt: new Date().toISOString(),
    };

    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        INSERT INTO saved_quotes (id, client_name, client_email, service_category, budget_range, turnaround_time, deliverables_json, notes, status, is_deleted, deleted_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);
      stmt.run(
        newQuote.id,
        newQuote.clientName,
        newQuote.clientEmail || null,
        newQuote.serviceCategory,
        newQuote.budgetRange,
        newQuote.turnaroundTime,
        JSON.stringify(newQuote.deliverables),
        newQuote.notes,
        newQuote.status
      );
    } else {
      jsonStore.savedQuotes.unshift(newQuote);
      persistJsonStore();
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.upsertRow('saved_quotes', {
        id: newQuote.id,
        client_name: newQuote.clientName,
        client_email: newQuote.clientEmail,
        service_category: newQuote.serviceCategory,
        budget_range: newQuote.budgetRange,
        turnaround_time: newQuote.turnaroundTime,
        deliverables_json: newQuote.deliverables,
        notes: newQuote.notes,
        status: newQuote.status,
        is_deleted: false,
        deleted_at: null,
        created_at: newQuote.createdAt,
        updated_at: newQuote.updatedAt,
      }).catch(() => {});
    }

    return newQuote;
  }

  public updateSavedQuote(id: string, updates: any): any {
    this.init();
    const all = this.getSavedQuotes(true);
    const existing = all.find((q) => q.id === id);
    if (!existing) throw new Error(`Saved quote with ID ${id} not found`);

    const isDeleted = updates.isDeleted !== undefined ? Boolean(updates.isDeleted) : Boolean(existing.isDeleted);
    const deletedAt = updates.deletedAt !== undefined ? updates.deletedAt : (isDeleted ? (existing.deletedAt || new Date().toISOString()) : null);

    const updated = {
      ...existing,
      ...updates,
      isDeleted,
      deletedAt,
      updatedAt: new Date().toISOString(),
    };

    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        UPDATE saved_quotes
        SET client_name = ?, client_email = ?, service_category = ?, budget_range = ?, turnaround_time = ?, deliverables_json = ?, notes = ?, status = ?, is_deleted = ?, deleted_at = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(
        updated.clientName,
        updated.clientEmail || null,
        updated.serviceCategory,
        updated.budgetRange,
        updated.turnaroundTime,
        JSON.stringify(updated.deliverables || []),
        updated.notes || '',
        updated.status,
        updated.isDeleted ? 1 : 0,
        updated.deletedAt || null,
        id
      );
    } else {
      jsonStore.savedQuotes = jsonStore.savedQuotes.map((q) => (q.id === id ? updated : q));
      persistJsonStore();
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.updateRow('saved_quotes', id, {
        client_name: updated.clientName,
        client_email: updated.clientEmail,
        service_category: updated.serviceCategory,
        budget_range: updated.budgetRange,
        turnaround_time: updated.turnaroundTime,
        deliverables_json: updated.deliverables,
        notes: updated.notes,
        status: updated.status,
        is_deleted: updated.isDeleted,
        deleted_at: updated.deletedAt,
        updated_at: updated.updatedAt,
      }).catch(() => {});
    }

    return updated;
  }

  public softDeleteSavedQuote(id: string): any {
    this.init();
    const nowIso = new Date().toISOString();
    return this.updateSavedQuote(id, {
      isDeleted: true,
      deletedAt: nowIso,
      status: 'archived',
    });
  }

  public restoreSavedQuote(id: string): any {
    this.init();
    return this.updateSavedQuote(id, {
      isDeleted: false,
      deletedAt: null,
      status: 'draft',
    });
  }

  public deleteSavedQuote(id: string, permanent = false): boolean {
    this.init();
    if (!permanent) {
      this.softDeleteSavedQuote(id);
      return true;
    }

    let deleted = false;
    if (sqliteDb) {
      const stmt = sqliteDb.prepare('DELETE FROM saved_quotes WHERE id = ?');
      const res = stmt.run(id);
      deleted = res.changes > 0;
    } else {
      const initLen = jsonStore.savedQuotes.length;
      jsonStore.savedQuotes = jsonStore.savedQuotes.filter((q) => q.id !== id);
      persistJsonStore();
      deleted = jsonStore.savedQuotes.length < initLen;
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.deleteRow('saved_quotes', id).catch(() => {});
    }

    return deleted;
  }

  // ===================== ESTIMATOR SETTINGS =====================
  public getEstimatorSettings(): any {
    this.init();
    if (sqliteDb) {
      const row = sqliteDb.prepare('SELECT * FROM estimator_settings WHERE id = ?').get('main_estimator') as DbEstimatorSettings;
      if (!row) return initialEstimatorSettings;
      return {
        isEnabled: Boolean(row.is_enabled),
        modalTitle: row.modal_title,
        modalSubtitle: row.modal_subtitle,
        rushSurchargePercentage: row.rush_surcharge_percentage,
        categories: typeof row.categories_json === 'string' ? JSON.parse(row.categories_json) : row.categories_json,
        updatedAt: row.updated_at,
      };
    } else {
      return jsonStore.estimatorSettings || initialEstimatorSettings;
    }
  }

  public updateEstimatorSettings(settings: any, recordHistory = true): any {
    this.init();
    const current = this.getEstimatorSettings();
    const merged = {
      isEnabled: settings.isEnabled !== undefined ? Boolean(settings.isEnabled) : current.isEnabled,
      modalTitle: settings.modalTitle || current.modalTitle,
      modalSubtitle: settings.modalSubtitle || current.modalSubtitle,
      rushSurchargePercentage: Number(settings.rushSurchargePercentage) || current.rushSurchargePercentage,
      categories: {
        ...current.categories,
        ...(settings.categories || {}),
        ugcAds: { ...current.categories.ugcAds, ...(settings.categories?.ugcAds || {}) },
        aiVideo: { ...current.categories.aiVideo, ...(settings.categories?.aiVideo || {}) },
        webAutomation: { ...current.categories.webAutomation, ...(settings.categories?.webAutomation || {}) },
      },
      updatedAt: new Date().toISOString(),
    };

    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        UPDATE estimator_settings
        SET is_enabled = ?, modal_title = ?, modal_subtitle = ?, rush_surcharge_percentage = ?, categories_json = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(
        merged.isEnabled ? 1 : 0,
        merged.modalTitle,
        merged.modalSubtitle,
        merged.rushSurchargePercentage,
        JSON.stringify(merged.categories),
        'main_estimator'
      );
    } else {
      jsonStore.estimatorSettings = merged;
      persistJsonStore();
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.upsertRow('estimator_settings', {
        id: 'main_estimator',
        is_enabled: merged.isEnabled,
        modal_title: merged.modalTitle,
        modal_subtitle: merged.modalSubtitle,
        rush_surcharge_percentage: merged.rushSurchargePercentage,
        categories_json: merged.categories,
        updated_at: new Date().toISOString(),
      }).catch(() => {});
    }

    if (recordHistory) {
      this.recordVersion(
        'estimator',
        'main_estimator',
        'Scope Estimator Rates',
        'Updated estimator base prices and technical add-on rates',
        merged
      );
    }

    return merged;
  }

  // ===================== AUTH & AUDIT LOGS =====================
  public getAdminAuth(): any {
    this.init();
    if (sqliteDb) {
      const row = sqliteDb.prepare('SELECT * FROM admin_auth WHERE id = ?').get('owner_auth') as DbAdminAuth;
      return row || { pin_hash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', salt: '', failed_attempts: 0, lockout_until: 0 };
    } else {
      return jsonStore.adminAuth;
    }
  }

  public updateAdminAuth(pinHash: string, salt: string): void {
    this.init();
    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        UPDATE admin_auth
        SET pin_hash = ?, salt = ?, failed_attempts = 0, lockout_until = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(pinHash, salt, 'owner_auth');
    } else {
      jsonStore.adminAuth.pinHash = pinHash;
      jsonStore.adminAuth.salt = salt;
      jsonStore.adminAuth.failedAttempts = 0;
      jsonStore.adminAuth.lockoutUntil = 0;
      persistJsonStore();
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.upsertRow('admin_auth', {
        id: 'owner_auth',
        pin_hash: pinHash,
        salt,
        failed_attempts: 0,
        lockout_until: 0,
        updated_at: new Date().toISOString(),
      }).catch(() => {});
    }
  }

  public recordFailedAttempt(): { failedAttempts: number; lockoutUntil: number } {
    this.init();
    const auth = this.getAdminAuth();
    const failedAttempts = (auth.failed_attempts ?? auth.failedAttempts ?? 0) + 1;
    let lockoutUntil = 0;
    if (failedAttempts >= 5) {
      lockoutUntil = Date.now() + 15 * 60 * 1000;
    }

    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        UPDATE admin_auth
        SET failed_attempts = ?, lockout_until = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(failedAttempts, lockoutUntil, 'owner_auth');
    } else {
      jsonStore.adminAuth.failedAttempts = failedAttempts;
      jsonStore.adminAuth.lockoutUntil = lockoutUntil;
      persistJsonStore();
    }

    return { failedAttempts, lockoutUntil };
  }

  public resetFailedAttempts(): void {
    this.init();
    if (sqliteDb) {
      sqliteDb.prepare('UPDATE admin_auth SET failed_attempts = 0, lockout_until = 0 WHERE id = ?').run('owner_auth');
    } else {
      jsonStore.adminAuth.failedAttempts = 0;
      jsonStore.adminAuth.lockoutUntil = 0;
      persistJsonStore();
    }
  }

  public getAuditLogs(limit = 100): any[] {
    this.init();
    if (sqliteDb) {
      const rows = sqliteDb.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?').all(limit) as DbAuditLog[];
      return rows.map((l) => ({
        id: l.id,
        action: l.action,
        details: l.details,
        severity: l.severity,
        ipAddress: l.ip_address,
        userAgent: l.user_agent,
        timestamp: new Date(l.created_at).getTime(),
      }));
    } else {
      return (jsonStore.auditLogs || []).slice(0, limit);
    }
  }

  public addAuditLog(action: string, details: string, severity = 'info', ip?: string, userAgent?: string): any {
    this.init();
    const id = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newLog = {
      id,
      action,
      details,
      severity,
      ipAddress: ip || '127.0.0.1',
      userAgent: userAgent || 'Studio Browser',
      timestamp: Date.now(),
    };

    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        INSERT INTO audit_logs (id, action, details, severity, ip_address, user_agent, created_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      stmt.run(newLog.id, newLog.action, newLog.details, newLog.severity, newLog.ipAddress, newLog.userAgent);
    } else {
      jsonStore.auditLogs.unshift(newLog);
      if (jsonStore.auditLogs.length > 500) {
        jsonStore.auditLogs = jsonStore.auditLogs.slice(0, 500);
      }
      persistJsonStore();
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.insertRow('audit_logs', {
        id: newLog.id,
        action: newLog.action,
        details: newLog.details,
        severity: newLog.severity,
        ip_address: newLog.ipAddress,
        user_agent: newLog.userAgent,
      }).catch(() => {});
    }
  }

  // ===================== VERSION HISTORY =====================
  public getVersions(entityType?: string, limit = 50): any[] {
    this.init();
    if (sqliteDb) {
      let rows: DbCmsVersion[];
      if (entityType && entityType !== 'all') {
        const stmt = sqliteDb.prepare('SELECT * FROM cms_versions WHERE entity_type = ? ORDER BY created_at DESC, version_number DESC LIMIT ?');
        rows = stmt.all(entityType, limit) as DbCmsVersion[];
      } else {
        const stmt = sqliteDb.prepare('SELECT * FROM cms_versions ORDER BY created_at DESC, version_number DESC LIMIT ?');
        rows = stmt.all(limit) as DbCmsVersion[];
      }
      return rows.map((v) => ({
        id: v.id,
        versionNumber: v.version_number,
        entityType: v.entity_type,
        entityId: v.entity_id,
        title: v.title,
        summary: v.summary,
        content: typeof v.content_json === 'string' ? JSON.parse(v.content_json) : v.content_json,
        author: v.author,
        createdAt: v.created_at,
      }));
    } else {
      let list = jsonStore.versions || [];
      if (entityType && entityType !== 'all') {
        list = list.filter((v: any) => v.entityType === entityType);
      }
      return list.slice(0, limit);
    }
  }

  public getVersionById(id: string): any | null {
    this.init();
    const list = this.getVersions('all', 500);
    return list.find((v: any) => v.id === id) || null;
  }

  public recordVersion(
    entityType: 'site_content' | 'project' | 'review' | 'estimator' | 'services',
    entityId: string | undefined,
    title: string,
    summary: string,
    content: any,
    author = 'Executive Admin'
  ): any {
    this.init();
    const sanitized = sanitizeVersionPayload(content);
    let latestNum = 0;
    if (sqliteDb) {
      const row = sqliteDb.prepare('SELECT MAX(version_number) as max_v FROM cms_versions WHERE entity_type = ?').get(entityType) as any;
      if (row && row.max_v != null) {
        latestNum = Number(row.max_v);
      }
    } else {
      const existing = (jsonStore.versions || []).filter((v: any) => v.entityType === entityType);
      if (existing.length > 0) {
        latestNum = Math.max(...existing.map((v: any) => v.versionNumber || 0));
      }
    }
    const versionNumber = latestNum + 1;
    const id = `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const versionRecord = {
      id,
      versionNumber,
      entityType,
      entityId: entityId || null,
      title,
      summary,
      content: sanitized,
      author: author || 'Executive Admin',
      createdAt: nowIso,
    };

    if (sqliteDb) {
      const stmt = sqliteDb.prepare(`
        INSERT INTO cms_versions (id, version_number, entity_type, entity_id, title, summary, content_json, author, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);
      stmt.run(
        versionRecord.id,
        versionRecord.versionNumber,
        versionRecord.entityType,
        versionRecord.entityId,
        versionRecord.title,
        versionRecord.summary,
        JSON.stringify(versionRecord.content),
        versionRecord.author
      );
    } else {
      if (!jsonStore.versions) jsonStore.versions = [];
      jsonStore.versions.unshift(versionRecord);
      if (jsonStore.versions.length > 300) {
        jsonStore.versions = jsonStore.versions.slice(0, 300);
      }
      persistJsonStore();
    }

    if (supabaseClient.isConfigured()) {
      supabaseClient.insertRow('cms_versions', {
        id: versionRecord.id,
        version_number: versionRecord.versionNumber,
        entity_type: versionRecord.entityType,
        entity_id: versionRecord.entityId,
        title: versionRecord.title,
        summary: versionRecord.summary,
        content_json: versionRecord.content,
        author: versionRecord.author,
        created_at: versionRecord.createdAt,
      }).catch((e) => console.warn('[Supabase version insert notice]:', e.message));
    }

    return versionRecord;
  }

  public async restoreVersion(id: string, author = 'Executive Admin'): Promise<any> {
    this.init();
    const ver = this.getVersionById(id);
    if (!ver) {
      throw new Error(`Version with ID "${id}" not found`);
    }

    let restoredResult: any = null;

    if (ver.entityType === 'site_content' || ver.entityType === 'services') {
      this.publishSiteSettings(ver.content, false);
      restoredResult = this.getSiteSettingsAdmin();
      this.recordVersion(
        'site_content',
        undefined,
        `Restored Version #${ver.versionNumber}`,
        `Restored site content snapshot from Version #${ver.versionNumber} (${ver.title})`,
        ver.content,
        author
      );
    } else if (ver.entityType === 'project') {
      if (ver.entityId && this.getProjectById(ver.entityId)) {
        restoredResult = this.updateProject(ver.entityId, ver.content, false);
      } else {
        restoredResult = this.createProject(ver.content, false);
      }
      this.recordVersion(
        'project',
        restoredResult.id,
        `Restored Project: ${ver.title} (v#${ver.versionNumber})`,
        `Restored project state from version #${ver.versionNumber}`,
        restoredResult,
        author
      );
    } else if (ver.entityType === 'estimator') {
      restoredResult = this.updateEstimatorSettings(ver.content, false);
      this.recordVersion(
        'estimator',
        'main_estimator',
        `Restored Estimator Rates (v#${ver.versionNumber})`,
        `Restored pricing & calculations from version #${ver.versionNumber}`,
        ver.content,
        author
      );
    } else if (ver.entityType === 'review') {
      if (ver.entityId) {
        restoredResult = this.updateReview(ver.entityId, ver.content, false);
      } else {
        restoredResult = this.createReview(ver.content, false);
      }
      this.recordVersion(
        'review',
        ver.entityId,
        `Restored Review by ${ver.content.author || 'Author'} (v#${ver.versionNumber})`,
        `Restored review from version #${ver.versionNumber}`,
        ver.content,
        author
      );
    }

    return {
      success: true,
      restoredFrom: ver,
      current: restoredResult,
    };
  }

  // ===================== RESET TO FACTORY DEFAULTS =====================
  public resetToDefaults(): void {
    this.init();
    if (sqliteDb) {
      sqliteDb.exec('BEGIN TRANSACTION;');
      try {
        sqliteDb.exec('DELETE FROM projects;');
        sqliteDb.exec('DELETE FROM reviews;');
        sqliteDb.exec('DELETE FROM messages;');
        sqliteDb.exec('DELETE FROM saved_quotes;');
        sqliteDb.exec('DELETE FROM site_settings;');
        sqliteDb.exec('DELETE FROM estimator_settings;');
        this.seedSqliteIfEmpty();
        sqliteDb.exec('COMMIT;');
      } catch (err) {
        sqliteDb.exec('ROLLBACK;');
        throw err;
      }
    } else {
      jsonStore.projects = initialProjects;
      jsonStore.siteSettings = initialWebsiteContent;
      jsonStore.reviews = initialReviews;
      jsonStore.messages = initialMessages;
      jsonStore.savedQuotes = initialSavedQuotes;
      jsonStore.estimatorSettings = initialEstimatorSettings;
      persistJsonStore();
    }
  }
}

export const db = new CmsDatabase();
