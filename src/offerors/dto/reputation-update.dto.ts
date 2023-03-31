import {
  IsNumberString,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class ReputationUpdateDTO {
  @IsNumberString()
  responsiveness: number;

  @IsNumberString()
  compliance: number;

  @IsNumberString()
  timeliness: number;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;
}
