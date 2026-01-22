/**
 * Login Form Component
 */

import { useState } from 'react';
import type { SignInData } from '../auth-types';

interface LoginFormProps {
  onSubmit: (data: SignInData) => Promise<void> | void;
  isLoading?: boolean;
  error?: string | null;
}

export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }

    if (!password) {
      setValidationError('Password is required');
      return;
    }

    await onSubmit({ email: email.trim(), password });
  };

  const displayError = validationError || error;

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-field">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>

      <div className="form-field">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="current-password"
          placeholder="Enter your password"
        />
      </div>

      {displayError && (
        <div className="form-error" role="alert">
          {displayError}
        </div>
      )}

      <button type="submit" disabled={isLoading} className="btn btn-primary btn-full">
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  );
}
