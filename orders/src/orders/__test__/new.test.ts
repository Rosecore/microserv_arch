import mongoose from 'mongoose';
import request from 'supertest';
import { OrderStatus } from '../schemas/order.schema';
import { natsWrapper } from '../../nats-wrapper';

it('Возвращает ошибку, если билет больше не существует', async () => {
  const ticketId = new mongoose.Types.ObjectId();

  await request(global.app.getHttpServer())
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404);
});

it('Возвращает ошибку, еси билет уже зарезервирован', async () => {
  const screening = new global.screeningModel({
    _id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await screening.save();
  const order = new global.orderModel({
    ticket: screening,
    userId: 'laskdflkajsdf',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(global.app.getHttpServer())
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: screening.id })
    .expect(400);
});

it('билет резеривруется при покупке', async () => {
  const screening = new global.screeningModel({
    _id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await screening.save();

  await request(global.app.getHttpServer())
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: screening.id })
    .expect(201);
});

it('Запускает событие создания заказа', async () => {
  const screening = new global.screeningModel({
    _id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await screening.save();

  await request(global.app.getHttpServer())
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: screening.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
