import { Publisher, OrderCreatedEvent, Subjects } from '@anitix/shared';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
