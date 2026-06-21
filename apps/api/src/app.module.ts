import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScanModule } from './scans/scan.module';
import { DesignScanModule } from './design-scans/design-scan.module';
import { AttentionScanModule } from './attention-scans/attention-scan.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 86400000,
        limit: 3,
      },
    ]),
    ScanModule,
    DesignScanModule,
    AttentionScanModule,
  ],
})
export class AppModule {}
