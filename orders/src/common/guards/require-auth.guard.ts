import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class RequireAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (!req.currentUser) {
      throw new UnauthorizedException({
        errors: [{ message: 'Вы не аворизованы на сайте' }],
      });
    }

    return true;
  }
}
