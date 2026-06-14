import type { ContentScore, PageData } from '@uxbeacon/shared-types';

export function evaluateContent(pages: PageData[]): ContentScore {
  const readability = evaluateReadability(pages);
  const headingHierarchy = evaluateHeadingHierarchy(pages);
  const ctaClarity = evaluateCtaClarity(pages);
  const linkQuality = evaluateLinkQuality(pages);
  const contentDensity = evaluateContentDensity(pages);

  const score = Math.round(
    (readability + headingHierarchy + ctaClarity + linkQuality + contentDensity) / 5,
  );

  const findings: string[] = [];
  if (readability < 60) findings.push('Content readability is low — consider shorter sentences and simpler vocabulary.');
  if (headingHierarchy < 60) findings.push('Heading structure is irregular — ensure h1 → h2 → h3 nesting is maintained.');
  if (ctaClarity < 60) findings.push('Call-to-action buttons use vague labels. Use action verbs like "Get started" or "Download report".');
  if (linkQuality < 60) findings.push('Many links use generic text like "click here" or "read more" — replace with descriptive text.');
  if (contentDensity < 60) findings.push('Some pages are too dense or too sparse. Aim for 300–800 words per page.');

  return { score, readability, headingHierarchy, ctaClarity, linkQuality, contentDensity, findings };
}

function evaluateReadability(pages: PageData[]): number {
  // Proxy: average words per page. Very short or very long = problem.
  const avgWords =
    pages.reduce((s, p) => s + p.wordCount, 0) / Math.max(pages.length, 1);
  if (avgWords < 50) return 40; // too sparse
  if (avgWords <= 400) return 85;
  if (avgWords <= 800) return 75;
  if (avgWords <= 1500) return 60;
  return 45; // wall-of-text
}

function evaluateHeadingHierarchy(pages: PageData[]): number {
  let totalScore = 0;
  for (const page of pages) {
    if (page.headings.length === 0) {
      totalScore += 50;
      continue;
    }
    const hasH1 = page.headings.some((h) => h.level === 1);
    const multipleH1 = page.headings.filter((h) => h.level === 1).length > 1;
    // Check for skipped levels (e.g., h1 → h3)
    let skipped = false;
    for (let i = 1; i < page.headings.length; i++) {
      if (page.headings[i].level - page.headings[i - 1].level > 1) {
        skipped = true;
        break;
      }
    }

    let ps = 100;
    if (!hasH1) ps -= 30;
    if (multipleH1) ps -= 20;
    if (skipped) ps -= 20;
    totalScore += Math.max(20, ps);
  }
  return Math.round(totalScore / Math.max(pages.length, 1));
}

function evaluateCtaClarity(pages: PageData[]): number {
  const allButtons = pages.flatMap((p) => p.buttons);
  if (allButtons.length === 0) return 50;

  const vagueLabels = /^(click here|read more|learn more|here|more|submit|button)$/i;
  const vagueCount = allButtons.filter((b) => vagueLabels.test(b.trim())).length;
  const vagueRatio = vagueCount / allButtons.length;

  return Math.round(Math.max(30, 100 - vagueRatio * 100));
}

function evaluateLinkQuality(pages: PageData[]): number {
  const allLinks = pages.flatMap((p) => p.links);
  if (allLinks.length === 0) return 70;

  const vagueText = /^(click here|here|read more|more|link|this|this page)$/i;
  const vagueCount = allLinks.filter((l) => vagueText.test(l.text.trim())).length;
  const emptyAlt = allLinks.filter((l) => !l.text.trim()).length;

  const badRatio = (vagueCount + emptyAlt) / allLinks.length;
  return Math.round(Math.max(20, 100 - badRatio * 100));
}

function evaluateContentDensity(pages: PageData[]): number {
  const wordCounts = pages.map((p) => p.wordCount);
  if (wordCounts.length === 0) return 70;

  // Penalise pages with < 100 or > 2000 words
  const optimal = wordCounts.filter((w) => w >= 100 && w <= 2000).length;
  const ratio = optimal / wordCounts.length;
  return Math.round(40 + ratio * 60);
}
