import sharp from 'sharp';
import type { OCRData } from './ocr';
import type {
  AttentionRegion,
  CTAAttentionResult,
  HeroAttentionResult,
  AttentionLeakageResult,
  VisualClutterResult,
  UXGrade,
} from '@uxbeacon/shared-types';

const GRID = 32; // 32×32 saliency tile grid
const MAX_ANALYSIS_W = 800; // downscale for fast pixel analysis

const CTA_KEYWORDS = [
  'get started', 'start', 'buy', 'try', 'sign up', 'signup', 'subscribe',
  'join', 'download', 'register', 'book', 'order', 'contact', 'apply',
  'learn more', 'explore', 'shop', 'free', 'demo', 'schedule', 'request',
  'claim', 'upgrade', 'continue', 'submit', 'get', 'watch',
];

function isCTA(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return CTA_KEYWORDS.some((kw) => lower.includes(kw));
}

// ─── Heatmap colour map ───────────────────────────────────────────────────────

const COLOR_STOPS: [number, number, number, number][] = [
  [0.00,   0,   0, 255], // blue
  [0.25,   0, 200,  50], // green
  [0.50, 255, 255,   0], // yellow
  [0.75, 255, 140,   0], // orange
  [1.00, 255,   0,   0], // red
];

function heatmapColor(value: number): [number, number, number, number] {
  const v = Math.max(0, Math.min(1, value));
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const [t0, r0, g0, b0] = COLOR_STOPS[i];
    const [t1, r1, g1, b1] = COLOR_STOPS[i + 1];
    if (v >= t0 && v <= t1) {
      const t = (v - t0) / (t1 - t0);
      // Alpha: 15% at lowest, 75% at peak — preserves original image visibility
      const alpha = Math.round((v * 0.60 + 0.15) * 255);
      return [
        Math.round(r0 + t * (r1 - r0)),
        Math.round(g0 + t * (g1 - g0)),
        Math.round(b0 + t * (b1 - b0)),
        alpha,
      ];
    }
  }
  return [255, 0, 0, 191];
}

// ─── Saliency map ────────────────────────────────────────────────────────────

export async function buildSaliencyMap(
  buffer: Buffer,
  width: number,
  height: number,
  ocr: OCRData,
): Promise<Float32Array> {
  // Downscale for fast pixel analysis
  const scale = Math.min(1, MAX_ANALYSIS_W / width);
  const AW = Math.round(width * scale);
  const AH = Math.round(height * scale);

  const rgbBuf = await sharp(buffer)
    .resize(AW, AH)
    .removeAlpha()
    .raw()
    .toBuffer();

  // Derive grayscale from RGB (single Sharp call)
  const gray = new Uint8Array(AW * AH);
  for (let i = 0; i < AW * AH; i++) {
    gray[i] = Math.round(
      0.299 * (rgbBuf[i * 3] ?? 0) +
      0.587 * (rgbBuf[i * 3 + 1] ?? 0) +
      0.114 * (rgbBuf[i * 3 + 2] ?? 0),
    );
  }

  // Sobel gradient magnitude per pixel
  const grad = new Float32Array(AW * AH);
  for (let y = 1; y < AH - 1; y++) {
    for (let x = 1; x < AW - 1; x++) {
      const tl = gray[(y - 1) * AW + (x - 1)], tm = gray[(y - 1) * AW + x], tr = gray[(y - 1) * AW + (x + 1)];
      const ml = gray[y * AW + (x - 1)],                                       mr = gray[y * AW + (x + 1)];
      const bl = gray[(y + 1) * AW + (x - 1)], bm = gray[(y + 1) * AW + x], br = gray[(y + 1) * AW + (x + 1)];
      const gx = -tl - 2 * ml - bl + tr + 2 * mr + br;
      const gy = -tl - 2 * tm - tr + bl + 2 * bm + br;
      grad[y * AW + x] = Math.sqrt(gx * gx + gy * gy);
    }
  }

  // Per-tile stats
  const saliency = new Float32Array(GRID * GRID);
  const tileW = AW / GRID;
  const tileH = AH / GRID;

  for (let ty = 0; ty < GRID; ty++) {
    for (let tx = 0; tx < GRID; tx++) {
      const x0 = Math.floor(tx * tileW);
      const x1 = Math.min(Math.ceil((tx + 1) * tileW), AW);
      const y0 = Math.floor(ty * tileH);
      const y1 = Math.min(Math.ceil((ty + 1) * tileH), AH);

      let gradSum = 0, lumSum = 0, lumSq = 0, satSum = 0, count = 0;
      for (let py = y0; py < y1; py++) {
        for (let px = x0; px < x1; px++) {
          const pidx = py * AW + px;
          gradSum += grad[pidx];
          const lum = gray[pidx] ?? 0;
          lumSum += lum;
          lumSq += lum * lum;
          const r = rgbBuf[pidx * 3] ?? 0;
          const g = rgbBuf[pidx * 3 + 1] ?? 0;
          const b = rgbBuf[pidx * 3 + 2] ?? 0;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          satSum += max > 0 ? (max - min) / max : 0;
          count++;
        }
      }
      if (count === 0) continue;

      const avgGrad = gradSum / count;
      const avgLum = lumSum / count;
      const variance = lumSq / count - avgLum * avgLum;
      const avgSat = satSum / count;

      // Normalised signals
      const edgeDensity    = Math.min(1, avgGrad / 120);
      const localContrast  = Math.min(1, Math.sqrt(Math.max(0, variance)) / 60);
      const saturation     = Math.min(1, avgSat);

      // Spatial priors (humans look at centre/top-left first)
      const cx = (tx + 0.5) / GRID - 0.5;
      const cy = (ty + 0.5) / GRID - 0.40;
      const centerBias = Math.exp(-(cx * cx + cy * cy) / (2 * 0.18 * 0.18));
      const topBias    = Math.exp(-4 * (ty / GRID));

      saliency[ty * GRID + tx] =
        0.30 * edgeDensity +
        0.25 * localContrast +
        0.20 * centerBias +
        0.10 * topBias +
        0.15 * saturation;
    }
  }

  // OCR text boost — larger text = stronger pull on attention
  for (const word of ocr.words) {
    const { x0: wx0, y0: wy0, x1: wx1, y1: wy1 } = word.bbox;
    const textH = wy1 - wy0;
    const nx0 = wx0 / ocr.imageWidth;
    const ny0 = wy0 / ocr.imageHeight;
    const nx1 = wx1 / ocr.imageWidth;
    const ny1 = wy1 / ocr.imageHeight;
    const boost = Math.min(0.4, (textH / ocr.imageHeight) * 8) * 0.35;

    const tx0 = Math.max(0, Math.floor(nx0 * GRID));
    const tx1 = Math.min(GRID - 1, Math.floor(nx1 * GRID));
    const ty0 = Math.max(0, Math.floor(ny0 * GRID));
    const ty1 = Math.min(GRID - 1, Math.floor(ny1 * GRID));

    for (let ty = ty0; ty <= ty1; ty++) {
      for (let tx = tx0; tx <= tx1; tx++) {
        saliency[ty * GRID + tx] = Math.min(1, saliency[ty * GRID + tx] + boost);
      }
    }
  }

  // Normalise 0→1
  let maxS = 0, minS = 1;
  for (let i = 0; i < saliency.length; i++) {
    if (saliency[i] > maxS) maxS = saliency[i];
    if (saliency[i] < minS) minS = saliency[i];
  }
  const range = maxS - minS || 1;
  for (let i = 0; i < saliency.length; i++) {
    saliency[i] = (saliency[i] - minS) / range;
  }

  return saliency;
}

// ─── Heatmap PNG generation ───────────────────────────────────────────────────

export async function generateHeatmap(
  originalBuffer: Buffer,
  width: number,
  height: number,
  saliency: Float32Array,
): Promise<string> {
  // Build 32×32 RGBA tile buffer
  const tileRGBA = Buffer.alloc(GRID * GRID * 4);
  for (let i = 0; i < GRID * GRID; i++) {
    const [r, g, b, a] = heatmapColor(saliency[i]);
    tileRGBA[i * 4]     = r;
    tileRGBA[i * 4 + 1] = g;
    tileRGBA[i * 4 + 2] = b;
    tileRGBA[i * 4 + 3] = a;
  }

  // Scale up with gaussian interpolation (naturally smooths the heatmap)
  const heatmapFull = await sharp(tileRGBA, {
    raw: { width: GRID, height: GRID, channels: 4 },
  })
    .resize(width, height, { kernel: 'mitchell' })
    .png()
    .toBuffer();

  // Composite over original
  const overlay = await sharp(originalBuffer)
    .composite([{ input: heatmapFull, blend: 'over' }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${overlay.toString('base64')}`;
}

// ─── Attention region extraction ──────────────────────────────────────────────

function inferLabel(cx: number, cy: number, ocr: OCRData): string {
  // Check for CTA text near this position
  for (const word of ocr.words) {
    const wcx = ((word.bbox.x0 + word.bbox.x1) / 2) / ocr.imageWidth;
    const wcy = ((word.bbox.y0 + word.bbox.y1) / 2) / ocr.imageHeight;
    if (Math.abs(wcx - cx) < 0.15 && Math.abs(wcy - cy) < 0.10 && isCTA(word.text)) {
      return 'CTA';
    }
  }
  if (cy < 0.12) return 'Navigation';
  if (cy < 0.45 && cx > 0.2 && cx < 0.8) return 'Hero / Headline';
  if (cy < 0.45) return 'Hero';
  if (cy > 0.88) return 'Footer';
  // Check for any nearby text
  for (const word of ocr.words) {
    const wcx = ((word.bbox.x0 + word.bbox.x1) / 2) / ocr.imageWidth;
    const wcy = ((word.bbox.y0 + word.bbox.y1) / 2) / ocr.imageHeight;
    if (Math.abs(wcx - cx) < 0.15 && Math.abs(wcy - cy) < 0.10) return 'Content';
  }
  return 'Visual Element';
}

export function extractAttentionRegions(saliency: Float32Array, ocr: OCRData): AttentionRegion[] {
  const tileW = 1 / GRID;
  const tileH = 1 / GRID;
  const EXPAND = 3;
  const MIN_SAL = 0.35;
  const MAX_REGIONS = 7;

  const sorted = Array.from({ length: GRID * GRID }, (_, i) => ({
    i, tx: i % GRID, ty: Math.floor(i / GRID), s: saliency[i],
  })).sort((a, b) => b.s - a.s);

  const used = new Set<number>();
  const regions: AttentionRegion[] = [];

  for (const tile of sorted) {
    if (regions.length >= MAX_REGIONS) break;
    if (tile.s < MIN_SAL) break;
    if (used.has(tile.i)) continue;

    let minTx = tile.tx, maxTx = tile.tx, minTy = tile.ty, maxTy = tile.ty;
    let wSum = 0, wCount = 0;

    const x0 = Math.max(0, tile.tx - EXPAND);
    const x1 = Math.min(GRID - 1, tile.tx + EXPAND);
    const y0 = Math.max(0, tile.ty - EXPAND);
    const y1 = Math.min(GRID - 1, tile.ty + EXPAND);

    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        const idx = ty * GRID + tx;
        if (used.has(idx) || saliency[idx] < 0.20) continue;
        used.add(idx);
        minTx = Math.min(minTx, tx); maxTx = Math.max(maxTx, tx);
        minTy = Math.min(minTy, ty); maxTy = Math.max(maxTy, ty);
        wSum += saliency[idx]; wCount++;
      }
    }

    const avgW = wCount > 0 ? wSum / wCount : tile.s;
    const cx = (minTx + maxTx) / 2 / GRID;
    const cy = (minTy + maxTy) / 2 / GRID;

    regions.push({
      x: minTx * tileW,
      y: minTy * tileH,
      width: (maxTx - minTx + 1) * tileW,
      height: (maxTy - minTy + 1) * tileH,
      weight: Math.round(avgW * 100),
      rank: regions.length + 1,
      label: inferLabel(cx, cy, ocr),
    });
  }

  return regions;
}

// ─── Sub-analyses ─────────────────────────────────────────────────────────────

export function analyzeCTAAttention(saliency: Float32Array, ocr: OCRData): CTAAttentionResult {
  const ctaWords = ocr.words.filter((w) => isCTA(w.text));

  if (ctaWords.length === 0) {
    return {
      score: 30,
      ctaRank: null,
      ctaWeight: 0,
      prominence: 20,
      visibility: 25,
      findings: ['No CTA detected — add a prominent call-to-action to guide users toward conversion.'],
    };
  }

  // Get saliency for each CTA word
  const candidates = ctaWords.map((w) => {
    const cx = ((w.bbox.x0 + w.bbox.x1) / 2) / ocr.imageWidth;
    const cy = ((w.bbox.y0 + w.bbox.y1) / 2) / ocr.imageHeight;
    const tx = Math.min(GRID - 1, Math.floor(cx * GRID));
    const ty = Math.min(GRID - 1, Math.floor(cy * GRID));
    return { word: w, sal: saliency[ty * GRID + tx], cx, cy };
  }).sort((a, b) => b.sal - a.sal);

  const best = candidates[0];

  // Rank: count distinct high-saliency regions above the CTA's saliency
  const seen = new Set<number>();
  let rank = 1;
  for (let i = 0; i < GRID * GRID; i++) {
    if (saliency[i] > best.sal) {
      const bucket = Math.floor((i % GRID) / 5) * 8 + Math.floor(Math.floor(i / GRID) / 5);
      if (!seen.has(bucket)) { seen.add(bucket); rank++; }
    }
  }

  const weight = Math.round(best.sal * 100);
  const prominence = weight;
  const visibility = best.sal > 0.6 ? 88 : best.sal > 0.4 ? 68 : 42;

  const findings: string[] = [];
  if (rank === 1) findings.push(`CTA "${best.word.text}" is the #1 attention anchor — excellent visibility.`);
  else if (rank <= 3) findings.push(`CTA "${best.word.text}" ranks #${rank} in attention order — good prominence.`);
  else findings.push(`CTA "${best.word.text}" ranks #${rank} in attention — consider increasing contrast or moving it higher.`);
  if (best.cy > 0.7) findings.push('Primary CTA is positioned below the fold — many users may not scroll to it.');
  if (weight < 40) findings.push('CTA has low visual weight — it risks being overlooked by scanning users.');
  if (candidates.length > 3) findings.push(`${candidates.length} CTAs compete for attention — clarify which is the primary action.`);

  const score =
    rank === 1 && weight > 60 ? 92 :
    rank <= 2 && weight > 50 ? 80 :
    rank <= 4               ? 65 : 45;

  return { score, ctaRank: rank, ctaWeight: weight, prominence, visibility, findings };
}

export function analyzeHeroAttention(saliency: Float32Array, ocr: OCRData): HeroAttentionResult {
  const HERO_ROWS = Math.floor(GRID * 0.40); // top 40%

  let heroSum = 0, belowSum = 0;
  for (let ty = 0; ty < GRID; ty++) {
    for (let tx = 0; tx < GRID; tx++) {
      const s = saliency[ty * GRID + tx];
      if (ty < HERO_ROWS) heroSum += s; else belowSum += s;
    }
  }
  const heroAvg  = heroSum  / (HERO_ROWS * GRID);
  const belowAvg = belowSum / ((GRID - HERO_ROWS) * GRID);
  const heroDominance = Math.round(Math.min(100, (heroAvg / (heroAvg + belowAvg + 0.001)) * 180));

  const heroWords = ocr.words.filter((w) => {
    const wcy = ((w.bbox.y0 + w.bbox.y1) / 2) / ocr.imageHeight;
    return wcy < 0.40;
  });

  const maxH = heroWords.reduce((m, w) => Math.max(m, w.height), 0);
  const avgH = heroWords.length > 0 ? heroWords.reduce((s, w) => s + w.height, 0) / heroWords.length : 0;
  const headlineProminence = avgH > 0 ? Math.round(Math.min(100, (maxH / avgH) * 25)) : 30;
  const messageVisibility  = Math.min(100, Math.round(heroAvg * 130));

  const findings: string[] = [];
  if (heroDominance > 60) findings.push('Hero section has strong visual dominance — users will focus on it immediately.');
  else if (heroDominance > 40) findings.push('Hero has moderate dominance — increasing contrast or scale would strengthen first impressions.');
  else findings.push('Hero section has weak visual dominance — it may not be the first thing users notice.');
  if (headlineProminence < 30) findings.push('Headline does not stand out from body text — increase font size or weight.');
  else if (headlineProminence > 60) findings.push('Headline has clear typographic hierarchy — primary message is well differentiated.');
  if (heroWords.length === 0) findings.push('No text detected in the hero zone — ensure your key message is visible.');

  const score = Math.max(0, Math.min(100, Math.round(
    heroDominance * 0.40 + headlineProminence * 0.35 + messageVisibility * 0.25,
  )));

  return { score, heroDominance, headlineProminence, messageVisibility, findings };
}

export function detectAttentionLeakage(saliency: Float32Array, ocr: OCRData): AttentionLeakageResult {
  const textTiles = new Set<number>();
  for (const word of ocr.words) {
    const cx = ((word.bbox.x0 + word.bbox.x1) / 2) / ocr.imageWidth;
    const cy = ((word.bbox.y0 + word.bbox.y1) / 2) / ocr.imageHeight;
    const tx = Math.min(GRID - 1, Math.floor(cx * GRID));
    const ty = Math.min(GRID - 1, Math.floor(cy * GRID));
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = tx + dx, ny = ty + dy;
        if (nx >= 0 && nx < GRID && ny >= 0 && ny < GRID) {
          textTiles.add(ny * GRID + nx);
        }
      }
    }
  }

  const HIGH = 0.65;
  const leakers: { tx: number; ty: number; s: number }[] = [];
  for (let i = 0; i < GRID * GRID; i++) {
    if (saliency[i] > HIGH && !textTiles.has(i)) {
      leakers.push({ tx: i % GRID, ty: Math.floor(i / GRID), s: saliency[i] });
    }
  }
  leakers.sort((a, b) => b.s - a.s);

  const leakingRegions: string[] = [];
  const described = new Set<number>();
  for (const t of leakers.slice(0, 12)) {
    const bucket = Math.floor(t.tx / 5) * 10 + Math.floor(t.ty / 5);
    if (described.has(bucket)) continue;
    described.add(bucket);
    const xPct = Math.round((t.tx / GRID) * 100);
    const yPct = Math.round((t.ty / GRID) * 100);
    const pos  = yPct < 30 ? 'top' : yPct > 70 ? 'bottom' : 'middle';
    const side = xPct < 35 ? 'left' : xPct > 65 ? 'right' : 'centre';
    leakingRegions.push(`High-attention decorative element at ${pos}-${side} (${Math.round(t.s * 100)}% weight)`);
  }

  const totalHigh = Array.from(saliency).filter((s) => s > HIGH).length;
  const funcHigh  = Array.from({ length: GRID * GRID }, (_, i) => i).filter(
    (i) => saliency[i] > HIGH && textTiles.has(i),
  ).length;
  const leakRatio = totalHigh > 0 ? 1 - funcHigh / totalHigh : 0;
  const leakageDetected = leakingRegions.length >= 2;

  const findings: string[] = [];
  const recommendations: string[] = [];
  if (!leakageDetected) {
    findings.push('No significant attention leakage — visual weight is focused on functional elements.');
  } else {
    findings.push(`${leakingRegions.length} decorative regions attract more attention than functional content.`);
    if (leakingRegions[0]) findings.push(leakingRegions[0]);
    recommendations.push('Reduce contrast or scale of decorative background elements so they do not compete with CTAs.');
    recommendations.push('Ensure hero images and illustrations lead the eye toward conversion elements, not away from them.');
    if (leakRatio > 0.5) recommendations.push('Consider a visual hierarchy audit to identify which decorative elements are undermining conversion.');
  }

  const score = Math.round((1 - leakRatio * 0.7) * 100);
  return { score: Math.max(0, Math.min(100, score)), leakageDetected, leakingRegions, findings, recommendations };
}

export function computeClutter(saliency: Float32Array, ocr: OCRData): VisualClutterResult {
  // Count local maxima above threshold as competing focal points
  let focalPoints = 0;
  for (let ty = 1; ty < GRID - 1; ty++) {
    for (let tx = 1; tx < GRID - 1; tx++) {
      const idx = ty * GRID + tx;
      const s = saliency[idx];
      if (s < 0.65) continue;
      if (
        s >= saliency[(ty - 1) * GRID + tx] &&
        s >= saliency[(ty + 1) * GRID + tx] &&
        s >= saliency[ty * GRID + (tx - 1)] &&
        s >= saliency[ty * GRID + (tx + 1)]
      ) focalPoints++;
    }
  }

  const vals = Array.from(saliency);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
  const edgeDensity = Math.min(1, Math.sqrt(variance));

  const wordDensity = Math.min(1, ocr.words.length / 100);
  const focalPenalty = Math.min(1, focalPoints / 8);
  const clutterScore = Math.round((wordDensity * 0.4 + focalPenalty * 0.4 + edgeDensity * 0.2) * 100);

  const findings: string[] = [];
  if (focalPoints <= 2) findings.push(`${focalPoints} competing focal point(s) — clean, focused layout.`);
  else if (focalPoints <= 4) findings.push(`${focalPoints} focal points compete — hierarchy exists but could be tighter.`);
  else findings.push(`${focalPoints} focal points detected — too many competing elements risk cognitive overload.`);
  if (wordDensity > 0.6) findings.push('High text density — consider breaking content into shorter, scannable chunks.');
  if (clutterScore > 65) findings.push('High visual clutter — users may struggle to identify where to focus.');
  else if (clutterScore < 25) findings.push('Very low clutter — clean, minimal design that is easy to scan.');

  return {
    score: Math.max(0, Math.min(100, 100 - clutterScore)),
    clutterScore,
    competingFocalPoints: focalPoints,
    edgeDensity,
    findings,
  };
}

// ─── Overall score ────────────────────────────────────────────────────────────

export function computeAttentionScore(
  cta: CTAAttentionResult,
  hero: HeroAttentionResult,
  leakage: AttentionLeakageResult,
  clutter: VisualClutterResult,
): { overall: number; grade: UXGrade } {
  const overall = Math.round(
    cta.score     * 0.35 +
    hero.score    * 0.25 +
    leakage.score * 0.25 +
    clutter.score * 0.15,
  );
  const grade: UXGrade =
    overall >= 90 ? 'A+' :
    overall >= 80 ? 'A'  :
    overall >= 70 ? 'B'  :
    overall >= 60 ? 'C'  :
    overall >= 50 ? 'D'  : 'F';
  return { overall, grade };
}

// ─── Summary generators ───────────────────────────────────────────────────────

export function generateAttentionSummary(
  overall: number,
  grade: UXGrade,
  cta: CTAAttentionResult,
  leakage: AttentionLeakageResult,
): string {
  const level = overall >= 80 ? 'strong' : overall >= 60 ? 'moderate' : 'weak';
  const leakNote = leakage.leakageDetected
    ? ' Attention leakage from decorative elements was detected.'
    : ' Visual weight is well-directed toward functional elements.';
  const ctaNote = cta.ctaRank === null
    ? ' No CTA was identified.'
    : cta.ctaRank <= 2
    ? ` The primary CTA ranks #${cta.ctaRank} in user attention.`
    : ` The primary CTA ranks #${cta.ctaRank} — it may benefit from higher prominence.`;
  return `This design has ${level} visual attention alignment (${grade}, ${overall}/100).${ctaNote}${leakNote}`;
}

export function generateAttentionFindings(
  cta: CTAAttentionResult,
  hero: HeroAttentionResult,
  leakage: AttentionLeakageResult,
  clutter: VisualClutterResult,
): string[] {
  return [
    ...cta.findings.slice(0, 2),
    ...hero.findings.slice(0, 1),
    ...leakage.findings.slice(0, 1),
    ...clutter.findings.slice(0, 1),
  ].slice(0, 6);
}

export function generateAttentionRecommendations(
  cta: CTAAttentionResult,
  leakage: AttentionLeakageResult,
  clutter: VisualClutterResult,
): string[] {
  const recs: string[] = [];
  if (cta.ctaRank === null) recs.push('Add a clear, high-contrast CTA button above the fold.');
  else if (cta.ctaRank > 3) recs.push('Increase CTA size or contrast to make it the dominant attention anchor.');
  if (leakage.leakageDetected) recs.push(...leakage.recommendations.slice(0, 2));
  if (clutter.clutterScore > 60) recs.push('Reduce the number of competing visual elements to create a cleaner focal hierarchy.');
  recs.push('Test with real users — rule-based attention prediction approximates, not replaces, eye-tracking.');
  return recs.slice(0, 5);
}
