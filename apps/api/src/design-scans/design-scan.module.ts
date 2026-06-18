import { Module } from '@nestjs/common';
import { DesignScanController } from './design-scan.controller';
import { DesignScanService } from './design-scan.service';
import { DesignScanStore } from './design-scan.store';

@Module({
  controllers: [DesignScanController],
  providers: [DesignScanService, DesignScanStore],
})
export class DesignScanModule {}
