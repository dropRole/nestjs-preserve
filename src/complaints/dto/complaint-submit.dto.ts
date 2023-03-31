import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ComplaintSubmitDTO {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsNotEmpty()
  idReservations: string;

  @IsOptional()
  @IsString()
  idCounteredComplaint: string;
}
