import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Check, CircleAlert, ClipboardList, ExternalLink, FileDown, FilePenLine, FileText, Landmark, MapPin, MessageSquareText, Paperclip, Send, Sheet, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'
import Modal from '../components/Modal'
import ReportStatusBadge, { normalizeReportStatus } from '../components/reports/ReportStatusBadge'
import ExportHistoryModal from '../components/reports/ExportHistoryModal'

function formatDate(value, includeTime = false) {
  if (!value) return 'Not updated'
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return value
  return includeTime ? date.toLocaleString('en-GB') : date.toLocaleDateString('en-GB')
}

function DetailBlock({ title, children, emptyText }) {
  return <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-5 sm:p-6"><h2 className="text-lg font-semibold text-slate-100">{title}</h2><div className="mt-3 whitespace-pre-wrap text-base leading-7 text-slate-300">{children || emptyText}</div></section>
}

export default function ReportDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { clubAccess, hasRole } = useAuth()
  const { success, error } = useToast()
  const [report, setReport] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState('approve')
  const [feedbackNote, setFeedbackNote] = useState('')
  const [exportHistoryOpen, setExportHistoryOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const isReviewer = hasRole('ADMIN') || hasRole('STUDENT_AFFAIRS_ADMIN') || hasRole('SYSTEM_ADMIN')
  const isClubManager = Boolean(report && clubAccess.some((access) => access.clubId === report.clubId && access.isManager))
  const status = normalizeReportStatus(report?.status)
  const isFutureEvent = report?.reportType === 'FUTURE_EVENT'
  const canEdit = isClubManager && ['DRAFT', 'REJECTED'].includes(status)
  const canSubmit = isClubManager && ['DRAFT', 'REJECTED'].includes(status)
  const canManagerReview = isFutureEvent && isClubManager && status === 'SUBMITTED'
  const canFinalReview = isReviewer && status === 'UNDERREVIEW'

  const loadReportDetail = async () => {
    setIsLoading(true)
    try {
      setReport(await api.getReport(id))
    } catch (err) {
      error(err.message || 'Unable to load the report details.')
      navigate('/reports')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadReportDetail() }, [id])

  const handleManualSubmit = async () => {
    setIsSubmitting(true)
    try {
      await api.submitReport(report.id)
      success('Report submitted and awaiting review.')
      await loadReportDetail()
    } catch (err) { error(err.message || 'Unable to submit the report.') } finally { setIsSubmitting(false) }
  }

  const handleReviewSubmit = async () => {
    if (reviewAction === 'reject' && !feedbackNote.trim()) {
      error('Please enter the reason for the requested revision.')
      return
    }
    setIsSubmitting(true)
    try {
      if (reviewAction === 'approve') {
        if (canManagerReview) {
          await api.reviewReport(report.id, feedbackNote.trim())
          success('Combined event and budget package sent for final approval.')
        } else {
          await api.approveReport(report.id, feedbackNote.trim())
          success(isFutureEvent ? 'Future event package approved and published to Activities.' : 'Activity report approved.')
        }
      } else {
        await api.rejectReport(report.id, feedbackNote.trim())
        success('Revision request sent to the club.')
      }
      setReviewModalOpen(false)
      setFeedbackNote('')
      await loadReportDetail()
    } catch (err) { error(err.message || 'Unable to process the report.') } finally { setIsSubmitting(false) }
  }

  const handleExport = async (type) => {
    setIsExporting(true)
    try {
      await api.createExport({
        exportType: type,
        scope: 'Report',
        period: report.period,
        clubId: report.clubId,
        reportId: report.id
      })
      success(`${type} export requested. You can download the file from export history.`)
      setExportHistoryOpen(true)
    } catch (err) {
      error(err.message || `Unable to export the report as ${type}.`)
    } finally {
      setIsExporting(false)
    }
  }

  const stats = useMemo(() => {
    const values = [
      { label: isFutureEvent ? 'Planned events' : 'Activities', value: report?.totalActivities || report?.details?.length || 0, icon: ClipboardList, tone: 'text-cyan-200' },
      { label: isFutureEvent ? 'Expected participants' : 'Participants', value: `${isFutureEvent ? report?.details?.[0]?.targetParticipantCount || 0 : report?.totalParticipants || 0}`, icon: Users, tone: 'text-emerald-200' },
    ]
    if (report?.canViewFinance) {
      values.push({
        label: isFutureEvent ? 'Approved budget' : 'Actual cost',
        value: `${(isFutureEvent ? report?.budgetApprovedAmount || report?.budgetRequestedAmount || 0 : report?.totalBudgetSpent || 0).toLocaleString('en-US')} VND`,
        icon: Landmark,
        tone: 'text-amber-200',
      })
    }
    return values
  }, [report, isFutureEvent])

  if (isLoading || !report) return <div className="flex min-h-[400px] items-center justify-center"><div className="cyber-spinner" /></div>

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'activities', label: `${isFutureEvent ? 'Planned event' : 'Activities'} (${report.details?.length || 0})` },
    ...(isFutureEvent && report.canViewFinance ? [{ key: 'finance', label: 'Event budget' }] : []),
    { key: 'attachments', label: 'Evidence' },
    { key: 'evaluation', label: 'Evaluation and plan' },
    { key: 'feedback', label: `Feedback (${report.feedback?.length || 0})` },
  ]

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 pb-10">
      <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><ReportStatusBadge status={status} /><span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">{report.reportType || 'Uncategorized'}</span></div><h1 className="mt-4 font-orbitron text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">Report {report.period}</h1><p className="mt-2 text-lg font-medium text-slate-200">{report.clubName}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400"><span className="font-mono text-cyan-300">#{report.id}</span><span className="inline-flex items-center gap-1.5"><CalendarDays size={16} /> Deadline: <strong className="font-medium text-amber-200">{formatDate(report.dueDate)}</strong></span><span>Created {formatDate(report.createdAtUtc)}</span></div></div>
          <div className="flex flex-col gap-2 xl:items-end">
            <div className="flex flex-wrap gap-2 xl:justify-end">
              <button onClick={() => navigate('/reports')} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-700 px-3.5 text-sm font-semibold text-slate-300 hover:border-slate-600 hover:bg-slate-800"><ArrowLeft size={16} /> Report list</button>
              {canEdit && <button onClick={() => navigate(`/reports/${report.id}/edit`)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3.5 text-sm font-semibold text-amber-200 hover:bg-amber-400/15"><FilePenLine size={16} /> Edit</button>}
              {canSubmit && <button disabled={isSubmitting} onClick={handleManualSubmit} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-cyan-400 px-3.5 text-sm font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-60"><Send size={16} /> {isSubmitting ? 'Submitting' : 'Submit report'}</button>}
              {(canManagerReview || canFinalReview) && <><button onClick={() => { setReviewAction('reject'); setReviewModalOpen(true) }} className="min-h-10 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3.5 text-sm font-semibold text-rose-200 hover:bg-rose-400/15">Request revision</button><button onClick={() => { setReviewAction('approve'); setReviewModalOpen(true) }} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-400 px-3.5 text-sm font-bold text-slate-950 hover:bg-emerald-300"><Check size={16} /> {canManagerReview ? 'Approve combined package' : 'Final approve'}</button></>}
            </div>
            <div className="flex flex-wrap gap-2 xl:justify-end mt-2">
              <button disabled={isExporting} onClick={() => handleExport('PDF')} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"><FileText size={15} /> Export PDF</button>
              <button disabled={isExporting} onClick={() => handleExport('XLSX')} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"><Sheet size={15} /> Export Excel</button>
              <button disabled={isExporting} onClick={() => handleExport('DOCX')} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 text-sm font-semibold text-blue-300 hover:bg-blue-500/20 disabled:opacity-50"><FileText size={15} /> Export Word</button>
              <button onClick={() => setExportHistoryOpen(true)} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm font-semibold text-slate-300 hover:bg-slate-700"><FileDown size={15} /> Export history</button>
            </div>
          </div>
        </div>
      </section>

      {isFutureEvent && status === 'AWAITINGFINANCE' && <section className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 p-4 text-sm text-fuchsia-100">Waiting for the club treasurer to submit the event budget.</section>}
      {isFutureEvent && status === 'SUBMITTED' && <section className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-sm text-purple-100">The content report and budget report are now combined and awaiting club owner approval.</section>}
      {isFutureEvent && status === 'UNDERREVIEW' && <section className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm text-cyan-100">The club owner approved this package. It is awaiting final Admin review.</section>}

      <section className={`grid grid-cols-1 gap-3 ${stats.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>{stats.map(({ label, value, icon: Icon, tone }) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><div className="flex items-center justify-between text-sm text-slate-400"><span>{label}</span><Icon size={18} className="text-cyan-300" /></div><p className={`mt-3 text-xl font-bold ${tone}`}>{value}</p></div>)}</section>

      <nav className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/75 p-2"><div className="flex min-w-max gap-1">{tabs.map((tab) => <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${activeTab === tab.key ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>{tab.label}</button>)}</div></nav>

      {activeTab === 'overview' && <div className="grid gap-5 xl:grid-cols-2"><DetailBlock title="Executive summary" emptyText="No activity summary is available for this period.">{report.executiveSummary}</DetailBlock><DetailBlock title="Key achievements" emptyText="No achievement information is available.">{report.achievements}</DetailBlock></div>}

      {activeTab === 'activities' && <section className="rounded-xl border border-slate-800 bg-slate-900/75"><div className="border-b border-slate-800 px-5 py-4"><h2 className="text-lg font-semibold text-slate-100">{isFutureEvent ? 'Planned future event' : 'Completed activities'}</h2><p className="mt-1 text-sm text-slate-500">{isFutureEvent ? 'Event information that will be published to Activities after final approval.' : 'Details, outcomes, and evidence for each activity.'}</p></div>{!report.details?.length ? <div className="px-6 py-14 text-center text-slate-500">No activities have been recorded in this report.</div> : <div className="divide-y divide-slate-800">{report.details.map((activity, index) => <article key={activity.id || index} className="p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="text-xs font-semibold text-cyan-300">ACTIVITY {String(index + 1).padStart(2, '0')}</p><h3 className="mt-1 text-lg font-semibold text-slate-100">{activity.activityName}</h3><p className="mt-1 text-sm text-slate-400">{activity.activityType || 'Uncategorized'} · {formatDate(activity.activityDate)}</p></div>{activity.budgetSpent > 0 && <p className="text-sm font-semibold text-amber-200">{activity.budgetSpent.toLocaleString('en-US')} VND</p>}</div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-lg bg-slate-950/70 p-3"><MapPin size={16} className="mb-2 text-slate-500" /><p className="text-slate-500">Location</p><p className="mt-1 font-medium text-slate-200">{activity.location || 'Not updated'}</p></div><div className="rounded-lg bg-slate-950/70 p-3"><Users size={16} className="mb-2 text-slate-500" /><p className="text-slate-500">{isFutureEvent ? 'Expected participants' : 'Participants'}</p><p className="mt-1 font-medium text-emerald-200">{isFutureEvent ? activity.targetParticipantCount || 0 : activity.participantCount || 0} people</p></div><div className="rounded-lg bg-slate-950/70 p-3"><p className="text-slate-500">Target</p><p className="mt-1 font-medium text-slate-200">{activity.targetParticipantCount || 0} people</p></div><div className="rounded-lg bg-slate-950/70 p-3"><p className="text-slate-500">Partner</p><p className="mt-1 font-medium text-slate-200">{activity.partnerUnit || 'None'}</p></div></div><div className="mt-4 grid gap-4 lg:grid-cols-2"><div><p className="text-sm font-semibold text-slate-300">Description</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-400">{activity.description || 'Not updated'}</p></div><div><p className="text-sm font-semibold text-slate-300">{isFutureEvent ? 'Expected outcome' : 'Outcome'}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-400">{activity.outcome || 'Not updated'}</p></div></div>{activity.evidenceUrl && <a href={activity.evidenceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 hover:text-cyan-200">View evidence <ExternalLink size={15} /></a>}</article>)}</div>}</section>}

      {activeTab === 'finance' && report.canViewFinance && <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-slate-100">Linked event budget</h2><p className="mt-1 text-sm text-slate-500">Submitted by the club treasurer and reviewed together with this future event.</p></div>{report.budgetProposalId && <span className="rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-200">Proposal #{report.budgetProposalId}</span>}</div>{report.budgetProposalId ? <div className="mt-5 space-y-4"><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-slate-950/70 p-4"><p className="text-sm text-slate-500">Requested amount</p><p className="mt-2 text-xl font-bold text-amber-200">{(report.budgetRequestedAmount || 0).toLocaleString('en-US')} VND</p></div><div className="rounded-lg bg-slate-950/70 p-4"><p className="text-sm text-slate-500">Approved amount</p><p className="mt-2 text-xl font-bold text-emerald-200">{report.budgetApprovedAmount ? `${report.budgetApprovedAmount.toLocaleString('en-US')} VND` : 'Not approved yet'}</p></div></div><div className="rounded-lg bg-slate-950/70 p-4"><p className="text-sm font-semibold text-slate-300">Budget use description</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">{report.budgetDescription || 'No budget description was provided.'}</p></div></div> : <div className="mt-5 rounded-lg border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">The treasurer has not submitted the budget yet.</div>}</section>}

      {activeTab === 'attachments' && <section className="rounded-xl border border-slate-800 bg-slate-900/75"><div className="border-b border-slate-800 px-5 py-4"><h2 className="text-lg font-semibold text-slate-100">Attached evidence</h2><p className="mt-1 text-sm text-slate-500">Evidence links provided for each activity.</p></div>{!report.details?.some((activity) => activity.evidenceUrl) ? <div className="flex flex-col items-center px-6 py-14 text-center"><Paperclip size={32} className="text-slate-600" /><p className="mt-3 text-sm text-slate-500">This report does not contain any evidence links.</p></div> : <div className="divide-y divide-slate-800">{report.details.filter((activity) => activity.evidenceUrl).map((activity, index) => <a key={activity.id || index} href={activity.evidenceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 p-5 transition hover:bg-cyan-400/[0.035]"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-200"><Paperclip size={18} /></span><div className="min-w-0"><p className="truncate font-semibold text-slate-200">{activity.activityName || 'Unnamed activity'}</p><p className="mt-1 truncate text-sm text-slate-500">{activity.evidenceUrl}</p></div></div><ExternalLink size={17} className="shrink-0 text-cyan-300" /></a>)}</div>}</section>}

      {activeTab === 'evaluation' && <div className="grid gap-5 xl:grid-cols-3"><DetailBlock title="Challenges and outstanding issues" emptyText="No challenges have been recorded.">{report.challenges}</DetailBlock><DetailBlock title="Support recommendations" emptyText="No recommendations are available.">{report.recommendations}</DetailBlock><DetailBlock title="Next-period plan" emptyText="The next-period plan has not been updated.">{report.nextPeriodPlan}</DetailBlock></div>}

      {activeTab === 'feedback' && <section className="rounded-xl border border-slate-800 bg-slate-900/75"><div className="border-b border-slate-800 px-5 py-4"><h2 className="text-lg font-semibold text-slate-100">Feedback history</h2><p className="mt-1 text-sm text-slate-500">Comments and decisions from the review team.</p></div>{!report.feedback?.length ? <div className="flex flex-col items-center px-6 py-14 text-center"><MessageSquareText size={32} className="text-slate-600" /><p className="mt-3 text-sm text-slate-500">This report has not received reviewer feedback.</p></div> : <div className="divide-y divide-slate-800">{report.feedback.map((feedback) => <article key={feedback.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold text-slate-200">{feedback.reviewerName || `Reviewer #${feedback.reviewerUserId}`}</p><p className="mt-1 text-sm text-slate-500">{formatDate(feedback.createdAtUtc, true)}</p></div><span className="rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">{feedback.decision}</span></div>{feedback.message && <p className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-950/75 p-4 text-sm leading-6 text-slate-300">{feedback.message}</p>}</article>)}</div>}</section>}

      <Modal
        isOpen={reviewModalOpen}
        onClose={() => !isSubmitting && setReviewModalOpen(false)}
        title={reviewAction === 'approve'
          ? canManagerReview ? 'Approve combined package' : 'Approve report'
          : 'Request revision'}
      >
        <div className="space-y-6">
          <div className={`flex items-start gap-4 rounded-xl border p-4 ${reviewAction === 'approve'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
            : 'border-rose-200 bg-rose-50 text-rose-950'}`}>
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${reviewAction === 'approve'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-rose-100 text-rose-700'}`}>
              {reviewAction === 'approve' ? <Check size={20} strokeWidth={2.5} /> : <CircleAlert size={20} />}
            </span>
            <div>
              <p className="font-semibold">
                {reviewAction === 'approve' ? 'Confirm this review decision' : 'Send the report back for revision'}
              </p>
              <p className={`mt-1 text-sm leading-6 ${reviewAction === 'approve' ? 'text-emerald-800' : 'text-rose-800'}`}>
                {reviewAction === 'approve'
                  ? canManagerReview
                    ? 'The event content and linked budget will be sent together to Admin for final approval.'
                    : isFutureEvent
                      ? 'The approved event will be published to Activities and become visible to club members.'
                      : 'The report will be marked as approved and the club will be notified.'
                  : 'Explain what must be changed. The club owner will receive your note and can resubmit the report.'}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="report-review-comment" className="text-sm font-semibold text-slate-800">
                Review comment {reviewAction === 'reject' && <span className="text-rose-600">*</span>}
              </label>
              <span className="text-xs text-slate-500">{feedbackNote.length}/1000</span>
            </div>
            <textarea
              id="report-review-comment"
              rows={5}
              maxLength={1000}
              required={reviewAction === 'reject'}
              value={feedbackNote}
              onChange={(event) => setFeedbackNote(event.target.value)}
              placeholder={reviewAction === 'approve'
                ? 'Add feedback or a note for the club (optional)'
                : 'Describe the required revisions'}
              className="min-h-36 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base leading-6 text-slate-900 shadow-inner outline-none placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
            <p className="mt-2 text-xs leading-5 text-slate-500">
              This comment will be saved in the report feedback history.
            </p>
          </div>

          <div className="-mx-6 -mb-6 flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setReviewModalOpen(false)}
              className="min-h-11 rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleReviewSubmit}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${reviewAction === 'approve'
                ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200'
                : 'bg-rose-600 hover:bg-rose-700 focus:ring-4 focus:ring-rose-200'}`}
            >
              {reviewAction === 'approve' && <Check size={17} strokeWidth={2.5} />}
              {isSubmitting ? 'Processing...' : reviewAction === 'approve' ? 'Confirm approval' : 'Send revision request'}
            </button>
          </div>
        </div>
      </Modal>
      
      <ExportHistoryModal isOpen={exportHistoryOpen} onClose={() => setExportHistoryOpen(false)} />
    </div>
  )
}
