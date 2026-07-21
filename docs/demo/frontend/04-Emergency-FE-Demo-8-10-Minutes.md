# Emergency Frontend Demo (8-10 Minutes)

**Phiên bản**: 1.0.0  
**Thời lượng**: 8-10 phút  
**Đối tượng**: Demo khẩn cấp - chỉ core features ổn định nhất

---

## Mục Tiêu

1. Chứng minh authentication và role-based access
2. Demo Report Lifecycle (complete flow)
3. Demo User Management
4. Chứng minh API calls thực tế

---

## Browser Setup

| Window | Browser | Actor |
|--------|---------|-------|
| Window A | Chrome | CLUB_MANAGER |
| Window B | Edge | ADMIN |

---

## Bước 1 — Authentication Demo (2 phút)

### Login ADMIN

**Window B - ADMIN**

1. Truy cập http://localhost:5173
2. Đăng nhập ADMIN

**Tôi nói:**
"Tôi đăng nhập với tài khoản Admin. Lưu ý sidebar có đầy đủ menus."

**Giảng viên nhìn thấy:**
- Dashboard với tất cả menus
- Avatar và role hiển thị trong header

---

## Bước 2 — User Management (2 phút)

**Window B - ADMIN**

1. Bấm "Users"
2. Bấm "Tạo tài khoản"
3. Form:
   - Username: "emergency"
   - Họ và tên: "Emergency User"
   - Email: "emergency@club.edu"
   - Mật khẩu: "Demo123456"
   - Vai trò: "CLUB_MEMBER"
4. Bấm "Tạo"

**Tôi nói:**
"Admin tạo tài khoản mới. User mới xuất hiện trong table."

**Kết quả:**
- Toast: "Đã tạo tài khoản"
- User trong table

---

## Bước 3 — Report Lifecycle (4 phút)

### Tạo Báo Cáo

**Window A - CLUB_MANAGER**

1. Bấm "Reports"
2. Bấm "Tạo báo cáo"
3. Form:
   - CLB: [Chọn CLB]
   - Kỳ: "2026-Q3"
   - Hạn nộp: [Chọn ngày]
   - Chi tiết: "Workshop Demo", [Ngày], "Demo", 20, "OK"
4. Bấm "Tạo bản nháp"

**Kết quả:**
- Toast success
- Row mới trong table

### Gửi Báo Cáo

**Window A - CLUB_MANAGER**

1. Bấm "Gửi duyệt" trên row vừa tạo
2. Status: "Đã gửi"

### Admin Phê Duyệt

**Window B - ADMIN**

1. Bấm "Reports"
2. Tìm báo cáo "Đã gửi"
3. Bấm "Phê duyệt"
4. Feedback: "OK"
5. Bấm "Xác nhận"

**Kết quả:**
- Status: "Đã duyệt" (green)

**Tôi nói:**
"Complete Report Lifecycle: Create (Draft) → Submit → Review/Forward → Approve. Mỗi action gọi API riêng."

---

## Bước 4 — Dashboard Overview (1 phút)

**Window B - ADMIN**

1. Bấm "Dashboard"

**Tôi nói:**
"Dashboard tổng hợp thông tin theo role: thống kê CLB, báo cáo, hoạt động, và thông báo."

---

## Tổng Kết

**Tôi nói:**
"Tổng kết:
1. Authentication với JWT và role-based access
2. User Management: Create, Edit, Lock
3. Report Lifecycle: Draft → Submit → Approve/Reject
4. Tất cả API calls thực tế qua REST endpoints"

---

## Success Criteria

| Action | Evidence |
|--------|----------|
| Login | Redirect to Dashboard |
| Create User | Toast + Table update |
| Create Report | Toast + Draft row |
| Submit Report | Status badge changes |
| Approve Report | Status: Đã duyệt |

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-21  
**Author**: Claude (Senior Frontend QA Engineer)
