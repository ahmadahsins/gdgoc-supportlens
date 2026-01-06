import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth/firebase-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { TicketsService } from './tickets.service';
import * as currentUserInterface from 'src/common/interfaces/current-user.interface';

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
  async reply(@Param('id') id: string, @Body() replyDto: ReplyTicketDto, @GetUser() user: currentUserInterface.ICurrentUser) {
    return this.ticketsService.reply(id, replyDto, user);
  }
}
