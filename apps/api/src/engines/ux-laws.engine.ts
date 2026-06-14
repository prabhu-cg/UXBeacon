import type { UXLawScore, PageData } from '@uxbeacon/shared-types';

export function evaluateUXLaws(pages: PageData[]): UXLawScore[] {
  return [
    evaluateHicksLaw(pages),
    evaluateFittsLaw(pages),
    evaluateJakobsLaw(pages),
    evaluateMillersLaw(pages),
    evaluateDohertyThreshold(pages),
    evaluateParetosPrinciple(pages),
  ];
}

function evaluateHicksLaw(pages: PageData[]): UXLawScore {
  // Fewer choices = faster decisions. Penalise heavy navigation menus.
  const avgNavItems =
    pages.reduce((s, p) => s + p.navigationItems.length, 0) / Math.max(pages.length, 1);

  let score: number;
  let finding: string;
  let recommendation = '';

  if (avgNavItems <= 5) {
    score = 9;
    finding = `Navigation is focused with an average of ${avgNavItems.toFixed(1)} items — excellent for fast decision-making.`;
  } else if (avgNavItems <= 8) {
    score = 7;
    finding = `Navigation has ${avgNavItems.toFixed(1)} items on average, which is within an acceptable range.`;
  } else {
    score = Math.max(3, Math.round(10 - (avgNavItems - 5) * 0.7));
    finding = `Navigation contains ${avgNavItems.toFixed(1)} items on average, which increases decision time.`;
    recommendation = 'Group navigation items into categories and limit top-level choices to 5–7 items.';
  }

  return { id: 'hicks-law', name: "Hick's Law", score, finding, recommendation };
}

function evaluateFittsLaw(pages: PageData[]): UXLawScore {
  // Check: primary CTAs detected, button labels suggest actionability
  const totalButtons = pages.reduce((s, p) => s + p.buttons.length, 0);
  const primaryActions = pages.reduce(
    (s, p) =>
      s + p.buttons.filter((b) => /get started|sign up|buy|download|try|start|join/i.test(b)).length,
    0,
  );
  const hasLargeTargets = primaryActions > 0;

  const score = hasLargeTargets ? 8 : totalButtons > 0 ? 6 : 5;

  return {
    id: 'fitts-law',
    name: "Fitts's Law",
    score,
    finding:
      primaryActions > 0
        ? `${primaryActions} clear primary action button${primaryActions !== 1 ? 's' : ''} detected — good target visibility.`
        : 'No clear primary action buttons found. Critical CTAs may be hard to locate.',
    recommendation:
      score < 7
        ? 'Increase the size and visual prominence of primary action buttons. Place them where users expect them.'
        : '',
  };
}

function evaluateJakobsLaw(pages: PageData[]): UXLawScore {
  // Check: common patterns — logo top-left, nav top, footer links
  const hasLogoInNav = pages.some((p) =>
    p.links.some((l) => /^\/$/i.test(l.href) || /home/i.test(l.text)),
  );
  const hasFooter = pages.some((p) =>
    p.links.some((l) => /privacy|terms|about|contact/i.test(l.text)),
  );

  let score = 7;
  if (!hasLogoInNav) score -= 2;
  if (!hasFooter) score -= 1;
  score = Math.max(3, score);

  return {
    id: 'jakobs-law',
    name: "Jakob's Law",
    score,
    finding:
      score >= 7
        ? 'Site follows standard web conventions (home link, footer links).'
        : 'Some standard conventions are missing — users may feel disoriented.',
    recommendation:
      score < 7
        ? 'Follow web conventions: logo links to home, standard footer with Privacy/Terms/Contact links.'
        : '',
  };
}

function evaluateMillersLaw(pages: PageData[]): UXLawScore {
  // Check: chunking — do pages use headings to break up content?
  const pagesWithContent = pages.filter((p) => p.wordCount > 200);
  const chunkedPages = pagesWithContent.filter((p) => p.headings.length >= 2);
  const chunkingRatio = pagesWithContent.length
    ? chunkedPages.length / pagesWithContent.length
    : 1;

  const score = Math.round(5 + chunkingRatio * 5);

  return {
    id: 'millers-law',
    name: "Miller's Law",
    score,
    finding:
      chunkingRatio >= 0.7
        ? 'Content is well-chunked with headings, keeping information digestible.'
        : `Only ${Math.round(chunkingRatio * 100)}% of content-heavy pages use headings to chunk information.`,
    recommendation:
      chunkingRatio < 0.7
        ? 'Use headings, bullet points, and visual grouping to chunk content into groups of 5–9 items.'
        : '',
  };
}

function evaluateDohertyThreshold(pages: PageData[]): UXLawScore {
  // Check: load time data if available
  const pagesWithLoad = pages.filter((p) => p.loadTimeMs !== undefined);
  const avgLoadMs = pagesWithLoad.length
    ? pagesWithLoad.reduce((s, p) => s + (p.loadTimeMs ?? 0), 0) / pagesWithLoad.length
    : null;

  let score: number;
  let finding: string;
  let recommendation = '';

  if (avgLoadMs === null) {
    score = 7;
    finding = 'Load time data unavailable. Aim for under 400ms for optimal user productivity.';
    recommendation = 'Measure and optimize page load times to stay under the 400ms Doherty Threshold.';
  } else if (avgLoadMs < 400) {
    score = 10;
    finding = `Excellent — average load time is ${avgLoadMs.toFixed(0)}ms, well under the 400ms threshold.`;
  } else if (avgLoadMs < 1000) {
    score = 7;
    finding = `Average load time is ${avgLoadMs.toFixed(0)}ms — above the 400ms threshold but acceptable.`;
    recommendation = 'Optimize assets and reduce server response time to get below 400ms.';
  } else {
    score = Math.max(2, Math.round(7 - (avgLoadMs - 1000) / 500));
    finding = `Slow load times detected (avg ${avgLoadMs.toFixed(0)}ms). This significantly reduces productivity.`;
    recommendation = 'Aggressively optimize performance: compress images, lazy load, use a CDN.';
  }

  return { id: 'doherty-threshold', name: 'Doherty Threshold', score, finding, recommendation };
}

function evaluateParetosPrinciple(pages: PageData[]): UXLawScore {
  // Check: are the most important CTAs prominent and repeated?
  const ctaButtons = pages.flatMap((p) =>
    p.buttons.filter((b) => /get started|sign up|buy|try|start|join|subscribe/i.test(b)),
  );
  const ctaRepetition = ctaButtons.length;

  let score: number;
  let finding: string;
  let recommendation = '';

  if (ctaRepetition >= 3) {
    score = 9;
    finding = 'Primary CTAs appear prominently and repeatedly — maximising conversion opportunity.';
  } else if (ctaRepetition >= 1) {
    score = 7;
    finding = 'Primary CTAs are present but could appear more frequently to serve the vital 20% of actions.';
    recommendation = 'Repeat the primary CTA at key scroll points to maximise user conversion.';
  } else {
    score = 5;
    finding = 'No clear primary CTAs detected. The site may not focus on its most important user actions.';
    recommendation = 'Identify the top 1–2 actions users should take and make them highly visible throughout.';
  }

  return { id: 'pareto-principle', name: 'Pareto Principle', score, finding, recommendation };
}
