# Multi-Account Setup Guide

**Phiên bản**: 1.0.0  
**Ngày**: 2026-07-21

---

## 1. Tổng Quan

Frontend ClubReportHub sử dụng **localStorage** để lưu trữ authentication tokens.

### 1.1 Token Storage Details

| Key | Content |
|-----|---------|
| `accessToken` | JWT Bearer token |
| `refreshToken` | Refresh token |
| `user` | User profile JSON |

### 1.2 Multi-Account Limitation

> **CRITICAL**: localStorage được chia sẻ trong cùng một browser profile.

- **Cùng profile**: Nếu đăng nhập User A, rồi đăng nhập User B trong cùng tab, User A sẽ bị đăng xuất
- **Khác profile**: Các browser profiles có localStorage riêng biệt
- **Incognito**: Có localStorage riêng nhưng bị xóa khi đóng

---

## 2. Browser Profile Strategy

### 2.1 Recommended Setup

| Profile | Browser | Actor | Use Case |
|---------|---------|-------|----------|
| Profile 1 | Chrome | CLUB_MANAGER | Tạo content, manage clubs |
| Profile 1 | Chrome | TREASURER | Finance workflows |
| Profile 1 | Chrome | CLUB_MEMBER | Browse clubs, activities |
| Profile 2 | Edge | ADMIN | Review và approve |
| Profile 2 | Edge | SYSTEM_ADMIN | User management demo |
| Profile 3 | Firefox | (Optional) | Extra actor if needed |

### 2.2 Chrome Profile Setup

1. Mở Chrome
2. Click avatar trên thanh address
3. Click "Add"
4. Đặt tên: "ClubReportHub - Actor A"
5. Tạo thêm profile: "ClubReportHub - Actor B"

### 2.3 Edge Profile Setup

1. Mở Edge
2. Settings → Profiles → Add profile
3. Tạo profile mới

---

## 3. Account Preparation

### 3.1 Required Demo Accounts

| Actor | Role | Profile | Status |
|-------|------|---------|--------|
| DemoAdmin | ADMIN | Profile 2 | Required |
| DemoSysAdmin | SYSTEM_ADMIN | Profile 2 | Optional |
| DemoStuAffairs | STUDENT_AFFAIRS_ADMIN | Profile 2 | Optional |
| DemoManager | CLUB_MANAGER | Profile 1 | Required |
| DemoTreasurer | TREASURER | Profile 1 | Required |
| DemoMember | CLUB_MEMBER | Profile 1 | Optional |

### 3.2 Pre-Demo Checklist

- [ ] Tất cả accounts đã được tạo trong database
- [ ] Accounts có quyền tương ứng (role + clubAccess)
- [ ] Passwords đã được đặt (không để default)
- [ ] Clubs đã được tạo với managers gán đúng
- [ ] Test login thành công cho mỗi account

---

## 4. Demo Scenarios

### 4.1 Single Actor Demo

**Khi nào**: Demo độc lập từng actor

**Cách làm**:
1. Mở Chrome Profile 1
2. Login với Actor 1
3. Demo các features của Actor 1
4. Logout
5. Login với Actor 2 (nếu cần)
6. Demo features của Actor 2

**Lưu ý**: Mỗi lần logout/login mất khoảng 30 giây

### 4.2 Cross-Actor Demo

**Khi nào**: Demo workflows qua nhiều actors (Report approval, Budget approval)

**Cách làm**:
1. **Profile 1**: Login với CLUB_MANAGER
2. **Profile 2**: Login với ADMIN
3. **Profile 1**: Tạo và gửi báo cáo
4. **Profile 2**: Refresh Reports page
5. **Profile 2**: Approve báo cáo
6. **Profile 1**: Refresh Reports page → Xem status đã thay đổi

### 4.3 Two-Actor Finance Demo

**Cách làm**:
1. **Profile 1**: Login với TREASURER
2. **Profile 2**: Login với ADMIN
3. **Profile 1**: Tạo budget proposal
4. **Profile 2**: Refresh Finance → Approve
5. **Profile 1**: Submit settlement
6. **Profile 2**: Approve settlement

---

## 5. Real-Time Notification Workaround

### 5.1 The Problem

Frontend KHÔNG có real-time notifications (no WebSocket/SignalR/SSE).

### 5.2 The Workaround

**Option A: Refresh Manual**
1. Actor A thực hiện action
2. Switch sang Actor B
3. Actor B bấm F5 hoặc navigate đến trang Notifications

**Option B: Navigate**
1. Actor A thực hiện action
2. Switch sang Actor B
3. Actor B click Notifications menu
4. List tự động reload

**Option C: Keep Page Open**
1. Actor B mở sẵn trang Notifications
2. Actor A thực hiện action
3. Actor B bấm F5 hoặc click icon bell

### 5.3 Script for Demo

```
# Sau khi ClubManager submit report
Nói: "Báo cáo đã được gửi. Bây giờ tôi chuyển sang tài khoản Admin."
Thao tác: Switch sang Profile 2
Nói: "Tôi refresh trang Reports để thấy báo cáo mới."
Thao tác: F5 hoặc navigate to /reports
```

---

## 6. Profile Switching Guide

### 6.1 Switching in Chrome

**Cách 1: Profile Menu**
1. Click avatar trên address bar
2. Chọn profile khác
3. Browser mở cửa sổ mới với profile đó

**Cách 2: Keyboard Shortcut**
- Windows: `Shift + Ctrl + M` → Chọn profile

### 6.2 Switching in Edge

1. Click avatar trên address bar
2. Chọn profile hoặc "Add profile"

### 6.3 Incognito Mode

**Ưu điểm**: Nhanh, không cần setup profile
**Nhược điểm**: localStorage bị xóa khi đóng

```bash
# Chrome Incognito
Ctrl + Shift + N

# Edge InPrivate
Ctrl + Shift + P
```

---

## 7. Troubleshooting

### 7.1 Token Conflict

**Vấn đề**: Đăng nhập User B nhưng vẫn thấy User A

**Nguyên nhân**: Cùng tab/browser profile

**Giải pháp**:
1. Mở tab mới trong profile khác
2. Hoặc dùng Incognito

### 7.2 Stale Data

**Vấn đề**: Dữ liệu không cập nhật sau action

**Giải pháp**:
1. F5 (Refresh) trang hiện tại
2. Navigate đến trang khác rồi quay lại
3. Check DevTools → Network để xem API calls

### 7.3 Session Expiry

**Vấn đề**: Bị redirect về login

**Nguyên nhân**: Token hết hạn

**Giải pháp**:
1. Đăng nhập lại
2. Check thời gian demo (token có thể expire sau 1-24h tùy backend)

---

## 8. Demo Sequence Templates

### 8.1 Template A: Report Lifecycle

```
Timeline:
00:00 - Setup: Login CLUB_MANAGER (Profile 1), ADMIN (Profile 2)
02:00 - CLUB_MANAGER: Create report
03:00 - CLUB_MANAGER: Submit report
04:00 - Switch to ADMIN
04:30 - ADMIN: Approve report
05:30 - Switch to CLUB_MANAGER
06:00 - CLUB_MANAGER: Verify status changed
07:00 - DONE
```

### 8.2 Template B: Finance Workflow

```
Timeline:
00:00 - Setup: Login TREASURER (Profile 1), ADMIN (Profile 2)
02:00 - TREASURER: Create budget proposal
03:00 - Switch to ADMIN
03:30 - ADMIN: Approve budget
04:30 - Switch to TREASURER
05:00 - TREASURER: Submit settlement
06:00 - Switch to ADMIN
06:30 - ADMIN: Approve settlement
07:30 - DONE
```

### 8.3 Template C: Combined Demo

```
Timeline:
00:00 - Login ADMIN (Profile 2)
02:00 - Create user
04:00 - Switch to CLUB_MANAGER (Profile 1)
05:00 - Create report
07:00 - Submit report
08:00 - Switch to ADMIN
08:30 - Review and approve
10:00 - DONE
```

---

## 9. Quick Reference

| Scenario | Profile 1 | Profile 2 |
|----------|-----------|-----------|
| Report Demo | CLUB_MANAGER | ADMIN |
| Finance Demo | TREASURER | ADMIN |
| Club Demo | CLUB_MANAGER | - |
| User Demo | - | ADMIN |
| Notification Demo | CLUB_MANAGER | ADMIN |

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-21  
**Author**: Claude (Senior Frontend QA Engineer)
