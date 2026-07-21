# Actor-Feature Matrix

**Phiên bản**: 1.0.0  
**Ngày phân tích**: 2026-07-21

---

## 1. Verified Actors Summary

| Actor | Role Key | Demo Priority | Browser Profile |
|-------|----------|---------------|-----------------|
| System Administrator | SYSTEM_ADMIN | HIGH | Profile 2 |
| Administrator | ADMIN | HIGH | Profile 2 |
| Student Affairs Admin | STUDENT_AFFAIRS_ADMIN | HIGH | Profile 2 |
| Club Manager | CLUB_MANAGER | CRITICAL | Profile 1 |
| Treasurer | TREASURER | HIGH | Profile 1 |
| Club Member | CLUB_MEMBER | MEDIUM | Profile 1 |

---

## 2. Detailed Actor Profiles

### 2.1 System Administrator (SYSTEM_ADMIN)

**Source File**: `src/auth/permissions.js` (line 46-51)

```javascript
[ROLES.SYSTEM_ADMIN]: new Set([
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_NOTIFICATIONS,
  PERMISSIONS.VIEW_PROFILE,
  PERMISSIONS.MANAGE_USERS,
])
```

| Attribute | Value |
|-----------|-------|
| **Role Key** | `SYSTEM_ADMIN` |
| **Landing Page** | /dashboard |
| **Visible Menus** | Dashboard, Notifications, Profile, Users |
| **Hidden Menus** | Clubs, Reports, Activities, Finance |
| **Special UI** | SystemAdminProfile.jsx (creative profile page) |
| **Can Create Users** | Yes |
| **Can Lock/Unlock Users** | Yes |
| **Can Review Reports** | No |
| **Can Review Finance** | No |
| **Can Manage Clubs** | No |

**Demo Scenarios:**
- View system dashboard with notifications
- Manage users (create, edit, lock/unlock)
- View special creative profile page
- Demonstrate role-based menu visibility

---

### 2.2 Administrator (ADMIN)

**Source File**: `src/auth/permissions.js` (line 32-45)

```javascript
[ROLES.ADMIN]: new Set([
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_CLUBS,
  PERMISSIONS.REVIEW_CLUB_APPLICATIONS,
  PERMISSIONS.MANAGE_CLUB_GOVERNANCE,
  PERMISSIONS.VIEW_REPORTS,
  PERMISSIONS.REVIEW_REPORTS,
  PERMISSIONS.VIEW_ACTIVITIES,
  PERMISSIONS.VIEW_FINANCE,
  PERMISSIONS.REVIEW_FINANCE,
  PERMISSIONS.VIEW_NOTIFICATIONS,
  PERMISSIONS.VIEW_PROFILE,
  PERMISSIONS.MANAGE_USERS,
])
```

| Attribute | Value |
|-----------|-------|
| **Role Key** | `ADMIN` |
| **Landing Page** | /dashboard |
| **Visible Menus** | All menus (Dashboard, Clubs, Reports, Activities, Finance, Notifications, Profile, Users) |
| **Hidden Menus** | None |
| **Special UI** | Standard profile page |
| **Can Create Users** | Yes |
| **Can Review Reports** | Yes (final approval) |
| **Can Review Finance** | Yes |
| **Can Approve Club Memberships** | Yes (via REVIEW_CLUB_APPLICATIONS) |
| **Can Manage Clubs** | Yes (via MANAGE_CLUB_GOVERNANCE) |

**Demo Scenarios:**
- Full system overview on dashboard
- Review and approve/reject reports (UNDER_REVIEW status)
- Review and approve/reject budget proposals
- Approve settlements
- Manage club applications
- User administration

---

### 2.3 Student Affairs Administrator (STUDENT_AFFAIRS_ADMIN)

**Source File**: `src/auth/permissions.js` (line 52-64)

```javascript
[ROLES.STUDENT_AFFAIRS_ADMIN]: new Set([
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_CLUBS,
  PERMISSIONS.REVIEW_CLUB_APPLICATIONS,
  PERMISSIONS.MANAGE_CLUB_GOVERNANCE,
  PERMISSIONS.VIEW_REPORTS,
  PERMISSIONS.REVIEW_REPORTS,
  PERMISSIONS.VIEW_ACTIVITIES,
  PERMISSIONS.VIEW_FINANCE,
  PERMISSIONS.REVIEW_FINANCE,
  PERMISSIONS.VIEW_NOTIFICATIONS,
  PERMISSIONS.VIEW_PROFILE,
])
```

| Attribute | Value |
|-----------|-------|
| **Role Key** | `STUDENT_AFFAIRS_ADMIN` |
| **Landing Page** | /dashboard |
| **Visible Menus** | Dashboard, Clubs, Reports, Activities, Finance, Notifications, Profile |
| **Hidden Menus** | Users (no MANAGE_USERS) |
| **Special UI** | Standard profile page |
| **Can Create Users** | No |
| **Can Review Reports** | Yes |
| **Can Review Finance** | Yes |
| **Can Manage Clubs** | Yes |

**Demo Scenarios:**
- Review reports submitted by club managers
- Approve/reject budget proposals
- Manage club governance
- View all clubs and memberships

---

### 2.4 Club Manager (CLUB_MANAGER)

**Source File**: `src/auth/permissions.js` (line 65-72)

```javascript
[ROLES.CLUB_MANAGER]: new Set([
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_CLUBS,
  PERMISSIONS.VIEW_REPORTS,
  PERMISSIONS.VIEW_ACTIVITIES,
  PERMISSIONS.VIEW_NOTIFICATIONS,
  PERMISSIONS.VIEW_PROFILE,
])
```

**Additional Permissions via ClubAccess**:
- AUTHOR_REPORTS: `clubAccess.some(access => access.isManager)`
- MANAGE_ACTIVITIES: `clubAccess.some(access => access.isManager)`

| Attribute | Value |
|-----------|-------|
| **Role Key** | `CLUB_MANAGER` |
| **Landing Page** | /dashboard |
| **Visible Menus** | Dashboard, Clubs, Reports, Activities, Notifications, Profile |
| **Hidden Menus** | Finance (no VIEW_FINANCE), Users |
| **Club-Specific Actions** | Create reports, Manage activities, Review member applications |
| **Can Create Reports** | Yes (only for managed clubs) |
| **Can Submit Reports** | Yes (DRAFT → SUBMITTED) |
| **Can Forward Reports** | Yes (SUBMITTED → UNDER_REVIEW) |
| **Can Manage Activities** | Yes (create, complete) |
| **Can Review Memberships** | Yes (PENDING → APPROVED/REJECTED) |

**Demo Scenarios:**
- Create and submit reports for managed club
- Create activities
- Review pending member applications
- View own club statistics

---

### 2.5 Treasurer (TREASURER)

**Source File**: `src/auth/permissions.js` (line 73-80)

```javascript
[ROLES.TREASURER]: new Set([
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_CLUBS,
  PERMISSIONS.VIEW_REPORTS,
  PERMISSIONS.VIEW_ACTIVITIES,
  PERMISSIONS.VIEW_NOTIFICATIONS,
  PERMISSIONS.VIEW_PROFILE,
])
```

**Additional Permissions via ClubAccess**:
- MANAGE_FINANCE: `clubAccess.some(access => access.isTreasurer)`

| Attribute | Value |
|-----------|-------|
| **Role Key** | `TREASURER` |
| **Landing Page** | /dashboard |
| **Visible Menus** | Dashboard, Clubs, Reports, Activities, Notifications, Profile |
| **Hidden Menus** | Finance (role-level), Users |
| **Finance Access** | Only via clubAccess.isTreasurer |
| **Can Create Budget Proposals** | Yes (for treasury clubs) |
| **Can Submit Settlements** | Yes (APPROVED budgets only) |
| **Can Approve Budgets** | No |

**Demo Scenarios:**
- Create budget proposals for activities
- Submit settlements with receipt URLs
- View approved budget amounts

---

### 2.6 Club Member (CLUB_MEMBER)

**Source File**: `src/auth/permissions.js` (line 81-90)

```javascript
[ROLES.CLUB_MEMBER]: new Set([
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_CLUBS,
  PERMISSIONS.APPLY_FOR_CLUB,
  PERMISSIONS.JOIN_CLUB,
  PERMISSIONS.VIEW_REPORTS,
  PERMISSIONS.VIEW_ACTIVITIES,
  PERMISSIONS.VIEW_NOTIFICATIONS,
  PERMISSIONS.VIEW_PROFILE,
])
```

**Additional Permissions via ClubAccess**:
- PARTICIPATE_IN_ACTIVITIES: `clubAccess.some(access => access.isApprovedMember || access.isManager || access.isTreasurer)`

| Attribute | Value |
|-----------|-------|
| **Role Key** | `CLUB_MEMBER` |
| **Landing Page** | /dashboard |
| **Visible Menus** | Dashboard, Clubs, Reports, Activities, Notifications, Profile |
| **Hidden Menus** | Finance, Users |
| **Can Join Clubs** | Yes |
| **Can Participate in Activities** | Yes (if approved member) |
| **Can Create Reports** | No |
| **Can Manage Activities** | No |

**Demo Scenarios:**
- Browse available clubs
- Submit join requests
- View activities in joined clubs
- Register for activities

---

## 3. Feature-Actor Matrix

### 3.1 Authentication Features

| Feature | SYSTEM_ADMIN | ADMIN | STU_ADMIN | CLUB_MANAGER | TREASURER | CLUB_MEMBER |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|
| Login | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Logout | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Profile | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit Profile | ✓* | - | - | - | - | - |

*SYSTEM_ADMIN has special editable profile

### 3.2 User Management Features

| Feature | SYSTEM_ADMIN | ADMIN | STU_ADMIN | CLUB_MANAGER | TREASURER | CLUB_MEMBER |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|
| View Users | ✓ | ✓ | - | - | - | - |
| Create Users | ✓ | ✓ | - | - | - | - |
| Edit Users | ✓ | ✓ | - | - | - | - |
| Lock/Unlock Users | ✓ | ✓ | - | - | - | - |

### 3.3 Club Management Features

| Feature | SYSTEM_ADMIN | ADMIN | STU_ADMIN | CLUB_MANAGER | TREASURER | CLUB_MEMBER |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|
| View Clubs | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Browse All Clubs | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Join Club | - | - | - | - | - | ✓ |
| Review Join Requests | - | ✓ | ✓ | ✓* | - | - |
| Manage Club Governance | - | ✓ | ✓ | - | - | - |

*Only for managed clubs

### 3.4 Report Features

| Feature | SYSTEM_ADMIN | ADMIN | STU_ADMIN | CLUB_MANAGER | TREASURER | CLUB_MEMBER |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|
| View Reports | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Report | - | - | - | ✓* | - | - |
| Submit Report | - | - | - | ✓* | - | - |
| Forward Report | - | - | - | ✓* | - | - |
| Approve Report | - | ✓ | ✓ | - | - | - |
| Reject Report | - | ✓ | ✓ | - | - | - |

*Only for managed clubs

### 3.5 Activity Features

| Feature | SYSTEM_ADMIN | ADMIN | STU_ADMIN | CLUB_MANAGER | TREASURER | CLUB_MEMBER |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|
| View Activities | - | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Activity | - | - | - | ✓* | - | - |
| Register Participation | - | - | - | ✓* | ✓* | ✓* |
| Complete Activity | - | - | - | ✓* | - | - |

*Only for applicable clubs/memberships

### 3.6 Finance Features

| Feature | SYSTEM_ADMIN | ADMIN | STU_ADMIN | CLUB_MANAGER | TREASURER | CLUB_MEMBER |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|
| View Finance | - | ✓ | ✓ | - | ✓* | - |
| Create Budget Proposal | - | - | - | - | ✓* | - |
| Submit Settlement | - | - | - | - | ✓* | - |
| Approve Budget | - | ✓ | ✓ | - | - | - |
| Reject Budget | - | ✓ | ✓ | - | - | - |
| Approve Settlement | - | ✓ | ✓ | - | - | - |

*Only for treasury clubs

### 3.7 Notification Features

| Feature | SYSTEM_ADMIN | ADMIN | STU_ADMIN | CLUB_MANAGER | TREASURER | CLUB_MEMBER |
|---------|:---:|:---:|:---:|:---:|:---:|:---:|
| View Notifications | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Mark as Read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Mark All Read | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 4. Cross-Actor Workflows

### 4.1 Report Submission Workflow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CLUB_MANAGER  │────▶│   CLUB_MANAGER  │────▶│  ADMIN/STU_ADMIN│
│  (Create Draft) │     │   (Submit)      │     │  (Approve/Reject│
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
   1. POST /reports      2. POST /reports/   3. POST /reports/
                         {id}/submit         {id}/approve
                                                OR /reject
```

### 4.2 Budget Approval Workflow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    TREASURER    │────▶│     ADMIN       │────▶│    TREASURER    │
│(Create Budget)  │     │(Approve/Reject) │     │(Submit Settle) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
 1. POST /finance/        2. POST /finance/      3. POST /finance/
    proposals                proposals/{id}/         proposals/{id}/
                            approve OR reject      settlements
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │     ADMIN       │
                                               │(Approve Settle)│
                                               └─────────────────┘
```

### 4.3 Club Membership Workflow

```
┌─────────────────┐     ┌─────────────────┐
│  CLUB_MEMBER    │────▶│   CLUB_MANAGER  │
│  (Join Club)    │     │(Approve/Reject) │
└─────────────────┘     └─────────────────┘
        │                       │
  1. POST /clubs/          2. POST /clubs/
     {id}/join              memberships/{id}/
                            approve OR reject
```

---

## 5. Browser Profile Assignment

### 5.1 Recommended Setup

| Profile | Browser | Actor | Purpose |
|---------|---------|-------|---------|
| Profile 1 | Chrome | CLUB_MANAGER | Create reports, activities, manage members |
| Profile 1 | Chrome | TREASURER | Create budget proposals, settlements |
| Profile 1 | Chrome | CLUB_MEMBER | Join clubs, register activities |
| Profile 2 | Edge | ADMIN | Review reports, approve budgets, manage users |
| Profile 2 | Edge | SYSTEM_ADMIN | User management, special profile demo |

### 5.2 Cross-Actor Demo Sequence

**Phase 1: Single Actor Demos (Profile 1)**
1. Login as CLUB_MEMBER → Browse clubs → Join club
2. Logout → Login as CLUB_MANAGER → Review membership → Create activity → Create report
3. Logout → Login as TREASURER → Create budget proposal

**Phase 2: Cross-Actor Demos (Profile 1 + Profile 2)**
1. Open Profile 1: CLUB_MANAGER creates report
2. Open Profile 2: ADMIN reviews and approves
3. Profile 1: Refresh → See status change
4. Profile 1: TREASURER creates budget proposal
5. Profile 2: ADMIN approves budget
6. Profile 1: TREASURER submits settlement

---

## 6. Permission Check Implementation

**File**: `src/auth/permissions.js`

```javascript
export function hasPermission(user, clubAccess = [], permission) {
  const roles = user?.roles || []

  // Check role-based permissions
  if (hasRolePermission(roles, permission)) {
    return true
  }

  // Check club-access-based permissions
  if (permission === PERMISSIONS.AUTHOR_REPORTS || permission === PERMISSIONS.MANAGE_ACTIVITIES) {
    return clubAccess.some(access => access.isManager)
  }

  if (permission === PERMISSIONS.VIEW_FINANCE || permission === PERMISSIONS.MANAGE_FINANCE) {
    return clubAccess.some(access => access.isTreasurer)
  }

  if (permission === PERMISSIONS.PARTICIPATE_IN_ACTIVITIES) {
    return clubAccess.some(access =>
      access.isApprovedMember || access.isManager || access.isTreasurer,
    )
  }

  return false
}
```

---

## 7. Navigation Visibility

**File**: `src/components/Sidebar.jsx`

Menu items are filtered by `hasPermission()`:
```javascript
const visibleNavItems = navItems.filter(item => hasPermission(item.permission))
```

| Menu | Permission | Visible To |
|------|-------------|------------|
| Dashboard | VIEW_DASHBOARD | All |
| Clubs | VIEW_CLUBS | All except SYSTEM_ADMIN |
| Reports | VIEW_REPORTS | All except SYSTEM_ADMIN |
| Activities | VIEW_ACTIVITIES | All except SYSTEM_ADMIN |
| Finance | VIEW_FINANCE | ADMIN, STU_ADMIN, TREASURER |
| Notifications | VIEW_NOTIFICATIONS | All |
| Profile | VIEW_PROFILE | All |
| Users | MANAGE_USERS | SYSTEM_ADMIN, ADMIN |

---

## 8. Next Steps

➡️ Continue to [02-Full-FE-Demo-25-35-Minutes.md](02-Full-FE-Demo-25-35-Minutes.md)

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-21  
**Author**: Claude (Senior Frontend QA Engineer)
