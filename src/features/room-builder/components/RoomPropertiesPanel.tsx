/**
 * RoomPropertiesPanel Component
 *
 * Panel for editing room properties including dimensions, room type,
 * platform, ecosystem, and quality tier.
 */

import { useCallback } from 'react';
import type {
  Room,
  RoomFormData,
  RoomType,
  Platform,
  Ecosystem,
  QualityTier,
} from '@/types/room';
import { ROOM_TYPES, PLATFORMS, ECOSYSTEMS, QUALITY_TIERS } from '@/types/room';

interface RoomPropertiesPanelProps {
  room: Room;
  onUpdate: (data: Partial<RoomFormData>) => void;
  validationErrors?: string[];
  validationWarnings?: string[];
}

const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  huddle: 'Huddle',
  conference: 'Conference',
  training: 'Training',
  boardroom: 'Boardroom',
  auditorium: 'Auditorium',
};

const PLATFORM_LABELS: Record<Platform, string> = {
  teams: 'Microsoft Teams',
  zoom: 'Zoom',
  webex: 'Webex',
  meet: 'Google Meet',
  multi: 'Multi-Platform',
  none: 'None',
  generic: 'Generic',
};

const ECOSYSTEM_LABELS: Record<Ecosystem, string> = {
  poly: 'Poly',
  logitech: 'Logitech',
  cisco: 'Cisco',
  crestron: 'Crestron',
  biamp: 'Biamp',
  qsc: 'QSC',
  mixed: 'Mixed',
};

const TIER_LABELS: Record<QualityTier, string> = {
  budget: 'Budget',
  standard: 'Standard',
  premium: 'Premium',
  executive: 'Executive',
};

export function RoomPropertiesPanel({
  room,
  onUpdate,
  validationErrors = [],
  validationWarnings = [],
}: RoomPropertiesPanelProps) {
  const hasErrors = validationErrors.length > 0;
  const hasWarnings = validationWarnings.length > 0;

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ name: e.target.value });
    },
    [onUpdate]
  );

  const handleWidthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value) && value > 0) {
        onUpdate({ width: value });
      }
    },
    [onUpdate]
  );

  const handleLengthChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value) && value > 0) {
        onUpdate({ length: value });
      }
    },
    [onUpdate]
  );

  const handleCeilingHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value);
      if (!isNaN(value) && value > 0) {
        onUpdate({ ceilingHeight: value });
      }
    },
    [onUpdate]
  );

  const handleRoomTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onUpdate({ roomType: e.target.value as RoomType });
    },
    [onUpdate]
  );

  const handlePlatformChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onUpdate({ platform: e.target.value as Platform });
    },
    [onUpdate]
  );

  const handleEcosystemChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onUpdate({ ecosystem: e.target.value as Ecosystem });
    },
    [onUpdate]
  );

  const handleTierChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onUpdate({ tier: e.target.value as QualityTier });
    },
    [onUpdate]
  );

  if (!room) {
    return (
      <div
        data-testid="room-properties-panel"
        className="room-properties-panel room-properties-panel--empty"
      >
        <p className="room-properties-panel__empty-message">No room selected</p>
      </div>
    );
  }

  return (
    <div
      data-testid="room-properties-panel"
      className="room-properties-panel"
      aria-invalid={hasErrors}
    >
      <h2 className="room-properties-panel__heading">Room Properties</h2>

      {/* Room Name */}
      <div className="room-properties-panel__field">
        <label htmlFor="room-name" className="room-properties-panel__label">
          Name
        </label>
        <input
          id="room-name"
          type="text"
          value={room.name}
          onChange={handleNameChange}
          className="room-properties-panel__input"
        />
      </div>

      {/* Dimensions Section */}
      <div className="room-properties-panel__section">
        <h3 className="room-properties-panel__section-heading">Dimensions</h3>

        <div className="room-properties-panel__field">
          <label htmlFor="room-width" className="room-properties-panel__label">
            Width
          </label>
          <div className="room-properties-panel__input-group">
            <input
              id="room-width"
              type="number"
              value={room.width}
              onChange={handleWidthChange}
              min="1"
              step="1"
              className="room-properties-panel__input room-properties-panel__input--number"
            />
            <span className="room-properties-panel__unit">ft</span>
          </div>
        </div>

        <div className="room-properties-panel__field">
          <label htmlFor="room-length" className="room-properties-panel__label">
            Length
          </label>
          <div className="room-properties-panel__input-group">
            <input
              id="room-length"
              type="number"
              value={room.length}
              onChange={handleLengthChange}
              min="1"
              step="1"
              className="room-properties-panel__input room-properties-panel__input--number"
            />
            <span className="room-properties-panel__unit">ft</span>
          </div>
        </div>

        <div className="room-properties-panel__field">
          <label htmlFor="room-ceiling-height" className="room-properties-panel__label">
            Ceiling Height
          </label>
          <div className="room-properties-panel__input-group">
            <input
              id="room-ceiling-height"
              type="number"
              value={room.ceilingHeight}
              onChange={handleCeilingHeightChange}
              min="1"
              step="1"
              className="room-properties-panel__input room-properties-panel__input--number"
            />
            <span className="room-properties-panel__unit">ft</span>
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="room-properties-panel__section">
        <h3 className="room-properties-panel__section-heading">Configuration</h3>

        <div className="room-properties-panel__field">
          <label htmlFor="room-type" className="room-properties-panel__label">
            Room Type
          </label>
          <select
            id="room-type"
            value={room.roomType}
            onChange={handleRoomTypeChange}
            className="room-properties-panel__select"
          >
            {ROOM_TYPES.map((type) => (
              <option key={type} value={type}>
                {ROOM_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div className="room-properties-panel__field">
          <label htmlFor="room-platform" className="room-properties-panel__label">
            Platform
          </label>
          <select
            id="room-platform"
            value={room.platform}
            onChange={handlePlatformChange}
            className="room-properties-panel__select"
          >
            {PLATFORMS.map((platform) => (
              <option key={platform} value={platform}>
                {PLATFORM_LABELS[platform]}
              </option>
            ))}
          </select>
        </div>

        <div className="room-properties-panel__field">
          <label htmlFor="room-ecosystem" className="room-properties-panel__label">
            Ecosystem
          </label>
          <select
            id="room-ecosystem"
            value={room.ecosystem}
            onChange={handleEcosystemChange}
            className="room-properties-panel__select"
          >
            {ECOSYSTEMS.map((eco) => (
              <option key={eco} value={eco}>
                {ECOSYSTEM_LABELS[eco]}
              </option>
            ))}
          </select>
        </div>

        <div className="room-properties-panel__field">
          <label htmlFor="room-tier" className="room-properties-panel__label">
            Quality Tier
          </label>
          <select
            id="room-tier"
            value={room.tier}
            onChange={handleTierChange}
            className="room-properties-panel__select"
          >
            {QUALITY_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {TIER_LABELS[tier]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Validation Feedback */}
      {hasErrors && (
        <div
          data-testid="validation-errors"
          className="room-properties-panel__validation room-properties-panel__validation--errors"
        >
          {validationErrors.map((error, index) => (
            <p key={index} className="room-properties-panel__validation-message">
              {error}
            </p>
          ))}
        </div>
      )}

      {hasWarnings && (
        <div
          data-testid="validation-warnings"
          className="room-properties-panel__validation room-properties-panel__validation--warnings"
        >
          {validationWarnings.map((warning, index) => (
            <p key={index} className="room-properties-panel__validation-message">
              {warning}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
