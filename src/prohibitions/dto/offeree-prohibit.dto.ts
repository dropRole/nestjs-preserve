import { IsNotEmpty, IsString } from 'class-validator';

export class OffereeProhibitDTO {
  @IsString()
  @IsNotEmpty()
  conclusion: string;

  @IsString()
  @IsNotEmpty()
  cause: string;

  @IsString()
  @IsNotEmpty()
  idOfferees: string;

  @IsString()
  @IsNotEmpty()
  idOfferors: string;
}
