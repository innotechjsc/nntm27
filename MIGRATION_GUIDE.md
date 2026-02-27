# Hướng dẫn Migration và Setup

## Tổng quan

Dự án đã được chuyển đổi từ MongoDB sang PostgreSQL với Prisma ORM, và bổ sung đầy đủ tính năng cho vòng đời nông nghiệp hoàn chỉnh.

## Các thay đổi chính

### 1. Database Migration: MongoDB → PostgreSQL

- **Trước:** MongoDB với Mongoose
- **Sau:** PostgreSQL với Prisma ORM
- **Database URL:** `postgresql://adphim:D23EbDE205Ac719E@42.118.102.108:20830/pgphim`

### 2. Models/Schema mới

Tất cả models đã được chuyển sang Prisma Schema với các bảng:

- `users` - Người dùng (FARMER, INVESTOR, ADMIN, DISTRIBUTOR, PROCESSOR)
- `regions` - Khu vực (tỉnh/huyện/xã)
- `farms` - Trang trại
- `plots` - Lô đất (với GeoJSON)
- `crops` - Loại cây trồng
- `seedVarieties` - Giống hạt giống
- `seedOrders` - Đơn mua hạt giống
- `seasons` - Mùa vụ
- `tasks` - Nhiệm vụ chăm sóc/canh tác
- `harvests` - Thu hoạch
- `processingBatches` - Lô chế biến
- `products` - Sản phẩm
- `inventory` - Kho
- `orders` - Đơn hàng phân phối
- `orderItems` - Chi tiết đơn hàng

### 3. API Endpoints mới

#### Seeds (Hạt giống)
- `GET /api/seeds` - Danh sách hạt giống
- `POST /api/seeds` - Tạo hạt giống (Admin)
- `GET /api/seeds/:id` - Chi tiết hạt giống
- `PUT /api/seeds/:id` - Cập nhật hạt giống (Admin)
- `DELETE /api/seeds/:id` - Xóa hạt giống (Admin)

#### Seed Orders (Đơn mua hạt giống)
- `GET /api/seed-orders` - Danh sách đơn hàng
- `POST /api/seed-orders` - Tạo đơn mua hạt giống (Farmer)
- `GET /api/seed-orders/:id` - Chi tiết đơn hàng
- `PUT /api/seed-orders/:id/status` - Cập nhật trạng thái

#### Harvests (Thu hoạch)
- `GET /api/harvests` - Danh sách thu hoạch
- `POST /api/harvests` - Tạo thu hoạch (Farmer)
- `GET /api/harvests/:id` - Chi tiết thu hoạch
- `PUT /api/harvests/:id` - Cập nhật thu hoạch

#### Processing (Chế biến)
- `GET /api/processing` - Danh sách lô chế biến
- `POST /api/processing` - Tạo lô chế biến (Processor)
- `GET /api/processing/:id` - Chi tiết lô chế biến
- `PUT /api/processing/:id` - Cập nhật lô chế biến
- `POST /api/processing/:id/complete` - Hoàn thành chế biến

#### Products (Sản phẩm)
- `GET /api/products` - Danh sách sản phẩm
- `POST /api/products` - Tạo sản phẩm (Admin/Processor)
- `GET /api/products/:id` - Chi tiết sản phẩm
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)

#### Orders (Đơn hàng phân phối)
- `GET /api/orders` - Danh sách đơn hàng
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái (Admin/Distributor)
- `PUT /api/orders/:id/payment` - Cập nhật thanh toán (Admin)

#### Inventory (Kho)
- `GET /api/inventory` - Danh sách kho
- `GET /api/inventory/summary` - Tóm tắt kho theo sản phẩm
- `POST /api/inventory` - Tạo kho (Admin/Processor)
- `PUT /api/inventory/:id` - Cập nhật kho (Admin)
- `DELETE /api/inventory/:id` - Xóa kho (Admin)

### 4. Web/Landing Page mới

- Đã tạo landing page chuyên nghiệp với React + Vite + Tailwind CSS
- Responsive design
- Modern UI/UX
- Các section: Hero, Features, How It Works, CTA, Footer

### 5. Docker Compose cập nhật

- Đã loại bỏ MongoDB container
- Thêm web service
- Cập nhật environment variables cho PostgreSQL

## Hướng dẫn Setup

### 1. Cài đặt Dependencies

```bash
# API
cd api
npm install

# CMS
cd ../cms
npm install

# Web
cd ../web
npm install
```

### 2. Setup Database

```bash
cd api

# Generate Prisma Client
npx prisma generate

# Run migrations (nếu có migration files)
npx prisma migrate dev

# Hoặc push schema trực tiếp (development)
npx prisma db push
```

### 3. Tạo Admin User

Cần cập nhật script `createAdmin.js` để sử dụng Prisma:

```javascript
// api/src/scripts/createAdmin.js
const { prisma } = require('../config/database');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const password = await bcrypt.hash('123456', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@agriverse.com' },
      update: {},
      create: {
        email: 'admin@agriverse.com',
        password: password,
        fullName: 'Admin User',
        role: 'ADMIN',
        isActive: true,
      },
    });
    
    console.log('Admin user created:', admin);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
```

### 4. Chạy với Docker

```bash
# Build và start
docker-compose up -d

# Xem logs
docker-compose logs -f api
docker-compose logs -f cms
docker-compose logs -f web
```

### 5. Chạy Development

```bash
# API (port 4201)
cd api
npm run dev

# CMS (port 4202)
cd cms
npm run dev

# Web (port 4203)
cd web
npm run dev
```

## Lưu ý quan trọng

### Controllers cần cập nhật

Các controllers cũ (farmController, plotController, cropController, etc.) vẫn đang sử dụng Mongoose. Cần cập nhật để sử dụng Prisma:

- `api/src/controllers/userController.js`
- `api/src/controllers/farmController.js`
- `api/src/controllers/plotController.js`
- `api/src/controllers/cropController.js`
- `api/src/controllers/taskController.js`
- `api/src/controllers/seasonController.js`
- `api/src/controllers/regionController.js`

### Routes cần cập nhật

Một số routes có thể cần cập nhật role names (ví dụ: 'admin' → 'ADMIN') để khớp với enum trong Prisma schema.

## Công nghệ sử dụng

- **Backend:** Node.js, Express, Prisma ORM, PostgreSQL
- **Frontend (CMS):** React, Vite
- **Frontend (Web):** React, Vite, Tailwind CSS
- **Database:** PostgreSQL
- **Containerization:** Docker, Docker Compose

## Tính năng đã hoàn thành

✅ Migration MongoDB → PostgreSQL  
✅ Prisma Schema đầy đủ  
✅ Controllers mới cho Seeds, Orders, Products, Processing, Harvest, Inventory  
✅ Routes mới cho tất cả endpoints  
✅ Web/Landing page chuyên nghiệp  
✅ Docker Compose cập nhật  

## Cần hoàn thiện

⚠️ Cập nhật các controllers cũ sang Prisma  
⚠️ Cập nhật CMS để quản lý các tính năng mới  
⚠️ Testing và validation  
⚠️ Error handling improvements  
⚠️ TypeScript migration (optional)  
⚠️ Redis cache (optional)  
⚠️ WebSocket cho real-time (optional)  
