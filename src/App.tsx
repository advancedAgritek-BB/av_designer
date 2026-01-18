import { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Shell } from '@/components/layout';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Card, CardHeader, CardBody } from '@/components/ui';
import { EquipmentList } from '@/features/equipment';
import { StandardsList } from '@/features/standards';
import { RoomBuilder } from '@/features/room-builder';
import { DrawingsPage } from '@/features/drawings';
import {
  QuotePage,
  createDefaultQuote,
  createDefaultQuoteTotals,
} from '@/features/quoting';
import { useAppStore } from '@/stores/app-store';
import type { Equipment } from '@/types/equipment';
import type { StandardNode, Rule } from '@/types/standards';

// Create QueryClient outside component to avoid re-creation on render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function AppContent() {
  const currentMode = useAppStore((state) => state.currentMode);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | undefined>();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>();

  const handleSearchClick = () => {
    // TODO: Implement search modal
  };

  const handleUserMenuClick = () => {
    // TODO: Implement user menu dropdown
  };

  const handleEquipmentSelect = useCallback((equipment: Equipment) => {
    setSelectedEquipmentId(equipment.id);
  }, []);

  const handleFavoriteToggle = useCallback((id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  }, []);

  const handleNodeSelect = useCallback((node: StandardNode) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleRuleSelect = useCallback((rule: Rule) => {
    setSelectedRuleId(rule.id);
  }, []);

  // Get current room ID from store for room builder
  const currentRoomId = useAppStore((state) => state.currentRoomId);

  // Render content based on current mode
  const renderContent = () => {
    switch (currentMode) {
      case 'equipment':
        return (
          <EquipmentList
            selectedId={selectedEquipmentId}
            favoriteIds={favoriteIds}
            onSelect={handleEquipmentSelect}
            onFavoriteToggle={handleFavoriteToggle}
          />
        );
      case 'standards':
        return (
          <StandardsList
            selectedNodeId={selectedNodeId}
            selectedRuleId={selectedRuleId}
            onNodeSelect={handleNodeSelect}
            onRuleSelect={handleRuleSelect}
          />
        );
      case 'room_design':
        return currentRoomId ? (
          <RoomBuilder roomId={currentRoomId} />
        ) : (
          <div className="flex items-center justify-center h-full text-text-secondary">
            Select a room to start designing
          </div>
        );
      case 'drawings':
        return currentRoomId ? (
          <DrawingsPage roomId={currentRoomId} />
        ) : (
          <div className="flex items-center justify-center h-full text-text-secondary">
            Select a room to view drawings
          </div>
        );
      case 'quoting':
        return currentRoomId ? (
          <QuotePage
            quote={{
              ...createDefaultQuote('proj-1', currentRoomId),
              totals: createDefaultQuoteTotals(),
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-text-secondary">
            Select a room to view quotes
          </div>
        );
      case 'home':
      default:
        return <HomeContent />;
    }
  };

  return (
    <Shell
      userInitials="AV"
      onSearchClick={handleSearchClick}
      onUserMenuClick={handleUserMenuClick}
    >
      {renderContent()}
    </Shell>
  );
}

function HomeContent() {
  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">Welcome to AV Designer</h1>
      <p className="text-text-secondary">
        Design system initialized with Tailwind CSS. Use the sidebar to navigate.
      </p>

      <Card>
        <CardHeader title="Button Variants" description="Primary design system buttons" />
        <CardBody>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" loading>
              Loading
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Input Component"
          description="Form input with various states"
        />
        <CardBody>
          <div className="grid gap-4 max-w-md">
            <Input label="Default Input" placeholder="Enter text..." />
            <Input
              label="With Helper Text"
              placeholder="Enter your email"
              helperText="We'll never share your email"
            />
            <Input
              label="Error State"
              placeholder="Enter password"
              error="Password must be at least 8 characters"
            />
            <Input label="Disabled Input" placeholder="Cannot edit" disabled />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Status Pills" description="Project status indicators" />
        <CardBody>
          <div className="flex flex-wrap gap-2">
            <span className="pill pill-quoting">Quoting</span>
            <span className="pill pill-review">Client Review</span>
            <span className="pill pill-ordered">Ordered</span>
            <span className="pill pill-progress">In Progress</span>
            <span className="pill pill-hold">On Hold</span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Color Palette" description="Design system colors" />
        <CardBody>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-12 bg-bg-primary border border-white/10 rounded-md" />
              <p className="text-xs text-text-tertiary">bg-primary</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-bg-secondary rounded-md" />
              <p className="text-xs text-text-tertiary">bg-secondary</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-bg-tertiary rounded-md" />
              <p className="text-xs text-text-tertiary">bg-tertiary</p>
            </div>
            <div className="space-y-2">
              <div className="h-12 bg-accent-gold rounded-md" />
              <p className="text-xs text-text-tertiary">accent-gold</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
