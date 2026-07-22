import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ScreeningCreatedEvent } from '@anitix/shared';
import { Screening } from '../../models/screening';
import { queueGroupName } from './queue-group-name';

export class ScreeningCreatedListener extends Listener<ScreeningCreatedEvent> {
  subject: Subjects.ScreeningCreated = Subjects.ScreeningCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: ScreeningCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;

    const screening = Screening.build({
      id,
      title,
      price,
    });
    await screening.save();

    msg.ack();
  }
}
