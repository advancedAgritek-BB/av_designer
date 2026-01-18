/**
 * Equipment Form Component
 *
 * Composable form for creating and editing equipment items.
 * Uses extracted section components for modularity.
 *
 * IMPORTANT: When switching between create/edit modes, use a key prop on this component
 * to force a full re-mount: <EquipmentForm key={mode + equipment?.id} ... />
 */

import { useState, useRef, useCallback, useId } from 'react';
import { Button } from '@/components/ui/Button';
import type { EquipmentCategory, EquipmentFormData, Dimensions } from '@/types/equipment';
import type { EquipmentFormProps, FormErrors } from './equipment-form-types';
import { getInitialState } from './equipment-form-types';
import {
  validateField,
  validateForm,
  FIELD_FOCUS_ORDER,
} from './equipment-form-validation';
import { EquipmentFormBasicInfo, type BasicInfoRef } from './EquipmentFormBasicInfo';
import { EquipmentFormPricing, type PricingRef } from './EquipmentFormPricing';
import {
  EquipmentFormPhysicalSpecs,
  type PhysicalSpecsRef,
} from './EquipmentFormPhysicalSpecs';
import { EquipmentFormElectrical } from './EquipmentFormElectrical';
import { EquipmentFormCertifications } from './EquipmentFormCertifications';

export type { EquipmentFormProps } from './equipment-form-types';

export function EquipmentForm({
  mode,
  equipment,
  onSubmit,
  onCancel,
  isLoading = false,
}: EquipmentFormProps) {
  const formId = useId();
  const initialState = getInitialState(mode, equipment);

  // Form state
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
  const [electrical, setElectrical] = useState(initialState.electrical);
  const [certifications, setCertifications] = useState(initialState.certifications);
  const [errors, setErrors] = useState<FormErrors>({});

  // Section refs for focus management
  const basicInfoRef = useRef<BasicInfoRef>(null);
  const pricingRef = useRef<PricingRef>(null);
  const physicalSpecsRef = useRef<PhysicalSpecsRef>(null);

  // Update error state when field changes
  const handleFieldChange = useCallback((field: keyof FormErrors, value: unknown) => {
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
  }, []);

  // Focus first error field
  const focusFirstError = useCallback((validationErrors: FormErrors) => {
    const errorFields = Object.keys(validationErrors) as (keyof FormErrors)[];
    if (errorFields.length === 0) return;

    for (const field of FIELD_FOCUS_ORDER) {
      if (errorFields.includes(field)) {
        switch (field) {
          case 'manufacturer':
            basicInfoRef.current?.focusManufacturer();
            break;
          case 'model':
            basicInfoRef.current?.focusModel();
            break;
          case 'sku':
            basicInfoRef.current?.focusSku();
            break;
          case 'category':
            basicInfoRef.current?.focusCategory();
            break;
          case 'subcategory':
            basicInfoRef.current?.focusSubcategory();
            break;
          case 'description':
            basicInfoRef.current?.focusDescription();
            break;
          case 'cost':
            pricingRef.current?.focusCost();
            break;
          case 'msrp':
            pricingRef.current?.focusMsrp();
            break;
          case 'height':
            physicalSpecsRef.current?.focusHeight();
            break;
          case 'width':
            physicalSpecsRef.current?.focusWidth();
            break;
          case 'depth':
            physicalSpecsRef.current?.focusDepth();
            break;
          case 'weight':
            physicalSpecsRef.current?.focusWeight();
            break;
        }
        break;
      }
    }
  }, []);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formState = {
      manufacturer,
      model,
      sku,
      category,
      subcategory,
      description,
      cost,
      msrp,
      dimensions,
      weight,
      electrical,
      certifications,
    };

    const validationErrors = validateForm(formState);
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

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    onCancel?.();
  };

  const formAriaLabel = mode === 'create' ? 'Add new equipment' : 'Edit equipment';
  const submitLabel = mode === 'create' ? 'Add Equipment' : 'Save Changes';

  return (
    <form aria-label={formAriaLabel} onSubmit={handleSubmit} className="equipment-form">
      <EquipmentFormBasicInfo
        ref={basicInfoRef}
        formId={formId}
        manufacturer={manufacturer}
        model={model}
        sku={sku}
        category={category}
        subcategory={subcategory}
        description={description}
        errors={errors}
        isLoading={isLoading}
        onManufacturerChange={(value) => {
          setManufacturer(value);
          handleFieldChange('manufacturer', value);
        }}
        onModelChange={(value) => {
          setModel(value);
          handleFieldChange('model', value);
        }}
        onSkuChange={(value) => {
          setSku(value);
          handleFieldChange('sku', value);
        }}
        onCategoryChange={(value) => {
          setCategory(value);
          setSubcategory('');
          handleFieldChange('category', value);
        }}
        onSubcategoryChange={(value) => {
          setSubcategory(value);
          handleFieldChange('subcategory', value);
        }}
        onDescriptionChange={setDescription}
      />

      <EquipmentFormPricing
        ref={pricingRef}
        formId={formId}
        cost={cost}
        msrp={msrp}
        errors={errors}
        isLoading={isLoading}
        onCostChange={(value) => {
          setCost(value);
          handleFieldChange('cost', value);
        }}
        onMsrpChange={(value) => {
          setMsrp(value);
          handleFieldChange('msrp', value);
        }}
      />

      <EquipmentFormPhysicalSpecs
        ref={physicalSpecsRef}
        formId={formId}
        dimensions={dimensions}
        weight={weight}
        errors={errors}
        isLoading={isLoading}
        onDimensionChange={(dimension, value) => {
          setDimensions((prev) => ({ ...prev, [dimension]: value }));
          handleFieldChange(dimension, value);
        }}
        onWeightChange={(value) => {
          setWeight(value);
          handleFieldChange('weight', value);
        }}
      />

      <EquipmentFormElectrical
        formId={formId}
        electrical={electrical}
        isLoading={isLoading}
        onChange={setElectrical}
      />

      <EquipmentFormCertifications
        formId={formId}
        certifications={certifications}
        isLoading={isLoading}
        onChange={setCertifications}
      />

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
