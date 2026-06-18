import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import type { DesignScanResult } from '@uxbeacon/shared-types';
import { DesignScanStore } from './design-scan.store';
import { runOCR } from '../engines/screenshot/ocr';
import { analyzeVisualHierarchy } from '../engines/screenshot/visual-hierarchy.engine';
import { analyzeContrast } from '../engines/screenshot/contrast.engine';
import { analyzeTypography } from '../engines/screenshot/typography.engine';
import { analyzeSpacing } from '../engines/screenshot/spacing.engine';
import { analyzeDensity } from '../engines/screenshot/density.engine';
import { analyzeCTA } from '../engines/screenshot/cta.engine';
import { analyzeColors } from '../engines/screenshot/color.engine';
import { analyzeGestalt } from '../engines/screenshot/gestalt.engine';
import { analyzeBalance } from '../engines/screenshot/balance.engine';
import {
  computeVisualScore,
  generateDesignSummary,
  generateDesignFindings,
  generateDesignRecommendations,
} from '../engines/screenshot/visual-score.engine';

@Injectable()
export class DesignScanService {
  private readonly logger = new Logger(DesignScanService.name);

  constructor(private readonly store: DesignScanStore) {}

  initScan(file: Express.Multer.File): Pick<DesignScanResult, 'id' | 'status'> {
    const id = uuidv4();
    const scan: DesignScanResult = {
      id,
      status: 'pending',
      filename: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      startedAt: new Date().toISOString(),
    };
    this.store.set(scan);

    this.runAnalysis(id, file.buffer).catch((err) => {
      this.logger.error(`DesignScan ${id} failed: ${err.message}`);
      this.store.update(id, { status: 'failed', error: err.message });
    });

    return { id, status: 'pending' };
  }

  getScan(id: string): DesignScanResult {
    const scan = this.store.get(id);
    if (!scan) throw new NotFoundException(`Design scan ${id} not found`);
    return scan;
  }

  private async runAnalysis(id: string, buffer: Buffer): Promise<void> {
    this.store.update(id, { status: 'analyzing' });
    this.logger.log(`[${id}] Starting design analysis`);

    // Get image dimensions
    const meta = await sharp(buffer).metadata();
    const width = meta.width ?? 800;
    const height = meta.height ?? 600;

    // Run OCR once — shared across engines that need text data
    this.logger.log(`[${id}] Running OCR`);
    const ocr = await runOCR(buffer, width, height);
    this.logger.log(`[${id}] OCR complete — ${ocr.words.length} words detected`);

    // Run all engines — OCR-independent engines can run in parallel with OCR-dependent ones
    const [
      hierarchyResult,
      contrastResult,
      densityResult,
      colorResult,
      balanceResult,
    ] = await Promise.all([
      analyzeVisualHierarchy(buffer, width, height),
      analyzeContrast(buffer, width, height, ocr),
      analyzeDensity(buffer),
      analyzeColors(buffer),
      analyzeBalance(buffer),
    ]);

    // OCR-dependent engines (synchronous, OCR already done)
    const typographyResult = analyzeTypography(ocr);
    const spacingResult = analyzeSpacing(ocr);
    const gestaltResult = analyzeGestalt(ocr);
    const ctaResult = await analyzeCTA(buffer, width, height, ocr);

    const visualQualityScore = computeVisualScore(
      hierarchyResult,
      contrastResult,
      typographyResult,
      spacingResult,
      densityResult,
      ctaResult,
      colorResult,
      balanceResult,
    );

    const executiveSummary = generateDesignSummary(null, visualQualityScore);
    const keyFindings = generateDesignFindings(hierarchyResult, contrastResult, ctaResult, typographyResult);
    const recommendations = generateDesignRecommendations(
      visualQualityScore,
      hierarchyResult,
      contrastResult,
      ctaResult,
      spacingResult,
      colorResult,
    );

    this.store.update(id, {
      status: 'complete',
      completedAt: new Date().toISOString(),
      visualQualityScore,
      hierarchyResult,
      contrastResult,
      typographyResult,
      spacingResult,
      densityResult,
      ctaResult,
      colorResult,
      gestaltResult,
      balanceResult,
      executiveSummary,
      keyFindings,
      recommendations,
    });

    this.logger.log(`[${id}] Design analysis complete — score: ${visualQualityScore.overall} (${visualQualityScore.grade})`);
  }

  exportJson(id: string): string {
    return JSON.stringify(this.getScan(id), null, 2);
  }
}
