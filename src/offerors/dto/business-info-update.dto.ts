import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class BusinessInfoUpdateDTO {
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
}
