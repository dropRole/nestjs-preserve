import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class OffereeSignupDTO {
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

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
  pass: string;
}
