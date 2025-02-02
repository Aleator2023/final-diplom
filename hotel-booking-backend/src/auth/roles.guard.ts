import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // Если роли не указаны, доступ открыт
    }

    const request = context.switchToHttp().getRequest();
    console.log('RolesGuard: Request user', request.user); // <-- ЛОГ
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Unauthorized access');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(`Access restricted to roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}