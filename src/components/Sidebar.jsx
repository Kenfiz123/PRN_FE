import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../auth/permissions'

const navItems = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    permission: PERMISSIONS.VIEW_DASHBOARD,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )
  },
  {
    path: '/clubs',
    name: 'Clubs',
    permission: PERMISSIONS.VIEW_CLUBS,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0M7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    path: '/reports',
    name: 'Reports',
    permission: PERMISSIONS.VIEW_REPORTS,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    path: '/activities',
    name: 'Activities',
    permission: PERMISSIONS.VIEW_ACTIVITIES,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    path: '/finance',
    name: 'Finance',
    permission: PERMISSIONS.VIEW_FINANCE,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    path: '/notifications',
    name: 'Notifications',
    permission: PERMISSIONS.VIEW_NOTIFICATIONS,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    badge: 3
  },
  {
    path: '/profile',
    name: 'Profile',
    permission: PERMISSIONS.VIEW_PROFILE,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    path: '/users',
    name: 'Users',
    permission: PERMISSIONS.MANAGE_USERS,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  }
]

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const location = useLocation()
  const { user, logout, hasPermission } = useAuth()
  const visibleNavItems = navItems.filter(item => hasPermission(item.permission))

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-slate-800 bg-slate-900 transition-transform duration-200 lg:z-40 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white tracking-wide">ClubHub</h1>
            <p className="text-[10px] text-cyan-400 uppercase tracking-[0.2em] font-medium">Report System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto">
        <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold mb-3 px-3">Menu</p>
        <div className="space-y-1">
          {visibleNavItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, type: 'spring', stiffness: 100 }}
            >
              <NavLink
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/10 text-white border border-cyan-500/30'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-r-full"
                      />
                    )}
                    <span className={`transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-gray-500 group-hover:text-cyan-400'
                    }`}>
                      {item.icon}
                    </span>
                    <span className={`text-sm font-semibold transition-colors ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    }`}>
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="ml-auto min-w-[24px] h-6 px-2 flex items-center justify-center text-xs font-bold rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/30">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </div>

      </nav>

      {/* User Section */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.div
          whileHover={{ x: 2 }}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/30">
              {user?.avatar || 'AC'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Guest User'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.roles?.join(', ') || 'Visitor'}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all lg:opacity-0 lg:group-hover:opacity-100"
            title="Logout"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </motion.div>
      </div>
      </aside>
    </>
  )
}
