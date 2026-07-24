import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '../guards/current-user.guard';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayload | undefined => {
    const req = ctx.switchToHttp().getRequest();
    return req.currentUser;
  }
);
