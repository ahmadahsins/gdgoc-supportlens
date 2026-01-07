import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama tidak boleh kosong' })
  name: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @IsString() 
  @IsNotEmpty({ message: 'Pesan tidak boleh kosong' })
  @MinLength(10, { message: 'Pesan minimal 10 karakter' })
  message: string;
}
