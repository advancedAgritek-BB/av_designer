/**
 * Defaults Settings Component
 *
 * Per-context default profiles management
 */

import { useState } from 'react';
import { Button } from '@/components/ui';
import {
  useDefaultProfiles,
  useCreateDefaultProfile,
  useUpdateDefaultProfile,
  useDeleteDefaultProfile,
  useUserPreferences,
  useUpdateUserPreferences,
} from '../use-settings';
import {
  DEFAULT_PROFILE_BEHAVIOR_OPTIONS,
  type DefaultProfile,
  type CreateDefaultProfileData,
} from '../settings-types';

interface DefaultsSettingsProps {
  userId: string;
}

/**
 * Profile Card Component
 */
function ProfileCard({
  profile,
  onEdit,
  onSetDefault,
}: {
  profile: DefaultProfile;
  onEdit: (profile: DefaultProfile) => void;
  onSetDefault: (profile: DefaultProfile) => void;
}) {
  const getSummary = () => {
    const parts = [];
    if (profile.platform) parts.push(profile.platform);
    if (profile.tier) parts.push(`${profile.tier} tier`);
    if (profile.equipmentMargin) parts.push(`${profile.equipmentMargin}% margin`);
    return parts.join(' • ') || 'No defaults configured';
  };

  return (
    <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg border border-border">
      <div className="flex items-center gap-3">
        {profile.isDefault && (
          <span className="text-lg" title="Default profile">
            *
          </span>
        )}
        <div>
          <p className="font-medium text-text-primary">
            {profile.name}
            {profile.isDefault && (
              <span className="ml-2 text-xs text-accent-gold">(default)</span>
            )}
          </p>
          <p className="text-sm text-text-tertiary">{getSummary()}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!profile.isDefault && (
          <button
            type="button"
            onClick={() => onSetDefault(profile)}
            className="text-sm text-accent-gold hover:underline"
          >
            Set default
          </button>
        )}
        <Button variant="secondary" size="sm" onClick={() => onEdit(profile)}>
          Edit
        </Button>
      </div>
    </div>
  );
}

/**
 * Profile Editor Modal
 */
function ProfileEditor({
  profile,
  onSave,
  onClose,
  onDelete,
}: {
  profile: DefaultProfile | null;
  onSave: (data: CreateDefaultProfileData & { id?: string }) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}) {
  const isNew = !profile;
  const [name, setName] = useState(profile?.name || '');
  const [isDefault, setIsDefault] = useState(profile?.isDefault || false);
  const [roomType, setRoomType] = useState(profile?.roomType || '');
  const [platform, setPlatform] = useState(profile?.platform || '');
  const [ecosystem, setEcosystem] = useState(profile?.ecosystem || '');
  const [tier, setTier] = useState(profile?.tier || '');
  const [equipmentMargin, setEquipmentMargin] = useState(
    profile?.equipmentMargin?.toString() || '25'
  );
  const [laborMargin, setLaborMargin] = useState(
    profile?.laborMargin?.toString() || '35'
  );
  const [laborRate, setLaborRate] = useState(profile?.laborRate?.toString() || '85');
  const [taxRate, setTaxRate] = useState(profile?.taxRate?.toString() || '8.25');
  const [paperSize, setPaperSize] = useState(profile?.paperSize || 'ARCH_D');
  const [defaultScale, setDefaultScale] = useState(profile?.defaultScale || '1/4" = 1\'');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: profile?.id,
      name,
      isDefault,
      roomType: roomType || null,
      platform: platform || null,
      ecosystem: ecosystem || null,
      tier: tier || null,
      equipmentMargin: equipmentMargin ? Number(equipmentMargin) : null,
      laborMargin: laborMargin ? Number(laborMargin) : null,
      laborRate: laborRate ? Number(laborRate) : null,
      taxRate: taxRate ? Number(taxRate) : null,
      paperSize: paperSize || null,
      defaultScale: defaultScale || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-primary border border-border rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-text-primary">
            {isNew ? 'New Default Profile' : `Edit: ${profile.name}`}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Profile Info */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="profileName"
                className="block text-sm text-text-secondary mb-1"
              >
                Profile Name
              </label>
              <input
                id="profileName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="settings-input"
                required
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="settings-checkbox"
              />
              <span className="text-sm text-text-primary">Set as default profile</span>
            </label>
          </div>

          {/* Room Defaults */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Room Defaults</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="roomType"
                  className="block text-xs text-text-secondary mb-1"
                >
                  Room Type
                </label>
                <select
                  id="roomType"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="settings-select"
                >
                  <option value="">Select...</option>
                  <option value="conference">Conference</option>
                  <option value="huddle">Huddle</option>
                  <option value="boardroom">Boardroom</option>
                  <option value="training">Training</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="platform"
                  className="block text-xs text-text-secondary mb-1"
                >
                  Platform
                </label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="settings-select"
                >
                  <option value="">Select...</option>
                  <option value="teams">Microsoft Teams</option>
                  <option value="zoom">Zoom</option>
                  <option value="webex">Cisco Webex</option>
                  <option value="meet">Google Meet</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="ecosystem"
                  className="block text-xs text-text-secondary mb-1"
                >
                  Ecosystem
                </label>
                <select
                  id="ecosystem"
                  value={ecosystem}
                  onChange={(e) => setEcosystem(e.target.value)}
                  className="settings-select"
                >
                  <option value="">Select...</option>
                  <option value="poly">Poly</option>
                  <option value="crestron">Crestron</option>
                  <option value="logitech">Logitech</option>
                  <option value="neat">Neat</option>
                </select>
              </div>
              <div>
                <label htmlFor="tier" className="block text-xs text-text-secondary mb-1">
                  Tier
                </label>
                <select
                  id="tier"
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="settings-select"
                >
                  <option value="">Select...</option>
                  <option value="budget">Budget</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quoting Defaults */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">
              Quoting Defaults
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="equipmentMargin"
                  className="block text-xs text-text-secondary mb-1"
                >
                  Equipment Margin (%)
                </label>
                <input
                  id="equipmentMargin"
                  type="number"
                  step="0.01"
                  value={equipmentMargin}
                  onChange={(e) => setEquipmentMargin(e.target.value)}
                  className="settings-input"
                />
              </div>
              <div>
                <label
                  htmlFor="laborMargin"
                  className="block text-xs text-text-secondary mb-1"
                >
                  Labor Margin (%)
                </label>
                <input
                  id="laborMargin"
                  type="number"
                  step="0.01"
                  value={laborMargin}
                  onChange={(e) => setLaborMargin(e.target.value)}
                  className="settings-input"
                />
              </div>
              <div>
                <label
                  htmlFor="laborRate"
                  className="block text-xs text-text-secondary mb-1"
                >
                  Labor Rate ($/hr)
                </label>
                <input
                  id="laborRate"
                  type="number"
                  step="0.01"
                  value={laborRate}
                  onChange={(e) => setLaborRate(e.target.value)}
                  className="settings-input"
                />
              </div>
              <div>
                <label
                  htmlFor="taxRate"
                  className="block text-xs text-text-secondary mb-1"
                >
                  Tax Rate (%)
                </label>
                <input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="settings-input"
                />
              </div>
            </div>
          </div>

          {/* Drawing Defaults */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">
              Drawing Defaults
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="paperSize"
                  className="block text-xs text-text-secondary mb-1"
                >
                  Paper Size
                </label>
                <select
                  id="paperSize"
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  className="settings-select"
                >
                  <option value="ARCH_D">ARCH D (24x36)</option>
                  <option value="ARCH_E">ARCH E (36x48)</option>
                  <option value="ANSI_D">ANSI D (22x34)</option>
                  <option value="ANSI_E">ANSI E (34x44)</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="defaultScale"
                  className="block text-xs text-text-secondary mb-1"
                >
                  Scale
                </label>
                <select
                  id="defaultScale"
                  value={defaultScale}
                  onChange={(e) => setDefaultScale(e.target.value)}
                  className="settings-select"
                >
                  <option value="1/8&quot; = 1'">1/8&quot; = 1&apos;</option>
                  <option value="1/4&quot; = 1'">1/4&quot; = 1&apos;</option>
                  <option value="3/8&quot; = 1'">3/8&quot; = 1&apos;</option>
                  <option value="1/2&quot; = 1'">1/2&quot; = 1&apos;</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div>
              {!isNew && onDelete && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => onDelete(profile.id)}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{isNew ? 'Create Profile' : 'Save Changes'}</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DefaultsSettings({ userId }: DefaultsSettingsProps) {
  const { data: profiles = [], isLoading } = useDefaultProfiles(userId);
  const { data: preferences } = useUserPreferences(userId);
  const createMutation = useCreateDefaultProfile();
  const updateMutation = useUpdateDefaultProfile();
  const deleteMutation = useDeleteDefaultProfile();
  const updatePreferencesMutation = useUpdateUserPreferences();

  const [editingProfile, setEditingProfile] = useState<DefaultProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = (data: CreateDefaultProfileData & { id?: string }) => {
    if (data.id) {
      updateMutation.mutate(
        { id: data.id, data },
        {
          onSuccess: () => {
            setEditingProfile(null);
          },
        }
      );
    } else {
      createMutation.mutate(
        { userId, data },
        {
          onSuccess: () => {
            setIsCreating(false);
          },
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      deleteMutation.mutate(
        { id, userId },
        {
          onSuccess: () => {
            setEditingProfile(null);
          },
        }
      );
    }
  };

  const handleSetDefault = (profile: DefaultProfile) => {
    updateMutation.mutate({
      id: profile.id,
      data: { isDefault: true },
    });
  };

  const handleBehaviorChange = (behavior: string) => {
    updatePreferencesMutation.mutate({
      userId,
      data: {
        defaultProfileBehavior: behavior as 'always_default' | 'ask' | 'remember_last',
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-bg-tertiary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Default Profiles</h2>
          <p className="text-sm text-text-secondary mt-1">
            Configure default settings for new projects and rooms
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>+ New Profile</Button>
      </div>

      {/* Profiles List */}
      <div className="space-y-3">
        {profiles.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <p>No default profiles yet</p>
            <p className="text-sm mt-1">
              Create a profile to set defaults for new projects
            </p>
          </div>
        ) : (
          profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onEdit={setEditingProfile}
              onSetDefault={handleSetDefault}
            />
          ))
        )}
      </div>

      {/* Behavior Selection */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">
          When creating new projects
        </h3>
        <div className="space-y-2">
          {DEFAULT_PROFILE_BEHAVIOR_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="profileBehavior"
                value={option.value}
                checked={preferences?.defaultProfileBehavior === option.value}
                onChange={(e) => handleBehaviorChange(e.target.value)}
                className="settings-radio"
              />
              <span className="text-sm text-text-primary">{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Profile Editor Modal */}
      {(isCreating || editingProfile) && (
        <ProfileEditor
          profile={editingProfile}
          onSave={handleSave}
          onClose={() => {
            setIsCreating(false);
            setEditingProfile(null);
          }}
          onDelete={editingProfile ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
