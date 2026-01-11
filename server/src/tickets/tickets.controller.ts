import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth/firebase-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ReplyTicketDto } from './dto/reply-ticket.dto';
import { TicketsService } from './tickets.service';
import * as currentUserInterface from 'src/common/interfaces/current-user.interface';
import { CreateTicketDto } from './dto/create-ticket-dto';
import { GenerateDraftDto } from './dto/generate-draft.dto';

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new ticket', description: 'Public endpoint for customers to submit complaints. Triggers automatic AI classification.' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully with AI analysis' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() createTicketDto: CreateTicketDto) {
    return this.ticketsService.create(createTicketDto);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('Firebase-JWT')
  @ApiOperation({ summary: 'Get all tickets', description: 'Get list of all tickets. Supports filtering by status.' })
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'CLOSED'], description: 'Filter by ticket status' })
  @ApiResponse({ status: 200, description: 'List of tickets' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async findAll(@Query('status') status: string) {
    return this.ticketsService.findAll(status);
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('Firebase-JWT')
  @ApiOperation({ summary: 'Get ticket by ID', description: 'Get detailed ticket information including chat history' })
  @ApiResponse({ status: 200, description: 'Ticket details with messages and AI analysis' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post(':id/reply')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('Firebase-JWT')
  @ApiOperation({ summary: 'Reply to ticket', description: 'Agent sends a reply to the customer. Can optionally close the ticket.' })
  @ApiResponse({ status: 200, description: 'Reply sent successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async reply(@Param('id') id: string, @Body() replyDto: ReplyTicketDto, @GetUser() user: currentUserInterface.ICurrentUser) {
    return this.ticketsService.reply(id, replyDto, user);
  }

  @Post(':id/summarize')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('Firebase-JWT')
  @ApiTags('AI')
  @ApiOperation({ summary: 'Summarize conversation', description: 'Generate AI summary of the ticket conversation using Gemini' })
  @ApiResponse({ status: 200, description: 'Summary generated and saved to ticket' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async summarize(@Param('id') id: string) {
    return this.ticketsService.summarize(id);
  }

  @Post(':id/generate-draft')
  @UseGuards(FirebaseAuthGuard)
  @ApiBearerAuth('Firebase-JWT')
  @ApiTags('AI')
  @ApiOperation({ summary: 'Generate RAG draft reply', description: 'Generate AI draft reply using RAG (Retrieval-Augmented Generation) with knowledge base context' })
  @ApiResponse({ status: 200, description: 'Draft reply generated with source documents' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async generateDraft(@Param('id') id: string, @Body() generateDraftDto: GenerateDraftDto) {
    return this.ticketsService.generateDraft(id, generateDraftDto.contextMessage);
  }
}
