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
import { GetAccount } from 'src/auth/get-account.decorator';
import { AssessmentMakeDTO } from './dto/assessment-make.dto';
import { RequestFilterDTO } from './dto/request-filter.dto';
import { RequestSubmitDTO } from './dto/request-submit.dto';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private requestsService: RequestsService) {}

  @Post()
  requestForReservation(
    @GetAccount() account: Account,
    @Body() requestSubmitDTO: RequestSubmitDTO,
  ): Promise<Request> {
    return;
  }

  @Get()
  getRequests(
    @GetAccount() account: Account,
    @Query() requestFilterDTO: RequestFilterDTO,
  ): Promise<Request[]> {
    return;
  }

  @Patch('/assessment')
  assessReservationTime(
    @GetAccount() account: Account,
    @Body() assessmentMakeDTO: AssessmentMakeDTO,
  ): Promise<void> {
    return;
  }

  @Delete('/:id')
  withdrawRequest(
    @GetAccount() account: Account,
    @Param('id') id: string,
  ): Promise<void> {
    return;
  }
}
