# ClubReportHub Frontend - Demo Master Document

**Phiên bản**: 1.0.0  
**Ngày**: 2026-07-21  
**Trạng thái**: HOÀN CHỈNH

---

## Mục Lục

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Quick Start Guide](#2-quick-start-guide)
3. [Demo Versions](#3-demo-versions)
4. [Actors & Roles](#4-actors--roles)
5. [Feature Overview](#5-feature-overview)
6. [Browser Setup](#6-browser-setup)
7. [Demo Scripts](#7-demo-scripts)
8. [Success Criteria](#8-success-criteria)
9. [Troubleshooting](#9-troubleshooting)
10. [Reference Documents](#10-reference-documents)

---

## 1. Tổng Quan Hệ Thống

### 1.1 Frontend Information

| Attribute | Value |
|-----------|-------|
| **Framework** | React 18.2.0 + Vite 5.0.0 |
| **URL** | http://localhost:5173 |
| **API Base URL** | http://localhost:7000 |
| **Token Storage** | localStorage |
| **Notification Mode** | Manual Refresh (KHÔNG real-time) |

### 1.2 Technology Stack

- **UI**: React + Tailwind CSS
- **Routing**: React Router DOM v6
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **API**: REST via fetch

### 1.3 Key Files

| File | Purpose |
|------|---------|
| `src/App.jsx` | Routes configuration |
| `src/services/api.js` | API service layer |
| `src/auth/permissions.js` | Role & permission definitions |
| `src/context/AuthContext.jsx` | Authentication context |

---

## 2. Quick Start Guide

### 2.1 Start Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not done)
npm install

# Start development server
npm run dev

# Frontend URL: http://localhost:5173
```

### 2.2 Login Credentials

| Actor | Username | Password | Notes |
|-------|----------|---------|-------|
| Admin | admin | (from seed) | Full access |
| System Admin | sysadmin | (from seed) | User management |
| Club Manager | manager | (from seed) | Create reports/activities |
| Treasurer | treasurer | (from seed) | Finance workflows |
| Club Member | member | (from seed) | Browse clubs |

### 2.3 Important Notes

> ⚠️ **Notification KHÔNG phải real-time**
> 
> Sau khi Actor A thực hiện action, Actor B cần:
> - Navigate đến trang Notifications, HOẶC
> - Refresh page (F5)
> 
> **KHÔNG nói**: "Bạn sẽ thấy thông báo real-time"

> ⚠️ **localStorage shared trong cùng browser profile**
> 
> - Dùng Chrome Profile 1 cho Actor A
> - Dùng Chrome Profile 2 hoặc Edge cho Actor B
> - KHÔNG đăng nhập 2 tài khoản trong cùng tab/profile

---

## 3. Demo Versions

### 3.1 Full Demo (25-35 Phút)

**File**: [02-Full-FE-Demo-25-35-Minutes.md](02-Full-FE-Demo-25-35-Minutes.md)

**Coverage**:
- ✅ Login với multiple roles
- ✅ Dashboard overview
- ✅ Report lifecycle complete
- ✅ Finance workflow
- ✅ Club membership
- ✅ Activity management
- ✅ User management
- ✅ Notification system

### 3.2 Defense Demo (15-20 Phút)

**File**: [03-Defense-FE-Demo-15-20-Minutes.md](03-Defense-FE-Demo-15-20-Minutes.md)

**Coverage**:
- ✅ Authentication & RBAC
- ✅ Report lifecycle
- ✅ Finance workflow
- ✅ User management
- ✅ Notifications

### 3.3 Emergency Demo (8-10 Phút)

**File**: [04-Emergency-FE-Demo-8-10-Minutes.md](04-Emergency-FE-Demo-8-10-Minutes.md)

**Coverage**:
- ✅ Authentication
- ✅ User management
- ✅ Report lifecycle
- ✅ Dashboard overview

---

## 4. Actors & Roles

### 4.1 Role Definitions

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access: reports review, finance review, user management |
| **SYSTEM_ADMIN** | User management, special profile UI |
| **STUDENT_AFFAIRS_ADMIN** | Reports review, finance review, club governance |
| **CLUB_MANAGER** | Create reports, manage activities, review memberships |
| **TREASURER** | Create budget proposals, submit settlements |
| **CLUB_MEMBER** | Browse clubs, join clubs, register activities |

### 4.2 Role-Based Navigation

| Menu | ADMIN | SYS_ADMIN | STU_ADMIN | MGR | TREAS | MEM |
|------|:----:|:---------:|:---------:|:---:|:-----:|:---:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Clubs | ✓ | | ✓ | ✓ | ✓ | ✓ |
| Reports | ✓ | | ✓ | ✓ | ✓ | ✓ |
| Activities | ✓ | | ✓ | ✓ | ✓ | ✓ |
| Finance | ✓ | | ✓ | | ✓ | |
| Notifications | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Users | ✓ | ✓ | | | | |

### 4.3 Browser Assignment

| Window | Browser | Actor | Purpose |
|--------|---------|-------|---------|
| Window A | Chrome Profile 1 | CLUB_MANAGER | Create content |
| Window B | Edge | ADMIN | Review & approve |

---

## 5. Feature Overview

### 5.1 Report Lifecycle

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CLUB_MANAGER  │────▶│   CLUB_MANAGER  │────▶│  ADMIN/STU_ADMIN │
│  (Create Draft) │     │   (Submit)      │     │  (Approve/Reject│
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
   1. CREATE              2. SUBMIT              3. APPROVE/REJECT
   → DRAFT               → SUBMITTED             → APPROVED/REJECTED
                           3. FORWARD
                        → UNDER_REVIEW
```

### 5.2 Finance Lifecycle

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    TREASURER    │────▶│     ADMIN       │────▶│    TREASURER    │
│(Create Budget)  │     │(Approve/Reject)│     │(Submit Settle) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
   1. CREATE              2. APPROVE             3. SETTLEMENT
   → PENDING              → APPROVED              → SUBMITTED
                                                      │
                                                      ▼
                                             ┌─────────────────┐
                                             │     ADMIN       │
                                             │(Approve Settle)│
                                             └─────────────────┘
                                                      │
                                                 4. APPROVE
                                              → SETTLED
```

### 5.3 Club Membership

```
┌─────────────────┐     ┌─────────────────┐
│  CLUB_MEMBER    │────▶│   CLUB_MANAGER  │
│  (Join Club)    │     │(Approve/Reject) │
└─────────────────┘     └─────────────────┘
        │                       │
   1. JOIN                  2. APPROVE
   → PENDING                → APPROVED
```

### 5.4 Activity Lifecycle

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CLUB_MANAGER  │────▶│   CLUB_MEMBER   │────▶│   CLUB_MANAGER  │
│(Create Activity)│     │(Register)      │     │(Complete)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
   1. CREATE               2. REGISTER             3. COMPLETE
   → SCHEDULED             Participants++            → COMPLETED
```

---

## 6. Browser Setup

### 6.1 Chrome Profile Setup

1. Mở Chrome → Click avatar → Add
2. Tên: "ClubReportHub - Actor A"
3. Tạo thêm profile cho Actor B

### 6.2 Multi-Account Strategy

**Xem chi tiết**: [05-Multi-Account-Setup.md](05-Multi-Account-Setup.md)

### 6.3 Token Storage

| Key | Content |
|-----|---------|
| `accessToken` | JWT Bearer token |
| `refreshToken` | Refresh token |
| `user` | User profile JSON |

---

## 7. Demo Scripts

### 7.1 Full Demo Script (35 Phút)

#### Phase 1: Setup (2 phút)
1. Open Chrome Profile 1 → Login as CLUB_MANAGER
2. Open Edge → Login as ADMIN

#### Phase 2: CLUB_MANAGER Workflow (10 phút)
1. View Dashboard
2. Create Activity
3. Create Report (Draft)
4. Submit Report
5. Forward Report
6. Review Membership (Approve join request)

#### Phase 3: ADMIN Workflow (10 phút)
1. View Dashboard
2. Approve Report
3. Create Budget (as TREASURER if available)
4. Approve Budget
5. Approve Settlement

#### Phase 4: User Management (5 phút)
1. Create User
2. Lock/Unlock User

#### Phase 5: Notifications (3 phút)
1. Check Notifications
2. Mark as Read

#### Phase 6: Profile (2 phút)
1. View Profile

#### Phase 7: Wrap-up (3 phút)
1. Summary
2. Q&A

### 7.2 Defense Demo Script (18 Phút)

1. Login ADMIN (1 phút)
2. Login CLUB_MANAGER (1 phút)
3. Create & Submit Report (5 phút)
4. ADMIN Approve Report (3 phút)
5. Create Budget Proposal (2 phút)
6. ADMIN Approve Budget (2 phút)
7. Create User (2 phút)
8. Summary (2 phút)

### 7.3 Emergency Demo Script (10 Phút)

1. Login ADMIN (1 phút)
2. Create User (2 phút)
3. Create Report (3 phút)
4. Approve Report (2 phút)
5. Summary (2 phút)

---

## 8. Success Criteria

### 8.1 Authentication

| Action | Success Evidence |
|--------|------------------|
| Login | Redirect to Dashboard, user in sidebar |
| Logout | Redirect to /login |
| Token storage | localStorage has accessToken |

### 8.2 Reports

| Action | Success Evidence |
|--------|------------------|
| Create Draft | Toast + Row in table |
| Submit | Status: "Đã gửi" |
| Forward | Status: "Đang xét duyệt" |
| Approve | Status: "Đã duyệt" (green) |
| Reject | Status: "Bị từ chối" + reason |

### 8.3 Finance

| Action | Success Evidence |
|--------|------------------|
| Create Proposal | Toast + Card in grid |
| Approve Budget | Status: "Đã duyệt" + approved amount |
| Submit Settlement | Settlement row appears |
| Approve Settlement | Settlement status: "Đã quyết toán" |

### 8.4 Clubs

| Action | Success Evidence |
|--------|------------------|
| Join Club | Toast + Status: "Đang chờ duyệt" |
| Approve Membership | Toast + Pending list updates |

### 8.5 Activities

| Action | Success Evidence |
|--------|------------------|
| Create Activity | Toast + Card in grid |
| Register | Button: "Đã đăng ký" |
| Complete | Status: "Đã hoàn tất" |

### 8.6 Users

| Action | Success Evidence |
|--------|------------------|
| Create User | Toast + User in table |
| Lock | Status: "Đã khóa" |
| Unlock | Status: "Hoạt động" |

### 8.7 Notifications

| Action | Success Evidence |
|--------|------------------|
| Load | List displays |
| Mark as Read | Visual changes, count decreases |
| Mark All Read | Toast + All read |

---

## 9. Troubleshooting

### 9.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Login fails | Wrong credentials | Check password |
| Redirect to login | Token expired | Login again |
| Menu missing | Wrong role | Use correct account |
| Data not showing | Not loaded | Refresh page |
| Notification not appear | Manual refresh needed | Navigate to page |

### 9.2 DevTools Commands

```javascript
// Clear all data
localStorage.clear()
location.reload()

// Check auth state
console.log(JSON.parse(localStorage.getItem('user')))
```

### 9.3 Emergency Recovery

1. Clear localStorage
2. Login lại
3. Refresh page

---

## 10. Reference Documents

| # | Document | Description |
|---|----------|-------------|
| 1 | [00-FE-Audit-Summary.md](00-FE-Audit-Summary.md) | System audit summary |
| 2 | [01-Actor-Feature-Matrix.md](01-Actor-Feature-Matrix.md) | Role & feature matrix |
| 3 | [02-Full-FE-Demo-25-35-Minutes.md](02-Full-FE-Demo-25-35-Minutes.md) | Full demo script |
| 4 | [03-Defense-FE-Demo-15-20-Minutes.md](03-Defense-FE-Demo-15-20-Minutes.md) | Defense demo |
| 5 | [04-Emergency-FE-Demo-8-10-Minutes.md](04-Emergency-FE-Demo-8-10-Minutes.md) | Emergency demo |
| 6 | [05-Multi-Account-Setup.md](05-Multi-Account-Setup.md) | Multi-account guide |
| 7 | [06-Feature-Success-Criteria.md](06-Feature-Success-Criteria.md) | Success criteria |
| 8 | [07-Troubleshooting.md](07-Troubleshooting.md) | Troubleshooting guide |
| 9 | [08-Demo-Data-Plan.md](08-Demo-Data-Plan.md) | Demo data plan |
| 10 | [09-Screen-Checklist.md](09-Screen-Checklist.md) | Screen checklist |
| 11 | [10-Technical-Backup.md](10-Technical-Backup.md) | Technical backup |

---

## 11. API Endpoints Quick Reference

### 11.1 Reports

| Action | Endpoint | Method |
|--------|----------|--------|
| List | `/api/reports` | GET |
| Create | `/api/reports` | POST |
| Submit | `/api/reports/{id}/submit` | POST |
| Forward | `/api/reports/{id}/review` | POST |
| Approve | `/api/reports/{id}/approve` | POST |
| Reject | `/api/reports/{id}/reject` | POST |

### 11.2 Finance

| Action | Endpoint | Method |
|--------|----------|--------|
| List Proposals | `/api/finance/proposals` | GET |
| Create Proposal | `/api/finance/proposals` | POST |
| Approve Budget | `/api/finance/proposals/{id}/approve` | POST |
| Submit Settlement | `/api/finance/proposals/{id}/settlements` | POST |
| Approve Settlement | `/api/finance/settlements/{id}/approve` | POST |

### 11.3 Clubs

| Action | Endpoint | Method |
|--------|----------|--------|
| List | `/api/clubs` | GET |
| Join | `/api/clubs/{id}/join` | POST |
| Approve Membership | `/api/clubs/memberships/{id}/approve` | POST |

### 11.4 Activities

| Action | Endpoint | Method |
|--------|----------|--------|
| List | `/api/activities` | GET |
| Create | `/api/activities` | POST |
| Register | `/api/activities/{id}/participants` | POST |
| Complete | `/api/activities/{id}/complete` | PATCH |

### 11.5 Users

| Action | Endpoint | Method |
|--------|----------|--------|
| List | `/api/users` | GET |
| Create | `/api/users` | POST |
| Lock | `/api/users/{id}/lock` | PATCH |
| Unlock | `/api/users/{id}/unlock` | PATCH |

---

## 12. Key Messages for Demo

### 12.1 Role-Based Access

> "Mỗi actor thấy các chức năng khác nhau dựa trên vai trò được gán. Đây là Role-Based Access Control."

### 12.2 Real-Time Note

> "Notification KHÔNG phải real-time. Sau khi action, cần refresh để thấy cập nhật."

### 12.3 Complete Workflow

> "Tính năng bao gồm complete lifecycle: tạo → gửi → xem xét → phê duyệt/từ chối."

### 12.4 API Integration

> "Tất cả actions gọi REST API thực tế qua API Gateway, không có mock data."

---

## 13. Pre-Demo Checklist

### 13.1 System Check

- [ ] Frontend running at http://localhost:5173
- [ ] API Gateway running at http://localhost:7000
- [ ] All demo accounts work
- [ ] Test login with each account

### 13.2 Browser Setup

- [ ] Chrome Profile 1 configured
- [ ] Edge configured
- [ ] Know credentials for each account

### 13.3 Data Preparation

- [ ] Clubs have managers assigned
- [ ] Treasurer has club access
- [ ] At least one club with pending membership
- [ ] Test data available

### 13.4 Demo Ready

- [ ] Choose demo version (Full/Defense/Emergency)
- [ ] Practice key flows
- [ ] Prepare backup data
- [ ] Know troubleshooting steps

---

## 14. Contact & Support

### 14.1 System Documentation

- Frontend: `src/` directory
- API: Backend services
- Database: Backend seeding

### 14.2 Common Questions

**Q: Tại sao notification không xuất hiện ngay?**
A: Frontend không có real-time. Cần refresh hoặc navigate.

**Q: Tại sao tôi không thấy menu Finance?**
A: Account không có quyền VIEW_FINANCE. Dùng ADMIN.

**Q: Tại sao không tạo được report?**
A: Account cần có club với isManager=true.

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-21  
**Author**: Claude (Senior Frontend QA Engineer)  
**Status**: COMPLETE - Ready for Demo
