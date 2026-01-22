/**
 * Signup Page Component
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth-store';
import { SignupForm } from './SignupForm';
import { OAuthButtons } from './OAuthButtons';
import { supabase } from '@/lib/supabase';
import { getSupabaseEnvInfo } from '@/lib/supabase-env';
import type { SignUpData } from '../auth-types';

export function SignupPage() {
  const navigate = useNavigate();
  const signUp = useAuthStore((state) => state.signUp);
  const isLoading = useAuthStore((state) => state.isLoading);
  const envInfo = getSupabaseEnvInfo();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: SignUpData) => {
    try {
      setError(null);
      await signUp(data);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        navigate('/', { replace: true });
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <h1 className="text-balance">Check your email</h1>
            <p className="text-pretty">
              We've sent you a confirmation link. Please check your email to verify your
              account.
            </p>
            {envInfo.isLocal && envInfo.mailpitUrl && (
              <p className="auth-meta-hint">
                Local dev inbox:{' '}
                <a
                  className="auth-meta-link"
                  href={envInfo.mailpitUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {envInfo.mailpitUrl}
                </a>
              </p>
            )}
          </div>

          <div className="auth-footer">
            <p>
              Already verified?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="text-balance">Create your account</h1>
          <p className="text-pretty">
            Start designing AV systems with professional tools
          </p>
        </div>

        <div className="auth-meta" aria-label="Backend connection">
          <div className="auth-meta-row">
            <span className="auth-meta-label">Backend</span>
            <span className="auth-meta-value">
              {envInfo.isLocal ? 'Local Supabase' : 'Supabase'}
              {envInfo.host ? ` (${envInfo.host})` : ''}
            </span>
          </div>
          {envInfo.isLocal && envInfo.mailpitUrl && (
            <div className="auth-meta-hint">
              Emails go to{' '}
              <a
                className="auth-meta-link"
                href={envInfo.mailpitUrl}
                target="_blank"
                rel="noreferrer"
              >
                Mailpit
              </a>
              .
            </div>
          )}
        </div>

        <OAuthButtons disabled={isLoading} />

        <div className="auth-divider">
          <span>or sign up with email</span>
        </div>

        <SignupForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
