import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Screening } from '../../models/screening';
import { natsWrapper } from '../../nats-wrapper';

it('Возвращает ошибку, если билет больше не существует', async () => {
  const ticketId = new mongoose.Types.ObjectId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404);
});

it('Возвращает ошибку, еси билет уже зарезервирован', async () => {
  const screening = Screening.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await screening.save();
  const order = Order.build({
    ticket: screening,
    userId: 'laskdflkajsdf',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: screening.id })
    .expect(400);
});

it('билет резеривруется при покупке', async () => {
  const screening = Screening.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await screening.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: screening.id })
    .expect(201);
});

it('Запускает событие создания заказа', async () => {
  const screening = Screening.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await screening.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: screening.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
