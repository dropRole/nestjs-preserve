import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { forwardRef } from '@nestjs/common/utils';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/auth/account.entity';
import { Request } from 'src/requests/request.entity';
import { RequestsService } from 'src/requests/requests.service';
import {
  Brackets,
  QueryFailedError,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { ReservationMakeDTO } from './dto/reservation-make.dto';
import { Reservation } from './reservation.entity';
import { v4 as uuidv4 } from 'uuid';
import { ReservationFilterDTO } from './dto/reservation-filter.dto';
import { Privilege } from 'src/auth/enum/privilege.enum';
import { DateFilter } from './enum/filter.enum';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
    private eventEmitter2: EventEmitter2,
    @Inject(forwardRef(() => RequestsService))
    private requestService: RequestsService,
  ) {}

  async reserve(
    account: Account,
    reservationMakeDTO: ReservationMakeDTO,
  ): Promise<void> {
    const { idRequests } = reservationMakeDTO;

    const request: Request = await this.requestService.getRequest(
      account,
      idRequests,
    );

    let reserved: boolean;

    try {
      reserved = await this.checkIfReserved(idRequests);
      // already reserved
    } catch (error) {
      const code = `${request.offeree.account.username.substring(
        0,
        3,
      )}_${uuidv4().substring(0, 6)}`;

      const reservation: Reservation = this.reservationsRepository.create({
        code,
        request,
      });

      try {
        await this.reservationsRepository.insert(reservation);
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }

      this.eventEmitter2.emit('notify', {
        cause: 'RESERVATION_CONFIRMATION',
        recipient: request.offeree.account.username,
        reservation,
      });
    }

    // already reserved
    if (reserved)
      throw new ConflictException(
        `Request with the id ${idRequests} was already reserved.`,
      );
  }

  async getReservations(
    account: Account,
    reservationFilterDTO: ReservationFilterDTO,
  ): Promise<Reservation[]> {
    const { date, idOfferors } = reservationFilterDTO;

    const query: SelectQueryBuilder<Reservation> =
      this.reservationsRepository.createQueryBuilder('reservation');
    query.select([
      'reservation',
      'request',
      'requestedOfferor',
      'requestedOfferorAccount',
      'requestantOfferee',
      'requestantOffereeAccount',
      'complaint',
      'complaintAuthor.username',
      'counteredComplaint',
      'counteredComplaintAuthor',
    ]);

    query.innerJoin('reservation.request', 'request');
    query.leftJoin('reservation.complaints', 'complaint');
    query.leftJoin('complaint.account', 'complaintAuthor');
    query.leftJoin('complaint.counteredComplaint', 'counteredComplaint');
    query.leftJoin('counteredComplaint.account', 'counteredComplaintAuthor');
    query.innerJoin('request.offeror', 'requestedOfferor');
    query.innerJoin('request.offeree', 'requestantOfferee');
    query.innerJoin('requestedOfferor.account', 'requestedOfferorAccount');
    query.innerJoin('requestantOfferee.account', 'requestantOffereeAccount');

    // superuser did not requested for reservations
    if (account.privilege !== Privilege.SUPERUSER) {
      query.where(
        new Brackets((query) => {
          query
            .where('requestedOfferorAccount.username = :username', {
              username: `${account.username}`,
            })
            .orWhere('requestantOffereeAccount.username = :username', {
              username: `${account.username}`,
            });
        }),
      );
    }

    // superuser requested for reservations
    if (account.privilege === Privilege.SUPERUSER) {
      // the id of an offeror is provided
      if (idOfferors)
        query.where('request.offeror.id = :idOfferors', {
          idOfferors,
        });
    }

    switch (date) {
      case DateFilter.TODAY:
        query.andWhere('reservation."reservedAt"::DATE = CURRENT_DATE');
        break;

      case DateFilter.WEEK:
        query.andWhere(
          "DATE_PART('week', reservation.reservedAt) = DATE_PART('week', CURRENT_DATE)",
        );
        break;

      case DateFilter.MONTH:
        query.andWhere(
          "DATE_PART('month', reservation.reservedAt) = DATE_PART('month', CURRENT_DATE)",
        );
        break;
    }

    query.orderBy('"reservedAt"', 'DESC');

    try {
      return await query.getMany();
    } catch (error) {
      throw new QueryFailedError(query.getSql(), [account], error.message);
    }
  }

  async getReservation(account: Account, id: string): Promise<Reservation> {
    let reservation: Reservation;
    try {
      reservation = await this.reservationsRepository.findOne({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // not found
    if (!reservation)
      throw new NotFoundException(
        `Reservation with the id ${id} was not found.`,
      );

    // unauthorized selection
    if (
      account.privilege !== Privilege.SUPERUSER &&
      account.username !== reservation.request.offeree.account.username &&
      account.username !== reservation.request.offeror.account.username
    )
      throw new UnauthorizedException(
        'Unauthorized reservation selection attempt.',
      );

    return reservation;
  }

  async checkIfReserved(idRequests: string): Promise<boolean> {
    let reservation: Reservation;
    try {
      reservation = await this.reservationsRepository.findOne({
        where: { request: { id: idRequests } },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // the given request was not the subject of reservation
    if (!reservation)
      throw new NotFoundException(
        `Reservation for request with the id ${idRequests} was not found.`,
      );

    return true;
  }

  async deleteReservation(account: Account, id: string): Promise<void> {
    const reservation: Reservation = await this.getReservation(account, id);

    // unauthorized deletion
    if (reservation.request.offeror.account.username !== account.username)
      throw new UnauthorizedException(
        'Unauthorized reservation deletion attempt.',
      );

    try {
      await this.reservationsRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.eventEmitter2.emit('notify', {
      cause: 'RESERVATION_WITHDRAWAL',
      reservation,
    });
  }
}
