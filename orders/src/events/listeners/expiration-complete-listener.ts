import {
  Listener,
  Subjects,
  ExpirationCompleteEvent,
  OrderStatus,
} from '@anitix/shared';
import { Message, Stan } from 'node-nats-streaming';
import { Model } from 'mongoose';
import { queueGroupName } from './queue-group-name';
import { OrderDocument } from '../../orders/schemas/order.schema';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class ExpirationCompleteListener extends Listener<
  ExpirationCompleteEvent
> {
  queueGroupName = queueGroupName;
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

  constructor(client: Stan, private readonly orderModel: Model<OrderDocument>) {
    super(client);
  }

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await this.orderModel.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Cancelled,
    });
    await order.save();
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: (order as any).version,
      ticket: {
        id: (order.ticket as any).id,
      },
    });

    msg.ack();
  }
}
