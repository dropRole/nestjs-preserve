import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { Account } from 'src/auth/account.entity';
import { Privilege } from 'src/auth/enum/privilege.enum';
import { GetAccount } from 'src/auth/get-account.decorator';
import { Privileges } from 'src/auth/privileges.decorator';
import { OffereeProhibitDTO } from './dto/offeree-prohibit.dto';
import { TimeframeUpdateDTO } from './dto/timeframe-update.dto';
import { Prohibition } from './prohibition.entity';
import { ProhibitionsService } from './prohibitions.service';

@Controller('prohibitions')
export class ProhibitionsController {
  constructor(private prohibitionsService: ProhibitionsService) {}

  @Post()
  @Privileges(Privilege.SUPERUSER)
  prohibitOfferee(
    @Body() offereeProhibitDTO: OffereeProhibitDTO,
  ): Promise<void> {
    return;
  }

  @Get('/offeree')
  @Privileges(Privilege.OFFEREE, Privilege.SUPERUSER)
  getProhibitionsOfOfferee(
    @GetAccount() account: Account,
    @Body('username') username?: string,
  ): Promise<Prohibition[]> {
    return;
  }

  @Get('/offeror')
  @Privileges(Privilege.OFFEROR, Privilege.SUPERUSER)
  getProhibitionsForOfferor(
    @GetAccount() account: Account,
    @Body('name') name?: string,
  ): Promise<Prohibition[]> {
    return;
  }

  @Patch('/:id/timeframe')
  @Privileges(Privilege.SUPERUSER)
  updateTimeframe(
    @Param('id') id: string,
    @Body() timeframeUpdateDTO: TimeframeUpdateDTO,
  ): Promise<void> {
    return;
  }

  @Delete('/:id')
  @Privileges(Privilege.SUPERUSER)
  revokeProhibition(@Param('id') id: string): Promise<void> {
    return;
  }
}
