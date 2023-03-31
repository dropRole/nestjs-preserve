import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity';
import { JWTPayload } from './jwt-payload.interface';
import { Privilege } from './enum/privilege.enum';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  async validate(jwtPayload: JWTPayload) {
    const { username } = jwtPayload;

    // superuser session
    if (username === this.configService.get('SUPERUSER'))
      return {
        username: this.configService.get('SUPERUSER'),
        privilege: Privilege.SUPERUSER,
      };

    const account: Account = await this.accountsRepository.findOne({
      where: { username },
    });

    // account registered
    if (account) return account;
  }
}
