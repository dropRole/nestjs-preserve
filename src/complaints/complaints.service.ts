import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Complaint } from './complaint.entity';
import { Repository, SelectQueryBuilder, QueryFailedError } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Account } from 'src/auth/account.entity';
import { Privilege } from 'src/auth/enum/privilege.enum';
import { ComplaintSubmitDTO } from './dto/complaint-submit.dto';
import { ContentUpdateDTO } from './dto/content-update.dto';
import { ReservationsService } from 'src/reservations/reservations.service';
import { Reservation } from 'src/reservations/reservation.entity';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private complaintsRepository: Repository<Complaint>,
    private eventEmitter2: EventEmitter2,
    private reservationsService: ReservationsService,
  ) {}

  async complain(
    account: Account,
    complaintSubmitDTO: ComplaintSubmitDTO,
  ): Promise<void> {
    const { content, idCounteredComplaint, idReservations } =
      complaintSubmitDTO;

    const reservation: Reservation =
      await this.reservationsService.getReservation(account, idReservations);

    let counteredComplaint: Complaint;

    // counter-complaint provided
    if (idCounteredComplaint) {
      try {
        counteredComplaint = await this.complaintsRepository.findOne({
          where: { id: idCounteredComplaint },
        });
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }

      // was not found
      if (!counteredComplaint)
        throw new NotFoundException(
          `Complaint with an id ${idCounteredComplaint} was not found.`,
        );
    }

    const complaint: Complaint = this.complaintsRepository.create({
      content,
      counteredComplaint: counteredComplaint ? counteredComplaint : undefined,
      reservation,
      account,
    });

    try {
      await this.complaintsRepository.insert(complaint);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.eventEmitter2.emit('notify', {
      cause: !counteredComplaint
        ? 'COMPLAINT_SUBMISSION'
        : 'COUNTER_COMPLAINT_SUBMISSION',
      recipient:
        account.privilege === Privilege.OFFEREE
          ? reservation.request.offeror.account.username
          : reservation.request.offeree.account.username,
      complaint,
    });
  }

  async getComplaints(
    account: Account,
    idReservations: string,
  ): Promise<Complaint[]> {
    const reservation: Reservation =
      await this.reservationsService.getReservation(account, idReservations);

    const query: SelectQueryBuilder<Complaint> =
      this.complaintsRepository.createQueryBuilder('complaint');
    query.leftJoinAndSelect(
      'complaint.counteredComplaint',
      'counteredComplaint',
    );
    query.innerJoinAndSelect('complaint.reservation', 'reservation');
    query.innerJoinAndSelect('reservation.request', 'request');
    query.innerJoinAndSelect('complaint.account', 'account');
    query.where({ reservation });
    query.addOrderBy('complaint.written', 'DESC');

    try {
      return await query.getMany();
    } catch (error) {
      throw new QueryFailedError(
        query.getSql(),
        [idReservations],
        error.message,
      );
    }
  }

  async updateContent(
    account: Account,
    contentUpdateDTO: ContentUpdateDTO,
  ): Promise<void> {
    const { id, content } = contentUpdateDTO;

    let complaint: Complaint;
    try {
      complaint = await this.complaintsRepository.findOne({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // was not found
    if (!complaint)
      throw new NotFoundException(`Complaint with the id ${id} was not found.`);

    // unauthorized update
    if (complaint.account.username != account.username)
      throw new UnauthorizedException(
        'Unauthorized complaint content update attempt.',
      );

    const fullYear: number = new Date().getFullYear();
    const months: number = new Date().getMonth() + 1;
    const days: number = new Date().getDate();
    const hours: number = new Date().getHours();
    const minutes: number = new Date().getMinutes();
    const seconds: number = new Date().getSeconds();

    complaint.content = content;
    complaint.updated = `${fullYear}-${months > 9 ? months : `0${months}`}-${
      days > 9 ? days : `0${days}`
    } ${hours > 9 ? hours : `0${hours}`}:${
      minutes > 9 ? minutes : `0${minutes}`
    }:${seconds > 9 ? seconds : `0${seconds}`}`;

    try {
      await this.complaintsRepository.save(complaint);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async withdrawComplaint(account: Account, id: string): Promise<void> {
    let complaint: Complaint;
    try {
      complaint = await this.complaintsRepository.findOne({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // complaint was not found
    if (!complaint)
      throw new NotFoundException(`Complaint with the id ${id} was not found`);

    // unauthorized deletion
    if (complaint.account.username !== account.username)
      throw new UnauthorizedException(
        'Unauthorized complaint deletion attempt.',
      );

    let counterComplaint: Complaint;
    try {
      counterComplaint = await this.complaintsRepository.findOne({
        where: { counteredComplaint: { id } },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // complaint has been counter-complained
    if (counterComplaint)
      throw new ConflictException(
        `Counter-complaints are persistent for complaint with the id ${id} .`,
      );

    try {
      await this.complaintsRepository.delete(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.eventEmitter2.emit('notify', {
      cause: 'COMPLAINT_WITHDRAWAL',
      complaint,
    });
  }
}
