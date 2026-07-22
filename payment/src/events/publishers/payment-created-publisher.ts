import { Subjects, Publisher, PaymentCreatedEvent } from '@anitix/shared';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
