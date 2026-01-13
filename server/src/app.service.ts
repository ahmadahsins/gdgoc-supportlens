import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly startTime = Date.now();

  healthCheck() {
    return {
      status: 'ok',
      message: 'SupportLens API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: `${Math.floor((Date.now() - this.startTime) / 1000)}s`,
    };
  }
}
