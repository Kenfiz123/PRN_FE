# Demo Data Plan

**Phiên bản**: 1.0.0  
**Ngày**: 2026-07-21

---

## 1. Tổng Quan

Kế hoạch này đảm bảo có đủ dữ liệu demo và tránh xung đột giữa các lần demo.

---

## 2. Demo Accounts

### 2.1 Required Accounts

| Actor | Username | Password | Role | Profile |
|-------|----------|----------|------|---------|
| Admin | admin | (from seed) | ADMIN | Profile 2 |
| System Admin | sysadmin | (from seed) | SYSTEM_ADMIN | Profile 2 |
| Club Manager | manager | (from seed) | CLUB_MANAGER | Profile 1 |
| Treasurer | treasurer | (from seed) | TREASURER | Profile 1 |
| Club Member | member | (from seed) | CLUB_MEMBER | Profile 1 |
| Student Affairs | stuaffairs | (from seed) | STUDENT_AFFAIRS_ADMIN | Profile 2 |

### 2.2 Account Checklist

- [ ] admin account có quyền ADMIN đầy đủ
- [ ] manager có ít nhất 1 club với isManager = true
- [ ] treasurer có ít nhất 1 club với isTreasurer = true
- [ ] member chưa thuộc club nào (để demo join)
- [ ] Tất cả passwords đã được đặt

---

## 3. Demo Clubs

### 3.1 Required Clubs

| Club Name | Code | Manager | Treasurer | Demo Purpose |
|-----------|------|---------|-----------|--------------|
| PRN232 Demo Club | PRN232 | manager | treasurer | Report, Finance |
| Tech Club | TECH | manager | - | Activity |
| Music Club | MUSIC | manager | treasurer | Multi-workflow |

### 3.2 Club Checklist

- [ ] PRN232 Club có manager là `manager` account
- [ ] PRN232 Club có treasurer là `treasurer` account
- [ ] Có ít nhất 1 club chưa có members (cho demo join)
- [ ] Clubs có activities (hoặc tạo mới trong demo)

---

## 4. Demo Data Templates

### 4.1 Report Template

```
Tên: Báo cáo Q3 - Demo {timestamp}
Kỳ: 2026-Q3
Loại: ACTIVITY
Trạng thái mong đợi: Draft → Submit → Approved
```

**Values để nhập**:
- Kỳ báo cáo: `2026-Q3`
- Hạn nộp: +7 ngày từ hôm nay
- Tên hoạt động: `Workshop PRN232 Demo`
- Ngày hoạt động: Ngày hôm nay
- Mô tả: `Workshop demo frontend với React và Vite`
- Người tham gia: `25`
- Kết quả: `Thành công`

---

### 4.2 Budget Proposal Template

```
Tên: Đề xuất ngân sách Workshop Q3 - Demo {timestamp}
Số tiền: 5,000,000 VND
Trạng thái: Pending → Approved
```

**Values để nhập**:
- Tiêu đề: `Ngân sách Workshop Q3 Demo`
- Mô tả: `Đề xuất ngân sách cho workshop PRN232`
- Số tiền: `5000000`

---

### 4.3 Activity Template

```
Tên: Workshop PRN232 Demo {timestamp}
Thời gian: +1 ngày từ hôm nay
Địa điểm: Hội trường A
```

**Values để nhập**:
- Tiêu đề: `Workshop PRN232 Demo`
- Mô tả: `Workshop demo cho đồ án frontend`
- Bắt đầu: Ngày mai, 09:00
- Kết thúc: Ngày mai, 12:00
- Địa điểm: `Hội trường A`

---

### 4.4 User Template

```
Username: demo{timestamp}
Email: demo{timestamp}@club.edu
Password: Demo123456
```

**Values để nhập**:
- Username: `demo0721` (hoặc thêm timestamp)
- Họ và tên: `Demo User`
- Email: `demo0721@club.edu`
- Mật khẩu: `Demo123456`
- Vai trò: `CLUB_MEMBER`

---

## 5. Demo Workflow Data Flow

### 5.1 Report Lifecycle

```
1. Create Draft Report
   → Report #1 (Draft)

2. Submit Report
   → Report #1 (Submitted)

3. Forward Report (Manager)
   → Report #1 (Under Review)

4. Approve Report (Admin)
   → Report #1 (Approved) ✓ DONE
```

### 5.2 Finance Lifecycle

```
1. Create Budget Proposal
   → Budget #1 (Pending)

2. Approve Budget (Admin)
   → Budget #1 (Approved) → Amount: 4,500,000

3. Submit Settlement
   → Settlement #1 (Submitted)

4. Approve Settlement (Admin)
   → Settlement #1 (Approved) ✓ DONE
```

### 5.3 Club Membership

```
1. Join Club (Member)
   → Membership #1 (Pending)

2. Approve Membership (Manager)
   → Membership #1 (Approved) ✓ DONE
```

---

## 6. Demo Data Backup

### 6.1 Primary vs Backup

| Entity | Primary Demo | Backup Demo |
|--------|-------------|-------------|
| Report | Report #1 | Report #2 (Draft only) |
| Budget | Budget #1 | Budget #2 (Draft only) |
| Activity | Activity #1 | Activity #2 |
| User | User #1 | User #2 |

### 6.2 Backup Records

**Report Backup**:
- Status: Draft
- Purpose: Nếu Report #1 bị lỗi, dùng Report #2

**Budget Backup**:
- Status: Draft
- Purpose: Nếu Budget #1 bị lỗi, dùng Budget #2

---

## 7. Data Reusability

### 7.1 Có Thể Tái Sử Dụng

| Data | Reusable? | Lý do |
|------|-----------|-------|
| Same Club | ✓ Yes | Không thay đổi khi tạo report |
| Same Activity | ✓ Yes | Không ảnh hưởng report |
| Same User | ✓ Yes | User vẫn còn trong system |

### 7.2 Không Nên Tái Sử Dụng

| Data | Không reuse | Lý do |
|------|-------------|-------|
| Approved Report | ✗ No | Đã final, không submit lại |
| Approved Budget | ✗ No | Đã phê duyệt |
| Settled Budget | ✗ No | Đã quyết toán |
| Approved Membership | ✗ No | Đã final |

---

## 8. Demo Session Checklist

### 8.1 Trước Demo

- [ ] Tất cả demo accounts hoạt động
- [ ] Clubs có managers và treasurers gán đúng
- [ ] Không có dữ liệu "bẩn" từ lần trước
- [�] Test login với mỗi account

### 8.2 Trong Demo

- [ ] Tạo data mới cho mỗi workflow
- [ ] Follow success criteria cho mỗi step
- [ ] Refresh page sau mỗi action (để verify)
- [ ] Có backup data sẵn sàng

### 8.3 Sau Demo

- [ ] Không cần xóa data
- [ ] Có thể tiếp tục dùng data cho session sau
- [ ] Nếu cần reset: tạo data mới

---

## 9. Demo Data Creation Script

### 9.1 Expected Flow

**Qua API (Backend cần cung cấp)**:

```bash
# Login
curl -X POST http://localhost:7000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"manager","password":"..."}'

# Get club access
curl http://localhost:7000/api/clubs/me/access \
  -H "Authorization: Bearer {token}"
```

### 9.2 Frontend Creation

**Trong Demo**:
1. Login với manager account
2. Vào trang Reports
3. Bấm "Tạo báo cáo"
4. Điền form
5. Submit

---

## 10. Troubleshooting Data Issues

### 10.1 "Chưa có báo cáo phù hợp"

**Nguyên nhân**: Filter đang active, không có data

**Cách xử lý**:
1. Clear search query
2. Change status filter to "Tất cả"
3. Reload page

### 10.2 "Chưa có câu lạc bộ phù hợp"

**Nguyên nhân**: Không có clubs trong system

**Cách xử lý**:
1. Check backend seeding
2. Tạo club qua seed script

### 10.3 "Không có quyền"

**Nguyên nhân**: Account không có clubAccess

**Cách xử lý**:
1. Check user roles trong database
2. Check clubAccess table
3. Update user để có đúng permissions

---

## 11. Timestamp Format

### 11.1 Recommended Format

```
Demo-YYYYMMDD-HHMM
```

### 11.2 Examples

| Date | Timestamp | Example |
|------|-----------|---------|
| 2026-07-21 14:30 | YYYYMMDD-HHMM | demo20260721-1430 |
| 2026-07-22 09:15 | YYYYMMDD-HHMM | demo20260722-0915 |

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-21  
**Author**: Claude (Senior Frontend QA Engineer)
