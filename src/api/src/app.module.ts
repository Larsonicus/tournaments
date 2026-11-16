import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { DrizzleModule } from './db/drizzle.module.js';
import { HealthController } from './health/health.controller.js';

@Module({
  imports: [DrizzleModule, AuthModule],
  controllers: [HealthController],
})
export class AppModule {}
