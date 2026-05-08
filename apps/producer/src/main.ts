import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ProducerModule } from './producer.module';
import { MetricsService } from './metrics.service';

async function bootstrap() {
  const app = await NestFactory.create(ProducerModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Producer API')
    .setDescription('Event publishing service')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.get(MetricsService).init();

  await app.listen(process.env.PRODUCER_PORT ?? 3001);
}
void bootstrap();
