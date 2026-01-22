/**
 * Project Template Editor
 */
import { Button, Input } from '@/components/ui';
import { useTemplateList } from '../use-templates';
import type { ProjectTemplateContent, ProjectRoomTemplate } from '../template-types';

interface ProjectTemplateEditorProps {
  value: ProjectTemplateContent;
  onChange: (value: ProjectTemplateContent) => void;
}

export function ProjectTemplateEditor({ value, onChange }: ProjectTemplateEditorProps) {
  const { data: roomTemplates = [] } = useTemplateList({
    type: 'room',
    isArchived: false,
  });

  const update = (updates: Partial<ProjectTemplateContent>) => {
    onChange({ ...value, ...updates });
  };

  const updateRoomTemplate = (index: number, updates: Partial<ProjectRoomTemplate>) => {
    const next = value.roomTemplates.map((item, i) =>
      i === index ? { ...item, ...updates } : item
    );
    update({ roomTemplates: next });
  };

  const addRoomTemplate = () => {
    update({
      roomTemplates: [
        ...value.roomTemplates,
        { templateId: '', defaultName: 'New Room', quantity: 1 },
      ],
    });
  };

  const removeRoomTemplate = (index: number) => {
    update({ roomTemplates: value.roomTemplates.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-secondary">Room Templates</h3>
          <Button variant="secondary" size="sm" type="button" onClick={addRoomTemplate}>
            Add Room
          </Button>
        </div>

        {value.roomTemplates.length === 0 && (
          <p className="text-xs text-text-tertiary">
            Add room templates to build projects quickly.
          </p>
        )}

        <div className="space-y-3">
          {value.roomTemplates.map((room, index) => (
            <div
              key={`${room.templateId}-${index}`}
              className="grid gap-3 md:grid-cols-5"
            >
              <div className="md:col-span-2">
                <label className="label" htmlFor={`project-room-template-${index}`}>
                  Room Template
                </label>
                <select
                  id={`project-room-template-${index}`}
                  className="input"
                  value={room.templateId}
                  onChange={(e) =>
                    updateRoomTemplate(index, { templateId: e.target.value })
                  }
                >
                  <option value="">Select template</option>
                  {roomTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Default Name"
                value={room.defaultName}
                onChange={(e) =>
                  updateRoomTemplate(index, { defaultName: e.target.value })
                }
              />
              <Input
                label="Quantity"
                type="number"
                min="1"
                value={room.quantity}
                onChange={(e) =>
                  updateRoomTemplate(index, { quantity: Number(e.target.value) || 1 })
                }
              />
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => removeRoomTemplate(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-medium text-text-secondary">Client Defaults</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Industry"
            value={value.clientDefaults.industry || ''}
            onChange={(e) =>
              update({
                clientDefaults: { ...value.clientDefaults, industry: e.target.value },
              })
            }
          />
          <Input
            label="Standards Profile"
            value={value.clientDefaults.standardsProfile || ''}
            onChange={(e) =>
              update({
                clientDefaults: {
                  ...value.clientDefaults,
                  standardsProfile: e.target.value,
                },
              })
            }
          />
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
    </div>
  );
}
