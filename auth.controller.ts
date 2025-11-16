import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * 1. POST /api/auth/signup
   * Body: { name, email, password, role } (role = participant | organizer)
   * Returns JWT.
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: SignupDto) {
    const { token } = await this.authService.signup(dto);
    return { token };
  }

  /**
   * 2. POST /api/auth/login
   * Body: { email, password }
   * Returns JWT.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    // The service handles authentication and JWT generation
    const { token } = await this.authService.login(dto);
    return { token };
  }
}