import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth/firebase-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { TicketsService } from './tickets.service';
import * as currentUserInterface from 'src/common/interfaces/current-user.interface';
import { CreateTicketDto } from './dto/create-ticket-dto';
import { GenerateDraftDto } from './dto/generate-draft.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }
  
  @Post()
  async create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  async findAll(@Query('status') status: string) {
    return this.ticketsService.findAll(status);
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post(':id/reply')
  @UseGuards(FirebaseAuthGuard)
  async reply(@Param('id') id: string, @Body() replyDto: ReplyTicketDto, @GetUser() user: currentUserInterface.ICurrentUser) {
    return this.ticketsService.reply(id, replyDto, user);
  }

  @Post(':id/summarize')
  @UseGuards(FirebaseAuthGuard)
  async summarize(@Param('id') id: string) {
    return this.ticketsService.summarize(id);
  }

  @Post(':id/generate-draft')
  @UseGuards(FirebaseAuthGuard)
  async generateDraft(@Param('id') id: string, @Body() generateDraftDto: GenerateDraftDto) {
    return this.ticketsService.generateDraft(id, generateDraftDto.contextMessage);
  }
}
