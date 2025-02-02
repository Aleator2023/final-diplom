import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('AdminGuard: Checking user', user); // Логирование пользователя

    if (!user) {
      throw new UnauthorizedException(
        'You must be logged in to access this resource',
      );
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Access restricted to administrators');
    }

    return true;
  }
}
