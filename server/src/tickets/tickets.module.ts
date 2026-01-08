import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { GeminiModule } from 'src/gemini/gemini.module';
import { KnowledgeBaseModule } from 'src/knowledge-base/knowledge-base.module';

@Module({
  imports: [GeminiModule,KnowledgeBaseModule],
  controllers: [TicketsController],
  providers: [TicketsService]
})
export class TicketsModule {}
