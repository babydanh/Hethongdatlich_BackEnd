import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Decorator gắn quyền cho API
// Sử dụng: @Roles('admin', 'merchant') trên Controller hoặc Method
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
