import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './guards/firebase-auth/firebase-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }
  
  @Post('sync')
  @UseGuards(FirebaseAuthGuard)
  async sync(@Req() req) {
    return this.authService.syncUser(req.user);
  }
}

