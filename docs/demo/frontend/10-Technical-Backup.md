# Technical Backup Guide

**Phiên bản**: 1.0.0  
**Ngày**: 2026-07-21

---

## 1. Mục Đích

Tài liệu này dành cho trường hợp giảng viên yêu cầu chứng minh thêm về mặt kỹ thuật. **KHÔNG** sử dụng trong main demo.

---

## 2. DevTools Network

### 2.1 Mở DevTools

| Browser | Shortcut |
|---------|----------|
| Chrome | F12 hoặc Ctrl+Shift+I |
| Edge | F12 hoặc Ctrl+Shift+I |

### 2.2 Lọc Requests

1. Mở tab **Network**
2. Click filter **Fetch/XHR** (chỉ hiển thị API calls)
3. Filter theo: `api` để thấy tất cả API calls

### 2.3 Kiểm Tra Request

**Click vào một request để xem:**

| Tab | Nội dung |
|-----|----------|
| Headers | URL, Method, Status, Headers |
| Payload | Request body (POST data) |
| Response | Response body (JSON) |
| Timing | Thời gian request |

### 2.4 Ví Dụ: Login Request

```
URL: http://localhost:7000/api/auth/login
Method: POST
Status: 200
```

**Request Payload:**
```json
{
  "username": "admin",
  "password": "***"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "fullName": "System Administrator",
    "email": "admin@club.edu",
    "roles": ["ADMIN"]
  }
}
```

---

## 3. API Endpoints Reference

### 3.1 Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login with username/password |
| `/api/auth/register` | POST | Register new account |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/logout` | POST | Logout |

### 3.2 Users

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users` | GET | List all users |
| `/api/users` | POST | Create new user |
| `/api/users/{id}` | PUT | Update user |
| `/api/users/{id}/lock` | PATCH | Lock user |
| `/api/users/{id}/unlock` | PATCH | Unlock user |

### 3.3 Clubs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/clubs` | GET | List all clubs |
| `/api/clubs/me/access` | GET | Get current user's club access |
| `/api/clubs/me/memberships` | GET | Get current user's memberships |
| `/api/clubs/{id}` | GET | Get club details |
| `/api/clubs/{id}/join` | POST | Join club request |
| `/api/clubs/{id}/memberships` | GET | Get club memberships |
| `/api/clubs/memberships/{id}/approve` | POST | Approve membership |
| `/api/clubs/memberships/{id}/reject` | POST | Reject membership |

### 3.4 Reports

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/reports` | GET | List reports |
| `/api/reports` | POST | Create report |
| `/api/reports/{id}` | GET | Get report details |
| `/api/reports/{id}/submit` | POST | Submit report |
| `/api/reports/{id}/review` | POST | Forward report |
| `/api/reports/{id}/approve` | POST | Approve report |
| `/api/reports/{id}/reject` | POST | Reject report |
| `/api/reports/summary` | GET | Get report summary stats |

### 3.5 Activities

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/activities` | GET | List activities |
| `/api/activities` | POST | Create activity |
| `/api/activities/{id}` | GET | Get activity details |
| `/api/activities/{id}/participants` | POST | Register participant |
| `/api/activities/{id}/complete` | PATCH | Complete activity |

### 3.6 Finance

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/finance/proposals` | GET | List budget proposals |
| `/api/finance/proposals` | POST | Create proposal |
| `/api/finance/proposals/{id}/approve` | POST | Approve budget |
| `/api/finance/proposals/{id}/reject` | POST | Reject budget |
| `/api/finance/proposals/{id}/settlements` | POST | Submit settlement |
| `/api/finance/settlements/{id}/approve` | POST | Approve settlement |
| `/api/finance/transactions` | GET | List transactions |

### 3.7 Notifications

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notifications` | GET | List notifications |
| `/api/notifications/{id}/read` | PUT | Mark as read |
| `/api/notifications/read-all` | PUT | Mark all as read |

---

## 4. Authorization Header

### 4.1 Format

```
Authorization: Bearer {accessToken}
```

### 4.2 Ví Dụ

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.3 DevTools Check

1. Mở DevTools → Network
2. Click request bất kỳ (đã authenticated)
3. Tab Headers → Request Headers
4. Tìm dòng "Authorization"

**Lưu ý**: KHÔNG hiển thị JWT đầy đủ cho giảng viên. Chỉ confirm header có tồn tại.

---

## 5. Status Codes Reference

| Code | Meaning | Common Causes |
|------|---------|--------------|
| 200 | OK | Success |
| 204 | No Content | Success (no response body) |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Token expired/invalid |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry |
| 429 | Too Many Requests | Rate limited |
| 500 | Server Error | Backend error |

---

## 6. Response Format

### 6.1 Success Response

**GET List:**
```json
{
  "items": [...],
  "page": 1,
  "pageSize": 100,
  "total": 50
}
```

**GET Single:**
```json
{
  "id": 1,
  "name": "...",
  "status": "...",
  ...
}
```

**POST Success:**
```json
{
  "id": 1,
  "createdAt": "...",
  ...
}
```

### 6.2 Error Response

```json
{
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

---

## 7. JWT Token Structure

### 7.1 Access Token Claims

```json
{
  "sub": "user_id",
  "username": "admin",
  "roles": ["ADMIN"],
  "exp": 1234567890,
  "iat": 1234567800
}
```

### 7.2 Token Expiry

| Token | Expiry |
|-------|--------|
| accessToken | ~1-24 hours (backend config) |
| refreshToken | ~7-30 days (backend config) |

---

## 8. Frontend Source Reference

### 8.1 Key Files

| File | Purpose |
|------|---------|
| `src/services/api.js` | API service layer |
| `src/context/AuthContext.jsx` | Authentication state |
| `src/auth/permissions.js` | Role & permission definitions |
| `src/App.jsx` | Routes & guards |
| `src/components/Sidebar.jsx` | Navigation menu |
| `src/pages/*.jsx` | Page components |

### 8.2 API Service Example

```javascript
// src/services/api.js
async request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.getToken()}`,
    ...options.headers,
  }
  
  const response = await fetch(url, { headers, ...options })
  
  if (response.status === 401) {
    // Try refresh token
  }
  
  return response.json()
}
```

---

## 9. Notification Mode Analysis

### 9.1 Code Evidence

**File**: `src/pages/NotificationsPage.jsx`

```javascript
const loadNotifications = useCallback(async () => {
  setIsLoading(true)
  const result = await api.getNotifications(false)
  setNotifications(Array.isArray(result) ? result : [])
}, [error])

useEffect(() => {
  loadNotifications()
}, [loadNotifications])
```

**Analysis**:
- ❌ No `setInterval`
- ❌ No `refetchInterval`
- ❌ No WebSocket/SignalR/SSE
- ❌ No polling mechanism

**Conclusion**: MANUAL_REFRESH - User must navigate or refresh page

### 9.2 No Real-Time Indicators

| Mechanism | Found |
|-----------|-------|
| WebSocket | ❌ No |
| SignalR | ❌ No |
| Server-Sent Events | ❌ No |
| Socket.IO | ❌ No |
| Polling (setInterval) | ❌ No |
| React Query | ❌ No (not installed) |

---

## 10. Browser Profile Isolation

### 10.1 localStorage Isolation

| Browser | Profile | localStorage |
|---------|---------|-------------|
| Chrome | Profile 1 | Separate from Profile 2 |
| Chrome | Profile 2 | Separate from Profile 1 |
| Edge | Default | Separate from Chrome |
| Incognito | - | Separate from normal mode |

### 10.2 Checking localStorage

**DevTools → Application → localStorage**

```javascript
// Check tokens
localStorage.getItem('accessToken')
localStorage.getItem('refreshToken')
localStorage.getItem('user')
```

---

## 11. Demo Workflow Technical View

### 11.1 Report Create Flow

```
Frontend                    Backend                    Database
   |                           |                          |
   | POST /api/reports         |                          |
   | {clubId, period, ...}   |                          |
   |-------------------------->|                          |
   |                          | INSERT Report            |
   |                          |------------------------->|
   |                          |                          |
   | 201 Created              |                          |
   | {id: 5, status: DRAFT}  |                          |
   |<--------------------------|                          |
   |                          |                          |
```

### 11.2 Report Approve Flow

```
Frontend                    Backend                    Database
   |                           |                          |
   | POST /api/reports/5/approve|                         |
   | {feedback: "OK"}          |                          |
   |-------------------------->|                          |
   |                          | UPDATE Report SET status = APPROVED|
   |                          |------------------------->|
   |                          | INSERT Feedback          |
   |                          |------------------------->|
   |                          |                          |
   | 200 OK                   |                          |
   | {id: 5, status: APPROVED, feedback: [...]}|         |
   |<--------------------------|                          |
   |                          |                          |
```

---

## 12. Security Notes

### 12.1 Sensitive Data (DON'T DISPLAY)

| Data | Location |
|------|----------|
| Password | Never in frontend |
| Full JWT | DevTools (can show header exists) |
| Email | DevTools (OK to show) |
| Username | DevTools (OK to show) |
| Roles | DevTools (OK to show) |

### 12.2 What TO Show

- ✅ HTTP Status codes
- ✅ Request/Response structure
- ✅ Authorization header exists
- ✅ API endpoints
- ✅ Toast messages
- ✅ UI state changes

### 12.3 What NOT TO Show

- ❌ Full JWT token content
- ❌ Passwords (even in logs)
- ❌ Full error stack traces
- ❌ Internal backend errors

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-21  
**Author**: Claude (Senior Frontend QA Engineer)
