# KẾ HOẠCH API & WEB – HỆ THỐNG NNTM

## Mục tiêu

1. **Config**: PostgreSQL connection string đặt trong config, kết nối DB `nntmdb`.
2. **API**: Đầy đủ các API cần thiết, thống nhất dùng Prisma/PostgreSQL.
3. **Web**: Giao diện hiển thị và quản lý thông tin.

## Chuỗi luồng nghiệp vụ

**Trang trại/Dự án → Lô → Mùa vụ → Thời gian sinh trưởng & Điều kiện chăm sóc → Thu hoạch → Chế biến → Bảo quản (Kho) → Bán (Đơn hàng)**

---

## Checklist nhanh – Việc cần làm trước khi triển khai

- [x] **A** – Config & DB: connection string trong `.env`/config, Prisma migrate, generate. ✅
- [x] **B** – Migrate toàn bộ API (Farm, Plot, Region, Season, Task, Crop, User) từ Mongoose sang Prisma; chuẩn role UPPERCASE; bỏ Mongoose; cập nhật createAdmin. ✅
- [x] **C** – Rà soát đầy đủ API: Auth, Users, Regions, Farms, Plots, Crops, Seeds, Seasons, Tasks, Harvests, Processing, Products, Inventory, Orders, Seed-orders. ✅
- [x] **D** – (Tùy chọn) Bổ sung schema/API cho điều kiện chăm sóc, thời gian sinh trưởng. ✅ (API tiến độ sinh trưởng + gợi ý task)
- [x] **E** – Làm web: Auth → Dashboard → Farms → Plots → Seasons → Tasks → Harvests → Processing → Inventory → Orders. ✅

---

# PHẦN 1: CÁC VIỆC CẦN LÀM TRƯỚC KHI THỰC HIỆN

## A. CẤU HÌNH & CƠ SỞ DỮ LIỆU

| # | Việc cần làm | Mô tả |
|---|--------------|--------|
| A1 | **Lưu connection string vào config** | Thêm `DATABASE_URL=postgresql://adfilm:D23EbDE205Ac719E@42.118.102.108:20866/nntmdb` vào `api/.env` (copy từ `api/env.example`). Cập nhật `env.example` đã có sẵn connection string NNTM. Đảm bảo không commit `.env` lên git. |
| A2 | **Chuẩn hóa config** | `api/src/config/config.js` đọc `DATABASE_URL` từ env (port, JWT, CORS, upload). `database.js` dùng Prisma; đảm bảo `DATABASE_URL` đã được load (dotenv) trước khi Prisma connect. |
| A3 | **Kiểm tra Prisma schema** | Schema hiện tại đã có: User, Region, Farm, Plot, Crop, SeedVariety, Season, Task, Harvest, ProcessingBatch, Product, Inventory, Order. Xác nhận đủ cho: trang trại, mùa vụ, sinh trưởng, chăm sóc, thu hoạch, bảo quản, bán. |
| A4 | **Chạy migration Prisma** | `npx prisma migrate dev` (hoặc `deploy` cho production) tới DB `nntmdb` để đồng bộ schema. |
| A5 | **Generate Prisma Client** | `npx prisma generate` sau mỗi thay đổi schema. |

---

## B. CHUẨN HÓA API – CHUYỂN HẾT SANG PRISMA

Hiện tại một số module dùng **Mongoose** (MongoDB), số khác dùng **Prisma** (PostgreSQL). Cần thống nhất **100% Prisma**.

| # | Việc cần làm | Module | Ghi chú |
|---|--------------|--------|---------|
| B1 | **Migrate Farm API sang Prisma** | `farmController.js`, routes `farms` | Thay Mongoose bằng `prisma.farm`, `prisma.plot`, … Khớp với schema (ownerId, regionId, latitude/longitude, …). |
| B2 | **Migrate Plot API sang Prisma** | `plotController.js`, routes `plots` | Dùng `prisma.plot`, `geometry` (GeoJSON), `farmId`. |
| B3 | **Migrate Region API sang Prisma** | `regionController.js`, routes `regions` | Dùng `prisma.region`, hierarchy parent/children. |
| B4 | **Migrate Season API sang Prisma** | `seasonController.js`, routes `seasons` | Dùng `prisma.season`. Liên kết `plotId`, `cropId`, `seedVarietyId`, trạng thái mùa vụ. |
| B5 | **Migrate Task API sang Prisma** | `taskController.js`, routes `tasks` | Dùng `prisma.task`. Liên kết `plotId`, `seasonId`, `assignedToId`. TaskType (chăm sóc: tưới, bón phân, phun, …). |
| B6 | **Migrate Crop API sang Prisma** | `cropController.js`, routes `crops` | Dùng `prisma.crop`. Đã có `growthPeriod`, nhiệt độ, độ ẩm, đất, nước – dùng cho “điều kiện chăm sóc” & “thời gian sinh trưởng”. |
| B7 | **Migrate User API sang Prisma** | `userController.js`, routes `users` | Dùng `prisma.user`. Đảm bảo phân quyền (ADMIN, FARMER, …) nhất quán. |
| B8 | **Chỉnh middleware auth & role** | `auth.js`, các routes | Một số route dùng `authorize('farmer','admin')` (lowercase), schema dùng `FARMER`, `ADMIN`. Chuẩn hóa toàn bộ sang **UPPERCASE** (FARMER, ADMIN, …) để khớp Prisma. |
| B9 | **Cập nhật script createAdmin** | `scripts/createAdmin.js` | Hiện dùng Mongoose. Chuyển sang Prisma, kết nối PostgreSQL, tạo user ADMIN. |
| B10 | **Loại bỏ Mongoose** | `package.json`, toàn bộ `models/*.js` Mongoose | Sau khi migrate xong: gỡ `mongoose`, xóa hoặc deprecated các file model Mongoose. Chỉ dùng Prisma. |

---

## C. DANH SÁCH API CẦN CÓ (Sau khi chuẩn hóa)

### C1. Auth

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/api/auth/register` | Đăng ký (email, password, fullName, role, …) |
| POST | `/api/auth/login` | Đăng nhập, trả JWT |
| GET | `/api/auth/me` | Thông tin user hiện tại (khi đã có token) |

### C2. Users (Admin)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/users` | Danh sách user (filter, phân trang) |
| GET | `/api/users/:id` | Chi tiết user |
| PUT | `/api/users/:id` | Cập nhật user (role, isActive, …) |
| DELETE | `/api/users/:id` | Xóa/vô hiệu hóa user (tùy quy định) |

### C3. Regions (Tỉnh / Huyện / Xã)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/regions` | Danh sách (filter theo type, parentId) |
| GET | `/api/regions/:id` | Chi tiết + children |
| POST | `/api/regions` | Tạo (Admin) |
| PUT | `/api/regions/:id` | Cập nhật (Admin) |
| DELETE | `/api/regions/:id` | Xóa (Admin) |

### C4. Farms (Trang trại / Dự án)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/farms` | Danh sách (filter owner, region, status) |
| GET | `/api/farms/:id` | Chi tiết farm + plots + seasons (include) |
| POST | `/api/farms` | **Tạo trang trại/dự án** (FARMER, ADMIN) |
| PUT | `/api/farms/:id` | Cập nhật (owner, admin) |
| DELETE | `/api/farms/:id` | Xóa (owner, admin) |

### C5. Plots (Lô)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/plots` | Danh sách (filter farmId, status) |
| GET | `/api/plots/:id` | Chi tiết + seasons, tasks |
| POST | `/api/plots` | Tạo lô (FARMER, ADMIN) |
| PUT | `/api/plots/:id` | Cập nhật |
| DELETE | `/api/plots/:id` | Xóa |

### C6. Crops (Danh mục cây trồng)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/crops` | Danh sách (category, isActive) |
| GET | `/api/crops/:id` | Chi tiết (growthPeriod, nhiệt độ, độ ẩm, đất, nước – điều kiện chăm sóc) |
| POST | `/api/crops` | Tạo (ADMIN) |
| PUT | `/api/crops/:id` | Cập nhật (ADMIN) |
| DELETE | `/api/crops/:id` | Xóa/ẩn (ADMIN) |

### C7. Seeds (Giống)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/seeds` | Danh sách (filter cropId) |
| GET | `/api/seeds/:id` | Chi tiết |
| POST | `/api/seeds` | Tạo (ADMIN) |
| PUT | `/api/seeds/:id` | Cập nhật (ADMIN) |
| DELETE | `/api/seeds/:id` | Xóa (ADMIN) |

### C8. Seasons (Mùa vụ)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/seasons` | Danh sách (filter plotId, status) |
| GET | `/api/seasons/:id` | Chi tiết + plot, crop, tasks, harvests |
| POST | `/api/seasons` | **Tạo mùa vụ** (FARMER, ADMIN) – plotId, cropId, seedVarietyId, startDate, expectedHarvestDate, expectedYield, standard |
| PUT | `/api/seasons/:id` | **Quản lý mùa vụ** – cập nhật trạng thái (PLANNED → PLANTED → GROWING → HARVESTING → HARVESTED → COMPLETED), actualHarvestDate, actualYield |
| DELETE | `/api/seasons/:id` | Xóa (owner, admin) |

### C9. Tasks (Chăm sóc – Điều kiện chăm sóc)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/tasks` | Danh sách (plotId, seasonId, status, assignedTo) |
| GET | `/api/tasks/:id` | Chi tiết |
| POST | `/api/tasks` | Tạo task chăm sóc (tưới, bón phân, phun, cắt tỉa, …) – plotId, seasonId, type, scheduledDate, notes, metadata |
| PUT | `/api/tasks/:id` | Cập nhật (completedDate, status) |
| DELETE | `/api/tasks/:id` | Xóa |

### C10. Harvests (Thu hoạch)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/harvests` | Danh sách (plotId, seasonId, status) |
| GET | `/api/harvests/:id` | Chi tiết + plot, season, processingBatches |
| POST | `/api/harvests` | Ghi nhận thu hoạch – plotId, seasonId, harvestDate, quantity, qualityGrade, unit, storageLocation, notes |
| PUT | `/api/harvests/:id` | Cập nhật (status: PENDING_PROCESSING → PROCESSING → PROCESSED → IN_STORAGE → DISTRIBUTED) |

### C11. Processing (Chế biến)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/processing` | Danh sách batch (harvestId, status) |
| GET | `/api/processing/:id` | Chi tiết batch + harvest, products |
| POST | `/api/processing` | Tạo batch chế biến (harvestId, processingType, inputQuantity, …) |
| PUT | `/api/processing/:id` | Cập nhật |
| POST | `/api/processing/:id/complete` | Hoàn thành chế biến → cập nhật output, tạo Product/Inventory |

### C12. Products (Sản phẩm)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/products` | Danh sách (category, processingBatchId) |
| GET | `/api/products/:id` | Chi tiết |
| POST | `/api/products` | Tạo (ADMIN, PROCESSOR) |
| PUT | `/api/products/:id` | Cập nhật |
| DELETE | `/api/products/:id` | Xóa (ADMIN) |

### C13. Inventory (Bảo quản / Kho)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/inventory` | Danh sách (farmId, productId, status) |
| GET | `/api/inventory/summary` | Tổng hợp tồn kho (group by product, location) |
| GET | `/api/inventory/:id` | Chi tiết |
| POST | `/api/inventory` | Nhập kho (sau chế biến hoặc nhập ngoài) |
| PUT | `/api/inventory/:id` | Cập nhật (số lượng, status, expiryDate) |
| DELETE | `/api/inventory/:id` | Xóa (ADMIN) |

### C14. Orders (Bán hàng)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/orders` | Danh sách đơn (role: FARMER/DISTRIBUTOR/ADMIN filter khác nhau) |
| GET | `/api/orders/:id` | Chi tiết đơn + items |
| POST | `/api/orders` | Tạo đơn hàng (customer, items, shipping, …) |
| PUT | `/api/orders/:id/status` | Cập nhật trạng thái (PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED) |
| PUT | `/api/orders/:id/payment` | Cập nhật thanh toán |

### C15. Seed Orders (Đặt hạt giống)

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/api/seed-orders` | Danh sách (farmerId, status) |
| GET | `/api/seed-orders/:id` | Chi tiết |
| POST | `/api/seed-orders` | Tạo đơn mua hạt giống |
| PUT | `/api/seed-orders/:id` | Cập nhật trạng thái |

### C16. Health & Config

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| GET | `/health` | Health check API |

---

## D. BỔ SUNG SCHEMA (NẾU CẦN)

| # | Việc cần làm | Mô tả |
|---|--------------|--------|
| D1 | **Season – điều kiện chăm sóc** | Hiện có thể dùng Task (theo seasonId) + Crop (nhiệt độ, độ ẩm, nước, đất). Nếu cần “bộ quy trình chăm sóc” cố định theo mùa, cân nhắc thêm trường `carePlan` (JSON) vào `Season` hoặc model `SeasonCareTemplate`. |
| D2 | **Thời gian sinh trưởng** | Đã có `Crop.growthPeriod` (ngày) và `Season.startDate`, `expectedHarvestDate`. Có thể thêm API hoặc field ảo `growthProgress` (ví dụ % từ start đến harvest) nếu cần hiển thị tiến độ. |
| D3 | **Lịch task gợi ý theo mùa** | Tùy chọn: endpoint “gợi ý tạo task” dựa trên crop + growthPeriod (ví dụ tưới mỗi X ngày, bón phân theo giai đoạn). |

---

## E. WEB – HIỂN THỊ & QUẢN LÝ

**Thứ tự:** Chỉ làm web **sau khi** API đã đầy đủ, nhất quán Prisma, và test cơ bản ổn.

| # | Việc cần làm | Mô tả |
|---|--------------|--------|
| E1 | **Chọn stack frontend** | Giữ React (Vite) như `cms` / `web` hiện tại, hoặc tách app “web hiển thị” riêng. |
| E2 | **Cấu hình API client** | Base URL trỏ tới backend, gửi JWT (Bearer) cho route cần auth. |
| E3 | **Auth (login/logout)** | Gọi `/api/auth/login`, lưu token, gọi `/api/auth/me` khi load app. |
| E4 | **Trang tổng quan (Dashboard)** | Thống kê: số farm, plot, season đang hoạt động, harvest gần đây, đơn hàng. |
| E5 | **Trang Trang trại / Dự án** | Danh sách farm, tạo mới, sửa, xóa. Xem danh sách lô thuộc farm. |
| E6 | **Trang Lô (Plots)** | Danh sách theo farm, tạo/sửa/xóa. Có thể tích hợp bản đồ (GeoJSON) nếu cần. |
| E7 | **Trang Mùa vụ (Seasons)** | Danh sách theo plot/farm, **tạo mùa vụ**, **quản lý mùa vụ** (trạng thái, ngày thu hoạch, sản lượng). Hiển thị thời gian sinh trưởng (từ crop + start/expected harvest). |
| E8 | **Trang Chăm sóc (Tasks)** | Danh sách task theo plot/season, tạo/sửa, đánh dấu hoàn thành. Hiển thị “điều kiện chăm sóc” (từ crop hoặc task metadata). |
| E9 | **Trang Thu hoạch** | Danh sách harvest, ghi nhận thu hoạch mới, cập nhật trạng thái. |
| E10 | **Trang Chế biến** | Danh sách batch, tạo batch, hoàn thành chế biến. |
| E11 | **Trang Kho (Inventory)** | Tồn kho theo sản phẩm, vị trí, trạng thái. Nhập/xuất. |
| E12 | **Trang Bán hàng (Orders)** | Danh sách đơn, tạo đơn, cập nhật trạng thái & thanh toán. |
| E13 | **Trang phụ** | Crops, Seeds, Seed orders, Regions, Users (theo role). |

---

## F. THỨ TỰ THỰC HIỆN ĐỀ XUẤT

1. **A1–A5**: Config, env, Prisma migrate, generate.
2. **B1–B10**: Migrate toàn bộ API sang Prisma, chuẩn role, bỏ Mongoose, cập nhật createAdmin.
3. **C1–C16**: Rà soát từng nhóm API (routes + controller), đảm bảo đủ endpoint, đúng schema, phân quyền.
4. **D1–D3** (tùy chọn): Mở rộng schema / API cho “điều kiện chăm sóc” và “thời gian sinh trưởng” nếu cần.
5. **E1–E13**: Làm lần lượt từ auth → dashboard → farms → plots → seasons → tasks → harvests → processing → inventory → orders.

---

## G. TÓM TẮT CÔNG VIỆC THEO GIAI ĐOẠN

| Giai đoạn | Nội dung |
|-----------|----------|
| **1. Config & DB** | Connection string trong config, migrate Prisma, generate client. |
| **2. API chuẩn Prisma** | Migrate Farm, Plot, Region, Season, Task, Crop, User sang Prisma; chuẩn auth/role; bỏ Mongoose. |
| **3. API đầy đủ** | Rà soát toàn bộ CRUD + nghiệp vụ (harvest → processing → inventory → orders). |
| **4. Web** | Auth, dashboard, các trang quản lý từ trang trại → mùa vụ → chăm sóc → thu hoạch → bảo quản → bán. |

---

**Connection string (đặt trong config / .env):**  
`postgresql://adfilm:D23EbDE205Ac719E@42.118.102.108:20866/nntmdb`

Sau khi hoàn thành các bước trên, hệ thống sẽ có API thống nhất, kết nối PostgreSQL đúng config, và web hiển thị/quản lý đầy đủ luồng từ **tạo trang trại/dự án → mùa vụ → chăm sóc → thu hoạch → bảo quản → bán**.

---

## H. CHẠY DỰ ÁN (ĐÃ TRIỂN KHAI)

### Port

| Phần | Port | URL |
|------|------|-----|
| **API** | 4201 | http://localhost:4201 |
| **CMS** | 4202 | http://localhost:4202 |
| **Web** | 4203 | http://localhost:4203 |

### File .bat (chạy từ thư mục gốc `d:\NNTM`)

| File | Mô tả |
|------|--------|
| `run-api.bat` | Chạy API (port 4201) |
| `run-cms.bat` | Chạy CMS (port 4202) |
| `run-web.bat` | Chạy Web landing (port 4203) |
| `run-all.bat` | Mở 3 cửa sổ CMD, chạy API → CMS → Web |

**Lưu ý:** Chạy `run-api.bat` (hoặc API) trước khi dùng CMS; CMS proxy `/api` sang `http://localhost:4201`.

### Lệnh tay

- **API:** `cd api && npm install && npx prisma generate && npm run dev` (port 4201). Đảm bảo `api/.env` có `DATABASE_URL` trỏ tới PostgreSQL nntmdb.
- **Tạo admin:** `cd api && npm run create-admin` (email: `admin@nntm.vn`, password: `123456`).
- **Seed regions (tùy chọn):** `cd api && npx prisma db seed`.
- **Seed dữ liệu demo cho landing:** `cd api && npm run seed-landing` (tạo farms, plots, seasons, harvests, orders mẫu).
- **CMS:** `cd cms && npm install && npm run dev` (port 4202). Proxy `/api` → `http://localhost:4201`. Đăng nhập bằng `admin@nntm.vn` / `123456`.
- **Web (landing):** `cd web && npm install && npm run dev` (port 4203). Links Đăng nhập / Vào CMS trỏ tới `VITE_CMS_URL` (mặc định `http://localhost:4202`).

## I. ĐỒNG BỘ SCHEMA (ĐÃ CẬP NHẬT)

- **Enums:** CMS dùng `cms/src/constants/enums.js` (FarmStatus, PlotStatus, SeasonStatus, TaskType, TaskStatus, RegionType, UserRole) khớp Prisma UPPERCASE.
- **CMS:** Plots (farmId, status), Regions (type, parentId, lat/long), Crops (temperatureMin/Max, humidityMin/Max, soilType[]), Users (role), Seasons (plotId, cropId, seedVarietyId, status), Tasks (plotId, seasonId, assignedToId, type, status) đã đồng bộ với API.
- **API:** Season có relation `crop`, `seedVariety`; Crop/SeedVariety có `seasons[]`. GET /seasons, GET /tasks dùng `include` hợp lệ.
- **Web:** Landing dùng `config.js` (apiUrl, cmsUrl), branding NNTM, CTA trỏ CMS.

## J. HOÀN THIỆN & SÁNG TẠO THÊM (ĐÃ BỔ SUNG)

- **B10 hoàn tất:** Đã xóa toàn bộ file model Mongoose legacy trong `api/src/models/` (chỉ dùng Prisma).
- **CMS – Trang phụ:** Đã thêm trang **Hạt giống (Seeds)** và **Đơn hạt giống (Seed Orders)** với menu, route và CRUD/trạng thái.
- **API:** 
  - `GET /api/inventory/:id` – Chi tiết tồn kho.
  - `GET /api/seasons/:id/growth-progress` – Tiến độ sinh trưởng mùa vụ (% và số ngày).
  - `POST /api/tasks/suggest` – Gợi ý task theo mùa vụ (tưới, bón phân, nhổ cỏ, giám sát) dựa trên `growthPeriod` của cây.
- **CMS api.js:** Request interceptor luôn gắn token từ `localStorage` cho mỗi request (tránh token cũ sau khi login).
- **Dashboard:** Thêm thẻ thống kê Hạt giống, Đơn hạt giống; block **Mùa vụ đang phát triển** với thanh tiến độ % và số ngày còn lại.
- **Trang Nhiệm vụ:** Nút **Gợi ý task theo mùa vụ** – chọn mùa vụ → lấy gợi ý từ API → chọn và tạo hàng loạt task.

- **Export CSV:** `GET /api/harvests/export` – xuất danh sách thu hoạch CSV (với filter query). Nút "Xuất CSV" trên trang Thu hoạch CMS.
- **Settings:** Sửa tên hệ thống sang NNTM, Database hiển thị PostgreSQL.

- **API public (landing):** 
  - `GET /api/public/plots?limit=6` – danh sách vùng trồng đang hoạt động (không cần auth).
  - `GET /api/public/stats` – thống kê (plotsCount, harvestsCount, ordersCount, totalRevenue, harvestHistory).
- **Landing React đầy đủ:** Các section Giới thiệu (tabs), Chức năng (9 mục), Giá trị, Vùng trồng (dữ liệu API), Thống kê & Lịch sử (dữ liệu API), Hành trình Số hóa (6 bước). Không dùng mock data; khi API lỗi hiển thị thông báo fail.

### Gợi ý mở rộng sau (tùy chọn)

- **Báo cáo/Xuất dữ liệu:** Mở rộng export cho orders, inventory.
- **Cảnh báo:** Thông báo task quá hạn, mùa vụ sắp thu hoạch (email hoặc in-app).
- **Care plan theo mùa:** Trường JSON `carePlan` trên Season hoặc model SeasonCareTemplate cho quy trình chăm sóc cố định.
- **Landing/Web công khai:** Trang sản phẩm, tin tức, liên hệ.
