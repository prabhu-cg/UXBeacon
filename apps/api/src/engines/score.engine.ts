import type {
  UXHealthScore,
  UXGrade,
  HeuristicScore,
  AccessibilityScore,
  ContentScore,
  NavigationScore,
  UXLawScore,
} from '@uxbeacon/shared-types';

const WEIGHTS = {
  accessibility: 0.25,
  heuristics: 0.25,
  uxLaws: 0.2,
  contentQuality: 0.15,
  navigation: 0.15,
};

function scoreToGrade(score: number): UXGrade {
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

export function computeHealthScore(
  accessibilityScore: AccessibilityScore,
  heuristicScores: HeuristicScore[],
  uxLawScores: UXLawScore[],
  contentScore: ContentScore,
  navigationScore: NavigationScore,
): UXHealthScore {
  const accessibility = accessibilityScore.score;
  const heuristics =
    (heuristicScores.reduce((s, h) => s + h.score, 0) / Math.max(heuristicScores.length, 1)) * 10;
  const uxLaws =
    (uxLawScores.reduce((s, l) => s + l.score, 0) / Math.max(uxLawScores.length, 1)) * 10;
  const contentQuality = contentScore.score;
  const navigation = navigationScore.score;

  const overall = Math.round(
    accessibility * WEIGHTS.accessibility +
      heuristics * WEIGHTS.heuristics +
      uxLaws * WEIGHTS.uxLaws +
      contentQuality * WEIGHTS.contentQuality +
      navigation * WEIGHTS.navigation,
  );

  return {
    overall,
    grade: scoreToGrade(overall),
    accessibility,
    heuristics,
    uxLaws,
    contentQuality,
    navigation,
  };
}

export function generateExecutiveSummary(
  url: string,
  health: UXHealthScore,
  pageCount: number,
): string {
  const gradeDescriptions: Record<UXGrade, string> = {
    'A+': 'exceptional UX quality',
    A: 'strong UX quality',
    B: 'good UX quality with room for improvement',
    C: 'fair UX quality with notable issues',
    D: 'poor UX quality requiring attention',
    F: 'critical UX issues that need immediate attention',
  };

  return (
    `UXBeacon analyzed ${pageCount} page${pageCount !== 1 ? 's' : ''} of ${url} and found ` +
    `${gradeDescriptions[health.grade]} (score: ${health.overall}/100, grade: ${health.grade}). ` +
    `The strongest area is ${getStrongestArea(health)} and the area with most room for improvement is ${getWeakestArea(health)}.`
  );
}

function getStrongestArea(health: UXHealthScore): string {
  const areas = [
    { name: 'accessibility', score: health.accessibility },
    { name: 'UX heuristics', score: health.heuristics },
    { name: 'UX laws compliance', score: health.uxLaws },
    { name: 'content quality', score: health.contentQuality },
    { name: 'navigation', score: health.navigation },
  ];
  return areas.sort((a, b) => b.score - a.score)[0].name;
}

function getWeakestArea(health: UXHealthScore): string {
  const areas = [
    { name: 'accessibility', score: health.accessibility },
    { name: 'UX heuristics', score: health.heuristics },
    { name: 'UX laws compliance', score: health.uxLaws },
    { name: 'content quality', score: health.contentQuality },
    { name: 'navigation', score: health.navigation },
  ];
  return areas.sort((a, b) => a.score - b.score)[0].name;
}

export function generateKeyFindings(
  heuristicScores: HeuristicScore[],
  accessibilityScore: AccessibilityScore,
  contentScore: ContentScore,
  navigationScore: NavigationScore,
): string[] {
  const findings: string[] = [];

  // Critical accessibility issues
  if (accessibilityScore.critical > 0) {
    findings.push(`${accessibilityScore.critical} critical accessibility violation${accessibilityScore.critical !== 1 ? 's' : ''} detected that may prevent users with disabilities from accessing content.`);
  }

  // Worst heuristic
  const worstHeuristic = [...heuristicScores].sort((a, b) => a.score - b.score)[0];
  if (worstHeuristic && worstHeuristic.score < 6) {
    findings.push(`Lowest heuristic score: "${worstHeuristic.name}" (${worstHeuristic.score}/10) — ${worstHeuristic.explanation}`);
  }

  // Content issues
  if (contentScore.score < 60) {
    findings.push(`Content quality is below average (${contentScore.score}/100). ${contentScore.findings[0] ?? ''}`);
  }

  // Navigation
  if (navigationScore.score < 60 && navigationScore.findings.length) {
    findings.push(navigationScore.findings[0]);
  }

  return findings.slice(0, 5);
}

export function generateRecommendations(
  heuristicScores: HeuristicScore[],
  accessibilityScore: AccessibilityScore,
  contentScore: ContentScore,
  navigationScore: NavigationScore,
): string[] {
  const recs: string[] = [];

  if (accessibilityScore.critical > 0 || accessibilityScore.serious > 0) {
    recs.push(`Fix ${accessibilityScore.critical + accessibilityScore.serious} critical/serious accessibility issues to meet WCAG AA standards.`);
  }

  const worstHeuristics = [...heuristicScores]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  for (const h of worstHeuristics) {
    if (h.recommendation) recs.push(h.recommendation);
  }

  for (const finding of contentScore.findings.slice(0, 2)) {
    recs.push(finding);
  }

  for (const finding of navigationScore.findings.slice(0, 2)) {
    recs.push(finding);
  }

  return recs.slice(0, 7);
}
