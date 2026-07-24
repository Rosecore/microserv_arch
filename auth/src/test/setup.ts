import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import cookieSession from 'cookie-session';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../app.module';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';

declare global {
  // eslint-disable-next-line no-var
  var signin: () => Promise<string[]>;
  // eslint-disable-next-line no-var
  var app: NestExpressApplication;
}

jest.setTimeout(30000); // TODO(review): mongodb-memory-server startup exceeds Jest 29's 5s default hook timeout

let mongo: any;
let connection: Connection;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  process.env.MONGO_URI = mongoUri;

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  connection = moduleRef.get<Connection>(getConnectionToken());
  global.app = moduleRef.createNestApplication<NestExpressApplication>();
  global.app.set('trust proxy', true);
  global.app.use(
    cookieSession({
      signed: false,
      secure: false,
    })
  );
  global.app.useGlobalFilters(new AllExceptionsFilter());
  global.app.useGlobalPipes(
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
  await global.app.init();
});

beforeEach(async () => {
  const collections = await connection.db!.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await global.app.close();
  await mongo.stop();
  await connection.close();
});

global.signin = async () => {
  const email = 'test@test.com';
  const password = 'password';

  const response = await request(global.app.getHttpServer())
    .post('/api/users/signup')
    .send({
      email,
      password
    })
    .expect(201);

  const cookie = response.get('Set-Cookie');

  return cookie!;
};
