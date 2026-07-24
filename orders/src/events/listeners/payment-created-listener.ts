import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
} from '@anitix/shared';
import { Message, Stan } from 'node-nats-streaming';
import { Model } from 'mongoose';
import { queueGroupName } from './queue-group-name';
import { OrderDocument } from '../../orders/schemas/order.schema';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  constructor(client: Stan, private readonly orderModel: Model<OrderDocument>) {
    super(client);
  }

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await this.orderModel.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();

    msg.ack();
  }
}
