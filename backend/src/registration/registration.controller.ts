import { Controller, Post, Get, Param, Body, Headers } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RegistrationService } from './registration.service';
import { RegisterTeamDto } from './dto/register-team.dto';

@Controller('tournaments/:slug')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  // Get a one-time transport key for encrypting registration data
  @Get('register-key')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  getRegisterKey() {
    return this.registrationService.generateRegistrationKey();
  }

  // Rate limit: 5 requests per minute for registration
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  register(
    @Param('slug') slug: string,
    @Body() dto: RegisterTeamDto,
    @Headers('x-transport-key-id') keyId?: string,
  ) {
    return this.registrationService.register(slug, dto, keyId);
  }

  // Public team list: only team_name + status
  @Get('teams')
  getTeams(@Param('slug') slug: string) {
    return this.registrationService.getPublicTeamList(slug);
  }
}
