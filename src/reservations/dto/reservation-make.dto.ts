import { IsString, IsNotEmpty } from 'class-validator';

export class ReservationMakeDTO {
  @IsString()
  @IsNotEmpty()
  idRequests: string;
}
