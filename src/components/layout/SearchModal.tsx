import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/components/ui/Modal';
import { ROUTES } from '@/routes';
import { useClientSearch } from '@/features/clients/use-clients';
import { useProjectSearch } from '@/features/projects/use-projects';
import { useEquipmentSearch } from '@/features/equipment/use-equipment';
import type { Client } from '@/features/clients/client-types';
import type { Project } from '@/types';
import type { Equipment } from '@/types/equipment';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ResultKind = 'navigation' | 'client' | 'project' | 'equipment';

interface SearchResult {
  id: string;
  label: string;
  description?: string;
  href: string;
  kind: ResultKind;
}

const NAV_ITEMS: SearchResult[] = [
  {
    id: 'home',
    label: 'Home',
    description: 'Dashboard overview',
    href: ROUTES.HOME,
    kind: 'navigation',
  },
  {
    id: 'clients',
    label: 'Clients',
    description: 'Client directory',
    href: ROUTES.CLIENTS,
    kind: 'navigation',
  },
  {
    id: 'projects',
    label: 'Projects',
    description: 'Active projects',
    href: ROUTES.PROJECTS,
    kind: 'navigation',
  },
  {
    id: 'equipment',
    label: 'Equipment',
    description: 'Equipment catalog',
    href: ROUTES.EQUIPMENT,
    kind: 'navigation',
  },
  {
    id: 'standards',
    label: 'Standards',
    description: 'Design standards',
    href: ROUTES.STANDARDS,
    kind: 'navigation',
  },
  {
    id: 'templates',
    label: 'Templates',
    description: 'Templates library',
    href: ROUTES.TEMPLATES,
    kind: 'navigation',
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Account and org settings',
    href: ROUTES.SETTINGS,
    kind: 'navigation',
  },
];

function mapClients(clients: Client[]): SearchResult[] {
  return clients.map((client) => ({
    id: client.id,
    label: client.name,
    description: client.industry || client.website || 'Client',
    href: `${ROUTES.CLIENTS}/${client.id}`,
    kind: 'client',
  }));
}

function mapProjects(projects: Project[]): SearchResult[] {
  return projects.map((project) => ({
    id: project.id,
    label: project.name,
    description: project.clientName || 'Project',
    href: `${ROUTES.PROJECTS}/${project.id}`,
    kind: 'project',
  }));
}

function mapEquipment(items: Equipment[]): SearchResult[] {
  return items.map((item) => ({
    id: item.id,
    label: `${item.manufacturer} ${item.model}`,
    description: item.sku,
    href: `${ROUTES.EQUIPMENT}?q=${encodeURIComponent(item.sku)}`,
    kind: 'equipment',
  }));
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const trimmedQuery = query.trim();
  const isSearchActive = trimmedQuery.length >= 2;

  const clientQuery = useClientSearch(trimmedQuery);
  const projectQuery = useProjectSearch(trimmedQuery);
  const equipmentQuery = useEquipmentSearch(trimmedQuery);

  useEffect(() => {
    if (!isOpen) return;
    const handle = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(handle);
  }, [isOpen]);

  const navigationResults = useMemo(() => {
    if (!trimmedQuery) return NAV_ITEMS;
    const lower = trimmedQuery.toLowerCase();
    return NAV_ITEMS.filter((item) => item.label.toLowerCase().includes(lower));
  }, [trimmedQuery]);

  const clientResults = useMemo(
    () => mapClients(clientQuery.data ?? []),
    [clientQuery.data]
  );
  const projectResults = useMemo(
    () => mapProjects(projectQuery.data ?? []),
    [projectQuery.data]
  );
  const equipmentResults = useMemo(
    () => mapEquipment(equipmentQuery.data ?? []),
    [equipmentQuery.data]
  );

  const isLoading =
    isSearchActive &&
    (clientQuery.isLoading || projectQuery.isLoading || equipmentQuery.isLoading);

  const hasResults =
    navigationResults.length > 0 ||
    clientResults.length > 0 ||
    projectResults.length > 0 ||
    equipmentResults.length > 0;

  const handleSelect = (result: SearchResult) => {
    navigate(result.href);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Search"
      description="Search across clients, projects, and equipment"
      size="lg"
      className="search-modal"
    >
      <div className="search-modal-body">
        <div className="search-modal-input-row">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, SKU, or client..."
            className="search-modal-input"
            aria-label="Search"
          />
          {query && (
            <button
              type="button"
              className="search-modal-clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>
        <p className="search-modal-hint">Type at least 2 characters to search.</p>

        <div className="search-modal-results" role="list">
          {isLoading && <div className="search-modal-status">Searching...</div>}

          {!isSearchActive && (
            <SearchSection
              title="Navigation"
              items={navigationResults}
              onSelect={handleSelect}
            />
          )}

          {isSearchActive && hasResults && (
            <>
              <SearchSection
                title="Navigation"
                items={navigationResults}
                onSelect={handleSelect}
              />
              <SearchSection
                title="Clients"
                items={clientResults}
                onSelect={handleSelect}
              />
              <SearchSection
                title="Projects"
                items={projectResults}
                onSelect={handleSelect}
              />
              <SearchSection
                title="Equipment"
                items={equipmentResults}
                onSelect={handleSelect}
              />
            </>
          )}

          {isSearchActive && !isLoading && !hasResults && (
            <div className="search-modal-status">No results found.</div>
          )}
        </div>
      </div>
    </Modal>
  );
}

interface SearchSectionProps {
  title: string;
  items: SearchResult[];
  onSelect: (result: SearchResult) => void;
}

function SearchSection({ title, items, onSelect }: SearchSectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="search-modal-section">
      <h3 className="search-modal-section-title">{title}</h3>
      <div className="search-modal-section-items" role="list">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="search-modal-item"
            onClick={() => onSelect(item)}
            role="listitem"
          >
            <div>
              <p className="search-modal-item-title">{item.label}</p>
              {item.description && (
                <p className="search-modal-item-description">{item.description}</p>
              )}
            </div>
            <span className="search-modal-item-kind">{item.kind}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
