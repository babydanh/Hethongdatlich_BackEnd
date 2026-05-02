# 🌊 Lộ trình phát triển Hệ thống Backend (Implementation Flow)

Tài liệu này chia nhỏ quá trình xây dựng dự án thành từng giai đoạn logic, đảm bảo tính ổn định và khả năng mở rộng.

---

## 🏗️ Giai đoạn 1: Thiết lập nền tảng (Infrastucture)
*Mục tiêu: Đảm bảo App và Database "thông nhau" và có các công cụ bổ trợ cơ bản.*

1.  **Cấu hình biến môi trường (`.env`):** Thiết lập kết nối DB, Secret Key cho JWT.
2.  **Kết nối Database (TypeORM):** Cấu hình `AppModule` để kết nối với Postgres trong Docker.
3.  **Xây dựng Common Core:**
    *   Tạo `HttpExceptionFilter` (Xử lý lỗi chuẩn JSON).
    *   Tạo `TransformInterceptor` (Định dạng dữ liệu trả về thống nhất).
    *   Cấu hình `ValidationPipe` toàn cục (Tự động check dữ liệu đầu vào).
4.  **Tích hợp Swagger:** Để có tài liệu API tự động cập nhật.

---

## 🔐 Giai đoạn 2: Định danh & Bảo mật (Identity & Security)
*Mục tiêu: Xây dựng hệ thống "hộ chiếu" cho toàn bộ app.*

1.  **Module Users:** Tạo bảng users, mã hóa mật khẩu (bcrypt).
2.  **Module Auth:** 
    *   Xử lý Login/Register.
    *   Cấp phát Access Token & Refresh Token (JWT).
3.  **Guards & Decorators:** 
    *   `JwtAuthGuard`: Chặn các request chưa đăng nhập.
    *   `RolesGuard`: Phân quyền (User, Merchant, Admin).
    *   Custom Decorator `@CurrentUser`: Lấy thông tin người dùng đang đăng nhập dễ dàng.

---

## 🗺️ Giai đoạn 3: Dữ liệu hành chính & Danh mục (Administrative)
*Mục tiêu: Chuẩn bị "nguyên liệu" tĩnh cho hệ thống.*

1.  **Module Administrative:** Import dữ liệu Tỉnh/Thành, Quận/Huyện (dùng PostGIS để lưu tọa độ).
2.  **Module Categories:** Quản lý danh mục ngành nghề (Spa, Sân bóng, Khám bệnh...).
3.  **Module Shared Storage:** Tích hợp Cloudinary để upload ảnh cho các giai đoạn sau.

---

## 🏢 Giai đoạn 4: Quản lý Đối tác & Tài nguyên (Merchant & Resources)
*Mục tiêu: Cho phép các chủ tiệm đăng ký và tạo dịch vụ.*

1.  **Module Merchants:** Quản lý thông tin cửa hàng, giờ hoạt động, tọa độ bản đồ.
2.  **Module Resources:** Định nghĩa các tài nguyên có thể book (Sân số 1, Giường số 2, Nhân viên A).
3.  **Module Services:** Tạo các gói dịch vụ (Tên, giá, thời lượng). Tích hợp logic JSONB cho các thuộc tính động.

---

## 📅 Giai đoạn 5: Cỗ máy Đặt lịch & Thanh toán (The Core Engine)
*Mục tiêu: Xử lý phần khó nhất - Chống đụng lịch và dòng tiền.*

1.  **Logic Chống đụng lịch (Availability Check):** Viết query kiểm tra xem Resource có rảnh trong khung giờ khách chọn hay không.
2.  **Module Bookings:** Tạo đơn đặt lịch, tính toán tiền cọc.
3.  **Module Transactions:** Ghi nhận lịch sử nạp tiền, thanh toán, trừ phí sàn (Commission).
4.  **Automated Triggers:** Tự động chuyển trạng thái đơn hàng khi thanh toán thành công.

---

## 💬 Giai đoạn 6: Tương tác & Thông báo (Interactions)
*Mục tiêu: Tăng trải nghiệm người dùng và giữ chân khách hàng.*

1.  **Module Reviews:** Đánh giá sau khi sử dụng dịch vụ (chỉ cho phép sau khi Booking 'Completed').
2.  **Module Notifications:** Gửi thông báo Push hoặc Email (dùng Event Emitter để không làm chậm request chính).
3.  **Module Chat:** Tích hợp WebSockets (Socket.io) để khách và chủ tiệm nhắn tin trực tiếp.

---

## 🤖 Giai đoạn 7: Tối ưu hóa & AI Search (Optimization)
*Mục tiêu: Làm cho hệ thống nhanh và thông minh hơn.*

1.  **Caching (Redis):** Lưu các query nặng (danh sách tỉnh thành, danh mục) vào RAM.
2.  **AI Semantic Search:** Sử dụng `pgvector` để tìm kiếm dịch vụ thông minh theo ý định người dùng.
3.  **Logging & Monitoring:** Ghi lại vết các hành động quan trọng (Audit Trail).

---

## 🚀 Giai đoạn 8: Kiểm thử & Triển khai (Deployment)
*Mục tiêu: Đưa sản phẩm lên môi trường thực tế.*

1.  **E2E Testing:** Viết các kịch bản test luồng đi từ đặt lịch đến thanh toán.
2.  **CI/CD:** Tự động build và deploy khi có code mới.
3.  **Production Readiness:** Cấu hình bảo mật, tối ưu hóa database index lần cuối.

---
> [!IMPORTANT]
> **Chiến thuật triển khai:** Chúng ta sẽ làm theo kiểu **"Xây đến đâu chắc đến đó"**. Xong mỗi giai đoạn sẽ có các API chạy được và có thể test trực tiếp qua Swagger.
