import mongoose from 'mongoose';
import request from 'supertest';
import { OrderStatus } from '@anitix/shared';

it('Возвращает ошибку, если оплачивается несуществующий зааказ', async () => {
  await request(global.app.getHttpServer())
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asldkfj',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('Возвращет ошибку, если производится оплата заказа не того пользователя', async () => {
  const order = new global.orderModel({
    _id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(global.app.getHttpServer())
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'asldkfj',
      orderId: order.id,
    })
    .expect(401);
});

it('Возвращает ошибку при попытке оплатить отмененный заказ', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = new global.orderModel({
    _id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(global.app.getHttpServer())
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      orderId: order.id,
      token: 'asdlkfj',
    })
    .expect(400);
});

/*it('returns a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = new global.orderModel({
    _id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(global.app.getHttpServer())
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await global.paymentModel.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });
  expect(payment).not.toBeNull();
});*/
