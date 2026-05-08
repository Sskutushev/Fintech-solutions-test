import { NestFactory } from '@nestjs/core';
import { NotifierModule } from './notifier.module';

async function bootstrap() {
  const app = await NestFactory.create(NotifierModule);
  await app.listen(process.env.NOTIFIER_PORT ?? 3003);
}
void bootstrap();
