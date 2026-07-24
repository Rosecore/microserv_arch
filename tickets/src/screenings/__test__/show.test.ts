import request from 'supertest';
import mongoose from 'mongoose';

it('returns a 404 if the screening is not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(global.app.getHttpServer()).get(`/api/tickets/${id}`).send().expect(404);
});

it('returns the screening if the screening is found', async () => {
  const title = 'concert';
  const price = 20;

  const response = await request(global.app.getHttpServer())
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const screeningResponse = await request(global.app.getHttpServer())
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(screeningResponse.body.title).toEqual(title);
  expect(screeningResponse.body.price).toEqual(price);
});
