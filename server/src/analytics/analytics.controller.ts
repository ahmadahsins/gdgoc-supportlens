import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminOnly } from 'src/auth/decorators/roles.decorator';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth/firebase-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AnalyticsService } from './analytics.service';


@Controller('analytics')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('stats')
  @AdminOnly()
  async getStats() {
    return this.analyticsService.getStats();
  }
}
