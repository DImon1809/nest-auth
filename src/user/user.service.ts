import { Injectable, ForbiddenException } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { hashSync, genSaltSync } from 'bcrypt';

import { User } from '@prisma/client';

import { JwtPayload } from 'src/interfaces';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  save(user: Partial<User>) {
    const hashedPassword = this.hashPassword(user.password);

    return this.prismaService.user.create({
      data: {
        email: user.email,
        password: hashedPassword,
        roles: ['USER'],
      },
    });
  }

  findOne(idOrEmail: string) {
    return this.prismaService.user.findFirst({
      where: {
        OR: [{ id: idOrEmail }, { email: idOrEmail }],
      },
    });
  }

  delete(id: string, user: JwtPayload) {
    if (user.id !== id && !user.roles.includes('ADMIN'))
      throw new ForbiddenException('Вам нельзя удалять пользователей!');

    return this.prismaService.user.delete({
      where: { id },
      select: { id: true },
    });
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }
}
