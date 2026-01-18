/**
 * Equipment Form - Certifications Section
 *
 * Handles platform certifications as comma-separated input.
 */

interface CertificationsProps {
  formId: string;
  certifications: string;
  isLoading: boolean;
  onChange: (value: string) => void;
}

export function EquipmentFormCertifications({
  formId,
  certifications,
  isLoading,
  onChange,
}: CertificationsProps) {
  return (
    <div className="equipment-form-section">
      <h3 className="equipment-form-section-title">Certifications</h3>

      <div className="equipment-form-field">
        <label htmlFor={`${formId}-certifications`} className="label">
          Platform Certifications
        </label>
        <input
          id={`${formId}-certifications`}
          type="text"
          value={certifications}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading}
          placeholder="Teams, Zoom, Webex (comma-separated)"
          className="input"
        />
        <p className="text-text-secondary text-xs mt-1">
          Enter certifications separated by commas
        </p>
      </div>
    </div>
  );
}
