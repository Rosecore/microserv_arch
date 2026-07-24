import { Message, Stan } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from '@anitix/shared';
import { Model } from 'mongoose';
import { queueGroupName } from './queue-group-name';
import { OrderDocument } from '../../payments/schemas/order.schema';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  constructor(client: Stan, private readonly orderModel: Model<OrderDocument>) {
    super(client);
  }

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = new this.orderModel({
      _id: data.id,
      version: data.version,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
    });
    await order.save();

    msg.ack();
  }
}
