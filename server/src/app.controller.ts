import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check', description: 'Check if the server is running and healthy' })
  @ApiResponse({ status: 200, description: 'Server is healthy' })
  healthCheck() {
    return this.appService.healthCheck();
  }
}
