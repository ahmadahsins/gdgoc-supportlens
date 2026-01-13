import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateDraftDto {
  @ApiProperty({ example: 'Bagaimana cara refund produk?', description: 'Customer message for AI context' })
  @IsString()
  @IsNotEmpty({ message: 'Context message tidak boleh kosong' })
  contextMessage: string;
}