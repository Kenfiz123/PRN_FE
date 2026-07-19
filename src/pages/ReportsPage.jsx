import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Modal from '../components/Modal'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { PERMISSIONS } from '../auth/permissions'
import { useDebounce } from '../hooks/useLocalStorage'

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

const REPORT_TYPE_LABELS = {
  ACTIVITY: 'Activity report',
  EVENT: 'Event report',
  FINANCIAL: 'Financial report',
  PERFORMANCE: 'Performance report',
  MONTHLY: 'Monthly report',
  QUARTERLY: 'Quarterly report',
  'BÁO CÁO HOẠT ĐỘNG': 'Activity report',
  'BÁO CÁO SỰ KIỆN': 'Event report',
  'BÁO CÁO TÀI CHÍNH': 'Financial report',
  'BÁO CÁO THÁNG': 'Monthly report',
  'BÁO CÁO QUÝ': 'Quarterly report',
}
const LEGACY_REPORT_MESSAGES = {
  'Báo cáo đã được quản trị viên phê duyệt.': 'The report has been approved by an administrator.',
  'Báo cáo đã bị quản trị viên từ chối.': 'The report has been rejected by an administrator.',
  'Báo cáo đã được chuyển để phê duyệt cuối cùng.': 'The report has been forwarded for final approval.',
}

function normalizeStatus(status) {
  return status?.toUpperCase().replace(/\s+/g, '_') || 'DRAFT'
}

function formatStatus(status) {
  return normalizeStatus(status)
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/^\w/, letter => letter.toUpperCase())
}

function formatReportType(value) {
  const normalized = String(value || '').trim().toUpperCase()
  return REPORT_TYPE_LABELS[normalized] || value || '—'
}

function formatReportMessage(value) {
  return LEGACY_REPORT_MESSAGES[String(value || '').trim()] || value || 'No notes provided.'
}

function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-neutral-700">{label}</span>
      {children}
    </label>
  )
}

function statusClass(status) {
  const value = normalizeStatus(status)
  if (value === 'APPROVED') return 'bg-emerald-500/15 text-emerald-300'
  if (value === 'REJECTED') return 'bg-rose-500/15 text-rose-300'
  if (value === 'UNDER_REVIEW') return 'bg-purple-500/15 text-purple-300'
  if (value === 'SUBMITTED') return 'bg-cyan-500/15 text-cyan-300'
  return 'bg-amber-500/15 text-amber-300'
}

function formatDateTime(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatFileSize(bytes) {
  const size = Number(bytes) || 0
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export default function ReportsPage() {
  const { user, clubAccess, hasPermission } = useAuth()
  const { success, error } = useToast()
  const managedClubs = useMemo(
    () => clubAccess.filter(access => access.isManager),
    [clubAccess],
  )
  const authorClubs = useMemo(
    () => clubAccess.filter(access => access.isManager || access.isTreasurer),
    [clubAccess],
  )
  const managedClubIds = useMemo(() => new Set(managedClubs.map(access => access.clubId)), [managedClubs])
  const canFinalReview = hasPermission(PERMISSIONS.REVIEW_REPORTS)
  const canAuthorReports = hasPermission(PERMISSIONS.AUTHOR_REPORTS)

  const [reports, setReports] = useState([])
  const [summary, setSummary] = useState(null)
  const [aggregation, setAggregation] = useState(null)
  const [leaderboard, setLeaderboard] = useState(null)
  const [deadlines, setDeadlines] = useState([])
  const [analyticsPeriod, setAnalyticsPeriod] = useState('')
  const debouncedAnalyticsPeriod = useDebounce(analyticsPeriod.trim(), 350)
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
      const [listResult, summaryResult, aggregationResult, leaderboardResult, deadlineResult] = await Promise.all([
        api.getReports({ page: 1, pageSize: 100 }),
        api.getReportSummary(),
        canFinalReview ? api.getReportAggregation(debouncedAnalyticsPeriod) : Promise.resolve(null),
        canFinalReview ? api.getKpiLeaderboard(debouncedAnalyticsPeriod) : Promise.resolve(null),
        managedClubs.length > 0 ? api.getMyDeadlines() : Promise.resolve([]),
      ])
      setReports(Array.isArray(listResult?.items) ? listResult.items : [])
      setSummary(summaryResult || null)
      setAggregation(aggregationResult)
      setLeaderboard(leaderboardResult)
      setDeadlines(Array.isArray(deadlineResult) ? deadlineResult : [])
    } catch (err) {
      error(err.message || 'Unable to load reports.')
    } finally {
      setIsLoading(false)
    }
  }, [canFinalReview, debouncedAnalyticsPeriod, error, managedClubs.length])

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

  const selectedAuthorClub = authorClubs.find(
    item => item.clubId === Number(formData.clubId),
  )
  const isTreasurerFinancialReport = Boolean(
    selectedAuthorClub?.isTreasurer && !selectedAuthorClub?.isManager,
  )

  const replaceReport = (updated) => {
    setReports(current => current.map(report => report.id === updated.id ? updated : report))
    setSelectedReport(current => current?.id === updated.id ? updated : current)
  }

  const submitReport = async (report) => {
    if (busyId) return
    setBusyId(report.id)
    try {
      replaceReport(await api.submitReport(report.id))
      success('Report submitted for review.')
      await loadReports()
    } catch (err) {
      error(err.message || 'Unable to submit the report.')
    } finally {
      setBusyId(null)
    }
  }

  const createReport = async (event) => {
    event.preventDefault()
    if (busyId) return
    const club = authorClubs.find(item => item.clubId === Number(formData.clubId))
    if (!club || !formData.period.trim() || !formData.dueDate || !formData.activityName.trim() || !formData.activityDate) {
      error('Please provide the club, reporting period, due date, and activity.')
      return
    }

    setBusyId('create')
    try {
      const created = await api.createReport({
        clubId: club.clubId,
        clubName: club.clubName,
        period: formData.period.trim(),
        reportType: club.isTreasurer && !club.isManager ? 'FINANCIAL' : formData.reportType,
        tag: club.isTreasurer && !club.isManager ? 'FINANCE' : formData.tag,
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
      success('Report draft created.')
      await loadReports()
    } catch (err) {
      error(err.message || 'Unable to create the report.')
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
      error('Please provide a rejection reason.')
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
      success(reviewAction === 'approve' ? 'Report approved.' : reviewAction === 'forward' ? 'Report forwarded for final approval.' : 'Report rejected.')
      await loadReports()
    } catch (err) {
      error(err.message || 'Unable to review the report.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reports</h2>
          <p className="mt-1 text-sm text-gray-400">Data and actions are synchronized directly with the Report Service.</p>
        </div>
        {canAuthorReports && authorClubs.length > 0 && (
          <button type="button" onClick={() => setShowCreate(true)} className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-5 py-3 font-semibold text-white">
            Create report
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Total reports', summary?.total ?? reports.length, 'text-cyan-300'],
          ['Drafts', summary?.draft ?? 0, 'text-amber-300'],
          ['Under review', (summary?.submitted ?? 0) + (summary?.underReview ?? 0), 'text-purple-300'],
          ['Approved', summary?.approved ?? 0, 'text-emerald-300'],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {deadlines.length > 0 && (
        <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h3 className="font-bold text-white">Club Report Deadlines</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {deadlines.map(deadline => (
              <div key={deadline.id} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-white">{deadline.period}</p>
                  <span className={`text-xs font-semibold ${deadline.isOverdue ? 'text-rose-300' : 'text-amber-300'}`}>
                    {deadline.isOverdue ? `${Math.abs(deadline.daysRemaining)} days overdue` : `${deadline.daysRemaining} days remaining`}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-400">Due date: {deadline.dueDate}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {canFinalReview && (
        <section className="space-y-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-bold text-white">Report Summary & KPI</h3>
              <p className="mt-1 text-sm text-gray-400">Only administrators and Student Affairs can view system-wide data.</p>
            </div>
            <label className="text-sm text-gray-400">
              Reporting period
              <input
                value={analyticsPeriod}
                onChange={event => setAnalyticsPeriod(event.target.value)}
                placeholder="Leave blank for all periods"
                className="mt-1 block rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-purple-500"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Approved reports', aggregation?.approvedReports ?? 0],
              ['Recorded activities', aggregation?.totalActivities ?? 0],
              ['Total participants', aggregation?.totalParticipants ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-2xl font-bold text-purple-300">{value}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="min-w-[760px] w-full">
              <thead className="bg-slate-950/70 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Club</th><th className="px-4 py-3">KPI score</th><th className="px-4 py-3">Reports</th><th className="px-4 py-3">Activities</th><th className="px-4 py-3">Participants</th><th className="px-4 py-3">Violations</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(leaderboard?.clubs || []).map(row => (
                  <tr key={row.clubId}>
                    <td className="px-4 py-3 font-bold text-purple-300">#{row.rank}</td>
                    <td className="px-4 py-3 font-semibold text-white">{row.clubName}</td>
                    <td className="px-4 py-3 text-cyan-300">{row.points}</td>
                    <td className="px-4 py-3 text-gray-300">{row.approvedReports}</td>
                    <td className="px-4 py-3 text-gray-300">{row.activities}</td>
                    <td className="px-4 py-3 text-gray-300">{row.participants}</td>
                    <td className="px-4 py-3 text-rose-300">{row.rejectedReports + row.overdueReports}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <input aria-label="Search reports" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search by club, period, or report type..." className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500" />
        <select aria-label="Filter reports by status" value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white">
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" /></div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 py-16 text-center text-gray-500">No matching reports.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="min-w-[820px] w-full">
              <thead className="border-b border-slate-800 bg-slate-950/50 text-left text-xs uppercase tracking-wider text-gray-500">
                <tr><th className="px-5 py-4">Club / Period</th><th className="px-5 py-4">Type</th><th className="px-5 py-4">Due date</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredReports.map((report, index) => {
                  const status = normalizeStatus(report.status)
                  const isCreator = report.createdByUserId === user?.id
                  const canManagerReview = managedClubIds.has(report.clubId) && status === 'SUBMITTED' && !isCreator
                  const canSubmit = isCreator && (status === 'DRAFT' || status === 'REJECTED')
                  const canFinalAction = canFinalReview && status === 'UNDER_REVIEW'

                  return (
                    <motion.tr
                      key={report.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      tabIndex={0}
                      aria-label={`View report details for ${report.clubName}, period ${report.period}`}
                      onClick={() => setSelectedReport(report)}
                      onKeyDown={event => {
                        if (event.target !== event.currentTarget) return
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          setSelectedReport(report)
                        }
                      }}
                      className="cursor-pointer transition hover:bg-cyan-500/[0.04] focus:bg-cyan-500/[0.06] focus:outline-none"
                    >
                      <td className="px-5 py-4"><p className="font-semibold text-white">{report.clubName}</p><p className="mt-1 text-xs text-gray-500">{report.period}</p><p className="mt-1 text-[11px] font-semibold text-cyan-400">Click to view details</p></td>
                      <td className="px-5 py-4 text-sm text-gray-300">{formatReportType(report.reportType)}<p className="text-xs text-gray-500">{report.tag}</p></td>
                      <td className="px-5 py-4 text-sm text-gray-300">{report.dueDate}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}>{formatStatus(report.status)}</span></td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={event => { event.stopPropagation(); setSelectedReport(report) }} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-gray-300">View</button>
                          {canSubmit && <button type="button" onClick={event => { event.stopPropagation(); submitReport(report) }} disabled={busyId === report.id} className="rounded-lg bg-cyan-500/15 px-3 py-2 text-xs font-semibold text-cyan-300 disabled:opacity-50">Submit</button>}
                          {canManagerReview && <button type="button" onClick={event => { event.stopPropagation(); openReview(report, 'forward') }} className="rounded-lg bg-purple-500/15 px-3 py-2 text-xs font-semibold text-purple-300">Forward</button>}
                          {(canManagerReview || canFinalAction) && <button type="button" onClick={event => { event.stopPropagation(); openReview(report, 'reject') }} className="rounded-lg bg-rose-500/15 px-3 py-2 text-xs font-semibold text-rose-300">Reject</button>}
                          {canFinalAction && <button type="button" onClick={event => { event.stopPropagation(); openReview(report, 'approve') }} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300">Approve</button>}
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

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Report" size="lg">
        <form onSubmit={createReport} className="space-y-4">
          <FormField label="Club *">
            <select
              value={formData.clubId}
              onChange={event => {
                const selected = authorClubs.find(item => item.clubId === Number(event.target.value))
                setFormData(current => ({
                  ...current,
                  clubId: event.target.value,
                  reportType: selected?.isTreasurer && !selected?.isManager ? 'FINANCIAL' : current.reportType,
                  tag: selected?.isTreasurer && !selected?.isManager ? 'FINANCE' : current.tag,
                }))
              }}
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900"
            >
              <option value="">Select an authorized club</option>
              {authorClubs.map(club => (
                <option key={club.clubId} value={club.clubId}>
                  {club.clubName}{club.isTreasurer && !club.isManager ? ' — financial report' : ''}
                </option>
              ))}
            </select>
          </FormField>
          {isTreasurerFinancialReport && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Treasurers can only create financial reports for their assigned clubs.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Reporting period *"><input value={formData.period} onChange={event => setFormData(current => ({ ...current, period: event.target.value }))} required placeholder="For example: 2026-Q3" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /></FormField>
            <FormField label="Due date *"><input type="date" value={formData.dueDate} onChange={event => setFormData(current => ({ ...current, dueDate: event.target.value }))} required className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /></FormField>
            <FormField label="Report type *"><input value={formData.reportType} onChange={event => setFormData(current => ({ ...current, reportType: event.target.value }))} required disabled={isTreasurerFinancialReport} placeholder="For example: Activity" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900 disabled:bg-neutral-100" /></FormField>
            <FormField label="Tag *"><input value={formData.tag} onChange={event => setFormData(current => ({ ...current, tag: event.target.value }))} required disabled={isTreasurerFinancialReport} placeholder="For example: ACTIVITY" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900 disabled:bg-neutral-100" /></FormField>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="mb-3 font-semibold text-neutral-800">
              {isTreasurerFinancialReport ? 'First financial item' : 'First activity detail'}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label={isTreasurerFinancialReport ? 'Financial item name *' : 'Activity name *'}><input value={formData.activityName} onChange={event => setFormData(current => ({ ...current, activityName: event.target.value }))} required className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /></FormField>
              <FormField label="Activity date *"><input type="date" value={formData.activityDate} onChange={event => setFormData(current => ({ ...current, activityDate: event.target.value }))} required className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /></FormField>
              <FormField label="Participant count"><input type="number" min="0" value={formData.participantCount} onChange={event => setFormData(current => ({ ...current, participantCount: event.target.value }))} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /></FormField>
              <FormField label="Outcome"><input value={formData.outcome} onChange={event => setFormData(current => ({ ...current, outcome: event.target.value }))} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /></FormField>
            </div>
            <div className="mt-3"><FormField label="Description"><textarea value={formData.description} onChange={event => setFormData(current => ({ ...current, description: event.target.value }))} rows={3} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /></FormField></div>
          </div>
          <div className="flex gap-3"><button type="button" onClick={() => setShowCreate(false)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Cancel</button><button type="submit" disabled={busyId === 'create'} className="flex-1 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{busyId === 'create' ? 'Creating...' : 'Create draft'}</button></div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(selectedReport)} onClose={() => setSelectedReport(null)} title="Report Details" size="xl">
        {selectedReport && (
          <div className="space-y-5 text-neutral-700">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Club', selectedReport.clubName],
                ['Reporting period', selectedReport.period],
                ['Report type', formatReportType(selectedReport.reportType)],
                ['Tag', selectedReport.tag],
                ['Due date', selectedReport.dueDate],
                ['Status', formatStatus(selectedReport.status)],
                ['Created', formatDateTime(selectedReport.createdAtUtc)],
                ['Submitted', formatDateTime(selectedReport.submittedAtUtc)],
                ['Reviewed', formatDateTime(selectedReport.reviewedAtUtc)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-neutral-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
                  <p className="mt-1 whitespace-pre-wrap font-semibold text-neutral-900">{value || '—'}</p>
                </div>
              ))}
            </div>

            <section>
              <h3 className="font-semibold text-neutral-900">Activity Content</h3>
              <div className="mt-2 space-y-3">
                {selectedReport.details?.length > 0 ? selectedReport.details.map((detail, index) => (
                  <div key={detail.id ?? index} className="rounded-lg border border-neutral-200 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-semibold text-neutral-900">{index + 1}. {detail.activityName}</p>
                      <p className="text-xs text-neutral-500">{detail.activityDate} · {detail.participantCount} participants</p>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm">{detail.description || 'No description provided.'}</p>
                    <p className="mt-3 rounded-md bg-emerald-50 p-2 text-sm text-emerald-800">
                      <span className="font-semibold">Outcome:</span> {detail.outcome || 'Not provided'}
                    </p>
                  </div>
                )) : (
                  <p className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-500">This report does not contain any activity details.</p>
                )}
              </div>
            </section>

            {selectedReport.attachments?.length > 0 && (
              <section>
                <h3 className="font-semibold text-neutral-900">Attachments</h3>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {selectedReport.attachments.map(item => (
                    <div key={item.id} className="rounded-lg border border-neutral-200 p-3">
                      <p className="break-all font-semibold text-neutral-900">{item.fileName}</p>
                      <p className="mt-1 text-xs text-neutral-500">{item.contentType} · {formatFileSize(item.sizeBytes)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {selectedReport.feedback?.length > 0 && (
              <section>
                <h3 className="font-semibold text-neutral-900">Review History</h3>
                <div className="mt-2 space-y-2">
                  {selectedReport.feedback.map(item => (
                    <div key={item.id} className="rounded-lg bg-neutral-50 p-3 text-sm">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-semibold text-neutral-900">{formatStatus(item.decision)} — {item.reviewerName}</p>
                        <p className="text-xs text-neutral-500">{formatDateTime(item.createdAtUtc)}</p>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap">{formatReportMessage(item.message)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={Boolean(reviewTarget)} onClose={() => setReviewTarget(null)} title={reviewAction === 'approve' ? 'Approve Report' : reviewAction === 'forward' ? 'Forward for Final Approval' : 'Reject Report'}>
        <form onSubmit={submitReview} className="space-y-4">
          <p className="text-sm text-neutral-600">{reviewTarget?.clubName} — {reviewTarget?.period}</p>
          <FormField label={reviewAction === 'reject' ? 'Rejection reason *' : 'Review note'}><textarea value={feedback} onChange={event => setFeedback(event.target.value)} required={reviewAction === 'reject'} rows={4} maxLength={1000} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /></FormField>
          <div className="flex gap-3"><button type="button" onClick={() => setReviewTarget(null)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Cancel</button><button type="submit" disabled={busyId === reviewTarget?.id} className={`flex-1 rounded-lg px-4 py-3 font-semibold text-white disabled:opacity-50 ${reviewAction === 'reject' ? 'bg-rose-600' : reviewAction === 'approve' ? 'bg-emerald-600' : 'bg-purple-600'}`}>{busyId === reviewTarget?.id ? 'Processing...' : 'Confirm'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
