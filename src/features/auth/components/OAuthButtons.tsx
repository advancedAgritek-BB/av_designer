/**
 * OAuth Buttons Component
 *
 * Provides Google and Microsoft OAuth sign-in buttons with loading and error states.
 */

import { useState } from 'react';
import { AuthService } from '../auth-service';
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
        await AuthService.signInWithGoogle();
      } else {
        await AuthService.signInWithMicrosoft();
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
