import { Controller, Get, Query, Param, Patch, Body } from '@nestjs/common';
import { Account } from 'src/auth/account.entity';
import { Privilege } from 'src/auth/enum/privilege.enum';
import { GetAccount } from 'src/auth/get-account.decorator';
import { Privileges } from 'src/auth/privileges.decorator';
import { BusinessInfoUpdateDTO } from './dto/business-info-update.dto';
import { OfferorFilterDTO } from './dto/offeror-filter.dto';
import { ReputationUpdateDTO } from './dto/reputation-update.dto';
import { Offeror } from './offeror.entity';
import { OfferorsService } from './offerors.service';

@Controller('offerors')
export class OfferorsController {
  constructor(private offerorsService: OfferorsService) {}

  @Get()
  @Privileges(Privilege.OFFEREE, Privilege.SUPERUSER)
  getOfferors(@Query() offerorFilterDTO: OfferorFilterDTO): Promise<Offeror[]> {
    return this.offerorsService.getOfferors(offerorFilterDTO);
  }

  @Get('/reputation/:username')
  @Privileges(Privilege.OFFEROR, Privilege.SUPERUSER)
  getReputation(@Param('username') username: string): Promise<{
    responsiveness: number;
    compliance: number;
    timeliness: number;
  }> {
    return this.offerorsService.getReputation(username);
  }

  @Get('/businessInfo')
  @Privileges(Privilege.OFFEROR)
  getBusinessInfo(@GetAccount() account: Account): Promise<{
    name: string;
    address: string;
    email: string;
    telephone: string;
    businessHours: string;
  }> {
    return this.offerorsService.getBusinessInfo(account);
  }

  @Patch('/businessInfo')
  @Privileges(Privilege.OFFEROR)
  updateBusinessInfo(
    @GetAccount() account: Account,
    @Body()
    businessInfoUpdateDTO: BusinessInfoUpdateDTO,
  ): Promise<void> {
    return this.offerorsService.updateBusinessInfo(
      account,
      businessInfoUpdateDTO,
    );
  }

  @Patch('/reputation')
  @Privileges(Privilege.SUPERUSER)
  updateReputation(
    @Body() reputationUpdateDTO: ReputationUpdateDTO,
  ): Promise<void> {
    return this.offerorsService.updateReputation(reputationUpdateDTO);
  }
}
