import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@anitix/shared';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Screening } from '../../../models/screening';

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a screening
  const screening = Screening.build({
    title: 'concert',
    price: 99,
    userId: 'asdf',
  });
  await screening.save();

  // Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'alskdfj',
    expiresAt: 'alskdjf',
    ticket: {
      id: screening.id,
      price: screening.price,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, screening, data, msg };
};

it('Айди пользователя, создавшего заказ, присваивается билету', async () => {
  const { listener, screening, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedScreening = await Screening.findById(screening.id);

  expect(updatedScreening!.orderId).toEqual(data.id);
});

it('Запрашивает сообщение', async () => {
  const { listener, screening, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('Пубикует событие обновления билета', async () => {
  const { listener, screening, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const screeningUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.id).toEqual(screeningUpdatedData.orderId);
});
