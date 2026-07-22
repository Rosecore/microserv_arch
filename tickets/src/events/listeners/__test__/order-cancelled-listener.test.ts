import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent } from '@anitix/shared';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Screening } from '../../../models/screening';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = mongoose.Types.ObjectId().toHexString();
  const screening = Screening.build({
    title: 'concert',
    price: 20,
    userId: 'asdf',
  });
  screening.set({ orderId });
  await screening.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: screening.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, screening, orderId, listener };
};

it('Статус билета обновляется, публикуется событие и запрашивается сообщение', async () => {
  const { msg, data, screening, orderId, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedScreening = await Screening.findById(screening.id);
  expect(updatedScreening!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
