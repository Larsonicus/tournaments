import {
  applyDecorators,
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import type { Role } from '../db/schema.js';
import type { AuthUser } from './jwt.strategy.js';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) {
      return true;
    }
    const user = context.switchToHttp().getRequest<Request & { user?: AuthUser }>().user;
    return !!user && roles.includes(user.role);
  }
}

export function Auth(...roles: Role[]): MethodDecorator & ClassDecorator {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(AuthGuard('jwt'), RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Нет или неверный токен' }),
    ...(roles.length ? [ApiForbiddenResponse({ description: 'Недостаточно прав' })] : []),
  );
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser =>
    context.switchToHttp().getRequest<Request & { user: AuthUser }>().user,
);
