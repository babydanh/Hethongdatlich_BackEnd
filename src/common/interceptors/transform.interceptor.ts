import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// 1. Định nghĩa "cái khuôn" dữ liệu trả về cho toàn hệ thống
export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    // 2. next.handle() trả về một Observable chứa dữ liệu từ Controller
    return next.handle().pipe(
      // 3. Dùng map để biến đổi dữ liệu đó trước khi gửi cho khách
      map((data: T) => ({
        success: true,
        message: 'Thao tác thành công',
        data,
      })),
    );
  }
}
