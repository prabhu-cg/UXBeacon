import type { TypographyResult } from '@uxbeacon/shared-types';
import type { OCRData } from './ocr';

export function analyzeTypography(ocr: OCRData): TypographyResult {
  const words = ocr.words.filter((w) => w.height > 0);

  if (words.length === 0) {
    return {
      score: 60,
      fontSizeVariations: 0,
      isBoldDetected: false,
      findings: ['No text detected in the screenshot — typography analysis unavailable.'],
    };
  }

  // Group word heights into size buckets (±3px tolerance)
  const heights = words.map((w) => w.height).sort((a, b) => a - b);
  const buckets: number[] = [];
  for (const h of heights) {
    const existing = buckets.find((b) => Math.abs(b - h) <= 3);
    if (!existing) buckets.push(h);
  }
  const fontSizeVariations = buckets.length;
  const isBoldDetected = words.some((w) => w.isBold);

  const findings: string[] = [];

  if (fontSizeVariations === 1) {
    findings.push('Only one font size detected — add size variation to establish visual hierarchy.');
  } else if (fontSizeVariations <= 3) {
    findings.push(`${fontSizeVariations} distinct text sizes detected — clear and consistent typographic scale.`);
  } else if (fontSizeVariations <= 5) {
    findings.push(`${fontSizeVariations} distinct text sizes detected — moderate variation, consider consolidating to a tighter scale.`);
  } else {
    findings.push(`${fontSizeVariations} distinct text sizes detected — too many font sizes create visual inconsistency.`);
  }

  if (isBoldDetected) {
    findings.push('Bold text detected — good use of weight variation for emphasis.');
  } else {
    findings.push('No bold text detected — consider using weight contrast to guide attention.');
  }

  // Check if largest text is significantly larger than body text
  const maxH = heights[heights.length - 1];
  const minH = heights[0];
  const ratio = maxH / Math.max(minH, 1);
  if (ratio < 1.5) {
    findings.push('Low size contrast between headings and body text — headings should be at least 1.5× larger.');
  } else if (ratio > 4) {
    findings.push('Very large size contrast between elements — ensure the scale feels intentional and harmonious.');
  }

  let score: number;
  if (fontSizeVariations >= 2 && fontSizeVariations <= 4 && isBoldDetected) score = 88;
  else if (fontSizeVariations >= 2 && fontSizeVariations <= 4) score = 75;
  else if (fontSizeVariations === 1) score = 50;
  else if (fontSizeVariations <= 6) score = 65;
  else score = 42;

  if (ratio >= 1.5 && ratio <= 4) score = Math.min(100, score + 5);

  return { score, fontSizeVariations, isBoldDetected, findings };
}
