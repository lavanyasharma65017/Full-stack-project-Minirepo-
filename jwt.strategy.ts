import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';

export interface JwtPayload {
  sub: string; // userId
  email: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET, // Use the secret from .env.example
    });
  }

  async validate(payload: JwtPayload): Promise<Partial<User>> {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    
    if (!user) {
      throw new UnauthorizedException();
    }
    
    // Return the user object parts needed for the request context (req.user)
    return { id: user.id, email: user.email, role: user.role, name: user.name };
  }
}