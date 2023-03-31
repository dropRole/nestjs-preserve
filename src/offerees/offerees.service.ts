import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/auth/account.entity';
import { Repository, SelectQueryBuilder, QueryFailedError } from 'typeorm';
import { BasicsUpdateDTO } from './dto/basics-update.dto';
import { Offeree } from './offeree.entity';

@Injectable()
export class OffereesService {
  constructor(
    @InjectRepository(Offeree)
    private offereesRepository: Repository<Offeree>,
  ) {}

  async recordOfferee(
    name: string,
    surname: string,
    email: string,
    account: Account,
  ): Promise<void> {
    const offeree: Offeree = this.offereesRepository.create({
      name,
      surname,
      email,
      account,
    });

    try {
      await this.offereesRepository.insert(offeree);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getOfferees(search: string): Promise<Offeree[]> {
    const query: SelectQueryBuilder<Offeree> =
      this.offereesRepository.createQueryBuilder('offeree');
    query.innerJoin('offeree.account', 'account');
    query.addSelect('account.username');

    // search is provided
    if (search)
      query.where('UPPER(account.username) LIKE UPPER(:search)', {
        search: `%${search}%`,
      });

    try {
      return await query.getMany();
    } catch (error) {
      throw new QueryFailedError(query.getSql(), [search], error.message);
    }
  }

  async getOfferee(id: string): Promise<Offeree> {
    let offeree: Offeree;
    try {
      offeree = await this.offereesRepository.findOne({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // subject offeree was not found
    if (!offeree)
      throw new NotFoundException(`Offeree with the id ${id} was not found.`);

    return offeree;
  }

  async getBasics(account: Account): Promise<{
    name: string;
    surname: string;
    email: string;
    username: string;
  }> {
    let offeree: Offeree;
    try {
      offeree = await this.offereesRepository.findOne({
        where: { account },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    const { name, surname, email } = offeree;

    return { name, surname, email, username: account.username };
  }

  async updateBasics(
    account: Account,
    basicsUpdateDTO: BasicsUpdateDTO,
  ): Promise<void> {
    let offeree: Offeree;
    try {
      offeree = await this.offereesRepository.findOne({
        where: { account },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    const { name, surname, email } = basicsUpdateDTO;

    offeree.name = name;
    offeree.surname = surname;
    offeree.email = email;

    try {
      await this.offereesRepository.save(offeree);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
