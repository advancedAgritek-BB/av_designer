/**
 * Account Settings Component
 *
 * User profile, password, 2FA, and connected accounts
 */

import { useEffect, useMemo, useState } from 'react';
import { Button, Modal, ModalFooter } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/auth-store';
import type {
  Factor,
  Provider,
  User as SupabaseUser,
  UserIdentity,
} from '@supabase/supabase-js';

interface AccountSettingsProps {
  userId: string;
}

const CONNECTED_PROVIDERS = [
  {
    id: 'azure',
    name: 'Microsoft',
    description: 'Sign in with Microsoft',
    badge: {
      text: 'M',
      className: 'bg-[#00A4EF] text-white',
    },
  },
  {
    id: 'google',
    name: 'Google',
    description: 'Sign in with Google',
    badge: {
      text: '',
      className: 'bg-white text-text-primary',
    },
  },
] as const;

type ProviderId = (typeof CONNECTED_PROVIDERS)[number]['id'];

function getIdentityLabel(identity?: UserIdentity | null) {
  if (!identity?.identity_data) return 'Connected';
  const identityData = identity.identity_data as Record<string, unknown>;
  return (
    (identityData.email as string) ||
    (identityData.preferred_username as string) ||
    (identityData.name as string) ||
    'Connected'
  );
}

export function AccountSettings({ userId }: AccountSettingsProps) {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const refreshUser = useAuthStore((state) => state.refreshUser);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarInput, setAvatarInput] = useState('');
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);

  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [emailSaving, setEmailSaving] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [mfaFactors, setMfaFactors] = useState<Factor[]>([]);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaEnrollState, setMfaEnrollState] = useState<{
    factorId: string;
    qrCode: string;
    secret: string;
  } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaStatus, setMfaStatus] = useState<string | null>(null);
  const [mfaSaving, setMfaSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSaving, setDeleteSaving] = useState(false);

  const providerIdentities = useMemo(() => {
    const identities = authUser?.identities ?? [];
    return new Map(identities.map((identity) => [identity.provider, identity]));
  }, [authUser]);

  const isMfaEnabled = mfaFactors.length > 0;

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName ?? '');
    setPhone(user.phone ?? '');
    setJobTitle(user.jobTitle ?? '');
    setAvatarInput(user.avatarUrl ?? '');
  }, [user]);

  useEffect(() => {
    if (!userId) return;
    const loadAuthContext = async () => {
      setAuthLoading(true);
      setAuthError(null);

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        setAuthError(userError.message);
      }
      setAuthUser(userData.user ?? null);

      const { data: factorData, error: factorError } =
        await supabase.auth.mfa.listFactors();
      if (factorError) {
        setAuthError(factorError.message);
      }
      setMfaFactors(factorData?.totp ?? []);

      setAuthLoading(false);
    };

    loadAuthContext();
  }, [userId]);

  useEffect(() => {
    if (!showMfaModal || mfaEnrollState) return;

    const startEnrollment = async () => {
      setMfaSaving(true);
      setMfaError(null);
      setMfaStatus(null);

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'AV Designer',
        issuer: 'AV Designer',
      });

      if (error) {
        setMfaError(error.message);
        setMfaSaving(false);
        return;
      }

      setMfaEnrollState({
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      });
      setMfaSaving(false);
    };

    startEnrollment();
  }, [showMfaModal, mfaEnrollState]);

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-bg-tertiary rounded-lg animate-pulse" />
        <div className="h-24 bg-bg-tertiary rounded-lg animate-pulse" />
      </div>
    );
  }

  const displayEmail = authUser?.email ?? user.email;
  const pendingEmail = authUser?.new_email;

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileError(null);
    setProfileStatus(null);
    try {
      await updateProfile({
        fullName: fullName.trim() || null,
        phone: phone.trim() || null,
        jobTitle: jobTitle.trim() || null,
      });
      setProfileStatus('Profile updated successfully.');
      setIsEditing(false);
    } catch (error) {
      setProfileError(
        error instanceof Error ? error.message : 'Failed to update profile'
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handleProfileCancel = () => {
    setFullName(user.fullName ?? '');
    setPhone(user.phone ?? '');
    setJobTitle(user.jobTitle ?? '');
    setIsEditing(false);
    setProfileError(null);
    setProfileStatus(null);
  };

  const handleAvatarSave = async () => {
    setAvatarSaving(true);
    setAvatarError(null);
    try {
      await updateProfile({ avatarUrl: avatarInput.trim() || null });
      setShowAvatarModal(false);
    } catch (error) {
      setAvatarError(error instanceof Error ? error.message : 'Failed to update avatar');
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleEmailUpdate = async () => {
    setEmailSaving(true);
    setEmailError(null);
    setEmailStatus(null);
    const nextEmail = emailInput.trim().toLowerCase();

    if (!nextEmail) {
      setEmailError('Email is required.');
      setEmailSaving(false);
      return;
    }

    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailPattern.test(nextEmail)) {
      setEmailError('Enter a valid email address.');
      setEmailSaving(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.updateUser({ email: nextEmail });
      if (error) throw error;

      if (data.user?.email === nextEmail) {
        const { error: profileError } = await supabase
          .from('users')
          .update({ email: nextEmail, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (profileError) throw profileError;
        await refreshUser();
        setEmailStatus('Email updated successfully.');
      } else {
        setEmailStatus(
          `Check ${data.user?.new_email ?? nextEmail} to confirm the change.`
        );
      }

      const { data: refreshed } = await supabase.auth.getUser();
      setAuthUser(refreshed.user ?? null);
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : 'Failed to update email');
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordStatus(null);

    if (passwordInput.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      setPasswordSaving(false);
      return;
    }

    if (passwordInput !== passwordConfirm) {
      setPasswordError('Passwords do not match.');
      setPasswordSaving(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: passwordInput });
      if (error) throw error;
      setPasswordStatus('Password updated successfully.');
      setPasswordInput('');
      setPasswordConfirm('');
      setShowPasswordModal(false);
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : 'Failed to update password'
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleMfaVerify = async () => {
    if (!mfaEnrollState) return;
    setMfaSaving(true);
    setMfaError(null);
    setMfaStatus(null);

    try {
      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId: mfaEnrollState.factorId,
        });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaEnrollState.factorId,
        challengeId: challenge.id,
        code: mfaCode,
      });
      if (verifyError) throw verifyError;

      const { data: factorData } = await supabase.auth.mfa.listFactors();
      setMfaFactors(factorData?.totp ?? []);
      setMfaStatus('Two-factor authentication enabled.');
      setShowMfaModal(false);
      setMfaEnrollState(null);
      setMfaCode('');
    } catch (error) {
      setMfaError(error instanceof Error ? error.message : 'Failed to verify MFA code');
    } finally {
      setMfaSaving(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!mfaFactors[0]) return;
    setMfaSaving(true);
    setMfaError(null);
    setMfaStatus(null);

    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: mfaFactors[0].id,
      });
      if (error) throw error;

      const { data: factorData } = await supabase.auth.mfa.listFactors();
      setMfaFactors(factorData?.totp ?? []);
      setMfaStatus('Two-factor authentication disabled.');
    } catch (error) {
      setMfaError(error instanceof Error ? error.message : 'Failed to disable MFA');
    } finally {
      setMfaSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteSaving(true);
    setDeleteError(null);
    try {
      const { error } = await supabase.functions.invoke('delete-account', {
        body: { user_id: userId },
      });
      if (error) throw error;
      await supabase.auth.signOut();
      window.location.href = '/#/login';
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setDeleteSaving(false);
    }
  };

  const handleConnect = async (providerId: ProviderId) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.linkIdentity({
      provider: providerId as Provider,
      options: {
        redirectTo: window.location.origin,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      setAuthError(error.message);
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  };

  const handleDisconnect = async (providerId: ProviderId) => {
    const identity = providerIdentities.get(providerId);
    if (!identity) return;

    const { error } = await supabase.auth.unlinkIdentity(identity);
    if (error) {
      setAuthError(error.message);
      return;
    }

    const { data: refreshed } = await supabase.auth.getUser();
    setAuthUser(refreshed.user ?? null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Account</h2>
        <p className="text-sm text-text-secondary mt-1">
          Manage your profile and account settings
        </p>
      </div>

      {/* Profile Section */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">Profile</h3>

        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={`${user.fullName ?? user.email} avatar`}
                className="size-20 rounded-full object-cover border border-border"
              />
            ) : (
              <div className="size-20 rounded-full bg-bg-tertiary flex items-center justify-center text-2xl text-text-tertiary">
                {fullName ? fullName[0].toUpperCase() : 'U'}
              </div>
            )}
            <button
              type="button"
              className="mt-2 text-xs text-accent-gold hover:underline"
              onClick={() => setShowAvatarModal(true)}
            >
              Change photo
            </button>
          </div>

          {/* Form fields */}
          <div className="flex-1 space-y-4">
            <div className="form-field">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-text-secondary"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                className="settings-input"
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-field">
              <label htmlFor="email" className="text-sm font-medium text-text-secondary">
                Email
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="email"
                  type="email"
                  value={displayEmail ?? ''}
                  disabled
                  className="settings-input flex-1"
                />
                <button
                  type="button"
                  className="text-sm text-accent-gold hover:underline whitespace-nowrap"
                  onClick={() => {
                    setEmailInput(displayEmail ?? '');
                    setEmailError(null);
                    setEmailStatus(null);
                    setShowEmailModal(true);
                  }}
                >
                  Change email
                </button>
              </div>
              {pendingEmail && (
                <p className="text-xs text-text-tertiary mt-2">
                  Pending confirmation: {pendingEmail}
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="phone" className="text-sm font-medium text-text-secondary">
                Phone (optional)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
                className="settings-input"
                placeholder="+1 555-123-4567"
              />
            </div>

            <div className="form-field">
              <label
                htmlFor="jobTitle"
                className="text-sm font-medium text-text-secondary"
              >
                Job Title (optional)
              </label>
              <input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={!isEditing}
                className="settings-input"
                placeholder="AV Designer"
              />
            </div>

            {(profileError || profileStatus) && (
              <p className={`text-sm ${profileError ? 'text-error' : 'text-green-500'}`}>
                {profileError ?? profileStatus}
              </p>
            )}

            <div className="pt-2">
              {isEditing ? (
                <div className="flex gap-2">
                  <Button onClick={handleProfileSave} disabled={profileSaving}>
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="secondary" onClick={handleProfileCancel}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">Security</h3>

        <div className="space-y-4">
          {/* Password */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-text-primary">Password</p>
              <p className="text-xs text-text-tertiary">Update your password regularly</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPasswordModal(true)}
            >
              Change password
            </Button>
          </div>

          {/* 2FA */}
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-text-primary">
                Two-Factor Authentication
              </p>
              <p className="text-xs text-text-tertiary">
                {isMfaEnabled ? 'Enabled' : 'Not enabled'}
              </p>
            </div>
            {isMfaEnabled ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDisableMfa}
                disabled={mfaSaving}
              >
                Disable 2FA
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setMfaEnrollState(null);
                  setMfaCode('');
                  setMfaError(null);
                  setMfaStatus(null);
                  setShowMfaModal(true);
                }}
              >
                Enable 2FA
              </Button>
            )}
          </div>
          {(mfaError || mfaStatus) && (
            <p className={`text-sm ${mfaError ? 'text-error' : 'text-green-500'}`}>
              {mfaError ?? mfaStatus}
            </p>
          )}
        </div>
      </section>

      {/* Connected Accounts Section */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">Connected Accounts</h3>
        {authError && <p className="text-sm text-error mb-4">{authError}</p>}

        <div className="space-y-3">
          {CONNECTED_PROVIDERS.map((provider) => {
            const identity = providerIdentities.get(provider.id);
            const isConnected = Boolean(identity);

            return (
              <div
                key={provider.id}
                className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-8 rounded flex items-center justify-center text-xs font-bold ${provider.badge.className}`}
                  >
                    {provider.id === 'google' ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    ) : (
                      provider.badge.text
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {provider.name}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {isConnected ? getIdentityLabel(identity) : provider.description}
                    </p>
                  </div>
                </div>
                {isConnected ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDisconnect(provider.id)}
                    disabled={authLoading}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleConnect(provider.id)}
                    disabled={authLoading}
                  >
                    Connect
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="settings-section border-error/20">
        <h3 className="text-sm font-medium text-error mb-4">Danger Zone</h3>
        <p className="text-sm text-text-secondary mb-4">
          Permanently delete your account and all associated data. This action cannot be
          undone.
        </p>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          Delete Account
        </Button>
      </section>

      {/* Avatar Modal */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        title="Update Avatar"
        description="Add a public image URL for your profile avatar."
        size="sm"
      >
        <div className="space-y-3">
          <label htmlFor="avatarUrl" className="block text-sm text-text-secondary">
            Image URL
          </label>
          <input
            id="avatarUrl"
            type="url"
            value={avatarInput}
            onChange={(e) => setAvatarInput(e.target.value)}
            className="settings-input"
            placeholder="https://example.com/avatar.png"
          />
          {avatarError && <p className="text-sm text-error">{avatarError}</p>}
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowAvatarModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleAvatarSave} disabled={avatarSaving}>
            {avatarSaving ? 'Saving...' : 'Save'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Email Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title="Change Email"
        description="We will send a confirmation link to your new address."
        size="sm"
      >
        <div className="space-y-3">
          <label htmlFor="newEmail" className="block text-sm text-text-secondary">
            New email
          </label>
          <input
            id="newEmail"
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="settings-input"
            placeholder="you@company.com"
          />
          {emailError && <p className="text-sm text-error">{emailError}</p>}
          {emailStatus && <p className="text-sm text-green-500">{emailStatus}</p>}
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleEmailUpdate} disabled={emailSaving}>
            {emailSaving ? 'Sending...' : 'Update Email'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        description="Use at least 8 characters."
        size="sm"
      >
        <div className="space-y-3">
          <label htmlFor="newPassword" className="block text-sm text-text-secondary">
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="settings-input"
            placeholder="Enter a new password"
          />

          <label htmlFor="confirmPassword" className="block text-sm text-text-secondary">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="settings-input"
            placeholder="Re-enter new password"
          />

          {passwordError && <p className="text-sm text-error">{passwordError}</p>}
          {passwordStatus && <p className="text-sm text-green-500">{passwordStatus}</p>}
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
            Cancel
          </Button>
          <Button onClick={handlePasswordUpdate} disabled={passwordSaving}>
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* MFA Modal */}
      <Modal
        isOpen={showMfaModal}
        onClose={() => {
          setShowMfaModal(false);
          setMfaEnrollState(null);
        }}
        title="Enable Two-Factor Authentication"
        description="Scan the QR code with your authenticator app."
        size="sm"
      >
        {mfaSaving && !mfaEnrollState ? (
          <div className="space-y-3">
            <div className="h-28 bg-bg-tertiary rounded-lg animate-pulse" />
            <p className="text-sm text-text-secondary">Preparing your QR code...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mfaEnrollState && (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={`data:image/svg+xml;utf-8,${encodeURIComponent(mfaEnrollState.qrCode)}`}
                  alt="MFA QR code"
                  className="size-36 bg-white rounded-lg p-2"
                />
                <div className="text-center">
                  <p className="text-xs text-text-tertiary">Manual code</p>
                  <p className="text-sm font-mono text-text-primary">
                    {mfaEnrollState.secret}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="mfaCode" className="block text-sm text-text-secondary mb-1">
                Verification code
              </label>
              <input
                id="mfaCode"
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="settings-input"
                placeholder="Enter 6-digit code"
              />
            </div>

            {mfaError && <p className="text-sm text-error">{mfaError}</p>}
            {mfaStatus && <p className="text-sm text-green-500">{mfaStatus}</p>}
          </div>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowMfaModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleMfaVerify}
            disabled={!mfaEnrollState || !mfaCode || mfaSaving}
          >
            {mfaSaving ? 'Verifying...' : 'Verify'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        description="This action permanently deletes your account and cannot be undone."
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Make sure you have exported any data you want to keep. If you are an
            organization owner, you must transfer ownership before deleting your account.
          </p>
          {deleteError && <p className="text-sm text-error">{deleteError}</p>}
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAccount} disabled={deleteSaving}>
            {deleteSaving ? 'Deleting...' : 'Delete Account'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
