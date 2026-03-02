# Deploy NNTM – GitHub & Server

## Deploy riêng từng service hay 1 lần tất cả?

| Cách | Khi nào dùng | Ưu điểm | Nhược điểm |
|------|----------------|---------|------------|
| **1 lần tất cả** (api + cms + web) | Server mới, cập nhật toàn bộ sau mỗi lần push | Đơn giản, đồng bộ 1 phiên bản, ít lệnh | Mỗi lần đổi nhỏ cũng build lại hết, tốn thời gian |
| **Riêng từng service** (chỉ api / chỉ cms / chỉ web) | Chỉ sửa API hoặc chỉ sửa giao diện | Nhanh: chỉ cài & restart đúng service đổi | Phải nhớ chạy đúng script theo phần đã sửa |

**Gợi ý:**
- **Lần đầu hoặc sau khi pull lớn:** deploy 1 lần tất cả (`deploy\deploy-update.bat` không tham số, hoặc `deploy-update.bat all`).
- **Chỉ sửa backend:** `deploy\deploy-update.bat api` → pull, npm install, Prisma, restart API.
- **Chỉ sửa CMS:** `deploy\deploy-update.bat cms`.
- **Chỉ sửa Web (landing/cửa hàng):** `deploy\deploy-update.bat web`.

Script nằm trong thư mục `deploy\` (xem bên dưới).

---

## 1. Tạo GitHub và đẩy code (lần đầu)

### Bước 1: Tạo repository trên GitHub

1. Vào [github.com/new](https://github.com/new).
2. Đặt tên repo (vd: `NNTM` hoặc `nntm-agri`).
3. Chọn **Private** hoặc **Public**.
4. **Không** chọn "Add a README" (đã có code sẵn).
5. Bấm **Create repository**.

### Bước 2: Init Git và push từ máy bạn

Mở terminal tại thư mục `d:\NNTM` và chạy:

```powershell
cd d:\NNTM

# Khởi tạo git (chỉ chạy 1 lần)
git init

# Thêm toàn bộ file (đã có .gitignore loại .env, node_modules...)
git add .
git commit -m "Initial commit - NNTM API, CMS, Web, Landing"

# Kết nối GitHub (thay YOUR_USERNAME và YOUR_REPO bằng tên thật)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Đẩy lên (lần đầu)
git branch -M main
git push -u origin main
```

Nếu GitHub bắt đăng nhập: dùng **Personal Access Token** thay mật khẩu, hoặc cài [GitHub CLI](https://cli.github.com/) và chạy `gh auth login`.

---

## 2. Deploy lên server (lần đầu)

### Cách A: Server Windows (chạy bằng script có sẵn)

1. **Cài trên server:** Node.js (LTS), npm, Git.
2. **Clone repo** (thay URL bằng repo của bạn):

   ```powershell
   cd C:\deploy
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git NNTM
   cd NNTM
   ```

3. **Tạo file `.env`** trong từng thư mục cần thiết (ít nhất `api\.env`), copy từ `env.example` hoặc từ máy dev, **không** commit file `.env`.
4. **Cài dependency:**

   ```powershell
   cd api
   npm install
   npx prisma generate
   npx prisma migrate deploy
   cd ..
   cd cms
   npm install
   cd ..
   cd web
   npm install
   npm run build
   cd ..
   ```

5. **Chạy:**  
   Đặt biến môi trường (optional) rồi chạy script:

   ```powershell
   set NNTM_ROOT=C:\deploy\NNTM
   deploy\run-all.bat
   ```

   Hoặc chạy từng service: trong `api` chạy `npm run dev` hoặc `npm start`, trong `cms`/`web` tương ứng.

### Cách B: Server Linux (PM2 – gợi ý cho API chạy ổn định)

1. Cài Node, npm, Git trên server.
2. Clone và cài đặt như trên (bước 2–4), dùng đường dẫn Linux (vd: `/var/www/NNTM`).
3. Cài PM2: `npm install -g pm2`.
4. Chạy API bằng PM2:

   ```bash
   cd /var/www/NNTM/api
   pm2 start src/server.js --name nntm-api
   pm2 save
   pm2 startup
   ```

---

## 3. Deploy nhanh lần sau (cập nhật code)

Trên **server**, dùng script (khuyến nghị):

```powershell
cd C:\deploy\NNTM

# Deploy tất cả (api + cms + web)
deploy\deploy-update.bat
deploy\deploy-update.bat all

# Chỉ deploy API (sau khi sửa backend)
deploy\deploy-update.bat api

# Chỉ deploy CMS
deploy\deploy-update.bat cms

# Chỉ deploy Web
deploy\deploy-update.bat web
```

Sau khi chạy xong, restart service tương ứng (đóng cửa sổ run-all rồi chạy lại `deploy\run-all.bat`, hoặc PM2: `pm2 restart nntm-api` / `nntm-cms` / `nntm-web`).

---

## 4. Script trong thư mục `deploy`

| File | Mô tả |
|------|--------|
| **`run-all.bat`** | Chạy API (4201) + CMS (4202) + Web (4203) – dùng khi dev hoặc chạy trên server. |
| **`deploy-update.bat`** | Pull code + cài dependency + Prisma (api) + build (web). Tham số: `all` (mặc định), `api`, `cms`, `web`. |

Ví dụ: sau khi push lên GitHub, trên server chạy `deploy\deploy-update.bat api` nếu chỉ sửa API, hoặc `deploy\deploy-update.bat` nếu cập nhật toàn bộ.






---

## Checklist nhanh

| Bước | Việc |
|------|------|
| 1 | Tạo repo trên GitHub (không thêm README) |
| 2 | `git init` → `git add .` → `git commit` → `git remote add origin` → `git push` |
| 3 | Trên server: clone repo, tạo `.env`, `npm install`, Prisma migrate, chạy (run-all hoặc PM2) |
| 4 | Lần sau: `git pull` trên server + cài dependency nếu cần + restart service |

**Lưu ý:** File `.env` chứa mật khẩu DB và JWT – chỉ tạo trên server (và máy dev), **không** đẩy lên GitHub. Đã có `.gitignore` loại trừ `.env`.
