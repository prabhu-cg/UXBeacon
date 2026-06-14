import { Module } from '@nestjs/common';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';
import { ScanStore } from './scan.store';
import { CrawlerService } from '../engines/crawler.service';

@Module({
  controllers: [ScanController],
  providers: [ScanService, ScanStore, CrawlerService],
})
export class ScanModule {}
