import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { ScreeningModel, Screening } from './schemas/screening.schema';

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Screening.name) private readonly screeningModel: ScreeningModel
  ) {}

  async create(dto: CreateOrderDto, userId: string) {
    // Find the screening the user is trying to order in the database
    const screening = await this.screeningModel.findById(dto.ticketId);
    if (!screening) {
      throw new NotFoundException();
    }

    // Make sure that this screening is not already reserved
    const isReserved = await screening.isReserved();
    if (isReserved) {
      throw new BadRequestException('Screening is already reserved');
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build the order and save it to the database
    const order = new this.orderModel({
      userId,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket: screening,
    });
    await order.save();

    // Publish an event saying that an order was created
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: (order as any).version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: screening.id,
        price: screening.price,
      },
    });

    return order;
  }

  async findByIdOrThrow(id: string, userId: string) {
    const order = await this.orderModel.findById(id).populate('ticket');

    if (!order) {
      throw new NotFoundException();
    }
    if (order.userId !== userId) {
      throw new UnauthorizedException({
        errors: [{ message: 'Вы не аворизованы на сайте' }],
      });
    }

    return order;
  }

  async findAllForUser(userId: string) {
    return this.orderModel.find({ userId }).populate('ticket');
  }

  async cancel(id: string, userId: string) {
    const order = await this.orderModel.findById(id).populate('ticket');

    if (!order) {
      throw new NotFoundException();
    }
    if (order.userId !== userId) {
      throw new UnauthorizedException({
        errors: [{ message: 'Вы не аворизованы на сайте' }],
      });
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // publishing an event saying this was cancelled!
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: (order as any).version,
      ticket: {
        id: (order.ticket as any).id,
      },
    });

    return order;
  }
}
