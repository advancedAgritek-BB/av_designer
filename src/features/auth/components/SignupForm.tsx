/**
 * Signup Form Component
 */

import { useState } from 'react';
import type { SignUpData } from '../auth-types';

interface SignupFormProps {
  onSubmit: (data: SignUpData) => Promise<void> | void;
  isLoading?: boolean;
  error?: string | null;
}

export function SignupForm({ onSubmit, isLoading = false, error }: SignupFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!fullName.trim()) {
      setValidationError('Name is required');
      return;
    }

    if (!email.trim()) {
      setValidationError('Email is required');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    await onSubmit({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
    });
  };

  const displayError = validationError || error;

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <div className="form-field">
        <label htmlFor="signup-name">Full name</label>
        <input
          id="signup-name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isLoading}
          autoComplete="name"
          placeholder="Your full name"
        />
      </div>

      <div className="form-field">
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          autoComplete="email"
          placeholder="you@example.com"
        />
      </div>

      <div className="form-field">
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
      </div>

      <div className="form-field">
        <label htmlFor="signup-confirm-password">Confirm password</label>
        <input
          id="signup-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="new-password"
          placeholder="Confirm your password"
        />
      </div>

      {displayError && (
        <div className="form-error" role="alert">
          {displayError}
        </div>
      )}

      <button type="submit" disabled={isLoading} className="btn btn-primary btn-full">
        {isLoading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}
