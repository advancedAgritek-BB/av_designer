/**
 * Quote Template Editor
 */
import { Button, Input } from '@/components/ui';
import type {
  QuoteTemplateContent,
  QuoteSectionConfig,
  QuoteLaborRate,
} from '../template-types';

interface QuoteTemplateEditorProps {
  value: QuoteTemplateContent;
  onChange: (value: QuoteTemplateContent) => void;
}

export function QuoteTemplateEditor({ value, onChange }: QuoteTemplateEditorProps) {
  const update = (updates: Partial<QuoteTemplateContent>) => {
    onChange({ ...value, ...updates });
  };

  const updateSection = (index: number, updates: Partial<QuoteSectionConfig>) => {
    const next = value.sections.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    update({ sections: next });
  };

  const addSection = () => {
    update({
      sections: [
        ...value.sections,
        { name: 'New Section', category: '', defaultMargin: 20 },
      ],
    });
  };

  const removeSection = (index: number) => {
    update({ sections: value.sections.filter((_, i) => i !== index) });
  };

  const updateLaborRate = (index: number, updates: Partial<QuoteLaborRate>) => {
    const next = value.laborRates.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    update({ laborRates: next });
  };

  const addLaborRate = () => {
    update({
      laborRates: [...value.laborRates, { category: 'General', ratePerHour: 85 }],
    });
  };

  const removeLaborRate = (index: number) => {
    update({ laborRates: value.laborRates.filter((_, i) => i !== index) });
  };

  const appliesToEquipment = value.taxSettings.appliesTo.includes('equipment');
  const appliesToLabor = value.taxSettings.appliesTo.includes('labor');

  const toggleAppliesTo = (key: 'equipment' | 'labor') => {
    const next = new Set(value.taxSettings.appliesTo);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    update({
      taxSettings: {
        ...value.taxSettings,
        appliesTo: Array.from(next),
      },
    });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary">Quote Sections</h3>
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" type="button" onClick={addSection}>
            Add Section
          </Button>
        </div>
        <div className="space-y-3">
          {value.sections.map((section, index) => (
            <div key={`${section.name}-${index}`} className="grid gap-3 md:grid-cols-4">
              <Input
                label="Name"
                value={section.name}
                onChange={(e) => updateSection(index, { name: e.target.value })}
              />
              <Input
                label="Category"
                value={section.category}
                onChange={(e) => updateSection(index, { category: e.target.value })}
              />
              <Input
                label="Default Margin (%)"
                type="number"
                min="0"
                max="99"
                value={section.defaultMargin}
                onChange={(e) =>
                  updateSection(index, { defaultMargin: Number(e.target.value) || 0 })
                }
              />
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => removeSection(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          {value.sections.length === 0 && (
            <p className="text-xs text-text-tertiary">
              Add sections to structure quotes.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary">Default Margins</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Equipment Margin (%)"
            type="number"
            min="0"
            max="99"
            value={value.defaultMargins.equipment}
            onChange={(e) =>
              update({
                defaultMargins: {
                  ...value.defaultMargins,
                  equipment: Number(e.target.value) || 0,
                },
              })
            }
          />
          <Input
            label="Labor Margin (%)"
            type="number"
            min="0"
            max="99"
            value={value.defaultMargins.labor}
            onChange={(e) =>
              update({
                defaultMargins: {
                  ...value.defaultMargins,
                  labor: Number(e.target.value) || 0,
                },
              })
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-secondary">Labor Rates</h3>
          <Button variant="secondary" size="sm" type="button" onClick={addLaborRate}>
            Add Rate
          </Button>
        </div>
        <div className="space-y-3">
          {value.laborRates.map((rate, index) => (
            <div key={`${rate.category}-${index}`} className="grid gap-3 md:grid-cols-3">
              <Input
                label="Category"
                value={rate.category}
                onChange={(e) => updateLaborRate(index, { category: e.target.value })}
              />
              <Input
                label="Rate per Hour"
                type="number"
                min="0"
                value={rate.ratePerHour}
                onChange={(e) =>
                  updateLaborRate(index, { ratePerHour: Number(e.target.value) || 0 })
                }
              />
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => removeLaborRate(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          {value.laborRates.length === 0 && (
            <p className="text-xs text-text-tertiary">
              Add labor rates for installation and programming.
            </p>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary">Tax Settings</h3>
        <div className="grid gap-4 md:grid-cols-2 items-end">
          <Input
            label="Tax Rate (%)"
            type="number"
            min="0"
            value={value.taxSettings.rate}
            onChange={(e) =>
              update({
                taxSettings: {
                  ...value.taxSettings,
                  rate: Number(e.target.value) || 0,
                },
              })
            }
          />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={appliesToEquipment}
                onChange={() => toggleAppliesTo('equipment')}
                className="rounded border-border bg-bg-secondary text-accent-gold focus:ring-accent-gold"
              />
              Equipment
            </label>
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={appliesToLabor}
                onChange={() => toggleAppliesTo('labor')}
                className="rounded border-border bg-bg-secondary text-accent-gold focus:ring-accent-gold"
              />
              Labor
            </label>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <label className="label" htmlFor="quote-terms">
          Terms & Conditions
        </label>
        <textarea
          id="quote-terms"
          value={value.termsText}
          onChange={(e) => update({ termsText: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-1 focus:ring-accent-gold resize-none"
          placeholder="Enter default quote terms..."
        />
      </section>
    </div>
  );
}
