import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CompetitionModule } from './competition/competition.module';
import { ScheduleService } from './schedule/schedule.service';
import { RegistrationProcessor } from './worker/registration.processor';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({ isGlobal: true }), 
    
    // Setup Redis connection for BullMQ
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'redis',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    
    // Define the queue for registration/reminders
    BullModule.registerQueue({
      name: 'registration',
    }),

    // Setup the cron scheduler
    ScheduleModule.forRoot(),

    PrismaModule,
    AuthModule,
    CompetitionModule,
  ],
  controllers: [],
  providers: [
    // Register the cron service and the worker processor
    ScheduleService, 
    RegistrationProcessor
  ],
})
export class AppModule {}