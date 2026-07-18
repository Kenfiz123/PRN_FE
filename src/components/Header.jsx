import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Header({ title, subtitle, onOpenSidebar }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const handleLogout = async () => {
    setShowProfileMenu(false)
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-slate-900/90 px-4 backdrop-blur-md sm:h-20 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Mở menu"
          className="rounded-xl border border-slate-700 p-2.5 text-gray-300 transition hover:border-cyan-500/40 hover:text-cyan-300 lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="min-w-0">
          <h1 className="truncate text-lg font-bold text-white sm:text-2xl">{title || 'Dashboard'}</h1>
          {subtitle && <p className="hidden text-sm text-gray-400 sm:block">{subtitle}</p>}
        </motion.div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden rounded-xl border border-slate-700 bg-slate-800/50 px-3 py-2 text-xs font-semibold text-gray-300 xl:block">
          {currentDate}
        </span>

        <button
          type="button"
          onClick={() => navigate('/notifications')}
          aria-label="Mở thông báo"
          className="rounded-xl border border-transparent p-2.5 text-gray-400 transition hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-300"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(current => !current)}
            aria-expanded={showProfileMenu}
            aria-label="Mở menu tài khoản"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 text-sm font-bold text-white shadow-lg shadow-cyan-500/20"
          >
            {user?.avatar || '?'}
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-2xl shadow-black/50"
              >
                <p className="truncate text-sm font-bold text-white">{user?.name || 'Người dùng'}</p>
                <p className="mt-1 truncate text-xs text-gray-400">{user?.email || ''}</p>
                <p className="mt-1 truncate text-xs text-cyan-300">{user?.roles?.join(', ') || ''}</p>
                <div className="mt-3 space-y-1 border-t border-white/5 pt-3">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-white/5 hover:text-white"
                  >
                    Hồ sơ
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-300 transition hover:bg-rose-500/10"
                  >
                    Đăng xuất
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
