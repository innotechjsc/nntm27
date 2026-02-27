# Hướng dẫn đấu nối API - AviVerse Nông nghiệp Thông minh

## Mục lục
1. [Tổng quan](#1-tổng-quan)
2. [Cơ sở hạ tầng](#2-cơ-sở-hạ-tầng)
3. [Xác thực (Authentication)](#3-xác-thực-authentication)
4. [Danh sách API chi tiết](#4-danh-sách-api-chi-tiết)
5. [Mã lỗi và xử lý](#5-mã-lỗi-và-xử-lý)
6. [Ví dụ tích hợp](#6-ví-dụ-tích-hợp)

---

## 1. Tổng quan

### 1.1 Base URL
```
Development: http://localhost:4201
Production:  [Cấu hình theo môi trường]
```

### 1.2 Swagger UI
Truy cập tài liệu API tương tác tại:
```
http://localhost:4201/api-docs
```

### 1.3 Định dạng
- **Request/Response**: JSON
- **Content-Type**: `application/json`
- **Charset**: UTF-8

### 1.4 Cấu trúc phản hồi chung
```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "message": "Mô tả (khi có lỗi)"
}
```

---

## 2. Cơ sở hạ tầng

### 2.1 Kiểm tra API
```http
GET /health
```
**Response 200:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-02-11T10:00:00.000Z"
}
```

### 2.2 CORS
API hỗ trợ CORS. Cấu hình `CORS_ORIGIN` trong file `.env`:
```
CORS_ORIGIN=http://localhost:4201,http://localhost:4202,http://localhost:4203,http://localhost:5173
```

---

## 3. Xác thực (Authentication)

### 3.1 Cơ chế JWT Bearer Token
Hầu hết các API yêu cầu xác thực qua **Bearer Token** trong header:
```http
Authorization: Bearer <your-jwt-token>
```

### 3.2 Đăng ký tài khoản
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "Password123!",
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "role": "FARMER",
  "walletAddress": "0x..."
}
```
**Roles:** `FARMER`, `INVESTOR`, `ADMIN`, `DISTRIBUTOR`, `PROCESSOR`  
**Response 201:** Trả về `token` và thông tin `user`.

### 3.3 Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "farmer@example.com",
  "password": "Password123!"
}
```
**Response 200:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "farmer@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "FARMER",
    "phone": "0901234567"
  }
}
```

### 3.4 Lấy thông tin user hiện tại
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### 3.5 Lưu trữ Token
- Lưu token an toàn (ví dụ: httpOnly cookie, secure storage).
- Token hết hạn theo cấu hình `JWT_EXPIRE` (mặc định 7 ngày).
- Khi nhận 401, cần đăng nhập lại và lấy token mới.

---

## 4. Danh sách API chi tiết

### 4.1 API Công khai (Không cần token)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/health` | Kiểm tra API |
| POST | `/api/auth/register` | Đăng ký |
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/public/plots` | Danh sách lô công khai (landing) |
| GET | `/api/public/stats` | Thống kê công khai (plotsCount, farmsCount, harvestHistory...) |
| GET | `/api/public/featured-farms` | Trang trại nổi bật (landing) |
| GET | `/api/public/products` | Sản phẩm công khai (landing) |
| GET | `/api/public/regions-summary` | Tổng quan tỉnh có trang trại (landing) |
| GET | `/api/farms` | Danh sách trang trại |
| GET | `/api/farms/:id` | Chi tiết trang trại |

**Landing – chi tiết API công khai:**
- **GET /api/public/stats** – Trả về: `plotsCount`, `harvestsCount`, `ordersCount`, `farmsCount`, `activeSeasonsCount`, `productsCount`, `totalRevenue`, `harvestHistory[]`.
- **GET /api/public/plots?limit=6** – Lô đất đang hoạt động, kèm farm, humidity, growth (demo).
- **GET /api/public/featured-farms?limit=6** – Trang trại ACTIVE, kèm region, số lô.
- **GET /api/public/products?limit=8** – Sản phẩm isActive (name, price, category, certifications).
- **GET /api/public/regions-summary** – `provincesCount`, `provinces[]` (name, code, farmsCount) để hiển thị "Phủ sóng X tỉnh".
| GET | `/api/plots` | Danh sách lô đất |
| GET | `/api/plots/:id` | Chi tiết lô đất |
| GET | `/api/regions` | Danh sách khu vực |
| GET | `/api/regions/:id` | Chi tiết khu vực |
| GET | `/api/seasons` | Danh sách mùa vụ |
| GET | `/api/seasons/:id` | Chi tiết mùa vụ |
| GET | `/api/seasons/:id/growth-progress` | Tiến độ sinh trưởng |
| GET | `/api/tasks` | Danh sách nhiệm vụ |
| GET | `/api/tasks/:id` | Chi tiết nhiệm vụ |
| GET | `/api/crops` | Danh mục cây trồng |
| GET | `/api/crops/:id` | Chi tiết cây trồng |
| GET | `/api/seeds` | Danh mục giống |
| GET | `/api/seeds/:id` | Chi tiết giống |
| GET | `/api/products` | Danh sách sản phẩm |
| GET | `/api/products/:id` | Chi tiết sản phẩm |

### 4.2 API yêu cầu xác thực

#### Quản lý người dùng (ADMIN)
| Method | Endpoint | Quyền |
|--------|----------|-------|
| GET | `/api/users` | ADMIN |
| GET | `/api/users/:id` | ADMIN |
| PUT | `/api/users/:id` | ADMIN |
| DELETE | `/api/users/:id` | ADMIN |

#### Khu vực (Regions)
| Method | Endpoint | Quyền |
|--------|----------|-------|
| POST | `/api/regions` | ADMIN |
| PUT | `/api/regions/:id` | ADMIN |
| DELETE | `/api/regions/:id` | ADMIN |

#### Trang trại (Farms)
| Method | Endpoint | Quyền |
|--------|----------|-------|
| POST | `/api/farms` | FARMER, ADMIN |
| PUT | `/api/farms/:id` | Owner, ADMIN |
| DELETE | `/api/farms/:id` | Owner, ADMIN |

**Body tạo trang trại:**
```json
{
  "name": "Trang trại A",
  "regionId": "uuid",
  "address": "Xã ABC, Huyện XYZ",
  "latitude": 10.5,
  "longitude": 106.5,
  "totalArea": 5000,
  "description": "Mô tả",
  "certification": ["VietGAP"],
  "status": "PENDING"
}
```
**Status:** `PENDING`, `ACTIVE`, `SUSPENDED`, `CLOSED`

#### Lô đất (Plots)
| Method | Endpoint | Quyền |
|--------|----------|-------|
| POST | `/api/plots` | FARMER, ADMIN |
| PUT | `/api/plots/:id` | Owner, ADMIN |
| DELETE | `/api/plots/:id` | Owner, ADMIN |

**Body tạo lô đất (GeoJSON Polygon):**
```json
{
  "farmId": "uuid",
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [106.5, 10.5],
        [106.51, 10.5],
        [106.51, 10.51],
        [106.5, 10.51],
        [106.5, 10.5]
      ]
    ]
  },
  "name": "Lô 1",
  "cropType": "Xoài",
  "soilType": "Đất đỏ bazan",
  "waterSource": "Giếng khoan"
}
```
**Lưu ý:** Polygon phải khép kín, tối thiểu 3 điểm, diện tích ≥ 100 m².

#### Mùa vụ (Seasons)
| Method | Endpoint | Quyền |
|--------|----------|-------|
| POST | `/api/seasons` | FARMER, ADMIN |
| PUT | `/api/seasons/:id` | Owner, ADMIN |
| DELETE | `/api/seasons/:id` | Owner, ADMIN |

#### Nhiệm vụ (Tasks)
| Method | Endpoint | Quyền |
|--------|----------|-------|
| POST | `/api/tasks` | FARMER, ADMIN |
| POST | `/api/tasks/suggest` | FARMER, ADMIN |
| PUT | `/api/tasks/:id` | Owner, ADMIN |
| DELETE | `/api/tasks/:id` | Owner, ADMIN |

#### Cây trồng & Giống (Crops, Seeds)
| Method | Endpoint | Quyền |
|--------|----------|-------|
| POST | `/api/crops` | ADMIN |
| PUT | `/api/crops/:id` | ADMIN |
| DELETE | `/api/crops/:id` | ADMIN |
| POST | `/api/seeds` | ADMIN |
| PUT | `/api/seeds/:id` | ADMIN |
| DELETE | `/api/seeds/:id` | ADMIN |

#### Đơn mua hạt giống (Seed Orders)
| Method | Endpoint | Quyền |
|--------|----------|-------|
| GET | `/api/seed-orders` | FARMER, ADMIN |
| GET | `/api/seed-orders/:id` | FARMER, ADMIN |
| POST | `/api/seed-orders` | FARMER, ADMIN |
| PUT | `/api/seed-orders/:id/status` | FARMER, ADMIN |

**Body tạo đơn hạt giống:**
```json
{
  "items": [
    {
      "seedVarietyId": "uuid",
      "quantity": 5
    }
  ],
  "shippingAddress": "Địa chỉ giao hàng",
  "notes": "Ghi chú"
}
```

#### Thu hoạch (Harvests)
| Method | Endpoint | Quyền |
|--------|----------|-------|
| GET | `/api/harvests` | Đã đăng nhập |
| GET | `/api/harvests/export` | Đã đăng nhập |
| GET | `/api/harvests/:id` | Đã đăng nhập |
| POST | `/api/harvests` | FARMER, ADMIN |
| PUT | `/api/harvests/:id` | FARMER, ADMIN |

#### Chế biến (Processing)
| Method | Endpoint | Quyền |
|--------|----------|-------|
| GET | `/api/processing` | Đã đăng nhập |
| GET | `/api/processing/:id` | Đã đăng nhập |
| POST | `/api/processing` | PROCESSOR, ADMIN |
| PUT | `/api/processing/:id` | PROCESSOR, ADMIN |
| POST | `/api/processing/:id/complete` | PROCESSOR, ADMIN |

#### Sản phẩm (Products)
| Method | Endpoint | Quyền |
|--------|----------|-------|
| POST | `/api/products` | ADMIN, PROCESSOR |
| PUT | `/api/products/:id` | ADMIN, PROCESSOR |
| DELETE | `/api/products/:id` | ADMIN |

#### Đơn hàng (Orders)
| Method | Endpoint | Quyền |
|--------|----------|-------|
| GET | `/api/orders` | Đã đăng nhập |
| GET | `/api/orders/:id` | Đã đăng nhập |
| POST | `/api/orders` | Đã đăng nhập |
| PUT | `/api/orders/:id/status` | ADMIN, DISTRIBUTOR |
| PUT | `/api/orders/:id/payment` | ADMIN |

**Body tạo đơn hàng:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 10,
      "notes": "Ghi chú"
    }
  ],
  "customerName": "Công ty ABC",
  "customerEmail": "abc@example.com",
  "customerPhone": "0901234567",
  "shippingAddress": "Địa chỉ giao hàng",
  "billingAddress": "Địa chỉ hóa đơn",
  "paymentMethod": "bank_transfer",
  "shippingMethod": "express",
  "notes": "Ghi chú"
}
```

#### Kho (Inventory)
| Method | Endpoint | Quyền |
|--------|----------|-------|
| GET | `/api/inventory` | Đã đăng nhập |
| GET | `/api/inventory/summary` | Đã đăng nhập |
| GET | `/api/inventory/:id` | Đã đăng nhập |
| POST | `/api/inventory` | ADMIN, PROCESSOR |
| PUT | `/api/inventory/:id` | ADMIN |
| DELETE | `/api/inventory/:id` | ADMIN |

---

## 5. Mã lỗi và xử lý

| Mã HTTP | Ý nghĩa |
|---------|---------|
| 200 | Thành công |
| 201 | Tạo mới thành công |
| 400 | Dữ liệu không hợp lệ |
| 401 | Chưa đăng nhập hoặc token hết hạn |
| 403 | Không có quyền truy cập |
| 404 | Không tìm thấy tài nguyên |
| 500 | Lỗi máy chủ |

**Ví dụ lỗi:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

## 6. Ví dụ tích hợp

### 6.1 JavaScript (Fetch)
```javascript
// Đăng nhập
const loginResponse = await fetch('http://localhost:4201/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'Password123!' }),
});
const { token } = await loginResponse.json();

// Gọi API có bảo vệ
const farmsResponse = await fetch('http://localhost:4201/api/farms', {
  headers: { 'Authorization': `Bearer ${token}` },
});
const farms = await farmsResponse.json();
```

### 6.2 Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4201',
  headers: { 'Content-Type': 'application/json' },
});

// Thêm token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Xử lý 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Chuyển về trang đăng nhập
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Sử dụng
const { data } = await api.post('/api/auth/login', { email, password });
localStorage.setItem('token', data.token);

const { data: farms } = await api.get('/api/farms?ownerId=xxx');
```

### 6.3 cURL
```bash
# Đăng nhập
curl -X POST http://localhost:4201/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'

# Gọi API có token
curl -X GET http://localhost:4201/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6.4 Postman
1. Tạo Environment với biến `baseUrl` = `http://localhost:4201`
2. Gửi POST `/api/auth/login`, lưu `token` vào biến môi trường
3. Trong Authorization, chọn Type: Bearer Token, value: `{{token}}`

---

## Phụ lục: Enums thường dùng

- **UserRole:** FARMER, INVESTOR, ADMIN, DISTRIBUTOR, PROCESSOR
- **RegionType:** PROVINCE, DISTRICT, COMMUNE
- **FarmStatus:** PENDING, ACTIVE, SUSPENDED, CLOSED
- **PlotStatus:** ACTIVE, FALLOW, HARVESTED, CLOSED
- **SeasonStatus:** PLANNED, PLANTED, GROWING, HARVESTING, HARVESTED, COMPLETED
- **TaskType:** WATERING, FERTILIZING, SPRAYING, PRUNING, HARVESTING, WEEDING, PLANTING, MONITORING, OTHER
- **TaskStatus:** PENDING, IN_PROGRESS, COMPLETED, CANCELLED
- **SeedOrderStatus:** PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
- **HarvestStatus:** PENDING_PROCESSING, PROCESSING, PROCESSED, IN_STORAGE, DISTRIBUTED
- **ProcessingStatus:** PENDING, IN_PROGRESS, COMPLETED, CANCELLED
- **OrderStatus:** PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED
- **PaymentStatus:** PENDING, PAID, FAILED, REFUNDED
- **InventoryStatus:** AVAILABLE, RESERVED, SHIPPED, SOLD, EXPIRED, DAMAGED
