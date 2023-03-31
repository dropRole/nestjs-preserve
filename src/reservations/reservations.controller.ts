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
import { Privilege } from 'src/auth/enum/privilege.enum';
import { GetAccount } from 'src/auth/get-account.decorator';
import { Privileges } from 'src/auth/privileges.decorator';
import { ReservationFilterDTO } from './dto/reservation-filter.dto';
import { ReservationMakeDTO } from './dto/reservation-make.dto';
import { Reservation } from './reservation.entity';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private reservationsService: ReservationsService) {}

  @Post()
  @Privileges(Privilege.OFFEROR)
  reserve(
    @GetAccount() account: Account,
    @Body() reservationMakeDTO: ReservationMakeDTO,
  ): Promise<void> {
    return this.reservationsService.reserve(account, reservationMakeDTO);
  }

  @Get()
  @Privileges(Privilege.OFFEREE, Privilege.OFFEROR, Privilege.SUPERUSER)
  getReservations(
    @GetAccount() account: Account,
    @Query() reservationFilterDTO: ReservationFilterDTO,
  ): Promise<Reservation[]> {
    return this.reservationsService.getReservations(
      account,
      reservationFilterDTO,
    );
  }

  @Delete('/:id')
  @Privileges(Privilege.OFFEROR)
  deleteReservation(
    @GetAccount() account: Account,
    @Param('id') id: string,
  ): Promise<void> {
    return this.reservationsService.deleteReservation(account, id);
  }
}
