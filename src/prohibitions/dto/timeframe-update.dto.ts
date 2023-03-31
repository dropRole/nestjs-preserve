import { IsNotEmpty, IsString } from 'class-validator';

export class TimeframeUpdateDTO {
  @IsString()
  @IsNotEmpty()
  conclusion: string;
}
