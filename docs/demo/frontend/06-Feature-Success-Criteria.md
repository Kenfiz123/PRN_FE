# Feature Success Criteria

**Phiên bản**: 1.0.0  
**Ngày**: 2026-07-21

---

## 1. Authentication Features

### 1.1 Login

| Criteria | Evidence |
|----------|----------|
| Login thành công | Redirect đến /dashboard |
| Token được lưu | localStorage có accessToken |
| User info hiển thị | Avatar và tên trong sidebar/header |
| Sai credentials | Error message hiển thị |
| Toast thành công | "Welcome back to ClubReportHub!" |

**API Call**: `POST /api/auth/login`

---

### 1.2 Logout

| Criteria | Evidence |
|----------|----------|
| Logout thành công | Redirect đến /login |
| Token bị xóa | localStorage không có accessToken |
| Không access protected routes | Navigate về /login |

**API Call**: `POST /api/auth/logout`

---

### 1.3 Registration

| Criteria | Evidence |
|----------|----------|
| Registration thành công | Auto login và redirect đến /dashboard |
| User được tạo | Có thể login với credentials mới |

**API Call**: `POST /api/auth/register`

---

## 2. Dashboard Features

### 2.1 Dashboard Load

| Criteria | Evidence |
|----------|----------|
| Dashboard load thành công | Page hiển thị không lỗi |
| Stats cards hiển thị | CLB, Báo cáo, Hoạt động, Thông báo |
| Data theo role | Chỉ hiển thị data được phép |

**API Calls**: Multiple (clubs, reports, activities, notifications)

---

## 3. Club Features

### 3.1 View Clubs

| Criteria | Evidence |
|----------|----------|
| Clubs load | Grid các club cards hiển thị |
| Search hoạt động | Filter theo tên/code/description |
| Club info hiển thị | Tên, mã, mô tả, chủ CLB, số thành viên |

**API Call**: `GET /api/clubs`

---

### 3.2 Join Club

| Criteria | Evidence |
|----------|----------|
| Form mở | Modal join form hiển thị |
| Validation hoạt động | Bắt buộc nhập personalInfo, goals, reason |
| Submit thành công | Toast "Đã gửi đơn tham gia [CLB]" |
| Status thay đổi | Badge "Đang chờ duyệt" |

**API Call**: `POST /api/clubs/{id}/join`

**Validation**:
- personalInfo: required
- goals: required
- reason: required

---

### 3.3 Review Membership (Club Manager)

| Criteria | Evidence |
|----------|----------|
| Pending list hiển thị | Section "Đơn chờ chủ CLB xét duyệt" |
| Approve thành công | Toast "Đã duyệt [name] vào [CLB]" |
| Reject thành công | Toast "Đã từ chối đơn của [name]" |
| Đơn biến mất | Không còn trong pending list |

**API Calls**:
- `POST /api/clubs/memberships/{id}/approve`
- `POST /api/clubs/memberships/{id}/reject`

---

## 4. Report Features

### 4.1 Create Report

| Criteria | Evidence |
|----------|----------|
| Form mở | Modal create report hiển thị |
| Validation hoạt động | Bắt buộc: CLB, period, dueDate, activityName, activityDate |
| Submit thành công | Toast "Đã tạo bản nháp báo cáo" |
| Row mới xuất hiện | Table cập nhật với draft row |
| Status đúng | Badge "Bản nháp" (amber) |

**API Call**: `POST /api/reports`

**Validation**:
- clubId: required
- period: required
- dueDate: required
- activityName: required
- activityDate: required

---

### 4.2 Submit Report

| Criteria | Evidence |
|----------|----------|
| Submit thành công | Toast "Đã gửi báo cáo để xét duyệt" |
| Status thay đổi | Badge "Đã gửi" (cyan) |
| Nút "Gửi duyệt" biến mất | Không còn action submit |

**API Call**: `POST /api/reports/{id}/submit`

---

### 4.3 Forward Report (Club Manager)

| Criteria | Evidence |
|----------|----------|
| Forward thành công | Toast "Đã chuyển báo cáo lên phê duyệt cuối" |
| Status thay đổi | Badge "Đang xét duyệt" (purple) |
| Feedback được lưu | Có thể xem trong chi tiết |

**API Call**: `POST /api/reports/{id}/review`

---

### 4.4 Approve Report (Admin)

| Criteria | Evidence |
|----------|----------|
| Approve thành công | Toast "Đã phê duyệt báo cáo" |
| Status thay đổi | Badge "Đã duyệt" (green) |
| Feedback được lưu | Hiển thị trong chi tiết báo cáo |

**API Call**: `POST /api/reports/{id}/approve`

---

### 4.5 Reject Report (Admin)

| Criteria | Evidence |
|----------|----------|
| Reject thành công | Toast "Đã từ chối báo cáo" |
| Status thay đổi | Badge "Bị từ chối" (rose) |
| Lý do được lưu | Hiển thị trong chi tiết |
| Có thể resubmit | Nút "Gửi duyệt" xuất hiện lại |

**API Call**: `POST /api/reports/{id}/reject`

**Validation**:
- feedback: required (lý do từ chối)

---

## 5. Activity Features

### 5.1 View Activities

| Criteria | Evidence |
|----------|----------|
| Activities load | Grid các activity cards |
| Status hiển thị | Badge SCHEDULED, COMPLETED |
| Participants count | Số người đăng ký |

**API Call**: `GET /api/activities`

---

### 5.2 Create Activity (Club Manager)

| Criteria | Evidence |
|----------|----------|
| Form validation | Bắt buộc: CLB, title, startTime, endTime, location |
| Create thành công | Toast "Đã tạo hoạt động" |
| Activity mới xuất hiện | Grid cập nhật |
| Status đúng | "SCHEDULED" |

**API Call**: `POST /api/activities`

**Validation**:
- clubId: required
- title: required
- startTime: required
- endTime: required (must be after startTime)
- location: required

---

### 5.3 Register Participation

| Criteria | Evidence |
|----------|----------|
| Register thành công | Toast "Đã đăng ký tham gia hoạt động" |
| Button thay đổi | "Đã đăng ký" (disabled) |
| Participants count tăng | Số tăng lên 1 |

**API Call**: `POST /api/activities/{id}/participants`

---

### 5.4 Complete Activity

| Criteria | Evidence |
|----------|----------|
| Complete thành công | Toast "Đã đánh dấu hoạt động hoàn tất" |
| Status thay đổi | "COMPLETED" (green) |
| Button biến mất | Không còn nút "Tham gia" |

**API Call**: `PATCH /api/activities/{id}/complete`

---

## 6. Finance Features

### 6.1 View Finance

| Criteria | Evidence |
|----------|----------|
| Finance page load | Proposals grid |
| Stats hiển thị | Tổng đề xuất, đang chờ, ngân sách duyệt, đã quyết toán |

**API Calls**:
- `GET /api/finance/proposals`
- `GET /api/finance/transactions`

---

### 6.2 Create Budget Proposal

| Criteria | Evidence |
|----------|----------|
| Form validation | Bắt buộc: CLB, title, description, requestedAmount |
| Create thành công | Toast "Đã gửi đề xuất ngân sách" |
| Card mới xuất hiện | Status "Đang chờ" (amber) |

**API Call**: `POST /api/finance/proposals`

**Validation**:
- clubId: required
- title: required
- description: required
- requestedAmount: required, > 0

---

### 6.3 Approve Budget (Admin)

| Criteria | Evidence |
|----------|----------|
| Approve thành công | Toast "Đã phê duyệt ngân sách" |
| Status thay đổi | "Đã duyệt" (green) |
| Approved amount hiển thị | Số tiền được duyệt |
| Nút "Gửi quyết toán" xuất hiện | Cho TREASURER |

**API Call**: `POST /api/finance/proposals/{id}/approve`

**Validation**:
- approvedAmount: required, > 0

---

### 6.4 Reject Budget (Admin)

| Criteria | Evidence |
|----------|----------|
| Reject thành công | Toast "Đã từ chối đề xuất" |
| Status thay đổi | "Bị từ chối" (rose) |

**API Call**: `POST /api/finance/proposals/{id}/reject`

**Validation**:
- note: required

---

### 6.5 Submit Settlement

| Criteria | Evidence |
|----------|----------|
| Form validation | Bắt buộc: totalSpent, receiptUrl (https://) |
| Submit thành công | Toast "Đã gửi quyết toán" |
| Settlement row xuất hiện | Dưới proposal |

**API Call**: `POST /api/finance/proposals/{id}/settlements`

**Validation**:
- totalSpent: required, > 0
- receiptUrl: required, must be https://

---

### 6.6 Approve Settlement

| Criteria | Evidence |
|----------|----------|
| Approve thành công | Toast "Đã duyệt quyết toán" |
| Settlement status thay đổi | "Đã quyết toán" (green) |

**API Call**: `POST /api/finance/settlements/{id}/approve`

---

## 7. Notification Features

### 7.1 View Notifications

| Criteria | Evidence |
|----------|----------|
| Notifications load | List hiển thị |
| Unread count badge | Số thông báo chưa đọc |
| Filter hoạt động | Tất cả, Chưa đọc, Đã đọc |

**API Call**: `GET /api/notifications`

**Lưu ý**: KHÔNG PHẢI real-time - cần refresh để thấy thông báo mới

---

### 7.2 Mark as Read

| Criteria | Evidence |
|----------|----------|
| Click notification | isRead = true |
| Visual thay đổi | Background thành slate-900, dot thành gray |
| Unread count giảm | Badge count giảm |

**API Call**: `PUT /api/notifications/{id}/read`

---

### 7.3 Mark All as Read

| Criteria | Evidence |
|----------|----------|
| Click button | Toast "Đã đánh dấu tất cả thông báo là đã đọc" |
| Tất cả đọc | Unread count = 0 |

**API Call**: `PUT /api/notifications/read-all`

---

## 8. User Management Features

### 8.1 View Users

| Criteria | Evidence |
|----------|----------|
| Users load | Table với users |
| Search hoạt động | Filter theo name, email, username, role |

**API Call**: `GET /api/users`

---

### 8.2 Create User

| Criteria | Evidence |
|----------|----------|
| Form validation | Bắt buộc: username, fullName, email, password, role |
| Create thành công | Toast "Đã tạo tài khoản" |
| User mới xuất hiện | Table cập nhật |

**API Call**: `POST /api/users`

**Validation**:
- username: required
- fullName: required
- email: required, valid email
- password: required, min 8 chars
- roles: required, array

---

### 8.3 Edit User

| Criteria | Evidence |
|----------|----------|
| Edit thành công | Toast "Đã cập nhật tài khoản" |
| Changes preserved | Reload vẫn đúng |

**API Call**: `PUT /api/users/{id}`

---

### 8.4 Lock User

| Criteria | Evidence |
|----------|----------|
| Lock thành công | Toast "Đã khóa tài khoản" |
| Status thay đổi | "Đã khóa" (rose) |
| Button thay đổi | "Mở khóa" |

**API Call**: `PATCH /api/users/{id}/lock`

---

### 8.5 Unlock User

| Criteria | Evidence |
|----------|----------|
| Unlock thành công | Toast "Đã mở khóa tài khoản" |
| Status thay đổi | "Hoạt động" (green) |
| Button thay đổi | "Khóa" |

**API Call**: `PATCH /api/users/{id}/unlock`

---

## 9. Profile Features

### 9.1 View Profile

| Criteria | Evidence |
|----------|----------|
| Profile load | Thông tin user hiển thị |
| Roles hiển thị | Badges cho mỗi role |
| Club access hiển thị | Danh sách CLB với permissions |

**Special Case - SYSTEM_ADMIN**:
- Special creative UI với video background
- Editable profile fields
- Activity timeline mock

---

## 10. Common Validation Errors

| Field Error | Message |
|-------------|---------|
| Required field missing | "Vui lòng nhập đầy đủ..." |
| Invalid email | "Email không hợp lệ" |
| Password too short | "Mật khẩu phải có ít nhất 8 ký tự" |
| Amount <= 0 | "Số tiền phải lớn hơn 0" |
| End time before start | "Thời gian kết thúc phải sau thời gian bắt đầu" |
| HTTPS required | "URL chứng từ phải là https://" |

---

## 11. Error Handling

### 11.1 Network Errors

| Error | UI Behavior |
|-------|-------------|
| 401 Unauthorized | Redirect to /login |
| 403 Forbidden | Show toast "Bạn không có quyền..." |
| 404 Not Found | Show toast "Không tìm thấy..." |
| 409 Conflict | Show specific error message |
| 429 Rate Limit | Show toast "Too many attempts..." |
| 500 Server Error | Show toast "Lỗi server..." |

### 11.2 Validation Errors

| Behavior | Description |
|----------|-------------|
| Inline error | Red text dưới field |
| Form disabled | Submit button disabled |
| Loading state | Spinner on button |

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-21  
**Author**: Claude (Senior Frontend QA Engineer)
