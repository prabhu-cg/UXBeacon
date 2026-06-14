import type { AccessibilityScore, AccessibilityIssue } from '@uxbeacon/shared-types';

interface AxeViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  tags: string[];
  nodes: { html: string }[];
}

interface AxeResults {
  violations: AxeViolation[];
  incomplete: AxeViolation[];
  passes: AxeViolation[];
}

export function parseAxeResults(axeResults: unknown): AccessibilityScore {
  const results = axeResults as AxeResults;
  const violations: AxeViolation[] = results?.violations ?? [];

  let critical = 0, serious = 0, moderate = 0, minor = 0;
  const issues: AccessibilityIssue[] = [];

  for (const v of violations) {
    const severity = v.impact ?? 'minor';
    const affectedElements = v.nodes?.length ?? 0;

    if (severity === 'critical') critical++;
    else if (severity === 'serious') serious++;
    else if (severity === 'moderate') moderate++;
    else minor++;

    // Extract WCAG criteria from tags
    const wcagCriteria = v.tags
      ?.filter((t: string) => /^wcag\d/.test(t))
      .map((t: string) => t.toUpperCase().replace('WCAG', 'WCAG '))
      .join(', ') ?? '';

    issues.push({
      id: v.id,
      severity,
      description: v.help ?? v.description,
      wcagCriteria,
      affectedElements,
      recommendation: v.helpUrl ? `See ${v.helpUrl} for guidance.` : '',
    });
  }

  // Score: start at 100, deduct by severity
  const score = Math.max(
    0,
    Math.round(100 - critical * 20 - serious * 10 - moderate * 5 - minor * 2),
  );

  return { score, critical, serious, moderate, minor, issues };
}

// Fallback when Playwright/axe-core is not available
export function createFallbackAccessibilityScore(pages: import('@uxbeacon/shared-types').PageData[]): AccessibilityScore {
  const issues: AccessibilityIssue[] = [];
  let critical = 0, serious = 0, moderate = 0, minor = 0;

  // Check images for alt text
  const imagesWithoutAlt = pages.reduce(
    (s, p) => s + p.images.filter((i) => !i.hasAlt).length,
    0,
  );
  if (imagesWithoutAlt > 0) {
    serious++;
    issues.push({
      id: 'image-alt',
      severity: 'serious',
      description: `${imagesWithoutAlt} image${imagesWithoutAlt !== 1 ? 's' : ''} missing alt attribute`,
      wcagCriteria: 'WCAG 1.1.1',
      affectedElements: imagesWithoutAlt,
      recommendation: 'Add descriptive alt text to all meaningful images.',
    });
  }

  // Check heading structure
  const pagesWithoutH1 = pages.filter((p) => !p.headings.some((h) => h.level === 1)).length;
  if (pagesWithoutH1 > 0) {
    moderate++;
    issues.push({
      id: 'page-has-heading-one',
      severity: 'moderate',
      description: `${pagesWithoutH1} page${pagesWithoutH1 !== 1 ? 's' : ''} missing an h1 heading`,
      wcagCriteria: 'WCAG 1.3.1',
      affectedElements: pagesWithoutH1,
      recommendation: 'Ensure every page has exactly one h1 heading.',
    });
  }

  // Check links without text
  const emptyLinks = pages.reduce(
    (s, p) => s + p.links.filter((l) => !l.text.trim()).length,
    0,
  );
  if (emptyLinks > 0) {
    serious++;
    issues.push({
      id: 'link-name',
      severity: 'serious',
      description: `${emptyLinks} link${emptyLinks !== 1 ? 's' : ''} have no discernible text`,
      wcagCriteria: 'WCAG 4.1.2',
      affectedElements: emptyLinks,
      recommendation: 'Add descriptive text to all links.',
    });
  }

  const score = Math.max(0, Math.round(100 - critical * 20 - serious * 10 - moderate * 5 - minor * 2));

  return { score, critical, serious, moderate, minor, issues };
}
