import type { VisualHierarchyResult } from '@uxbeacon/shared-types';
import sharp from 'sharp';

export async function analyzeVisualHierarchy(
  buffer: Buffer,
  width: number,
  height: number,
): Promise<VisualHierarchyResult> {
  const { data } = await sharp(buffer)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const COLS = 20;
  const ROWS = 20;
  const cellW = Math.max(1, Math.floor(width / COLS));
  const cellH = Math.max(1, Math.floor(height / ROWS));

  // Average luminance per grid cell
  const cells: number[] = [];
  for (let gy = 0; gy < ROWS; gy++) {
    for (let gx = 0; gx < COLS; gx++) {
      let sum = 0;
      let count = 0;
      for (let py = gy * cellH; py < Math.min((gy + 1) * cellH, height); py++) {
        for (let px = gx * cellW; px < Math.min((gx + 1) * cellW, width); px++) {
          sum += data[py * width + px] ?? 128;
          count++;
        }
      }
      cells.push(count > 0 ? sum / count : 128);
    }
  }

  // Background luminance ≈ median cell value
  const sorted = [...cells].sort((a, b) => a - b);
  const bgLuminance = sorted[Math.floor(sorted.length / 2)] ?? 128;

  const contrastScores = cells.map((c) => Math.abs(c - bgLuminance));
  const maxContrast = Math.max(...contrastScores, 1);
  const threshold = maxContrast * 0.55;

  // Group adjacent high-contrast cells into "dominant regions"
  const highContrastCells = contrastScores.map((c) => c >= threshold);
  let regions = 0;
  for (let i = 0; i < highContrastCells.length; i++) {
    if (highContrastCells[i] && !highContrastCells[i - 1]) regions++;
  }
  const dominantElementCount = Math.max(1, Math.min(regions, 10));

  // Heading prominence: check top 25% rows for high-contrast cells
  const topBand = Math.floor(ROWS * 0.25) * COLS;
  const headingProminence = contrastScores.slice(0, topBand).some((c) => c >= threshold * 0.8)
    ? 82
    : 38;

  // CTA prominence: middle 40% band
  const midStart = Math.floor(ROWS * 0.3) * COLS;
  const midEnd = Math.floor(ROWS * 0.7) * COLS;
  const ctaProminence = contrastScores.slice(midStart, midEnd).some((c) => c >= threshold)
    ? 76
    : 44;

  // Attention flow: compare top vs bottom visual weight
  const half = Math.floor(cells.length / 2);
  const topWeight = contrastScores.slice(0, half).reduce((a, b) => a + b, 0);
  const bottomWeight = contrastScores.slice(half).reduce((a, b) => a + b, 0);
  const attentionFlow =
    topWeight > bottomWeight * 1.4
      ? 'Top-heavy — primary content draws attention toward the top (common for hero layouts)'
      : bottomWeight > topWeight * 1.4
        ? 'Bottom-heavy — key elements are clustered toward the bottom'
        : 'Balanced — visual weight is distributed across the layout';

  const findings: string[] = [];
  if (dominantElementCount === 0 || dominantElementCount === 1)
    findings.push('Strong single focal point detected — clear visual hierarchy.');
  else if (dominantElementCount <= 3)
    findings.push(`${dominantElementCount} dominant regions detected — good hierarchy with clear primary and secondary elements.`);
  else if (dominantElementCount <= 5)
    findings.push(`${dominantElementCount} dominant regions compete for attention — consider reducing visual noise.`);
  else
    findings.push(`${dominantElementCount} competing dominant elements detected — too many focal points reduce clarity and user focus.`);

  if (headingProminence < 60)
    findings.push('Heading area has low visual prominence — increase contrast or size to establish clear entry points.');
  if (ctaProminence < 60)
    findings.push('No prominent CTA detected in the primary content zone — ensure your call-to-action stands out.');

  let score = 70;
  if (dominantElementCount <= 1) score = 92;
  else if (dominantElementCount <= 3) score = 80;
  else if (dominantElementCount <= 5) score = 62;
  else score = 42;
  if (headingProminence > 70) score = Math.min(100, score + 4);
  if (ctaProminence > 70) score = Math.min(100, score + 4);

  return { score, dominantElementCount, headingProminence, ctaProminence, attentionFlow, findings };
}
