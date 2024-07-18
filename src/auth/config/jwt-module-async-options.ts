import { JwtModuleAsyncOptions, JwtModuleOptions } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config';

const jwtModuelOptions = (config: ConfigService): JwtModuleOptions => ({
  secret: config.get('JWT_SECRET'),
  signOptions: {
    expiresIn: config.get('JWT_EXPIRE', '5m'),
  },
});

export const options = (): JwtModuleAsyncOptions => ({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => jwtModuelOptions(config),
});
