import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import type { AttentionScanResult } from '@uxbeacon/shared-types';
import { AttentionScanStore } from './attention-scan.store';
import { runOCR } from '../engines/screenshot/ocr';
import {
  buildSaliencyMap,
  generateHeatmap,
  extractAttentionRegions,
  analyzeCTAAttention,
  analyzeHeroAttention,
  detectAttentionLeakage,
  computeClutter,
  computeAttentionScore,
  generateAttentionSummary,
  generateAttentionFindings,
  generateAttentionRecommendations,
} from '../engines/screenshot/attention.engine';

@Injectable()
export class AttentionScanService {
  private readonly logger = new Logger(AttentionScanService.name);

  constructor(private readonly store: AttentionScanStore) {}

  initScan(file: Express.Multer.File): Pick<AttentionScanResult, 'id' | 'status'> {
    const id = uuidv4();
    const scan: AttentionScanResult = {
      id,
      status: 'pending',
      filename: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      startedAt: new Date().toISOString(),
    };
    this.store.set(scan);
    this.runAnalysis(id, file.buffer).catch((err) => {
      this.logger.error(`AttentionScan ${id} failed: ${err.message}`);
      this.store.update(id, { status: 'failed', error: err.message });
    });
    return { id, status: 'pending' };
  }

  getScan(id: string): AttentionScanResult {
    const scan = this.store.get(id);
    if (!scan) throw new NotFoundException(`Attention scan ${id} not found`);
    return scan;
  }

  private async runAnalysis(id: string, rawBuffer: Buffer): Promise<void> {
    this.store.update(id, { status: 'analyzing' });
    this.logger.log(`[${id}] Starting attention analysis`);

    // Cap to 1920 px wide before any processing to prevent OOM on large retina screenshots
    const MAX_W = 1920;
    const rawMeta = await sharp(rawBuffer).metadata();
    const rawW = rawMeta.width ?? 800;
    let buffer = rawBuffer;
    if (rawW > MAX_W) {
      this.logger.log(`[${id}] Downscaling from ${rawW}px to ${MAX_W}px wide`);
      buffer = await sharp(rawBuffer)
        .resize(MAX_W, undefined, { fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer();
    }

    const meta = await sharp(buffer).metadata();
    const width  = meta.width  ?? 800;
    const height = meta.height ?? 600;

    this.logger.log(`[${id}] Running OCR (${width}×${height})`);
    const ocr = await runOCR(buffer, width, height);
    this.logger.log(`[${id}] OCR complete — ${ocr.words.length} words`);

    this.logger.log(`[${id}] Building saliency map`);
    const saliency = await buildSaliencyMap(buffer, width, height, ocr);

    this.logger.log(`[${id}] Generating heatmap`);
    const heatmapDataUri = await generateHeatmap(buffer, width, height, saliency);

    const attentionRegions  = extractAttentionRegions(saliency, ocr);
    const ctaAttention      = analyzeCTAAttention(saliency, ocr);
    const heroAttention     = analyzeHeroAttention(saliency, ocr);
    const leakage           = detectAttentionLeakage(saliency, ocr);
    const clutter           = computeClutter(saliency, ocr);
    const { overall, grade } = computeAttentionScore(ctaAttention, heroAttention, leakage, clutter);

    const executiveSummary  = generateAttentionSummary(overall, grade, ctaAttention, leakage);
    const keyFindings       = generateAttentionFindings(ctaAttention, heroAttention, leakage, clutter);
    const recommendations   = generateAttentionRecommendations(ctaAttention, leakage, clutter);

    this.store.update(id, {
      status: 'complete',
      completedAt: new Date().toISOString(),
      heatmapDataUri,
      attentionRegions,
      ctaAttention,
      heroAttention,
      leakage,
      clutter,
      overallScore: overall,
      grade,
      executiveSummary,
      keyFindings,
      recommendations,
    });

    this.logger.log(`[${id}] Attention analysis complete — score: ${overall} (${grade})`);
  }

  exportJson(id: string): string {
    return JSON.stringify(this.getScan(id), null, 2);
  }
}
