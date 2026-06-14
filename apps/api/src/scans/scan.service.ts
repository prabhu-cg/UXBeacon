import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { ScanResult } from '@uxbeacon/shared-types';
import { ScanStore } from './scan.store';
import { CrawlerService } from '../engines/crawler.service';
import { evaluateHeuristics } from '../engines/heuristics.engine';
import { evaluateUXLaws } from '../engines/ux-laws.engine';
import { evaluateContent } from '../engines/content.engine';
import { evaluateNavigation, buildSitemap } from '../engines/navigation.engine';
import {
  parseAxeResults,
  createFallbackAccessibilityScore,
} from '../engines/accessibility.engine';
import {
  computeHealthScore,
  generateExecutiveSummary,
  generateKeyFindings,
  generateRecommendations,
} from '../engines/score.engine';

@Injectable()
export class ScanService {
  private readonly logger = new Logger(ScanService.name);

  constructor(
    private readonly store: ScanStore,
    private readonly crawler: CrawlerService,
  ) {}

  initScan(url: string): Pick<ScanResult, 'id' | 'status'> {
    const id = uuidv4();
    const scan: ScanResult = {
      id,
      url,
      status: 'pending',
      startedAt: new Date().toISOString(),
      pageCount: 0,
    };
    this.store.set(scan);

    // Run analysis asynchronously — don't await
    this.runAnalysis(id, url).catch((err) => {
      this.logger.error(`Scan ${id} failed: ${err.message}`);
      this.store.update(id, { status: 'failed', error: err.message });
    });

    return { id, status: 'pending' };
  }

  getScan(id: string): ScanResult {
    const scan = this.store.get(id);
    if (!scan) throw new NotFoundException(`Scan ${id} not found`);
    return scan;
  }

  private async runAnalysis(id: string, url: string): Promise<void> {
    // Phase: crawling
    this.store.update(id, { status: 'crawling' });
    this.logger.log(`[${id}] Starting crawl of ${url}`);

    let pages = await this.crawler.crawl(url);
    if (pages.length === 0) {
      throw new Error('Could not crawl any pages. The site may require authentication or be blocking crawlers.');
    }

    this.store.update(id, { pageCount: pages.length });
    this.logger.log(`[${id}] Crawled ${pages.length} pages`);

    // Phase: analyzing
    this.store.update(id, { status: 'analyzing' });

    // Run all engines
    const [screenshots, axeResults] = await Promise.allSettled([
      this.crawler.captureScreenshots(url),
      this.crawler.runAccessibilityCheck(url),
    ]);

    const heuristicScores = evaluateHeuristics(pages);
    const uxLawScores = evaluateUXLaws(pages);
    const contentScore = evaluateContent(pages);
    const navigationScore = evaluateNavigation(pages);
    const siteStructure = buildSitemap(pages);

    const accessibilityScore =
      axeResults.status === 'fulfilled' && axeResults.value
        ? parseAxeResults(axeResults.value)
        : createFallbackAccessibilityScore(pages);

    const uxHealthScore = computeHealthScore(
      accessibilityScore,
      heuristicScores,
      uxLawScores,
      contentScore,
      navigationScore,
    );

    const executiveSummary = generateExecutiveSummary(url, uxHealthScore, pages.length);
    const keyFindings = generateKeyFindings(
      heuristicScores,
      accessibilityScore,
      contentScore,
      navigationScore,
    );
    const recommendations = generateRecommendations(
      heuristicScores,
      accessibilityScore,
      contentScore,
      navigationScore,
    );

    this.store.update(id, {
      status: 'complete',
      completedAt: new Date().toISOString(),
      pageCount: pages.length,
      uxHealthScore,
      heuristicScores,
      uxLawScores,
      accessibilityScore,
      contentScore,
      navigationScore,
      siteStructure,
      screenshots:
        screenshots.status === 'fulfilled' ? screenshots.value : undefined,
      executiveSummary,
      keyFindings,
      recommendations,
    });

    this.logger.log(`[${id}] Analysis complete — score: ${uxHealthScore.overall} (${uxHealthScore.grade})`);
  }

  exportJson(id: string): string {
    const scan = this.getScan(id);
    return JSON.stringify(scan, null, 2);
  }

  exportCsv(id: string): string {
    const scan = this.getScan(id);
    const rows = [
      ['Type', 'Name', 'Score', 'Severity', 'Finding', 'Recommendation'],
      ...(scan.heuristicScores ?? []).map((h) => [
        'Heuristic', h.name, String(h.score), h.severity, h.explanation, h.recommendation,
      ]),
      ...(scan.uxLawScores ?? []).map((l) => [
        'UX Law', l.name, String(l.score), '', l.finding, l.recommendation,
      ]),
      ...(scan.accessibilityScore?.issues ?? []).map((i) => [
        'Accessibility', i.description, '', i.severity, i.wcagCriteria, i.recommendation,
      ]),
    ];
    return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  }
}
