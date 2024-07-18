import { IsEmail, IsString, MinLength, Validate } from 'class-validator';

import { IsValidPassword } from 'src/validations/validation-password';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @Validate(IsValidPassword)
  password: string;
}
