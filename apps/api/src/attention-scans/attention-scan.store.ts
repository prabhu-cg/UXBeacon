import { Injectable } from '@nestjs/common';
import type { AttentionScanResult } from '@uxbeacon/shared-types';

@Injectable()
export class AttentionScanStore {
  private scans = new Map<string, AttentionScanResult>();

  set(scan: AttentionScanResult): void {
    this.scans.set(scan.id, scan);
  }

  get(id: string): AttentionScanResult | undefined {
    return this.scans.get(id);
  }

  update(id: string, partial: Partial<AttentionScanResult>): AttentionScanResult | undefined {
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
