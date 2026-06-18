import type {
  VisualQualityScore,
  UXGrade,
  VisualHierarchyResult,
  ContrastResult,
  TypographyResult,
  SpacingResult,
  DensityResult,
  CTAResult,
  ColorResult,
  BalanceResult,
} from '@uxbeacon/shared-types';

const WEIGHTS = {
  hierarchy: 0.20,
  contrast:  0.15,
  typography: 0.15,
  spacing:   0.15,
  density:   0.10,
  cta:       0.10,
  color:     0.10,
  balance:   0.05,
} as const;

function toGrade(score: number): UXGrade {
  if (score >= 93) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

export function computeVisualScore(
  hierarchy: VisualHierarchyResult,
  contrast: ContrastResult,
  typography: TypographyResult,
  spacing: SpacingResult,
  density: DensityResult,
  cta: CTAResult,
  color: ColorResult,
  balance: BalanceResult,
): VisualQualityScore {
  const overall = Math.round(
    hierarchy.score  * WEIGHTS.hierarchy +
    contrast.score   * WEIGHTS.contrast  +
    typography.score * WEIGHTS.typography +
    spacing.score    * WEIGHTS.spacing   +
    density.score    * WEIGHTS.density   +
    cta.score        * WEIGHTS.cta       +
    color.score      * WEIGHTS.color     +
    balance.score    * WEIGHTS.balance,
  );

  return {
    overall,
    grade: toGrade(overall),
    hierarchy: hierarchy.score,
    contrast: contrast.score,
    typography: typography.score,
    spacing: spacing.score,
    density: density.score,
    cta: cta.score,
    color: color.score,
    balance: balance.score,
  };
}

export function generateDesignSummary(
  url: string | null,
  score: VisualQualityScore,
): string {
  const label = score.grade === 'A+' || score.grade === 'A'
    ? 'strong overall design quality'
    : score.grade === 'B'
      ? 'solid design with areas for improvement'
      : 'significant design quality issues';
  const source = url ? `The screenshot from ${url}` : 'The uploaded screenshot';
  return `${source} scored ${score.overall}/100 (${score.grade}), indicating ${label}. ` +
    `The analysis evaluated 9 visual design dimensions including hierarchy, contrast, typography, spacing, layout density, CTA effectiveness, color consistency, Gestalt principles, and visual balance.`;
}

export function generateDesignFindings(
  hierarchy: VisualHierarchyResult,
  contrast: ContrastResult,
  cta: CTAResult,
  typography: TypographyResult,
): string[] {
  const findings: string[] = [];
  const allFindings = [
    ...hierarchy.findings,
    ...contrast.findings,
    ...cta.findings,
    ...typography.findings,
  ];
  // Deduplicate and take top 5
  const seen = new Set<string>();
  for (const f of allFindings) {
    if (!seen.has(f) && findings.length < 5) {
      seen.add(f);
      findings.push(f);
    }
  }
  return findings;
}

export function generateDesignRecommendations(
  score: VisualQualityScore,
  hierarchy: VisualHierarchyResult,
  contrast: ContrastResult,
  cta: CTAResult,
  spacing: SpacingResult,
  color: ColorResult,
): string[] {
  const recs: { priority: number; text: string }[] = [];

  if (contrast.score < 70)
    recs.push({ priority: 1, text: 'Improve text contrast to meet WCAG AA standards (4.5:1 ratio) — this is the highest-impact accessibility fix.' });
  if (cta.score < 60)
    recs.push({ priority: 2, text: 'Add or make more prominent a clear primary call-to-action in the top half of the design.' });
  if (hierarchy.score < 65)
    recs.push({ priority: 3, text: 'Reduce competing dominant elements — aim for one clear focal point per screen section.' });
  if (spacing.score < 65)
    recs.push({ priority: 4, text: 'Standardize spacing using a consistent scale (e.g., 4px/8px base) to improve visual rhythm.' });
  if (color.score < 65)
    recs.push({ priority: 5, text: 'Simplify the color palette to 2–3 primary hues with 1–2 accent colors for brand consistency.' });
  if (score.typography < 65)
    recs.push({ priority: 6, text: 'Establish a clear typographic hierarchy with 3–4 distinct text sizes and consistent bold usage.' });

  return recs
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5)
    .map((r) => r.text);
}
