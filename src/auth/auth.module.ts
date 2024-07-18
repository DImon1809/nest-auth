import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { UserService } from 'src/user/user.service';

import { options } from './config/jwt-module-async-options';

import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth-guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy, JwtAuthGuard],
  imports: [PassportModule, JwtModule.registerAsync(options())],
})
export class AuthModule {}
