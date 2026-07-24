import { Message, Stan } from 'node-nats-streaming';
import { Subjects, Listener, ScreeningUpdatedEvent } from '@anitix/shared';
import { ScreeningModel } from '../../orders/schemas/screening.schema';
import { queueGroupName } from './queue-group-name';

export class ScreeningUpdatedListener extends Listener<ScreeningUpdatedEvent> {
  subject: Subjects.ScreeningUpdated = Subjects.ScreeningUpdated;
  queueGroupName = queueGroupName;

  constructor(client: Stan, private readonly screeningModel: ScreeningModel) {
    super(client);
  }

  async onMessage(data: ScreeningUpdatedEvent['data'], msg: Message) {
    const screening = await this.screeningModel.findByEvent(data);

    if (!screening) {
      throw new Error('Screening not found');
    }

    const { title, price } = data;
    screening.set({ title, price });
    await screening.save();

    msg.ack();
  }
}
