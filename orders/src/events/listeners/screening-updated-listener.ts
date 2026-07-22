import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ScreeningUpdatedEvent } from '@anitix/shared';
import { Screening } from '../../models/screening';
import { queueGroupName } from './queue-group-name';

export class ScreeningUpdatedListener extends Listener<ScreeningUpdatedEvent> {
  subject: Subjects.ScreeningUpdated = Subjects.ScreeningUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: ScreeningUpdatedEvent['data'], msg: Message) {
    const screening = await Screening.findByEvent(data);

    if (!screening) {
      throw new Error('Screening not found');
    }

    const { title, price } = data;
    screening.set({ title, price });
    await screening.save();

    msg.ack();
  }
}
