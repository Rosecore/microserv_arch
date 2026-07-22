import request from 'supertest';
import { app } from '../../app';

const createScreening = () => {
  return request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title: 'asldkf',
    price: 20,
  });
};

it('can fetch a list of screenings', async () => {
  await createScreening();
  await createScreening();
  await createScreening();

  const response = await request(app).get('/api/tickets').send().expect(200);

  expect(response.body.length).toEqual(3);
});
