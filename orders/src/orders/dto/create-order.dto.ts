import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  // TODO(review): body field kept as ticketId to match the unchanged client contract; rename to screeningId in Phase 4 alongside the client
  @IsNotEmpty()
  @IsMongoId({ message: 'TicketId must be provided' })
  ticketId: string;
}
