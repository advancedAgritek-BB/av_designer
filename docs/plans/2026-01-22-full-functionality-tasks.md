# Full Functionality Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make AV Designer fully functional by completing infrastructure setup, feature gaps, and bug fixes.

**Architecture:** Three-priority approach: (1) Infrastructure to make the app run, (2) Feature completion for templates/import/notifications, (3) Bug fixes for type safety and error handling. Each priority builds on the previous.

**Tech Stack:** React 19, TypeScript 5, Tauri 2, Supabase, Zustand, React Query, Vitest

---

## Phase 1: Infrastructure (Make It Run)

### Task 1: Environment Validation

**Files:**
- Modify: `src/lib/supabase.ts`
- Modify: `src/components/layout/BackendGate.tsx`

**Step 1: Read current supabase.ts implementation**

Run: `cat src/lib/supabase.ts`

Review the current fallback logic that silently uses placeholder values.

**Step 2: Update supabase.ts with proper validation**

Replace the Supabase client initialization in `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.error(
    '[Supabase] Missing configuration.\n' +
    'Create .env.local with:\n' +
    '  VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=your-anon-key'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl ?? 'https://not-configured.supabase.co',
  supabaseAnonKey ?? 'not-configured',
);
```

**Step 3: Update BackendGate to use exported flag**

In `src/components/layout/BackendGate.tsx`, import and use `isSupabaseConfigured`:

```typescript
import { isSupabaseConfigured } from '../../lib/supabase';

// In the component, use this for the initial check instead of re-checking env vars
if (!isSupabaseConfigured) {
  return <SetupInstructions />;
}
```

**Step 4: Run tests to verify no regressions**

Run: `npm test -- --run`
Expected: Tests pass (existing behavior preserved)

**Step 5: Commit**

```bash
git add src/lib/supabase.ts src/components/layout/BackendGate.tsx
git commit -m "fix: add explicit environment validation for Supabase config"
```

---

### Task 2: Logging Utility

**Files:**
- Create: `src/lib/logger.ts`
- Modify: `src/features/auth/auth-store.ts`

**Step 1: Create logger utility**

Create `src/lib/logger.ts`:

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = import.meta.env.DEV;

export const logger = {
  debug(message: string, data?: unknown): void {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, data ?? '');
    }
  },

  info(message: string, data?: unknown): void {
    if (isDev) {
      console.info(`[INFO] ${message}`, data ?? '');
    }
  },

  warn(message: string, data?: unknown): void {
    if (isDev) {
      console.warn(`[WARN] ${message}`, data ?? '');
    }
  },

  error(message: string, error?: unknown): void {
    // Always log errors
    console.error(`[ERROR] ${message}`, error ?? '');
  },
};
```

**Step 2: Update auth-store.ts to use logger**

In `src/features/auth/auth-store.ts`, replace console calls:

```typescript
import { logger } from '../../lib/logger';

// Replace: console.warn('...')
// With: logger.warn('...')

// Replace: console.error('...')
// With: logger.error('...')
```

**Step 3: Run tests**

Run: `npm test -- --run`
Expected: Tests pass

**Step 4: Commit**

```bash
git add src/lib/logger.ts src/features/auth/auth-store.ts
git commit -m "feat: add logging utility, replace console calls in auth-store"
```

---

### Task 3: Error Boundaries

**Files:**
- Create: `src/components/ErrorBoundary.tsx`
- Create: `src/components/FeatureErrorBoundary.tsx`
- Create: `src/styles/components/error-boundary.css`
- Modify: `src/App.tsx`
- Modify: `src/styles/globals.css`

**Step 1: Create ErrorBoundary component**

Create `src/components/ErrorBoundary.tsx`:

```typescript
import { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('Uncaught error in React tree', { error, errorInfo });
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <DefaultErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface FallbackProps {
  error: Error | null;
  onRetry: () => void;
}

function DefaultErrorFallback({ error, onRetry }: FallbackProps) {
  return (
    <div className="error-fallback">
      <div className="error-fallback-content">
        <h2>Something went wrong</h2>
        <p>We're sorry, but something unexpected happened.</p>
        {import.meta.env.DEV && error && (
          <pre className="error-details">{error.message}</pre>
        )}
        <div className="error-actions">
          <button onClick={onRetry} className="btn btn-primary">
            Try Again
          </button>
          <button onClick={() => window.location.reload()} className="btn btn-secondary">
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create FeatureErrorBoundary**

Create `src/components/FeatureErrorBoundary.tsx`:

```typescript
import { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface Props {
  feature: string;
  children: ReactNode;
}

export function FeatureErrorBoundary({ feature, children }: Props) {
  return (
    <ErrorBoundary
      fallback={
        <div className="feature-error">
          <h3>Unable to load {feature}</h3>
          <p>Please try refreshing the page.</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
```

**Step 3: Create error boundary styles**

Create `src/styles/components/error-boundary.css`:

```css
.error-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--spacing-8);
  background: var(--color-bg-primary);
}

.error-fallback-content {
  max-width: 480px;
  text-align: center;
}

.error-fallback h2 {
  margin-bottom: var(--spacing-4);
  color: var(--color-text-primary);
}

.error-fallback p {
  margin-bottom: var(--spacing-6);
  color: var(--color-text-secondary);
}

.error-details {
  margin-bottom: var(--spacing-6);
  padding: var(--spacing-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  text-align: left;
  overflow-x: auto;
  color: var(--color-status-error);
}

.error-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: center;
}

.feature-error {
  padding: var(--spacing-8);
  text-align: center;
  color: var(--color-text-secondary);
}

.feature-error h3 {
  margin-bottom: var(--spacing-2);
  color: var(--color-text-primary);
}
```

**Step 4: Import styles in globals.css**

Add to `src/styles/globals.css`:

```css
@import './components/error-boundary.css';
```

**Step 5: Wrap App with ErrorBoundary**

Update `src/App.tsx`:

```typescript
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      {/* existing content */}
    </ErrorBoundary>
  );
}
```

**Step 6: Run tests**

Run: `npm test -- --run`
Expected: Tests pass

**Step 7: Commit**

```bash
git add src/components/ErrorBoundary.tsx src/components/FeatureErrorBoundary.tsx \
  src/styles/components/error-boundary.css src/styles/globals.css src/App.tsx
git commit -m "feat: add error boundaries for graceful error handling"
```

---

### Task 4: Fix ESLint Disabled Rule

**Files:**
- Modify: `src/features/auth/use-auth.ts`

**Step 1: Read current implementation**

Run: `cat src/features/auth/use-auth.ts`

Find the useEffect with the eslint-disable comment.

**Step 2: Fix the initialization pattern**

Replace the problematic useEffect:

```typescript
import { useRef } from 'react';

// Inside the hook:
const hasInitialized = useRef(false);

useEffect(() => {
  if (!hasInitialized.current) {
    hasInitialized.current = true;
    authStore.initialize();
  }
}, []);
```

Remove the `// eslint-disable-next-line react-hooks/exhaustive-deps` comment.

**Step 3: Run linter**

Run: `npm run lint`
Expected: No eslint-disable warnings for this file

**Step 4: Run tests**

Run: `npm test -- --run`
Expected: Tests pass

**Step 5: Commit**

```bash
git add src/features/auth/use-auth.ts
git commit -m "fix: remove eslint-disable with proper initialization pattern"
```

---

### Task 5: OAuth Service Methods

**Files:**
- Modify: `src/features/auth/auth-service.ts`

**Step 1: Read current auth-service**

Run: `cat src/features/auth/auth-service.ts`

Understand the existing structure and error handling patterns.

**Step 2: Add OAuth methods**

Add these methods to the AuthService class in `src/features/auth/auth-service.ts`:

```typescript
async signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) {
    throw new AuthError(error.message, 'OAUTH_ERROR');
  }
}

async signInWithMicrosoft(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'email profile openid',
    },
  });
  if (error) {
    throw new AuthError(error.message, 'OAUTH_ERROR');
  }
}
```

**Step 3: Run tests**

Run: `npm test -- --run`
Expected: Tests pass

**Step 4: Commit**

```bash
git add src/features/auth/auth-service.ts
git commit -m "feat: add OAuth methods for Google and Microsoft sign-in"
```

---

### Task 6: OAuth Buttons Component

**Files:**
- Create: `src/features/auth/components/OAuthButtons.tsx`
- Create: `src/styles/features/oauth-buttons.css`
- Modify: `src/styles/globals.css`

**Step 1: Create OAuthButtons component**

Create `src/features/auth/components/OAuthButtons.tsx`:

```typescript
import { useState } from 'react';
import { authService } from '../auth-service';
import { logger } from '../../../lib/logger';

type OAuthProvider = 'google' | 'microsoft';

interface OAuthButtonsProps {
  disabled?: boolean;
}

export function OAuthButtons({ disabled }: OAuthButtonsProps) {
  const [loading, setLoading] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuth = async (provider: OAuthProvider) => {
    setLoading(provider);
    setError(null);

    try {
      if (provider === 'google') {
        await authService.signInWithGoogle();
      } else {
        await authService.signInWithMicrosoft();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'OAuth failed';
      setError(message);
      logger.error(`OAuth ${provider} failed`, err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="oauth-buttons">
      {error && <p className="oauth-error">{error}</p>}

      <button
        type="button"
        className="oauth-btn oauth-btn-google"
        onClick={() => handleOAuth('google')}
        disabled={disabled || loading !== null}
      >
        <GoogleIcon />
        <span>{loading === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
      </button>

      <button
        type="button"
        className="oauth-btn oauth-btn-microsoft"
        onClick={() => handleOAuth('microsoft')}
        disabled={disabled || loading !== null}
      >
        <MicrosoftIcon />
        <span>{loading === 'microsoft' ? 'Connecting...' : 'Continue with Microsoft'}</span>
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.4 24H0V12.6h11.4V24z" />
      <path d="M24 24H12.6V12.6H24V24z" />
      <path d="M11.4 11.4H0V0h11.4v11.4z" />
      <path d="M24 11.4H12.6V0H24v11.4z" />
    </svg>
  );
}
```

**Step 2: Create OAuth button styles**

Create `src/styles/features/oauth-buttons.css`:

```css
.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.oauth-error {
  padding: var(--spacing-3);
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-md);
  color: var(--color-status-error);
  font-size: var(--text-sm);
  text-align: center;
}

.oauth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s, border-color 0.15s;
}

.oauth-btn:hover:not(:disabled) {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-hover);
}

.oauth-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.oauth-btn svg {
  flex-shrink: 0;
}

.oauth-btn-google:hover:not(:disabled) {
  border-color: #4285f4;
}

.oauth-btn-microsoft:hover:not(:disabled) {
  border-color: #00a4ef;
}
```

**Step 3: Import styles in globals.css**

Add to `src/styles/globals.css`:

```css
@import './features/oauth-buttons.css';
```

**Step 4: Run tests**

Run: `npm test -- --run`
Expected: Tests pass

**Step 5: Commit**

```bash
git add src/features/auth/components/OAuthButtons.tsx \
  src/styles/features/oauth-buttons.css src/styles/globals.css
git commit -m "feat: add OAuth buttons component with Google and Microsoft"
```

---

### Task 7: Update Login Page with OAuth

**Files:**
- Modify: `src/features/auth/components/LoginPage.tsx`

**Step 1: Read current LoginPage**

Run: `cat src/features/auth/components/LoginPage.tsx`

Understand the current layout.

**Step 2: Add OAuth buttons to LoginPage**

Import and add OAuthButtons above or below the email form:

```typescript
import { OAuthButtons } from './OAuthButtons';

// In the JSX, add a divider and OAuth buttons:
<div className="auth-divider">
  <span>or continue with</span>
</div>

<OAuthButtons disabled={isLoading} />
```

**Step 3: Add divider styles**

Add to `src/styles/features/auth.css`:

```css
.auth-divider {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin: var(--spacing-6) 0;
  color: var(--color-text-tertiary);
  font-size: var(--text-sm);
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}
```

**Step 4: Run tests**

Run: `npm test -- --run`
Expected: Tests pass

**Step 5: Commit**

```bash
git add src/features/auth/components/LoginPage.tsx src/styles/features/auth.css
git commit -m "feat: integrate OAuth buttons into login page"
```

---

### Task 8: Auth Callback Page

**Files:**
- Create: `src/pages/AuthCallbackPage.tsx`
- Modify: `src/router.tsx`
- Modify: `src/routes.ts`

**Step 1: Create AuthCallbackPage**

Create `src/pages/AuthCallbackPage.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { ROUTES } from '../routes';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session) {
          logger.info('OAuth callback successful');
          navigate(ROUTES.HOME, { replace: true });
        } else {
          setError('No session found. Please try signing in again.');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed';
        logger.error('OAuth callback failed', err);
        setError(message);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="auth-callback-error">
        <h2>Authentication Failed</h2>
        <p>{error}</p>
        <a href={ROUTES.LOGIN} className="btn btn-primary">
          Back to Login
        </a>
      </div>
    );
  }

  return (
    <div className="auth-callback-loading">
      <div className="spinner" />
      <p>Completing sign in...</p>
    </div>
  );
}
```

**Step 2: Add route constant**

In `src/routes.ts`, add:

```typescript
AUTH_CALLBACK: '/auth/callback',
LOGIN: '/login',
```

**Step 3: Add route to router**

In `src/router.tsx`, add the route:

```typescript
import { AuthCallbackPage } from './pages/AuthCallbackPage';

// Add to routes array:
{
  path: ROUTES.AUTH_CALLBACK,
  element: <AuthCallbackPage />,
},
```

**Step 4: Run tests**

Run: `npm test -- --run`
Expected: Tests pass

**Step 5: Commit**

```bash
git add src/pages/AuthCallbackPage.tsx src/router.tsx src/routes.ts
git commit -m "feat: add auth callback page for OAuth redirect handling"
```

---

### Task 9: Seed Data Script

**Files:**
- Create: `supabase/seed.sql`

**Step 1: Create comprehensive seed data**

Create `supabase/seed.sql`:

```sql
-- Seed Data for AV Designer
-- Run after migrations: supabase db reset (includes seed)

-- Note: Users are created through Supabase Auth, not directly in this seed
-- This seed assumes an organization ID will be provided or created

-- Insert sample equipment (50 items across categories)
INSERT INTO equipment (id, manufacturer, model, sku, category, subcategory, description, cost, msrp, dimensions, weight, organization_id)
VALUES
  -- Video Equipment
  (gen_random_uuid(), 'Poly', 'Studio X50', 'POLY-X50', 'video', 'video_bar', 'All-in-one video bar for small rooms', 250000, 349900, '{"width": 24, "height": 4, "depth": 5}', 8.5, NULL),
  (gen_random_uuid(), 'Poly', 'Studio X70', 'POLY-X70', 'video', 'video_bar', 'All-in-one video bar for medium rooms', 450000, 599900, '{"width": 48, "height": 4, "depth": 5}', 12.0, NULL),
  (gen_random_uuid(), 'Logitech', 'Rally Bar', 'LOGI-RALLY', 'video', 'video_bar', 'Premier all-in-one video bar', 350000, 499900, '{"width": 36, "height": 5, "depth": 4}', 10.5, NULL),
  (gen_random_uuid(), 'Logitech', 'Rally Bar Mini', 'LOGI-RALLY-MINI', 'video', 'video_bar', 'Compact video bar for huddle rooms', 220000, 299900, '{"width": 24, "height": 4, "depth": 4}', 6.5, NULL),
  (gen_random_uuid(), 'Cisco', 'Room Bar', 'CISCO-ROOMBAR', 'video', 'video_bar', 'Cisco collaboration video bar', 380000, 549900, '{"width": 32, "height": 5, "depth": 5}', 9.0, NULL),
  (gen_random_uuid(), 'Samsung', 'QB65R', 'SAM-QB65R', 'video', 'display', '65" 4K commercial display', 120000, 179900, '{"width": 57, "height": 33, "depth": 2}', 55.0, NULL),
  (gen_random_uuid(), 'Samsung', 'QB75R', 'SAM-QB75R', 'video', 'display', '75" 4K commercial display', 180000, 269900, '{"width": 66, "height": 38, "depth": 2}', 75.0, NULL),
  (gen_random_uuid(), 'LG', '65UL3J', 'LG-65UL3J', 'video', 'display', '65" 4K UHD signage display', 110000, 159900, '{"width": 57, "height": 33, "depth": 3}', 52.0, NULL),
  (gen_random_uuid(), 'Sony', 'FW-65BZ40H', 'SONY-65BZ40H', 'video', 'display', '65" BRAVIA professional display', 150000, 219900, '{"width": 57, "height": 33, "depth": 3}', 58.0, NULL),
  (gen_random_uuid(), 'PTZOptics', 'Move 4K', 'PTZ-MOVE4K', 'video', 'camera', '4K PTZ camera with NDI', 180000, 249900, '{"width": 6, "height": 7, "depth": 6}', 2.5, NULL),

  -- Audio Equipment
  (gen_random_uuid(), 'Shure', 'MXA920', 'SHURE-MXA920', 'audio', 'microphone', 'Ceiling array microphone 24x24', 320000, 429900, '{"width": 24, "height": 2, "depth": 24}', 8.0, NULL),
  (gen_random_uuid(), 'Shure', 'MXA910', 'SHURE-MXA910', 'audio', 'microphone', 'Ceiling array microphone with IntelliMix', 280000, 379900, '{"width": 24, "height": 2, "depth": 24}', 7.5, NULL),
  (gen_random_uuid(), 'Sennheiser', 'TeamConnect Ceiling 2', 'SENN-TCC2', 'audio', 'microphone', 'Beamforming ceiling microphone', 350000, 479900, '{"width": 24, "height": 3, "depth": 24}', 9.0, NULL),
  (gen_random_uuid(), 'Biamp', 'Parlé TCM-XA', 'BIAMP-TCM-XA', 'audio', 'microphone', 'Beamtracking ceiling microphone', 250000, 349900, '{"width": 24, "height": 2, "depth": 24}', 6.5, NULL),
  (gen_random_uuid(), 'QSC', 'AD-C6T', 'QSC-ADC6T', 'audio', 'speaker', '6.5" ceiling speaker', 18000, 24900, '{"width": 9, "height": 5, "depth": 9}', 4.0, NULL),
  (gen_random_uuid(), 'JBL', 'Control 26CT', 'JBL-C26CT', 'audio', 'speaker', '6.5" ceiling speaker', 15000, 19900, '{"width": 9, "height": 5, "depth": 9}', 3.5, NULL),
  (gen_random_uuid(), 'Biamp', 'TesiraFORTE AI', 'BIAMP-FORTE-AI', 'audio', 'dsp', 'Digital signal processor with AEC', 350000, 479900, '{"width": 17, "height": 2, "depth": 12}', 6.0, NULL),
  (gen_random_uuid(), 'QSC', 'Core 110f', 'QSC-CORE110F', 'audio', 'dsp', 'Q-SYS Core processor', 280000, 379900, '{"width": 17, "height": 2, "depth": 14}', 7.5, NULL),
  (gen_random_uuid(), 'Shure', 'IntelliMix P300', 'SHURE-P300', 'audio', 'dsp', 'Audio conferencing processor', 120000, 169900, '{"width": 8, "height": 2, "depth": 8}', 2.0, NULL),
  (gen_random_uuid(), 'Crown', 'DCi 4|300', 'CROWN-DCI4300', 'audio', 'amplifier', '4-channel 300W amplifier', 150000, 209900, '{"width": 17, "height": 4, "depth": 14}', 18.0, NULL),

  -- Control Equipment
  (gen_random_uuid(), 'Crestron', 'TSW-1070', 'CREST-TSW1070', 'control', 'touch_panel', '10" touch screen', 180000, 249900, '{"width": 10, "height": 7, "depth": 2}', 2.5, NULL),
  (gen_random_uuid(), 'Crestron', 'TSW-770', 'CREST-TSW770', 'control', 'touch_panel', '7" touch screen', 120000, 169900, '{"width": 7, "height": 5, "depth": 2}', 1.5, NULL),
  (gen_random_uuid(), 'Extron', 'TLP Pro 1025M', 'EXTRON-TLP1025', 'control', 'touch_panel', '10" tabletop touchpanel', 160000, 219900, '{"width": 10, "height": 7, "depth": 4}', 3.0, NULL),
  (gen_random_uuid(), 'Crestron', 'CP4-R', 'CREST-CP4R', 'control', 'processor', '4-Series control processor', 280000, 379900, '{"width": 8, "height": 2, "depth": 8}', 3.5, NULL),
  (gen_random_uuid(), 'Crestron', 'MC4-R', 'CREST-MC4R', 'control', 'processor', '4-Series media controller', 220000, 299900, '{"width": 8, "height": 2, "depth": 8}', 3.0, NULL),
  (gen_random_uuid(), 'Extron', 'IPCP Pro 550', 'EXTRON-IPCP550', 'control', 'processor', 'IP Link Pro control processor', 250000, 349900, '{"width": 8, "height": 2, "depth": 10}', 4.0, NULL),

  -- Infrastructure Equipment
  (gen_random_uuid(), 'Crestron', 'NVX-E30', 'CREST-NVXE30', 'infrastructure', 'encoder', '4K60 AV-over-IP encoder', 150000, 209900, '{"width": 8, "height": 1, "depth": 6}', 1.5, NULL),
  (gen_random_uuid(), 'Crestron', 'NVX-D30', 'CREST-NVXD30', 'infrastructure', 'decoder', '4K60 AV-over-IP decoder', 120000, 169900, '{"width": 8, "height": 1, "depth": 6}', 1.5, NULL),
  (gen_random_uuid(), 'Extron', 'DTP2 T 212', 'EXTRON-DTP2T212', 'infrastructure', 'transmitter', 'DTP2 4K transmitter', 80000, 109900, '{"width": 4, "height": 1, "depth": 4}', 0.5, NULL),
  (gen_random_uuid(), 'Extron', 'DTP2 R 212', 'EXTRON-DTP2R212', 'infrastructure', 'receiver', 'DTP2 4K receiver', 60000, 84900, '{"width": 4, "height": 1, "depth": 4}', 0.5, NULL),
  (gen_random_uuid(), 'Crestron', 'HD-DA4-4KZ-E', 'CREST-HDDA4', 'infrastructure', 'distribution', '1x4 HDMI distribution amp', 45000, 64900, '{"width": 8, "height": 1, "depth": 6}', 1.0, NULL),
  (gen_random_uuid(), 'Extron', 'SW4 HD 4K PLUS', 'EXTRON-SW4HD', 'infrastructure', 'switcher', '4x1 HDMI switcher', 55000, 79900, '{"width": 8, "height": 1, "depth": 6}', 1.5, NULL),
  (gen_random_uuid(), 'Crestron', 'HD-MD4X2-4KZ-E', 'CREST-HDMD4X2', 'infrastructure', 'matrix', '4x2 HDMI matrix switcher', 95000, 134900, '{"width": 8, "height": 2, "depth": 8}', 3.0, NULL),
  (gen_random_uuid(), 'Middle Atlantic', 'QUIK-IRS-6', 'MIDATL-IRS6', 'infrastructure', 'rack', '6U in-room rack', 35000, 49900, '{"width": 22, "height": 12, "depth": 24}', 45.0, NULL),
  (gen_random_uuid(), 'Middle Atlantic', 'BGR-19SA-32', 'MIDATL-BGR32', 'infrastructure', 'rack', '32U server rack', 85000, 119900, '{"width": 24, "height": 60, "depth": 32}', 180.0, NULL)
ON CONFLICT DO NOTHING;

-- Insert sample standard nodes (folder structure)
INSERT INTO standard_nodes (id, name, parent_id, type, "order")
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Room Types', NULL, 'folder', 1),
  ('00000000-0000-0000-0000-000000000002', 'Platforms', NULL, 'folder', 2),
  ('00000000-0000-0000-0000-000000000003', 'Quality Tiers', NULL, 'folder', 3),
  ('00000000-0000-0000-0000-000000000011', 'Huddle Room', '00000000-0000-0000-0000-000000000001', 'standard', 1),
  ('00000000-0000-0000-0000-000000000012', 'Conference Room', '00000000-0000-0000-0000-000000000001', 'standard', 2),
  ('00000000-0000-0000-0000-000000000013', 'Boardroom', '00000000-0000-0000-0000-000000000001', 'standard', 3),
  ('00000000-0000-0000-0000-000000000021', 'Microsoft Teams', '00000000-0000-0000-0000-000000000002', 'standard', 1),
  ('00000000-0000-0000-0000-000000000022', 'Zoom', '00000000-0000-0000-0000-000000000002', 'standard', 2),
  ('00000000-0000-0000-0000-000000000031', 'Standard', '00000000-0000-0000-0000-000000000003', 'standard', 1),
  ('00000000-0000-0000-0000-000000000032', 'Premium', '00000000-0000-0000-0000-000000000003', 'standard', 2)
ON CONFLICT DO NOTHING;

-- Insert sample rules
INSERT INTO rules (id, name, description, aspect, expression_type, conditions, expression, priority, is_active, standard_id)
VALUES
  (gen_random_uuid(), 'Huddle Room Display Size', 'Display size requirements for huddle rooms', 'equipment_selection', 'constraint',
   '[{"field": "roomType", "operator": "equals", "value": "huddle"}]',
   'display.size >= 55 AND display.size <= 65', 1, true, '00000000-0000-0000-0000-000000000011'),
  (gen_random_uuid(), 'Conference Room Display Size', 'Display size requirements for conference rooms', 'equipment_selection', 'constraint',
   '[{"field": "roomType", "operator": "equals", "value": "conference"}]',
   'display.size >= 65 AND display.size <= 85', 1, true, '00000000-0000-0000-0000-000000000012'),
  (gen_random_uuid(), 'Teams Certification Required', 'Equipment must be Teams certified', 'equipment_selection', 'constraint',
   '[{"field": "platform", "operator": "equals", "value": "teams"}]',
   'equipment.certifications CONTAINS "teams"', 2, true, '00000000-0000-0000-0000-000000000021'),
  (gen_random_uuid(), 'Zoom Certification Required', 'Equipment must be Zoom certified', 'equipment_selection', 'constraint',
   '[{"field": "platform", "operator": "equals", "value": "zoom"}]',
   'equipment.certifications CONTAINS "zoom"', 2, true, '00000000-0000-0000-0000-000000000022'),
  (gen_random_uuid(), 'Microphone Coverage', 'One microphone per 100 sq ft', 'quantities', 'formula',
   '[]',
   'CEIL(room.area / 100)', 3, true, NULL),
  (gen_random_uuid(), 'Speaker Coverage', 'One speaker per 150 sq ft', 'quantities', 'formula',
   '[]',
   'CEIL(room.area / 150)', 3, true, NULL),
  (gen_random_uuid(), 'Premium Audio Required', 'Premium tier requires ceiling mics', 'equipment_selection', 'constraint',
   '[{"field": "tier", "operator": "equals", "value": "premium"}]',
   'microphone.type == "ceiling_array"', 1, true, '00000000-0000-0000-0000-000000000032'),
  (gen_random_uuid(), 'Display Height Placement', 'Display center should be at 48-54 inches', 'placement', 'constraint',
   '[{"field": "equipment.category", "operator": "equals", "value": "video"}]',
   'equipment.mountHeight >= 48 AND equipment.mountHeight <= 54', 4, true, NULL)
ON CONFLICT DO NOTHING;

-- Note: Projects, rooms, and quotes should be created through the application
-- after a user signs up and creates an organization
```

**Step 2: Commit**

```bash
git add supabase/seed.sql
git commit -m "feat: add comprehensive seed data for equipment, standards, and rules"
```

---

## Phase 2: Type Safety

### Task 10: Database JSON Type Definitions

**Files:**
- Create: `src/types/database-json.ts`

**Step 1: Create type definitions for JSON columns**

Create `src/types/database-json.ts`:

```typescript
import type { MountType, LayerType, ElementType, RoomType, Platform, Ecosystem, Tier } from './index';

// Placed equipment stored in rooms.placed_equipment JSONB column
export interface PlacedEquipmentJson {
  id: string;
  equipmentId: string;
  x: number;
  y: number;
  rotation: number;
  mountType: MountType;
  label?: string;
  notes?: string;
}

// Drawing layers stored in drawings.layers JSONB column
export interface DrawingLayerJson {
  id: string;
  name: string;
  type: LayerType;
  isLocked: boolean;
  isVisible: boolean;
  elements: DrawingElementJson[];
}

export interface DrawingElementJson {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  rotation: number;
  properties: Record<string, unknown>;
}

// Drawing overrides stored in drawings.overrides JSONB column
export interface DrawingOverrideJson {
  elementId: string;
  property: string;
  value: unknown;
}

// Template content stored in templates.content JSONB column
export interface RoomTemplateContentJson {
  roomType: RoomType;
  width: number;
  length: number;
  ceilingHeight: number;
  platform: Platform;
  ecosystem: Ecosystem;
  tier: Tier;
  equipment: PlacedEquipmentJson[];
  connections?: ConnectionJson[];
}

export interface ConnectionJson {
  id: string;
  sourceId: string;
  targetId: string;
  cableType: string;
  label?: string;
}

export interface EquipmentPackageContentJson {
  equipment: Array<{
    equipmentId: string;
    quantity: number;
  }>;
}

export interface ProjectTemplateContentJson {
  rooms: Array<{
    templateId: string;
    quantity: number;
  }>;
}

export interface QuoteTemplateContentJson {
  sections: Array<{
    name: string;
    category: string;
  }>;
  defaultMargin: number;
}

// Equipment dimensions stored in equipment.dimensions JSONB column
export interface DimensionsJson {
  width: number;
  height: number;
  depth: number;
}

// Electrical specs stored in equipment.electrical JSONB column
export interface ElectricalJson {
  voltage?: number;
  amperage?: number;
  wattage?: number;
  connector?: string;
}

// Rule conditions stored in rules.conditions JSONB column
export interface RuleConditionJson {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in';
  value: unknown;
}
```

**Step 2: Commit**

```bash
git add src/types/database-json.ts
git commit -m "feat: add type definitions for database JSON columns"
```

---

### Task 11: Database Mappers

**Files:**
- Create: `src/lib/database-mappers.ts`

**Step 1: Create mapper functions**

Create `src/lib/database-mappers.ts`:

```typescript
import type { Json } from './database.types';
import type {
  PlacedEquipment,
  DrawingLayer,
  DrawingElement,
  DrawingOverride,
  RuleCondition,
  Equipment,
} from '../types';
import type {
  PlacedEquipmentJson,
  DrawingLayerJson,
  DrawingElementJson,
  DrawingOverrideJson,
  RuleConditionJson,
  DimensionsJson,
  ElectricalJson,
} from '../types/database-json';

// Placed Equipment Mappers
export function mapJsonToPlacedEquipment(json: Json): PlacedEquipment[] {
  if (!json || !Array.isArray(json)) return [];

  return (json as PlacedEquipmentJson[]).map(item => ({
    id: item.id,
    equipmentId: item.equipmentId,
    x: item.x,
    y: item.y,
    rotation: item.rotation,
    mountType: item.mountType,
    label: item.label,
    notes: item.notes,
  }));
}

export function mapPlacedEquipmentToJson(equipment: PlacedEquipment[]): Json {
  return equipment.map(item => ({
    id: item.id,
    equipmentId: item.equipmentId,
    x: item.x,
    y: item.y,
    rotation: item.rotation,
    mountType: item.mountType,
    label: item.label,
    notes: item.notes,
  })) as unknown as Json;
}

// Drawing Layer Mappers
export function mapJsonToDrawingLayers(json: Json): DrawingLayer[] {
  if (!json || !Array.isArray(json)) return [];

  return (json as DrawingLayerJson[]).map(layer => ({
    id: layer.id,
    name: layer.name,
    type: layer.type,
    isLocked: layer.isLocked,
    isVisible: layer.isVisible,
    elements: layer.elements.map(mapJsonElementToElement),
  }));
}

function mapJsonElementToElement(el: DrawingElementJson): DrawingElement {
  return {
    id: el.id,
    type: el.type,
    x: el.x,
    y: el.y,
    rotation: el.rotation,
    properties: el.properties,
  };
}

export function mapDrawingLayersToJson(layers: DrawingLayer[]): Json {
  return layers.map(layer => ({
    id: layer.id,
    name: layer.name,
    type: layer.type,
    isLocked: layer.isLocked,
    isVisible: layer.isVisible,
    elements: layer.elements.map(el => ({
      id: el.id,
      type: el.type,
      x: el.x,
      y: el.y,
      rotation: el.rotation,
      properties: el.properties,
    })),
  })) as unknown as Json;
}

// Drawing Override Mappers
export function mapJsonToDrawingOverrides(json: Json): DrawingOverride[] {
  if (!json || !Array.isArray(json)) return [];

  return (json as DrawingOverrideJson[]).map(override => ({
    elementId: override.elementId,
    property: override.property,
    value: override.value,
  }));
}

export function mapDrawingOverridesToJson(overrides: DrawingOverride[]): Json {
  return overrides.map(override => ({
    elementId: override.elementId,
    property: override.property,
    value: override.value,
  })) as unknown as Json;
}

// Rule Condition Mappers
export function mapJsonToRuleConditions(json: Json): RuleCondition[] {
  if (!json || !Array.isArray(json)) return [];

  return (json as RuleConditionJson[]).map(cond => ({
    field: cond.field,
    operator: cond.operator,
    value: cond.value,
  }));
}

export function mapRuleConditionsToJson(conditions: RuleCondition[]): Json {
  return conditions.map(cond => ({
    field: cond.field,
    operator: cond.operator,
    value: cond.value,
  })) as unknown as Json;
}

// Equipment Dimension Mappers
export function mapJsonToDimensions(json: Json): Equipment['dimensions'] {
  if (!json || typeof json !== 'object') {
    return { width: 0, height: 0, depth: 0 };
  }
  const dims = json as DimensionsJson;
  return {
    width: dims.width ?? 0,
    height: dims.height ?? 0,
    depth: dims.depth ?? 0,
  };
}

export function mapDimensionsToJson(dimensions: Equipment['dimensions']): Json {
  return {
    width: dimensions.width,
    height: dimensions.height,
    depth: dimensions.depth,
  } as unknown as Json;
}

// Electrical Specs Mappers
export function mapJsonToElectrical(json: Json): Equipment['electrical'] | undefined {
  if (!json || typeof json !== 'object') return undefined;

  const elec = json as ElectricalJson;
  return {
    voltage: elec.voltage,
    amperage: elec.amperage,
    wattage: elec.wattage,
    connector: elec.connector,
  };
}

export function mapElectricalToJson(electrical: Equipment['electrical']): Json | null {
  if (!electrical) return null;
  return {
    voltage: electrical.voltage,
    amperage: electrical.amperage,
    wattage: electrical.wattage,
    connector: electrical.connector,
  } as unknown as Json;
}
```

**Step 2: Commit**

```bash
git add src/lib/database-mappers.ts
git commit -m "feat: add type-safe database mappers for JSON columns"
```

---

### Task 12: Update Room Service with Mappers

**Files:**
- Modify: `src/features/room-builder/room-service.ts`

**Step 1: Read current implementation**

Run: `cat src/features/room-builder/room-service.ts`

Identify all `as unknown as` casts.

**Step 2: Import and use mappers**

At top of file:
```typescript
import {
  mapJsonToPlacedEquipment,
  mapPlacedEquipmentToJson
} from '../../lib/database-mappers';
```

Replace all occurrences like:
```typescript
// Before
placedEquipment: row.placed_equipment as unknown as PlacedEquipment[]

// After
placedEquipment: mapJsonToPlacedEquipment(row.placed_equipment)
```

And for writes:
```typescript
// Before
placed_equipment: room.placedEquipment as unknown as Json

// After
placed_equipment: mapPlacedEquipmentToJson(room.placedEquipment)
```

**Step 3: Run tests**

Run: `npm test -- --run`
Expected: Tests pass

**Step 4: Commit**

```bash
git add src/features/room-builder/room-service.ts
git commit -m "refactor: use type-safe mappers in room service"
```

---

### Task 13: Update Drawing Service with Mappers

**Files:**
- Modify: `src/features/drawings/drawing-service.ts`

**Step 1: Import mappers**

```typescript
import {
  mapJsonToDrawingLayers,
  mapDrawingLayersToJson,
  mapJsonToDrawingOverrides,
  mapDrawingOverridesToJson,
} from '../../lib/database-mappers';
```

**Step 2: Replace unsafe casts**

Find and replace all `as unknown as Json` for layers and overrides.

**Step 3: Run tests**

Run: `npm test -- --run`
Expected: Tests pass

**Step 4: Commit**

```bash
git add src/features/drawings/drawing-service.ts
git commit -m "refactor: use type-safe mappers in drawing service"
```

---

### Task 14: Update Remaining Services

**Files:**
- Modify: `src/features/auth/auth-service.ts`
- Modify: `src/features/templates/template-service.ts`
- Modify: `src/features/settings/settings-service.ts`
- Modify: `src/features/projects/activity-service.ts`

**Step 1: Review each file for unsafe casts**

For each file, identify patterns like:
- `as unknown as`
- `as never`
- `as any`

**Step 2: Create specific mappers if needed or use existing ones**

For template content, add to `database-mappers.ts`:
```typescript
export function mapJsonToTemplateContent<T>(json: Json): T | null {
  if (!json || typeof json !== 'object') return null;
  return json as T;
}
```

**Step 3: Update each service**

Apply consistent patterns across all services.

**Step 4: Run full test suite**

Run: `npm test -- --run`
Expected: All tests pass

**Step 5: Commit**

```bash
git add src/features/auth/auth-service.ts src/features/templates/template-service.ts \
  src/features/settings/settings-service.ts src/features/projects/activity-service.ts \
  src/lib/database-mappers.ts
git commit -m "refactor: use type-safe mappers across all services"
```

---

## Phase 3: Templates Feature Completion

### Task 15: Fix Template Mount Type

**Files:**
- Modify: `src/features/templates/template-apply.ts`

**Step 1: Read current implementation**

Run: `cat src/features/templates/template-apply.ts`

Find line ~72 where mountType is hardcoded to 'floor'.

**Step 2: Fix mount type to use template value**

```typescript
// Before (around line 72)
mountType: 'floor',

// After
mountType: eq.mountType ?? 'floor',
```

**Step 3: Run tests**

Run: `npm test -- --run`
Expected: Tests pass

**Step 4: Commit**

```bash
git add src/features/templates/template-apply.ts
git commit -m "fix: use template mount type instead of hardcoded floor"
```

---

### Task 16: Add Connection Restoration

**Files:**
- Modify: `src/features/templates/template-apply.ts`
- Modify: `src/features/room-builder/room-service.ts` (if needed)

**Step 1: Add connection restoration logic**

In `template-apply.ts`, after creating equipment:

```typescript
// After equipment placement, restore connections
if (content.connections && content.connections.length > 0) {
  // Map old equipment IDs to new IDs
  const idMap = new Map<string, string>();
  content.equipment.forEach((eq, index) => {
    if (createdEquipment[index]) {
      idMap.set(eq.id, createdEquipment[index].id);
    }
  });

  // Create new connections with mapped IDs
  const newConnections = content.connections
    .filter(conn => idMap.has(conn.sourceId) && idMap.has(conn.targetId))
    .map(conn => ({
      id: generateId(),
      sourceId: idMap.get(conn.sourceId)!,
      targetId: idMap.get(conn.targetId)!,
      cableType: conn.cableType,
      label: conn.label,
    }));

  if (newConnections.length > 0) {
    await roomService.updateConnections(roomId, newConnections);
  }
}
```

**Step 2: Add updateConnections method to room-service if missing**

Check if `roomService.updateConnections()` exists. If not, add it:

```typescript
async updateConnections(roomId: string, connections: Connection[]): Promise<void> {
  const { error } = await supabase
    .from('rooms')
    .update({ connections: mapConnectionsToJson(connections) })
    .eq('id', roomId);

  if (error) throw new Error(error.message);
}
```

**Step 3: Run tests**

Run: `npm test -- --run`
Expected: Tests pass

**Step 4: Commit**

```bash
git add src/features/templates/template-apply.ts src/features/room-builder/room-service.ts
git commit -m "feat: restore equipment connections when applying room templates"
```

---

### Task 17: Template Content Preview

**Files:**
- Modify: `src/features/templates/components/ApplyTemplateModal.tsx`
- Create: `src/features/templates/components/TemplatePreview.tsx`

**Step 1: Create TemplatePreview component**

Create `src/features/templates/components/TemplatePreview.tsx`:

```typescript
import type { Template } from '../../../types';
import type { RoomTemplateContentJson, EquipmentPackageContentJson } from '../../../types/database-json';

interface TemplatePreviewProps {
  template: Template;
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  if (template.type === 'room') {
    return <RoomTemplatePreview content={template.content as RoomTemplateContentJson} />;
  }

  if (template.type === 'equipment_package') {
    return <EquipmentPackagePreview content={template.content as EquipmentPackageContentJson} />;
  }

  return <GenericPreview template={template} />;
}

function RoomTemplatePreview({ content }: { content: RoomTemplateContentJson }) {
  return (
    <div className="template-preview">
      <h4>Room Configuration</h4>
      <dl className="template-preview-grid">
        <dt>Room Type</dt>
        <dd>{content.roomType}</dd>
        <dt>Dimensions</dt>
        <dd>{content.width}' × {content.length}' × {content.ceilingHeight}' H</dd>
        <dt>Platform</dt>
        <dd>{content.platform}</dd>
        <dt>Ecosystem</dt>
        <dd>{content.ecosystem}</dd>
        <dt>Tier</dt>
        <dd>{content.tier}</dd>
      </dl>

      {content.equipment && content.equipment.length > 0 && (
        <>
          <h4>Equipment ({content.equipment.length} items)</h4>
          <ul className="template-preview-list">
            {content.equipment.map(eq => (
              <li key={eq.id}>
                {eq.label || eq.equipmentId}
                <span className="text-secondary"> ({eq.mountType})</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {content.connections && content.connections.length > 0 && (
        <p className="template-preview-note">
          Includes {content.connections.length} cable connection(s)
        </p>
      )}
    </div>
  );
}

function EquipmentPackagePreview({ content }: { content: EquipmentPackageContentJson }) {
  return (
    <div className="template-preview">
      <h4>Equipment Package</h4>
      <ul className="template-preview-list">
        {content.equipment.map((eq, i) => (
          <li key={i}>
            {eq.equipmentId} × {eq.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}

function GenericPreview({ template }: { template: Template }) {
  return (
    <div className="template-preview">
      <p className="text-secondary">
        {template.description || 'No preview available for this template type.'}
      </p>
    </div>
  );
}
```

**Step 2: Add preview styles**

Add to `src/styles/features/templates.css`:

```css
.template-preview {
  margin-top: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.template-preview h4 {
  margin-bottom: var(--spacing-3);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-primary);
}

.template-preview-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--spacing-2) var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.template-preview-grid dt {
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
}

.template-preview-grid dd {
  color: var(--color-text-primary);
  font-size: var(--text-sm);
}

.template-preview-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.template-preview-list li {
  padding: var(--spacing-2) 0;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-sm);
}

.template-preview-list li:last-child {
  border-bottom: none;
}

.template-preview-note {
  margin-top: var(--spacing-3);
  font-size: var(--text-xs);
  color: var(--color-text-tertiary);
}
```

**Step 3: Add preview to ApplyTemplateModal**

In `ApplyTemplateModal.tsx`:

```typescript
import { TemplatePreview } from './TemplatePreview';

// In the modal body, add:
{selectedTemplate && (
  <TemplatePreview template={selectedTemplate} />
)}
```

**Step 4: Run tests**

Run: `npm test -- --run`
Expected: Tests pass

**Step 5: Commit**

```bash
git add src/features/templates/components/TemplatePreview.tsx \
  src/features/templates/components/ApplyTemplateModal.tsx \
  src/styles/features/templates.css
git commit -m "feat: add template content preview in apply modal"
```

---

## Phase 4: Equipment Import Completion

### Task 18: Add Excel Support

**Files:**
- Modify: `src/features/equipment/import-service.ts`
- Modify: `package.json`

**Step 1: Install xlsx package**

Run: `npm install xlsx`

**Step 2: Add Excel parsing to import-service**

```typescript
import * as XLSX from 'xlsx';

export async function parseFile(file: File): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'csv':
      return parseCSV(await file.text());
    case 'xlsx':
    case 'xls':
      return parseExcel(file);
    default:
      throw new ImportError(`Unsupported file format: .${extension}. Use .csv or .xlsx`);
  }
}

async function parseExcel(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new ImportError('Excel file has no sheets');
  }

  const sheet = workbook.Sheets[firstSheetName];
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    header: 1,
    defval: '',
  });

  if (data.length < 2) {
    throw new ImportError('Excel file must have headers and at least one data row');
  }

  const headers = (data[0] as string[]).map(h => String(h).trim());
  const rows = data.slice(1).map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = String((row as unknown[])[i] ?? '').trim();
    });
    return obj;
  });

  return { headers, rows };
}
```

**Step 3: Run tests**

Run: `npm test -- --run`
Expected: Tests pass

**Step 4: Commit**

```bash
git add src/features/equipment/import-service.ts package.json package-lock.json
git commit -m "feat: add Excel file support to equipment import"
```

---

### Task 19: Enhanced Import Error Display

**Files:**
- Modify: `src/features/equipment/components/import/ImportPreview.tsx`

**Step 1: Add per-row error display**

Update ImportPreview to show validation errors inline:

```typescript
interface ImportPreviewProps {
  rows: ImportRow[];
  errors: Map<number, string[]>;
  onFixRow: (index: number) => void;
}

export function ImportPreview({ rows, errors, onFixRow }: ImportPreviewProps) {
  const errorCount = errors.size;
  const validCount = rows.length - errorCount;

  return (
    <div className="import-preview">
      <div className="import-summary">
        <span className="import-valid">{validCount} valid</span>
        {errorCount > 0 && (
          <span className="import-errors">{errorCount} with errors</span>
        )}
      </div>

      <table className="import-table">
        <thead>
          <tr>
            <th>Row</th>
            <th>Manufacturer</th>
            <th>Model</th>
            <th>SKU</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const rowErrors = errors.get(index);
            const hasErrors = rowErrors && rowErrors.length > 0;

            return (
              <tr key={index} className={hasErrors ? 'row-error' : ''}>
                <td>{index + 1}</td>
                <td>{row.manufacturer}</td>
                <td>{row.model}</td>
                <td>{row.sku}</td>
                <td>
                  {hasErrors ? (
                    <span className="error-badge" title={rowErrors.join(', ')}>
                      {rowErrors.length} error(s)
                    </span>
                  ) : (
                    <span className="valid-badge">Valid</span>
                  )}
                </td>
                <td>
                  {hasErrors && (
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => onFixRow(index)}
                    >
                      Fix
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

**Step 2: Add import preview styles**

Add to `src/styles/features/equipment-import.css`:

```css
.import-summary {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.import-valid {
  color: var(--color-status-success);
}

.import-errors {
  color: var(--color-status-error);
}

.import-table {
  width: 100%;
  border-collapse: collapse;
}

.import-table th,
.import-table td {
  padding: var(--spacing-2) var(--spacing-3);
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

.import-table .row-error {
  background: rgba(239, 68, 68, 0.1);
}

.error-badge {
  display: inline-block;
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-status-error);
  color: white;
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
}

.valid-badge {
  color: var(--color-status-success);
  font-size: var(--text-sm);
}
```

**Step 3: Run tests**

Run: `npm test -- --run`
Expected: Tests pass

**Step 4: Commit**

```bash
git add src/features/equipment/components/import/ImportPreview.tsx \
  src/styles/features/equipment-import.css
git commit -m "feat: add enhanced error display in equipment import preview"
```

---

## Phase 5: Notifications Completion

### Task 20: Email Templates

**Files:**
- Create: `supabase/functions/create-notification/templates/base.ts`
- Modify: `supabase/functions/create-notification/index.ts`

**Step 1: Create email template helper**

Create `supabase/functions/create-notification/templates/base.ts`:

```typescript
interface EmailTemplateData {
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  organizationName: string;
  unsubscribeUrl: string;
}

export function renderEmailTemplate(data: EmailTemplateData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.title)}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #0D1421; padding: 24px; text-align: center; }
    .header img { height: 32px; }
    .header h1 { color: #C9A227; font-size: 20px; margin: 16px 0 0; }
    .content { background: #151D2E; padding: 32px; color: #FFFFFF; }
    .content h2 { margin: 0 0 16px; font-size: 18px; }
    .content p { margin: 0 0 16px; line-height: 1.6; color: #B8C1CC; }
    .button { display: inline-block; padding: 12px 24px; background: #C9A227; color: #0D1421; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .footer { background: #0D1421; padding: 24px; text-align: center; }
    .footer p { margin: 0 0 8px; font-size: 12px; color: #8B95A5; }
    .footer a { color: #8B95A5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AV Designer</h1>
    </div>
    <div class="content">
      <h2>${escapeHtml(data.title)}</h2>
      <p>${escapeHtml(data.message)}</p>
      ${data.actionUrl ? `<p><a href="${escapeHtml(data.actionUrl)}" class="button">${escapeHtml(data.actionText || 'View Details')}</a></p>` : ''}
    </div>
    <div class="footer">
      <p>You're receiving this because you're a member of ${escapeHtml(data.organizationName)}.</p>
      <p><a href="${escapeHtml(data.unsubscribeUrl)}">Unsubscribe</a> from these notifications.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

function escapeHtml(text: string): string {
  const escapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, char => escapes[char] || char);
}
```

**Step 2: Update edge function to use template**

In `supabase/functions/create-notification/index.ts`, import and use the template:

```typescript
import { renderEmailTemplate } from './templates/base.ts';

// In the email sending section:
const html = renderEmailTemplate({
  title: notification.title,
  message: notification.message,
  actionUrl: notification.actionUrl,
  actionText: notification.actionText,
  organizationName: orgName,
  unsubscribeUrl: `${appUrl}/settings/notifications?unsubscribe=${userId}`,
});

await resend.emails.send({
  from: 'AV Designer <notifications@avdesigner.app>',
  to: email,
  subject: notification.title,
  html,
});
```

**Step 3: Commit**

```bash
git add supabase/functions/create-notification/
git commit -m "feat: add HTML email templates for notifications"
```

---

### Task 21: Notification Delivery Log

**Files:**
- Create: `supabase/migrations/012_notification_delivery_log.sql`

**Step 1: Create migration**

Create `supabase/migrations/012_notification_delivery_log.sql`:

```sql
-- Notification Delivery Log
-- Tracks email send attempts and delivery status

CREATE TABLE IF NOT EXISTS notification_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'in_app', 'push')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'bounced', 'failed')),
  external_id TEXT,
  error_message TEXT,
  attempts INTEGER DEFAULT 1,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_delivery_log_notification ON notification_delivery_log(notification_id);
CREATE INDEX idx_delivery_log_recipient ON notification_delivery_log(recipient_id);
CREATE INDEX idx_delivery_log_status ON notification_delivery_log(status);
CREATE INDEX idx_delivery_log_created ON notification_delivery_log(created_at DESC);

-- RLS
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own delivery logs
CREATE POLICY "Users can view own delivery logs"
  ON notification_delivery_log FOR SELECT
  USING (recipient_id = auth.uid());

-- Service role can manage all logs
CREATE POLICY "Service role full access"
  ON notification_delivery_log FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_notification_delivery_log_updated_at
  BEFORE UPDATE ON notification_delivery_log
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Step 2: Commit**

```bash
git add supabase/migrations/012_notification_delivery_log.sql
git commit -m "feat: add notification delivery log migration"
```

---

### Task 22: Email Retry Logic

**Files:**
- Modify: `supabase/functions/create-notification/index.ts`

**Step 1: Add retry logic**

```typescript
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 5000, 30000]; // 1s, 5s, 30s

async function sendEmailWithRetry(
  supabaseClient: SupabaseClient,
  notificationId: string,
  recipientId: string,
  recipientEmail: string,
  subject: string,
  html: string,
): Promise<boolean> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await resend.emails.send({
        from: 'AV Designer <notifications@avdesigner.app>',
        to: recipientEmail,
        subject,
        html,
      });

      // Log success
      await supabaseClient.from('notification_delivery_log').insert({
        notification_id: notificationId,
        recipient_id: recipientId,
        recipient_email: recipientEmail,
        channel: 'email',
        status: 'sent',
        external_id: result.id,
        attempts: attempt + 1,
        sent_at: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      lastError = error as Error;

      // Log attempt failure
      await supabaseClient.from('notification_delivery_log').insert({
        notification_id: notificationId,
        recipient_id: recipientId,
        recipient_email: recipientEmail,
        channel: 'email',
        status: attempt < MAX_RETRIES - 1 ? 'pending' : 'failed',
        error_message: lastError.message,
        attempts: attempt + 1,
      });

      if (attempt < MAX_RETRIES - 1) {
        await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]));
      }
    }
  }

  console.error(`Failed to send email after ${MAX_RETRIES} attempts:`, lastError);
  return false;
}
```

**Step 2: Commit**

```bash
git add supabase/functions/create-notification/index.ts
git commit -m "feat: add retry logic with exponential backoff for email delivery"
```

---

## Phase 6: Final Integration

### Task 23: Run Full Test Suite

**Step 1: Run all tests**

Run: `npm test -- --run`

**Step 2: Fix any failing tests**

Address any test failures that arise from the changes.

**Step 3: Run linter**

Run: `npm run lint`

**Step 4: Fix any lint errors**

Address any linting issues.

**Step 5: Commit fixes**

```bash
git add .
git commit -m "fix: address test and lint issues from implementation"
```

---

### Task 24: Update Architecture Documentation

**Files:**
- Modify: `ARCHITECTURE.md`

**Step 1: Update the architecture document**

Add sections for:
- OAuth authentication flow
- Email notification system
- Type-safe database mappers

**Step 2: Update implementation status**

Mark completed items and add new capabilities.

**Step 3: Commit**

```bash
git add ARCHITECTURE.md
git commit -m "docs: update architecture with new features and patterns"
```

---

### Task 25: Create PR

**Step 1: Push branch**

Run: `git push -u origin feature/full-functionality`

**Step 2: Create pull request**

```bash
gh pr create --title "feat: Full Functionality Implementation" --body "$(cat <<'EOF'
## Summary
- Environment validation with clear error messages
- OAuth integration (Google + Microsoft)
- Error boundaries for graceful error handling
- Type-safe database mappers replacing unsafe casts
- Template apply with connection restoration and preview
- Equipment import with Excel support
- Notification email templates with retry logic

## Test plan
- [ ] Run full test suite: `npm test`
- [ ] Test OAuth flow with Google
- [ ] Test OAuth flow with Microsoft
- [ ] Test template apply with equipment connections
- [ ] Test Excel file import
- [ ] Verify email delivery with retry

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Checkpoint Summary

| Phase | Tasks | Key Deliverables |
|-------|-------|------------------|
| 1: Infrastructure | 1-9 | Env validation, logging, error boundaries, OAuth, seed data |
| 2: Type Safety | 10-14 | JSON types, mappers, service updates |
| 3: Templates | 15-17 | Mount type fix, connections, preview |
| 4: Import | 18-19 | Excel support, error display |
| 5: Notifications | 20-22 | Email templates, delivery log, retry |
| 6: Final | 23-25 | Tests, docs, PR |

**Total: 25 tasks across 6 phases**
