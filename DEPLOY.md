# Deploy NNTM – GitHub & Server

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

Trên **server**, chỉ cần pull rồi build/restart:

```powershell
# Windows (trong thư mục NNTM)
cd C:\deploy\NNTM
git pull origin main

cd api
npm install
npx prisma migrate deploy
# Restart: đóng cửa sổ run-all rồi chạy lại deploy\run-all.bat
# Hoặc nếu dùng PM2: pm2 restart nntm-api
```

Hoặc chạy script tự động (xem mục 4).

---

## 4. Script deploy nhanh (tùy chọn)

Trong thư mục `deploy` đã có sẵn:

- **`run-all.bat`** – chạy API + CMS + Web (dev) trên Windows.

Có thể thêm file **`deploy-update.bat`** (hoặc `.ps1`) trên server để:

- `git pull`
- `cd api && npm install && npx prisma migrate deploy`
- Restart PM2 hoặc thông báo “restart run-all thủ công”.

Sau mỗi lần đẩy code lên GitHub, chỉ cần chạy script này trên server là đủ “deploy nhanh”.

---

## Checklist nhanh

| Bước | Việc |
|------|------|
| 1 | Tạo repo trên GitHub (không thêm README) |
| 2 | `git init` → `git add .` → `git commit` → `git remote add origin` → `git push` |
| 3 | Trên server: clone repo, tạo `.env`, `npm install`, Prisma migrate, chạy (run-all hoặc PM2) |
| 4 | Lần sau: `git pull` trên server + cài dependency nếu cần + restart service |

**Lưu ý:** File `.env` chứa mật khẩu DB và JWT – chỉ tạo trên server (và máy dev), **không** đẩy lên GitHub. Đã có `.gitignore` loại trừ `.env`.
