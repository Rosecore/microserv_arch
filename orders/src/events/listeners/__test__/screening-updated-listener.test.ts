import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { ScreeningUpdatedEvent } from '@anitix/shared';
import { ScreeningUpdatedListener } from '../screening-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';

const setup = async () => {
  // Create a listener
  const listener = new ScreeningUpdatedListener(natsWrapper.client, global.screeningModel);

  // Create and save a screening
  const screening = new global.screeningModel({
    _id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await screening.save();

  // Create a fake data object
  const data: ScreeningUpdatedEvent['data'] = {
    id: screening.id,
    version: (screening as any).version + 1,
    title: 'new concert',
    price: 999,
    userId: 'ablskdjf',
  };

  // Create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // return all of this stuff
  return { msg, data, screening, listener };
};

it('билет найден и обновлен', async () => {
  const { msg, data, screening, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedScreening = await global.screeningModel.findById(screening.id);

  expect(updatedScreening!.title).toEqual(data.title);
  expect(updatedScreening!.price).toEqual(data.price);
  expect((updatedScreening as any)!.version).toEqual(data.version);
});

it('Запрашивает сообщение об успешном выполнении события', async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('Не запрашивает сообщение об успешном выполнении события, если событие уже просрочено', async () => {
  const { msg, data, listener, screening } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
