import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC } from './public.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class JWTGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    ctx: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic: string = this.reflector.getAllAndOverride<string>(
      IS_PUBLIC,
      [ctx.getHandler()],
    );

    // public route
    if (isPublic) return true;

    return super.canActivate(ctx);
  }
}
