import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class OfferorSignupDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(320)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  address: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  telephone: string;

  @IsString()
  @IsNotEmpty()
  businessHours: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @MinLength(8)
  @MaxLength(20)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
  pass: string;
}
