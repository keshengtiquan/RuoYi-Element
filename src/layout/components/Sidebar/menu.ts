import { resolveMenuLeaf, resolveMenuPath, visibleChildren, type MenuNodeLike } from '@/utils/route'

export function isPathActive(currentPath: string, target: string): boolean {
  if (!currentPath || !target) {
    return false
  }
  const normalized = target.length > 1 ? target.replace(/\/+$/, '') : target
  if (currentPath === normalized) {
    return true
  }
  if (normalized === '/') {
    return false
  }
  return currentPath.startsWith(`${normalized}/`)
}

function collectLeafPaths(item: MenuNodeLike, basePath: string, result: string[] = []): string[] {
  const leaf = resolveMenuLeaf(item, basePath)
  if (leaf) {
    result.push(leaf.index)
    return result
  }

  for (const child of visibleChildren(item)) {
    collectLeafPaths(child, resolveMenuPath(basePath, child.path), result)
  }
  return result
}

export function isGroupActive(item: MenuNodeLike, basePath: string, currentPath: string): boolean {
  return collectLeafPaths(item, basePath).some((path) => isPathActive(currentPath, path))
}
