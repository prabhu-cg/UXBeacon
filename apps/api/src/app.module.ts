import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScanModule } from './scans/scan.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 86400000, // 24 hours in ms
        limit: 3, // 3 scans per day for guests
      },
    ]),
    ScanModule,
  ],
})
export class AppModule {}
