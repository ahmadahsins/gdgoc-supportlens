import { Controller, ForbiddenException, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import * as currentUserInterface from 'src/common/interfaces/current-user.interface';
import { KnowledgeBaseService } from './knowledge-base.service';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth/firebase-auth.guard';


@Controller('knowledge-base')
@UseGuards(FirebaseAuthGuard)
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) { }
  
  @Post('upload')
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
      }
    })
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: currentUserInterface.ICurrentUser,
  ) {
    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Akses ditolak. Hanya admin yang dapat mengupload dokumen.',
      );
    }

    if (!file) {
      throw new Error('No file uploaded');
    }

    return this.knowledgeBaseService.uploadDocument(file);
  }
}
