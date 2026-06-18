import { Injectable } from '@nestjs/common';
import type { DesignScanResult } from '@uxbeacon/shared-types';

@Injectable()
export class DesignScanStore {
  private scans = new Map<string, DesignScanResult>();

  set(scan: DesignScanResult): void {
    this.scans.set(scan.id, scan);
  }

  get(id: string): DesignScanResult | undefined {
    return this.scans.get(id);
  }

  update(id: string, partial: Partial<DesignScanResult>): DesignScanResult | undefined {
    const existing = this.scans.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...partial };
    this.scans.set(id, updated);
    return updated;
  }

  cleanOld(): void {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    for (const [id, scan] of this.scans.entries()) {
      if (new Date(scan.startedAt).getTime() < cutoff) this.scans.delete(id);
    }
  }
}
