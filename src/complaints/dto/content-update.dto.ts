import { IsString, IsNotEmpty } from 'class-validator';

export class ContentUpdateDTO {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
