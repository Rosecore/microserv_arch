import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateScreeningDto {
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsNumber()
  @IsPositive({ message: 'Price must be greater than 0' })
  price: number;
}
