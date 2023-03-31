import { IsString, IsNotEmpty } from 'class-validator';

export class AssessmentMakeDTO {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  assessment: string;
}
