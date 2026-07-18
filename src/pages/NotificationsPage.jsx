import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'

function formatDate(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function NotificationsPage() {
  const { success, error } = useToast()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const loadNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await api.getNotifications(false)
      setNotifications(Array.isArray(result) ? result : [])
    } catch (err) {
      error(err.message || 'Không thể tải thông báo.')
    } finally {
      setIsLoading(false)
    }
  }, [error])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  const filtered = useMemo(() => notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead
    if (filter === 'read') return notification.isRead
    return true
  }), [filter, notifications])

  const unreadCount = notifications.filter(notification => !notification.isRead).length

  const markRead = async (notification) => {
    if (notification.isRead || busyId) return
    setBusyId(notification.id)
    try {
      await api.markNotificationRead(notification.id)
      setNotifications(current => current.map(item =>
        item.id === notification.id ? { ...item, isRead: true } : item,
      ))
    } catch (err) {
      error(err.message || 'Không thể đánh dấu thông báo.')
    } finally {
      setBusyId(null)
    }
  }

  const markAllRead = async () => {
    if (unreadCount === 0 || busyId) return
    setBusyId('all')
    try {
      await api.markAllNotificationsRead()
      setNotifications(current => current.map(item => ({ ...item, isRead: true })))
      success('Đã đánh dấu tất cả thông báo là đã đọc.')
    } catch (err) {
      error(err.message || 'Không thể đánh dấu tất cả thông báo.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Thông báo</h2>
          <p className="mt-1 text-sm text-gray-400">{unreadCount} thông báo chưa đọc</p>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          disabled={unreadCount === 0 || Boolean(busyId)}
          className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busyId === 'all' ? 'Đang xử lý...' : 'Đánh dấu tất cả đã đọc'}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          ['all', `Tất cả (${notifications.length})`],
          ['unread', `Chưa đọc (${unreadCount})`],
          ['read', `Đã đọc (${notifications.length - unreadCount})`],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition ${
              filter === value
                ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300'
                : 'border-slate-800 bg-slate-900 text-gray-400 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex min-h-56 items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 py-14 text-center text-gray-500">
          Không có thông báo trong nhóm này.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notification, index) => (
            <motion.button
              key={notification.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.025 }}
              onClick={() => markRead(notification)}
              disabled={busyId === notification.id}
              className={`w-full rounded-2xl border p-4 text-left transition sm:p-5 ${
                notification.isRead
                  ? 'border-slate-800 bg-slate-900/45'
                  : 'border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.isRead ? 'bg-slate-600' : 'bg-cyan-400'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className={`text-sm font-bold sm:text-base ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                      {notification.title}
                    </h3>
                    <time className="shrink-0 text-xs text-gray-500">{formatDate(notification.createdAtUtc)}</time>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-400">{notification.message}</p>
                  <span className="mt-3 inline-flex rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {notification.eventType}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  )
}
