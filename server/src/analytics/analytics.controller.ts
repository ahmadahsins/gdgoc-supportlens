import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from 'src/auth/decorators/roles.decorator';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth/firebase-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth('Firebase-JWT')
@Controller('analytics')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  @AdminOnly()
  @ApiOperation({ summary: 'Get dashboard statistics', description: 'Get aggregated ticket analytics including sentiment stats, categories, and urgency scores' })
  @ApiResponse({ status: 200, description: 'Analytics data with totalTickets, openTickets, closedTickets, avgUrgencyScore, sentimentStats, topCategories' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async getStats() {
    return this.analyticsService.getStats();
  }
}
