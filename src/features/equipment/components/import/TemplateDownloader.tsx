/**
 * TemplateDownloader Component
 *
 * Download vendor template CSV files
 */

import { VENDOR_TEMPLATES } from '../../import-service';

interface TemplateDownloaderProps {
  onSelectTemplate?: (templateId: string) => void;
}

const BASE_URL = import.meta.env.BASE_URL || '/';

function buildTemplateUrl(filename: string) {
  const base = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
  return `${base}import-templates/${filename}`;
}

export function TemplateDownloader({ onSelectTemplate }: TemplateDownloaderProps) {
  const distributorTemplates = VENDOR_TEMPLATES.filter((t) => t.type === 'distributor');
  const manufacturerTemplates = VENDOR_TEMPLATES.filter((t) => t.type === 'manufacturer');

  const handleDownload = async (filename: string) => {
    const url = buildTemplateUrl(filename);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Template not found');
      }
      const blob = await response.blob();
      const fileUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(fileUrl);
    } catch {
      const fallback = document.createElement('a');
      fallback.href = url;
      fallback.download = filename;
      document.body.appendChild(fallback);
      fallback.click();
      document.body.removeChild(fallback);
    }
  };

  return (
    <div className="template-downloader">
      <h4 className="text-sm font-medium text-text-primary mb-3">
        Or download a template:
      </h4>

      {/* Distributor Templates */}
      <div className="mb-4">
        <p className="text-xs text-text-tertiary mb-2">Distributors</p>
        <div className="flex flex-wrap gap-2">
          {distributorTemplates.slice(0, 4).map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                void handleDownload(template.filename);
                onSelectTemplate?.(template.id);
              }}
              className="px-3 py-1.5 text-xs bg-bg-tertiary hover:bg-bg-secondary text-text-secondary rounded border border-border transition-colors"
            >
              {template.name}
            </button>
          ))}
          {distributorTemplates.length > 4 && (
            <div className="relative group">
              <button
                type="button"
                className="px-3 py-1.5 text-xs bg-bg-tertiary hover:bg-bg-secondary text-text-secondary rounded border border-border transition-colors"
              >
                More...
              </button>
              <div className="absolute top-full left-0 mt-1 py-1 bg-bg-primary border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-32">
                {distributorTemplates.slice(4).map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      void handleDownload(template.filename);
                      onSelectTemplate?.(template.id);
                    }}
                    className="block w-full px-3 py-1.5 text-xs text-left text-text-secondary hover:bg-bg-secondary"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manufacturer Templates */}
      {manufacturerTemplates.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-text-tertiary mb-2">Manufacturers</p>
          <div className="flex flex-wrap gap-2">
            {manufacturerTemplates.slice(0, 4).map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => {
                  void handleDownload(template.filename);
                  onSelectTemplate?.(template.id);
                }}
                className="px-3 py-1.5 text-xs bg-bg-tertiary hover:bg-bg-secondary text-text-secondary rounded border border-border transition-colors"
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generic Template */}
      <div>
        <p className="text-xs text-text-tertiary mb-2">Generic</p>
        <button
          type="button"
          onClick={() => {
            void handleDownload('generic.csv');
          }}
          className="px-3 py-1.5 text-xs bg-accent-gold/20 hover:bg-accent-gold/30 text-accent-gold rounded border border-accent-gold/30 transition-colors"
        >
          Download Generic Template
        </button>
      </div>
    </div>
  );
}
