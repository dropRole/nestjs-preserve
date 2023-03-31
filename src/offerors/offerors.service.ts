import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/auth/account.entity';
import { Repository, SelectQueryBuilder, QueryFailedError } from 'typeorm';
import { BusinessInfoUpdateDTO } from './dto/business-info-update.dto';
import { OfferorFilterDTO } from './dto/offeror-filter.dto';
import { ReputationUpdateDTO } from './dto/reputation-update.dto';
import { Offeror } from './offeror.entity';

@Injectable()
export class OfferorsService {
  constructor(
    @InjectRepository(Offeror)
    private offerorsRepository: Repository<Offeror>,
    private eventEmitter2: EventEmitter2,
  ) {}

  async recordOfferor(
    name: string,
    address: string,
    email: string,
    telephone: string,
    businessHours: string,
    account: Account,
  ): Promise<void> {
    const offeror: Offeror = this.offerorsRepository.create({
      name,
      address,
      email,
      telephone,
      businessHours,
      account,
    });

    try {
      await this.offerorsRepository.insert(offeror);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getOfferors(offerorFilterDTO: OfferorFilterDTO): Promise<Offeror[]> {
    const { name, municipality } = offerorFilterDTO;

    const query: SelectQueryBuilder<Offeror> =
      this.offerorsRepository.createQueryBuilder('offeror');

    // filter via name
    if (name)
      query.andWhere('UPPER(name) LIKE UPPER(:name)', {
        name: `%${name}%`,
      });

    // filter via municipality
    if (municipality)
      query.andWhere('UPPER(address) LIKE UPPER(:municipality)', {
        municipality: `%${municipality}%`,
      });

    try {
      return await query.getMany();
    } catch (error) {
      throw new QueryFailedError(
        query.getSql(),
        [name ? `%${name}%` : municipality ? `%${municipality}%` : undefined],
        error.message,
      );
    }
  }

  async getBusinessInfo(account: Account): Promise<{
    name: string;
    address: string;
    email: string;
    telephone: string;
    businessHours: string;
  }> {
    let offeror: Offeror;

    try {
      offeror = await this.offerorsRepository.findOne({
        where: { account },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return {
      name: offeror.name,
      address: offeror.address,
      email: offeror.email,
      telephone: offeror.telephone,
      businessHours: offeror.businessHours,
    };
  }

  async getReputation(username: string): Promise<{
    responsiveness: number;
    compliance: number;
    timeliness: number;
  }> {
    let offeror: Offeror;

    try {
      offeror = await this.offerorsRepository.findOne({
        where: { account: { username } },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // offeror was not found
    if (!offeror)
      throw new NotFoundException(
        `Offeror with account username ${username} was not found.`,
      );

    return {
      responsiveness: offeror.compliance,
      compliance: offeror.responsiveness,
      timeliness: offeror.timeliness,
    };
  }

  async getOfferor(id: string): Promise<Offeror> {
    let offeror: Offeror;
    try {
      offeror = await this.offerorsRepository.findOne({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // offeror was not found
    if (!offeror)
      throw new NotFoundException(`Offeror with id ${id} was not found.`);

    return offeror;
  }

  async updateBusinessInfo(
    account: Account,
    businessInfoUpdateDTO: BusinessInfoUpdateDTO,
  ): Promise<void> {
    let offeror: Offeror;

    try {
      offeror = await this.offerorsRepository.findOne({
        where: { account },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    const { name, email, address, telephone, businessHours } =
      businessInfoUpdateDTO;

    offeror.name = name;
    offeror.email = email;
    offeror.address = address;
    offeror.telephone = telephone;
    offeror.businessHours = businessHours;

    try {
      await this.offerorsRepository.save(offeror);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateReputation(
    reputationUpdateDTO: ReputationUpdateDTO,
  ): Promise<void> {
    const { responsiveness, compliance, timeliness, username } =
      reputationUpdateDTO;

    let offeror: Offeror;

    try {
      offeror = await this.offerorsRepository.findOne({
        where: { account: { username } },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // offeror was not found
    if (!offeror)
      throw new NotFoundException(
        `Offeror with the account username ${username} was not found.`,
      );

    offeror.responsiveness = responsiveness;
    offeror.compliance = compliance;
    offeror.timeliness = timeliness;

    try {
      await this.offerorsRepository.save(offeror);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    this.eventEmitter2.emit('notify', {
      cause: 'REPUTATION_ALTERATION',
      recipient: offeror.account.username,
      reputation: {
        responsiveness,
        compliance,
        timeliness,
      },
    });
  }
}
