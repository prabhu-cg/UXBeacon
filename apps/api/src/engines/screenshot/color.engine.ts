import type { ColorResult } from '@uxbeacon/shared-types';
import sharp from 'sharp';

interface ColorBucket {
  r: number;
  g: number;
  b: number;
  count: number;
}

function toHex(r: number, g: number, b: number): string {
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

function rgbToHue(r: number, g: number, b: number): number {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const d = max - min;
  if (d === 0) return 0;
  let h = 0;
  if (max === rr) h = ((gg - bb) / d) % 6;
  else if (max === gg) h = (bb - rr) / d + 2;
  else h = (rr - gg) / d + 4;
  return ((h * 60) + 360) % 360;
}

export async function analyzeColors(buffer: Buffer): Promise<ColorResult> {
  // Resize to small thumbnail for fast quantization
  const { data } = await sharp(buffer)
    .resize(120, 120, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Quantize: bucket size 32 per channel → 8³ = 512 possible buckets
  const bucketMap = new Map<string, ColorBucket>();
  const STEP = 32;

  for (let i = 0; i < data.length; i += 3) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // Skip near-white (>240) and near-black (<15) — likely background/text defaults
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum > 245 || lum < 10) continue;

    const qr = Math.floor(r / STEP) * STEP + STEP / 2;
    const qg = Math.floor(g / STEP) * STEP + STEP / 2;
    const qb = Math.floor(b / STEP) * STEP + STEP / 2;
    const key = `${qr},${qg},${qb}`;

    const existing = bucketMap.get(key);
    if (existing) existing.count++;
    else bucketMap.set(key, { r: qr, g: qg, b: qb, count: 1 });
  }

  const sorted = Array.from(bucketMap.values()).sort((a, b) => b.count - a.count);

  // Take top 8 colors; deduplicate by hue proximity (±30°)
  const palette: ColorBucket[] = [];
  for (const bucket of sorted) {
    if (palette.length >= 8) break;
    const hue = rgbToHue(bucket.r, bucket.g, bucket.b);
    const tooClose = palette.some((p) => {
      const ph = rgbToHue(p.r, p.g, p.b);
      const diff = Math.abs(hue - ph);
      return Math.min(diff, 360 - diff) < 25;
    });
    if (!tooClose) palette.push(bucket);
  }

  if (palette.length === 0 && sorted.length > 0) palette.push(sorted[0]);

  const dominantColors = palette.slice(0, 3).map((c) => toHex(c.r, c.g, c.b));
  const accentColors = palette.slice(3).map((c) => toHex(c.r, c.g, c.b));

  // Group hues into families (every 60° = one color family)
  const hueGroups = new Set(palette.map((c) => Math.floor(rgbToHue(c.r, c.g, c.b) / 60)));
  const totalColorGroups = hueGroups.size;

  const findings: string[] = [];
  if (totalColorGroups <= 2) {
    findings.push(`${totalColorGroups} dominant hue group(s) detected — tight, cohesive color palette.`);
  } else if (totalColorGroups <= 4) {
    findings.push(`${totalColorGroups} hue groups detected — moderate palette complexity, ensure colors serve distinct purposes.`);
  } else {
    findings.push(`${totalColorGroups} hue groups detected — palette may feel scattered. Aim for 2–3 primary hues.`);
  }

  if (dominantColors.length > 0) {
    findings.push(`Dominant color: ${dominantColors[0]}.`);
  }
  if (accentColors.length > 0) {
    findings.push(`${accentColors.length} accent color(s) identified — verify they're used consistently for emphasis.`);
  }

  let score: number;
  if (totalColorGroups <= 2) score = 90;
  else if (totalColorGroups <= 3) score = 78;
  else if (totalColorGroups <= 4) score = 65;
  else score = 45;

  return { score, dominantColors, accentColors, totalColorGroups, findings };
}
