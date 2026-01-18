/**
 * StandardsList Subcomponents
 *
 * Reusable components for the StandardsList feature:
 * - TreeNode: Recursive tree item with expand/collapse
 * - RuleItem: Rule display card
 * - LoadingState, EmptyState, ErrorState: Status displays
 * - Icon components
 */

import type { StandardNode, Rule } from '@/types/standards';

// ============================================================================
// Tree Node Component
// ============================================================================

export interface TreeNodeProps {
  node: StandardNode;
  level: number;
  expandedNodes: Set<string>;
  selectedNodeId?: string;
  getChildNodes: (parentId: string) => StandardNode[];
  onNodeClick: (node: StandardNode) => void;
  onKeyDown: (e: React.KeyboardEvent, node: StandardNode) => void;
}

export function TreeNode({
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

// ============================================================================
// Rule Item Component
// ============================================================================

export interface RuleItemProps {
  rule: Rule;
  isSelected: boolean;
  onClick: () => void;
}

export function RuleItem({ rule, isSelected, onClick }: RuleItemProps) {
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

// ============================================================================
// State Components
// ============================================================================

export function LoadingState() {
  return (
    <div data-testid="standards-loading" className="standards-list-loading">
      <div role="status" className="sr-only">
        Loading standards...
      </div>
      <div className="standards-skeleton-container">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            data-testid="standards-skeleton"
            className="standards-skeleton"
            aria-hidden="true"
          >
            <div className="standards-skeleton-line standards-skeleton-title" />
            <div className="standards-skeleton-line" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div data-testid="standards-empty" className="standards-list-empty">
      <EmptyIcon />
      <p className="standards-list-empty-title">No standards found</p>
      <p className="standards-list-empty-description">Add standards to get started</p>
    </div>
  );
}

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
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

// ============================================================================
// Icon Components
// ============================================================================

export function ChevronIcon({ expanded }: { expanded: boolean }) {
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

export function FolderIcon() {
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

export function StandardIcon() {
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

export function EmptyIcon() {
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

export function ErrorIcon() {
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
