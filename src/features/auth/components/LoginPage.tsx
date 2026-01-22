/**
 * Login Page Component
 */

import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../auth-store';
import { LoginForm } from './LoginForm';
import { OAuthButtons } from './OAuthButtons';
import { getSupabaseEnvInfo } from '@/lib/supabase-env';
import type { SignInData } from '../auth-types';

function formatSignInError(
  raw: string,
  opts: { isLocal: boolean; mailpitUrl?: string | null }
) {
  const message = raw.trim();
  const lower = message.toLowerCase();

  if (lower.includes('invalid login credentials')) {
    if (opts.isLocal) {
      return "Invalid login credentials. You're connected to local Supabase—create a local account with \"Sign up\" (production accounts won't work here).";
    }
    return "Invalid login credentials. Double-check your email/password and confirm you're using the correct Supabase project.";
  }

  if (lower.includes('email not confirmed')) {
    if (opts.isLocal && opts.mailpitUrl) {
      return `Email not confirmed. Open ${opts.mailpitUrl} to confirm, then try again.`;
    }
    return 'Email not confirmed. Confirm your email, then try again.';
  }

  return message || 'Sign in failed';
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const signIn = useAuthStore((state) => state.signIn);
  const isLoading = useAuthStore((state) => state.isLoading);
  const envInfo = getSupabaseEnvInfo();
  const [error, setError] = useState<string | null>(null);

  // Get the redirect path from location state, or default to home
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (data: SignInData) => {
    try {
      setError(null);
      await signIn(data);
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(
        formatSignInError(message, {
          isLocal: envInfo.isLocal,
          mailpitUrl: envInfo.mailpitUrl,
        })
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="text-balance">Welcome back</h1>
          <p className="text-pretty">Sign in to your account to continue</p>
        </div>

        <div className="auth-meta" aria-label="Backend connection">
          <div className="auth-meta-row">
            <span className="auth-meta-label">Backend</span>
            <span className="auth-meta-value">
              {envInfo.isLocal ? 'Local Supabase' : 'Supabase'}
              {envInfo.host ? ` (${envInfo.host})` : ''}
            </span>
          </div>
        </div>

        <OAuthButtons disabled={isLoading} />

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
