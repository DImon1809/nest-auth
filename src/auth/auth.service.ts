import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { Tokens } from 'src/interfaces';

import { UserService } from 'src/user/user.service';

import { compareSync } from 'bcrypt';

import { User, Token } from '@prisma/client';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

import { v4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.userService.findOne(dto.email).catch((err) => {
      this.logger.error(err);

      return null;
    });

    if (user) throw new ConflictException('Пользователь уже зарегистрирован!');

    return this.userService.save(dto).catch((err) => {
      this.logger.error(err);

      return null;
    });
  }
  async login(dto: LoginDto, agent: string): Promise<Tokens> {
    const user: Partial<User> = await this.userService
      .findOne(dto.email)
      .catch((err) => {
        this.logger.error(err);

        return null;
      });

    if (!user || !compareSync(dto.password, user.password))
      throw new UnauthorizedException('Неверный логин или пароль!');

    return this.generateTokens(user, agent);
  }

  private async getRefreshToken(userId: string, agent: string): Promise<Token> {
    const token = await this.prismaService.token.findFirst({
      where: {
        userId,
        userAgent: agent,
      },
    });

    return this.prismaService.token.upsert({
      where: {
        token: token?.token ?? '',
      },

      update: { token: v4(), exp: add(new Date(), { months: 1 }) },

      create: {
        token: v4(),
        exp: add(new Date(), { months: 1 }),
        userId,
        userAgent: agent,
      },
    });
  }

  public async refreshTokens(refreshToken: string, agent: string) {
    const token = await this.prismaService.token.findUnique({
      where: { token: refreshToken },
    });

    if (!token) throw new UnauthorizedException('Не существует токена!');

    await this.prismaService.token.delete({
      where: {
        token: refreshToken,
      },
    });

    if (new Date(token.exp) < new Date())
      throw new UnauthorizedException('Токен протух!');

    const user = await this.userService.findOne(token.userId);

    return this.generateTokens(user, agent);
  }

  public deleteRefreshToken(token: string) {
    return this.prismaService.token.delete({
      where: { token },
    });
  }

  private async generateTokens(
    user: Partial<User>,
    agent: string,
  ): Promise<Tokens> {
    const accessToken = this.jwtService.sign({
      id: user.id,
      email: user.email,
      roles: user.roles,
    });

    const refreshToken = await this.getRefreshToken(user.id, agent);

    return { accessToken, refreshToken };
  }
}
