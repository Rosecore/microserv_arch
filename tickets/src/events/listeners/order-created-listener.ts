import { Message, Stan } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@anitix/shared';
import { Model } from 'mongoose';
import { queueGroupName } from './queue-group-name';
import { ScreeningDocument } from '../../screenings/schemas/screening.schema';
import { ScreeningUpdatedPublisher } from '../publishers/screening-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  constructor(client: Stan, private readonly screeningModel: Model<ScreeningDocument>) {
    super(client);
  }

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Find the screening that the order is reserving
    const screening = await this.screeningModel.findById(data.ticket.id);

    // If no screening, throw error
    if (!screening) {
      throw new Error('Screening not found');
    }

    // Mark the screening as being reserved by setting its orderId property
    screening.set({ orderId: data.id });

    // Save the screening
    await screening.save();
    await new ScreeningUpdatedPublisher(this.client).publish({
      id: screening.id,
      price: screening.price,
      title: screening.title,
      userId: screening.userId,
      orderId: screening.orderId,
      version: (screening as any).version,
    });

    // ack the message
    msg.ack();
  }
}
