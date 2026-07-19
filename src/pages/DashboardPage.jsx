import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../auth/permissions'

export default function DashboardPage() {
  const { user, clubAccess, hasPermission } = useAuth()
  const [data, setData] = useState({
    clubs: [],
    reports: [],
    activities: [],
    proposals: [],
    notifications: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const loadDashboard = async () => {
      const requests = [
        hasPermission(PERMISSIONS.VIEW_CLUBS) ? api.getClubs() : Promise.resolve([]),
        hasPermission(PERMISSIONS.VIEW_REPORTS) ? api.getReports({ page: 1, pageSize: 5 }) : Promise.resolve({ items: [] }),
        hasPermission(PERMISSIONS.VIEW_ACTIVITIES) ? api.getActivities() : Promise.resolve([]),
        hasPermission(PERMISSIONS.VIEW_FINANCE) ? api.getBudgetProposals({ page: 1, pageSize: 5 }) : Promise.resolve({ items: [] }),
        hasPermission(PERMISSIONS.VIEW_NOTIFICATIONS) ? api.getNotifications(false) : Promise.resolve([]),
      ]
      const results = await Promise.allSettled(requests)
      if (!active) return
      setData({
        clubs: results[0].status === 'fulfilled' && Array.isArray(results[0].value) ? results[0].value : [],
        reports: results[1].status === 'fulfilled' && Array.isArray(results[1].value?.items) ? results[1].value.items : [],
        activities: results[2].status === 'fulfilled' && Array.isArray(results[2].value) ? results[2].value : [],
        proposals: results[3].status === 'fulfilled' && Array.isArray(results[3].value?.items) ? results[3].value.items : [],
        notifications: results[4].status === 'fulfilled' && Array.isArray(results[4].value) ? results[4].value : [],
      })
      setIsLoading(false)
    }
    loadDashboard()
    return () => { active = false }
  }, [hasPermission])

  const approvedClubs = clubAccess.filter(access => access.isApprovedMember || access.isManager)
  const unreadNotifications = data.notifications.filter(item => !item.isRead)
  const upcomingActivities = data.activities
    .filter(item => new Date(item.startTimeUtc) > new Date() && item.status?.toUpperCase() !== 'COMPLETED')
    .sort((a, b) => new Date(a.startTimeUtc) - new Date(b.startTimeUtc))
    .slice(0, 4)

  const cards = [
    { label: 'CLB có quyền', value: approvedClubs.length, color: 'text-cyan-300', href: '/clubs', show: hasPermission(PERMISSIONS.VIEW_CLUBS) },
    { label: 'Báo cáo hiển thị', value: data.reports.length, color: 'text-purple-300', href: '/reports', show: hasPermission(PERMISSIONS.VIEW_REPORTS) },
    { label: 'Hoạt động', value: data.activities.length, color: 'text-emerald-300', href: '/activities', show: hasPermission(PERMISSIONS.VIEW_ACTIVITIES) },
    { label: 'Thông báo chưa đọc', value: unreadNotifications.length, color: 'text-amber-300', href: '/notifications', show: hasPermission(PERMISSIONS.VIEW_NOTIFICATIONS) },
  ].filter(card => card.show)

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-slate-900/60 to-purple-500/10 p-6 sm:p-8"
      >
        <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">ClubReportHub</p>
        <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Xin chào, {user?.name || user?.username}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
          Dữ liệu trên bảng điều khiển được giới hạn theo vai trò hệ thống và quyền CLB đã được phê duyệt của bạn.
        </p>
      </motion.section>

      {isLoading ? (
        <div className="flex min-h-52 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" /></div>
      ) : (
        <>
          <section className={`grid gap-4 ${cards.length > 2 ? 'grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2'}`}>
            {cards.map((card, index) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Link to={card.href} className="block rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-cyan-500/30">
                  <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">{card.label}</p>
                </Link>
              </motion.div>
            ))}
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            {hasPermission(PERMISSIONS.VIEW_ACTIVITIES) && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Hoạt động sắp tới</h3>
                  <Link to="/activities" className="text-sm font-semibold text-cyan-300">Xem tất cả</Link>
                </div>
                {upcomingActivities.length === 0 ? (
                  <p className="mt-5 rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-gray-500">Chưa có hoạt động sắp tới.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {upcomingActivities.map(activity => (
                      <div key={activity.id} className="rounded-xl bg-slate-950/50 p-4">
                        <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-white">{activity.title}</p><p className="mt-1 text-xs text-cyan-300">{activity.clubName}</p></div><time className="text-right text-xs text-gray-500">{new Date(activity.startTimeUtc).toLocaleDateString('vi-VN')}</time></div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {hasPermission(PERMISSIONS.VIEW_NOTIFICATIONS) && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Thông báo mới</h3>
                  <Link to="/notifications" className="text-sm font-semibold text-cyan-300">Xem tất cả</Link>
                </div>
                {unreadNotifications.length === 0 ? (
                  <p className="mt-5 rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-gray-500">Không có thông báo chưa đọc.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {unreadNotifications.slice(0, 4).map(notification => (
                      <div key={notification.id} className="rounded-xl bg-slate-950/50 p-4">
                        <p className="font-semibold text-white">{notification.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-400">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </>
      )}
    </div>
  )
}
