/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({ credentials: true, origin: ["https://uduscare.onrender.com/"] });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT || 3333);
}
bootstrap();
