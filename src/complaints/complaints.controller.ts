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
import { Privilege } from 'src/auth/enum/privilege.enum';
import { GetAccount } from 'src/auth/get-account.decorator';
import { Privileges } from 'src/auth/privileges.decorator';
import { Complaint } from './complaint.entity';
import { ComplaintsService } from './complaints.service';
import { ComplaintSubmitDTO } from './dto/complaint-submit.dto';
import { ContentUpdateDTO } from './dto/content-update.dto';

@Controller('complaints')
export class ComplaintsController {
  constructor(private complaintsService: ComplaintsService) {}

  @Post()
  @Privileges(Privilege.OFFEREE, Privilege.OFFEROR)
  complain(
    @GetAccount() account: Account,
    @Body() complaintSubmitDTO: ComplaintSubmitDTO,
  ): Promise<void> {
    return this.complaintsService.complain(account, complaintSubmitDTO);
  }

  @Get('/:idReservations')
  @Privileges(Privilege.OFFEREE, Privilege.OFFEROR, Privilege.SUPERUSER)
  getComplaints(
    @GetAccount() account: Account,
    @Param('idReservations') idReservations: string,
  ): Promise<Complaint[]> {
    return this.complaintsService.getComplaints(account, idReservations);
  }

  @Patch()
  @Privileges(Privilege.OFFEREE, Privilege.OFFEROR)
  updateContent(
    @GetAccount() account: Account,
    @Body() contentUpdateDTO: ContentUpdateDTO,
  ): Promise<void> {
    return this.complaintsService.updateContent(account, contentUpdateDTO);
  }

  @Delete('/:id')
  @Privileges(Privilege.OFFEREE, Privilege.OFFEROR)
  withdrawComplaint(
    @GetAccount() account: Account,
    @Param('id') id: string,
  ): Promise<void> {
    return this.complaintsService.withdrawComplaint(account, id);
  }
}
