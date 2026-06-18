import type { CTAResult } from '@uxbeacon/shared-types';
import sharp from 'sharp';
import type { OCRData } from './ocr';

const CTA_KEYWORDS = [
  'get started', 'get', 'start', 'buy', 'try', 'sign up', 'signup', 'subscribe',
  'join', 'download', 'register', 'book', 'order', 'contact', 'apply', 'learn more',
  'explore', 'discover', 'shop', 'view', 'see', 'watch', 'read', 'free', 'demo',
  'schedule', 'request', 'claim', 'upgrade', 'continue', 'next', 'submit',
];

function isCTAText(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return CTA_KEYWORDS.some((kw) => lower.includes(kw));
}

function samplePixelRGB(
  data: Buffer,
  x: number,
  y: number,
  width: number,
): { r: number; g: number; b: number } {
  const idx = (y * width + x) * 3;
  return { r: data[idx] ?? 128, g: data[idx + 1] ?? 128, b: data[idx + 2] ?? 128 };
}

function luminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export async function analyzeCTA(
  buffer: Buffer,
  width: number,
  height: number,
  ocr: OCRData,
): Promise<CTAResult> {
  const { data } = await sharp(buffer).removeAlpha().raw().toBuffer({ resolveWithObject: true });

  // Collect full text lines that contain CTA keywords
  const ctaLines = ocr.lines.filter((l) => isCTAText(l.text));

  // Score each CTA candidate by: contrast + placement (higher on page = better)
  const candidates = ctaLines.map((line) => {
    const { x0, y0, x1, y1 } = line.bbox;
    const cx = Math.round((x0 + x1) / 2);
    const cy = Math.round((y0 + y1) / 2);

    // Sample center of text and surrounding background
    const fg = samplePixelRGB(data, Math.min(cx, width - 1), Math.min(cy, height - 1), width);
    const bgX = Math.min(Math.max(0, x0 - 8), width - 1);
    const bgY = Math.min(Math.max(0, y0 - 8), height - 1);
    const bg = samplePixelRGB(data, bgX, bgY, width);

    const lFg = luminance(fg.r, fg.g, fg.b);
    const lBg = luminance(bg.r, bg.g, bg.b);
    const lighter = Math.max(lFg, lBg);
    const darker = Math.min(lFg, lBg);
    const contrast = (lighter + 0.05) / (darker + 0.05);

    // Placement score: reward elements in the top 60% of the image
    const yRatio = cy / height;
    const placement = yRatio <= 0.6 ? 1 - yRatio : 0.4;

    return { text: line.text, contrast, placement, score: contrast * placement };
  });

  candidates.sort((a, b) => b.score - a.score);
  const primaryCTA = candidates[0] ?? null;
  const ctaCount = candidates.length;

  const findings: string[] = [];

  if (ctaCount === 0) {
    findings.push('No clear CTA detected — add a prominent call-to-action to guide users toward conversion.');
  } else if (ctaCount === 1) {
    findings.push(`Primary CTA identified: "${primaryCTA!.text}" — single clear CTA is ideal.`);
  } else {
    findings.push(`${ctaCount} CTAs detected. Primary: "${primaryCTA!.text}" — ensure hierarchy is clear between primary and secondary actions.`);
  }

  if (primaryCTA) {
    if (primaryCTA.contrast < 3) findings.push('Primary CTA has low contrast — it may be hard to see against the background.');
    else if (primaryCTA.contrast >= 4.5) findings.push('Primary CTA meets WCAG AA contrast requirements — good visibility.');
    if (primaryCTA.placement < 0.3) findings.push('CTA is placed very low on the page — consider moving it above the fold.');
  }

  let score: number;
  if (ctaCount === 0) score = 30;
  else if (ctaCount === 1 && primaryCTA!.contrast >= 4.5) score = 92;
  else if (ctaCount === 1) score = 72;
  else if (ctaCount <= 3 && primaryCTA!.contrast >= 3) score = 75;
  else score = 55;

  return {
    score,
    primaryCTAFound: ctaCount > 0,
    primaryCTAText: primaryCTA?.text ?? '',
    ctaCount,
    findings,
  };
}
