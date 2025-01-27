import { SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);