import { Body, Controller, Post, Get, Param, UseGuards, Req, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CompetitionService } from './competition.service';
import { RolesGuard, Roles } from '../auth/role.guard';
import { Role, User } from '@prisma/client';
import { Request } from 'express';

// DTO for competition creation (you would need to define this)
class CreateCompetitionDto {
    title: string;
    description: string;
    capacity: number;
    regDeadline: Date;
    startTime: Date; // Added for reminders
    tags?: string[];
}

// Custom request interface to include authenticated user
interface AuthenticatedRequest extends Request {
    user: Partial<User>; 
}

@Controller('competitions')
@UseGuards(AuthGuard('jwt')) // Protect all routes in this controller
export class CompetitionController {
  constructor(private competitionService: CompetitionService) {}

  /**
   * 3. POST /api/competitions
   * Role: Organizer only
   * Creates a new competition.
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ORGANIZER)
  @HttpCode(HttpStatus.CREATED)
  async createCompetition(
    @Body() dto: CreateCompetitionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const organizerId = req.user.id;
    const competition = await this.competitionService.createCompetition(organizerId, dto);
    return { id: competition.id, message: 'Competition created successfully.' };
  }

  /**
   * 4. POST /api/competitions/:id/register
   * Role: Participant only
   * Registers the authenticated user for the competition.
   * Must accept Idempotency-Key header.
   */
  @Post(':id/register')
  @UseGuards(RolesGuard)
  @Roles(Role.PARTICIPANT)
  // HttpCode is generally 201 for creation, but can return 200/409 based on idempotency/errors.
  async register(
    @Param('id') competitionId: string,
    @Req() req: AuthenticatedRequest,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    const userId = req.user.id;
    
    if (!idempotencyKey) {
        // Idempotency-Key is required as per assignment
        return { 
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'Idempotency-Key header is required for registration.',
        }
    }
    
    // The service handles concurrency, capacity checks, and job enqueuing
    const result = await this.competitionService.registerUser(
        competitionId,
        userId,
        idempotencyKey,
    );

    if (result.status === 'IDEMPOTENT_SUCCESS') {
        // Return 200 OK or 201 Created for a successful idempotent request
        return { 
            id: result.registrationId, 
            message: 'Registration already processed successfully (Idempotent).',
            status: result.status 
        };
    }
    
    // Return 201 Created for a new successful registration
    return { 
        id: result.registrationId, 
        message: 'Registration successful. Confirmation job enqueued.',
        status: result.status 
    };
  }

  // --- Optional additional endpoint ---
  
  /**
   * GET /api/competitions
   * Role: Any authenticated user
   * Retrieves a list of all competitions.
   */
  @Get()
  async getAllCompetitions() {
    // Implement logic to fetch all competitions, perhaps limited data
    const competitions = await this.competitionService.findAll();
    return competitions;
  }
}