/**
 * AI Build Studio - Security Engine
 * Cryptographic hashing, brute-force defense, session governance & input sanitization
 */

const SALT = 'ai_build_studio_sec_v2_9f8b4c';
const STORAGE_KEYS = {
  PIN_HASH: 'ai_build_owner_pin_hash',
  FAILED_ATTEMPTS: 'ai_build_sec_failed_attempts',
  LOCKOUT_UNTIL: 'ai_build_sec_lockout_until',
  AUDIT_LOGS: 'ai_build_sec_audit_logs',
  SESSION_TOKEN: 'ai_build_sec_session_token',
  SESSION_EXPIRES: 'ai_build_sec_session_expires',
};

// Default hashed passcode for "8888" (calculated via SHA-256 with SALT)
// Initial fallback hash is pre-computed to allow seamless first-time startup
const DEFAULT_PIN_HASH = '4e8a15993efbca693d25ceea24dc739665bc7c6888eb19d45e43a6d1a6659f8c';

export interface SecurityAuditLog {
  id: string;
  timestamp: number;
  dateString: string;
  event: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOCKOUT_TRIGGERED' | 'PIN_CHANGED' | 'SESSION_LOCKED' | 'DATA_RESET' | 'CONTENT_UPDATE';
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

/**
 * Computes SHA-256 cryptographic hash of a string with salt
 */
export async function computeSHA256(text: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(SALT + text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // WebCrypto not supported, fallback to deterministic hash
  }

  // Fallback deterministic bitwise hash if WebCrypto is blocked
  let hash = 0;
  const str = SALT + text;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fb_${Math.abs(hash).toString(16).padStart(16, '0')}`;
}

/**
 * Initializes security storage if not already present
 */
export async function initializeSecurity(): Promise<void> {
  try {
    const currentHash = localStorage.getItem(STORAGE_KEYS.PIN_HASH);
    if (!currentHash) {
      const initialHash = await computeSHA256('8888');
      localStorage.setItem(STORAGE_KEYS.PIN_HASH, initialHash);
    }
  } catch {
    // Storage access error
  }
}

/**
 * Verifies if entered passcode matches stored cryptographic hash
 */
export async function verifyOwnerPasscode(enteredPin: string): Promise<boolean> {
  // Check lockout first
  const lockout = getLockoutStatus();
  if (lockout.isLocked) {
    return false;
  }

  const enteredHash = await computeSHA256(enteredPin);
  let storedHash: string | null = null;
  try {
    storedHash = localStorage.getItem(STORAGE_KEYS.PIN_HASH);
  } catch {
    storedHash = DEFAULT_PIN_HASH;
  }

  if (!storedHash) {
    storedHash = await computeSHA256('8888');
  }

  const isValid = enteredHash === storedHash;

  if (isValid) {
    recordSuccessfulLogin();
    createSessionToken();
    addAuditLog('LOGIN_SUCCESS', 'Owner authenticated successfully', 'info');
  } else {
    recordFailedAttempt();
  }

  return isValid;
}

/**
 * Updates the owner passcode with a new hash
 */
export async function updateOwnerPasscode(currentPin: string, newPin: string): Promise<{ success: boolean; message: string }> {
  if (!newPin || newPin.length < 4) {
    return { success: false, message: 'New passcode must be at least 4 characters.' };
  }

  const isCurrentValid = await verifyOwnerPasscode(currentPin);
  if (!isCurrentValid) {
    return { success: false, message: 'Current passcode is incorrect.' };
  }

  try {
    const newHash = await computeSHA256(newPin);
    localStorage.setItem(STORAGE_KEYS.PIN_HASH, newHash);
    addAuditLog('PIN_CHANGED', 'Owner passcode updated successfully', 'warning');
    return { success: true, message: 'Passcode updated successfully.' };
  } catch {
    return { success: false, message: 'Failed to write to local storage.' };
  }
}

/**
 * Brute-force rate limiting: check lockout status
 */
export function getLockoutStatus(): { isLocked: boolean; remainingSeconds: number; attemptCount: number } {
  try {
    const lockoutUntil = Number(localStorage.getItem(STORAGE_KEYS.LOCKOUT_UNTIL) || '0');
    const now = Date.now();
    const attempts = Number(localStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS) || '0');

    if (lockoutUntil > now) {
      const remainingSeconds = Math.ceil((lockoutUntil - now) / 1000);
      return { isLocked: true, remainingSeconds, attemptCount: attempts };
    }

    // If lockout period expired, reset attempts if lockout flag was set
    if (lockoutUntil > 0 && lockoutUntil <= now) {
      localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
      localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, '0');
      return { isLocked: false, remainingSeconds: 0, attemptCount: 0 };
    }

    return { isLocked: false, remainingSeconds: 0, attemptCount: attempts };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptCount: 0 };
  }
}

/**
 * Records a failed attempt and activates lockout if threshold exceeded
 */
export function recordFailedAttempt(): { isLocked: boolean; remainingSeconds: number; attemptCount: number } {
  try {
    const attempts = Number(localStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS) || '0') + 1;
    localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, attempts.toString());

    let lockoutDurationMs = 0;
    if (attempts >= 8) {
      lockoutDurationMs = 15 * 60 * 1000; // 15 minutes
    } else if (attempts >= 5) {
      lockoutDurationMs = 3 * 60 * 1000; // 3 minutes
    } else if (attempts >= 3) {
      lockoutDurationMs = 30 * 1000; // 30 seconds
    }

    if (lockoutDurationMs > 0) {
      const lockoutUntil = Date.now() + lockoutDurationMs;
      localStorage.setItem(STORAGE_KEYS.LOCKOUT_UNTIL, lockoutUntil.toString());
      const remainingSeconds = Math.ceil(lockoutDurationMs / 1000);
      addAuditLog('LOCKOUT_TRIGGERED', `Lockout activated for ${remainingSeconds}s (${attempts} failed attempts)`, 'critical');
      return { isLocked: true, remainingSeconds, attemptCount: attempts };
    }

    addAuditLog('LOGIN_FAILED', `Failed attempt #${attempts}`, 'warning');
    return { isLocked: false, remainingSeconds: 0, attemptCount: attempts };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attemptCount: 1 };
  }
}

/**
 * Resets failed attempts after successful login
 */
export function recordSuccessfulLogin(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
    localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
  } catch {
    // Ignored
  }
}

/**
 * Session Governance - Creates a 30-minute authenticated session
 */
export function createSessionToken(): string {
  const token = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const expiresAt = Date.now() + 30 * 60 * 1000; // 30 mins
  try {
    sessionStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
    sessionStorage.setItem(STORAGE_KEYS.SESSION_EXPIRES, expiresAt.toString());
  } catch {
    // Fallback
  }
  return token;
}

export function isSessionActive(): boolean {
  try {
    const token = sessionStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    const expiresAt = Number(sessionStorage.getItem(STORAGE_KEYS.SESSION_EXPIRES) || '0');
    if (!token || !expiresAt) return false;
    return Date.now() < expiresAt;
  } catch {
    return false;
  }
}

export function refreshSession(): void {
  try {
    if (sessionStorage.getItem(STORAGE_KEYS.SESSION_TOKEN)) {
      const expiresAt = Date.now() + 30 * 60 * 1000;
      sessionStorage.setItem(STORAGE_KEYS.SESSION_EXPIRES, expiresAt.toString());
    }
  } catch {
    // Ignored
  }
}

export function terminateSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRES);
    addAuditLog('SESSION_LOCKED', 'Owner session locked / signed out', 'info');
  } catch {
    // Ignored
  }
}

/**
 * Security Audit Logging
 */
export function addAuditLog(
  event: SecurityAuditLog['event'],
  details: string,
  severity: SecurityAuditLog['severity'] = 'info'
): void {
  try {
    const logs = getAuditLogs();
    const newLog: SecurityAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      dateString: new Date().toLocaleTimeString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      event,
      details,
      severity,
    };
    const updated = [newLog, ...logs].slice(0, 30); // Keep latest 30 events
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
  } catch {
    // Ignored
  }
}

export function getAuditLogs(): SecurityAuditLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function clearAuditLogs(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  } catch {
    // Ignored
  }
}

/**
 * Input Sanitization (XSS Prevention & HTML stripping)
 */
export function sanitizeInput(input: string, maxLength = 2000): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '')
    .replace(/onload=/gi, '')
    .replace(/onerror=/gi, '');
}

export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase().slice(0, 150).replace(/[^a-z0-9@._+-]/gi, '');
}
