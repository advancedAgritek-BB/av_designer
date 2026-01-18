/**
 * StandardsList Component
 *
 * Displays a hierarchical tree of standards with rules.
 * Supports aspect filtering, node expansion, and selection.
 */

import { useState, useCallback, useId, useMemo } from 'react';
import { useNodesList, useRulesList, useRulesByAspect } from '../use-standards';
import {
  TreeNode,
  RuleItem,
  LoadingState,
  EmptyState,
  ErrorState,
} from './standards-list-components';
import { RULE_ASPECTS } from '@/types/standards';
import type { StandardNode, Rule, RuleAspect } from '@/types/standards';

interface StandardsListProps {
  selectedNodeId?: string;
  selectedRuleId?: string;
  onNodeSelect?: (node: StandardNode) => void;
  onRuleSelect?: (rule: Rule) => void;
}

type AspectFilter = 'all' | RuleAspect;

const ASPECT_LABELS: Record<AspectFilter, string> = {
  all: 'All',
  equipment_selection: 'Equipment',
  quantities: 'Quantities',
  placement: 'Placement',
  configuration: 'Configuration',
  cabling: 'Cabling',
  commercial: 'Commercial',
};

/**
 * Standards list with hierarchical tree and rule filtering.
 */
export function StandardsList({
  selectedNodeId,
  selectedRuleId,
  onNodeSelect,
  onRuleSelect,
}: StandardsListProps) {
  const [activeAspect, setActiveAspect] = useState<AspectFilter>('all');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const tabPanelId = useId();

  // Fetch data
  const nodesQuery = useNodesList();
  const allRulesQuery = useRulesList();
  const aspectRulesQuery = useRulesByAspect(
    activeAspect === 'all' ? 'equipment_selection' : activeAspect
  );

  // Determine which rules to display
  const isAspectFilter = activeAspect !== 'all';
  const rules = isAspectFilter
    ? (aspectRulesQuery.data ?? [])
    : (allRulesQuery.data ?? []);

  const nodes = useMemo(() => nodesQuery.data ?? [], [nodesQuery.data]);
  const isLoading = nodesQuery.isLoading;
  const isError = nodesQuery.isError;
  const error = nodesQuery.error;

  // Build tree structure
  const rootNodes = useMemo(() => {
    return nodes
      .filter((node) => node.parentId === null)
      .sort((a, b) => a.order - b.order);
  }, [nodes]);

  const getChildNodes = useCallback(
    (parentId: string) => {
      return nodes
        .filter((node) => node.parentId === parentId)
        .sort((a, b) => a.order - b.order);
    },
    [nodes]
  );

  const handleAspectChange = useCallback((aspect: AspectFilter) => {
    setActiveAspect(aspect);
  }, []);

  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleNodeClick = useCallback(
    (node: StandardNode) => {
      if (node.type === 'folder') {
        handleToggleExpand(node.id);
      }
      onNodeSelect?.(node);
    },
    [handleToggleExpand, onNodeSelect]
  );

  const handleNodeKeyDown = useCallback(
    (e: React.KeyboardEvent, node: StandardNode) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNodeClick(node);
      } else if (e.key === 'ArrowRight' && node.type === 'folder') {
        e.preventDefault();
        setExpandedNodes((prev) => new Set(prev).add(node.id));
      } else if (e.key === 'ArrowLeft' && node.type === 'folder') {
        e.preventDefault();
        setExpandedNodes((prev) => {
          const next = new Set(prev);
          next.delete(node.id);
          return next;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const treeItems = document.querySelectorAll('[role="treeitem"]');
        const currentIndex = Array.from(treeItems).indexOf(e.currentTarget as Element);
        const nextItem = treeItems[currentIndex + 1] as HTMLElement;
        nextItem?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const treeItems = document.querySelectorAll('[role="treeitem"]');
        const currentIndex = Array.from(treeItems).indexOf(e.currentTarget as Element);
        const prevItem = treeItems[currentIndex - 1] as HTMLElement;
        prevItem?.focus();
      }
    },
    [handleNodeClick]
  );

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const tabs = ['all', ...RULE_ASPECTS] as AspectFilter[];
      const currentIndex = tabs.indexOf(activeAspect);

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % tabs.length;
        setActiveAspect(tabs[nextIndex]);
        const nextTab = document.querySelector(
          `[role="tab"][data-aspect="${tabs[nextIndex]}"]`
        ) as HTMLButtonElement;
        nextTab?.focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        setActiveAspect(tabs[prevIndex]);
        const prevTab = document.querySelector(
          `[role="tab"][data-aspect="${tabs[prevIndex]}"]`
        ) as HTMLButtonElement;
        prevTab?.focus();
      }
    },
    [activeAspect]
  );

  const ruleCount = rules.length;

  return (
    <section className="standards-list" aria-label="Standards catalog" role="region">
      {/* Header */}
      <div className="standards-list-header">
        <div className="standards-list-title-row">
          <h1 className="standards-list-title">Standards</h1>
          {!isLoading && !isError && (
            <span className="standards-list-count">
              {ruleCount} {ruleCount === 1 ? 'rule' : 'rules'}
            </span>
          )}
        </div>
      </div>

      {/* Aspect Tabs */}
      <div
        role="tablist"
        aria-label="Rule aspects"
        className="standards-list-tabs"
        onKeyDown={handleTabKeyDown}
      >
        {(['all', ...RULE_ASPECTS] as AspectFilter[]).map((aspect) => (
          <button
            key={aspect}
            role="tab"
            type="button"
            data-aspect={aspect}
            aria-selected={activeAspect === aspect}
            aria-controls={tabPanelId}
            tabIndex={activeAspect === aspect ? 0 : -1}
            onClick={() => handleAspectChange(aspect)}
            className={`standards-list-tab ${activeAspect === aspect ? 'standards-list-tab-active' : ''}`}
          >
            {ASPECT_LABELS[aspect]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div id={tabPanelId} role="tabpanel" aria-label="Standards content">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState
            message={error?.message ?? 'Failed to load standards'}
            onRetry={() => nodesQuery.refetch?.()}
          />
        ) : nodes.length === 0 && rules.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="standards-list-content">
            {/* Tree View */}
            <div className="standards-tree" role="tree" aria-label="Standards hierarchy">
              {rootNodes.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  level={0}
                  expandedNodes={expandedNodes}
                  selectedNodeId={selectedNodeId}
                  getChildNodes={getChildNodes}
                  onNodeClick={handleNodeClick}
                  onKeyDown={handleNodeKeyDown}
                />
              ))}
            </div>

            {/* Rules List */}
            <div className="standards-rules-list" data-testid="rules-list">
              {rules.map((rule) => (
                <RuleItem
                  key={rule.id}
                  rule={rule}
                  isSelected={selectedRuleId === rule.id}
                  onClick={() => onRuleSelect?.(rule)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
