import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SigninDto {
  @IsEmail({}, { message: 'Нужна почта' })
  email: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Нужен пароль' })
  password: string;
}
