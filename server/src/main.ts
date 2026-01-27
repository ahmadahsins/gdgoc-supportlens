import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration
  const corsOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || [];
  app.enableCors({
    origin: corsOrigins.length > 0 && corsOrigins[0] !== '*' 
      ? corsOrigins 
      : true, // 'true' reflects the request origin (safer than '*' with credentials)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // swagger configuration
  const config = new DocumentBuilder()
    .setTitle('SupportLens API')
    .setDescription('AI-Powered Customer Support Platform API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'Firebase-JWT',
    )
    .addTag('Auth', 'Authentication & User Sync')
    .addTag('Tickets', 'Ticket Management & Operations')
    .addTag('AI', 'AI Features - Summarize & Generate Draft')
    .addTag('Analytics', 'Dashboard Statistics (Admin Only)')
    .addTag('Knowledge Base', 'SOP Document Management (Admin Only)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application running on port ${port}`);
  console.log(`Swagger docs available at /api-docs`);
}
bootstrap();