import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const res = exception instanceof HttpException ? exception.getResponse() : 'Lỗi hệ thống nghiêm trọng';
    const message = typeof res === 'object' ? (res as any).message : res;

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      path: request.url,
      error: exception.name || 'Error',
      timestamp: new Date().toISOString(),
    });
  }
}
