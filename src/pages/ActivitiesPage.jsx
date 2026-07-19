import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Modal from '../components/Modal'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const emptyForm = {
  clubId: '',
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  location: '',
}

function normalizeStatus(status) {
  return status?.toUpperCase() || 'PLANNED'
}

function formatDate(value) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function ActivitiesPage() {
  const { user, clubAccess } = useAuth()
  const { success, error } = useToast()
  const managedClubs = clubAccess.filter(access => access.isManager)
  const accessByClub = useMemo(
    () => new Map(clubAccess.map(access => [access.clubId, access])),
    [clubAccess],
  )

  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState(emptyForm)

  const loadActivities = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await api.getActivities()
      setActivities(Array.isArray(result) ? result : [])
    } catch (err) {
      error(err.message || 'Không thể tải danh sách hoạt động.')
    } finally {
      setIsLoading(false)
    }
  }, [error])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  const filteredActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return activities.filter(activity => {
      const matchesQuery = !query
        || activity.title.toLowerCase().includes(query)
        || activity.clubName.toLowerCase().includes(query)
        || activity.location.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'ALL' || normalizeStatus(activity.status) === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [activities, searchQuery, statusFilter])

  const registerForActivity = async (activity) => {
    if (busyId) return
    setBusyId(activity.id)
    try {
      const updated = await api.registerParticipant(activity.id, null, user?.name)
      setActivities(current => current.map(item => item.id === activity.id ? updated : item))
      success('Đã đăng ký tham gia hoạt động.')
    } catch (err) {
      error(err.message || 'Không thể đăng ký tham gia hoạt động.')
    } finally {
      setBusyId(null)
    }
  }

  const completeActivity = async (activity) => {
    if (busyId) return
    setBusyId(activity.id)
    try {
      const updated = await api.completeActivity(activity.id)
      setActivities(current => current.map(item => item.id === activity.id ? updated : item))
      setSelectedActivity(updated)
      success('Đã đánh dấu hoạt động hoàn tất.')
    } catch (err) {
      error(err.message || 'Không thể hoàn tất hoạt động.')
    } finally {
      setBusyId(null)
    }
  }

  const createActivity = async (event) => {
    event.preventDefault()
    if (busyId) return
    const club = managedClubs.find(item => item.clubId === Number(formData.clubId))
    if (!club || !formData.title.trim() || !formData.location.trim() || !formData.startTime || !formData.endTime) {
      error('Vui lòng nhập đầy đủ CLB, tiêu đề, thời gian và địa điểm.')
      return
    }
    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      error('Thời gian kết thúc phải sau thời gian bắt đầu.')
      return
    }

    setBusyId('create')
    try {
      const created = await api.createActivity({
        clubId: club.clubId,
        clubName: club.clubName,
        title: formData.title.trim(),
        description: formData.description.trim(),
        startTimeUtc: new Date(formData.startTime).toISOString(),
        endTimeUtc: new Date(formData.endTime).toISOString(),
        location: formData.location.trim(),
      })
      setActivities(current => [...current, created].sort((a, b) => new Date(a.startTimeUtc) - new Date(b.startTimeUtc)))
      setShowCreate(false)
      setFormData(emptyForm)
      success('Đã tạo hoạt động.')
    } catch (err) {
      error(err.message || 'Không thể tạo hoạt động.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Hoạt động CLB</h2>
          <p className="mt-1 text-sm text-gray-400">Chỉ hiển thị hoạt động thuộc CLB bạn có quyền xem.</p>
        </div>
        {managedClubs.length > 0 && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-5 py-3 font-semibold text-white"
          >
            Tạo hoạt động
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Tổng hoạt động', activities.length, 'text-cyan-300'],
          ['Sắp diễn ra', activities.filter(item => normalizeStatus(item.status) !== 'COMPLETED' && new Date(item.startTimeUtc) > new Date()).length, 'text-purple-300'],
          ['Đã hoàn tất', activities.filter(item => normalizeStatus(item.status) === 'COMPLETED').length, 'text-emerald-300'],
          ['Lượt đăng ký', activities.reduce((sum, item) => sum + (item.participants?.length || 0), 0), 'text-amber-300'],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={searchQuery}
          onChange={event => setSearchQuery(event.target.value)}
          placeholder="Tìm hoạt động, CLB hoặc địa điểm..."
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
        />
        <select
          value={statusFilter}
          onChange={event => setStatusFilter(event.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="SCHEDULED">Đã lên lịch</option>
          <option value="COMPLETED">Đã hoàn tất</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 py-16 text-center text-gray-500">
          Chưa có hoạt động phù hợp với quyền của bạn.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredActivities.map((activity, index) => {
            const status = normalizeStatus(activity.status)
            const access = accessByClub.get(activity.clubId)
            const registered = activity.participants?.some(participant => participant.userId === user?.id)
            const canParticipate = Boolean(access?.isApprovedMember || access?.isManager || access?.isTreasurer)

            return (
              <motion.article
                key={activity.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.035 }}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                    {activity.clubName}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-purple-500/15 text-purple-300'
                  }`}>
                    {activity.status}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{activity.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-400">{activity.description || 'Không có mô tả.'}</p>
                <dl className="mt-4 space-y-2 border-t border-slate-800 pt-4 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-gray-500">Bắt đầu</dt><dd className="text-right text-gray-200">{formatDate(activity.startTimeUtc)}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-gray-500">Địa điểm</dt><dd className="text-right text-gray-200">{activity.location}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-gray-500">Đăng ký</dt><dd className="font-semibold text-white">{activity.participants?.length || 0}</dd></div>
                </dl>
                <div className="mt-auto flex gap-2 pt-5">
                  <button
                    type="button"
                    onClick={() => setSelectedActivity(activity)}
                    className="flex-1 rounded-xl border border-slate-700 px-3 py-2.5 text-sm font-semibold text-gray-300"
                  >
                    Chi tiết
                  </button>
                  {status !== 'COMPLETED' && canParticipate && (
                    <button
                      type="button"
                      onClick={() => registerForActivity(activity)}
                      disabled={registered || busyId === activity.id}
                      className="flex-1 rounded-xl bg-cyan-500/15 px-3 py-2.5 text-sm font-semibold text-cyan-300 disabled:opacity-45"
                    >
                      {registered ? 'Đã đăng ký' : busyId === activity.id ? 'Đang xử lý...' : 'Tham gia'}
                    </button>
                  )}
                </div>
              </motion.article>
            )
          })}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo hoạt động" size="lg">
        <form onSubmit={createActivity} className="space-y-4">
          <select
            value={formData.clubId}
            onChange={event => setFormData(current => ({ ...current, clubId: event.target.value }))}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900"
          >
            <option value="">Chọn CLB bạn quản lý</option>
            {managedClubs.map(club => <option key={club.clubId} value={club.clubId}>{club.clubName}</option>)}
          </select>
          <input
            value={formData.title}
            onChange={event => setFormData(current => ({ ...current, title: event.target.value }))}
            required
            maxLength={200}
            placeholder="Tên hoạt động"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900"
          />
          <textarea
            value={formData.description}
            onChange={event => setFormData(current => ({ ...current, description: event.target.value }))}
            rows={3}
            placeholder="Mô tả"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-neutral-700">Bắt đầu
              <input type="datetime-local" value={formData.startTime} onChange={event => setFormData(current => ({ ...current, startTime: event.target.value }))} required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
            </label>
            <label className="text-sm font-semibold text-neutral-700">Kết thúc
              <input type="datetime-local" value={formData.endTime} onChange={event => setFormData(current => ({ ...current, endTime: event.target.value }))} required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
            </label>
          </div>
          <input
            value={formData.location}
            onChange={event => setFormData(current => ({ ...current, location: event.target.value }))}
            required
            maxLength={200}
            placeholder="Địa điểm"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900"
          />
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Hủy</button>
            <button type="submit" disabled={busyId === 'create'} className="flex-1 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white disabled:opacity-50">
              {busyId === 'create' ? 'Đang tạo...' : 'Tạo hoạt động'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(selectedActivity)} onClose={() => setSelectedActivity(null)} title={selectedActivity?.title || 'Chi tiết hoạt động'} size="lg">
        {selectedActivity && (
          <div className="space-y-4 text-neutral-700">
            <p>{selectedActivity.description || 'Không có mô tả.'}</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-neutral-50 p-3"><dt className="text-xs text-neutral-500">CLB</dt><dd className="mt-1 font-semibold">{selectedActivity.clubName}</dd></div>
              <div className="rounded-lg bg-neutral-50 p-3"><dt className="text-xs text-neutral-500">Địa điểm</dt><dd className="mt-1 font-semibold">{selectedActivity.location}</dd></div>
              <div className="rounded-lg bg-neutral-50 p-3"><dt className="text-xs text-neutral-500">Bắt đầu</dt><dd className="mt-1 font-semibold">{formatDate(selectedActivity.startTimeUtc)}</dd></div>
              <div className="rounded-lg bg-neutral-50 p-3"><dt className="text-xs text-neutral-500">Kết thúc</dt><dd className="mt-1 font-semibold">{formatDate(selectedActivity.endTimeUtc)}</dd></div>
            </dl>
            {accessByClub.get(selectedActivity.clubId)?.isManager && normalizeStatus(selectedActivity.status) !== 'COMPLETED' && (
              <button
                type="button"
                onClick={() => completeActivity(selectedActivity)}
                disabled={busyId === selectedActivity.id}
                className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
              >
                {busyId === selectedActivity.id ? 'Đang xử lý...' : 'Đánh dấu hoàn tất'}
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
