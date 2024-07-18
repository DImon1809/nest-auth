import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { PrismaService } from 'src/prisma/prisma.service';

import { JwtPayload } from 'src/interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger();

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prismaService.user
      .findUnique({
        where: {
          id: payload.id,
        },
      })
      .catch((err) => {
        this.logger.error(err);

        return null;
      });

    if (!user) throw new UnauthorizedException('Вы не авторизованы!');

    return payload;
  }
}
