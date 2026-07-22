import { Subjects } from './subjects';

export interface ScreeningUpdatedEvent {
  subject: Subjects.ScreeningUpdated;
  data: {
    id: string;
    version: number;
    title: string;
    price: number;
    userId: string;
    orderId?: string;
  };
}
