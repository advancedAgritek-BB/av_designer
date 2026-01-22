/**
 * Client Detail Page
 *
 * Shows detailed client information with tabs for overview, contacts, and projects
 */
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Card, CardBody } from '@/components/ui';
import { useClient } from '../use-clients';
import { useProjectsByClient } from '@/features/projects/use-projects';
import { ProjectsList } from '@/features/projects/components/ProjectsList';
import type { Project } from '@/types';
import { ClientOverviewTab } from './ClientOverviewTab';
import { ClientContactsTab } from './ClientContactsTab';

type TabId = 'overview' | 'contacts' | 'projects';

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'projects', label: 'Projects' },
];

/**
 * Tab navigation
 */
function TabNav({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <nav className="flex border-b border-border" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === tab.id
              ? 'border-accent-gold text-accent-gold'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

/**
 * Loading skeleton
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 bg-bg-tertiary rounded animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-bg-tertiary rounded animate-pulse" />
          <div className="h-4 w-32 bg-bg-tertiary rounded animate-pulse" />
        </div>
      </div>
      <Card>
        <CardBody>
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-24 bg-bg-tertiary rounded" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="h-4 w-full bg-bg-tertiary rounded" />
                <div className="h-4 w-3/4 bg-bg-tertiary rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-bg-tertiary rounded" />
                <div className="h-4 w-2/3 bg-bg-tertiary rounded" />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

/**
 * Error state
 */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-16 mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-red-400"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2 text-balance">
        Failed to load client
      </h3>
      <p className="text-text-secondary mb-6 max-w-sm text-pretty">{message}</p>
      <Button onClick={onRetry}>Try Again</Button>
    </div>
  );
}

/**
 * Not found state
 */
function NotFoundState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="size-16 mb-4 rounded-full bg-bg-tertiary flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-text-tertiary"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-text-primary mb-2 text-balance">
        Client not found
      </h3>
      <p className="text-text-secondary mb-6 max-w-sm text-pretty">
        The client you're looking for doesn't exist or has been deleted.
      </p>
      <Link to="/clients">
        <Button>Back to Clients</Button>
      </Link>
    </div>
  );
}

/**
 * Projects tab content
 */
function ProjectsTab({ clientId }: { clientId: string }) {
  const navigate = useNavigate();
  const { data: projects, isLoading, error, refetch } = useProjectsByClient(clientId);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardBody>
              <div className="animate-pulse space-y-3">
                <div className="h-5 w-40 bg-bg-tertiary rounded" />
                <div className="h-4 w-28 bg-bg-tertiary rounded" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-400">Failed to load projects</p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">No projects for this client yet.</p>
        <Button variant="secondary" size="sm" onClick={() => navigate('/projects')}>
          Create Project
        </Button>
      </div>
    );
  }

  return (
    <ProjectsList
      projects={projects as Project[]}
      onProjectClick={(project) => navigate(`/projects/${project.id}`)}
      layout="grid"
    />
  );
}

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const { data: client, isLoading, error, refetch } = useClient(id || '');

  if (isLoading) {
    return (
      <main role="main" data-testid="client-detail-page" className="space-y-6">
        <LoadingSkeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main role="main" data-testid="client-detail-page">
        <ErrorState
          message={
            error instanceof Error ? error.message : 'An unexpected error occurred'
          }
          onRetry={() => refetch()}
        />
      </main>
    );
  }

  if (!client) {
    return (
      <main role="main" data-testid="client-detail-page">
        <NotFoundState />
      </main>
    );
  }

  return (
    <main role="main" data-testid="client-detail-page" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/clients')}
            className="text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Back to clients"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary text-balance">
              {client.name}
            </h1>
            {client.industry && (
              <p className="text-text-secondary mt-0.5">{client.industry}</p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <Card>
        <CardBody>
          {activeTab === 'overview' && <ClientOverviewTab client={client} />}
          {activeTab === 'contacts' && <ClientContactsTab clientId={client.id} />}
          {activeTab === 'projects' && <ProjectsTab clientId={client.id} />}
        </CardBody>
      </Card>
    </main>
  );
}
