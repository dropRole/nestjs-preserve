import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './account.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { OffereesService } from 'src/offerees/offerees.service';
import { OfferorsService } from 'src/offerors/offerors.service';
import { OffereeSignupDTO } from './dto/offeree-signup.dto';
import * as bcrypt from 'bcrypt';
import { OfferorSignupDTO } from './dto/offeror-signup.dto';
import { JWTPayload } from './jwt-payload.interface';
import { LoginDTO } from './dto/login.dto';
import { Privilege } from './enum/privilege.enum';
import { UsernameUpdateDTO } from './dto/username-update.dto';
import { PassUpdateDTO } from './dto/pass-update.dto';
import { InternalServerErrorException } from '@nestjs/common/exceptions';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectQueue('JWT') private jwtExpirator: Queue,
    private offereesService: OffereesService,
    private offerorsService: OfferorsService,
  ) {}

  async signupOfferee(offereeSignupDTO: OffereeSignupDTO): Promise<void> {
    const { username } = offereeSignupDTO;

    let account: Account;

    try {
      account = await this.accountsRepository.findOne({
        where: { username },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // username is already in use
    if (account)
      throw new ConflictException(`Username ${username} is already in use.`);

    const { name, surname, email, pass } = offereeSignupDTO;

    const hash: string = await bcrypt.hash(pass, 9);

    account = this.accountsRepository.create({
      username,
      pass: hash,
      privilege: Privilege.OFFEREE,
    });

    try {
      await this.accountsRepository.insert(account);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return this.offereesService.recordOfferee(name, surname, email, account);
  }

  async signupOfferor(offerorSignupDTO: OfferorSignupDTO): Promise<void> {
    const { username } = offerorSignupDTO;

    let account: Account;
    try {
      account = await this.accountsRepository.findOne({
        where: { username },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // username being already in use
    if (account)
      throw new ConflictException(`Username ${username} is already in use.`);

    const { name, email, address, telephone, businessHours, pass } =
      offerorSignupDTO;

    const hash: string = await bcrypt.hash(pass, 9);

    account = this.accountsRepository.create({
      username,
      pass: hash,
      privilege: Privilege.OFFEROR,
    });

    try {
      await this.accountsRepository.insert(account);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return this.offerorsService.recordOfferor(
      name,
      address,
      email,
      telephone,
      businessHours,
      account,
    );
  }

  private async signJWT(username: string): Promise<string> {
    const payload: JWTPayload = { username };

    const accessToken: string = this.jwtService.sign(payload);

    try {
      await this.jwtExpirator.add(
        'JWT_EXPIRE',
        { username, accessToken },
        {
          priority: 1,
          delay: this.configService.get('JWT_EXPIRATION') * 1000,
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return accessToken;
  }

  async login(
    loginDTO: LoginDTO,
  ): Promise<{ accessToken: string; privilege: Privilege }> {
    const { username, pass } = loginDTO;

    const superuser: string = this.configService.get('SUPERUSER'),
      superPass: string = this.configService.get('SUPERUSER_PASS');

    // superuser attempted a login
    if (username === superuser && (await bcrypt.compare(pass, superPass))) {
      const accessToken: string = await this.signJWT(username);

      return { accessToken, privilege: Privilege.SUPERUSER };
    }

    let account: Account;
    try {
      account = await this.accountsRepository.findOne({
        where: { username },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // account is homologated
    if (account && (await bcrypt.compare(pass, account.pass))) {
      const accessToken: string = await this.signJWT(username);

      return { accessToken, privilege: account.privilege };
    }

    throw new UnauthorizedException('Check your login credentials.');
  }

  async updateUsername(
    account: Account,
    usernameUpdateDTO: UsernameUpdateDTO,
  ): Promise<{ accessToken: string }> {
    const { username } = usernameUpdateDTO;

    let result: Account;

    try {
      result = await this.accountsRepository.findOne({
        where: { username },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    // username already in use
    if (result)
      throw new ConflictException(`Username ${username} is already in use.`);

    try {
      await this.accountsRepository.update(account, { username });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }

    return { accessToken: await this.signJWT(username) };
  }

  async updatePass(
    account: Account,
    passUpdateDTO: PassUpdateDTO,
  ): Promise<void> {
    const { pass, newPass } = passUpdateDTO;

    // invalid current password
    if (!(await bcrypt.compare(pass, account.pass)))
      throw new ConflictException('Invalid current password.');

    const hash: string = await bcrypt.hash(newPass, 9);

    account.pass = hash;

    try {
      await this.accountsRepository.save(account);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
