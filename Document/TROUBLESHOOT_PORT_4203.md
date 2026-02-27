# Kiểm tra khi localhost:4203 (Web Landing) không hoạt động trên server

## 1. Ứng dụng Web có đang chạy không?

- Mở **Task Manager** (Ctrl+Shift+Esc) → tab **Details** → tìm process **node.exe** (có thể nhiều tiến trình nếu chạy cả API, CMS, Web).
- Hoặc trong cửa sổ CMD/PowerShell đã chạy `run-web.bat` hoặc `run-all.bat`: xem có thông báo lỗi (npm, node, port in use) hay không.
- **Cách chạy thủ công:** mở CMD, chạy:
  ```bat
  set NNTM_ROOT=D:\NNTM
  cd /d %NNTM_ROOT%\web
  npm run dev
  ```
  (thay `D:\NNTM` bằng đường dẫn thực tế trên server)

---

## 2. Port 4203 có bị chiếm hoặc bị chặn không?

- **Port đã bị dùng:** trong PowerShell (chạy với quyền Admin nếu cần):
  ```powershell
  Get-NetTCPConnection -LocalPort 4203 -ErrorAction SilentlyContinue
  ```
  Nếu có kết quả → tiến trình khác đang dùng 4203. Tắt ứng dụng đó hoặc đổi port trong `web/vite.config.js` (ví dụ `port: 4204`).

- **Firewall Windows chặn 4203:**
  - Mở **Windows Defender Firewall** → **Advanced settings** → **Inbound Rules**.
  - **New Rule** → Port → TCP, 4203 → Allow.
  - Hoặc tạm tắt firewall để thử (chỉ để kiểm tra, không nên dùng lâu dài).

---

## 3. Truy cập từ máy khác: phải listen 0.0.0.0

Trên server, nếu bạn gõ `http://localhost:4203` trên chính server thì dùng 127.0.0.1. Nhưng nếu truy cập từ máy khác (hoặc bằng IP server) thì Vite phải listen trên **0.0.0.0** (toàn bộ interface).

- Trong `web/vite.config.js` đã có `host: true` (tương đương `host: '0.0.0.0'`) → đúng.
- Nếu vẫn không vào được từ ngoài: kiểm tra lại file có đúng `host: true` trong `server: { ... }`, restart lại `npm run dev`.

---

## 4. Đường dẫn và biến môi trường trên server

- Nếu dùng **run-all.bat** / **run-web.bat** trên server, cần set **NNTM_ROOT** trước khi chạy (đường dẫn thư mục NNTM trên server), ví dụ:
  ```bat
  set NNTM_ROOT=E:\Deploy\NNTM
  run-all.bat
  ```
  hoặc set **NNTM_ROOT** trong **System Properties → Environment Variables** (User hoặc System).

- Đảm bảo thư mục `web` tồn tại trong `%NNTM_ROOT%\web` và đã cài dependency:
  ```bat
  cd /d %NNTM_ROOT%\web
  npm install
  npm run dev
  ```

---

## 5. Node / npm

- Trên server chạy:
  ```bat
  node -v
  npm -v
  ```
  Cần Node 18+ (hoặc theo yêu cầu trong `package.json`).
- Nếu chưa cài: cài [Node.js LTS](https://nodejs.org/) cho Windows.

---

## 6. Truy cập đúng URL

- Trên **chính server:** `http://localhost:4203` hoặc `http://127.0.0.1:4203`.
- Từ **máy khác:** `http://<IP-server>:4203`, ví dụ `http://192.168.1.100:4203`. Đảm bảo firewall (mục 2) đã mở 4203.

---

## 7. Proxy / API (khi Web chạy nhưng gọi API lỗi)

- Web (4203) proxy `/api` sang API (4201). Trên server, API cũng phải chạy và listen 0.0.0.0 (Express mặc định thường đã vậy).
- Nếu sau khi build production và host Web qua Nginx/IIS, không dùng `npm run dev` nữa thì cần cấu hình Nginx/IIS proxy `/api` tới cổng 4201 (hoặc URL API thật).

---

## Checklist nhanh

| # | Kiểm tra | Cách xử lý |
|---|----------|------------|
| 1 | Web (node) có đang chạy? | Chạy `run-web.bat` hoặc `cd web && npm run dev` |
| 2 | Port 4203 có bị chiếm? | `Get-NetTCPConnection -LocalPort 4203` → tắt tiến trình trùng hoặc đổi port |
| 3 | Firewall có chặn 4203? | Thêm Inbound Rule TCP 4203 Allow |
| 4 | `vite.config.js` có `host: true`? | Giữ `host: true` trong `server` |
| 5 | Trên server có set NNTM_ROOT? | Set trước khi chạy .bat hoặc trong Env Variables |
| 6 | Đang gõ URL đúng? | Trên server: localhost:4203; từ xa: http://IP-server:4203 |
