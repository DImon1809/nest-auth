import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';

import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';

import { ConfigModule } from '@nestjs/config';

import { JwtAuthGuard } from './auth/guards/jwt-auth-guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
