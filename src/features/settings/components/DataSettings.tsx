/**
 * Data Settings Component
 *
 * Data export, import, and retention settings
 */

import { useEffect, useState } from 'react';
import { Button, Modal, ModalFooter } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/auth-store';
import { useOrgSettings, useUpdateOrgSettings } from '../use-settings';
import { ARCHIVE_MONTHS_OPTIONS, AUDIT_RETENTION_OPTIONS } from '../settings-types';

interface DataSettingsProps {
  userId: string;
  orgId: string;
  isAdmin: boolean;
}

type ExportFormat = 'json' | 'csv';

type ExportMeta = {
  exportedAt: string;
  userId: string;
  orgId: string;
  version: number;
};

type ExportPayload = {
  meta: ExportMeta;
  data: Record<string, unknown[]>;
};

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string) {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsv(payload: ExportPayload) {
  const rows: string[] = [];
  rows.push(['table', 'record'].map(escapeCsv).join(','));
  rows.push(['meta', escapeCsv(JSON.stringify(payload.meta))].join(','));

  Object.entries(payload.data).forEach(([table, records]) => {
    records.forEach((record) => {
      rows.push([escapeCsv(table), escapeCsv(JSON.stringify(record))].join(','));
    });
  });

  return rows.join('\n');
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function parseCsvExport(text: string): ExportPayload {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const data: Record<string, unknown[]> = {};
  let meta: ExportMeta | null = null;

  lines.slice(1).forEach((line) => {
    const [table, record] = parseCsvLine(line);
    if (!table || !record) return;
    if (table === 'meta') {
      meta = JSON.parse(record) as ExportMeta;
      return;
    }
    const parsed = JSON.parse(record) as unknown;
    if (!data[table]) data[table] = [];
    data[table].push(parsed);
  });

  if (!meta) {
    throw new Error('CSV export is missing metadata.');
  }

  return { meta, data };
}

export function DataSettings({ userId, orgId, isAdmin }: DataSettingsProps) {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const { data: orgSettings } = useOrgSettings(orgId);
  const updateMutation = useUpdateOrgSettings();

  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');
  const [exportError, setExportError] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const [usageCounts, setUsageCounts] = useState({
    projects: 0,
    rooms: 0,
    drawings: 0,
    equipment: 0,
  });
  const [usageLoading, setUsageLoading] = useState(false);

  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);
  const [showDeleteOrgModal, setShowDeleteOrgModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const loadUsage = async () => {
      setUsageLoading(true);
      const [projects, rooms, drawings, equipment] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('rooms').select('*', { count: 'exact', head: true }),
        supabase.from('drawings').select('*', { count: 'exact', head: true }),
        supabase.from('equipment').select('*', { count: 'exact', head: true }),
      ]);

      setUsageCounts({
        projects: projects.count ?? 0,
        rooms: rooms.count ?? 0,
        drawings: drawings.count ?? 0,
        equipment: equipment.count ?? 0,
      });
      setUsageLoading(false);
    };

    loadUsage();
  }, [orgId, userId]);

  const handleRetentionChange = (field: string, value: number | null) => {
    updateMutation.mutate({
      orgId,
      data: { [field]: value },
    });
  };

  const queryTable = async (
    table: string,
    filters: { column: string; value: string }[] = []
  ) => {
    let query = supabase.from(table as never).select('*');
    filters.forEach((filter) => {
      query = query.eq(filter.column as never, filter.value);
    });
    const { data, error } = await query;
    if (error) throw new Error(`${table}: ${error.message}`);
    return data as unknown[];
  };

  const buildExportPayload = async (): Promise<ExportPayload> => {
    const tableConfigs = [
      { key: 'clients', table: 'clients' },
      { key: 'client_contacts', table: 'client_contacts' },
      { key: 'projects', table: 'projects' },
      { key: 'rooms', table: 'rooms' },
      { key: 'room_equipment', table: 'room_equipment' },
      { key: 'quotes', table: 'quotes' },
      { key: 'drawings', table: 'drawings' },
      {
        key: 'templates',
        table: 'templates',
        filters: [{ column: 'org_id', value: orgId }],
      },
      { key: 'template_versions', table: 'template_versions' },
      {
        key: 'user_preferences',
        table: 'user_preferences',
        filters: [{ column: 'user_id', value: userId }],
      },
      {
        key: 'default_profiles',
        table: 'default_profiles',
        filters: [{ column: 'user_id', value: userId }],
      },
      {
        key: 'org_settings',
        table: 'org_settings',
        filters: [{ column: 'org_id', value: orgId }],
      },
    ];

    const entries = await Promise.all(
      tableConfigs.map(async (config) => {
        const rows = await queryTable(config.table, config.filters ?? []);
        return [config.key, rows] as const;
      })
    );

    return {
      meta: {
        exportedAt: new Date().toISOString(),
        userId,
        orgId,
        version: 1,
      },
      data: Object.fromEntries(entries),
    };
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const payload = await buildExportPayload();
      const timestamp = new Date().toISOString().split('T')[0];
      if (exportFormat === 'json') {
        downloadFile(
          JSON.stringify(payload, null, 2),
          `av-designer-export-${timestamp}.json`,
          'application/json'
        );
      } else {
        downloadFile(toCsv(payload), `av-designer-export-${timestamp}.csv`, 'text/csv');
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportStatus('Reading file...');

    try {
      const text = await file.text();
      const payload = file.name.endsWith('.csv')
        ? parseCsvExport(text)
        : (JSON.parse(text) as ExportPayload);

      if (!payload.meta || !payload.data) {
        throw new Error('Invalid export file.');
      }

      if (payload.meta.orgId !== orgId || payload.meta.userId !== userId) {
        throw new Error('Export metadata does not match your current org or user.');
      }

      const importOrder = [
        'clients',
        'client_contacts',
        'projects',
        'rooms',
        'room_equipment',
        'quotes',
        'drawings',
        'templates',
        'template_versions',
        'default_profiles',
        'user_preferences',
        'org_settings',
      ];

      for (const table of importOrder) {
        const rows = payload.data[table] ?? [];
        if (!rows.length) continue;
        const { error } = await supabase
          .from(table as never)
          .upsert(rows as never, { onConflict: 'id' });
        if (error) {
          throw new Error(`${table}: ${error.message}`);
        }
      }

      setImportStatus('Import complete.');
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Import failed');
      setImportStatus(null);
    } finally {
      event.target.value = '';
    }
  };

  const handleDeleteMyData = async () => {
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const deletions = [
        supabase.from('projects').delete().eq('user_id', userId),
        supabase.from('clients').delete().eq('created_by', userId),
        supabase
          .from('templates')
          .delete()
          .eq('owner_id', userId)
          .eq('scope', 'personal'),
        supabase.from('default_profiles').delete().eq('user_id', userId),
        supabase.from('user_preferences').delete().eq('user_id', userId),
      ];

      const results = await Promise.all(deletions);
      const errorResult = results.find((result) => result.error);
      if (errorResult?.error) throw new Error(errorResult.error.message);

      setShowDeleteDataModal(false);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete data');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteOrganization = async () => {
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const { error } = await supabase.functions.invoke('delete-organization', {
        body: { org_id: orgId },
      });
      if (error) throw error;

      await initializeAuth();
      setShowDeleteOrgModal(false);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : 'Failed to delete organization'
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalRecords =
    usageCounts.projects +
    usageCounts.rooms +
    usageCounts.drawings +
    usageCounts.equipment;
  const estimatedGb = Number((totalRecords * 0.002).toFixed(2));
  const storageLimitGb = orgSettings?.planStorageLimitGb ?? 10;
  const usagePercent = Math.min(100, Math.round((estimatedGb / storageLimitGb) * 100));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-text-primary">Data Management</h2>
        <p className="text-sm text-text-secondary mt-1">
          Export your data and manage retention policies
        </p>
      </div>

      {/* Export Data */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">Export Your Data</h3>

        <p className="text-sm text-text-secondary mb-4">
          Download your projects, rooms, quotes, templates, and settings in a portable
          format.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Export Format
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={() => setExportFormat('json')}
                  className="settings-radio"
                />
                <span className="text-sm text-text-primary">JSON (recommended)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                  className="settings-radio"
                />
                <span className="text-sm text-text-primary">CSV (table + record)</span>
              </label>
            </div>
          </div>

          <div className="p-4 bg-bg-secondary rounded-lg border border-border">
            <p className="text-sm font-medium text-text-primary mb-2">Export includes:</p>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>- Projects, rooms, and quotes</li>
              <li>- Clients and contacts</li>
              <li>- Templates and versions</li>
              <li>- User preferences and defaults</li>
            </ul>
          </div>

          {exportError && <p className="text-sm text-error">{exportError}</p>}

          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Preparing export...' : 'Export All Data'}
          </Button>
        </div>
      </section>

      {/* Import Data */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">Import Data</h3>

        <p className="text-sm text-text-secondary mb-4">
          Import data from a previous export. The export metadata must match your current
          org.
        </p>

        <div className="p-8 border-2 border-dashed border-border rounded-lg text-center">
          <input
            type="file"
            id="fileImport"
            className="hidden"
            accept=".json,.csv"
            onChange={handleImportFile}
          />
          <label
            htmlFor="fileImport"
            className="cursor-pointer text-sm text-text-secondary hover:text-text-primary"
          >
            <div className="mb-2">
              <svg
                className="mx-auto size-8 text-text-tertiary"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
            </div>
            <span className="text-accent-gold">Click to upload</span> or drag and drop
            <br />
            <span className="text-xs">JSON or CSV, max 50MB</span>
          </label>
        </div>

        {importStatus && <p className="text-sm text-green-500 mt-3">{importStatus}</p>}
        {importError && <p className="text-sm text-error mt-3">{importError}</p>}
      </section>

      {/* Data Retention (Admin Only) */}
      {isAdmin && (
        <section className="settings-section">
          <h3 className="text-sm font-medium text-text-primary mb-4">Data Retention</h3>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="autoArchive"
                className="block text-sm text-text-secondary mb-1"
              >
                Auto-archive completed projects after
              </label>
              <select
                id="autoArchive"
                value={orgSettings?.autoArchiveMonths ?? ''}
                onChange={(e) =>
                  handleRetentionChange(
                    'autoArchiveMonths',
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="settings-select"
              >
                {ARCHIVE_MONTHS_OPTIONS.map((opt) => (
                  <option key={opt.value ?? 'never'} value={opt.value ?? ''}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="auditRetention"
                className="block text-sm text-text-secondary mb-1"
              >
                Keep audit logs for
              </label>
              <select
                id="auditRetention"
                value={orgSettings?.auditLogRetentionYears ?? ''}
                onChange={(e) =>
                  handleRetentionChange(
                    'auditLogRetentionYears',
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="settings-select"
              >
                {AUDIT_RETENTION_OPTIONS.map((opt) => (
                  <option key={opt.value ?? 'forever'} value={opt.value ?? ''}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
              <p className="text-sm text-text-primary">
                <strong>Note:</strong> Changes to retention policies affect the entire
                organization.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Storage Usage */}
      <section className="settings-section">
        <h3 className="text-sm font-medium text-text-primary mb-4">Storage Usage</h3>

        {usageLoading ? (
          <div className="h-20 bg-bg-tertiary rounded-lg animate-pulse" />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">Estimated storage used</span>
              <span className="text-sm font-medium text-text-primary">
                {estimatedGb} GB / {storageLimitGb} GB
              </span>
            </div>

            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${usagePercent}%`,
                  background: 'linear-gradient(90deg, #6366F1, #06B6D4)',
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-bg-secondary rounded-lg">
                <p className="text-xs text-text-tertiary">Projects</p>
                <p className="text-lg font-semibold text-text-primary tabular-nums">
                  {usageCounts.projects}
                </p>
              </div>
              <div className="p-3 bg-bg-secondary rounded-lg">
                <p className="text-xs text-text-tertiary">Rooms</p>
                <p className="text-lg font-semibold text-text-primary tabular-nums">
                  {usageCounts.rooms}
                </p>
              </div>
              <div className="p-3 bg-bg-secondary rounded-lg">
                <p className="text-xs text-text-tertiary">Drawings</p>
                <p className="text-lg font-semibold text-text-primary tabular-nums">
                  {usageCounts.drawings}
                </p>
              </div>
              <div className="p-3 bg-bg-secondary rounded-lg">
                <p className="text-xs text-text-tertiary">Equipment</p>
                <p className="text-lg font-semibold text-text-primary tabular-nums">
                  {usageCounts.equipment}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Danger Zone */}
      <section className="settings-section border-error/20">
        <h3 className="text-sm font-medium text-error mb-4">Danger Zone</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg border border-border">
            <div>
              <p className="font-medium text-text-primary">Delete all my data</p>
              <p className="text-xs text-text-tertiary">
                Permanently delete your personal data and settings
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteDataModal(true)}
            >
              Delete My Data
            </Button>
          </div>

          {isAdmin && (
            <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-lg border border-border">
              <div>
                <p className="font-medium text-text-primary">Delete organization</p>
                <p className="text-xs text-text-tertiary">
                  Permanently delete the organization and all associated data
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteOrgModal(true)}
              >
                Delete Organization
              </Button>
            </div>
          )}
        </div>
      </section>

      <Modal
        isOpen={showDeleteDataModal}
        onClose={() => setShowDeleteDataModal(false)}
        title="Delete My Data"
        description="This action removes your personal projects, templates, and settings."
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            This does not delete your account, but your personal data will be removed.
          </p>
          {deleteError && <p className="text-sm text-error">{deleteError}</p>}
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteDataModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteMyData} disabled={deleteLoading}>
            {deleteLoading ? 'Deleting...' : 'Delete My Data'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal
        isOpen={showDeleteOrgModal}
        onClose={() => setShowDeleteOrgModal(false)}
        title="Delete Organization"
        description="This action is permanent and affects all members."
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            This deletes the organization, projects, templates, and billing history.
          </p>
          {deleteError && <p className="text-sm text-error">{deleteError}</p>}
        </div>
        <ModalFooter>
          <Button variant="secondary" onClick={() => setShowDeleteOrgModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteOrganization}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Organization'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
