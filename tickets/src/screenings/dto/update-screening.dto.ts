import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UpdateScreeningDto {
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsNumber()
  @IsPositive({ message: 'Price must be provided and must be greater than 0' })
  price: number;
}
