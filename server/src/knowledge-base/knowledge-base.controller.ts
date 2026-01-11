import { Controller, Delete, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { KnowledgeBaseService } from './knowledge-base.service';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth/firebase-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AdminOnly } from 'src/auth/decorators/roles.decorator';

@ApiTags('Knowledge Base')
@ApiBearerAuth('Firebase-JWT')
@Controller('knowledge-base')
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Post('upload')
  @AdminOnly()
  @ApiOperation({ summary: 'Upload PDF document', description: 'Upload SOP document for RAG. PDF is parsed, chunked, embedded via Gemini, and stored in Pinecone.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'PDF file (max 10MB)' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Document indexed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or no file uploaded' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
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
  @ApiOperation({ summary: 'List all documents', description: 'Get list of all uploaded knowledge base documents' })
  @ApiResponse({ status: 200, description: 'List of documents with metadata' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  async listDocuments() {
    return this.knowledgeBaseService.listDocuments();
  }

  @Delete(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Delete document', description: 'Remove document from Firestore and delete all related vectors from Pinecone' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async deleteDocument(@Param('id') id: string) {
    return this.knowledgeBaseService.deleteDocument(id);
  }
}
