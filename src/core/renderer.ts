import chalk from 'chalk';
import type { DependencyNode } from './types.js';

const TREE_CHARS = {
  BRANCH: '├── ',
  LAST_BRANCH: '└── ',
  INDENT: '│   ',
  LAST_INDENT: '    '
};

function formatNode(node: DependencyNode): string {
  const parts = [node.name, chalk.gray(`@${node.version}`)];
  
  if (node.duplicateOf) {
    parts.push(chalk.yellow(' (duplicate)'));
  }
  if (node.isDevDependency) {
    parts.push(chalk.blue(' (dev)'));
  }
  if (node.license) {
    parts.push(chalk.gray(` [${node.license}]`));
  }
  if (node.size) {
    parts.push(chalk.gray(` (${formatSize(node.size)})`));
  }
  
  return parts.join('');
}

function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)}${units[unitIndex]}`;
}

function renderTreeNode(
  node: DependencyNode,
  prefix = '',
  isLast = true,
  depth = 0,
  maxDepth = Infinity
): string {
  if (depth > maxDepth) return '';
  
  const nodePrefix = prefix + (isLast ? TREE_CHARS.LAST_BRANCH : TREE_CHARS.BRANCH);
  const childPrefix = prefix + (isLast ? TREE_CHARS.LAST_INDENT : TREE_CHARS.INDENT);
  
  let output = nodePrefix + formatNode(node) + '\n';
  
  const deps = Object.entries(node.dependencies);
  if (deps.length === 0) return output;
  
  deps.forEach(([_, childNode], index) => {
    const isLastChild = index === deps.length - 1;
    output += renderTreeNode(childNode, childPrefix, isLastChild, depth + 1, maxDepth);
  });
  
  return output;
}

export function renderTree(root: DependencyNode, maxDepth = Infinity): string {
  return renderTreeNode(root, '', true, 0, maxDepth);
} 