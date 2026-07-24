import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import cookieSession from 'cookie-session';
import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose, { Connection, Model } from 'mongoose';
import { AppModule } from '../app.module';
import { AllExceptionsFilter } from '../common/filters/all-exceptions.filter';
import { Order, OrderDocument } from '../payments/schemas/order.schema';
import { Payment, PaymentDocument } from '../payments/schemas/payment.schema';

declare global {
  // eslint-disable-next-line no-var
  var signin: (id?: string) => string[];
  // eslint-disable-next-line no-var
  var app: NestExpressApplication;
  // eslint-disable-next-line no-var
  var orderModel: Model<OrderDocument>;
  // eslint-disable-next-line no-var
  var paymentModel: Model<PaymentDocument>;
}

jest.mock('../nats-wrapper');
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
  global.orderModel = moduleRef.get<Model<OrderDocument>>(getModelToken(Order.name));
  global.paymentModel = moduleRef.get<Model<PaymentDocument>>(getModelToken(Payment.name));

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
  jest.clearAllMocks();
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

global.signin = (id?: string) => {
  // Build a JWT payload.  { id, email }
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session Object. { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string thats the cookie with the encoded data
  return [`express:sess=${base64}`];
};
