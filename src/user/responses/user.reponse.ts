import { Role, User } from '@prisma/client';

import { Exclude } from 'class-transformer';

export class UserResponse implements User {
  id: string;
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  createdAt: Date;

  roles: Role[];
  updatedAt: Date;

  constructor(user: User) {
    Object.assign(this, user);
  }
}
