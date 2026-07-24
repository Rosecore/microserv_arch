import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';
import { stripe } from '../stripe';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { Payment, PaymentDocument } from './schemas/payment.schema';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>
  ) {}

  async create(dto: CreatePaymentDto, userId: string) {
    const order = await this.orderModel.findById(dto.orderId);

    if (!order) {
      throw new NotFoundException();
    }
    if (order.userId !== userId) {
      throw new UnauthorizedException({
        errors: [{ message: 'Вы не аворизованы на сайте' }],
      });
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestException('Cannot pay for an cancelled order');
    }

    // TODO(review): stripe.charges.create is legacy (still supported in stripe@14) — migrating to
    // PaymentIntents requires a coordinated client-side change (Phase 4 replaces react-stripe-checkout).
    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: dto.token,
    });
    const payment = new this.paymentModel({
      orderId: dto.orderId,
      stripeId: charge.id,
    });
    await payment.save();

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    return { id: payment.id };
  }
}
