/**
 * Auth Callback Page
 *
 * Handles OAuth redirect callbacks from Supabase Auth.
 */

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1 className="text-balance">Authentication Failed</h1>
            <p className="text-pretty">{error}</p>
          </div>

          <Link to={ROUTES.LOGIN} className="btn btn-primary btn-full">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-loading">
      <div className="auth-spinner" aria-hidden="true" />
      <p className="text-text-secondary">Completing sign in...</p>
    </div>
  );
}
