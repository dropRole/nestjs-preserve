import { IsString, IsOptional } from 'class-validator';

export class OfferorFilterDTO {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  municipality: string;
}
