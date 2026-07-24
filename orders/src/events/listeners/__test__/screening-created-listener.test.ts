import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { ScreeningCreatedEvent } from '@anitix/shared';
import { ScreeningCreatedListener } from '../screening-created-listener';
import { natsWrapper } from '../../../nats-wrapper';

const setup = async () => {
  // create an instance of the listener
  const listener = new ScreeningCreatedListener(natsWrapper.client, global.screeningModel);

  // create a fake data event
  const data: ScreeningCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('Билет создан', async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a screening was created!
  const screening = await global.screeningModel.findById(data.id);

  expect(screening).toBeDefined();
  expect(screening!.title).toEqual(data.title);
  expect(screening!.price).toEqual(data.price);
});

it('Запрашивает сообщение об успешном выполнении события', async () => {
  const { data, listener, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
