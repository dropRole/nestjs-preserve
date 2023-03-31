import {
  IsString,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
} from 'class-validator';

export class RequestSubmitDTO {
  @IsString()
  @IsNotEmpty()
  requestedFor: string;

  @IsNumberString()
  @IsNotEmpty()
  seats: number;

  @IsString()
  @IsNotEmpty()
  cause: string;

  @IsOptional()
  @IsString()
  note: string;

  @IsString()
  @IsNotEmpty()
  idOfferors: string;
}
