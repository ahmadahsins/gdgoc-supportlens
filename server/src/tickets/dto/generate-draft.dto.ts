import { IsNotEmpty, IsString } from "class-validator";

export class GenerateDraftDto {
  @IsString()
    @IsNotEmpty({ message: 'Context message tidak boleh kosong' })
  contextMessage: string;
}