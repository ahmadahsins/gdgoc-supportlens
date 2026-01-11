import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './guards/firebase-auth/firebase-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sync')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('Firebase-JWT')
  @ApiOperation({ summary: 'Sync user to Firestore', description: 'Sync Firebase authenticated user to Firestore database. Creates user record if not exists.' })
  @ApiResponse({ status: 200, description: 'User synced successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid Firebase token' })
  async sync(@Req() req) {
    return this.authService.syncUser(req.user);
  }
}

