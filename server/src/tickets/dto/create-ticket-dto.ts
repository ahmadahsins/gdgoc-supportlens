import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'John Doe', description: 'Customer name' })
  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Customer email address' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @ApiProperty({ example: 'Aplikasi error saat checkout, tolong bantu!', description: 'Complaint message (min 10 chars)' })
  @IsString()
  @IsNotEmpty({ message: 'Pesan tidak boleh kosong' })
  @MinLength(10, { message: 'Pesan minimal 10 karakter' })
  message: string;
}
