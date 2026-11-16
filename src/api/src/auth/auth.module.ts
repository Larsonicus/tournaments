import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy, jwtSecret } from './jwt.strategy.js';
import { UsersRepository } from './users.repository.js';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({ secret: jwtSecret(), signOptions: { expiresIn: '1d' } }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, JwtStrategy],
  exports: [UsersRepository],
})
export class AuthModule {}
