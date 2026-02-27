# Cấu trúc Dự án AviVerse NFT

## Tổng quan
Nền tảng Nông nghiệp Thông minh & Số hoá Trang trại với NFT

## Cấu trúc thư mục

```
NNTM/
├── api/                    # Backend API Service
│   ├── src/
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, validation
│   │   ├── utils/          # Helpers
│   │   └── config/         # Config files
│   ├── Dockerfile
│   └── package.json
│
├── cms/                    # Hệ thống quản trị
│   ├── src/
│   │   ├── pages/          # Admin pages
│   │   ├── components/     # React components
│   │   └── services/       # API clients
│   └── package.json
│
├── web/                    # Trang chủ
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── styles/
│   └── package.json
│
├── web-tool/               # Tool vẽ/khoanh vùng trang trại
│   ├── src/
│   │   ├── components/     # Map drawing component
│   │   ├── pages/
│   │   └── services/       # API integration
│   └── package.json
│
├── web-show/               # Web hiển thị các vùng trang trại
│   ├── src/
│   │   ├── components/     # Map display component
│   │   ├── pages/
│   │   └── services/       # API integration
│   └── package.json
│
├── docker/                 # Docker configs
│   ├── docker-compose.yml
│   └── mongodb/
│
└── Document/               # Tài liệu dự án
```

## Chức năng từng folder

### 1. API (Backend Service)
- **Công nghệ**: Node.js + Express + MongoDB
- **Chức năng**:
  - Auth: Đăng ký/đăng nhập, JWT, multi-role (Farmer, Investor, Admin)
  - Farm Management: CRUD Khu vực, Trang trại, Lô
  - Plot Drawing: Lưu GeoJSON polygon, tính diện tích, validation
  - Task & Log: Quản lý nhiệm vụ, nhật ký canh tác
  - IoT: Nhận dữ liệu cảm biến
  - NFT: Quản lý NFT metadata, mapping on-chain/off-chain
  - Marketplace: Sản phẩm, đơn hàng

### 2. CMS (Hệ thống quản trị)
- **Công nghệ**: React + Admin Dashboard
- **Chức năng**:
  - Quản lý users (Farmer, Investor, Admin)
  - Duyệt trang trại, lô
  - Duyệt NFT proposals
  - Dashboard thống kê
  - Quản lý tranh chấp

### 3. WEB (Trang chủ)
- **Công nghệ**: React/Next.js
- **Chức năng**:
  - Giới thiệu nền tảng
  - Features, benefits
  - Đăng ký/Đăng nhập
  - Liên hệ

### 4. WEB-TOOL (Tool vẽ trang trại)
- **Công nghệ**: React + Google Maps API
- **Chức năng**:
  - Vẽ polygon trên bản đồ vệ tinh
  - Chỉnh sửa/xóa polygon
  - Tính diện tích tự động
  - Lưu plot qua API
  - Validation (khép kín, tối thiểu 3 điểm, không self-intersection)

### 5. WEB-SHOW (Hiển thị trang trại)
- **Công nghệ**: React + Google Maps API
- **Chức năng**:
  - Load danh sách plots từ API
  - Hiển thị polygons trên bản đồ
  - Click vào plot xem chi tiết
  - Filter, search plots

## Database: MongoDB
- Collections: users, farms, plots, regions, seasons, crops, tasks, nfts, products

## Docker
- MongoDB container
- API service container
- Có thể mở rộng thêm các services khác

