import {
  OrderCancelledEvent,
  Subjects,
  Listener,
  OrderStatus,
} from '@anitix/shared';
import { Message, Stan } from 'node-nats-streaming';
import { Model } from 'mongoose';
import { queueGroupName } from './queue-group-name';
import { OrderDocument } from '../../payments/schemas/order.schema';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  constructor(client: Stan, private readonly orderModel: Model<OrderDocument>) {
    super(client);
  }

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await this.orderModel.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
