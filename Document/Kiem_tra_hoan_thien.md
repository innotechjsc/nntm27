# Kiểm tra hoàn thiện – Bám sát đề án Req

*Tự kiểm tra ngày: 2025-02*

## 1. Đã đáp ứng (theo Req)

| Yêu cầu (Req) | Trạng thái | Ghi chú |
|---------------|------------|---------|
| **01_Product_Vision** – Farm & Plot, IoT, Truy xuất, NFT scope | ✅ | Luồng nghiệp vụ đủ. NFT chưa triển khai on-chain (gợi ý mở rộng). |
| **02_Core_Value_Proposition** – Farmer-first, giá trị cho nhà đầu tư & thị trường | ✅ | Landing và CMS phản ánh đúng. |
| **03_Farm_Lifecycle** – Từ tạo trang trại đến (optional) NFT | ✅ | API + CMS hỗ trợ đầy đủ. |
| **C6 NFT Metadata Schema** – plot_id, farm_id, geometry, crop_type, season... | ⚠️ | Schema DB có sẵn; chưa có API/UI phát hành NFT. |
| **C7 Risk Register** – Legal disclaimer NFT ≠ sở hữu đất | ⚠️ | Chưa có disclaimer rõ trên UI. |
| **KE_HOACH A–E** – Config, API Prisma, Web CMS | ✅ | Đã triển khai đầy đủ. |
| **Landing** – Bỏ mock data, hiện thông báo lỗi khi API fail | ✅ | Đã cập nhật. |

---

## 2. Chưa đáp ứng (theo Req)

### 2.1 Farm Plot Drawing Tool (04_FUNCTIONAL_SPEC, 05_UI_SPEC)

| Yêu cầu | Trạng thái | Hiện trạng |
|---------|------------|------------|
| **Vẽ polygon trên Google Maps Satellite** | ❌ Chưa có | CMS hiện chỉ có textarea nhập GeoJSON thủ công. |
| **Layout:** Left panel (plot info + controls), Right: satellite map | ❌ Chưa có | Form plot đơn giản, không có bản đồ. |
| **States:** Empty, Drawing, Editing, Saved, Error | ❌ Chưa có | Không có state machine cho bản vẽ. |
| **Actions:** Start drawing, Finish, Edit, Save, Export GeoJSON | ⚠️ Một phần | Save có (qua form). Export GeoJSON chưa có nút riêng. |

**Backend:** API Plot đã hỗ trợ GeoJSON, `validatePolygon` (khép kín, ≥ 3 điểm, diện tích tối thiểu). Chỉ thiếu UI vẽ trên map.

**Gợi ý triển khai:**
- Dùng Google Maps JS API + Drawing Manager (hoặc Leaflet + Leaflet.draw) để vẽ polygon.
- Thêm trang/route riêng “Vẽ ranh giới lô” hoặc modal trong trang Plots.
- Chuyển polygon vẽ được thành GeoJSON và gửi lên API.

---

### 2.2 Legal disclaimer NFT (04_Risk_Register)

| Yêu cầu | Trạng thái |
|---------|------------|
| “NFT đại diện quyền lợi mùa vụ, không đại diện quyền sở hữu đất” | ❌ Chưa có trên UI |

**Gợi ý:** Thêm disclaimer (vd. footer hoặc popup) ở mọi nơi đề cập NFT (landing, CMS nếu có trang NFT).

---

## 3. Đã bổ sung cho Landing Web (hoàn thiện)

- **Menu mobile** – Hamburger + drawer cho màn hình nhỏ
- **Smooth scroll** – `scroll-behavior: smooth` cho anchor links
- **Loading states** – Skeleton cho Plots và Stats trong lúc fetch
- **Empty states** – "Chưa có dữ liệu" khi plots/harvestHistory rỗng
- **Legal disclaimer NFT** – Thêm vào footer: "NFT đại diện quyền lợi mùa vụ, không đại diện quyền sở hữu đất"
- **CTA** – Đổi "Đăng ký Ngay" thành "Vào quản lý"
- **Footer** – Thêm link CMS Quản trị
- **SEO meta** – Meta description, OG tags trong index.html

---

## 4. Tóm tắt hành động đề xuất (còn lại)

| Ưu tiên | Việc cần làm |
|---------|--------------|
| **1** | **Farm Plot Drawing Tool** – Tích hợp bản đồ vệ tinh + vẽ polygon cho trang Plots (hoặc trang riêng). |
| **2** | **Legal disclaimer** – Thêm disclaimer NFT trên landing và (nếu có) trang NFT trong CMS. |
| **3** | **Export GeoJSON** – Nút xuất GeoJSON cho lô đất đã lưu. |

---

## 5. Đã cập nhật tài liệu

- `KE_HOACH_API_WEB_NNTM.md`: Sửa mô tả landing “Không dùng mock data; khi API lỗi hiển thị thông báo fail”.
