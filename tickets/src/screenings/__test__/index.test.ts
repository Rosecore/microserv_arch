import request from 'supertest';

const createScreening = () => {
  return request(global.app.getHttpServer())
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'asldkf',
      price: 20,
    });
};

it('can fetch a list of screenings', async () => {
  await createScreening();
  await createScreening();
  await createScreening();

  const response = await request(global.app.getHttpServer()).get('/api/tickets').send().expect(200);

  expect(response.body.length).toEqual(3);
});
