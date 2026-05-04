import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Thiết lập prefix cho tất cả API
  app.setGlobalPrefix('api/v1');

  // 2. Tự động validate dữ liệu đầu vào (DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 3. Cấu hình Swagger Document
  const config = new DocumentBuilder()
    .setTitle('Micro-Booking Platform API')
    .setDescription('Tài liệu API cho hệ thống đặt lịch đa nền tảng')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 4. Tích hợp Scalar UI (Cấu hình chuẩn cho bản 1.1.13)
  app.use(
    '/reference',
    apiReference({
      content: document, // Dùng content trực tiếp, không bọc trong spec
    }),
  );

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 API: http://localhost:3000/api/v1`);
  console.log(`📖 Docs: http://localhost:3000/reference`);
}
bootstrap().catch((err) => {
  console.error('Error during bootstrap:', err);
});
