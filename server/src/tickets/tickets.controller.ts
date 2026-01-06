import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth/firebase-auth.guard';
import { ICurrentUser } from 'src/common/interfaces/current-user.interface';

@Controller('tickets')
@UseGuards(FirebaseAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }
  
  @Get()
  async findAll(@Query('status') status: string) {
    return this.ticketsService.findAll(status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post()
  async reply(@Param('id') id: string, @Body() replyDto: ReplyTicketDto, @Req() req: any) {
    const user = req.user as ICurrentUser;
    return this.ticketsService.reply(id, replyDto, user);
  }
}
