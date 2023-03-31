import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { Account } from 'src/auth/account.entity';
import { GetAccount } from 'src/auth/get-account.decorator';
import { Complaint } from './complaint.entity';
import { ComplaintsService } from './complaints.service';
import { ComplaintSubmitDTO } from './dto/complaint-submit.dto';
import { ContentUpdateDTO } from './dto/content-update.dto';

@Controller('complaints')
export class ComplaintsController {
  constructor(private complaintsService: ComplaintsService) {}

  @Post()
  complain(
    @GetAccount() account: Account,
    @Body() complaintSubmitDTO: ComplaintSubmitDTO,
  ): Promise<void> {
    return;
  }

  @Get('/:idReservations')
  getComplaints(
    @GetAccount() account: Account,
    @Param('idReservations') idReservations: string,
  ): Promise<Complaint[]> {
    return;
  }

  @Patch()
  updateContent(
    @GetAccount() account: Account,
    @Body() contentUpdateDTO: ContentUpdateDTO,
  ): Promise<void> {
    return;
  }

  @Delete('/:id')
  withdrawComplaint(
    @GetAccount() account: Account,
    @Param('id') id: string,
  ): Promise<void> {
    return;
  }
}
