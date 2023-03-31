import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { DateFilter } from '../enum/filter.enum';

export class ReservationFilterDTO {
  @IsString()
  @IsNotEmpty()
  date: DateFilter;

  @IsOptional()
  @IsString()
  idOfferors: string;
}
