import { IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class ReplyTicketDto {
  @IsString()
  @IsNotEmpty({ message: 'Message tidak boleh kosong' })
  @MinLength(1, { message: 'Message minimal 1 karakter' })
  message: string;

  @IsBoolean()
  @IsOptional()
  closeTicket?: boolean;
}