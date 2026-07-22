import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Screening } from '../../models/screening';

const buildScreening = async () => {
  const screening = Screening.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await screening.save();

  return screening;
};

it('Все заказы пользователя находятся', async () => {
  // Create three screenings
  const screeningOne = await buildScreening();
  const screeningTwo = await buildScreening();
  const screeningThree = await buildScreening();

  const userOne = global.signin();
  const userTwo = global.signin();
  // Create one order as User #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: screeningOne.id })
    .expect(201);

  // Create two orders as User #2
  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: screeningTwo.id })
    .expect(201);
  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: screeningThree.id })
    .expect(201);

  // Make request to get orders for User #2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200);

  // Make sure we only got the orders for User #2
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(screeningTwo.id);
  expect(response.body[1].ticket.id).toEqual(screeningThree.id);
});
