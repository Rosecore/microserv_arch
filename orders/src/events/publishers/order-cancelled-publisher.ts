import { Subjects, Publisher, OrderCancelledEvent } from '@anitix/shared';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
