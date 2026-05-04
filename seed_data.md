# Master Seed Data (Bản chuẩn 100% theo Schema)

Hệ thống sử dụng `BIGSERIAL` cho ID, nên khi insert bạn có thể để ID tự tăng hoặc điền tay để dễ quản lý liên kết.

## 1. Module Identity & Accounts
```sql
-- 1. Roles
INSERT INTO roles (id, name) VALUES (1, 'admin'), (2, 'merchant'), (3, 'customer');

-- 2. Users (Pass: Password123!)
INSERT INTO users (id, email, phone, password_hash, role_id) VALUES 
(1, 'admin@system.com', '0900000001', '$2b$10$Exv6N.0y8uHqKjE5.u4Qy.Y6A4mUvG9O9XG/Q0U5zI4XW8y6kC5lW', 1),
(2, 'chu_spa@gmail.com', '0901234567', '$2b$10$Exv6N.0y8uHqKjE5.u4Qy.Y6A4mUvG9O9XG/Q0U5zI4XW8y6kC5lW', 2),
(3, 'khach_hang@gmail.com', '0907654321', '$2b$10$Exv6N.0y8uHqKjE5.u4Qy.Y6A4mUvG9O9XG/Q0U5zI4XW8y6kC5lW', 3);

-- 3. Profiles
INSERT INTO profiles (user_id, full_name, gender) VALUES 
(1, 'Quản Trị Viên', 'Other'),
(2, 'Lý Tiểu Long', 'Male'),
(3, 'Trần Thành Danh', 'Male');
```

## 2. Module Merchants & Staffs
```sql
-- 1. Merchants
INSERT INTO merchants (id, owner_id, name, slug, address, phone, is_verified) VALUES 
(1, 2, 'Luxury Spa & Clinic', 'luxury-spa-clinic', '456 Võ Văn Kiệt, Quận 1', '0901112223', true);

-- 2. Staffs (Cho User ID 2 làm Manager của chính tiệm mình)
INSERT INTO merchant_staffs (merchant_id, user_id, role_in_shop) VALUES 
(1, 2, 'manager');
```

## 3. Module Catalog & Services
```sql
-- 1. Categories
INSERT INTO categories (id, name, slug) VALUES 
(1, 'Làm đẹp', 'lam-dep'),
(2, 'Sức khỏe', 'suc-khoe'),
(3, 'Thư giãn', 'thu-gian');

-- 2. Services (base_price, duration_minutes)
INSERT INTO services (id, merchant_id, name, base_price, duration_minutes) VALUES 
(1, 1, 'Gội đầu dưỡng sinh', 150000, 45),
(2, 1, 'Massage đá nóng', 450000, 90);

-- 3. Service Categories (Một dịch vụ thuộc nhiều danh mục)
-- Gội đầu vừa là Làm đẹp (1), vừa là Thư giãn (3)
INSERT INTO service_categories (service_id, category_id) VALUES 
(1, 1), 
(1, 3),
(2, 3);
```

## 4. Module Resources (Tài nguyên chống đụng lịch)
```sql
INSERT INTO resources (id, merchant_id, name, type, capacity) VALUES 
(1, 1, 'Phòng VIP 01', 'room', 2),
(2, 1, 'Kỹ thuật viên Lan', 'staff', 1);
```

---
**Hướng dẫn chạy:**
1. Mở DBeaver, kết nối vào DB.
2. Mở SQL Editor.
3. Paste toàn bộ và nhấn **Execute All**. 
4. Nếu báo lỗi `uuid_generate_v4()`, hãy chạy lệnh này trước: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
