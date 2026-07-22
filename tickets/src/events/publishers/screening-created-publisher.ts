import { Publisher, Subjects, ScreeningCreatedEvent } from '@anitix/shared';

export class ScreeningCreatedPublisher extends Publisher<ScreeningCreatedEvent> {
  subject: Subjects.ScreeningCreated = Subjects.ScreeningCreated;
}
