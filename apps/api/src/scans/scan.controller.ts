import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ScanService } from './scan.service';
import { CreateScanDto } from './scan.dto';

@Controller('api/scans')
export class ScanController {
  constructor(private readonly scanService: ScanService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  create(@Body() dto: CreateScanDto) {
    const url = this.normalizeUrl(dto.url);
    const { id, status } = this.scanService.initScan(url);
    return { scanId: id, status };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scanService.getScan(id);
  }

  @Get(':id/export')
  export(
    @Param('id') id: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    if (!['json', 'csv'].includes(format)) {
      throw new BadRequestException('format must be json or csv');
    }

    if (format === 'json') {
      const data = this.scanService.exportJson(id);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="uxbeacon-${id.slice(0, 8)}.json"`);
      res.send(data);
    } else {
      const data = this.scanService.exportCsv(id);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="uxbeacon-${id.slice(0, 8)}.csv"`);
      res.send(data);
    }
  }

  private normalizeUrl(url: string): string {
    if (!/^https?:\/\//i.test(url)) return `https://${url}`;
    return url;
  }
}
