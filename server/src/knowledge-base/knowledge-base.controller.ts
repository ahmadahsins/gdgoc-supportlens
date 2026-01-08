import { Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KnowledgeBaseService } from './knowledge-base.service';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth/firebase-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AdminOnly } from 'src/auth/decorators/roles.decorator';

@Controller('knowledge-base')
@UseGuards(FirebaseAuthGuard, RolesGuard) 
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Post('upload')
  @AdminOnly()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        if (file.mimetype !== 'application/pdf') {
          callback(new Error('Only PDF files are allowed'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.knowledgeBaseService.uploadDocument(file);
  }

  @Get()
  @AdminOnly()
  async listDocuments() {
    return this.knowledgeBaseService.listDocuments();
  }

  @Delete(':id')
  @AdminOnly()
  async deleteDocument(@Param('id') id: string) {
    return this.knowledgeBaseService.deleteDocument(id);
  }
}
