import { Module } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';
import { GeminiModule } from 'src/gemini/gemini.module';


@Module({
  imports: [ConfigModule, GeminiModule],
  providers: [
    {
      provide: 'PINECONE_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('PINECONE_API_KEY');
        if (!apiKey) {
          throw new Error('PINECONE_API_KEY is not defined in environment variables');
        }
        return new Pinecone({ apiKey });
      }
    },
    KnowledgeBaseService
  ],
  controllers: [KnowledgeBaseController],
  exports: ['PINECONE_CLIENT', KnowledgeBaseService]
})
export class KnowledgeBaseModule {}
