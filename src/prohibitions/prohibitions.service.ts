import { InjectQueue } from '@nestjs/bull';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Account } from 'src/auth/account.entity';
import { Privilege } from 'src/auth/enum/privilege.enum';
import { Offeree } from 'src/offerees/offeree.entity';
import { OffereesService } from 'src/offerees/offerees.service';
import { Offeror } from 'src/offerors/offeror.entity';
import { OfferorsService } from 'src/offerors/offerors.service';
import { QueryFailedError, Repository, SelectQueryBuilder } from 'typeorm';
import { OffereeProhibitDTO } from './dto/offeree-prohibit.dto';
import { TimeframeUpdateDTO } from './dto/timeframe-update.dto';
import { Prohibition } from './prohibition.entity';

@Injectable()
export class ProhibitionsService {
  constructor(
    @InjectRepository(Prohibition)
    private prohibitionsRepository: Repository<Prohibition>,
    @InjectQueue('PROHIBITIONS') private jwtQueue: Queue,
    private eventEmitter2: EventEmitter2,
    private offereesService: OffereesService,
    private offerorsService: OfferorsService,
  ) {}

  async prohibitOfferee(offereeProhibitDTO: OffereeProhibitDTO): Promise<void> {
    const { idOfferees, idOfferors } = offereeProhibitDTO;

    const offeree: Offeree = await this.offereesService.getOfferee(idOfferees);

    const offeror: Offeror = await this.offerorsService.getOfferor(idOfferors);

    let prohibition: Prohibition;
    try {
      prohibition = await this.prohibitionsRepository.findOne({
        where: { offeree, offeror },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // offeree already been prohibited
    if (prohibition)
      throw new ConflictException(
        `Offeree ${`${offeree.name} ${offeree.surname}`} has already been prohibited for offeror ${
          offeror.name
        }.`,
      );

    const { conclusion, cause } = offereeProhibitDTO;

    prohibition = this.prohibitionsRepository.create({
      conclusion,
      cause,
      offeree,
      offeror,
    });

    try {
      await this.prohibitionsRepository.insert(prohibition);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    try {
      await this.jwtQueue.add(
        'PROHIBITION_CONCLUDE',
        {
          username: offeree.account.username,
          prohibition,
        },
        {
          jobId: prohibition.id,
          priority: 1,
          delay:
            new Date(prohibition.conclusion).getTime() - new Date().getTime(),
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.eventEmitter2.emit('notify', {
      cause: 'PROHIBITION_DETERMINATION',
      recipient: offeree.account.username,
      prohibition,
    });
  }

  async getProhibitionsOfOfferee(
    account: Account,
    username?: string,
  ): Promise<Prohibition[]> {
    // superuser demand
    if (account.privilege === Privilege.SUPERUSER) {
      const query: SelectQueryBuilder<Prohibition> =
        this.prohibitionsRepository.createQueryBuilder('prohibition');
      query.innerJoinAndSelect('prohibition.offeror', 'offeror');
      query.innerJoinAndSelect('prohibition.offeree', 'offeree');
      query.innerJoin('offeree.account', 'account');

      // username of an offeree provided
      if (username)
        query.where('UPPER(account.username) LIKE UPPER(:username)', {
          username: `%${username}%`,
        });

      try {
        return await query.getMany();
      } catch (error) {
        throw new QueryFailedError(query.getSql(), [username], error.message);
      }
    }

    try {
      return this.prohibitionsRepository.find({
        where: { offeree: { account } },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getProhibitionsForOfferor(
    account: Account,
    name: string,
  ): Promise<Prohibition[]> {
    // superuser demand
    if (account.privilege === Privilege.SUPERUSER) {
      const query: SelectQueryBuilder<Prohibition> =
        this.prohibitionsRepository.createQueryBuilder('prohibition');
      query.innerJoin('prohibition.offeror', 'offeror');
      query.innerJoinAndSelect('prohibition.offeree', 'offeree');

      // name of an offeror provided
      if (name)
        query.where('UPPER(offeror.name) LIKE UPPER(:name)', {
          name: `%${name}%`,
        });

      try {
        return await query.getMany();
      } catch (error) {
        throw new QueryFailedError(query.getSql(), [name], error.message);
      }
    }

    try {
      return await this.prohibitionsRepository.find({
        where: { offeror: { account } },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateTimeframe(
    id: string,
    timeframeUpdateDTO: TimeframeUpdateDTO,
  ): Promise<void> {
    const { conclusion } = timeframeUpdateDTO;

    let prohibition: Prohibition;
    try {
      prohibition = await this.prohibitionsRepository.findOne({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // prohibition was found
    if (prohibition) {
      prohibition.conclusion = conclusion;

      try {
        await this.prohibitionsRepository.save(prohibition);

        (await this.jwtQueue.getJob(id)).remove();

        await this.jwtQueue.add(
          'PROHIBITION_CONCLUDE',
          {
            username: prohibition.offeree.account.username,
            prohibition,
          },
          {
            jobId: prohibition.id,
            priority: 1,
            delay:
              new Date(prohibition.conclusion).getTime() - new Date().getTime(),
          },
        );
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }

      this.eventEmitter2.emit('notify', {
        cause: 'PROHIBITION_TIMEFRAME_UPDATE',
        recipient: prohibition.offeree.account.username,
        prohibition,
      });
    } else
      throw new NotFoundException(
        `Prohibition with the id ${id} was not found.`,
      );
  }

  async revokeProhibition(id: string): Promise<void> {
    let prohibition: Prohibition;
    try {
      prohibition = await this.prohibitionsRepository.findOne({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // prohibition was determined
    if (prohibition) {
      try {
        const result: any = await this.prohibitionsRepository.delete(id);
        if (result.affected)
          await (await this.jwtQueue.getJob(prohibition.id)).remove();
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }

      this.eventEmitter2.emit('notify', {
        cause: 'PROHIBITION_CONCLUSION',
        recipient: prohibition.offeree.account.username,
        prohibition,
      });
    } else
      throw new NotFoundException(
        `Prohibition with the id ${id} was not found.`,
      );
  }
}
