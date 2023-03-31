import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class BasicsUpdateDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(35)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(35)
  surname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(320)
  email: string;
}
