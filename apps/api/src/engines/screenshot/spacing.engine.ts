import type { SpacingResult } from '@uxbeacon/shared-types';
import type { OCRData } from './ocr';

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function coefficientOfVariation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return mean > 0 ? stdDev(values) / mean : 0;
}

export function analyzeSpacing(ocr: OCRData): SpacingResult {
  const lines = ocr.lines.filter((l) => l.bbox.y1 > l.bbox.y0);

  if (lines.length < 2) {
    return {
      score: 60,
      gapConsistency: 60,
      alignmentScore: 60,
      findings: ['Too few text lines to evaluate spacing consistency.'],
    };
  }

  // Sort lines by vertical position
  const sorted = [...lines].sort((a, b) => a.bbox.y0 - b.bbox.y0);

  // Compute gaps between consecutive lines
  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].bbox.y0 - sorted[i - 1].bbox.y1;
    if (gap >= 0 && gap < ocr.imageHeight * 0.15) gaps.push(gap); // ignore huge jumps (section breaks)
  }

  const cv = gaps.length > 1 ? coefficientOfVariation(gaps) : 0;
  // Low CV = consistent spacing. cv < 0.3 = very consistent, cv > 0.8 = inconsistent
  const gapConsistency = Math.max(0, Math.min(100, Math.round((1 - Math.min(cv, 1)) * 100)));

  // Alignment: cluster left-edge x values
  const leftEdges = sorted.map((l) => l.bbox.x0);
  const xBuckets: number[] = [];
  for (const x of leftEdges) {
    const existing = xBuckets.find((b) => Math.abs(b - x) <= 10);
    if (!existing) xBuckets.push(x);
  }
  // Fewer buckets = more aligned
  const alignmentScore = Math.max(20, Math.min(100, Math.round((1 - (xBuckets.length - 1) / Math.max(sorted.length, 1)) * 100)));

  const findings: string[] = [];
  if (gapConsistency >= 80) {
    findings.push('Consistent vertical spacing between text elements — good rhythm.');
  } else if (gapConsistency >= 55) {
    findings.push('Some spacing inconsistency detected — standardize line gaps for a more polished feel.');
  } else {
    findings.push('Irregular spacing between text elements — establish a consistent spacing scale.');
  }

  if (alignmentScore >= 80) {
    findings.push('Strong horizontal alignment — text elements share consistent left-edge positions.');
  } else if (alignmentScore >= 55) {
    findings.push('Moderate alignment — some text elements deviate from common alignment axes.');
  } else {
    findings.push('Weak alignment — text elements are not aligned to a consistent grid, creating visual disorder.');
  }

  const avgGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
  if (avgGap < 2 && gaps.length > 0) findings.push('Very tight line spacing detected — increase leading for better readability.');

  const score = Math.round((gapConsistency * 0.6 + alignmentScore * 0.4));

  return { score, gapConsistency, alignmentScore, findings };
}
