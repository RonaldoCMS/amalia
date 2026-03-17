import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as path from 'path';
import * as fs from 'fs';
import * as express from 'express';
import * as pg from 'pg';

// Force node-postgres to interpret timestamp (without tz) as UTC, not local time.
// OID 1114 = timestamp without time zone
pg.types.setTypeParser(1114, (str: string) => new Date(str + '+00'));

async function bootstrap() {
  const uploadDir = path.join(process.cwd(), 'uploads', 'profile-photos');
  fs.mkdirSync(uploadDir, { recursive: true });

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Serve uploaded files as static assets
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
