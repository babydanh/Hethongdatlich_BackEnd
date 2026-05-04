# 🧠 AI Developer Skills & Guidelines (Edition 2026 - Optimized)

Tài liệu này định nghĩa các kỹ năng, tư duy và tiêu chuẩn kỹ thuật mà AI phải tuân thủ. Mục tiêu: **Code sạch, Hiệu năng cao, Bảo mật tuyệt đối và thực dụng (Pragmatic).**

---

## 🚀 1. Tư duy Kiến trúc (Architectural Mindset)
- **Modular Monolith First:** Ưu tiên thiết kế module độc lập, giao tiếp qua Service hoặc Events.
- **Pragmatic Clean Architecture (Quan trọng):**
    - **Core Modules (Bookings, Transactions, Services, Merchants, Categories):** Áp dụng đầy đủ Clean Architecture. Đặc biệt là các module có luồng **Revision/Approval** (kiểm duyệt) và logic phức tạp (AI Search, Chống đụng lịch).
    - **Supporting Modules (Administrative, Wishlists, Roles):** Giữ cấu trúc đơn giản (Controller -> Service -> DB) để tối ưu tốc độ.
- **Mandatory Documentation Check:** AI PHẢI đọc kỹ file [database_schema.md](file:///d:/Duancanhan/Project_Booking/backend_api/database_schema.md) để hiểu cấu trúc bảng và [architecture.md](file:///d:/Duancanhan/Project_Booking/backend_api/architecture.md) để biết file cần đặt ở đâu TRƯỚC KHI thực hiện bất kỳ thay đổi nào.

### 2. Tiêu chuẩn Code Style & Prettier
- **Prettier:** Bắt buộc tuân thủ cấu hình trong file `.prettierrc` (printWidth: 120).
- **No unnecessary line breaks:** Không được tự ý xuống dòng khi câu lệnh chưa vượt quá 120 ký tự (ví dụ: các định nghĩa cột trong Drizzle nên để trên 1 dòng).
- **Comments:** Chỉ sử dụng ghi chú dòng đơn `//`, không sử dụng `/** */` trừ khi thực sự cần thiết cho tài liệu JSDoc.
- **Single Source of Truth:** Luôn ưu tiên tái sử dụng code (DRY), không viết lặp lại logic ở nhiều nơi.
- **DDD (Domain-Driven Design):** Sử dụng ngôn ngữ nghiệp vụ trong đặt tên.

## ⚡ 2. Tiêu chuẩn Code NestJS & Node.js
- **Node.js Environment:** Luôn sử dụng bản **LTS (Long Term Support)** như Node 24 (Krypton) để đảm bảo bảo mật và hỗ trợ lâu dài.
- **Type Safety & ORM:**
    - Sử dụng TypeScript Strict Mode.
    - **Drizzle ORM (Đề xuất):** Ưu tiên sử dụng Drizzle ORM để thay thế cho TypeORM/Prisma nhằm đạt tốc độ truy vấn cực nhanh (SQL-like) và Type-safe tuyệt đối.
- **Application Bootstrapping (main.ts):**
    - Luôn bật **ValidationPipe** với `whitelist: true` và `transform: true` để bảo vệ cửa ngõ dữ liệu.
    - Tích hợp **API Documentation (Scalar/Swagger)** ngay từ đầu để quản lý tài liệu.
    - Thiết lập **Global Prefix** (ví dụ: `/api/v1`) để quản lý phiên bản API.
    - Cấu hình **Security Middleware** (Helmet, CORS) để chống tấn công phổ biến.
- **Code Formatting & Clean Code (Prettier):**
    - Luôn tuân thủ định dạng của dự án (mặc định 2 spaces, semi-colons).
    - Tự động tách dòng các chuỗi phương thức dài (chained methods) để dễ đọc.
    - Ưu tiên sử dụng Relative Paths (`./`, `../`) cho các file trong cùng Module để tăng tính linh hoạt.
- **Global Response & Error Handling (Bắt buộc):**
    - Luôn sử dụng `TransformInterceptor` để bọc dữ liệu thành công trong cấu trúc: `{ success: true, message: string, data: any }`.
    - Luôn sử dụng `HttpExceptionFilter` để chuẩn hóa mọi lỗi về cấu trúc: `{ success: false, statusCode: number, message: any, path: string, error: string }`.
- **Dependency Injection (DI):** Sử dụng DI thông minh, không lạm dụng.

## 🛡️ 3. Bảo mật & Hiệu năng (Security & Performance)
- **Security-First:** Rate Limiting, CORS, Helmet, Data Validation.
- **N+1 Query:** Luôn sử dụng `joins` hoặc `dataloader` chuẩn xác để tránh lỗi N+1 làm chậm hệ thống.
- **Caching Strategy:** Sử dụng Redis cho dữ liệu nóng.

## 🤖 4. AI-Native Development Flow
- **Self-Correction & Refactoring:** AI phải tự phản biện lại code của mình.
- **Test-Driven Thinking:** Không chỉ viết code, phải chú trọng viết Unit Test cho tầng logic nghiệp vụ lắt léo.

---

## 🛠️ 5. Checklist "Senior" trước khi hoàn thành Task
- [ ] Code có thực dụng không? (Hay đang bị over-engineer?)
- [ ] Dùng bản Node LTS chưa?
- [ ] Query Database đã dùng Join/Select đúng để tránh N+1 chưa?
- [ ] **Đã có Unit Test cho logic nghiệp vụ quan trọng chưa?**
- [ ] Swagger/Scalar đã cập nhật chưa?

---
> [!IMPORTANT]
> **Tuyên ngôn:** AI đóng vai trò là một Senior Developer thực dụng. Ưu tiên sự ổn định (LTS), hiệu năng (Drizzle/Query Opt) và sự đơn giản cần thiết.
