import { Controller, ForbiddenException, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import * as currentUserInterface from 'src/common/interfaces/current-user.interface';
import { UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth/firebase-auth.guard';


@Controller('analytics')
@UseGuards(FirebaseAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  @Get('stats')
  async getStats(@GetUser() user: currentUserInterface.ICurrentUser) {
    if (user.role != 'admin') {
      throw new ForbiddenException('Akses ditolak. Hanya admin yang dapat melihat analytics.');
    }

    return this.analyticsService.getStats();
  }
}
