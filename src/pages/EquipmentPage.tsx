/**
 * Equipment Page
 *
 * Equipment library management page wrapping the EquipmentList component
 */
import { useState, useCallback } from 'react';
import { EquipmentList } from '@/features/equipment';
import type { Equipment } from '@/types/equipment';

export function EquipmentPage() {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | undefined>();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const handleEquipmentSelect = useCallback((equipment: Equipment) => {
    setSelectedEquipmentId(equipment.id);
  }, []);

  const handleFavoriteToggle = useCallback((id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  }, []);

  return (
    <main role="main" data-testid="equipment-page">
      <EquipmentList
        selectedId={selectedEquipmentId}
        favoriteIds={favoriteIds}
        onSelect={handleEquipmentSelect}
        onFavoriteToggle={handleFavoriteToggle}
      />
    </main>
  );
}
