# 🚀 Lộ trình phát triển Hệ thống Đặt lịch (Micro-Booking Platform)

## 🏗️ Kiến trúc Hệ thống (System Architecture) - [Đã nâng cấp]
Dự án đã được chuyển đổi sang mô hình **OOP (Object-Oriented Programming)** chuyên nghiệp:
- **Database Wrapper:** Sử dụng Class `Database` (Singleton) để quản lý kết nối tập trung.
- **Base Model:** Mọi Model đều kế thừa từ `BaseModel.js` để sử dụng các hàm CRUD động (Dynamic SQL).
- **Base Controller:** Thống nhất cấu trúc phản hồi (Response) JSON và xử lý phân trang chung.
- **Dependency Injection:** Controller nhận Model qua constructor, Model nhận DB qua constructor.
- **Database Trigger:** Tự động hóa việc đồng bộ tọa độ (PostGIS) và timestamp (`updated_at`).

---

# 🚀 Lộ trình phát triển & Bản đồ API (CRUD Plan)

Tài liệu quản lý tiến độ, vị trí file và nghiệp vụ lõi của hệ thống.
> **Chuẩn ảnh:** Mọi upload ảnh đều dùng **Cloudinary SDK**, chỉ lưu URL vào DB.

**Trạng thái:** `[x]` = Có route + model | `[~]` = Có model nhưng thiếu route/controller | `[ ]` = Chưa có

---

## ⚪ Giai đoạn 0: Administrative (Địa lý) - [✅ HOÀN TẤT]

- 📂 `locationModel.js` | `locationController.js` | `locationRoutes.js`
- [x] `GET /api/locations/provinces`
- [x] `GET /api/locations/districts/:province_id`
- [x] `GET /api/locations/wards/:district_id`
- Script: `node src/scripts/sync_locations.js` (Axios → provinces.open-api.vn → DB)

---

## 🟢 Giai đoạn 1: Identity (Tài khoản & Hồ sơ) - [✅ HOÀN TẤT | ⚠️ Thiếu 2 route]

- 📂 `userModel.js` | `authModel.js` | `userController.js` | `authController.js`
- [x] `POST /api/auth/register` — Tạo user + profile cùng lúc.
- [x] `POST /api/auth/login` — JWT, trả về role để FE điều hướng.
- [x] `GET  /api/users/me` — Xem thông tin + profile.
- [x] `PATCH /api/users/me` — Cập nhật profile (avatar_url, bio, dob, gender).
- [x] `PATCH /api/users/me/password` — Đổi mật khẩu.
- [x] `DELETE /api/users/:id` — (Admin) Soft delete tài khoản.
- [x] `GET  /api/users/all` — (Admin) Danh sách user có phân trang + search.
- [x] `GET  /api/users/:id` — (Admin) Xem chi tiết một user.
- [ ] `POST /api/auth/refresh-token` — **Cần bổ sung:** Làm mới JWT khi hết hạn.
- [ ] `POST /api/auth/logout` — **Cần bổ sung:** Vô hiệu hóa token phía server.

---

## 🔵 Giai đoạn 2: Merchant & Staff (Đối tác) - [✅ HOÀN TẤT]

- 📂 `merchantModel.js` | `merchantController.js` | `merchantRoutes.js`
- 📂 `staffModel.js` | `staffController.js` | `staffRoutes.js`

**Luồng Onboarding:** Đăng ký → `pending` → Admin approve → `active`

**Luồng Cập nhật:**
- Thông tin vận hành (logo, banner, gallery, hours, phone) → Cập nhật **ngay**.
- Thông tin nhạy cảm (name, address, tax_code, lat/lng) → Gửi `merchant_revisions` → Admin duyệt.

**APIs Merchant:**
- [x] `POST /api/merchants/onboard` — Đăng ký tiệm (status = `pending`).
- [x] `GET  /api/merchants/me` — Xem tiệm của mình.
- [x] `PATCH /api/merchants/me` — Cập nhật tiệm (vận hành).
- [x] `POST /api/merchants/me/revision` — Gửi yêu cầu thay đổi nhạy cảm vào `merchant_revisions`.
- [x] `GET  /api/merchants/me/revisions` — Xem lịch sử revision của tiệm mình.
- [x] `GET  /api/admin/merchant-revisions` — Admin xem danh sách chờ duyệt.
- [x] `POST /api/admin/merchant-revisions/:id/approve` — Admin duyệt và áp dữ liệu.
- [x] `POST /api/admin/merchant-revisions/:id/reject` — Admin từ chối + admin_note.
- [x] `PATCH /api/merchants/:id/status` — (Admin) Duyệt/Khóa.

**APIs Staff:**
- [x] `POST /api/staffs` — Thêm nhân viên (role_in_shop: manager/employee).
- [x] `GET  /api/staffs` — Danh sách nhân viên của tiệm.
- [x] `DELETE /api/staffs/:id` — Xóa nhân viên.

**APIs Staff (Cần bổ sung):**
- [ ] `PATCH /api/staffs/:id` — Cập nhật role_in_shop của nhân viên.

---

## 🟡 Giai đoạn 3: Catalog (Danh mục & Dịch vụ) - [✅ HOÀN TẤT | ⚠️ Thiếu 2 route]

- 📂 `categoryModel.js` | `serviceModel.js` | `resourceModel.js`

**APIs Category (Đã có):**
- [x] `GET  /api/categories` — Danh mục công khai.
- [x] `POST /api/categories` — (Admin) Tạo danh mục.
- [x] `PATCH /api/categories/:id` — (Admin) Sửa danh mục.
- [x] `DELETE /api/categories/:id` — (Admin) Ẩn danh mục (soft delete).
- [x] `POST /api/categories/request` — Merchant gửi yêu cầu thêm danh mục.
- [x] `GET  /api/admin/category-requests?status=...` — Admin xem danh sách.
- [x] `POST /api/admin/category-requests/:id/approve` — Admin duyệt (có thể merge).
- [x] `POST /api/admin/category-requests/:id/reject` — Admin từ chối.

**APIs Service (Đã có):**
- [x] `POST /api/services/request` — Merchant gửi yêu cầu CREATE/UPDATE/DELETE.
- [x] `GET  /api/admin/revisions?status=...` — Admin xem danh sách revision.
- [x] `POST /api/admin/revisions/:id/approve` — Admin duyệt (transaction an toàn).
- [x] `POST /api/admin/revisions/:id/reject` — Admin từ chối.
- [x] `GET  /api/services/merchant/:id` — Xem dịch vụ của tiệm (Public).

**APIs Service (Cần bổ sung):**
- [ ] `GET  /api/services/:id` — Chi tiết 1 dịch vụ (bao gồm attributes, image_urls).

**APIs Resource (Đã có):**
- [x] `POST /api/resources` — Thêm tài nguyên (name, type, capacity, image_url).
- [x] `GET  /api/resources` — Danh sách tài nguyên của tiệm mình.
- [x] `DELETE /api/resources/:id` — Soft delete tài nguyên.
- [x] `GET  /api/resources/available-slots?date=...&resource_id=...` — Kiểm tra giờ trống.
- [x] `PATCH /api/resources/:id` — Cập nhật thông tin tài nguyên (capacity, name, is_active).

---

## 🔴 Giai đoạn 4: Bookings (Đặt lịch) - [✅ HOÀN TẤT]

- 📂 `bookingModel.js` | `bookingController.js` | `bookingRoutes.js`

**APIs Booking:**
- [x] `POST /api/bookings` — Tạo đơn.
- [x] `GET  /api/bookings/:id` — Chi tiết đơn.
- [x] `POST /api/bookings/:id/cancel` — Hủy đơn kèm lý do.
- [x] `GET  /api/bookings/:id/history` — Xem lịch sử trạng thái (Audit Trail).

---

## 🟠 Giai đoạn 5: Transactions & Finance - [✅ HOÀN TẤT]

- 📂 `transactionModel.js` | `transactionController.js` | `transactionRoutes.js`
- [x] `POST /api/transactions/deposit` — Thanh toán cọc & Auto confirm.
- [x] `GET  /api/transactions/me` — Lịch sử giao dịch.
- [x] `GET  /api/admin/finance/stats` — Thống kê phí sàn.

---

## 🟣 Giai đoạn 6: Interactions & Marketing - [✅ Cơ bản | ⚠️ Thiếu Moderation]

**APIs Review (Đã có):**
- 📂 `reviewModel.js` | `reviewController.js` | `reviewRoutes.js`
- [x] `POST /api/reviews` — Đánh giá (bắt buộc booking completed, media_urls Cloudinary).
- [x] `GET  /api/reviews/merchant/:id` — Danh sách đánh giá của tiệm (Public).
- [x] `PATCH /api/reviews/:id/reply` — Merchant phản hồi đánh giá.

**APIs Review (Cần bổ sung):**
- [ ] `POST /api/reviews/:id/report` — Khách báo cáo review (status = `reported`).
- [ ] `GET  /api/admin/reviews?status=reported` — Admin xem review bị báo cáo.
- [ ] `PATCH /api/admin/reviews/:id/status` — Admin ẩn/hiện review (`hidden`/`approved`).

**APIs Promotion (Đã có):**
- 📂 `promotionModel.js` | `promotionController.js` | `promotionRoutes.js`
- [x] `POST /api/promotions` — Tạo Voucher (Admin hoặc Merchant).
- [x] `GET  /api/promotions/available` — Danh sách Voucher còn hiệu lực.
- [x] `POST /api/promotions/apply` — Kiểm tra & áp mã vào đơn hàng.

**APIs Chat (Đã có):**
- 📂 `chatModel.js` | `chatController.js` | `chatRoutes.js`
- [x] `POST /api/chat/rooms` — Tạo/lấy phòng chat giữa khách & tiệm.
- [x] `GET  /api/chat/rooms` — Danh sách phòng chat (sorted by last_message_at).
- [x] `POST /api/chat/messages` — Gửi tin nhắn (text/image/booking_card).
- [x] `GET  /api/chat/messages/:room_id` — Lấy tin nhắn trong phòng (phân trang).

**APIs Wishlist & Notification (Cần xây dựng mới):**
- [ ] Tạo `wishlistModel.js`, `wishlistController.js`, `wishlistRoutes.js`
- [ ] `POST /api/wishlists` — Lưu tiệm yêu thích.
- [ ] `GET  /api/wishlists` — Danh sách tiệm yêu thích.
- [ ] `DELETE /api/wishlists/:merchant_id` — Bỏ tiệm yêu thích.
- [x] Rà soát và đồng bộ 100% Code với Database Schema SQL (Dòng 75-603).
- [x] Fix toàn bộ lỗi crash server (ReferenceError, SyntaxError, MODULE_NOT_FOUND).
- [x] Tối ưu hóa API Response và thông báo tiếng Việt.
- [x] Xử lý trùng lịch (Overbooking) và Logic Tài chính (Transactions).
- [ ] Tạo `notificationModel.js`, `notificationController.js`, `notificationRoutes.js`
- [ ] `GET  /api/notifications` — Danh sách thông báo (mới nhất trước).
- [ ] `PATCH /api/notifications/:id/read` — Đánh dấu đã đọc.
- [ ] `POST /api/notifications/read-all` — Đánh dấu tất cả đã đọc.

---

## ⭐ Giai đoạn 7: AI Search - [🏗️ CHƯA BẮT ĐẦU]

- [ ] Tạo `searchModel.js` | `searchController.js` | `searchRoutes.js`
- [ ] `GET  /api/search?q=...` — Fulltext search (dùng cột `search_text`).
- [ ] `POST /api/search/ai` — Semantic Search: Query → Vector (OpenAI/Gemini) → HNSW Index.

---

> [!IMPORTANT]
> **3 file cần tạo mới ngay:** `transactionModel.js`, `wishlistModel.js`, `notificationModel.js`
> **Merchant Revision flow** là tính năng nghiệp vụ quan trọng nhất chưa có code thực tế.
