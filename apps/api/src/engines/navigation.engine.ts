import type { NavigationScore, PageData, SitemapNode } from '@uxbeacon/shared-types';

export function evaluateNavigation(pages: PageData[]): NavigationScore {
  const findings: string[] = [];

  // Check 1: consistent navigation across pages
  const navSets = pages.map((p) => new Set(p.navigationItems.map((n) => n.toLowerCase())));
  const allNavItems = new Set(pages.flatMap((p) => p.navigationItems.map((n) => n.toLowerCase())));
  const avgNavSize = pages.reduce((s, p) => s + p.navigationItems.length, 0) / Math.max(pages.length, 1);

  // Consistency: what % of nav items appear on all pages
  let consistentCount = 0;
  for (const item of allNavItems) {
    if (navSets.every((set) => set.has(item))) consistentCount++;
  }
  const consistencyRatio = allNavItems.size ? consistentCount / allNavItems.size : 1;

  // Check 2: breadcrumbs or location indicators
  const hasBreadcrumbs = pages.some((p) =>
    p.links.some((l) => /breadcrumb|you are here/i.test(l.text)) ||
    p.headings.some((h) => h.text.includes('>')),
  );

  // Check 3: orphan pages (pages with no inbound links)
  const allHrefs = new Set(pages.flatMap((p) => p.links.map((l) => l.href)));
  const pageUrls = pages.map((p) => p.url);
  const orphans = pageUrls.filter(
    (url) => !allHrefs.has(url) && !allHrefs.has(new URL(url).pathname),
  );

  // Check 4: too many nav items
  if (avgNavSize > 10) findings.push(`Navigation has an average of ${avgNavSize.toFixed(0)} items — consider grouping under mega-menus or dropdowns.`);
  if (consistencyRatio < 0.7) findings.push('Navigation items vary significantly across pages, creating an inconsistent experience.');
  if (!hasBreadcrumbs && pages.length > 5) findings.push('No breadcrumbs detected. Users on deep pages may struggle to orient themselves.');
  if (orphans.length > 0) findings.push(`${orphans.length} page${orphans.length !== 1 ? 's' : ''} appear to have no inbound links — check for orphaned content.`);

  let score = 80;
  if (consistencyRatio < 0.7) score -= 15;
  if (!hasBreadcrumbs && pages.length > 5) score -= 10;
  if (avgNavSize > 10) score -= 10;
  if (orphans.length > 3) score -= 10;
  score = Math.max(20, Math.min(100, score));

  return { score, findings };
}

export function buildSitemap(pages: PageData[]): SitemapNode {
  const root: SitemapNode = {
    url: pages[0]?.url ?? '/',
    title: pages[0]?.title ?? 'Home',
    children: [],
    depth: 0,
  };

  // Build tree based on URL path depth
  const nodeMap = new Map<string, SitemapNode>();
  nodeMap.set(root.url, root);

  for (const page of pages.slice(1)) {
    const node: SitemapNode = {
      url: page.url,
      title: page.title || new URL(page.url).pathname,
      children: [],
      depth: 0,
    };

    // Find parent by removing last path segment
    try {
      const url = new URL(page.url);
      const segments = url.pathname.split('/').filter(Boolean);
      let parent = root;

      // Walk up to find closest existing parent
      for (let i = segments.length - 1; i >= 0; i--) {
        const parentPath = '/' + segments.slice(0, i).join('/');
        const parentUrl = url.origin + (parentPath === '/' ? '/' : parentPath);
        const found = nodeMap.get(parentUrl);
        if (found) {
          parent = found;
          break;
        }
      }

      node.depth = parent.depth + 1;
      parent.children.push(node);
      nodeMap.set(page.url, node);
    } catch {
      root.children.push(node);
    }
  }

  return root;
}
