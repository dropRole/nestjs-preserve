import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  Param,
} from '@nestjs/common';
import { Account } from 'src/auth/account.entity';
import { GetAccount } from 'src/auth/get-account.decorator';
import { ReservationFilterDTO } from './dto/reservation-filter.dto';
import { ReservationMakeDTO } from './dto/reservation-make.dto';
import { Reservation } from './reservation.entity';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Post()
  reserve(
    @GetAccount() account: Account,
    @Body() reservationMakeDTO: ReservationMakeDTO,
  ): Promise<void> {
    return;
  }

  @Get()
  getReservations(
    @GetAccount() account: Account,
    @Query() reservationFilterDTO: ReservationFilterDTO,
  ): Promise<Reservation[]> {
    return;
  }

  @Delete('/:id')
  deleteReservation(
    @GetAccount() account: Account,
    @Param('id') id: string,
  ): Promise<void> {
    return;
  }
}
