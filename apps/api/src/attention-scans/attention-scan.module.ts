import { Module } from '@nestjs/common';
import { AttentionScanController } from './attention-scan.controller';
import { AttentionScanService } from './attention-scan.service';
import { AttentionScanStore } from './attention-scan.store';

@Module({
  controllers: [AttentionScanController],
  providers: [AttentionScanService, AttentionScanStore],
})
export class AttentionScanModule {}
