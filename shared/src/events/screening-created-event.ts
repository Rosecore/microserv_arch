import { Subjects } from './subjects';

export interface ScreeningCreatedEvent {
  subject: Subjects.ScreeningCreated;
  data: {
    id: string;
    version: number;
    title: string;
    price: number;
    userId: string;
  };
}
