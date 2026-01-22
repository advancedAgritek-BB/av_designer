/**
 * Organization Settings Component
 *
 * Admin-only org profile, branding, and member management
 */

import { useEffect, useMemo, useState } from 'react';
import { Button, Modal, ModalFooter } from '@/components/ui';
import { useCurrentOrg, useCurrentUser } from '@/features/auth/use-auth';
import { useAuthStore } from '@/features/auth/auth-store';
import {
  useOrganization,
  useOrganizationMembers,
  useInviteOrganizationMember,
  useUpdateOrganizationMemberRole,
  useRemoveOrganizationMember,
} from '@/features/auth/use-organizations';
import type { OrgRole, OrganizationMember } from '@/features/auth/auth-types';
import { useOrgSettings, useUpdateOrgSettings } from '../use-settings';

interface OrganizationSettingsProps {
  orgId: string;
}

/**
 * Color picker component
 */
function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-text-secondary mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-10 rounded border border-border cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="settings-input flex-1"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

function getMemberLabel(member: OrganizationMember) {
  if (member.user?.fullName) return member.user.fullName;
  return member.user?.email ?? 'Unknown member';
}

export function OrganizationSettings({ orgId }: OrganizationSettingsProps) {
  const { currentOrg } = useCurrentOrg();
  const { user } = useCurrentUser();
  const updateOrganization = useAuthStore((state) => state.updateOrganization);
  const { data: orgSettings, isLoading: settingsLoading } = useOrgSettings(orgId);
  const updateOrgSettingsMutation = useUpdateOrgSettings();
  const { data: organization } = useOrganization(orgId);
  const { data: members = [], isLoading: membersLoading } = useOrganizationMembers(orgId);
  const inviteMemberMutation = useInviteOrganizationMember();
  const updateMemberRoleMutation = useUpdateOrganizationMemberRole();
  const removeMemberMutation = useRemoveOrganizationMember();

  const org = organization ?? currentOrg;

  // Local state for form
  const [orgName, setOrgName] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgLogoUrl, setOrgLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#C9A227');
  const [secondaryColor, setSecondaryColor] = useState('#0D1421');
  const [footerText, setFooterText] = useState('');
  const [logoOnQuotes, setLogoOnQuotes] = useState(true);
  const [logoOnDrawings, setLogoOnDrawings] = useState(true);
  const [logoOnPdfs, setLogoOnPdfs] = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [showLogoModal, setShowLogoModal] = useState(false);
  const [logoInput, setLogoInput] = useState('');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgRole>('member');
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null);

  const currentMember = useMemo(
    () => members.find((member) => member.userId === user?.id) ?? null,
    [members, user?.id]
  );
  const ownerCount = useMemo(
    () => members.filter((member) => member.role === 'owner').length,
    [members]
  );

  useEffect(() => {
    if (!org) return;
    setOrgName(org.name);
    setOrgWebsite(org.website ?? '');
    setOrgLogoUrl(org.logoUrl ?? '');
  }, [org]);

  // Sync local state with fetched settings
  useEffect(() => {
    if (orgSettings) {
      setPrimaryColor(orgSettings.primaryColor || '#C9A227');
      setSecondaryColor(orgSettings.secondaryColor || '#0D1421');
      setFooterText(orgSettings.footerText || '');
      setLogoOnQuotes(orgSettings.logoOnQuotes);
      setLogoOnDrawings(orgSettings.logoOnDrawings);
      setLogoOnPdfs(orgSettings.logoOnPdfs);
    }
  }, [orgSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      if (!orgName.trim()) {
        throw new Error('Organization name is required.');
      }
      const orgUpdates = {
        name: orgName.trim(),
        website: orgWebsite.trim() || null,
        logoUrl: orgLogoUrl.trim() || null,
      };

      await Promise.all([
        updateOrganization(orgId, orgUpdates),
        updateOrgSettingsMutation.mutateAsync({
          orgId,
          data: {
            primaryColor,
            secondaryColor,
            footerText,
            logoOnQuotes,
            logoOnDrawings,
            logoOnPdfs,
          },
        }),
      ]);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Failed to save organization settings'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleInviteMember = () => {
    if (!user?.id) {
      setInviteError('You must be signed in to invite members.');
      return;
    }

    inviteMemberMutation.mutate(
      {
        orgId,
        email: inviteEmail.trim(),
        role: inviteRole,
      },
      {
        onSuccess: () => {
          setInviteEmail('');
          setInviteRole('member');
          setInviteError(null);
          setShowInviteModal(false);
        },
        onError: (error) => {
          setInviteError(
            error instanceof Error ? error.message : 'Failed to invite member'
          );
        },
      }
    );
  };

  const handleRoleChange = (member: OrganizationMember, role: OrgRole) => {
    updateMemberRoleMutation.mutate({
      orgId,
      memberId: member.id,
      role,
    });
  };

  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    removeMemberMutation.mutate(
      { orgId, memberId: memberToRemove.id },
      {
        onSuccess: () => setMemberToRemove(null),
      }
    );
  };

  const canManageMembers =
    currentMember?.role === 'owner' || currentMember?.role === 'admin';
  const canEditOwners = currentMember?.role === 'owner';

  if (settingsLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-bg-tertiary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Organization</h2>
        <p className="text-sm text-text-secondary mt-1">
          Manage organization profile and branding
        </p>
      </div>

      {/* Organization Profile */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">
          Organization Profile
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="size-16 bg-bg-tertiary rounded-lg flex items-center justify-center text-text-tertiary overflow-hidden">
              {orgLogoUrl ? (
                <img
                  src={orgLogoUrl}
                  alt={`${orgName} logo`}
                  className="size-full object-cover"
                />
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                  <path d="M9 22v-4h6v4" />
                </svg>
              )}
            </div>
            <div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setLogoInput(orgLogoUrl);
                  setShowLogoModal(true);
                }}
              >
                Update Logo
              </Button>
              <p className="text-xs text-text-tertiary mt-1">
                Provide a public PNG or SVG URL. Recommended: 200x50px
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="orgName" className="block text-sm text-text-secondary mb-1">
              Organization Name
            </label>
            <input
              id="orgName"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="settings-input"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm text-text-secondary mb-1">
              Website
            </label>
            <input
              id="website"
              type="url"
              value={orgWebsite}
              onChange={(e) => setOrgWebsite(e.target.value)}
              className="settings-input"
            />
          </div>
        </div>
      </section>

      {/* Branding */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">Branding</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ColorPicker
              label="Primary Color"
              value={primaryColor}
              onChange={setPrimaryColor}
            />
            <ColorPicker
              label="Secondary Color"
              value={secondaryColor}
              onChange={setSecondaryColor}
            />
          </div>

          <div>
            <label
              htmlFor="footerText"
              className="block text-sm text-text-secondary mb-1"
            >
              Document Footer Text
            </label>
            <input
              id="footerText"
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="settings-input"
              placeholder="e.g., Confidential - Acme AV Solutions"
            />
          </div>

          {/* Preview */}
          <div className="mt-4 p-4 bg-bg-tertiary rounded-lg">
            <p className="text-xs text-text-tertiary mb-2">Preview</p>
            <div className="flex items-center gap-4">
              <div className="size-8 rounded" style={{ backgroundColor: primaryColor }} />
              <div
                className="size-8 rounded"
                style={{ backgroundColor: secondaryColor }}
              />
              <span className="text-sm text-text-secondary">
                {footerText || '(footer text)'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Display Options */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">Logo Display</h3>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={logoOnQuotes}
              onChange={(e) => setLogoOnQuotes(e.target.checked)}
              className="settings-checkbox"
            />
            <span className="text-sm text-text-primary">Show logo on quotes</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={logoOnDrawings}
              onChange={(e) => setLogoOnDrawings(e.target.checked)}
              className="settings-checkbox"
            />
            <span className="text-sm text-text-primary">Show logo on drawings</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={logoOnPdfs}
              onChange={(e) => setLogoOnPdfs(e.target.checked)}
              className="settings-checkbox"
            />
            <span className="text-sm text-text-primary">Show logo on exported PDFs</span>
          </label>
        </div>
      </section>

      {/* Team Members */}
      <section className="settings-section">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-text-primary">Team Members</h3>
            <p className="text-xs text-text-tertiary">
              Manage roles and access across your organization
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowInviteModal(true)}
            disabled={!canManageMembers}
          >
            Invite Member
          </Button>
        </div>

        {membersLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-bg-tertiary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-text-tertiary">
            <p>No members found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => {
              const isOwner = member.role === 'owner';
              const isSelf = member.userId === user?.id;
              const disableRoleChange = isOwner && !canEditOwners;
              const disableRemove =
                isSelf || (isOwner && ownerCount <= 1) || !canManageMembers;

              return (
                <div
                  key={member.id}
                  className="flex flex-col gap-3 p-3 bg-bg-secondary rounded-lg border border-border md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {getMemberLabel(member)}
                    </p>
                    <p className="text-xs text-text-tertiary">{member.user?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32">
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member, e.target.value as OrgRole)
                        }
                        className="settings-select"
                        disabled={!canManageMembers || disableRoleChange}
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setMemberToRemove(member)}
                      disabled={disableRemove}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {saveError && <p className="text-sm text-error">{saveError}</p>}

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button
          onClick={handleSave}
          disabled={isSaving || updateOrgSettingsMutation.isPending}
        >
          {isSaving || updateOrgSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Logo Modal */}
      <Modal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
        title="Update Organization Logo"
        description="Provide a public logo URL."
        size="sm"
      >
        <div className="space-y-3">
          <label htmlFor="logoUrl" className="block text-sm text-text-secondary">
            Logo URL
          </label>
          <input
            id="logoUrl"
            type="url"
            value={logoInput}
            onChange={(e) => setLogoInput(e.target.value)}
            className="settings-input"
            placeholder="https://example.com/logo.svg"
          />
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowLogoModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setOrgLogoUrl(logoInput.trim());
              setShowLogoModal(false);
            }}
          >
            Save
          </Button>
        </ModalFooter>
      </Modal>

      {/* Invite Member Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Member"
        description="Add an existing user to your organization."
        size="sm"
      >
        <div className="space-y-3">
          <label htmlFor="inviteEmail" className="block text-sm text-text-secondary">
            Email
          </label>
          <input
            id="inviteEmail"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="settings-input"
            placeholder="name@company.com"
          />

          <label htmlFor="inviteRole" className="block text-sm text-text-secondary">
            Role
          </label>
          <select
            id="inviteRole"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as OrgRole)}
            className="settings-select"
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>

          {inviteError && <p className="text-sm text-error">{inviteError}</p>}
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleInviteMember}
            disabled={!inviteEmail.trim() || inviteMemberMutation.isPending}
          >
            {inviteMemberMutation.isPending ? 'Inviting...' : 'Send Invite'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Remove Member Modal */}
      <Modal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        title="Remove Member"
        description="This will revoke access immediately."
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Remove {memberToRemove ? getMemberLabel(memberToRemove) : 'this member'} from
            the organization?
          </p>
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setMemberToRemove(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleRemoveMember}
            disabled={removeMemberMutation.isPending}
          >
            {removeMemberMutation.isPending ? 'Removing...' : 'Remove'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
