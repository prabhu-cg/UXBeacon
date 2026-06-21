import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { AttentionScanService } from './attention-scan.service';

const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

@Controller('api/attention-scans')
export class AttentionScanController {
  constructor(private readonly service: AttentionScanService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Only PNG, JPG, JPEG, and WEBP files are allowed'), false);
      },
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const { id, status } = this.service.initScan(file);
    return { scanId: id, status };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.getScan(id);
  }

  @Get(':id/export')
  export(@Param('id') id: string, @Query('format') format: string, @Res() res: Response) {
    if (format !== 'json') throw new BadRequestException('format must be json');
    const data = this.service.exportJson(id);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="uxbeacon-attention-${id.slice(0, 8)}.json"`);
    res.send(data);
  }
}
