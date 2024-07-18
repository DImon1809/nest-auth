import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { Tokens } from 'src/interfaces';

import { ConfigService } from '@nestjs/config';

import { Response } from 'express';

import { Cookie } from 'src/validations/cookies.decorator';
import { UserAgent } from 'src/validations/user-agent.decorator';

import { Public } from 'src/validations/public.decorator';

const REFRESH_TOKEN = 'refreshtoken';

import { UserController } from 'src/user/user.controller';

@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);

    if (!user)
      throw new BadRequestException(
        `Невозможно создать пользователя с данными ${JSON.stringify(dto)}`,
      );

    return new UserController(user);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @UserAgent() agent: string,
    @Res() res: Response,
  ) {
    const tokens = await this.authService.login(dto, agent);

    if (!tokens)
      throw new BadRequestException(
        `Невозможно войти с данными ${JSON.stringify(dto)}`,
      );

    this.setRefreshTokenToCokies(tokens, res);
  }

  @Get('logout')
  async logout(
    @Cookie(REFRESH_TOKEN) refreshTokens: string,
    @Res() res: Response,
  ) {
    if (!refreshTokens) return res.sendStatus(HttpStatus.OK);

    await this.authService.deleteRefreshToken(refreshTokens);

    res.cookie(REFRESH_TOKEN, '', {
      httpOnly: true,
      secure: true,
      expires: new Date(),
    });

    return res.sendStatus(HttpStatus.OK);
  }

  @Get('refresh-tokens')
  async refreshTokens(
    @Cookie(REFRESH_TOKEN) refreshTokens: string,
    @UserAgent() agent: string,
    @Res() res: Response,
  ) {
    if (!refreshTokens) throw new UnauthorizedException('Нет токена!');

    const tokens = await this.authService.refreshTokens(refreshTokens, agent);

    if (!tokens)
      throw new UnauthorizedException('Не получается сгенерировать токены!');

    return this.setRefreshTokenToCokies(tokens, res);
  }

  private setRefreshTokenToCokies(tokens: Tokens, res: Response) {
    if (!tokens) throw new UnauthorizedException('Нет токенов!');

    res.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(tokens.refreshToken.exp),
      secure:
        this.configService.get('NODE_ENV', 'development') === 'production',

      path: '/',
    });

    return res
      .status(HttpStatus.ACCEPTED)
      .json({ accessToken: tokens.accessToken });
  }
}
