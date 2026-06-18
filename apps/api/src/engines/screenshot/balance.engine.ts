import type { BalanceResult } from '@uxbeacon/shared-types';
import sharp from 'sharp';

export async function analyzeBalance(buffer: Buffer): Promise<BalanceResult> {
  const { data, info } = await sharp(buffer)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const midX = Math.floor(width / 2);
  const midY = Math.floor(height / 2);

  let leftWeight = 0, rightWeight = 0, topWeight = 0, bottomWeight = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Visual weight = darkness (inverted luminance) so dark elements weigh more
      const lum = data[y * width + x] ?? 128;
      const w = 255 - lum;
      if (x < midX) leftWeight += w;
      else rightWeight += w;
      if (y < midY) topWeight += w;
      else bottomWeight += w;
    }
  }

  const totalH = leftWeight + rightWeight || 1;
  const totalV = topWeight + bottomWeight || 1;

  const hImbalance = Math.abs(leftWeight - rightWeight) / totalH;
  const vImbalance = Math.abs(topWeight - bottomWeight) / totalV;

  // Score: 0 imbalance = 100, full imbalance = 0
  // Vertical imbalance is expected (nav top, footer bottom), so penalize less
  const horizontalBalance = Math.round((1 - hImbalance) * 100);
  const verticalBalance = Math.round((1 - vImbalance) * 100);

  const findings: string[] = [];

  if (horizontalBalance >= 80) {
    findings.push('Good horizontal balance — visual weight is distributed evenly left and right.');
  } else if (horizontalBalance >= 60) {
    findings.push('Slight horizontal imbalance — consider distributing content or visual elements more evenly across columns.');
  } else {
    findings.push('Significant horizontal imbalance — layout is heavily weighted to one side. Rebalance content or use whitespace to counterweight.');
  }

  if (verticalBalance >= 60) {
    findings.push('Vertical weight distribution is natural — common for layouts with header-heavy or footer-heavy structures.');
  } else {
    findings.push('Extreme vertical imbalance — most visual weight is concentrated at one end. Check content distribution across the page.');
  }

  // Weight horizontal balance more (vertical imbalance is often intentional)
  const score = Math.round(horizontalBalance * 0.65 + verticalBalance * 0.35);

  return { score, horizontalBalance, verticalBalance, findings };
}
