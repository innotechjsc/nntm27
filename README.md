# AgriVerse - Nền tảng Nông nghiệp Thông minh

## Tổng quan

AgriVerse là nền tảng nông nghiệp thông minh chuyên nghiệp, quản lý toàn bộ vòng đời sản xuất nông nghiệp từ tạo vườn/trang trại, mua hạt giống, chăm sóc, theo dõi, canh tác, thu hoạch, chế biến đến phân phối.

## Kiến trúc hệ thống

Dự án được chia thành 3 phần chính:

- **API** (Backend): Node.js + Express + Prisma ORM + PostgreSQL
- **CMS** (Hệ thống quản trị): React + Vite
- **Web** (Landing page): React + Vite + Tailwind CSS

## Công nghệ sử dụng

### Backend
- Node.js 18+
- Express.js
- Prisma ORM (migration từ MongoDB/Mongoose)
- PostgreSQL
- JWT Authentication
- bcryptjs (password hashing)

### Frontend
- React 18
- Vite
- Tailwind CSS (Web/Landing)
- Axios (API calls)

### Infrastructure
- Docker & Docker Compose
- Nginx (Web production)

## Cấu trúc dự án

```
NNTM/
├── api/                    # Backend API Service
│   ├── prisma/
│   │   └── schema.prisma   # Database schema (PostgreSQL)
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation
│   │   └── utils/           # Helpers
│   └── package.json
│
├── cms/                     # Hệ thống quản trị
│   ├── src/
│   │   ├── pages/           # Admin pages
│   │   ├── components/      # React components
│   │   └── services/        # API clients
│   └── package.json
│
├── web/                     # Landing page
│   ├── src/
│   │   ├── App.jsx          # Main component
│   │   └── index.css        # Tailwind CSS
│   └── package.json
│
└── docker-compose.yml        # Docker orchestration
```

## Tính năng

### Quản lý Trang trại
- ✅ Tạo và quản lý trang trại/vườn
- ✅ Quản lý lô đất với GeoJSON
- ✅ Quản lý khu vực (tỉnh/huyện/xã)

### Mua Hạt Giống
- ✅ Catalog hạt giống đa dạng
- ✅ Đặt hàng mua hạt giống
- ✅ Quản lý kho hạt giống
- ✅ Theo dõi đơn hàng

### Chăm sóc & Canh tác
- ✅ Quản lý mùa vụ
- ✅ Lập kế hoạch nhiệm vụ
- ✅ Theo dõi tiến độ
- ✅ Ghi chú và hình ảnh

### Thu hoạch
- ✅ Ghi nhận thu hoạch
- ✅ Quản lý chất lượng
- ✅ Theo dõi số lượng

### Chế biến
- ✅ Quản lý lô chế biến
- ✅ Theo dõi quy trình
- ✅ Quản lý sản phẩm

### Phân phối
- ✅ Quản lý sản phẩm
- ✅ Quản lý kho
- ✅ Đặt hàng và phân phối
- ✅ Theo dõi đơn hàng

## Cài đặt và Chạy

### Yêu cầu
- Node.js 18+
- Docker & Docker Compose (optional)
- PostgreSQL database (đã cấu hình)

### Database

Database PostgreSQL đã được cấu hình:
```
postgresql://adphim:D23EbDE205Ac719E@42.118.102.108:20830/pgphim
```

### Setup Database Schema

```bash
cd api

# Generate Prisma Client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Hoặc tạo migration (production)
npx prisma migrate dev
```

### Tạo Admin User

```bash
cd api
npm run create-admin
```

Thông tin đăng nhập mặc định:
- Email: `admin@nntm.vn`
- Password: `123456`

**Lưu ý:** Cần cập nhật script `createAdmin.js` để sử dụng Prisma (xem MIGRATION_GUIDE.md)

### Chạy với Docker

```bash
# Build và start containers
docker-compose up -d

# Xem logs
docker-compose logs -f api
docker-compose logs -f cms
docker-compose logs -f web

# Stop containers
docker-compose down
```

**Services:**
- API: http://localhost:4201
- CMS: http://localhost:4202
- Web: http://localhost:4203

### Chạy Development (Local)

```bash
# API
cd api
npm install
cp env.example .env
# Chỉnh sửa .env với DATABASE_URL
npx prisma generate
npm run dev

# CMS
cd cms
npm install
npm run dev

# Web
cd web
npm install
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user hiện tại

### Farms
- `GET /api/farms` - Danh sách trang trại
- `POST /api/farms` - Tạo trang trại
- `GET /api/farms/:id` - Chi tiết trang trại
- `PUT /api/farms/:id` - Cập nhật trang trại
- `DELETE /api/farms/:id` - Xóa trang trại

### Seeds (Hạt giống) - MỚI
- `GET /api/seeds` - Danh sách hạt giống
- `POST /api/seeds` - Tạo hạt giống (Admin)
- `GET /api/seeds/:id` - Chi tiết hạt giống
- `PUT /api/seeds/:id` - Cập nhật hạt giống (Admin)
- `DELETE /api/seeds/:id` - Xóa hạt giống (Admin)

### Seed Orders (Đơn mua hạt giống) - MỚI
- `GET /api/seed-orders` - Danh sách đơn hàng
- `POST /api/seed-orders` - Tạo đơn mua hạt giống (Farmer)
- `GET /api/seed-orders/:id` - Chi tiết đơn hàng
- `PUT /api/seed-orders/:id/status` - Cập nhật trạng thái

### Harvests (Thu hoạch) - MỚI
- `GET /api/harvests` - Danh sách thu hoạch
- `POST /api/harvests` - Tạo thu hoạch (Farmer)
- `GET /api/harvests/:id` - Chi tiết thu hoạch
- `PUT /api/harvests/:id` - Cập nhật thu hoạch

### Processing (Chế biến) - MỚI
- `GET /api/processing` - Danh sách lô chế biến
- `POST /api/processing` - Tạo lô chế biến (Processor)
- `GET /api/processing/:id` - Chi tiết lô chế biến
- `PUT /api/processing/:id` - Cập nhật lô chế biến
- `POST /api/processing/:id/complete` - Hoàn thành chế biến

### Products (Sản phẩm) - MỚI
- `GET /api/products` - Danh sách sản phẩm
- `POST /api/products` - Tạo sản phẩm (Admin/Processor)
- `GET /api/products/:id` - Chi tiết sản phẩm
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm (Admin)

### Orders (Đơn hàng phân phối) - MỚI
- `GET /api/orders` - Danh sách đơn hàng
- `POST /api/orders` - Tạo đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `PUT /api/orders/:id/status` - Cập nhật trạng thái (Admin/Distributor)
- `PUT /api/orders/:id/payment` - Cập nhật thanh toán (Admin)

### Inventory (Kho) - MỚI
- `GET /api/inventory` - Danh sách kho
- `GET /api/inventory/summary` - Tóm tắt kho theo sản phẩm
- `POST /api/inventory` - Tạo kho (Admin/Processor)
- `PUT /api/inventory/:id` - Cập nhật kho (Admin)
- `DELETE /api/inventory/:id` - Xóa kho (Admin)

Xem thêm trong `MIGRATION_GUIDE.md` để biết đầy đủ endpoints.

## Vai trò người dùng

- **FARMER**: Nông dân - quản lý trang trại, mua hạt giống, chăm sóc, thu hoạch
- **INVESTOR**: Nhà đầu tư - theo dõi và đầu tư
- **PROCESSOR**: Người chế biến - quản lý chế biến
- **DISTRIBUTOR**: Nhà phân phối - quản lý đơn hàng và phân phối
- **ADMIN**: Quản trị viên - quản lý toàn bộ hệ thống

## Migration từ MongoDB

Dự án đã được migrate từ MongoDB sang PostgreSQL với Prisma ORM. Xem chi tiết trong `MIGRATION_GUIDE.md`.

### Những thay đổi chính:
- ✅ Database: MongoDB → PostgreSQL
- ✅ ORM: Mongoose → Prisma
- ✅ Schema đầy đủ cho toàn bộ lifecycle
- ✅ API endpoints mới cho Seeds, Orders, Products, Processing, Harvest, Inventory
- ✅ Web/Landing page mới
- ✅ Docker Compose cập nhật

### Cần hoàn thiện:
- ⚠️ Cập nhật các controllers cũ (farm, plot, crop, task, season, region) sang Prisma
- ⚠️ Cập nhật CMS để quản lý các tính năng mới
- ⚠️ Testing và validation

## Development

### API Development
```bash
cd api
npm run dev  # Chạy với nodemon
```

### Test API
```bash
# Health check
curl http://localhost:4201/health

# Register
curl -X POST http://localhost:4201/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","fullName":"Test User","role":"FARMER"}'

# Login
curl -X POST http://localhost:4201/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

## Lộ trình phát triển

1. ✅ API Backend với Prisma + PostgreSQL
2. ✅ Database Schema đầy đủ
3. ✅ API Endpoints mới (Seeds, Orders, Products, Processing, Harvest, Inventory)
4. ✅ Web/Landing page chuyên nghiệp
5. ✅ Docker Compose cập nhật
6. ⏳ Cập nhật controllers cũ sang Prisma
7. ⏳ Nâng cấp CMS với tính năng mới
8. ⏳ Testing & Documentation
9. ⏳ TypeScript migration (optional)
10. ⏳ Redis cache (optional)
11. ⏳ WebSocket real-time (optional)

## License

ISC

## Liên hệ

Email: contact@nntm.vn
