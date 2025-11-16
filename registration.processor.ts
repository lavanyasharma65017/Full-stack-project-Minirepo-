import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

interface JobPayload {
  registrationId?: string;
  userId: string;
  competitionId: string;
}

@Processor('registration') // The queue name
export class RegistrationProcessor extends WorkerHost {
  private readonly logger = new Logger(RegistrationProcessor.name);

  constructor(private prisma: PrismaService) {
    super();
  }

  // Handles confirmation jobs after successful registration
  async processConfirmationJob(job: Job<JobPayload & { registrationId: string }>) {
    const { registrationId } = job.data;
    this.logger.log(`Processing confirmation for Registration ID: ${registrationId}`);

    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: { competition: true, user: true },
    });

    if (!registration || registration.isConfirmed) {
      this.logger.warn(`Registration ${registrationId} not found or already confirmed. Skipping.`);
      return;
    }
    
    // Simulate sending confirmation: Persist to MailBox
    const subject = `Confirmation: You are registered for ${registration.competition.title}`;
    const body = `Hi ${registration.user.name},\n\nYour spot is secured! The event starts on ${registration.competition.startTime.toDateString()}.`;

    await this.prisma.mailBox.create({
        data: {
            userId: registration.userId,
            subject: subject,
            body: body,
        },
    });

    // Mark registration as confirmed
    await this.prisma.registration.update({
        where: { id: registrationId },
        data: { isConfirmed: true },
    });
    this.logger.log(`Confirmation simulated and logged for user ${registration.userId}.`);
  }
  
  // Handles reminder jobs initiated by the Cron scheduler
  async processReminderJob(job: Job<JobPayload>) {
    const { userId, competitionId } = job.data;
    this.logger.log(`Processing reminder for user ${userId} and competition ${competitionId}`);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const competition = await this.prisma.competition.findUnique({ where: { id: competitionId } });

    if (!user || !competition) return;

    // Simulate sending reminder: Persist to MailBox
    const subject = `REMINDER: Your competition ${competition.title} starts soon!`;
    const body = `Hi ${user.name},\n\nThe competition **${competition.title}** is starting in the next 24 hours. Be ready!`;

    await this.prisma.mailBox.create({
        data: {
            userId: user.id,
            subject: subject,
            body: body,
        },
    });
    this.logger.log(`Reminder simulated and logged for user ${userId}.`);
  }
  
  // Main process method that routes jobs
  async process(job: Job<JobPayload>) {
      if (job.name === 'confirmation:send') {
          return this.processConfirmationJob(job as Job<JobPayload & { registrationId: string }>);
      }
      if (job.name === 'reminder:notify') {
          return this.processReminderJob(job);
      }
      throw new Error(`Unknown job type: ${job.name}`);
  }
}