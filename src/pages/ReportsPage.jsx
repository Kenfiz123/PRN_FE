import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Modal from '../components/Modal'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { PERMISSIONS } from '../auth/permissions'

const emptyForm = {
  clubId: '',
  period: '',
  reportType: 'ACTIVITY',
  tag: 'ACTIVITY',
  dueDate: '',
  activityName: '',
  activityDate: '',
  description: '',
  participantCount: 0,
  outcome: '',
}

function normalizeStatus(status) {
  return status?.toUpperCase().replace(/\s+/g, '_') || 'DRAFT'
}

function statusClass(status) {
  const value = normalizeStatus(status)
  if (value === 'APPROVED') return 'bg-emerald-500/15 text-emerald-300'
  if (value === 'REJECTED') return 'bg-rose-500/15 text-rose-300'
  if (value === 'UNDER_REVIEW') return 'bg-purple-500/15 text-purple-300'
  if (value === 'SUBMITTED') return 'bg-cyan-500/15 text-cyan-300'
  return 'bg-amber-500/15 text-amber-300'
}

export default function ReportsPage() {
  const { user, clubAccess, hasPermission } = useAuth()
  const { success, error } = useToast()
  const managedClubs = clubAccess.filter(access => access.isManager)
  const managedClubIds = useMemo(() => new Set(managedClubs.map(access => access.clubId)), [managedClubs])
  const canFinalReview = hasPermission(PERMISSIONS.REVIEW_REPORTS)

  const [reports, setReports] = useState([])
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedReport, setSelectedReport] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [reviewTarget, setReviewTarget] = useState(null)
  const [reviewAction, setReviewAction] = useState('approve')
  const [feedback, setFeedback] = useState('')

  const loadReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const [listResult, summaryResult] = await Promise.all([
        api.getReports({ page: 1, pageSize: 100 }),
        api.getReportSummary(),
      ])
      setReports(Array.isArray(listResult?.items) ? listResult.items : [])
      setSummary(summaryResult || null)
    } catch (err) {
      error(err.message || 'Không thể tải báo cáo.')
    } finally {
      setIsLoading(false)
    }
  }, [error])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return reports.filter(report => {
      const matchesQuery = !query
        || report.clubName.toLowerCase().includes(query)
        || report.period.toLowerCase().includes(query)
        || report.reportType.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'ALL' || normalizeStatus(report.status) === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [reports, searchQuery, statusFilter])

  const replaceReport = (updated) => {
    setReports(current => current.map(report => report.id === updated.id ? updated : report))
    setSelectedReport(current => current?.id === updated.id ? updated : current)
  }

  const submitReport = async (report) => {
    if (busyId) return
    setBusyId(report.id)
    try {
      replaceReport(await api.submitReport(report.id))
      success('Đã gửi báo cáo để xét duyệt.')
      await loadReports()
    } catch (err) {
      error(err.message || 'Không thể gửi báo cáo.')
    } finally {
      setBusyId(null)
    }
  }

  const createReport = async (event) => {
    event.preventDefault()
    if (busyId) return
    const club = managedClubs.find(item => item.clubId === Number(formData.clubId))
    if (!club || !formData.period.trim() || !formData.dueDate || !formData.activityName.trim() || !formData.activityDate) {
      error('Vui lòng nhập đầy đủ CLB, kỳ báo cáo, hạn nộp và hoạt động.')
      return
    }

    setBusyId('create')
    try {
      const created = await api.createReport({
        clubId: club.clubId,
        clubName: club.clubName,
        period: formData.period.trim(),
        reportType: formData.reportType,
        tag: formData.tag,
        dueDate: formData.dueDate,
        details: [{
          id: null,
          activityName: formData.activityName.trim(),
          activityDate: formData.activityDate,
          description: formData.description.trim(),
          participantCount: Number(formData.participantCount) || 0,
          outcome: formData.outcome.trim(),
        }],
      })
      setReports(current => [created, ...current])
      setShowCreate(false)
      setFormData(emptyForm)
      success('Đã tạo bản nháp báo cáo.')
      await loadReports()
    } catch (err) {
      error(err.message || 'Không thể tạo báo cáo.')
    } finally {
      setBusyId(null)
    }
  }

  const openReview = (report, action) => {
    setReviewTarget(report)
    setReviewAction(action)
    setFeedback('')
  }

  const submitReview = async (event) => {
    event.preventDefault()
    if (busyId || !reviewTarget) return
    if (reviewAction === 'reject' && !feedback.trim()) {
      error('Vui lòng nhập lý do từ chối.')
      return
    }

    setBusyId(reviewTarget.id)
    try {
      let updated
      if (reviewAction === 'forward') updated = await api.reviewReport(reviewTarget.id, feedback.trim())
      if (reviewAction === 'approve') updated = await api.approveReport(reviewTarget.id, feedback.trim())
      if (reviewAction === 'reject') updated = await api.rejectReport(reviewTarget.id, feedback.trim())
      replaceReport(updated)
      setReviewTarget(null)
      setFeedback('')
      success(reviewAction === 'approve' ? 'Đã phê duyệt báo cáo.' : reviewAction === 'forward' ? 'Đã chuyển báo cáo lên phê duyệt cuối.' : 'Đã từ chối báo cáo.')
      await loadReports()
    } catch (err) {
      error(err.message || 'Không thể xét duyệt báo cáo.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Báo cáo</h2>
          <p className="mt-1 text-sm text-gray-400">Dữ liệu và thao tác được đồng bộ trực tiếp với Report Service.</p>
        </div>
        {managedClubs.length > 0 && (
          <button type="button" onClick={() => setShowCreate(true)} className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-5 py-3 font-semibold text-white">
            Tạo báo cáo
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Tổng báo cáo', summary?.total ?? reports.length, 'text-cyan-300'],
          ['Bản nháp', summary?.draft ?? 0, 'text-amber-300'],
          ['Đang xét duyệt', (summary?.submitted ?? 0) + (summary?.underReview ?? 0), 'text-purple-300'],
          ['Đã duyệt', summary?.approved ?? 0, 'text-emerald-300'],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Tìm CLB, kỳ hoặc loại báo cáo..." className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500" />
        <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white">
          <option value="ALL">Tất cả trạng thái</option>
          <option value="DRAFT">Bản nháp</option>
          <option value="SUBMITTED">Đã gửi</option>
          <option value="UNDER_REVIEW">Đang xét duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Bị từ chối</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" /></div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 py-16 text-center text-gray-500">Chưa có báo cáo phù hợp.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="min-w-[820px] w-full">
              <thead className="border-b border-slate-800 bg-slate-950/50 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr><th className="px-5 py-4">CLB / Kỳ</th><th className="px-5 py-4">Loại</th><th className="px-5 py-4">Hạn nộp</th><th className="px-5 py-4">Trạng thái</th><th className="px-5 py-4 text-right">Thao tác</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredReports.map((report, index) => {
                  const status = normalizeStatus(report.status)
                  const isCreator = report.createdByUserId === user?.id
                  const canManagerReview = managedClubIds.has(report.clubId) && status === 'SUBMITTED' && !isCreator
                  const canSubmit = isCreator && (status === 'DRAFT' || status === 'REJECTED')
                  const canFinalAction = canFinalReview && status === 'UNDER_REVIEW'

                  return (
                    <motion.tr key={report.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-4"><p className="font-semibold text-white">{report.clubName}</p><p className="mt-1 text-xs text-gray-500">{report.period}</p></td>
                      <td className="px-5 py-4 text-sm text-gray-300">{report.reportType}<p className="text-xs text-gray-500">{report.tag}</p></td>
                      <td className="px-5 py-4 text-sm text-gray-300">{report.dueDate}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}>{report.status}</span></td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setSelectedReport(report)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-gray-300">Xem</button>
                          {canSubmit && <button type="button" onClick={() => submitReport(report)} disabled={busyId === report.id} className="rounded-lg bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-300 disabled:opacity-50">Gửi duyệt</button>}
                          {canManagerReview && <button type="button" onClick={() => openReview(report, 'forward')} className="rounded-lg bg-purple-500/15 px-3 py-2 text-xs font-semibold text-purple-300">Chuyển duyệt</button>}
                          {(canManagerReview || canFinalAction) && <button type="button" onClick={() => openReview(report, 'reject')} className="rounded-lg bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300">Từ chối</button>}
                          {canFinalAction && <button type="button" onClick={() => openReview(report, 'approve')} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300">Phê duyệt</button>}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo báo cáo" size="lg">
        <form onSubmit={createReport} className="space-y-4">
          <select value={formData.clubId} onChange={event => setFormData(current => ({ ...current, clubId: event.target.value }))} required className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900">
            <option value="">Chọn CLB bạn quản lý</option>
            {managedClubs.map(club => <option key={club.clubId} value={club.clubId}>{club.clubName}</option>)}
          </select>
          <div className="grid gap-4 sm:grid-cols-2">
            <input value={formData.period} onChange={event => setFormData(current => ({ ...current, period: event.target.value }))} required placeholder="Kỳ báo cáo, ví dụ 2026-Q3" className="rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
            <input type="date" value={formData.dueDate} onChange={event => setFormData(current => ({ ...current, dueDate: event.target.value }))} required className="rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
            <input value={formData.reportType} onChange={event => setFormData(current => ({ ...current, reportType: event.target.value }))} required placeholder="Loại báo cáo" className="rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
            <input value={formData.tag} onChange={event => setFormData(current => ({ ...current, tag: event.target.value }))} required placeholder="Nhãn" className="rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="mb-3 font-semibold text-neutral-800">Chi tiết hoạt động đầu tiên</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={formData.activityName} onChange={event => setFormData(current => ({ ...current, activityName: event.target.value }))} required placeholder="Tên hoạt động" className="rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
              <input type="date" value={formData.activityDate} onChange={event => setFormData(current => ({ ...current, activityDate: event.target.value }))} required className="rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
              <input type="number" min="0" value={formData.participantCount} onChange={event => setFormData(current => ({ ...current, participantCount: event.target.value }))} placeholder="Số người tham gia" className="rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
              <input value={formData.outcome} onChange={event => setFormData(current => ({ ...current, outcome: event.target.value }))} placeholder="Kết quả" className="rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
            </div>
            <textarea value={formData.description} onChange={event => setFormData(current => ({ ...current, description: event.target.value }))} rows={3} placeholder="Mô tả hoạt động" className="mt-3 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
          </div>
          <div className="flex gap-3"><button type="button" onClick={() => setShowCreate(false)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Hủy</button><button type="submit" disabled={busyId === 'create'} className="flex-1 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{busyId === 'create' ? 'Đang tạo...' : 'Tạo bản nháp'}</button></div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(selectedReport)} onClose={() => setSelectedReport(null)} title="Chi tiết báo cáo" size="xl">
        {selectedReport && (
          <div className="space-y-5 text-neutral-700">
            <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-neutral-50 p-3"><p className="text-xs text-neutral-500">CLB</p><p className="mt-1 font-semibold">{selectedReport.clubName}</p></div><div className="rounded-lg bg-neutral-50 p-3"><p className="text-xs text-neutral-500">Kỳ</p><p className="mt-1 font-semibold">{selectedReport.period}</p></div><div className="rounded-lg bg-neutral-50 p-3"><p className="text-xs text-neutral-500">Trạng thái</p><p className="mt-1 font-semibold">{selectedReport.status}</p></div></div>
            <div><h3 className="font-semibold text-neutral-900">Hoạt động</h3><div className="mt-2 space-y-2">{selectedReport.details?.map(detail => <div key={detail.id} className="rounded-lg border border-neutral-200 p-3"><p className="font-semibold">{detail.activityName}</p><p className="mt-1 text-sm">{detail.description}</p><p className="mt-2 text-xs text-neutral-500">{detail.activityDate} · {detail.participantCount} người · {detail.outcome}</p></div>)}</div></div>
            {selectedReport.feedback?.length > 0 && <div><h3 className="font-semibold text-neutral-900">Phản hồi</h3><div className="mt-2 space-y-2">{selectedReport.feedback.map(item => <div key={item.id} className="rounded-lg bg-neutral-50 p-3 text-sm"><p className="font-semibold">{item.decision} — {item.reviewerName}</p><p className="mt-1">{item.message}</p></div>)}</div></div>}
          </div>
        )}
      </Modal>

      <Modal isOpen={Boolean(reviewTarget)} onClose={() => setReviewTarget(null)} title={reviewAction === 'approve' ? 'Phê duyệt báo cáo' : reviewAction === 'forward' ? 'Chuyển báo cáo lên duyệt cuối' : 'Từ chối báo cáo'}>
        <form onSubmit={submitReview} className="space-y-4">
          <p className="text-sm text-neutral-600">{reviewTarget?.clubName} — {reviewTarget?.period}</p>
          <textarea value={feedback} onChange={event => setFeedback(event.target.value)} required={reviewAction === 'reject'} rows={4} maxLength={1000} placeholder={reviewAction === 'reject' ? 'Nhập lý do từ chối' : 'Ghi chú (không bắt buộc)'} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
          <div className="flex gap-3"><button type="button" onClick={() => setReviewTarget(null)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Hủy</button><button type="submit" disabled={busyId === reviewTarget?.id} className={`flex-1 rounded-lg px-4 py-3 font-semibold text-white disabled:opacity-50 ${reviewAction === 'reject' ? 'bg-rose-600' : reviewAction === 'approve' ? 'bg-emerald-600' : 'bg-purple-600'}`}>{busyId === reviewTarget?.id ? 'Đang xử lý...' : 'Xác nhận'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
