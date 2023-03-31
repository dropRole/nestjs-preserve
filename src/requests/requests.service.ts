import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/auth/account.entity';
import { Offeree } from 'src/offerees/offeree.entity';
import { OffereesService } from 'src/offerees/offerees.service';
import { Offeror } from 'src/offerors/offeror.entity';
import { OfferorsService } from 'src/offerors/offerors.service';
import { ReservationsService } from 'src/reservations/reservations.service';
import {
  Brackets,
  QueryFailedError,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { AssessmentMakeDTO } from './dto/assessment-make.dto';
import { RequestFilterDTO } from './dto/request-filter.dto';
import { RequestSubmitDTO } from './dto/request-submit.dto';
import { Request } from './request.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private requestsRepository: Repository<Request>,
    private eventEmitter2: EventEmitter2,
    private offereesService: OffereesService,
    private offerorsService: OfferorsService,
    @Inject(forwardRef(() => ReservationsService))
    private reservationsService: ReservationsService,
  ) {}

  async requestForReservation(
    account: Account,
    requestSubmitDTO: RequestSubmitDTO,
  ): Promise<Request> {
    const { requestedFor, seats, cause, note, idOfferors } = requestSubmitDTO;

    const offeree: Offeree = (
      await this.offereesService.getOfferees(account.username)
    )[0];

    const offeror: Offeror = await this.offerorsService.getOfferor(idOfferors);

    const request: Request = this.requestsRepository.create({
      requestedFor,
      seats,
      cause,
      note,
      offeree,
      offeror,
    });

    try {
      await this.requestsRepository.insert(request);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.eventEmitter2.emit('notify', {
      cause: 'RESERVATION_REQUEST',
      recipient: request.offeror.account.username,
      request: request,
    });

    return request;
  }

  async getRequests(
    account: Account,
    requestFilterDTO: RequestFilterDTO,
  ): Promise<Request[]> {
    const { todaysDate } = requestFilterDTO;

    const query: SelectQueryBuilder<Request> =
      this.requestsRepository.createQueryBuilder('request');
    query.select([
      'request',
      'offeror',
      'offeree',
      'offereeAccount',
      'offerorAccount',
    ]);
    query.innerJoin('request.offeror', 'offeror');
    query.innerJoin('request.offeree', 'offeree');
    query.innerJoin('offeree.account', 'offereeAccount');
    query.innerJoin('offeror.account', 'offerorAccount');
    query.where(
      new Brackets((query) => {
        query
          .where('offerorAccount.username = :username', {
            username: account.username,
          })
          .orWhere('offereeAccount.username = :username', {
            username: account.username,
          });
      }),
    );
    query.andWhere('request."requestedAt"::DATE = :todaysDate', {
      todaysDate,
    });
    query.andWhere(
      'request.id NOT IN(SELECT reservations.id FROM reservations)',
    );
    try {
      return await query.getMany();
    } catch (error) {
      throw new QueryFailedError(
        query.getSql(),
        [account, todaysDate],
        error.message,
      );
    }
  }

  async getRequest(account: Account, id: string): Promise<Request> {
    let request: Request;
    try {
      request = await this.requestsRepository.findOne({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // was not found
    if (!request)
      throw new NotFoundException(`Request with the id ${id} was not found.`);

    // unauthorized selection
    if (
      request.offeree.account.username !== account.username &&
      request.offeror.account.username !== account.username
    ) {
      throw new UnauthorizedException(
        'Unauthorized request selection attempt.',
      );
    }
    return request;
  }

  async assessReservationTime(
    account: Account,
    assessmentMakeDTO: AssessmentMakeDTO,
  ): Promise<void> {
    const { id } = assessmentMakeDTO;

    const request: Request = await this.getRequest(account, id);

    const { assessment } = assessmentMakeDTO;

    request.assessment = assessment;

    try {
      await this.requestsRepository.save(request);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async withdrawalRequest(account: Account, id: string): Promise<void> {
    const request: Request = await this.getRequest(account, id);

    try {
      await this.reservationsService.checkIfReserved(id);
    } catch (error) {
      try {
        await this.requestsRepository.delete(id);
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }

      this.eventEmitter2.emit('notify', {
        cause: 'REQUEST_WITHDRAWAL',
        request: request,
      });

      return;
    }

    throw new ConflictException(
      `Request with id ${id} was confirmed as a reservation.`,
    );
  }
}
