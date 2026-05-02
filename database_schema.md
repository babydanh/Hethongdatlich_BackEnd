# Tài liệu thiết kế Database: Micro-Booking Platform

Đây là tài liệu mô tả cấu trúc cơ sở dữ liệu (Database Schema) cho hệ thống đặt lịch đa nền tảng (Micro-Booking Platform) sử dụng **PostgreSQL**.

## Điểm nhấn công nghệ (Core Features)
1. **AI Semantic Search**: Sử dụng extension `pgvector` để cho phép tìm kiếm ngữ nghĩa (tìm kiếm dịch vụ theo ý định người dùng thay vì chỉ khớp từ khóa).
2. **Dynamic Schema (JSONB)**: Cho phép các tiệm/cửa hàng tự định nghĩa các thuộc tính riêng cho dịch vụ của họ (ví dụ: Spa có loại da, Sân bóng có loại cỏ) mà không cần phải thay đổi cấu trúc bảng.
3. **Soft Delete**: Dữ liệu không bao giờ bị xóa hẳn (dùng cột `deleted_at`) để đảm bảo toàn vẹn lịch sử giao dịch và kế toán.
4. **Kiểm duyệt nội dung chặt chẽ**: Chủ tiệm cập nhật dịch vụ phải qua hệ thống kiểm duyệt (`service_revisions`) trước khi public lên hệ thống.

---

## 1. Module Định danh & Tài khoản (Identity & Accounts)

- **`users`**: Quản lý toàn bộ người dùng trong hệ thống.
  - Một bảng duy nhất phân biệt quyền qua cột `role` ('customer', 'merchant', 'admin').
  - Đăng nhập bằng `phone` hoặc `email`.
- **`merchants`**: Hồ sơ Cửa hàng/Đối tác.
  - Liên kết với `users` qua `owner_id`. Một user (merchant) có thể sở hữu nhiều cửa hàng.
  - Lưu thông tin địa lý (`latitude`, `longitude`) và **giờ hoạt động (operating_hours)**.
  - Hỗ trợ **Gallery (JSONB)** để lưu album ảnh thực tế của cửa hàng từ Cloudinary.
  - Quản lý trạng thái kiểm duyệt (`status`) và chỉ số uy tín (`rating_avg`, `review_count`).
- **`merchant_staffs`**: Quản lý nhân sự của từng cửa hàng.
  - Liên kết giữa `merchants` và `users`. 
  - Cho phép phân quyền nội bộ trong tiệm (Manager, Employee).
- **`merchant_revisions`**: Kiểm duyệt các thay đổi thông tin quan trọng của chủ tiệm (Tên, Địa chỉ, MST).

## 2. Module Dịch vụ & Danh mục (Catalog & Services)

- **`categories`**: Danh mục ngành hàng gốc do Admin quản lý (Làm đẹp, Thể thao,...).
- **`category_requests`**: Nơi các chủ tiệm gửi yêu cầu xin thêm danh mục mới nếu danh mục hiện tại chưa có. Chờ Admin duyệt.
- **`services`**: Bảng lõi chứa các dịch vụ có thể đặt lịch.
  - `attributes` (JSONB): Chứa cấu hình động của dịch vụ.
  - `search_text` & `embedding` (vector): Phục vụ AI Search.
- **`service_categories`**: Một dịch vụ có thể thuộc nhiều danh mục (Ví dụ: Gội đầu thuộc cả danh mục "Làm đẹp" và "Thư giãn").
- **`service_revisions`**: Lưu lại các bản nháp (thêm/sửa/xóa) dịch vụ của chủ tiệm. Khi nào Admin gọi Procedure `approve_service_revision` thì dữ liệu mới được merge vào bảng `services` chính.
- **`resources`**: Quản lý tài nguyên vật lý để chống đụng lịch (Overbooking). 
  - Ví dụ: Thợ cắt tóc, sân bóng, giường Spa. Khách book dịch vụ sẽ chiếm dụng tài nguyên này trong 1 khoảng thời gian.

## 3. Module Giao dịch lõi (Transactions & Bookings)

- **`bookings`**: Đơn đặt lịch.
  - Lưu lại sự kiện khách hàng đặt dịch vụ tại cửa tiệm với tài nguyên cụ thể.
  - Quản lý trạng thái đơn hàng, **trạng thái thanh toán (payment_status)** và tiền cọc.
  - Lưu lý do hủy đơn (`cancel_reason`) và người thực hiện hủy.
- **`booking_history`**: Lưu vết chi tiết lịch sử thay đổi trạng thái của đơn hàng (Audit Trail).
- **`transactions`**: Sổ cái ghi nhận dòng tiền (Nạp, Rút, Thanh toán, Hoàn tiền).
  - Quản lý **phí sàn (commission)** trên từng giao dịch.
  - Hỗ trợ luồng hoàn tiền thông qua `parent_transaction_id`.
  - **Auto-Trigger**: Khi một giao dịch cọc (deposit) thành công, trigger `sync_payment_to_booking` sẽ tự động cập nhật số tiền cọc vào bảng `bookings` và đổi trạng thái đơn thành 'confirmed' (Chốt đơn).

## 4. Module Tương tác & Marketing (Interactions & Marketing)

- **`reviews`**: Hệ thống đánh giá sao và bình luận sau khi sử dụng dịch vụ. Bắt buộc phải gắn với 1 booking đã hoàn thành. Có tính năng "hữu ích" (helpful_count).
- **`promotions`**: Hệ thống Voucher/Mã giảm giá.
  - Nếu `merchant_id` là NULL thì đây là voucher chung của Sàn. Nếu có giá trị thì là voucher riêng của Tiệm.
  - `conditions` (JSONB): Quy định các điều kiện động (ví dụ: chỉ áp dụng từ 9h-11h, chỉ cho KH VIP...).
- **`chat_rooms` & `messages`**: Hệ thống chat 1-1 giữa khách và chủ tiệm để tư vấn trước khi book.
- **`wishlists`**: Danh sách cửa hàng yêu thích của khách.
- **`notifications`**: Lịch sử thông báo Push gửi xuống app.

## 5. Tối ưu hóa hiệu năng (Indexes)

Cơ sở dữ liệu được thiết kế với rất nhiều Index để đảm bảo tốc độ truy vấn ở quy mô lớn:
- **Index HNSW**: `idx_services_embedding` cho phép tìm kiếm vector siêu tốc.
- **Index GIN**: Dùng để tìm kiếm chính xác vào bên trong các field JSONB (`attributes`).
- **B-Tree Index Đa cột**: `idx_bookings_time` (resource_id, start_time, end_time) giúp truy vấn tìm khung giờ rảnh siêu nhanh để chống đụng lịch.
- **Partial Index**: `idx_services_active_visible` chỉ đánh index cho các dịch vụ đang hiển thị, giúp giảm dung lượng RAM.

## 6. Source Code Khởi tạo Database (SQL)

Dưới đây là toàn bộ đoạn code SQL để tạo các bảng, function, trigger và index như đã phân tích ở trên (mình có sửa lại 1 lỗi nhỏ ở bảng `bookings` nơi bạn vô tình để dấu chấm phẩy `;` thay vì dấu phẩy `,`):

```sql
-- ==============================================================================
-- PROJECT: MICRO-BOOKING PLATFORM DATABASE SCHEMA
-- DATABASE ENGINE: POSTGRESQL
-- TÍNH NĂNG NỔI BẬT: AI Semantic Search (pgvector), Dynamic Schema (JSONB)
-- ==============================================================================
SELECT version();
-- Bật các extensions cần thiết cho hệ thống
CREATE EXTENSION IF NOT EXISTS vector;          -- Hỗ trợ AI Search (Tìm kiếm ngữ nghĩa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- Sinh mã định danh an toàn (UID)
CREATE EXTENSION IF NOT EXISTS btree_gist;      -- Hỗ trợ khóa chống đụng độ lịch (Overbooking)
CREATE EXTENSION IF NOT EXISTS postgis;         -- Hỗ trợ PostGIS (geography)
-- Chạy lệnh này trước khi CREATE TABLE merchants
CREATE EXTENSION IF NOT EXISTS pg_sphere;
-- Tắt kiểm tra khóa ngoại để xóa cho sạch
SET session_replication_role = 'replica';

-- Xóa tất cả các bảng bạn đã liệt kê
DROP TABLE IF EXISTS messages, chat_rooms, promotions, reviews, transactions, bookings, 
                     resources, service_revisions, service_categories, services, 
                     category_requests, categories, merchants, profiles, users, roles CASCADE;

-- Bật lại kiểm tra khóa ngoại
SET session_replication_role = 'origin';

-- Kiểm tra extension đã bật chưa (Dành cho Dev chạy test)
SELECT * FROM pg_extension;

-- ==============================================================================
-- PHẦN 1: ĐỊNH DANH & TÀI KHOẢN (IDENTITY & ACCOUNTS)
-- ==============================================================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL -- 'admin', 'merchant', 'customer'
);

INSERT INTO roles (name) VALUES ('admin'), ('merchant'), ('customer'), ('staff');

/*
 * Bảng: users
 * Chức năng: Quản lý toàn bộ tài khoản đăng nhập (Khách, Chủ tiệm, Admin).
 * Lưu ý: Dùng soft-delete (deleted_at) để không làm mất lịch sử giao dịch.
 */
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    uid UUID DEFAULT uuid_generate_v4() UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- Thông tin cá nhân (Dùng chung cho tất cả, tránh bảng users quá nặng)
CREATE TABLE profiles (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    dob DATE, -- Ngày sinh
    gender VARCHAR(10),
    bio TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

/*
 * Bảng: merchants
 * Chức năng: Lưu hồ sơ Cửa hàng/Đối tác. Một User (owner_id) có thể có nhiều Cửa hàng.
 */
CREATE TABLE provinces (
    code INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    code_name VARCHAR(255)
);

CREATE TABLE districts (
    code INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    code_name VARCHAR(255),
    province_code INTEGER REFERENCES provinces(code)
);

CREATE TABLE wards (
    code INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    code_name VARCHAR(255),
    district_code INTEGER REFERENCES districts(code)
);

CREATE TABLE merchants (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    tax_code VARCHAR(50),
    phone VARCHAR(20),
    address TEXT,
    location geography(POINT, 4326),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    logo_url TEXT,
    banner_url TEXT,
    gallery JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    operating_hours JSONB DEFAULT '{}'::jsonb,
    
    is_verified BOOLEAN DEFAULT FALSE,
    rating_avg DECIMAL(3, 2) DEFAULT 0,
    review_count INT DEFAULT 0,
    
    province_id INTEGER REFERENCES provinces(code),
    district_id INTEGER REFERENCES districts(code),
    ward_id INTEGER REFERENCES wards(code),
    
    status VARCHAR(20) DEFAULT 'pending',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- Bảng: merchant_revisions
-- Chức năng: Kiểm duyệt các thay đổi thông tin quan trọng của chủ tiệm.
CREATE TABLE merchant_revisions (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT REFERENCES merchants(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

/*
 * Bảng: merchant_staffs
 * Chức năng: Quản lý nhân sự trong cửa hàng. Cho phép một User làm nhân viên của tiệm.
 */
CREATE TABLE merchant_staffs (
    id BIGSERIAL PRIMARY KEY,
    merchant_id BIGINT REFERENCES merchants(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    role_in_shop VARCHAR(50) DEFAULT 'employee', -- 'manager', 'employee'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(merchant_id, user_id) -- Một người chỉ làm 1 chức vụ ở 1 tiệm
);

-- ==============================================================================
-- PHẦN 2: HỆ SINH THÁI DỊCH VỤ & DANH MỤC (CATALOG & SERVICES)
-- ==============================================================================

/*
 * Bảng: categories
 * Chức năng: Danh mục gốc của toàn sàn (Admin quản lý).
 */
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    uid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(255) NOT NULL,          
    slug VARCHAR(255) UNIQUE NOT NULL,   -- VD: lam-dep, the-thao (Dùng cho URL SEO)
    icon_url TEXT,                       
    banner_url TEXT,                     
    is_active BOOLEAN DEFAULT TRUE,
    
    deleted_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

/*
 * Bảng: category_requests
 * Chức năng: Khu vực chờ duyệt (Staging). Đối tác xin thêm danh mục mới sẽ nằm ở đây.
 */
CREATE TABLE category_requests (
    id BIGSERIAL PRIMARY KEY,
    uid UUID DEFAULT uuid_generate_v4() UNIQUE,
    merchant_id BIGINT REFERENCES merchants(id) ON DELETE CASCADE,
    requested_name VARCHAR(255) NOT NULL, 
    reason TEXT, 
    status VARCHAR(20) DEFAULT 'pending', -- 'pending' (chờ), 'approved' (duyệt), 'rejected' (từ chối), 'merged' (gộp)
    resolved_category_id BIGINT REFERENCES categories(id) NULL, -- Trỏ về ID chính thức sau khi được Admin duyệt
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

/*
 * Bảng: services
 * Chức năng: Dịch vụ cụ thể của từng cửa hàng.
 * Công nghệ lõi: JSONB (Dữ liệu động) và Vector (AI Search).
 */
CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    uid UUID DEFAULT uuid_generate_v4() UNIQUE,
    merchant_id BIGINT REFERENCES merchants(id) ON DELETE CASCADE,               
    name VARCHAR(255) NOT NULL,
    base_price DECIMAL(12, 2) NOT NULL,
    duration_minutes INT NOT NULL,      
    
    image_urls JSONB DEFAULT '[]'::jsonb, -- Album ảnh dịch vụ
    attributes JSONB DEFAULT '{}'::jsonb, 
    
    search_text TEXT,                                  
    embedding vector(1536),             
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL         
);

/*
 * Bảng: service_categories (Pivot Table Nhiều-Nhiều)
 * Chức năng: Cho phép 1 dịch vụ (Gội đầu) xuất hiện ở nhiều danh mục (Làm đẹp, Thư giãn).
 */
CREATE TABLE service_categories (
    service_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (service_id, category_id)
);

/*
 * Bảng: service_revisions
 * Chức năng: Kiểm duyệt nội dung 100%. Chủ tiệm muốn thêm, sửa, xóa dịch vụ đều phải lưu Payload JSON vào đây chờ Admin duyệt.
 */
CREATE TABLE service_revisions (
    id BIGSERIAL PRIMARY KEY,
    uid UUID DEFAULT uuid_generate_v4() UNIQUE,
    merchant_id BIGINT REFERENCES merchants(id) ON DELETE CASCADE,
    service_id BIGINT REFERENCES services(id) ON DELETE CASCADE, -- NULL nếu là lệnh xin Tạo mới (CREATE)
    
    action_type VARCHAR(20) NOT NULL,     -- 'CREATE', 'UPDATE', 'DELETE'
    payload JSONB NOT NULL,               -- Toàn bộ data cấu hình dịch vụ nằm trong này
    
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    admin_note TEXT,                      -- Phản hồi của Admin khi từ chối
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

/*
 * Bảng: resources
 * Chức năng: Quản lý tài nguyên vật lý có thể book (Thợ làm tóc, Sân bóng số 1, Giường Spa).
 */
CREATE TABLE resources (
    id BIGSERIAL PRIMARY KEY,
    uid UUID DEFAULT uuid_generate_v4() UNIQUE,
    merchant_id BIGINT REFERENCES merchants(id) ON DELETE CASCADE,
    image_url TEXT,
    name VARCHAR(255) NOT NULL,         
    type VARCHAR(50) NOT NULL,          
    capacity INT DEFAULT 1,             -- Sức chứa (mặc định 1 người)
    attributes JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL         
);

-- ==============================================================================
-- PHẦN 3: GIAO DỊCH LÕI (TRANSACTIONS & BOOKINGS)
-- ==============================================================================

/*
 * Bảng: bookings
 * Chức năng: Đơn đặt lịch. Nơi dòng tiền và thời gian gặp nhau.
 */
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    uid UUID DEFAULT uuid_generate_v4() UNIQUE, 
    customer_id BIGINT REFERENCES users(id),
    merchant_id BIGINT REFERENCES merchants(id),
    service_id BIGINT REFERENCES services(id),
    resource_id BIGINT REFERENCES resources(id),
    
    start_time TIMESTAMPTZ NOT NULL,    
    end_time TIMESTAMPTZ NOT NULL,      
    attributes JSONB DEFAULT '{}'::jsonb,
    
    total_price DECIMAL(12, 2) NOT NULL,
    deposit_amount DECIMAL(12, 2) DEFAULT 0, 
    
    status VARCHAR(20) DEFAULT 'pending', 
    payment_status VARCHAR(20) DEFAULT 'unpaid', -- Trạng thái thanh toán
    
    cancel_reason TEXT,                 -- Lý do hủy
    cancelled_by BIGINT REFERENCES users(id), -- ID người hủy
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL         
);

-- Bảng: booking_history (Lưu vết thay đổi trạng thái)
CREATE TABLE booking_history (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
    changed_by BIGINT REFERENCES users(id),
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

/*
 * Bảng: transactions
 * Chức năng: Sổ cái kế toán (Ledger). Lưu vết mọi giao dịch nạp, rút, thanh toán, hoàn tiền.
 */
CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    uid UUID DEFAULT uuid_generate_v4() UNIQUE,
    booking_id BIGINT REFERENCES bookings(id),
    user_id BIGINT REFERENCES users(id),       
    
    amount DECIMAL(12, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) DEFAULT 0,   -- Tỷ lệ phí sàn
    commission_amount DECIMAL(12, 2) DEFAULT 0, -- Số tiền phí sàn thu
    
    transaction_type VARCHAR(20) NOT NULL,     
    payment_method VARCHAR(50),                
    
    status VARCHAR(20) DEFAULT 'pending',      
    gateway_transaction_id VARCHAR(255),       
    parent_transaction_id BIGINT REFERENCES transactions(id), -- Liên kết hoàn tiền
    
    attributes JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL                
);

-- ==============================================================================
-- PHẦN 4: TƯƠNG TÁC, MARKETING & TIỆN ÍCH (INTERACTIONS & UTILITIES)
-- ==============================================================================

/*
 * Bảng: reviews
 * Chức năng: Đánh giá sau khi sử dụng dịch vụ. Bắt buộc phải gắn với 1 booking hoàn thành.
 */
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    uid UUID DEFAULT uuid_generate_v4() UNIQUE,
    booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id BIGINT REFERENCES users(id),
    merchant_id BIGINT REFERENCES merchants(id),
    
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    content TEXT,
    media_urls JSONB DEFAULT '[]'::jsonb,      
    
    status VARCHAR(20) DEFAULT 'approved',     -- Kiểm duyệt: approved, hidden, reported
    helpful_count INT DEFAULT 0,               
    merchant_reply TEXT,                       
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL                
);

/*
 * Bảng: promotions
 * Chức năng: Hệ thống Voucher. Dùng chung cho cả Sàn (App) và Shop (Chủ tiệm).
 */
CREATE TABLE promotions (
    id BIGSERIAL PRIMARY KEY,
    uid UUID DEFAULT uuid_generate_v4() UNIQUE,
    merchant_id BIGINT REFERENCES merchants(id) NULL, 
    
    banner_url TEXT,
    code VARCHAR(50) UNIQUE NOT NULL,          
    discount_type VARCHAR(20) NOT NULL,        
    discount_value DECIMAL(12, 2) NOT NULL, 
    
    max_discount_amount DECIMAL(12, 2),        
    min_order_value DECIMAL(12, 2) DEFAULT 0,
    
    usage_limit INT,                           
    usage_limit_per_user INT DEFAULT 1,        -- Giới hạn mỗi người dùng
    used_count INT DEFAULT 0,
    
    conditions JSONB DEFAULT '{}'::jsonb,      
    
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    
    is_public BOOLEAN DEFAULT TRUE,            -- Hiển thị công khai hay mã riêng
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL                
);

/*
 * Bảng: chat_rooms & messages
 * Chức năng: Hộp thoại trao đổi 1-1 giữa Khách hàng và Chủ tiệm.
 */
CREATE TABLE chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    uid UUID DEFAULT uuid_generate_v4() UNIQUE,
    customer_id BIGINT REFERENCES users(id),
    merchant_id BIGINT REFERENCES merchants(id),
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, merchant_id) 
);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id BIGINT REFERENCES users(id), 
    
    message_type VARCHAR(20) DEFAULT 'text',   -- 'text', 'image', 'booking_card'
    content TEXT,
    
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL    
);

/*
 * Bảng: wishlists
 * Chức năng: Lưu trữ tiệm yêu thích để chạy tiếp thị lại (Retargeting).
 */
CREATE TABLE wishlists (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    merchant_id BIGINT REFERENCES merchants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, merchant_id) 
);

/*
 * Bảng: notifications
 * Chức năng: Lưu trữ lịch sử Push Notification bắn xuống thiết bị.
 */
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    uid UUID DEFAULT uuid_generate_v4() UNIQUE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50),                          -- 'system', 'promotion', 'booking_status'
    related_id BIGINT,                         -- ID liên kết để bấm vào nhảy tới đúng màn hình (VD: Mã đơn hàng)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_services BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_bookings BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_merchants BEFORE UPDATE ON merchants FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_resources BEFORE UPDATE ON resources FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_transactions BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_reviews BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_promotions BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_messages BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_notifications BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Tự động cập nhật cột PostGIS location khi latitude/longitude thay đổi
CREATE OR REPLACE FUNCTION sync_merchant_location()
RETURNS TRIGGER AS $$
BEGIN
    -- Nếu latitude hoặc longitude thay đổi (hoặc được thêm mới)
    IF (NEW.latitude IS DISTINCT FROM OLD.latitude OR NEW.longitude IS DISTINCT FROM OLD.longitude OR TG_OP = 'INSERT') THEN
        IF (NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL) THEN
            NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
        ELSE
            NEW.location = NULL;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_merchant_location
BEFORE INSERT OR UPDATE ON merchants
FOR EACH ROW
EXECUTE FUNCTION sync_merchant_location();

-- 1. Tìm kiếm ngữ nghĩa bằng AI (Cực kỳ quan trọng để chạy nhanh)
CREATE INDEX idx_services_embedding ON services USING hnsw (embedding vector_cosine_ops);

-- 2. Tìm kiếm chính xác vào trong các thuộc tính động
CREATE INDEX idx_services_attributes ON services USING GIN (attributes);
CREATE INDEX idx_bookings_attributes ON bookings USING GIN (attributes);
CREATE INDEX idx_resources_attributes ON resources USING GIN (attributes);

-- 3. Cực kỳ quan trọng: Tìm nhanh các khung giờ trống của Sân/Thợ để chống đụng lịch
CREATE INDEX idx_bookings_time ON bookings (resource_id, start_time, end_time);

-- 4. Tìm các yêu cầu đang chờ duyệt nhanh chóng cho Admin
CREATE INDEX idx_category_req_status ON category_requests (status);
CREATE INDEX idx_service_rev_status ON service_revisions (status);

-- 5. Lọc danh sách giao dịch theo trạng thái (thành công/thất bại)
CREATE INDEX idx_transactions_status ON transactions (status);

-- 6. Tìm dịch vụ theo danh mục (Sửa lỗi cho bảng trung gian)
CREATE INDEX idx_svc_cat_category ON service_categories (category_id);

-- 7. Load danh sách dịch vụ của một tiệm
CREATE INDEX idx_services_merchant ON services (merchant_id);

-- 8. Load danh sách đơn hàng cho Khách và cho Chủ tiệm
CREATE INDEX idx_bookings_customer ON bookings (customer_id);
CREATE INDEX idx_bookings_merchant ON bookings (merchant_id);
CREATE INDEX idx_bookings_payment_status ON bookings (payment_status);

-- 9. Load danh sách đánh giá của một tiệm
CREATE INDEX idx_reviews_merchant ON reviews (merchant_id);

-- 10. Tìm phòng chat chứa tin nhắn
CREATE INDEX idx_messages_room ON messages (room_id);

-- 11. Load danh sách thông báo mới nhất cho User (Sắp xếp giảm dần)
CREATE INDEX idx_notifications_user_time ON notifications (user_id, created_at DESC);

-- 12. Load tin nhắn mới nhất trong khung chat (Sắp xếp giảm dần)
CREATE INDEX idx_messages_room_time ON messages (room_id, created_at DESC);

-- 13. Lịch sử đơn hàng và kiểm duyệt
CREATE INDEX idx_booking_history_booking_id ON booking_history (booking_id);
CREATE INDEX idx_merchant_revisions_status ON merchant_revisions (status);

-- 14. [Nâng cao] Partial Index: Chỉ index những dịch vụ ĐANG BẬT và CHƯA BỊ XÓA
CREATE INDEX idx_services_active_visible ON services (merchant_id) 
WHERE is_active = TRUE AND deleted_at IS NULL;

-- 15. Sắp xếp tiệm theo đánh giá
CREATE INDEX idx_merchants_rating ON merchants (rating_avg DESC);
```
