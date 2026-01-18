import { useState, useRef, useCallback, useId } from 'react';
import { Button } from '@/components/ui/Button';
import type {
  Equipment,
  EquipmentCategory,
  EquipmentFormData,
  ElectricalSpecs,
  Dimensions,
} from '@/types/equipment';
import { EQUIPMENT_CATEGORIES, EQUIPMENT_SUBCATEGORIES } from '@/types/equipment';

type FormMode = 'create' | 'edit';

interface EquipmentFormProps {
  mode: FormMode;
  equipment?: Equipment;
  onSubmit: (data: EquipmentFormData, id?: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

interface FormErrors {
  manufacturer?: string;
  model?: string;
  sku?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  cost?: string;
  msrp?: string;
  height?: string;
  width?: string;
  depth?: string;
  weight?: string;
}

const EMPTY_DIMENSIONS: Dimensions = {
  height: 0,
  width: 0,
  depth: 0,
};

const EMPTY_ELECTRICAL: ElectricalSpecs = {};

// Helper to compute initial state from props
function getInitialState(mode: FormMode, equipment?: Equipment) {
  if (mode === 'edit' && equipment) {
    return {
      manufacturer: equipment.manufacturer,
      model: equipment.model,
      sku: equipment.sku,
      category: equipment.category as EquipmentCategory | '',
      subcategory: equipment.subcategory,
      description: equipment.description,
      cost: equipment.cost as number | '',
      msrp: equipment.msrp as number | '',
      dimensions: equipment.dimensions,
      weight: equipment.weight as number | '',
      electrical: equipment.electrical ?? EMPTY_ELECTRICAL,
      certifications: equipment.platformCertifications?.join(', ') ?? '',
    };
  }
  return {
    manufacturer: '',
    model: '',
    sku: '',
    category: '' as EquipmentCategory | '',
    subcategory: '',
    description: '',
    cost: '' as number | '',
    msrp: '' as number | '',
    dimensions: EMPTY_DIMENSIONS,
    weight: '' as number | '',
    electrical: EMPTY_ELECTRICAL,
    certifications: '',
  };
}

/**
 * Equipment form component for creating and editing equipment items.
 * Supports full validation, optional electrical specs, and platform certifications.
 *
 * IMPORTANT: When switching between create/edit modes, use a key prop on this component
 * to force a full re-mount: <EquipmentForm key={mode + equipment?.id} ... />
 */
export function EquipmentForm({
  mode,
  equipment,
  onSubmit,
  onCancel,
  isLoading = false,
}: EquipmentFormProps) {
  const formId = useId();

  // Compute initial state from props (only evaluated on mount)
  const initialState = getInitialState(mode, equipment);

  // Form state - initialized from props
  const [manufacturer, setManufacturer] = useState(initialState.manufacturer);
  const [model, setModel] = useState(initialState.model);
  const [sku, setSku] = useState(initialState.sku);
  const [category, setCategory] = useState<EquipmentCategory | ''>(initialState.category);
  const [subcategory, setSubcategory] = useState(initialState.subcategory);
  const [description, setDescription] = useState(initialState.description);
  const [cost, setCost] = useState<number | ''>(initialState.cost);
  const [msrp, setMsrp] = useState<number | ''>(initialState.msrp);
  const [dimensions, setDimensions] = useState<Dimensions>(initialState.dimensions);
  const [weight, setWeight] = useState<number | ''>(initialState.weight);
  const [electrical, setElectrical] = useState<ElectricalSpecs>(initialState.electrical);
  const [certifications, setCertifications] = useState(initialState.certifications);
  const [electricalExpanded, setElectricalExpanded] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<FormErrors>({});

  // Refs for focus management
  const manufacturerRef = useRef<HTMLInputElement>(null);
  const modelRef = useRef<HTMLInputElement>(null);
  const skuRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const subcategoryRef = useRef<HTMLSelectElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const costRef = useRef<HTMLInputElement>(null);
  const msrpRef = useRef<HTMLInputElement>(null);
  const heightRef = useRef<HTMLInputElement>(null);
  const widthRef = useRef<HTMLInputElement>(null);
  const depthRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);

  // Get subcategories for current category
  const subcategories = category ? EQUIPMENT_SUBCATEGORIES[category] : [];

  // Validation functions
  const validateField = useCallback(
    (field: keyof FormErrors, value: unknown): string | undefined => {
      switch (field) {
        case 'manufacturer':
          return !value || (value as string).trim() === ''
            ? 'Manufacturer is required'
            : undefined;
        case 'model':
          return !value || (value as string).trim() === ''
            ? 'Model is required'
            : undefined;
        case 'sku':
          return !value || (value as string).trim() === ''
            ? 'SKU is required'
            : undefined;
        case 'category':
          return !value ? 'Category is required' : undefined;
        case 'subcategory':
          return !value ? 'Subcategory is required' : undefined;
        case 'description':
          return undefined; // Optional field
        case 'cost':
          if (value !== '' && typeof value === 'number' && value < 0) {
            return 'Cost must be a positive number';
          }
          return undefined;
        case 'msrp':
          if (value !== '' && typeof value === 'number' && value < 0) {
            return 'MSRP must be a positive number';
          }
          return undefined;
        case 'height':
          if (typeof value === 'number' && value < 0) {
            return 'Height must be a positive number';
          }
          return undefined;
        case 'width':
          if (typeof value === 'number' && value < 0) {
            return 'Width must be a positive number';
          }
          return undefined;
        case 'depth':
          if (typeof value === 'number' && value < 0) {
            return 'Depth must be a positive number';
          }
          return undefined;
        case 'weight':
          if (value !== '' && typeof value === 'number' && value < 0) {
            return 'Weight must be a positive number';
          }
          return undefined;
        default:
          return undefined;
      }
    },
    []
  );

  // Update error state when field changes (add or clear error)
  const handleFieldChange = useCallback(
    (field: keyof FormErrors, value: unknown) => {
      const error = validateField(field, value);
      setErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[field] = error;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });
    },
    [validateField]
  );

  // Validate all fields
  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    const manufacturerError = validateField('manufacturer', manufacturer);
    if (manufacturerError) newErrors.manufacturer = manufacturerError;

    const modelError = validateField('model', model);
    if (modelError) newErrors.model = modelError;

    const skuError = validateField('sku', sku);
    if (skuError) newErrors.sku = skuError;

    const categoryError = validateField('category', category);
    if (categoryError) newErrors.category = categoryError;

    const subcategoryError = validateField('subcategory', subcategory);
    if (subcategoryError) newErrors.subcategory = subcategoryError;

    const costError = validateField('cost', cost);
    if (costError) newErrors.cost = costError;

    const msrpError = validateField('msrp', msrp);
    if (msrpError) newErrors.msrp = msrpError;

    const heightError = validateField('height', dimensions.height);
    if (heightError) newErrors.height = heightError;

    const widthError = validateField('width', dimensions.width);
    if (widthError) newErrors.width = widthError;

    const depthError = validateField('depth', dimensions.depth);
    if (depthError) newErrors.depth = depthError;

    const weightError = validateField('weight', weight);
    if (weightError) newErrors.weight = weightError;

    return newErrors;
  }, [
    manufacturer,
    model,
    sku,
    category,
    subcategory,
    cost,
    msrp,
    dimensions,
    weight,
    validateField,
  ]);

  // Focus first error field
  const focusFirstError = useCallback((validationErrors: FormErrors) => {
    const errorFields = Object.keys(validationErrors) as (keyof FormErrors)[];
    if (errorFields.length === 0) return;

    // Focus order matches form field order
    const focusOrder: (keyof FormErrors)[] = [
      'manufacturer',
      'model',
      'sku',
      'category',
      'subcategory',
      'description',
      'cost',
      'msrp',
      'height',
      'width',
      'depth',
      'weight',
    ];

    for (const field of focusOrder) {
      if (errorFields.includes(field)) {
        // Get the ref for the field and focus it
        switch (field) {
          case 'manufacturer':
            manufacturerRef.current?.focus();
            break;
          case 'model':
            modelRef.current?.focus();
            break;
          case 'sku':
            skuRef.current?.focus();
            break;
          case 'category':
            categoryRef.current?.focus();
            break;
          case 'subcategory':
            subcategoryRef.current?.focus();
            break;
          case 'description':
            descriptionRef.current?.focus();
            break;
          case 'cost':
            costRef.current?.focus();
            break;
          case 'msrp':
            msrpRef.current?.focus();
            break;
          case 'height':
            heightRef.current?.focus();
            break;
          case 'width':
            widthRef.current?.focus();
            break;
          case 'depth':
            depthRef.current?.focus();
            break;
          case 'weight':
            weightRef.current?.focus();
            break;
        }
        break;
      }
    }
  }, []);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      focusFirstError(validationErrors);
      return;
    }

    // Parse certifications from comma-separated string
    const parsedCertifications = certifications
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c !== '');

    // Build electrical specs (only include if any value is set)
    const hasElectricalSpecs = Object.values(electrical).some((v) => v !== undefined);

    const formData: EquipmentFormData = {
      manufacturer: manufacturer.trim(),
      model: model.trim(),
      sku: sku.trim(),
      category: category as EquipmentCategory,
      subcategory,
      description: description.trim(),
      cost: typeof cost === 'number' ? cost : 0,
      msrp: typeof msrp === 'number' ? msrp : 0,
      dimensions,
      weight: typeof weight === 'number' ? weight : 0,
      ...(hasElectricalSpecs && { electrical }),
      ...(parsedCertifications.length > 0 && {
        platformCertifications: parsedCertifications,
      }),
    };

    if (mode === 'edit' && equipment) {
      onSubmit(formData, equipment.id);
    } else {
      onSubmit(formData);
    }
  };

  // Handle cancel
  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    onCancel?.();
  };

  // Error ID helpers
  const getErrorId = (field: keyof FormErrors) =>
    errors[field] ? `${formId}-${field}-error` : undefined;

  const formAriaLabel = mode === 'create' ? 'Add new equipment' : 'Edit equipment';
  const submitLabel = mode === 'create' ? 'Add Equipment' : 'Save Changes';

  return (
    <form aria-label={formAriaLabel} onSubmit={handleSubmit} className="equipment-form">
      {/* Basic Information */}
      <div className="equipment-form-section">
        <h3 className="equipment-form-section-title">Basic Information</h3>

        <div className="equipment-form-row">
          <div className="equipment-form-field">
            <label htmlFor={`${formId}-manufacturer`} className="label">
              Manufacturer{' '}
              <span className="text-status-error" aria-hidden="true">
                *
              </span>
            </label>
            <input
              ref={manufacturerRef}
              id={`${formId}-manufacturer`}
              type="text"
              value={manufacturer}
              onChange={(e) => {
                setManufacturer(e.target.value);
                handleFieldChange('manufacturer', e.target.value);
              }}
              disabled={isLoading}
              aria-invalid={errors.manufacturer ? 'true' : undefined}
              aria-describedby={getErrorId('manufacturer')}
              className={`input ${errors.manufacturer ? 'input-error' : ''}`}
            />
            {errors.manufacturer && (
              <p
                id={getErrorId('manufacturer')}
                className="text-status-error text-xs mt-1"
              >
                {errors.manufacturer}
              </p>
            )}
          </div>

          <div className="equipment-form-field">
            <label htmlFor={`${formId}-model`} className="label">
              Model{' '}
              <span className="text-status-error" aria-hidden="true">
                *
              </span>
            </label>
            <input
              ref={modelRef}
              id={`${formId}-model`}
              type="text"
              value={model}
              onChange={(e) => {
                setModel(e.target.value);
                handleFieldChange('model', e.target.value);
              }}
              disabled={isLoading}
              aria-invalid={errors.model ? 'true' : undefined}
              aria-describedby={getErrorId('model')}
              className={`input ${errors.model ? 'input-error' : ''}`}
            />
            {errors.model && (
              <p id={getErrorId('model')} className="text-status-error text-xs mt-1">
                {errors.model}
              </p>
            )}
          </div>
        </div>

        <div className="equipment-form-row">
          <div className="equipment-form-field">
            <label htmlFor={`${formId}-sku`} className="label">
              SKU{' '}
              <span className="text-status-error" aria-hidden="true">
                *
              </span>
            </label>
            <input
              ref={skuRef}
              id={`${formId}-sku`}
              type="text"
              value={sku}
              onChange={(e) => {
                setSku(e.target.value);
                handleFieldChange('sku', e.target.value);
              }}
              disabled={isLoading}
              aria-invalid={errors.sku ? 'true' : undefined}
              aria-describedby={getErrorId('sku')}
              className={`input ${errors.sku ? 'input-error' : ''}`}
            />
            {errors.sku && (
              <p id={getErrorId('sku')} className="text-status-error text-xs mt-1">
                {errors.sku}
              </p>
            )}
          </div>
        </div>

        <div className="equipment-form-row">
          <div className="equipment-form-field">
            <label htmlFor={`${formId}-category`} className="label">
              Category{' '}
              <span className="text-status-error" aria-hidden="true">
                *
              </span>
            </label>
            <select
              ref={categoryRef}
              id={`${formId}-category`}
              value={category}
              onChange={(e) => {
                const newCategory = e.target.value as EquipmentCategory | '';
                setCategory(newCategory);
                setSubcategory(''); // Reset subcategory
                handleFieldChange('category', newCategory);
              }}
              disabled={isLoading}
              aria-invalid={errors.category ? 'true' : undefined}
              aria-describedby={getErrorId('category')}
              className={`input ${errors.category ? 'input-error' : ''}`}
            >
              <option value="">Select category...</option>
              {EQUIPMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            {errors.category && (
              <p id={getErrorId('category')} className="text-status-error text-xs mt-1">
                {errors.category}
              </p>
            )}
          </div>

          <div className="equipment-form-field">
            <label htmlFor={`${formId}-subcategory`} className="label">
              Subcategory{' '}
              <span className="text-status-error" aria-hidden="true">
                *
              </span>
            </label>
            <select
              ref={subcategoryRef}
              id={`${formId}-subcategory`}
              value={subcategory}
              onChange={(e) => {
                setSubcategory(e.target.value);
                handleFieldChange('subcategory', e.target.value);
              }}
              disabled={isLoading || !category}
              aria-invalid={errors.subcategory ? 'true' : undefined}
              aria-describedby={getErrorId('subcategory')}
              className={`input ${errors.subcategory ? 'input-error' : ''}`}
            >
              <option value="">Select subcategory...</option>
              {subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub.charAt(0).toUpperCase() + sub.slice(1).replace('-', ' ')}
                </option>
              ))}
            </select>
            {errors.subcategory && (
              <p
                id={getErrorId('subcategory')}
                className="text-status-error text-xs mt-1"
              >
                {errors.subcategory}
              </p>
            )}
          </div>
        </div>

        <div className="equipment-form-field">
          <label htmlFor={`${formId}-description`} className="label">
            Description
          </label>
          <textarea
            ref={descriptionRef}
            id={`${formId}-description`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={3}
            className="input"
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="equipment-form-section">
        <h3 className="equipment-form-section-title">Pricing</h3>

        <div className="equipment-form-row">
          <div className="equipment-form-field">
            <label htmlFor={`${formId}-cost`} className="label">
              Cost
            </label>
            <input
              ref={costRef}
              id={`${formId}-cost`}
              type="number"
              min="0"
              step="0.01"
              value={cost}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                setCost(value);
                handleFieldChange('cost', value);
              }}
              disabled={isLoading}
              aria-invalid={errors.cost ? 'true' : undefined}
              aria-describedby={getErrorId('cost')}
              className={`input ${errors.cost ? 'input-error' : ''}`}
            />
            {errors.cost && (
              <p id={getErrorId('cost')} className="text-status-error text-xs mt-1">
                {errors.cost}
              </p>
            )}
          </div>

          <div className="equipment-form-field">
            <label htmlFor={`${formId}-msrp`} className="label">
              MSRP
            </label>
            <input
              ref={msrpRef}
              id={`${formId}-msrp`}
              type="number"
              min="0"
              step="0.01"
              value={msrp}
              onChange={(e) => {
                const value = e.target.value === '' ? '' : parseFloat(e.target.value);
                setMsrp(value);
                handleFieldChange('msrp', value);
              }}
              disabled={isLoading}
              aria-invalid={errors.msrp ? 'true' : undefined}
              aria-describedby={getErrorId('msrp')}
              className={`input ${errors.msrp ? 'input-error' : ''}`}
            />
            {errors.msrp && (
              <p id={getErrorId('msrp')} className="text-status-error text-xs mt-1">
                {errors.msrp}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Physical Specifications */}
      <div className="equipment-form-section">
        <h3 className="equipment-form-section-title">Physical Specifications</h3>

        <fieldset
          className="equipment-form-fieldset"
          role="group"
          aria-labelledby={`${formId}-dimensions-legend`}
        >
          <legend id={`${formId}-dimensions-legend`} className="label mb-2">
            Dimensions (inches)
          </legend>
          <div className="equipment-form-row equipment-form-row-3">
            <div className="equipment-form-field">
              <label htmlFor={`${formId}-height`} className="label text-xs">
                Height
              </label>
              <input
                ref={heightRef}
                id={`${formId}-height`}
                type="number"
                min="0"
                step="0.1"
                value={dimensions.height}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setDimensions((prev) => ({ ...prev, height: value }));
                  handleFieldChange('height', value);
                }}
                disabled={isLoading}
                aria-invalid={errors.height ? 'true' : undefined}
                aria-describedby={getErrorId('height')}
                className={`input ${errors.height ? 'input-error' : ''}`}
              />
              {errors.height && (
                <p id={getErrorId('height')} className="text-status-error text-xs mt-1">
                  {errors.height}
                </p>
              )}
            </div>

            <div className="equipment-form-field">
              <label htmlFor={`${formId}-width`} className="label text-xs">
                Width
              </label>
              <input
                ref={widthRef}
                id={`${formId}-width`}
                type="number"
                min="0"
                step="0.1"
                value={dimensions.width}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setDimensions((prev) => ({ ...prev, width: value }));
                  handleFieldChange('width', value);
                }}
                disabled={isLoading}
                aria-invalid={errors.width ? 'true' : undefined}
                aria-describedby={getErrorId('width')}
                className={`input ${errors.width ? 'input-error' : ''}`}
              />
              {errors.width && (
                <p id={getErrorId('width')} className="text-status-error text-xs mt-1">
                  {errors.width}
                </p>
              )}
            </div>

            <div className="equipment-form-field">
              <label htmlFor={`${formId}-depth`} className="label text-xs">
                Depth
              </label>
              <input
                ref={depthRef}
                id={`${formId}-depth`}
                type="number"
                min="0"
                step="0.1"
                value={dimensions.depth}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  setDimensions((prev) => ({ ...prev, depth: value }));
                  handleFieldChange('depth', value);
                }}
                disabled={isLoading}
                aria-invalid={errors.depth ? 'true' : undefined}
                aria-describedby={getErrorId('depth')}
                className={`input ${errors.depth ? 'input-error' : ''}`}
              />
              {errors.depth && (
                <p id={getErrorId('depth')} className="text-status-error text-xs mt-1">
                  {errors.depth}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        <div className="equipment-form-field mt-4">
          <label htmlFor={`${formId}-weight`} className="label">
            Weight (lbs)
          </label>
          <input
            ref={weightRef}
            id={`${formId}-weight`}
            type="number"
            min="0"
            step="0.1"
            value={weight}
            onChange={(e) => {
              const value = e.target.value === '' ? '' : parseFloat(e.target.value);
              setWeight(value);
              handleFieldChange('weight', value);
            }}
            disabled={isLoading}
            aria-invalid={errors.weight ? 'true' : undefined}
            aria-describedby={getErrorId('weight')}
            className={`input ${errors.weight ? 'input-error' : ''}`}
          />
          {errors.weight && (
            <p id={getErrorId('weight')} className="text-status-error text-xs mt-1">
              {errors.weight}
            </p>
          )}
        </div>
      </div>

      {/* Electrical Specifications (Collapsible) */}
      <div className="equipment-form-section">
        <button
          type="button"
          onClick={() => setElectricalExpanded(!electricalExpanded)}
          className="equipment-form-collapse-button"
          aria-expanded={electricalExpanded}
          aria-controls={`${formId}-electrical-section`}
        >
          <span>Electrical Specifications</span>
          <ChevronIcon expanded={electricalExpanded} />
        </button>

        {electricalExpanded && (
          <div
            id={`${formId}-electrical-section`}
            className="equipment-form-collapse-content"
          >
            <div className="equipment-form-row">
              <div className="equipment-form-field">
                <label htmlFor={`${formId}-voltage`} className="label">
                  Voltage (V)
                </label>
                <input
                  id={`${formId}-voltage`}
                  type="number"
                  min="0"
                  step="1"
                  value={electrical.voltage ?? ''}
                  onChange={(e) => {
                    const value =
                      e.target.value === '' ? undefined : parseInt(e.target.value);
                    setElectrical((prev) => ({ ...prev, voltage: value }));
                  }}
                  disabled={isLoading}
                  className="input"
                />
              </div>

              <div className="equipment-form-field">
                <label htmlFor={`${formId}-wattage`} className="label">
                  Wattage (W)
                </label>
                <input
                  id={`${formId}-wattage`}
                  type="number"
                  min="0"
                  step="0.1"
                  value={electrical.wattage ?? ''}
                  onChange={(e) => {
                    const value =
                      e.target.value === '' ? undefined : parseFloat(e.target.value);
                    setElectrical((prev) => ({ ...prev, wattage: value }));
                  }}
                  disabled={isLoading}
                  className="input"
                />
              </div>
            </div>

            <div className="equipment-form-row">
              <div className="equipment-form-field">
                <label htmlFor={`${formId}-amperage`} className="label">
                  Amperage (A)
                </label>
                <input
                  id={`${formId}-amperage`}
                  type="number"
                  min="0"
                  step="0.1"
                  value={electrical.amperage ?? ''}
                  onChange={(e) => {
                    const value =
                      e.target.value === '' ? undefined : parseFloat(e.target.value);
                    setElectrical((prev) => ({ ...prev, amperage: value }));
                  }}
                  disabled={isLoading}
                  className="input"
                />
              </div>

              <div className="equipment-form-field">
                <label htmlFor={`${formId}-poe-class`} className="label">
                  PoE Class
                </label>
                <input
                  id={`${formId}-poe-class`}
                  type="text"
                  value={electrical.poeClass ?? ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? undefined : e.target.value;
                    setElectrical((prev) => ({ ...prev, poeClass: value }));
                  }}
                  disabled={isLoading}
                  className="input"
                />
              </div>
            </div>

            <div className="equipment-form-field">
              <label htmlFor={`${formId}-btu`} className="label">
                BTU Output
              </label>
              <input
                id={`${formId}-btu`}
                type="number"
                min="0"
                step="1"
                value={electrical.btuOutput ?? ''}
                onChange={(e) => {
                  const value =
                    e.target.value === '' ? undefined : parseInt(e.target.value);
                  setElectrical((prev) => ({ ...prev, btuOutput: value }));
                }}
                disabled={isLoading}
                className="input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Platform Certifications */}
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
            onChange={(e) => setCertifications(e.target.value)}
            disabled={isLoading}
            placeholder="Teams, Zoom, Webex (comma-separated)"
            className="input"
          />
          <p className="text-text-secondary text-xs mt-1">
            Enter certifications separated by commas
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="equipment-form-actions">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" loading={isLoading} disabled={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

// Chevron Icon for collapse/expand
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s',
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
