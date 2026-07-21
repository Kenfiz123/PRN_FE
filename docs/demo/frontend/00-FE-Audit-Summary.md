# ClubReportHub Frontend - Audit Summary

**Phiên bản**: 1.0.0  
**Ngày phân tích**: 2026-07-21  
**Framework**: React 18.2.0 + Vite 5.0.0  
**Trạng thái**: DEMO_READY

---

## 1. Thông Tin Hệ Thống

### 1.1 Cấu Trúc Frontend

```
frontend/
├── src/
│   ├── auth/
│   │   └── permissions.js        # Role & Permission definitions
│   ├── components/
│   │   ├── Header.jsx           # Header navigation
│   │   ├── Layout.jsx           # Main layout wrapper
│   │   ├── Modal.jsx            # Modal component
│   │   ├── Sidebar.jsx          # Sidebar navigation
│   │   └── StatCard.jsx         # Statistics card
│   ├── context/
│   │   ├── AuthContext.jsx      # Authentication state
│   │   └── ToastContext.jsx     # Toast notification system
│   ├── features/
│   │   └── profile/
│   │       └── SystemAdminProfile.jsx  # Special UI for SYSTEM_ADMIN
│   ├── hooks/
│   │   └── useLocalStorage.js   # LocalStorage hook
│   ├── pages/
│   │   ├── ActivitiesPage.jsx   # Activities management
│   │   ├── ClubsPage.jsx        # Club management & membership
│   │   ├── DashboardPage.jsx    # Dashboard overview
│   │   ├── FinancePage.jsx      # Budget & settlement
│   │   ├── LoginPage.jsx        # Login
│   │   ├── NotificationsPage.jsx # Notification list
│   │   ├── ProfilePage.jsx      # User profile
│   │   ├── RegisterPage.jsx     # Registration
│   │   ├── ReportsPage.jsx      # Report lifecycle
│   │   └── UsersPage.jsx       # User administration
│   ├── services/
│   │   └── api.js               # API service layer
│   ├── styles/                  # CSS styles
│   ├── App.jsx                  # Router configuration
│   └── main.jsx                 # Entry point
├── package.json
├── vite.config.js
└── tailwind.config.js
```

### 1.2 Lệnh Chạy

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production
npm run preview
```

---

## 2. URL & API Configuration

### 2.1 Frontend URLs

| Môi trường | URL |
|-------------|-----|
| Development | http://localhost:5173 |
| Production | (Docker container port 80) |

### 2.2 API Configuration

```javascript
// File: src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000'
```

| Môi trường | API Base URL |
|-------------|--------------|
| Development | http://localhost:7000 |
| Docker | http://api-gateway:8080 |

### 2.3 API Endpoints Verified

| Service | Endpoint Pattern | Methods |
|---------|-----------------|---------|
| Auth | /api/auth/* | POST |
| Users | /api/users/* | GET, POST, PUT, PATCH |
| Clubs | /api/clubs/* | GET, POST |
| Club Memberships | /api/clubs/memberships/* | POST |
| Reports | /api/reports/* | GET, POST |
| Report Actions | /api/reports/{id}/* | POST, PUT |
| Activities | /api/activities/* | GET, POST, PATCH |
| Finance | /api/finance/* | GET, POST |
| Notifications | /api/notifications/* | GET, PUT |

---

## 3. Authentication Mechanism

### 3.1 Token Storage

**Storage Type**: localStorage

| Key | Content | Lifetime |
|-----|---------|----------|
| accessToken | JWT Bearer token | From backend |
| refreshToken | Refresh token | From backend |
| user | User profile JSON | Until logout |

**File Reference**: `src/services/api.js` (lines 18-32)

```javascript
getToken() {
  return localStorage.getItem('accessToken');
}

setToken(token) {
  localStorage.setItem('accessToken', token);
}

clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}
```

### 3.2 Auth Flow

1. User submits login form with username/password
2. API calls `POST /api/auth/login`
3. Backend returns accessToken + refreshToken
4. Frontend stores tokens in localStorage
5. User profile cached in localStorage
6. AuthContext provides user state throughout app
7. Token auto-refresh on 401 response

### 3.3 Multi-Account Strategy

**CRITICAL**: localStorage is shared within same browser profile.

| Browser | Profile | Use Case |
|---------|---------|----------|
| Chrome | Profile 1 | Actor A (e.g., ClubManager) |
| Chrome | Profile 2 | Actor B (e.g., Admin) |
| Edge | - | Alternative for Actor B |
| Incognito | - | Temporary testing only |

**To prevent session conflict:**
- Always use different browser profiles for simultaneous actors
- Logout completely before switching to different actor on same profile
- Clear localStorage only if account is stuck (dev only)

---

## 4. Role Definitions

### 4.1 Available Roles

**File**: `src/auth/permissions.js`

```javascript
export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  STUDENT_AFFAIRS_ADMIN: 'STUDENT_AFFAIRS_ADMIN',
  CLUB_MANAGER: 'CLUB_MANAGER',
  TREASURER: 'TREASURER',
  CLUB_MEMBER: 'CLUB_MEMBER',
})
```

### 4.2 Permission Matrix

| Permission | ADMIN | SYS_ADMIN | STU_ADMIN | MGR | TREAS | MEM |
|------------|-------|-----------|-----------|-----|-------|-----|
| VIEW_DASHBOARD | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| VIEW_CLUBS | ✓ | - | ✓ | ✓ | ✓ | ✓ |
| REVIEW_CLUB_APPLICATIONS | ✓ | - | ✓ | - | - | - |
| MANAGE_CLUB_GOVERNANCE | ✓ | - | ✓ | - | - | - |
| APPLY_FOR_CLUB | - | - | - | - | - | ✓ |
| JOIN_CLUB | - | - | - | - | - | ✓ |
| VIEW_REPORTS | ✓ | - | ✓ | ✓ | ✓ | ✓ |
| AUTHOR_REPORTS | ✓ | - | - | ✓* | - | - |
| REVIEW_REPORTS | ✓ | - | ✓ | - | - | - |
| VIEW_ACTIVITIES | ✓ | - | ✓ | ✓ | ✓ | ✓ |
| MANAGE_ACTIVITIES | ✓ | - | - | ✓* | - | - |
| PARTICIPATE_IN_ACTIVITIES | - | - | - | ✓* | ✓* | ✓* |
| VIEW_FINANCE | ✓ | - | ✓ | - | ✓ | - |
| MANAGE_FINANCE | - | - | - | - | ✓* | - |
| REVIEW_FINANCE | ✓ | - | ✓ | - | - | - |
| VIEW_NOTIFICATIONS | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| VIEW_PROFILE | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| MANAGE_USERS | ✓ | ✓ | - | - | - | - |

*Note: `*` indicates permission also granted via clubAccess (isManager/isTreasurer flag)*

### 4.3 Role-Based Navigation

**File**: `src/components/Sidebar.jsx`

| Menu Item | Permission Required |
|-----------|---------------------|
| Dashboard | VIEW_DASHBOARD |
| Clubs | VIEW_CLUBS |
| Reports | VIEW_REPORTS |
| Activities | VIEW_ACTIVITIES |
| Finance | VIEW_FINANCE |
| Notifications | VIEW_NOTIFICATIONS |
| Profile | VIEW_PROFILE |
| Users | MANAGE_USERS |

---

## 5. Notification Delivery Mode

### 5.1 Current Implementation: **REFRESH_ON_NAVIGATION**

**NO REAL-TIME MECHANISM FOUND** in the codebase:
- ❌ No WebSocket
- ❌ No SignalR
- ❌ No Server-Sent Events (SSE)
- ❌ No Socket.IO
- ❌ No polling intervals (refetchInterval)
- ❌ No setInterval for notifications

### 5.2 How Notifications Work

**API Call Pattern** (File: `src/pages/NotificationsPage.jsx`):
```javascript
const loadNotifications = useCallback(async () => {
  const result = await api.getNotifications(false)
  setNotifications(Array.isArray(result) ? result : [])
}, [error])

useEffect(() => {
  loadNotifications()
}, [loadNotifications])
```

### 5.3 User Expectation for Demo

> **"Notification cập nhật sau khi refresh hoặc gọi lại API, không phải real-time."**

**Demo workflow:**
1. Actor A performs action → notification created on backend
2. Switch to Actor B's browser
3. Actor B navigates to /notifications OR refreshes page
4. New notification appears

**Do NOT say**: "You will see real-time notifications"
**DO say**: "After refreshing or navigating to the notifications page, you will see the new notification"

---

## 6. Feature Inventory

### 6.1 Complete Route List

| # | Route | Component | Permission | Status |
|---|-------|-----------|------------|--------|
| 1 | /login | LoginPage | Public | DEMO_READY |
| 2 | /register | RegisterPage | Public | DEMO_READY |
| 3 | / | Redirect | - | DEMO_READY |
| 4 | /dashboard | DashboardPage | VIEW_DASHBOARD | DEMO_READY |
| 5 | /clubs | ClubsPage | VIEW_CLUBS | DEMO_READY |
| 6 | /reports | ReportsPage | VIEW_REPORTS | DEMO_READY |
| 7 | /activities | ActivitiesPage | VIEW_ACTIVITIES | DEMO_READY |
| 8 | /finance | FinancePage | VIEW_FINANCE | DEMO_READY |
| 9 | /notifications | NotificationsPage | VIEW_NOTIFICATIONS | DEMO_READY |
| 10 | /profile | ProfilePage | VIEW_PROFILE | DEMO_READY |
| 11 | /users | UsersPage | MANAGE_USERS | DEMO_READY |

### 6.2 Feature Status Breakdown

| Status | Count | Features |
|--------|-------|----------|
| DEMO_READY | 11 | All routes fully functional |
| DEMO_READY_WITH_DATA | 0 | - |
| READ_ONLY | 0 | - |
| PARTIAL | 0 | - |
| MOCK_DATA | 0 | - |
| BROKEN | 0 | - |
| HIDDEN_ROUTE | 0 | - |
| NOT_IMPLEMENTED | 0 | - |

---

## 7. Libraries & Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI Framework |
| react-dom | ^18.2.0 | DOM rendering |
| react-router-dom | ^6.20.0 | Client-side routing |
| framer-motion | ^10.16.0 | Animations |
| lucide-react | ^1.25.0 | Icons |
| tailwindcss | ^3.3.5 | Styling |
| autoprefixer | ^10.4.16 | CSS prefixing |
| postcss | ^8.4.31 | CSS processing |
| vite | ^5.0.0 | Build tool |

---

## 8. Limitations

### 8.1 Current Limitations

1. **No real-time notifications** - requires manual refresh
2. **No file upload UI** - Finance settlement requires URL input, not file upload
3. **No export functionality** - No download buttons in current UI
4. **No KPI leaderboard UI** - API exists but no dedicated page
5. **No polling for status updates** - Users must refresh pages
6. **Token shared in same profile** - Cannot have 2 actors in same browser

### 8.2 Workarounds for Demo

| Limitation | Demo Workaround |
|------------|-----------------|
| No real-time | Say "Refresh to see updates" |
| No file upload | Use URL for receipt (https://example.com/receipt.jpg) |
| No export | Skip export demo or show API response |
| No KPI page | Skip KPI section or use report summary |
| Token conflict | Use separate browser profile |

---

## 9. Git Status

```bash
$ git branch --show-current
master

$ git status --short
# Working tree clean - no uncommitted changes
```

---

## 10. Next Steps

➡️ Continue to [01-Actor-Feature-Matrix.md](01-Actor-Feature-Matrix.md)  
➡️ Continue to [02-Full-FE-Demo-25-35-Minutes.md](02-Full-FE-Demo-25-35-Minutes.md)

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-21  
**Author**: Claude (Senior Frontend QA Engineer)
