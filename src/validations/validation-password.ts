import {
  ValidationArguments,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';

import { RegisterDto } from 'src/auth/dto/register.dto';

@ValidatorConstraint({ name: 'IsValidPassword', async: false })
export class IsValidPassword implements ValidatorConstraintInterface {
  validate(
    repeatPassword: string,
    args: ValidationArguments,
  ): Promise<boolean> | boolean {
    const obj = args.object as RegisterDto;

    return obj.password === repeatPassword;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return 'Пароли не совпадают!';
  }
}
