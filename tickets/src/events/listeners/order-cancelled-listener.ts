import { Listener, OrderCancelledEvent, Subjects } from '@anitix/shared';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Screening } from '../../models/screening';
import { ScreeningUpdatedPublisher } from '../publishers/screening-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const screening = await Screening.findById(data.ticket.id);

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
      version: screening.version,
    });

    msg.ack();
  }
}
