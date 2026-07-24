import { Transform } from 'class-transformer';
import { IsEmail, Length } from 'class-validator';

export class SignupDto {
  @IsEmail({}, { message: 'Введите корректную почту' })
  email: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(6, 12, { message: 'Пароль должен быть от 6 до 12' })
  password: string;
}
