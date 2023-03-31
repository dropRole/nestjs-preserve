import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Privilege } from './enum/privilege.enum';
import { PRIVILEGES } from './privileges.decorator';

@Injectable()
export class PrivilegesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const privileges: Privilege[] = this.reflector.getAllAndOverride<
      Privilege[]
    >(PRIVILEGES, [ctx.getHandler()]);

    // route demands privileges
    if (!privileges || privileges.length === 0) return true;

    const { user } = ctx.switchToHttp().getRequest();

    return privileges.some((privilege) => {
      return privilege === user.privilege;
    });
  }
}
