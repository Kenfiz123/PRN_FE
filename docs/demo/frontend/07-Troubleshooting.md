# Frontend Troubleshooting Guide

**Phiên bản**: 1.0.0  
**Ngày**: 2026-07-21

---

## 0. Known Issues - Runtime (Discovered During Demo Testing)

### 0.1 ClubsPage - Join Club Modal Input Issues

| Vấn đề | Nguyên nhân | Cách xử lý khi demo |
|---------|-------------|---------------------|
| Textarea hiển thị text lạ: "Foreign key", "Trạng thái hợp lệ", "Không duplicate", "Không thay đổi schema" | Backend trả về validation error messages bị render sai vào trong textarea thay vì hiển thị như error toast | **Skip demo join form**. Demo Manager approve form (form khác hoạt động tốt) |
| Chỉ nhập được 1 ký tự, phải click lại mới nhập tiếp | Mỗi lần setState → ClubsPage re-render → loadData() chạy lại qua useEffect → pendingReviews thay đổi → re-render lần 2 → DOM element được tạo lại → focus mất | **Dùng clipboard paste** (Ctrl+V) thay vì gõ từng ký tự, hoặc **skip demo join** |

**Files affected**: `src/pages/ClubsPage.jsx` (lines 112-150, 387-462)

**Root Cause Analysis**:
```javascript
// Lines 53-88: loadData function
const loadData = useCallback(async () => {
  // ... API calls ...
  setPendingReviews([...])  // ← Triggers re-render
}, [canJoinClub, error, managedClubIds])  // ← managedClubIds reference changes

// Lines 86-88: useEffect triggers re-fetch
useEffect(() => {
  loadData()
}, [loadData])
```

Mỗi lần user nhập ký tự:
1. `setJoinForm` → re-render 1
2. `managedClubIds` được tính lại → reference mới
3. `loadData` useCallback reference thay đổi
4. `useEffect` chạy lại → `loadData()` → `setPendingReviews`
5. Re-render 2 → DOM repaint → focus mất

**Demo Workaround Options**:

| Option | Mô tả | Ưu điểm |
|--------|-------|---------|
| A. Skip Join Demo | Không demo Member join club. Show Clubs page ở chế độ view only | Không cần workaround |
| B. Pre-seed Membership | Backend tạo sẵn membership ở trạng thái PENDING | Demo được Manager approve flow |
| C. Use Manager Approve | Demo Club Manager approve form (chỉ 1 textarea) | Form hoạt động bình thường |
| D. Paste Text | Dùng clipboard paste thay gõ từng ký tự | Demo được nhưng chậm |

**Recommended**: Dùng Option B hoặc C - demo Manager approve flow thay vì Member join flow.

---

## 1. Authentication Issues

### 1.1 Login Không Thành Công

| Vấn đề | Nguyên nhân | Kiểm tra | Cách xử lý |
|---------|-------------|----------|-------------|
| "Invalid credentials" | Sai username/password | Check credentials | Nhập lại đúng |
| "Too many attempts" | Bị rate limit (HTTP 429) | Check error message | Đợi vài phút |
| Không redirect | Token không được lưu | DevTools → Application → localStorage | Check localStorage có accessToken |
| Redirect về login | Token bị xóa | Check localStorage | Login lại |

**Kiểm tra trên FE**:
```javascript
// DevTools → Console
console.log(localStorage.getItem('accessToken'))
console.log(localStorage.getItem('user'))
```

---

### 1.2 Token Hết Hạn

| Vấn đề | Nguyên nhân | Kiểm tra | Cách xử lý |
|---------|-------------|----------|-------------|
| Bị redirect về /login | accessToken expired | Check token expiry | Login lại |
| refreshToken không hoạt động | refreshToken expired | Network tab | Login lại |

**DevTools Check**:
1. Mở DevTools → Network
2. Lọc: Fetch/XHR
3. Tìm request bị 401
4. Check response

---

### 1.3 Token Conflict (Multi-Account)

| Vấn đề | Nguyên nhân | Kiểm tra | Cách xử lý |
|---------|-------------|----------|-------------|
| User A thấy User B | Same browser profile | Check user in sidebar | Dùng profile khác |
| Logout không hoạt động | localStorage có 2 tokens | Check localStorage | Clear localStorage |

**Cách xử lý**:
```javascript
// DevTools → Console
localStorage.clear()
window.location.href = '/login'
```

---

## 2. Navigation Issues

### 2.1 Route Không Truy Cập Được

| Vấn đề | Nguyên nhân | Kiểm tra | Cách xử lý |
|---------|-------------|----------|-------------|
| Redirect về /dashboard | Không có permission | Check user role | Dùng account có quyền |
| 403 Not Found | Route không tồn tại | Check App.jsx routes | Navigation trực tiếp |
| Blank page | Component lỗi | DevTools → Elements | Check console errors |

**Kiểm tra Role**:
```javascript
// DevTools → Console
console.log(JSON.parse(localStorage.getItem('user')).roles)
```

---

### 2.2 Menu Không Hiện Đúng

| Vấn đề | Nguyên nhân | Kiểm tra | Cách xử lý |
|---------|-------------|----------|-------------|
| Menu bị ẩn | Role không có permission | Check Sidebar.jsx | Dùng account có permission |
| Menu thừa | Cache cũ | Hard refresh (Ctrl+Shift+R) | Clear cache |

---

## 3. Data Issues

### 3.1 Table/Rows Không Hiển Thị

| Vấn đề | Nguyên nhân | Kiểm tra | Cách xử lý |
|---------|-------------|----------|-------------|
| Empty state | Không có data | Check UI message | Tạo data mới |
| Loading vô hạn | API lỗi | Network tab | Check API endpoint |
| Error message | API trả lỗi | Toast message | Check error details |

**DevTools Check**:
1. DevTools → Network
2. Tìm API request (e.g., `/api/clubs`)
3. Check Response status
4. Check Response body

---

### 3.2 Data Không Cập Nhật

| Vấn đề | Nguyên nhân | Kiểm tra | Cách xử lý |
|---------|-------------|----------|-------------|
| Row không xuất hiện | Action chưa thành công | Check toast | Retry action |
| Status không đổi | API chưa update | Reload page | F5 refresh |
| Deleted item vẫn thấy | Cache cũ | Reload page | F5 refresh |

**Workaround**:
```javascript
// Sau action thất bại
location.reload()
```

---

### 3.3 Search/Filter Không Hoạt Động

| Vấn đề | Nguyên nhân | Kiểm tra | Cách xử lý |
|---------|-------------|----------|-------------|
| Không tìm thấy | Query sai | Check input | Nhập đúng |
| Kết quả sai | Case-sensitive | Check code | Nhập đúng case |
| Filter không work | Status không match | Check status values | Reload page |

---

## 4. Form Issues

### 4.1 Button Bị Disabled

| Vấn đề | Nguyên nhân | Kiểm tra | Cách xử lý |
|---------|-------------|----------|-------------|
| Submit disabled | Validation fail | Check required fields | Điền đầy đủ |
| Action disabled | Permission | Check user role | Dùng account có quyền |
| Button busy | Đang xử lý | Đợi hoàn tất | Không click nhiều |

---

### 4.2 Validation Errors

| Lỗi | Nguyên nhân | Cách sửa |
|------|-------------|----------|
| "Vui lòng nhập đầy đủ..." | Required field missing | Điền required fields |
| "Số tiền phải lớn hơn 0" | Amount = 0 | Nhập số > 0 |
| "Thời gian kết thúc phải sau..." | End <= Start | Chọn end time > start |
| "URL phải là https://" | HTTP URL | Nhập https:// URL |

---

### 4.3 Modal Không Mở

| Vấn đề | Nguyên nhân | Kiểm tra | Cách xử lý |
|---------|-------------|----------|-------------|
| Modal stuck | State lỗi | Check isOpen state | Close và mở lại |
| Backdrop click không close | Handler lỗi | Check Modal.jsx | Click X button |

---

## 5. API Issues

### 5.1 HTTP 401 Unauthorized

| Vấn đề | Nguyên nhân | Cách xử lý |
|---------|-------------|-------------|
| Token hết hạn | accessToken expired | Login lại |
| Không có token | Token không được gửi | Check Authorization header |
| Token sai | Token không valid | Login lại |

**DevTools Check**:
```javascript
// Check request headers
// DevTools → Network → Request Headers → Authorization
```

---

### 5.2 HTTP 403 Forbidden

| Vấn đề | Nguyên nhân | Cách xử lý |
|---------|-------------|-------------|
| Không có quyền | Role/permission không đủ | Dùng account có quyền |
| Club access sai | Không phải manager/treasurer | Check clubAccess |

---

### 5.3 HTTP 404 Not Found

| Vấn đề | Nguyên nhân | Cách xử lý |
|---------|-------------|-------------|
| Resource không tồn tại | ID sai hoặc bị xóa | Refresh data |
| Endpoint sai | URL lỗi | Check API endpoint |

---

### 5.4 HTTP 429 Too Many Requests

| Vấn đề | Nguyên nhân | Cách xử lý |
|---------|-------------|-------------|
| Rate limit | Gọi API quá nhiều | Đợi vài phút |

---

### 5.5 HTTP 500 Server Error

| Vấn đề | Nguyên nhân | Cách xử lý |
|---------|-------------|-------------|
| Backend lỗi | Server exception | Check backend logs |
| Database lỗi | DB connection fail | Check backend |

---

## 6. Notification Issues

### 6.1 Notification Không Xuất Hiện

| Vấn đề | Nguyên nhân | Kiểm tra | Cách xử lý |
|---------|-------------|----------|-------------|
| Không thấy notification mới | Không phải real-time | Check code | F5 refresh hoặc navigate |
| Unread count sai | Chưa reload | Reload page | Navigate đến Notifications |

**Important**: Frontend KHÔNG có real-time notifications.

```javascript
// Code check - NotificationsPage.jsx
useEffect(() => {
  loadNotifications() // Chỉ gọi khi mount
}, [loadNotifications])
```

---

### 6.2 Badge Không Cập Nhật

| Vấn đề | Nguyên nhân | Cách xử lý |
|---------|-------------|-------------|
| Badge count sai | Chưa reload | Navigate hoặc F5 |

---

## 7. Browser Issues

### 7.1 Browser Cache

| Vấn đề | Nguyên nhân | Cách xử lý |
|---------|-------------|-------------|
| UI lỗi cũ | Cache cũ | Hard refresh (Ctrl+Shift+R) |
| JS lỗi cũ | Browser cache | Clear site data |

**Hard Refresh**:
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

---

### 7.2 CORS Issues

| Vấn đề | Nguyên nhân | Kiểm tra | Cách xử lý |
|---------|-------------|----------|-------------|
| CORS error | API Gateway không cho origin | Network tab → CORS error | Check backend CORS config |

---

### 7.3 localStorage Bị Full

| Vấn đề | Nguyên nhân | Cách xử lý |
|---------|-------------|-------------|
| Quota exceeded | localStorage full | Clear localStorage |

**Cách xóa**:
```javascript
// DevTools → Console
localStorage.clear()
```

---

## 8. DevTools Quick Reference

### 8.1 Network Tab

| Filter | Mục đích |
|--------|----------|
| `Fetch/XHR` | Chỉ show API requests |
| `doc` | HTML documents |
| `js` | JavaScript files |

### 8.2 Console Tab

```javascript
// Check auth state
console.log(JSON.parse(localStorage.getItem('user')))

// Check API base URL
console.log(import.meta.env.VITE_API_BASE_URL)

// Clear everything
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### 8.3 Application Tab

| Section | Content |
|---------|---------|
| localStorage | Tokens và user data |
| Session Storage | Session data |
| Cookies | Cookies |

---

## 9. Quick Fix Commands

### 9.1 Clear All Data

```javascript
// DevTools → Console
localStorage.clear()
sessionStorage.clear()
location.href = '/login'
```

### 9.2 Force Reload

```javascript
// Hard refresh via JS
location.reload(true)
```

### 9.3 Check API Health

```javascript
// DevTools → Console
fetch('http://localhost:7000/api/health')
  .then(r => r.json())
  .then(console.log)
```

---

## 10. Emergency Recovery

### 10.1 Khi Bị Kẹt ở Login Loop

1. Mở DevTools
2. Console: `localStorage.clear()`
3. Navigate to `/login`
4. Login lại

### 10.2 Khi Data Bị Corrupt

1. Logout
2. Clear localStorage
3. Login lại
4. Data sẽ được reload từ backend

### 10.3 Khi Cần Reset Hoàn Toàn

1. Đóng browser
2. Mở Incognito
3. Login lại
4. Fresh session

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-21  
**Author**: Claude (Senior Frontend QA Engineer)
