import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as pg from 'pg';

// Force node-postgres to interpret timestamp (without tz) as UTC, not local time.
// OID 1114 = timestamp without time zone
pg.types.setTypeParser(1114, (str: string) => new Date(str + '+00'));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    // origin: process.env.FRONTEND_URL,
    // credentials: true,
    origin: '*',
  });

  await app.listen(3000, '0.0.0.0')
}
bootstrap();
