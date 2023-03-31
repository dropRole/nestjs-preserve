import { Controller, Get, Query, Param, Patch, Body } from '@nestjs/common';
import { Account } from 'src/auth/account.entity';
import { GetAccount } from 'src/auth/get-account.decorator';
import { BusinessInfoUpdateDTO } from './dto/business-info-update.dto';
import { OfferorFilterDTO } from './dto/offeror-filter.dto';
import { ReputationUpdateDTO } from './dto/reputation-update.dto';
import { Offeror } from './offeror.entity';
import { OfferorsService } from './offerors.service';

@Controller('offerors')
export class OfferorsController {
  constructor(private offerorsService: OfferorsService) {}

  @Get()
  getOfferors(@Query() offerorFilterDTO: OfferorFilterDTO): Promise<Offeror[]> {
    return;
  }

  @Get('/reputation/:username')
  getReputation(@Param('username') username: string): Promise<{
    responsiveness: number;
    compliance: number;
    timeliness: number;
  }> {
    return;
  }

  @Get('/businessInfo')
  getBusinessInfo(@GetAccount() account: Account): Promise<{
    name: string;
    address: string;
    email: string;
    telephone: string;
    businessHours: string;
  }> {
    return;
  }

  @Patch('/businessInfo')
  updateBusinessInfo(
    @GetAccount() account: Account,
    @Body()
    businessInfoUpdateDTO: BusinessInfoUpdateDTO,
  ): Promise<void> {
    return;
  }

  @Patch('/reputation')
  updateReputation(
    @Body() reputationUpdateDTO: ReputationUpdateDTO,
  ): Promise<void> {
    return;
  }
}
