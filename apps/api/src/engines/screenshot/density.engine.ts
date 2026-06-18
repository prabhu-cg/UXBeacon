import type { DensityResult } from '@uxbeacon/shared-types';
import sharp from 'sharp';

export async function analyzeDensity(buffer: Buffer): Promise<DensityResult> {
  const { data, info } = await sharp(buffer)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const total = info.width * info.height;
  let whitePixels = 0;

  // Threshold: pixels >= 240 are considered whitespace
  for (let i = 0; i < data.length; i++) {
    if (data[i] >= 240) whitePixels++;
  }

  const whiteSpaceRatio = Math.round((whitePixels / total) * 100);
  const contentDensity = 100 - whiteSpaceRatio;

  const findings: string[] = [];

  if (whiteSpaceRatio < 20) {
    findings.push(`Very low whitespace (${whiteSpaceRatio}%) — the layout feels cramped. Increase margins and padding.`);
  } else if (whiteSpaceRatio < 35) {
    findings.push(`Low whitespace ratio (${whiteSpaceRatio}%) — consider breathing room between elements.`);
  } else if (whiteSpaceRatio <= 65) {
    findings.push(`Good whitespace balance (${whiteSpaceRatio}%) — content density is in the optimal range.`);
  } else if (whiteSpaceRatio <= 80) {
    findings.push(`High whitespace (${whiteSpaceRatio}%) — layout feels spacious. Ensure key content is above the fold.`);
  } else {
    findings.push(`Very high whitespace (${whiteSpaceRatio}%) — the design may feel too sparse or unfinished.`);
  }

  // Score: optimal range is 35–65% whitespace
  let score: number;
  if (whiteSpaceRatio >= 35 && whiteSpaceRatio <= 65) score = 90;
  else if (whiteSpaceRatio >= 25 && whiteSpaceRatio < 35) score = 72;
  else if (whiteSpaceRatio > 65 && whiteSpaceRatio <= 75) score = 75;
  else if (whiteSpaceRatio < 25) score = 45;
  else score = 55; // > 75%

  return { score, whiteSpaceRatio, contentDensity, findings };
}
