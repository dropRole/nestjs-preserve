import { Body, Controller, Post, Patch } from '@nestjs/common';
import { Account } from './account.entity';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { OffereeSignupDTO } from './dto/offeree-signup.dto';
import { OfferorSignupDTO } from './dto/offeror-signup.dto';
import { PassUpdateDTO } from './dto/pass-update.dto';
import { UsernameUpdateDTO } from './dto/username-update.dto';
import { Privilege } from './enum/privilege.enum';
import { GetAccount } from './get-account.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/offeree/signup')
  signupOfferee(@Body() offereeSignupDTO: OffereeSignupDTO): Promise<void> {
    return;
  }

  @Post('/offeror/signup')
  signupOfferor(@Body() offerorSignupDTO: OfferorSignupDTO): Promise<void> {
    return;
  }

  @Post('/login')
  login(
    @Body() loginDTO: LoginDTO,
  ): Promise<{ accessToken: string; privilege: Privilege }> {
    return;
  }

  @Patch('/username')
  updateUsername(
    @GetAccount() account: Account,
    @Body() usernameUpdateDTO: UsernameUpdateDTO,
  ): Promise<{ accessToken: string }> {
    return;
  }

  @Patch('/pass')
  updatePass(
    @GetAccount() account: Account,
    @Body() passUpdateDTO: PassUpdateDTO,
  ): Promise<void> {
    return;
  }
}
