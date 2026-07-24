import mongoose from 'mongoose';
import request from 'supertest';

it('Демонстрирует заказы', async () => {
  // Create a screening
  const screening = new global.screeningModel({
    _id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await screening.save();

  const user = global.signin();
  // make a request to build an order with this screening
  const { body: order } = await request(global.app.getHttpServer())
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: screening.id })
    .expect(201);

  // make request to fetch the order
  const { body: fetchedOrder } = await request(global.app.getHttpServer())
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('Не демонстрирует заказы если направляется запрос к другому пользователю', async () => {
  // Create a screening
  const screening = new global.screeningModel({
    _id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await screening.save();

  const user = global.signin();
  // make a request to build an order with this screening
  const { body: order } = await request(global.app.getHttpServer())
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: screening.id })
    .expect(201);

  // make request to fetch the order
  await request(global.app.getHttpServer())
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);
});
