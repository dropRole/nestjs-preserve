import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { Account } from 'src/auth/account.entity';
import { Privilege } from 'src/auth/enum/privilege.enum';
import { GetAccount } from 'src/auth/get-account.decorator';
import { Privileges } from 'src/auth/privileges.decorator';
import { AssessmentMakeDTO } from './dto/assessment-make.dto';
import { RequestFilterDTO } from './dto/request-filter.dto';
import { RequestSubmitDTO } from './dto/request-submit.dto';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private requestsService: RequestsService) {}

  @Post()
  @Privileges(Privilege.OFFEREE)
  requestForReservation(
    @GetAccount() account: Account,
    @Body() requestSubmitDTO: RequestSubmitDTO,
  ): Promise<Request> {
    return;
  }

  @Get()
  @Privileges(Privilege.OFFEREE, Privilege.OFFEROR)
  getRequests(
    @GetAccount() account: Account,
    @Query() requestFilterDTO: RequestFilterDTO,
  ): Promise<Request[]> {
    return;
  }

  @Patch('/assessment')
  @Privileges(Privilege.OFFEROR)
  assessReservationTime(
    @GetAccount() account: Account,
    @Body() assessmentMakeDTO: AssessmentMakeDTO,
  ): Promise<void> {
    return;
  }

  @Delete('/:id')
  @Privileges(Privilege.OFFEREE)
  withdrawRequest(
    @GetAccount() account: Account,
    @Param('id') id: string,
  ): Promise<void> {
    return;
  }
}
