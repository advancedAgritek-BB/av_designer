/**
 * Standards Page
 *
 * Standards management page wrapping the StandardsList component
 */
import { useState, useCallback } from 'react';
import { StandardsList } from '@/features/standards';
import type { StandardNode, Rule } from '@/types/standards';

export function StandardsPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>();

  const handleNodeSelect = useCallback((node: StandardNode) => {
    setSelectedNodeId(node.id);
  }, []);

  const handleRuleSelect = useCallback((rule: Rule) => {
    setSelectedRuleId(rule.id);
  }, []);

  return (
    <main role="main" data-testid="standards-page">
      <StandardsList
        selectedNodeId={selectedNodeId}
        selectedRuleId={selectedRuleId}
        onNodeSelect={handleNodeSelect}
        onRuleSelect={handleRuleSelect}
      />
    </main>
  );
}
