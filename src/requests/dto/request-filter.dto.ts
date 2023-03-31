import { IsString, IsNotEmpty } from 'class-validator';

export class RequestFilterDTO {
  @IsString()
  @IsNotEmpty()
  todaysDate: string;
}
