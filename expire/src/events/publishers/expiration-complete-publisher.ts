import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@anitix/shared';

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
