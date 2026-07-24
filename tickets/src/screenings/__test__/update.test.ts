import request from 'supertest';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(global.app.getHttpServer())
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'aslkdfj',
      price: 20,
    })
    .expect(404);
});

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(global.app.getHttpServer())
    .put(`/api/tickets/${id}`)
    .send({
      title: 'aslkdfj',
      price: 20,
    })
    .expect(401);
});

it('returns a 401 if the user does not own the screening', async () => {
  const response = await request(global.app.getHttpServer())
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'asldkfj',
      price: 20,
    });

  await request(global.app.getHttpServer())
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'alskdjflskjdf',
      price: 1000,
    })
    .expect(401);
});

it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signin();

  const response = await request(global.app.getHttpServer())
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'asldkfj',
      price: 20,
    });

  await request(global.app.getHttpServer())
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20,
    })
    .expect(400);

  await request(global.app.getHttpServer())
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'alskdfjj',
      price: -10,
    })
    .expect(400);
});

it('updates the screening provided valid inputs', async () => {
  const cookie = global.signin();

  const response = await request(global.app.getHttpServer())
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'asldkfj',
      price: 20,
    });

  await request(global.app.getHttpServer())
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 100,
    })
    .expect(200);

  const screeningResponse = await request(global.app.getHttpServer())
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(screeningResponse.body.title).toEqual('new title');
  expect(screeningResponse.body.price).toEqual(100);
});

it('publishes an event', async () => {
  const cookie = global.signin();

  const response = await request(global.app.getHttpServer())
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'asldkfj',
      price: 20,
    });

  await request(global.app.getHttpServer())
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 100,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the screening is reserved', async () => {
  const cookie = global.signin();

  const response = await request(global.app.getHttpServer())
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'asldkfj',
      price: 20,
    });

  const screening = await global.screeningModel.findById(response.body.id);
  screening!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await screening!.save();

  await request(global.app.getHttpServer())
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'new title',
      price: 100,
    })
    .expect(400);
});
