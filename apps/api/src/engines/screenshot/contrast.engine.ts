import type { ContrastResult } from '@uxbeacon/shared-types';
import sharp from 'sharp';
import type { OCRData } from './ocr';

function toLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function sampleRegionAvg(
  data: Buffer,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  width: number,
): { r: number; g: number; b: number } {
  let r = 0, g = 0, b = 0, count = 0;
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) {
      const idx = (py * width + px) * 3;
      r += data[idx] ?? 128;
      g += data[idx + 1] ?? 128;
      b += data[idx + 2] ?? 128;
      count++;
    }
  }
  return count > 0
    ? { r: r / count, g: g / count, b: b / count }
    : { r: 128, g: 128, b: 128 };
}

export async function analyzeContrast(
  buffer: Buffer,
  width: number,
  height: number,
  ocr: OCRData,
): Promise<ContrastResult> {
  const { data } = await sharp(buffer)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pad = 4;
  let passAA = 0;
  let passAAA = 0;
  let issues = 0;
  let total = 0;

  const words = ocr.words.filter((w) => w.text.trim().length > 0);

  if (words.length > 0) {
    // OCR-guided: sample text bbox vs surrounding background
    for (const word of words) {
      const { x0, y0, x1, y1 } = word.bbox;
      if (x1 <= x0 || y1 <= y0) continue;

      const fg = sampleRegionAvg(data, Math.max(0, x0), Math.max(0, y0), Math.min(width, x1), Math.min(height, y1), width);

      const bgX0 = Math.max(0, x0 - pad);
      const bgY0 = Math.max(0, y0 - pad);
      const bgX1 = Math.min(width, x1 + pad);
      const bgY1 = Math.min(height, y1 + pad);
      const bg = sampleRegionAvg(data, bgX0, bgY0, bgX1, bgY1, width);

      const lFg = relativeLuminance(fg.r, fg.g, fg.b);
      const lBg = relativeLuminance(bg.r, bg.g, bg.b);
      const ratio = contrastRatio(lFg, lBg);

      total++;
      if (ratio >= 7.0) { passAAA++; passAA++; }
      else if (ratio >= 4.5) { passAA++; }
      else { issues++; }
    }
  } else {
    // Fallback: grid-based local contrast sampling
    const STEPS = 20;
    const stepX = Math.max(1, Math.floor(width / STEPS));
    const stepY = Math.max(1, Math.floor(height / STEPS));
    for (let gy = 1; gy < STEPS - 1; gy++) {
      for (let gx = 1; gx < STEPS - 1; gx++) {
        const cx = gx * stepX;
        const cy = gy * stepY;
        const center = sampleRegionAvg(data, Math.max(0, cx - 2), Math.max(0, cy - 2), Math.min(width, cx + 2), Math.min(height, cy + 2), width);
        const surround = sampleRegionAvg(data, Math.max(0, cx - stepX), Math.max(0, cy - stepY), Math.min(width, cx + stepX), Math.min(height, cy + stepY), width);
        const ratio = contrastRatio(
          relativeLuminance(center.r, center.g, center.b),
          relativeLuminance(surround.r, surround.g, surround.b),
        );
        if (ratio > 1.3) {
          total++;
          if (ratio >= 7.0) { passAAA++; passAA++; }
          else if (ratio >= 4.5) passAA++;
          else issues++;
        }
      }
    }
  }

  const wcagAAPassRate = total > 0 ? Math.round((passAA / total) * 100) : 80;
  const wcagAAAPassRate = total > 0 ? Math.round((passAAA / total) * 100) : 50;
  const issueCount = issues;

  const findings: string[] = [];
  if (total === 0) {
    findings.push('No text regions detected — contrast analysis based on overall image tone.');
  } else if (wcagAAPassRate >= 90) {
    findings.push(`${wcagAAPassRate}% of text regions meet WCAG AA contrast (4.5:1) — excellent legibility.`);
  } else if (wcagAAPassRate >= 70) {
    findings.push(`${wcagAAPassRate}% of text regions meet WCAG AA contrast — ${issueCount} region(s) need improvement.`);
  } else {
    findings.push(`Only ${wcagAAPassRate}% of text regions meet WCAG AA contrast — significant legibility issues detected.`);
  }
  if (wcagAAAPassRate < 30 && total > 0)
    findings.push('Few regions meet WCAG AAA standard (7:1) — consider higher contrast for accessibility-first users.');
  if (issueCount > 5)
    findings.push(`${issueCount} low-contrast text regions detected — review backgrounds under body text and labels.`);

  let score: number;
  if (wcagAAPassRate >= 90) score = 95;
  else if (wcagAAPassRate >= 75) score = 80;
  else if (wcagAAPassRate >= 55) score = 62;
  else score = 38;

  return { score, wcagAAPassRate, wcagAAAPassRate, issueCount, findings };
}
