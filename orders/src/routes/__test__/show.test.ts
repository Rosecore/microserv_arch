import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Screening } from '../../models/screening';

it('Демонстрирует заказы', async () => {
  // Create a screening
  const screening = Screening.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await screening.save();

  const user = global.signin();
  // make a request to build an order with this screening
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: screening.id })
    .expect(201);

  // make request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('Не демонстрирует заказы если направляется запрос к другому пользователю', async () => {
  // Create a screening
  const screening = Screening.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await screening.save();

  const user = global.signin();
  // make a request to build an order with this screening
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: screening.id })
    .expect(201);

  // make request to fetch the order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);
});
