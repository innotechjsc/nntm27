# Build trên server (sau khi git clone)

Áp dụng sau khi đã chạy: `git clone https://github.com/innotechjsc/nntm27.git`

---

## 1. Chuẩn bị

- **Node.js 18+** và **npm** đã cài trên server.
- **Git** đã dùng để clone.

---

## 2. Tạo file `.env` cho API

File `.env` **không** có trong repo (bảo mật). Tạo thủ công trên server:

```bash
cd nntm27/api
cp env.example .env
```

Chỉnh `.env` cho đúng server (PORT, DATABASE_URL, JWT_SECRET, CORS_ORIGIN nếu cần). Ví dụ production:

```env
PORT=4201
NODE_ENV=production
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=doi-thanh-chuoi-bi-mat-manh
CORS_ORIGIN=https://your-domain.com,https://cms.your-domain.com
```

---

## 3. Build từng bước

Chạy lần lượt trong thư mục gốc repo (ví dụ `nntm27` hoặc `NNTM`).

### API

```bash
cd api
npm install
npx prisma generate
npx prisma migrate deploy
cd ..
```

- `prisma migrate deploy`: áp dụng migration lên database (production).
- Nếu database trống và muốn dữ liệu mẫu: `npm run seed` (tùy chọn).

### CMS

```bash
cd cms
npm install
cd ..
```

(CMS chạy dev server; nếu cần build static: `npm run build`, sau đó serve thư mục `dist` bằng nginx/PM2.)

### Web (Landing)

```bash
cd web
npm install
npm run build
cd ..
```

Sau bước này, file production nằm trong `web/dist/` (serve bằng nginx hoặc static host).

---

## 4. Chạy ứng dụng

### Windows (trong thư mục repo)

```cmd
set NNTM_ROOT=C:\duong\dan\toi\nntm27
deploy\run-all.bat
```

Hoặc chạy từng service trong 3 cửa sổ:

- **API:** `cd api` → `npm start` (hoặc `npm run dev`)
- **CMS:** `cd cms` → `npm run dev`
- **Web:** đã build → serve thư mục `web/dist` (IIS/nginx) hoặc `cd web` → `npm run preview`

### Chạy bằng PM2 (Linux/Windows – khuyến nghị trên server)

Repo có sẵn file **`ecosystem.config.cjs`** để PM2 chạy API + Web.

**1. Cài PM2 (một lần):**

```bash
npm install -g pm2
```

**2. Đảm bảo đã build và có `.env`:**
- Tạo `api/.env` (từ `api/env.example`).
- Build Web: `cd web && npm run build`.

**3. Khởi động bằng ecosystem (từ thư mục gốc repo):**

```bash
cd /var/www/nntm27   # hoặc đường dẫn bạn clone
pm2 start ecosystem.config.cjs
```

Sẽ chạy:
- **nntm-api** – API (port lấy từ `api/.env`, mặc định 4201).
- **nntm-web** – Web đã build (port 4203).

**4. Lệnh PM2 thường dùng:**

```bash
pm2 list              # xem trạng thái
pm2 logs              # xem log tất cả
pm2 logs nntm-api     # log chỉ API
pm2 restart all        # restart tất cả
pm2 restart nntm-api   # restart chỉ API
pm2 stop nntm-web      # dừng Web
pm2 delete all         # xóa tất cả process (không xóa code)
```

**5. Khởi động lại khi reboot server:**

```bash
pm2 save
pm2 startup
```

(CMS có thể chạy dev bằng `npm run dev` trong `cms` hoặc build rồi serve bằng nginx; không bắt buộc chạy bằng PM2.)

---

## 5. Serve Web (production) bằng Nginx

Sau khi `cd web && npm run build`, cấu hình nginx trỏ document root tới thư mục `web/dist` và proxy API (ví dụ `/api` → `http://127.0.0.1:4201`). Xem `web/nginx.conf` trong repo để tham khảo.

---

## Tóm tắt lệnh (copy-paste)

**Linux/macOS (trong thư mục repo):**

```bash
cd api && npm install && npx prisma generate && npx prisma migrate deploy && cd ..
cd cms && npm install && cd ..
cd web && npm install && npm run build && cd ..
```

**Windows (PowerShell) – trong thư mục repo:**

```powershell
cd api; npm install; npx prisma generate; npx prisma migrate deploy; cd ..
cd cms; npm install; cd ..
cd web; npm install; npm run build; cd ..
```

Nhớ tạo `api/.env` (từ `api/env.example`) **trước** khi chạy các lệnh trên.
