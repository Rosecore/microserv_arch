import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

export interface UserPayload {
  id: string;
  email: string;
}

@Injectable()
export class CurrentUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (req.session?.jwt) {
      try {
        req.currentUser = jwt.verify(
          req.session.jwt,
          process.env.JWT_KEY!
        ) as UserPayload;
      } catch (err) {}
    }

    return true;
  }
}
