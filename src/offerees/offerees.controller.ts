import { Controller, Get, Query, Patch, Body } from '@nestjs/common';
import { Account } from 'src/auth/account.entity';
import { GetAccount } from 'src/auth/get-account.decorator';
import { BasicsUpdateDTO } from './dto/basics-update.dto';
import { Offeree } from './offeree.entity';
import { OffereesService } from './offerees.service';

@Controller('offerees')
export class OffereesController {
  constructor(private offereesService: OffereesService) {}

  @Get()
  getOfferees(@Query('search') search: string): Promise<Offeree[]> {
    return;
  }

  @Get('/basics')
  getBasics(@GetAccount() account: Account): Promise<{
    name: string;
    surname: string;
    email: string;
    username: string;
  }> {
    return;
  }

  @Patch('/basics')
  updateBasics(
    @GetAccount() account: Account,
    @Body() basicsUpdateDTO: BasicsUpdateDTO,
  ): Promise<void> {
    return;
  }
}
