import { Message, Stan } from 'node-nats-streaming';
import { Subjects, Listener, ScreeningCreatedEvent } from '@anitix/shared';
import { Model } from 'mongoose';
import { ScreeningDocument } from '../../orders/schemas/screening.schema';
import { queueGroupName } from './queue-group-name';

export class ScreeningCreatedListener extends Listener<ScreeningCreatedEvent> {
  subject: Subjects.ScreeningCreated = Subjects.ScreeningCreated;
  queueGroupName = queueGroupName;

  constructor(client: Stan, private readonly screeningModel: Model<ScreeningDocument>) {
    super(client);
  }

  async onMessage(data: ScreeningCreatedEvent['data'], msg: Message) {
    const { id, title, price } = data;

    const screening = new this.screeningModel({
      _id: id,
      title,
      price,
    });
    await screening.save();

    msg.ack();
  }
}
