import { Listener, OrderCancelledEvent, Subjects } from '@anitix/shared';
import { Message, Stan } from 'node-nats-streaming';
import { Model } from 'mongoose';
import { queueGroupName } from './queue-group-name';
import { ScreeningDocument } from '../../screenings/schemas/screening.schema';
import { ScreeningUpdatedPublisher } from '../publishers/screening-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  constructor(client: Stan, private readonly screeningModel: Model<ScreeningDocument>) {
    super(client);
  }

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const screening = await this.screeningModel.findById(data.ticket.id);

    if (!screening) {
      throw new Error('Screening not found');
    }

    screening.set({ orderId: undefined });
    await screening.save();
    await new ScreeningUpdatedPublisher(this.client).publish({
      id: screening.id,
      orderId: screening.orderId,
      userId: screening.userId,
      price: screening.price,
      title: screening.title,
      version: (screening as any).version,
    });

    msg.ack();
  }
}
