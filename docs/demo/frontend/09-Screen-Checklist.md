# Screen Checklist

**Phiên bản**: 1.0.0  
**Ngày**: 2026-07-21

---

## 1. Login Screen

### 1.1 LoginPage (`/login`)

| Element | Checkpoint | Status |
|---------|------------|--------|
| Logo | ClubReportHub logo hiển thị | ☐ |
| Email/Username field | Placeholder "admin@club.edu" | ☐ |
| Password field | Masked input | ☐ |
| Submit button | Text "Access System" | ☐ |
| Loading state | Spinner khi submitting | ☐ |
| Error state | Error message khi fail | ☐ |
| Link to Register | "Create Account" link | ☐ |
| Footer version | "ClubReportHub v2.0.0" | ☐ |

### 1.2 After Login

| Checkpoint | Expected Result |
|------------|-----------------|
| Redirect | → /dashboard |
| User in localStorage | accessToken present |
| Sidebar visible | Full navigation |
| User avatar | Shows in header |

---

## 2. Dashboard Screen

### 2.1 DashboardPage (`/dashboard`)

| Section | Element | Status |
|---------|---------|--------|
| Header | "Xin chào, [name]" | ☐ |
| Stats Cards | CLB có quyền | ☐ |
| Stats Cards | Báo cáo hiển thị | ☐ |
| Stats Cards | Hoạt động | ☐ |
| Stats Cards | Thông báo chưa đọc | ☐ |
| Section | Hoạt động sắp tới | ☐ |
| Section | Thông báo mới | ☐ |
| Link | "Xem tất cả" links | ☐ |

### 2.2 Dashboard by Role

| Role | Visible Sections |
|------|------------------|
| ADMIN | All sections |
| CLUB_MANAGER | Own clubs, reports, activities |
| TREASURER | Finance, reports |
| CLUB_MEMBER | Joined clubs, activities |

---

## 3. Clubs Screen

### 3.1 ClubsPage (`/clubs`)

| Section | Element | Status |
|---------|---------|--------|
| Header | "Chọn CLB phù hợp với bạn" | ☐ |
| Search | Search input | ☐ |
| Stats | CLB đang hoạt động | ☐ |
| Stats | CLB đang tham gia | ☐ |
| Stats | Đơn đang chờ | ☐ |
| Stats | Đơn cần tôi duyệt | ☐ |
| Pending Section | "Đơn chờ chủ CLB xét duyệt" | ☐ |
| Club Grid | Club cards | ☐ |

### 3.2 Club Card

| Element | Expected |
|---------|---------|
| Club initial | First letter of name |
| Club code | Uppercase |
| Club name | Bold |
| Description | Line-clamp-3 |
| Members count | Number |
| Join button | "Đăng ký tham gia" |
| Status badge | "Đang chờ duyệt", "Đã là thành viên" |

### 3.3 Join Club Modal

| Field | Validation |
|-------|------------|
| Thông tin cá nhân | Required |
| Mục tiêu | Required |
| Lý do chọn CLB | Required |
| Lời nhắn thêm | Optional |

---

## 4. Reports Screen

### 4.1 ReportsPage (`/reports`)

| Section | Element | Status |
|---------|---------|--------|
| Header | "Báo cáo" | ☐ |
| Create button | "Tạo báo cáo" (gradient) | ☐ |
| Stats | Tổng báo cáo | ☐ |
| Stats | Bản nháp | ☐ |
| Stats | Đang xét duyệt | ☐ |
| Stats | Đã duyệt | ☐ |
| Search | Search input | ☐ |
| Filter | Status dropdown | ☐ |
| Table | Reports table | ☐ |

### 4.2 Report Table Columns

| Column | Content |
|--------|---------|
| CLB / Kỳ | Club name + period |
| Loại | Report type + tag |
| Hạn nộp | Due date |
| Trạng thái | Status badge |
| Thao tác | Action buttons |

### 4.3 Report Status Badges

| Status | Color | Badge Text |
|--------|-------|------------|
| DRAFT | Amber | "Bản nháp" |
| SUBMITTED | Cyan | "Đã gửi" |
| UNDER_REVIEW | Purple | "Đang xét duyệt" |
| APPROVED | Green | "Đã duyệt" |
| REJECTED | Rose | "Bị từ chối" |

### 4.4 Report Action Buttons

| Status | Actor | Buttons |
|--------|-------|---------|
| DRAFT | Creator | "Gửi duyệt" |
| SUBMITTED | Other Manager | "Chuyển duyệt", "Từ chối" |
| UNDER_REVIEW | Admin | "Phê duyệt", "Từ chối" |
| REJECTED | Creator | "Gửi duyệt" |

---

## 5. Activities Screen

### 5.1 ActivitiesPage (`/activities`)

| Section | Element | Status |
|---------|---------|--------|
| Header | "Hoạt động CLB" | ☐ |
| Create button | "Tạo hoạt động" (gradient) | ☐ |
| Stats | Tổng hoạt động | ☐ |
| Stats | Sắp diễn ra | ☐ |
| Stats | Đã hoàn tất | ☐ |
| Stats | Lượt đăng ký | ☐ |
| Search | Search input | ☐ |
| Filter | Status dropdown | ☐ |
| Grid | Activity cards | ☐ |

### 5.2 Activity Card

| Element | Expected |
|---------|---------|
| Club badge | Cyan background |
| Title | Bold |
| Description | Line-clamp-3 |
| Start time | Formatted date |
| Location | Text |
| Participants | Count |
| Register button | "Tham gia" / "Đã đăng ký" |

---

## 6. Finance Screen

### 6.1 FinancePage (`/finance`)

| Section | Element | Status |
|---------|---------|--------|
| Header | "Tài chính" | ☐ |
| Create button | "Tạo đề xuất" (gradient) | ☐ |
| Stats | Đề xuất | ☐ |
| Stats | Đang chờ | ☐ |
| Stats | Ngân sách duyệt | ☐ |
| Stats | Đã quyết toán | ☐ |
| Filter | Status dropdown | ☐ |
| Grid | Proposal cards | ☐ |

### 6.2 Budget Proposal Card

| Element | Expected |
|---------|----------|
| Club badge | Cyan |
| Title | Bold |
| Description | Text |
| Requested amount | Formatted VND |
| Approved amount | Formatted VND (or "—") |
| Status badge | Amber/Green/Rose |
| Action buttons | Approve/Reject/Settlement |

---

## 7. Notifications Screen

### 7.1 NotificationsPage (`/notifications`)

| Section | Element | Status |
|---------|---------|--------|
| Header | "Thông báo" | ☐ |
| Count | "X thông báo chưa đọc" | ☐ |
| Mark all button | "Đánh dấu tất cả đã đọc" | ☐ |
| Filter tabs | Tất cả / Chưa đọc / Đã đọc | ☐ |
| List | Notification cards | ☐ |

### 7.2 Notification Card

| Element | Unread State | Read State |
|---------|--------------|------------|
| Dot | Cyan | Gray |
| Background | Cyan tint | Slate |
| Title | Bold white | Normal gray |
| Time | Formatted | Formatted |
| Event type | Badge | Badge |

---

## 8. Profile Screen

### 8.1 Standard Profile (Non-SYSTEM_ADMIN)

| Section | Element | Status |
|---------|---------|--------|
| Avatar | Gradient circle | ☐ |
| Name | Bold | ☐ |
| Username | @username | ☐ |
| Status | Active/Locked | ☐ |
| Info | Full name, Email | ☐ |
| Roles | Badges | ☐ |
| Clubs section | Approved clubs list | ☐ |

### 8.2 SystemAdmin Profile (SYSTEM_ADMIN)

| Section | Element | Status |
|---------|---------|--------|
| Video background | Animation | ☐ |
| Avatar | With glow | ☐ |
| Edit button | "Edit profile" | ☐ |
| Bio | Editable textarea | ☐ |
| Profile stats | Join date, Role, Status | ☐ |
| Activity panel | Recent activity | ☐ |

---

## 9. Users Screen

### 9.1 UsersPage (`/users`)

| Section | Element | Status |
|---------|---------|--------|
| Header | "Quản lý người dùng" | ☐ |
| Create button | "Tạo tài khoản" (gradient) | ☐ |
| Search | Search input | ☐ |
| Table | Users table | ☐ |

### 9.2 User Table Columns

| Column | Content |
|--------|---------|
| Người dùng | Name + Username + Email |
| Vai trò | Role badge |
| Trạng thái | Active/Locked |
| Thao tác | Edit, Lock/Unlock |

---

## 10. Create/Edit Modals

### 10.1 Create Report Modal

| Field | Type | Required |
|-------|------|----------|
| CLB | Dropdown | ✓ |
| Kỳ báo cáo | Text | ✓ |
| Hạn nộp | Date | ✓ |
| Loại báo cáo | Text | ✓ |
| Nhãn | Text | ✓ |
| Tên hoạt động | Text | ✓ |
| Ngày hoạt động | Date | ✓ |
| Mô tả | Textarea | - |
| Người tham gia | Number | - |
| Kết quả | Text | - |

### 10.2 Create Budget Modal

| Field | Type | Required |
|-------|------|----------|
| CLB | Dropdown | ✓ |
| Tiêu đề | Text | ✓ |
| Mô tả | Textarea | ✓ |
| Số tiền | Number | ✓ |
| Mã hoạt động | Number | - |

### 10.3 Create Activity Modal

| Field | Type | Required |
|-------|------|----------|
| CLB | Dropdown | ✓ |
| Tiêu đề | Text | ✓ |
| Mô tả | Textarea | - |
| Bắt đầu | Datetime | ✓ |
| Kết thúc | Datetime | ✓ |
| Địa điểm | Text | ✓ |

### 10.4 Create User Modal

| Field | Type | Required |
|-------|------|----------|
| Username | Text | ✓ |
| Họ và tên | Text | ✓ |
| Email | Email | ✓ |
| Mật khẩu | Password | ✓ |
| Vai trò | Dropdown | ✓ |

---

## 11. Toast Notifications

### 11.1 Success Toasts

| Action | Toast Message |
|--------|---------------|
| Login | "Welcome back to ClubReportHub!" |
| Create Report | "Đã tạo bản nháp báo cáo." |
| Submit Report | "Đã gửi báo cáo để xét duyệt." |
| Approve Report | "Đã phê duyệt báo cáo." |
| Reject Report | "Đã từ chối báo cáo." |
| Create Budget | "Đã gửi đề xuất ngân sách." |
| Approve Budget | "Đã phê duyệt ngân sách." |
| Create User | "Đã tạo tài khoản." |
| Lock User | "Đã khóa tài khoản." |
| Unlock User | "Đã mở khóa tài khoản." |

### 11.2 Error Toasts

| Error | Message |
|-------|---------|
| Login fail | "Invalid credentials. Please try again." |
| Network error | "Không thể tải..." |
| Validation fail | "Vui lòng nhập đầy đủ..." |
| 403 Forbidden | "Bạn không có quyền..." |

---

## 12. Empty States

| Screen | Empty Message |
|--------|---------------|
| Reports | "Chưa có báo cáo phù hợp." |
| Activities | "Chưa có hoạt động phù hợp với quyền của bạn." |
| Finance | "Chưa có đề xuất ngân sách." |
| Notifications | "Không có thông báo trong nhóm này." |
| Clubs | "Chưa có câu lạc bộ phù hợp." |
| Users | N/A (always has users) |

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-21  
**Author**: Claude (Senior Frontend QA Engineer)
