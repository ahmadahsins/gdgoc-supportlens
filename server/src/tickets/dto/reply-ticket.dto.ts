import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class ReplyTicketDto {
  @ApiProperty({ example: 'Terima kasih telah menghubungi kami. Kami akan segera menindaklanjuti.', description: 'Reply message from agent' })
  @IsString()
  @IsNotEmpty({ message: 'Message tidak boleh kosong' })
  @MinLength(1, { message: 'Message minimal 1 karakter' })
  message: string;

  @ApiPropertyOptional({ example: false, description: 'Set to true to close the ticket after reply' })
  @IsBoolean()
  @IsOptional()
  closeTicket?: boolean;
}