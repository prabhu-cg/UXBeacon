import type { GestaltResult } from '@uxbeacon/shared-types';
import type { OCRData } from './ocr';

export function analyzeGestalt(ocr: OCRData): GestaltResult {
  const lines = ocr.lines.filter((l) => l.bbox.y1 > l.bbox.y0);

  if (lines.length < 3) {
    return {
      score: 55,
      proximity: 55,
      similarity: 55,
      continuity: 55,
      findings: ['Too few text elements to evaluate Gestalt principles reliably.'],
    };
  }

  const sorted = [...lines].sort((a, b) => a.bbox.y0 - b.bbox.y0);

  // ── Proximity ──────────────────────────────────────────────────────────────
  // Measure vertical gaps. Small gaps = grouped elements. Large gaps = clear separation.
  // Good: clearly distinct groups with small intra-group gaps and large inter-group gaps.
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push(sorted[i].bbox.y0 - sorted[i - 1].bbox.y1);
  }
  const meanGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const smallGaps = gaps.filter((g) => g < meanGap * 0.5).length;
  const largeGaps = gaps.filter((g) => g > meanGap * 1.5).length;
  // Good proximity = has both tight groups and clear section breaks
  const hasGrouping = smallGaps > 0 && largeGaps > 0;
  const proximity = hasGrouping ? Math.min(90, 60 + smallGaps * 5) : 45;

  // ── Similarity ─────────────────────────────────────────────────────────────
  // Use font size consistency as proxy: similar-height text = same visual class
  const heights = lines.map((l) => l.bbox.y1 - l.bbox.y0);
  const heightBuckets: number[] = [];
  for (const h of heights) {
    if (!heightBuckets.find((b) => Math.abs(b - h) <= 4)) heightBuckets.push(h);
  }
  // 2–4 distinct size groups = good similarity grouping
  const similarity =
    heightBuckets.length === 1 ? 50 :
    heightBuckets.length <= 3 ? 85 :
    heightBuckets.length <= 5 ? 68 : 45;

  // ── Continuity ─────────────────────────────────────────────────────────────
  // Check that left edges form consistent columns (aligned reading lines)
  const leftEdges = sorted.map((l) => l.bbox.x0);
  const edgeBuckets: number[] = [];
  for (const x of leftEdges) {
    if (!edgeBuckets.find((b) => Math.abs(b - x) <= 12)) edgeBuckets.push(x);
  }
  // Fewer alignment axes relative to line count = more continuous flow
  const axisRatio = edgeBuckets.length / sorted.length;
  const continuity = axisRatio <= 0.25 ? 88 : axisRatio <= 0.5 ? 72 : 50;

  const findings: string[] = [];

  if (proximity >= 75) findings.push('Good proximity grouping — related elements are visually clustered together.');
  else findings.push('Weak proximity grouping — use spacing to clearly separate unrelated content groups.');

  if (similarity >= 75) findings.push('Good similarity — consistent visual treatment for elements of the same type.');
  else findings.push('Inconsistent visual treatment — elements of the same type should share size, weight, or color.');

  if (continuity >= 75) findings.push('Good alignment continuity — text elements follow consistent reading axes.');
  else findings.push('Weak alignment — irregular left-edge positions disrupt the reading flow.');

  const score = Math.round(proximity * 0.4 + similarity * 0.3 + continuity * 0.3);

  return { score, proximity, similarity, continuity, findings };
}
