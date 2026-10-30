import { Module } from '@nestjs/common';
import { DrizzleModule } from './db/drizzle.module.js';
import { HealthController } from './health/health.controller.js';

@Module({
  imports: [DrizzleModule],
  controllers: [HealthController],
})
export class AppModule {}
