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
import { Privileges } from './privileges.decorator';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/offeree/signup')
  @Public()
  signupOfferee(@Body() offereeSignupDTO: OffereeSignupDTO): Promise<void> {
    return this.authService.signupOfferee(offereeSignupDTO);
  }

  @Post('/offeror/signup')
  @Privileges(Privilege.SUPERUSER)
  signupOfferor(@Body() offerorSignupDTO: OfferorSignupDTO): Promise<void> {
    return this.authService.signupOfferor(offerorSignupDTO);
  }

  @Post('/login')
  @Public()
  login(
    @Body() loginDTO: LoginDTO,
  ): Promise<{ accessToken: string; privilege: Privilege }> {
    return this.authService.login(loginDTO);
  }

  @Patch('/username')
  @Privileges(Privilege.OFFEREE, Privilege.OFFEROR)
  updateUsername(
    @GetAccount() account: Account,
    @Body() usernameUpdateDTO: UsernameUpdateDTO,
  ): Promise<{ accessToken: string }> {
    return this.authService.updateUsername(account, usernameUpdateDTO);
  }

  @Patch('/pass')
  @Privileges(Privilege.OFFEREE, Privilege.OFFEROR)
  updatePass(
    @GetAccount() account: Account,
    @Body() passUpdateDTO: PassUpdateDTO,
  ): Promise<void> {
    return this.authService.updatePass(account, passUpdateDTO);
  }
}
