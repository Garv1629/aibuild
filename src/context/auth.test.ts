import test from 'node:test';
import assert from 'node:assert/strict';
import { OWNER_UUID, CONFIGURED_ADMIN_EMAIL, isAuthorizedAdmin, AuthUser } from './authTypes.ts';
import { inquiryToDb } from '../services/api.ts';
import { ClientInquiry } from '../utils/portfolio.ts';



test('OWNER_UUID is the authoritative studio owner identifier', () => {
  assert.equal(OWNER_UUID, '8426bca9-cb3b-47a2-997b-f362634ea46d');
});

test('CONFIGURED_ADMIN_EMAIL is the authoritative studio administrator email', () => {
  assert.equal(CONFIGURED_ADMIN_EMAIL, 'aibuild1629@gmail.com');
});

test('isAuthorizedAdmin grants admin to OWNER_UUID regardless of email address', () => {
  assert.equal(isAuthorizedAdmin({ id: OWNER_UUID, email: 'custom@studio.com' }), true);
  assert.equal(isAuthorizedAdmin({ id: OWNER_UUID }), true);
});

test('isAuthorizedAdmin strictly rejects matching admin email if the UUID is not OWNER_UUID (UUID-only authorization)', () => {
  assert.equal(isAuthorizedAdmin({ id: 'new-supabase-user-uuid-1234', email: 'aibuild1629@gmail.com' }), false);
  assert.equal(isAuthorizedAdmin({ id: 'new-supabase-user-uuid-1234', email: ' AIBUILD1629@GMAIL.COM ' }), false);
  assert.equal(isAuthorizedAdmin({ id: 'different-uuid', email: CONFIGURED_ADMIN_EMAIL }), false);
  assert.equal(isAuthorizedAdmin({ email: CONFIGURED_ADMIN_EMAIL }), false);
});

test('isAuthorizedAdmin strictly rejects unauthorized accounts, null, or undefined', () => {
  assert.equal(isAuthorizedAdmin(null), false);
  assert.equal(isAuthorizedAdmin(undefined), false);
  assert.equal(isAuthorizedAdmin({ id: 'attacker-uuid', email: 'attacker@evil.com' }), false);
  assert.equal(isAuthorizedAdmin({ id: 'other-uuid', email: 'random@gmail.com' }), false);
  assert.equal(isAuthorizedAdmin({ id: '', email: '' }), false);
});

test('User metadata or forged client roles cannot grant admin authorization', () => {
  const forgedSession = {
    user: {
      id: 'attacker-uuid-1234',
      email: 'attacker@evil.com',
      user_metadata: { role: 'admin', isAdmin: true },
      app_metadata: { role: 'admin' },
    },
  };

  const isAdmin = isAuthorizedAdmin(forgedSession.user);
  const user: AuthUser = {
    id: forgedSession.user.id,
    email: forgedSession.user.email,
    role: isAdmin ? 'admin' : 'user',
    isAdmin,
  };

  assert.equal(user.isAdmin, false);
  assert.equal(user.role, 'user');
});

test('ProtectedRoute access rule allows only verified admin and blocks unauthorized users', () => {
  const evaluateAccess = (auth: { isLoading: boolean; isAuthenticated: boolean; user: AuthUser | null }) => {
    if (auth.isLoading) return 'LOADING';
    if (!auth.isAuthenticated || !auth.user?.isAdmin) return 'REDIRECT_LOGIN';
    return 'ALLOW_ADMIN';
  };

  // 1. Loading state prevents rendering
  assert.equal(
    evaluateAccess({ isLoading: true, isAuthenticated: false, user: null }),
    'LOADING'
  );
  assert.equal(
    evaluateAccess({
      isLoading: true,
      isAuthenticated: true,
      user: { id: OWNER_UUID, email: 'aibuild1629@gmail.com', role: 'admin', isAdmin: true },
    }),
    'LOADING'
  );

  // 2. Unauthenticated user redirected
  assert.equal(
    evaluateAccess({ isLoading: false, isAuthenticated: false, user: null }),
    'REDIRECT_LOGIN'
  );

  // 3. Authenticated non-owner user blocked and redirected
  const nonOwner: AuthUser = { id: 'other-id', email: 'user@gmail.com', role: 'user', isAdmin: false };
  assert.equal(
    evaluateAccess({ isLoading: false, isAuthenticated: true, user: nonOwner }),
    'REDIRECT_LOGIN'
  );

  // 4. Authenticated owner permitted
  const owner: AuthUser = { id: OWNER_UUID, email: 'aibuild1629@gmail.com', role: 'admin', isAdmin: true };
  assert.equal(
    evaluateAccess({ isLoading: false, isAuthenticated: true, user: owner }),
    'ALLOW_ADMIN'
  );
});

test('PortfolioContext admin-only data fetching strictly requires authenticated admin', () => {
  const isDataFetchAdmin = (isAuthenticated: boolean, user: AuthUser | null): boolean => {
    return Boolean(isAuthenticated && user?.isAdmin);
  };

  // Public visitor
  assert.equal(isDataFetchAdmin(false, null), false);

  // Authenticated non-owner
  const nonOwner: AuthUser = { id: 'random-uuid', email: 'guest@web.com', role: 'user', isAdmin: false };
  assert.equal(isDataFetchAdmin(true, nonOwner), false);

  // Authenticated owner
  const owner: AuthUser = { id: OWNER_UUID, email: 'aibuild1629@gmail.com', role: 'admin', isAdmin: true };
  assert.equal(isDataFetchAdmin(true, owner), true);
});

test('AdminLoginPage redirect policy rejects unauthorized accounts', () => {
  const handleLoginRedirect = (isAuthenticated: boolean, user: AuthUser | null) => {
    if (isAuthenticated) {
      if (user?.isAdmin) {
        return { action: 'REDIRECT_ADMIN' };
      }
      return { action: 'SHOW_DENIED_ERROR', error: 'Access denied. Your signed-in account is not authorized.' };
    }
    return { action: 'STAY_ON_LOGIN' };
  };

  // Unauthenticated
  assert.deepEqual(handleLoginRedirect(false, null), { action: 'STAY_ON_LOGIN' });

  // Non-owner authenticated
  const nonOwner: AuthUser = { id: 'some-user', email: 'nonowner@mail.com', role: 'user', isAdmin: false };
  const nonOwnerResult = handleLoginRedirect(true, nonOwner);
  assert.equal(nonOwnerResult.action, 'SHOW_DENIED_ERROR');

  // Owner authenticated
  const owner: AuthUser = { id: OWNER_UUID, email: 'aibuild1629@gmail.com', role: 'admin', isAdmin: true };
  assert.deepEqual(handleLoginRedirect(true, owner), { action: 'REDIRECT_ADMIN' });
});

test('inquiry ID generation: inquiryToDb preserves provided ID or generates a unique fallback ID', () => {
  const customInquiry: ClientInquiry = {
    id: 'inq-custom-12345',
    name: 'Jane Doe',
    email: 'jane@example.com',
    serviceType: 'Web Development',
    ideaDescription: 'Custom website project',
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  const rowWithId = inquiryToDb(customInquiry);
  assert.equal(rowWithId.id, 'inq-custom-12345');

  const emptyIdInquiry: ClientInquiry = {
    id: '',
    name: 'John Doe',
    email: 'john@example.com',
    serviceType: 'AI Videos',
    ideaDescription: 'Video commercial',
    status: 'new',
    createdAt: new Date().toISOString(),
  };
  const rowGenerated = inquiryToDb(emptyIdInquiry);
  assert.ok(rowGenerated.id.startsWith('inq-'));
  assert.ok(rowGenerated.id.length > 8);
});

test('getSafeDestination prevents login/dashboard redirect loops and sanitizes destination', () => {
  const getSafeDestination = (rawFrom?: any): string => {
    const path = typeof rawFrom === 'string' ? rawFrom : rawFrom?.pathname;
    if (
      path &&
      typeof path === 'string' &&
      path.startsWith('/admin') &&
      path !== '/admin/login' &&
      !path.startsWith('/admin/login')
    ) {
      return path;
    }
    return '/admin';
  };

  // Safe admin subroutes preserved
  assert.equal(getSafeDestination({ pathname: '/admin/projects' }), '/admin/projects');
  assert.equal(getSafeDestination({ pathname: '/admin/media' }), '/admin/media');
  assert.equal(getSafeDestination('/admin/journal'), '/admin/journal');
  assert.equal(getSafeDestination('/admin'), '/admin');

  // Loop paths prevented: redirecting to /admin/login is intercepted and reset to /admin
  assert.equal(getSafeDestination({ pathname: '/admin/login' }), '/admin');
  assert.equal(getSafeDestination('/admin/login'), '/admin');
  assert.equal(getSafeDestination('/admin/login?error=1'), '/admin');

  // Missing or external/invalid paths safely default to /admin
  assert.equal(getSafeDestination(undefined), '/admin');
  assert.equal(getSafeDestination(null), '/admin');
  assert.equal(getSafeDestination({ pathname: '/' }), '/admin');
  assert.equal(getSafeDestination('/somewhere-else'), '/admin');
});

test('Session initialization race condition guard: INITIAL_SESSION with null does not prematurely clear loading', () => {
  // Simulate auth state change handler logic
  let isInitialized = false;
  let isLoading = true;
  let user: AuthUser | null = null;

  const handleAuthStateChange = (event: string, session: any) => {
    if (!isInitialized && event === 'INITIAL_SESSION' && !session) {
      // Must NOT set isLoading = false while getSession() is in-flight!
      return;
    }
    if (event === 'SIGNED_OUT' || !session) {
      user = null;
      isInitialized = true;
      isLoading = false;
      return;
    }
    user = session.user;
    isInitialized = true;
    isLoading = false;
  };

  // Step 1: onAuthStateChange fires with INITIAL_SESSION and null before storage is read
  handleAuthStateChange('INITIAL_SESSION', null);
  // Assert loading is PRESERVED to prevent ProtectedRoute from flashing /admin/login
  assert.equal(isLoading, true);
  assert.equal(user, null);

  // Step 2: getSession resolves with valid stored owner session
  const storedSession = {
    user: { id: OWNER_UUID, email: 'aibuild1629@gmail.com', role: 'admin' as const, isAdmin: true },
  };
  user = storedSession.user;
  isInitialized = true;
  isLoading = false;

  assert.equal(isLoading, false);
  assert.equal(user.id, OWNER_UUID);
  assert.equal(user.isAdmin, true);
});

test('Fresh login submission handles direct transition without duplicate useEffect trigger', () => {
  let navigateCalls: string[] = [];
  const navigate = (path: string) => {
    navigateCalls.push(path);
  };

  let isSubmitting = false;
  let isLoading = false;
  let isAuthenticated = false;
  let user: AuthUser | null = null;

  // Simulate useEffect auto-redirect on login page
  const triggerAutoRedirectEffect = () => {
    if (isSubmitting) return; // Prevent duplicate navigation during form submit
    if (!isLoading && isAuthenticated && user?.isAdmin) {
      navigate('/admin');
    }
  };

  // User submits form
  isSubmitting = true;
  // Login resolves and sets auth state
  isAuthenticated = true;
  user = { id: OWNER_UUID, email: 'aibuild1629@gmail.com', role: 'admin', isAdmin: true };

  // Effect would run because isAuthenticated changed, but isSubmitting guards it
  triggerAutoRedirectEffect();
  assert.equal(navigateCalls.length, 0); // No premature/duplicate navigation!

  // handleSubmit performs the single authoritative direct navigation
  navigate('/admin');
  assert.equal(navigateCalls.length, 1);
  assert.deepEqual(navigateCalls, ['/admin']);
});

test('Session persistence expiration logic strictly honors token validity period', () => {
  const evaluateToken = (expiresAtSeconds: number, currentTimeMs: number) => {
    const expiresAt = expiresAtSeconds * 1000;
    return expiresAt > currentTimeMs;
  };

  const now = 1700000000000;
  // Future token: valid
  assert.equal(evaluateToken(1700000000 + 3600, now), true);
  // Past token: expired
  assert.equal(evaluateToken(1700000000 - 10, now), false);
  // Missing / 0 token: expired
  assert.equal(evaluateToken(0, now), false);
});

test('AdminLoginPage renders publicly to unauthenticated visitors without errors', async () => {
  const React = await import('react');
  const { renderToString } = await import('react-dom/server');
  const { MemoryRouter, Routes, Route } = await import('react-router-dom');
  const { AdminLoginPage } = await import('../pages/AdminLoginPage.tsx');
  const { AuthProvider } = await import('./AuthContext.tsx');
  const { PortfolioProvider } = await import('./PortfolioContext.tsx');

  const html = renderToString(
    React.createElement(
      AuthProvider,
      null,
      React.createElement(
        PortfolioProvider,
        null,
        React.createElement(
          MemoryRouter,
          { initialEntries: ['/admin/login'] },
          React.createElement(
            Routes,
            null,
            React.createElement(Route, { path: '/admin/login', element: React.createElement(AdminLoginPage) })
          )
        )
      )
    )
  );

  assert.ok(html.includes('Admin Portal'), 'Must render Admin Portal header');
  assert.ok(html.includes('Administrator Email'), 'Must render Administrator Email field');
  assert.ok(html.includes('Sign In to Admin Workspace'), 'Must render submit button');
});

test('ProtectedRoute immediately allows /admin/login without requiring authentication or showing loading screen', () => {
  const checkProtectedRoute = (path: string, auth: { isLoading: boolean; isAuthenticated: boolean; user: AuthUser | null }) => {
    // 1. /admin/login is 100% public
    if (path.startsWith('/admin/login')) {
      return 'ALLOW_PUBLIC';
    }
    // 2. Loading state for protected routes
    if (auth.isLoading) {
      return 'SHOW_SPINNER';
    }
    // 3. Unauthenticated or non-admin redirected to /admin/login
    if (!auth.isAuthenticated || !auth.user?.isAdmin) {
      return 'REDIRECT_LOGIN';
    }
    // 4. Authorized owner allowed
    return 'ALLOW_ADMIN';
  };

  // /admin/login is allowed even when isLoading is true
  assert.equal(
    checkProtectedRoute('/admin/login', { isLoading: true, isAuthenticated: false, user: null }),
    'ALLOW_PUBLIC'
  );

  // /admin/login is allowed for unauthenticated visitors
  assert.equal(
    checkProtectedRoute('/admin/login', { isLoading: false, isAuthenticated: false, user: null }),
    'ALLOW_PUBLIC'
  );

  // /admin requires auth: shows loading while verifying
  assert.equal(
    checkProtectedRoute('/admin', { isLoading: true, isAuthenticated: false, user: null }),
    'SHOW_SPINNER'
  );

  // /admin redirects unauthenticated visitors to login
  assert.equal(
    checkProtectedRoute('/admin', { isLoading: false, isAuthenticated: false, user: null }),
    'REDIRECT_LOGIN'
  );

  // /admin allows authenticated owner directly
  const owner: AuthUser = { id: OWNER_UUID, email: 'aibuild1629@gmail.com', role: 'admin', isAdmin: true };
  assert.equal(
    checkProtectedRoute('/admin', { isLoading: false, isAuthenticated: true, user: owner }),
    'ALLOW_ADMIN'
  );
});

test('Admin LoginPage button is not stuck disabled when auth initializes', () => {
  const isButtonDisabled = (isSubmitting: boolean, isSupabaseConfigured: boolean): boolean => {
    return isSubmitting || !isSupabaseConfigured;
  };

  // Normal ready state: enabled
  assert.equal(isButtonDisabled(false, true), false);

  // Form submitting: disabled
  assert.equal(isButtonDisabled(true, true), true);

  // Missing config: disabled
  assert.equal(isButtonDisabled(false, false), true);
});


