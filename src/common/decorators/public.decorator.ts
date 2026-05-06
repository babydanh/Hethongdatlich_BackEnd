import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Decorator đánh dấu API không cần đăng nhập (công khai)
// Sử dụng: @Public() trên các API như Login, Register
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
