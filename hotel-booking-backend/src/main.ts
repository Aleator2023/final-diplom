import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const corsOptions: CorsOptions = {
    origin: '*', // Разрешить все источники (небезопасно для продакшена)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Разрешенные методы
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };

  app.enableCors(corsOptions);

  // Статический доступ к папке для загруженных изображений
  app.useStaticAssets(join(__dirname, 'uploads'));

  await app.listen(3000);
}
bootstrap();
