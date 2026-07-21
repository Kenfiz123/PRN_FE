# Defense Frontend Demo (15-20 Minutes)

**Phiên bản**: 1.0.0  
**Thời lượng**: 15-20 phút  
**Đối tượng**: Demo phòng thủ - tập trung vào core workflows

---

## Mục Tiêu Demo

1. Chứng minh authentication và role-based access control
2. Demo complete Report Lifecycle
3. Demo Finance workflow
4. Demo Notification system
5. Demo User management

---

## Browser Setup

| Window | Browser | Actor | Mục đích |
|--------|---------|-------|-----------|
| Window A | Chrome Profile 1 | CLUB_MANAGER | Tạo content |
| Window B | Edge | ADMIN | Review và approve |

---

## PHẦN 1: Authentication & Role-Based Access (3 phút)

### Bước 1 — Login CLUB_MANAGER

**Window A - CLUB_MANAGER**

1. Truy cập http://localhost:5173
2. Đăng nhập với CLUB_MANAGER credentials
3. Xác nhận Dashboard hiển thị

**Tôi nói:**
"Tôi đăng nhập với tài khoản Club Manager. Lưu ý menu hiển thị: Dashboard, Clubs, Reports, Activities, Notifications, Profile. Không có Finance hay Users."

**Giảng viên nhìn thấy:**
- Dashboard với thống kê
- Sidebar có đúng menus cho CLUB_MANAGER

---

### Bước 2 — Login ADMIN

**Window B - ADMIN**

1. Truy cập http://localhost:5173
2. Đăng nhập với ADMIN credentials
3. Xác nhận Dashboard hiển thị tất cả menus

**Tôi nói:**
"Tài khoản Admin có tất cả menus bao gồm Finance và Users. Đây là Role-Based Access Control - mỗi role thấy các chức năng khác nhau dựa trên permissions."

**Giảng viên nhìn thấy:**
- Dashboard với thống kê đầy đủ
- Sidebar có tất cả menus: Dashboard, Clubs, Reports, Activities, Finance, Notifications, Profile, Users

---

## PHẦN 2: Report Lifecycle (6 phút)

### Bước 3 — Tạo Báo Cáo (CLUB_MANAGER)

**Window A - CLUB_MANAGER**

1. Bấm "Reports"
2. Bấm "Tạo báo cáo"
3. Form điền:
   - CLB: Chọn CLB được quản lý
   - Kỳ báo cáo: "2026-Q3"
   - Hạn nộp: Chọn ngày tương lai
   - Loại: "ACTIVITY"
   - Nhãn: "Quarterly"
4. Chi tiết hoạt động:
   - Tên: "Workshop Demo"
   - Ngày: Chọn ngày
   - Mô tả: "Workshop PRN232 Demo"
   - Người tham gia: 30
   - Kết quả: "Thành công"
5. Bấm "Tạo bản nháp"

**Tôi nói:**
"Tôi tạo bản nháp báo cáo cho CLB. Báo cáo được tạo ở trạng thái DRAFT - Club Manager có thể chỉnh sửa trước khi gửi."

**Kết quả cần thấy:**
- Toast: "Đã tạo bản nháp báo cáo"
- Table cập nhật với row mới
- Status: "Bản nháp" (amber)

---

### Bước 4 — Gửi Báo Cáo

**Window A - CLUB_MANAGER**

1. Trong table, tìm báo cáo vừa tạo
2. Bấm "Gửi duyệt"

**Tôi nói:**
"Club Manager bấm 'Gửi duyệt' để chuyển báo cáo cho xét duyệt. Trạng thái chuyển từ DRAFT sang SUBMITTED."

**Kết quả cần thấy:**
- Toast: "Đã gửi báo cáo để xét duyệt"
- Status thay đổi: "Đã gửi" (cyan)

---

### Bước 5 — Chuyển Tiếp Báo Cáo

**Window A - CLUB_MANAGER**

1. Tìm báo cáo đã gửi
2. Bấm "Chuyển duyệt"
3. Nhập feedback: "Đã hoàn thành kiểm tra nội bộ"
4. Bấm "Xác nhận"

**Tôi nói:**
"Club Manager cùng CLB có thể forward báo cáo lên xét duyệt cuối. Điều này đảm bảo có ít nhất một người xem xét trước Admin."

**Kết quả cần thấy:**
- Toast: "Đã chuyển báo cáo lên phê duyệt cuối"
- Status: "Đang xét duyệt" (purple)

---

### Bước 6 — Admin Phê Duyệt

**Window B - ADMIN**

1. Bấm "Reports"
2. Tìm báo cáo có status "Đang xét duyệt"
3. Bấm "Phê duyệt"
4. Feedback: "Báo cáo đạt yêu cầu"
5. Bấm "Xác nhận"

**Tôi nói:**
"Admin xem xét và phê duyệt báo cáo. Sau phê duyệt, trạng thái chuyển sang APPROVED."

**Kết quả cần thấy:**
- Toast: "Đã phê duyệt báo cáo"
- Status: "Đã duyệt" (green)

---

## PHẦN 3: Finance Workflow (4 phút)

### Bước 7 — Tạo Đề Xuất Ngân Sách

**Window A - TREASURER hoặc CLUB_MANAGER**
*(Nếu có quyền Finance)*

1. Bấm "Finance"
2. Bấm "Tạo đề xuất"
3. Form điền:
   - CLB: Chọn CLB được quản lý
   - Tiêu đề: "Ngân sách Workshop Q3"
   - Mô tả: "Đề xuất ngân sách cho workshop"
   - Số tiền: 5000000
4. Bấm "Gửi đề xuất"

**Kết quả cần thấy:**
- Toast: "Đã gửi đề xuất ngân sách"
- Card mới với status "Đang chờ"

---

### Bước 8 — Admin Duyệt Ngân Sách

**Window B - ADMIN**

1. Tìm đề xuất "Ngân sách Workshop Q3"
2. Bấm "Phê duyệt"
3. Số tiền: 4500000
4. Ghi chú: "Phê duyệt với điều chỉnh"
5. Bấm "Xác nhận"

**Tôi nói:**
"Admin phê duyệt ngân sách. Admin có thể điều chỉnh số tiền trước khi phê duyệt."

**Kết quả cần thấy:**
- Toast: "Đã phê duyệt ngân sách"
- Status: "Đã duyệt" (green)
- Approved amount: 4,500,000 VND

---

## PHẦN 4: User Management (4 phút)

### Bước 9 — Tạo Người Dùng

**Window B - ADMIN**

1. Bấm "Users"
2. Bấm "Tạo tài khoản"
3. Form điền:
   - Username: "defenseuser"
   - Họ và tên: "Defense Demo User"
   - Email: "defense@club.edu"
   - Mật khẩu: "Demo123456"
   - Vai trò: "CLUB_MEMBER"
4. Bấm "Tạo"

**Tôi nói:**
"Admin tạo tài khoản mới với vai trò Club Member. Hệ thống hỗ trợ 6 vai trò với permissions khác nhau."

**Kết quả cần thấy:**
- Toast: "Đã tạo tài khoản"
- User mới xuất hiện trong table

---

### Bước 10 — Khóa Tài Khoản

**Window B - ADMIN**

1. Trong table Users, tìm user vừa tạo
2. Bấm "Khóa"

**Tôi nói:**
"Admin có thể khóa tài khoản. Tài khoản bị khóa sẽ không thể đăng nhập."

**Kết quả cần thấy:**
- Toast: "Đã khóa tài khoản"
- Status thay đổi: "Đã khóa"

---

## PHẦN 5: Notifications (2 phút)

### Bước 11 — Kiểm Tra Notifications

**Window B - ADMIN**

1. Bấm "Notifications"
2. Xem các thông báo có sẵn
3. Bấm "Đánh dấu tất cả đã đọc"

**Tôi nói:**
"Notification system cập nhật khi người dùng truy cập trang Notifications hoặc refresh trang. Không phải real-time."

**Kết quả cần thấy:**
- Danh sách thông báo
- Filter: Tất cả, Chưa đọc, Đã đọc
- Count badge

---

## Tổng Kết (1 phút)

### Bước 12 — Kết Luận

**Tôi nói:**
"Tổng kết:
1. Authentication với JWT token và role-based access control
2. Report Lifecycle: Create → Submit → Forward → Approve/Reject
3. Finance: Budget Proposal → Approval → Settlement
4. User Management: Create, Lock/Unlock
5. Notifications với manual refresh

Tất cả features sử dụng REST API thực tế qua API Gateway."

---

## Checklist Phòng Thủ

| Bước | Tính năng | Thành công khi |
|------|-----------|-----------------|
| 1 | Login CLUB_MANAGER | Redirect to Dashboard |
| 2 | Login ADMIN | All menus visible |
| 3 | Create Report | Toast + Draft in table |
| 4 | Submit Report | Status: Đã gửi |
| 5 | Forward Report | Status: Đang xét duyệt |
| 6 | Admin Approve | Status: Đã duyệt |
| 7 | Create Budget | Toast + Card appears |
| 8 | Admin Approve Budget | Approved amount shown |
| 9 | Create User | Toast + User in table |
| 10 | Lock User | Status: Đã khóa |
| 11 | View Notifications | List loads correctly |

---

## Next Steps

➡️ Continue to [04-Emergency-FE-Demo-8-10-Minutes.md](04-Emergency-FE-Demo-8-10-Minutes.md)  
➡️ Back to [02-Full-FE-Demo-25-35-Minutes.md](02-Full-FE-Demo-25-35-Minutes.md)

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-21  
**Author**: Claude (Senior Frontend QA Engineer)
