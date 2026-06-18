import { createWorker } from 'tesseract.js';

export interface OCRWord {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  isBold: boolean;
  height: number;
}

export interface OCRLine {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  words: OCRWord[];
}

export interface OCRData {
  words: OCRWord[];
  lines: OCRLine[];
  text: string;
  imageWidth: number;
  imageHeight: number;
}

export async function runOCR(buffer: Buffer, width: number, height: number): Promise<OCRData> {
  const worker = await createWorker('eng', 1, { logger: () => {} });
  try {
    // Cast to any to avoid Playwright's Page type shadowing Tesseract's Page type
    const { data } = (await worker.recognize(buffer)) as { data: any };

    const words: OCRWord[] = ((data.words ?? []) as any[])
      .filter((w: any) => w.confidence > 30 && w.text?.trim().length > 0)
      .map((w: any) => ({
        text: w.text.trim(),
        confidence: w.confidence,
        bbox: w.bbox,
        isBold: w.font?.is_bold ?? false,
        height: (w.bbox?.y1 ?? 0) - (w.bbox?.y0 ?? 0),
      }));

    const lines: OCRLine[] = ((data.lines ?? []) as any[])
      .filter((l: any) => l.text?.trim().length > 0)
      .map((l: any) => ({
        text: l.text.trim(),
        bbox: l.bbox,
        words: ((l.words ?? []) as any[])
          .filter((w: any) => w.confidence > 30 && w.text?.trim().length > 0)
          .map((w: any) => ({
            text: w.text.trim(),
            confidence: w.confidence,
            bbox: w.bbox,
            isBold: w.font?.is_bold ?? false,
            height: (w.bbox?.y1 ?? 0) - (w.bbox?.y0 ?? 0),
          })),
      }));

    return { words, lines, text: data.text ?? '', imageWidth: width, imageHeight: height };
  } finally {
    await worker.terminate();
  }
}
