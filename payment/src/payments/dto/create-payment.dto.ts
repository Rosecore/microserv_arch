import { IsNotEmpty } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  orderId: string;
}
