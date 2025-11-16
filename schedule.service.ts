import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('registration') private registrationQueue: Queue,
  ) {}

  // Runs every minute in development for easy testing
  // Use CronExpression.EVERY_DAY_AT_MIDNIGHT for production
  @Cron(CronExpression.EVERY_MINUTE)
  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCompetitionReminders() {
    this.logger.log('Running scheduled job: Competition Reminders Check');

    const now = new Date();
    // Look for competitions starting between 1 minute from now and 24 hours from now
    const oneMinuteFromNow = new Date(now.getTime() + 60 * 1000);
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingCompetitions = await this.prisma.competition.findMany({
      where: {
        startTime: {
          gt: oneMinuteFromNow,
          lte: twentyFourHoursFromNow,
        },
      },
      include: {
        registrations: {
          select: { userId: true },
        },
      },
    });

    if (upcomingCompetitions.length === 0) {
        this.logger.log('No competitions found starting soon.');
        return;
    }

    const jobBatch = [];
    for (const comp of upcomingCompetitions) {
      // Enqueue a notification job for every registered user
      comp.registrations.forEach(reg => {
        jobBatch.push({
          name: 'reminder:notify', // Job name for the worker
          data: { userId: reg.userId, competitionId: comp.id },
          opts: {
            // Reminders don't need extensive retries
            attempts: 3,
            removeOnComplete: true, 
          }
        });
      });
      this.logger.log(`Found ${comp.registrations.length} registrations for ${comp.title}`);
    }
    
    if (jobBatch.length > 0) {
        await this.registrationQueue.addBulk(jobBatch);
        this.logger.log(`Successfully enqueued ${jobBatch.length} reminder jobs.`);
    }
  }
}