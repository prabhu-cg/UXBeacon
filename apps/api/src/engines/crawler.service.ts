import { Injectable, Logger } from '@nestjs/common';
import type { PageData } from '@uxbeacon/shared-types';

const MAX_PAGES = 25;
const TIMEOUT_MS = 30_000;

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);

  async crawl(startUrl: string): Promise<PageData[]> {
    // Lazy-import Playwright to avoid startup cost when not needed
    const { chromium } = await import('playwright');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent:
        'UXBeacon/1.0 (+https://uxbeacon.io/bot) Web accessibility and UX analysis bot',
      viewport: { width: 1280, height: 900 },
    });

    const visited = new Set<string>();
    const queue: string[] = [startUrl];
    const results: PageData[] = [];
    const origin = new URL(startUrl).origin;

    try {
      while (queue.length > 0 && results.length < MAX_PAGES) {
        const url = queue.shift()!;
        const normalized = this.normalizeUrl(url);
        if (visited.has(normalized)) continue;
        visited.add(normalized);

        const page = await context.newPage();
        try {
          this.logger.log(`Crawling: ${normalized}`);
          const startTime = Date.now();

          await page.goto(normalized, {
            waitUntil: 'domcontentloaded',
            timeout: TIMEOUT_MS,
          });

          const loadTimeMs = Date.now() - startTime;
          const data = await this.extractPageData(page, normalized, loadTimeMs);
          results.push(data);

          // Enqueue same-origin links
          for (const link of data.links) {
            try {
              const linkUrl = new URL(link.href, normalized);
              if (
                linkUrl.origin === origin &&
                !visited.has(this.normalizeUrl(linkUrl.href)) &&
                !link.href.match(/\.(pdf|zip|png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2)$/i)
              ) {
                queue.push(linkUrl.href);
              }
            } catch {
              // invalid URL — skip
            }
          }
        } catch (err) {
          this.logger.warn(`Failed to crawl ${normalized}: ${(err as Error).message}`);
        } finally {
          await page.close();
        }
      }
    } finally {
      await browser.close();
    }

    return results;
  }

  async captureScreenshots(
    url: string,
  ): Promise<{ desktop?: string; tablet?: string; mobile?: string }> {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    const screenshots: { desktop?: string; tablet?: string; mobile?: string } = {};

    const viewports = [
      { name: 'desktop' as const, width: 1440, height: 900 },
      { name: 'tablet' as const, width: 768, height: 1024 },
      { name: 'mobile' as const, width: 375, height: 812 },
    ];

    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
        await page.waitForTimeout(1000); // let animations settle
        const buffer = await page.screenshot({ type: 'jpeg', quality: 80, fullPage: false });
        // Store as base64 data URL for MVP (Phase 2 will use Supabase Storage)
        screenshots[vp.name] = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      } catch (err) {
        this.logger.warn(`Screenshot failed for ${vp.name}: ${(err as Error).message}`);
      } finally {
        await page.close();
      }
    }

    await browser.close();
    return screenshots;
  }

  async runAccessibilityCheck(url: string): Promise<unknown> {
    const { chromium } = await import('playwright');
    // We inject axe-core and run it in the browser context
    const axeSource = require('fs').readFileSync(
      require.resolve('axe-core/axe.min.js'),
      'utf-8',
    );

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
      await page.addScriptTag({ content: axeSource });
      const axeResults = await page.evaluate(() => {
        return new Promise((resolve) => {
          (window as unknown as { axe: { run: (cb: unknown) => void } }).axe.run(resolve);
        });
      });
      return axeResults;
    } finally {
      await page.close();
      await browser.close();
    }
  }

  private async extractPageData(
    page: import('playwright').Page,
    url: string,
    loadTimeMs: number,
  ): Promise<PageData> {
    return page.evaluate((pageUrl) => {
      const getText = (el: Element | null) => el?.textContent?.trim() ?? '';

      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((h) => ({
        level: parseInt(h.tagName[1]),
        text: getText(h),
      }));

      const links = Array.from(document.querySelectorAll('a[href]'))
        .slice(0, 200)
        .map((a) => {
          const href = (a as HTMLAnchorElement).href;
          return {
            href,
            text: getText(a),
            isExternal: new URL(href, location.href).origin !== location.origin,
          };
        })
        .filter((l) => l.href && !l.href.startsWith('javascript:'));

      const images = Array.from(document.querySelectorAll('img')).map((img) => ({
        src: img.src,
        alt: img.alt ?? '',
        hasAlt: img.hasAttribute('alt'),
      }));

      const forms = Array.from(document.querySelectorAll('form')).map((form) => ({
        action: form.action,
        method: form.method || 'get',
        fields: form.querySelectorAll('input,select,textarea').length,
      }));

      const buttons = Array.from(
        document.querySelectorAll('button, [role="button"], input[type="submit"], a.btn, a.button'),
      )
        .map((b) => getText(b))
        .filter(Boolean)
        .slice(0, 50);

      const navEls = document.querySelectorAll('nav a, [role="navigation"] a, header a');
      const navigationItems = Array.from(new Set(Array.from(navEls).map(getText).filter(Boolean))).slice(0, 30);

      const bodyText = document.body?.innerText ?? '';
      const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

      return {
        url: pageUrl,
        title: document.title,
        metaDescription:
          (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content ?? '',
        headings,
        links,
        images,
        forms,
        buttons,
        navigationItems,
        wordCount,
      };
    }, url).then((data) => ({ ...data, loadTimeMs }));
  }

  private normalizeUrl(url: string): string {
    try {
      const u = new URL(url);
      u.hash = '';
      u.search = '';
      return u.href.replace(/\/$/, '');
    } catch {
      return url;
    }
  }
}
