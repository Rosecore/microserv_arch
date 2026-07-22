import { Publisher, Subjects, ScreeningUpdatedEvent } from '@anitix/shared';

export class ScreeningUpdatedPublisher extends Publisher<ScreeningUpdatedEvent> {
  subject: Subjects.ScreeningUpdated = Subjects.ScreeningUpdated;
}
