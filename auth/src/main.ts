import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieSession from 'cookie-session';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', true);
  app.use(
    cookieSession({
      signed: false,
      secure: process.env.NODE_ENV !== 'test',
    })
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors) => {
        const formatted = errors.map((err) => ({
          message: Object.values(err.constraints || {})[0],
          field: err.property,
        }));
        return new BadRequestException({ errors: formatted });
      },
    })
  );

  await app.listen(3000);
  console.log('Listening on port 3000!!!!!!!!');
}

bootstrap();
