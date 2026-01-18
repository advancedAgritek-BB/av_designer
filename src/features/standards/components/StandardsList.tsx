/**
 * StandardsList Component
 *
 * Displays a hierarchical tree of standards with rules.
 * Supports aspect filtering, node expansion, and selection.
 */

import { useState, useCallback, useId, useMemo } from 'react';
import { useNodesList, useRulesList, useRulesByAspect } from '../use-standards';
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
    return nodes.filter((node) => node.parentId === null).sort((a, b) => a.order - b.order);
  }, [nodes]);

  const getChildNodes = useCallback(
    (parentId: string) => {
      return nodes.filter((node) => node.parentId === parentId).sort((a, b) => a.order - b.order);
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
            <div
              className="standards-tree"
              role="tree"
              aria-label="Standards hierarchy"
            >
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

// Tree Node Component
interface TreeNodeProps {
  node: StandardNode;
  level: number;
  expandedNodes: Set<string>;
  selectedNodeId?: string;
  getChildNodes: (parentId: string) => StandardNode[];
  onNodeClick: (node: StandardNode) => void;
  onKeyDown: (e: React.KeyboardEvent, node: StandardNode) => void;
}

function TreeNode({
  node,
  level,
  expandedNodes,
  selectedNodeId,
  getChildNodes,
  onNodeClick,
  onKeyDown,
}: TreeNodeProps) {
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedNodeId === node.id;
  const children = node.type === 'folder' ? getChildNodes(node.id) : [];
  const hasChildren = children.length > 0;

  return (
    <div className="tree-node" style={{ '--level': level } as React.CSSProperties}>
      <div
        role="treeitem"
        aria-expanded={node.type === 'folder' ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-level={level + 1}
        tabIndex={0}
        className={`tree-node-item ${isSelected ? 'tree-node-selected' : ''}`}
        onClick={() => onNodeClick(node)}
        onKeyDown={(e) => onKeyDown(e, node)}
      >
        {node.type === 'folder' ? (
          <ChevronIcon expanded={isExpanded} />
        ) : (
          <span className="tree-node-spacer" />
        )}
        {node.type === 'folder' ? <FolderIcon /> : <StandardIcon />}
        <span className="tree-node-name">{node.name}</span>
      </div>

      {node.type === 'folder' && isExpanded && hasChildren && (
        <div role="group" className="tree-node-children">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              selectedNodeId={selectedNodeId}
              getChildNodes={getChildNodes}
              onNodeClick={onNodeClick}
              onKeyDown={onKeyDown}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Rule Item Component
interface RuleItemProps {
  rule: Rule;
  isSelected: boolean;
  onClick: () => void;
}

function RuleItem({ rule, isSelected, onClick }: RuleItemProps) {
  return (
    <div
      data-testid="rule-item"
      data-active={rule.isActive ? 'true' : 'false'}
      data-selected={isSelected ? 'true' : 'false'}
      className={`rule-item ${isSelected ? 'rule-item-selected' : ''} ${!rule.isActive ? 'rule-item-inactive' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="rule-item-header">
        <span className="rule-item-name">{rule.name}</span>
        <span className="rule-item-aspect">{rule.aspect}</span>
      </div>
      <p className="rule-item-description">{rule.description}</p>
      <div className="rule-item-meta">
        <span className="rule-item-priority">Priority: {rule.priority}</span>
        {!rule.isActive && <span className="rule-item-badge">Inactive</span>}
      </div>
    </div>
  );
}

// Loading State Component
function LoadingState() {
  return (
    <div data-testid="standards-loading" className="standards-list-loading">
      <div role="status" className="sr-only">
        Loading standards...
      </div>
      <div className="standards-skeleton-container">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} data-testid="standards-skeleton" className="standards-skeleton" aria-hidden="true">
            <div className="standards-skeleton-line standards-skeleton-title" />
            <div className="standards-skeleton-line" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div data-testid="standards-empty" className="standards-list-empty">
      <EmptyIcon />
      <p className="standards-list-empty-title">No standards found</p>
      <p className="standards-list-empty-description">Add standards to get started</p>
    </div>
  );
}

// Error State Component
function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div data-testid="standards-error" className="standards-list-error">
      <ErrorIcon />
      <p className="standards-list-error-title">Failed to load</p>
      <p className="standards-list-error-message">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-secondary standards-list-retry"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// Icon Components
function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`tree-node-chevron ${expanded ? 'tree-node-chevron-expanded' : ''}`}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="tree-node-icon"
    >
      <path d="M4 20h16a2 2 0 002-2V8a2 2 0 00-2-2h-7.93a2 2 0 01-1.66-.9l-.82-1.2A2 2 0 007.93 3H4a2 2 0 00-2 2v13c0 1.1.9 2 2 2z" />
    </svg>
  );
}

function StandardIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="tree-node-icon"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="standards-list-empty-icon"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="standards-list-error-icon"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}
