import type { HeuristicScore, PageData } from '@uxbeacon/shared-types';

// Deterministic, rule-based Nielsen heuristics evaluation
export function evaluateHeuristics(pages: PageData[]): HeuristicScore[] {
  return [
    evaluateVisibilityOfSystemStatus(pages),
    evaluateMatchRealWorld(pages),
    evaluateUserControlFreedom(pages),
    evaluateConsistencyStandards(pages),
    evaluateErrorPrevention(pages),
    evaluateRecognitionNotRecall(pages),
    evaluateFlexibilityEfficiency(pages),
    evaluateAestheticMinimalist(pages),
    evaluateHelpUsersRecover(pages),
    evaluateHelpDocumentation(pages),
  ];
}

function severity(score: number): HeuristicScore['severity'] {
  if (score >= 8) return 'none';
  if (score >= 6) return 'cosmetic';
  if (score >= 4) return 'minor';
  if (score >= 2) return 'major';
  return 'catastrophic';
}

function evaluateVisibilityOfSystemStatus(pages: PageData[]): HeuristicScore {
  // Check: do forms give feedback? Are there loading states?
  const formPages = pages.filter((p) => p.forms.length > 0);
  const hasSubmitButtons = formPages.every((p) =>
    p.buttons.some((b) => /submit|send|save|continue|next/i.test(b)),
  );
  const hasTitles = pages.filter((p) => p.title).length / Math.max(pages.length, 1);

  let score = 7;
  if (!hasSubmitButtons && formPages.length > 0) score -= 2;
  if (hasTitles < 0.9) score -= 2;
  score = Math.max(1, Math.min(10, score));

  return {
    id: 'visibility-of-system-status',
    name: 'Visibility of System Status',
    score,
    severity: severity(score),
    explanation:
      score >= 7
        ? 'Pages have descriptive titles and forms include clear action buttons.'
        : 'Some pages lack descriptive titles or forms are missing clear action feedback.',
    recommendation:
      score < 7
        ? 'Ensure every page has a unique, descriptive title and every form has a clearly labeled submit action.'
        : '',
  };
}

function evaluateMatchRealWorld(pages: PageData[]): HeuristicScore {
  // Check: navigation uses plain language, avoid jargon
  const allNavItems = pages.flatMap((p) => p.navigationItems);
  const jargonPatterns = /\b(API|SDK|repo|deploy|webhook|payload|endpoint)\b/i;
  const jargonCount = allNavItems.filter((n) => jargonPatterns.test(n)).length;
  const jargonRatio = allNavItems.length ? jargonCount / allNavItems.length : 0;

  const score = Math.round(Math.max(4, 10 - jargonRatio * 20));

  return {
    id: 'match-real-world',
    name: 'Match with Real World',
    score,
    severity: severity(score),
    explanation:
      jargonRatio < 0.1
        ? 'Navigation and content use familiar language appropriate for the audience.'
        : `Navigation contains technical jargon (${jargonCount} instance${jargonCount !== 1 ? 's' : ''}) that may confuse non-technical users.`,
    recommendation:
      jargonRatio >= 0.1
        ? 'Replace technical terms in navigation with plain-language equivalents.'
        : '',
  };
}

function evaluateUserControlFreedom(pages: PageData[]): HeuristicScore {
  // Check: are there back links? Cancel buttons? Home links?
  const hasHome = pages.some((p) =>
    p.links.some((l) => /^\/$/i.test(l.href) || /home/i.test(l.text)),
  );
  const hasCancelOrBack = pages.some((p) =>
    p.buttons.some((b) => /cancel|back|undo|go back/i.test(b)),
  );

  let score = 7;
  if (!hasHome) score -= 2;
  if (!hasCancelOrBack) score -= 1;
  score = Math.max(3, score);

  return {
    id: 'user-control-freedom',
    name: 'User Control & Freedom',
    score,
    severity: severity(score),
    explanation:
      score >= 7
        ? 'Users have clear ways to navigate back and undo actions.'
        : 'Limited navigation escape routes — missing home links or cancel actions.',
    recommendation:
      score < 7
        ? 'Add a prominent home link and cancel/back actions to all multi-step flows and forms.'
        : '',
  };
}

function evaluateConsistencyStandards(pages: PageData[]): HeuristicScore {
  // Check: do buttons use consistent language across pages?
  const allButtons = pages.flatMap((p) => p.buttons);
  const uniqueButtonLabels = new Set(allButtons.map((b) => b.toLowerCase().trim()));
  const consistencyScore = allButtons.length
    ? Math.min(1, uniqueButtonLabels.size / allButtons.length)
    : 1;

  // Check: consistent heading structure
  const headingPages = pages.filter((p) => p.headings.length > 0);
  const hasH1OnAll = headingPages.every((p) => p.headings.some((h) => h.level === 1));
  const score = Math.round(
    Math.max(4, 10 - consistencyScore * 3 - (hasH1OnAll ? 0 : 2)),
  );

  return {
    id: 'consistency-standards',
    name: 'Consistency & Standards',
    score,
    severity: severity(score),
    explanation:
      score >= 7
        ? 'UI elements and language appear consistent across pages.'
        : `Inconsistencies detected: ${uniqueButtonLabels.size} unique button labels across ${allButtons.length} buttons.`,
    recommendation:
      score < 7
        ? 'Standardize button labels, heading patterns, and interaction patterns across all pages.'
        : '',
  };
}

function evaluateErrorPrevention(pages: PageData[]): HeuristicScore {
  // Check: do forms have required field indicators and validation hints?
  const formsWithFields = pages.flatMap((p) => p.forms).filter((f) => f.fields > 0);
  const hasValidationHints = pages.some((p) =>
    p.headings.some((h) => /required|error|invalid/i.test(h.text)),
  );

  let score = 8;
  if (formsWithFields.length > 0 && !hasValidationHints) score -= 2;
  score = Math.max(4, score);

  return {
    id: 'error-prevention',
    name: 'Error Prevention',
    score,
    severity: severity(score),
    explanation:
      score >= 7
        ? 'Forms appear to include validation cues to prevent user errors.'
        : 'Forms detected without visible validation hints or required field indicators.',
    recommendation:
      score < 7
        ? 'Add inline validation, required field markers, and helpful placeholder text to all forms.'
        : '',
  };
}

function evaluateRecognitionNotRecall(pages: PageData[]): HeuristicScore {
  // Check: images have alt text (recognition aid), navigation is visible
  const totalImages = pages.reduce((s, p) => s + p.images.length, 0);
  const imagesWithAlt = pages.reduce(
    (s, p) => s + p.images.filter((i) => i.hasAlt && i.alt.trim()).length,
    0,
  );
  const altRatio = totalImages ? imagesWithAlt / totalImages : 1;
  const hasNav = pages.every((p) => p.navigationItems.length > 0);

  let score = Math.round(6 + altRatio * 2);
  if (!hasNav) score -= 2;
  score = Math.max(3, Math.min(10, score));

  return {
    id: 'recognition-not-recall',
    name: 'Recognition over Recall',
    score,
    severity: severity(score),
    explanation:
      score >= 7
        ? 'Visual aids and persistent navigation support user recognition.'
        : `${Math.round((1 - altRatio) * 100)}% of images lack descriptive alt text, reducing recognition cues.`,
    recommendation:
      score < 7
        ? 'Ensure all meaningful images have descriptive alt text and navigation is persistently visible.'
        : '',
  };
}

function evaluateFlexibilityEfficiency(pages: PageData[]): HeuristicScore {
  // Check: search functionality, skip links, keyboard shortcuts hints
  const hasSearch = pages.some((p) =>
    p.forms.some((f) => /search/i.test(f.action)) ||
    p.navigationItems.some((n) => /search/i.test(n)),
  );
  const hasSkipLink = pages.some((p) =>
    p.links.some((l) => /skip|jump to/i.test(l.text)),
  );

  let score = 7;
  if (!hasSearch) score -= 2;
  if (!hasSkipLink) score -= 1;
  score = Math.max(4, score);

  return {
    id: 'flexibility-efficiency',
    name: 'Flexibility & Efficiency',
    score,
    severity: severity(score),
    explanation:
      score >= 7
        ? 'Site provides search and navigation shortcuts for power users.'
        : `Missing: ${!hasSearch ? 'search functionality ' : ''}${!hasSkipLink ? 'skip navigation links' : ''}.`,
    recommendation:
      score < 7
        ? 'Add a site search, keyboard shortcuts, and skip-navigation links to speed up expert users.'
        : '',
  };
}

function evaluateAestheticMinimalist(pages: PageData[]): HeuristicScore {
  // Check: word count per page, number of navigation items
  const avgWordCount =
    pages.reduce((s, p) => s + p.wordCount, 0) / Math.max(pages.length, 1);
  const avgNavItems =
    pages.reduce((s, p) => s + p.navigationItems.length, 0) / Math.max(pages.length, 1);

  let score = 8;
  if (avgWordCount > 2000) score -= 2; // dense pages
  if (avgNavItems > 10) score -= 2; // cluttered nav
  score = Math.max(3, Math.min(10, score));

  return {
    id: 'aesthetic-minimalist',
    name: 'Aesthetic & Minimalist Design',
    score,
    severity: severity(score),
    explanation:
      score >= 7
        ? 'Pages appear focused with manageable content density.'
        : `High content density detected: avg ${Math.round(avgWordCount)} words/page, ${Math.round(avgNavItems)} nav items.`,
    recommendation:
      score < 7
        ? 'Reduce cognitive load by trimming navigation options and breaking long pages into focused sections.'
        : '',
  };
}

function evaluateHelpUsersRecover(pages: PageData[]): HeuristicScore {
  // Check: 404/error pages with helpful content, error messaging in headings
  const has404 = pages.some(
    (p) =>
      /404|not found|page not found/i.test(p.title) ||
      p.headings.some((h) => /not found|error|oops/i.test(h.text)),
  );
  const hasErrorGuidance = pages.some((p) =>
    p.links.some((l) => /home|go back|search|try again/i.test(l.text)),
  );

  let score = 7;
  if (!has404 && pages.length > 5) score -= 1;
  if (!hasErrorGuidance) score -= 1;
  score = Math.max(4, score);

  return {
    id: 'help-users-recover',
    name: 'Help Users Recover from Errors',
    score,
    severity: severity(score),
    explanation:
      score >= 7
        ? 'Error states appear to provide recovery paths for users.'
        : 'Limited error recovery options detected. Users may struggle to recover from mistakes.',
    recommendation:
      score < 7
        ? 'Ensure error messages are plain-language, specific, and always offer a clear recovery path.'
        : '',
  };
}

function evaluateHelpDocumentation(pages: PageData[]): HeuristicScore {
  // Check: FAQ, Help, docs, support links
  const hasHelp = pages.some(
    (p) =>
      p.navigationItems.some((n) => /help|faq|support|docs|documentation|guide/i.test(n)) ||
      p.links.some((l) => /help|faq|support|docs|contact/i.test(l.text)),
  );

  const score = hasHelp ? 8 : 5;

  return {
    id: 'help-documentation',
    name: 'Help & Documentation',
    score,
    severity: severity(score),
    explanation: hasHelp
      ? 'The site provides accessible help, FAQ, or documentation links.'
      : 'No help, FAQ, or documentation links detected.',
    recommendation: hasHelp
      ? ''
      : 'Add a Help or FAQ section and ensure support links are visible in the navigation.',
  };
}
