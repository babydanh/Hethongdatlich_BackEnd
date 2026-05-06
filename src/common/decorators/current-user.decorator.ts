import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Decorator lấy thông tin User đang đăng nhập từ JWT Token
// Sử dụng: @CurrentUser() user trong Controller
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
