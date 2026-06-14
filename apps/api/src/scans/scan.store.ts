import { Injectable } from '@nestjs/common';
import type { ScanResult } from '@uxbeacon/shared-types';

// In-memory store for Phase 1 MVP — replace with Prisma + PostgreSQL in Phase 2
@Injectable()
export class ScanStore {
  private scans = new Map<string, ScanResult>();

  set(scan: ScanResult): void {
    this.scans.set(scan.id, scan);
  }

  get(id: string): ScanResult | undefined {
    return this.scans.get(id);
  }

  update(id: string, partial: Partial<ScanResult>): ScanResult | undefined {
    const existing = this.scans.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...partial };
    this.scans.set(id, updated);
    return updated;
  }

  // Cleanup scans older than 24 hours to prevent memory leaks
  cleanOld(): void {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (const [id, scan] of this.scans.entries()) {
      if (new Date(scan.startedAt).getTime() < cutoff) {
        this.scans.delete(id);
      }
    }
  }
}
