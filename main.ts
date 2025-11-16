import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable global validation using class-validator
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, // Strips non-whitelisted properties
    transform: true, // Automatically transform payloads to DTO instances
  }));
  
  // Set global API prefix
  app.setGlobalPrefix('api');

  await app.listen(3000);
}
bootstrap();