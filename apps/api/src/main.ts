import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'warn', 'error'] });

  app.enableCors({
    origin: (origin, callback) => {
      const allowed = process.env.FRONTEND_URL;
      if (
        !origin ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^https:\/\/[\w-]+\.vercel\.app$/.test(origin) ||
        origin === allowed
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`UXBeacon API running on http://localhost:${port}`);
}
bootstrap();
