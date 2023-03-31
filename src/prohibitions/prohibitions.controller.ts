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
import { GetAccount } from 'src/auth/get-account.decorator';
import { OffereeProhibitDTO } from './dto/offeree-prohibit.dto';
import { TimeframeUpdateDTO } from './dto/timeframe-update.dto';
import { Prohibition } from './prohibition.entity';
import { ProhibitionsService } from './prohibitions.service';

@Controller('prohibitions')
export class ProhibitionsController {
  constructor(private prohibitionsService: ProhibitionsService) {}

  @Post()
  prohibitOfferee(
    @Body() offereeProhibitDTO: OffereeProhibitDTO,
  ): Promise<void> {
    return;
  }

  @Get('/offeree')
  getProhibitionsOfOfferee(
    @GetAccount() account: Account,
    @Body('username') username?: string,
  ): Promise<Prohibition[]> {
    return;
  }

  @Get('/offeror')
  getProhibitionsForOfferor(
    @GetAccount() account: Account,
    @Body('name') name?: string,
  ): Promise<Prohibition[]> {
    return;
  }

  @Patch('/:id/timeframe')
  updateTimeframe(
    @Param('id') id: string,
    @Body() timeframeUpdateDTO: TimeframeUpdateDTO,
  ): Promise<void> {
    return;
  }

  @Delete('/:id')
  revokeProhibition(@Param('id') id: string): Promise<void> {
    return;
  }
}
