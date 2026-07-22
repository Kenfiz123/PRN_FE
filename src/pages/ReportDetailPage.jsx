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
  if (!value) return 'Chưa cập nhật'
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) return value
  return includeTime ? date.toLocaleString('vi-VN') : date.toLocaleDateString('vi-VN')
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
  const canEdit = isClubManager && ['DRAFT', 'REJECTED'].includes(status)
  const canSubmit = isClubManager && ['DRAFT', 'REJECTED'].includes(status)
  const canReview = isReviewer && status === 'UNDERREVIEW'

  const loadReportDetail = async () => {
    setIsLoading(true)
    try {
      setReport(await api.getReport(id))
    } catch (err) {
      error(err.message || 'Không thể tải thông tin báo cáo.')
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
      success('Đã nộp báo cáo. Báo cáo đang chờ xét duyệt.')
      await loadReportDetail()
    } catch (err) { error(err.message || 'Không thể nộp báo cáo.') } finally { setIsSubmitting(false) }
  }

  const handleReviewSubmit = async () => {
    if (reviewAction === 'reject' && !feedbackNote.trim()) {
      error('Vui lòng nhập lý do cần chỉnh sửa.')
      return
    }
    setIsSubmitting(true)
    try {
      if (reviewAction === 'approve') {
        await api.approveReport(report.id, feedbackNote.trim())
        success('Đã phê duyệt báo cáo hoạt động.')
      } else {
        await api.rejectReport(report.id, feedbackNote.trim())
        success('Đã gửi yêu cầu chỉnh sửa cho câu lạc bộ.')
      }
      setReviewModalOpen(false)
      setFeedbackNote('')
      await loadReportDetail()
    } catch (err) { error(err.message || 'Không thể xử lý báo cáo.') } finally { setIsSubmitting(false) }
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
      success(`Đã tạo yêu cầu xuất báo cáo ${type}. Bạn có thể tải file trong lịch sử.`)
      setExportHistoryOpen(true)
    } catch (err) {
      error(err.message || `Không thể xuất báo cáo ${type}.`)
    } finally {
      setIsExporting(false)
    }
  }

  const stats = useMemo(() => [
    { label: 'Hoạt động', value: report?.totalActivities || report?.details?.length || 0, icon: ClipboardList, tone: 'text-cyan-200' },
    { label: 'Người tham gia', value: `${report?.totalParticipants || 0}`, icon: Users, tone: 'text-emerald-200' },
    { label: 'Chi phí thực tế', value: `${(report?.totalBudgetSpent || 0).toLocaleString('vi-VN')} VNĐ`, icon: Landmark, tone: 'text-amber-200' },
  ], [report])

  if (isLoading || !report) return <div className="flex min-h-[400px] items-center justify-center"><div className="cyber-spinner" /></div>

  const tabs = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'activities', label: `Hoạt động (${report.details?.length || 0})` },
    { key: 'attachments', label: 'Minh chứng' },
    { key: 'evaluation', label: 'Đánh giá & kế hoạch' },
    { key: 'feedback', label: `Phản hồi (${report.feedback?.length || 0})` },
  ]

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 pb-10">
      <section className="rounded-xl border border-slate-800 bg-slate-900/75 p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><ReportStatusBadge status={status} /><span className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">{report.reportType || 'Chưa phân loại'}</span></div><h1 className="mt-4 font-orbitron text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">Báo cáo {report.period}</h1><p className="mt-2 text-lg font-medium text-slate-200">{report.clubName}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400"><span className="font-mono text-cyan-300">#{report.id}</span><span className="inline-flex items-center gap-1.5"><CalendarDays size={16} /> Hạn nộp: <strong className="font-medium text-amber-200">{formatDate(report.dueDate)}</strong></span><span>Tạo ngày {formatDate(report.createdAtUtc)}</span></div></div>
          <div className="flex flex-col gap-2 xl:items-end">
            <div className="flex flex-wrap gap-2 xl:justify-end">
              <button onClick={() => navigate('/reports')} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-700 px-3.5 text-sm font-semibold text-slate-300 hover:border-slate-600 hover:bg-slate-800"><ArrowLeft size={16} /> Danh sách</button>
              {canEdit && <button onClick={() => navigate(`/reports/${report.id}/edit`)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3.5 text-sm font-semibold text-amber-200 hover:bg-amber-400/15"><FilePenLine size={16} /> Chỉnh sửa</button>}
              {canSubmit && <button disabled={isSubmitting} onClick={handleManualSubmit} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-cyan-400 px-3.5 text-sm font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-60"><Send size={16} /> {isSubmitting ? 'Đang nộp' : 'Nộp báo cáo'}</button>}
              {canReview && <><button onClick={() => { setReviewAction('reject'); setReviewModalOpen(true) }} className="min-h-10 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3.5 text-sm font-semibold text-rose-200 hover:bg-rose-400/15">Yêu cầu chỉnh sửa</button><button onClick={() => { setReviewAction('approve'); setReviewModalOpen(true) }} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-400 px-3.5 text-sm font-bold text-slate-950 hover:bg-emerald-300"><Check size={16} /> Phê duyệt</button></>}
            </div>
            <div className="flex flex-wrap gap-2 xl:justify-end mt-2">
              <button disabled={isExporting} onClick={() => handleExport('PDF')} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"><FileText size={15} /> Xuất PDF</button>
              <button disabled={isExporting} onClick={() => handleExport('XLSX')} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"><Sheet size={15} /> Xuất Excel</button>
              <button disabled={isExporting} onClick={() => handleExport('DOCX')} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 text-sm font-semibold text-blue-300 hover:bg-blue-500/20 disabled:opacity-50"><FileText size={15} /> Xuất Word</button>
              <button onClick={() => setExportHistoryOpen(true)} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm font-semibold text-slate-300 hover:bg-slate-700"><FileDown size={15} /> Lịch sử xuất</button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">{stats.map(({ label, value, icon: Icon, tone }) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><div className="flex items-center justify-between text-sm text-slate-400"><span>{label}</span><Icon size={18} className="text-cyan-300" /></div><p className={`mt-3 text-xl font-bold ${tone}`}>{value}</p></div>)}</section>

      <nav className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/75 p-2"><div className="flex min-w-max gap-1">{tabs.map((tab) => <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${activeTab === tab.key ? 'bg-cyan-400 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>{tab.label}</button>)}</div></nav>

      {activeTab === 'overview' && <div className="grid gap-5 xl:grid-cols-2"><DetailBlock title="Tóm tắt điều hành" emptyText="Chưa có tóm tắt hoạt động trong kỳ.">{report.executiveSummary}</DetailBlock><DetailBlock title="Thành tựu nổi bật" emptyText="Chưa có thông tin thành tựu.">{report.achievements}</DetailBlock></div>}

      {activeTab === 'activities' && <section className="rounded-xl border border-slate-800 bg-slate-900/75"><div className="border-b border-slate-800 px-5 py-4"><h2 className="text-lg font-semibold text-slate-100">Hoạt động đã thực hiện</h2><p className="mt-1 text-sm text-slate-500">Thông tin, kết quả và minh chứng của từng hoạt động.</p></div>{!report.details?.length ? <div className="px-6 py-14 text-center text-slate-500">Chưa có hoạt động nào được ghi nhận trong báo cáo này.</div> : <div className="divide-y divide-slate-800">{report.details.map((activity, index) => <article key={activity.id || index} className="p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="text-xs font-semibold text-cyan-300">HOẠT ĐỘNG {String(index + 1).padStart(2, '0')}</p><h3 className="mt-1 text-lg font-semibold text-slate-100">{activity.activityName}</h3><p className="mt-1 text-sm text-slate-400">{activity.activityType || 'Chưa phân loại'} · {formatDate(activity.activityDate)}</p></div>{activity.budgetSpent > 0 && <p className="text-sm font-semibold text-amber-200">{activity.budgetSpent.toLocaleString('vi-VN')} VNĐ</p>}</div><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-lg bg-slate-950/70 p-3"><MapPin size={16} className="mb-2 text-slate-500" /><p className="text-slate-500">Địa điểm</p><p className="mt-1 font-medium text-slate-200">{activity.location || 'Chưa cập nhật'}</p></div><div className="rounded-lg bg-slate-950/70 p-3"><Users size={16} className="mb-2 text-slate-500" /><p className="text-slate-500">Tham gia</p><p className="mt-1 font-medium text-emerald-200">{activity.participantCount || 0} người</p></div><div className="rounded-lg bg-slate-950/70 p-3"><p className="text-slate-500">Mục tiêu</p><p className="mt-1 font-medium text-slate-200">{activity.targetParticipantCount || 0} người</p></div><div className="rounded-lg bg-slate-950/70 p-3"><p className="text-slate-500">Phối hợp</p><p className="mt-1 font-medium text-slate-200">{activity.partnerUnit || 'Không có'}</p></div></div><div className="mt-4 grid gap-4 lg:grid-cols-2"><div><p className="text-sm font-semibold text-slate-300">Nội dung</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-400">{activity.description || 'Chưa cập nhật'}</p></div><div><p className="text-sm font-semibold text-slate-300">Kết quả</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-400">{activity.outcome || 'Chưa cập nhật'}</p></div></div>{activity.evidenceUrl && <a href={activity.evidenceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 hover:text-cyan-200">Xem minh chứng <ExternalLink size={15} /></a>}</article>)}</div>}</section>}

      {activeTab === 'attachments' && <section className="rounded-xl border border-slate-800 bg-slate-900/75"><div className="border-b border-slate-800 px-5 py-4"><h2 className="text-lg font-semibold text-slate-100">Minh chứng đính kèm</h2><p className="mt-1 text-sm text-slate-500">Liên kết minh chứng được khai báo theo từng hoạt động.</p></div>{!report.details?.some((activity) => activity.evidenceUrl) ? <div className="flex flex-col items-center px-6 py-14 text-center"><Paperclip size={32} className="text-slate-600" /><p className="mt-3 text-sm text-slate-500">Báo cáo chưa có liên kết minh chứng.</p></div> : <div className="divide-y divide-slate-800">{report.details.filter((activity) => activity.evidenceUrl).map((activity, index) => <a key={activity.id || index} href={activity.evidenceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 p-5 transition hover:bg-cyan-400/[0.035]"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-200"><Paperclip size={18} /></span><div className="min-w-0"><p className="truncate font-semibold text-slate-200">{activity.activityName || 'Hoạt động chưa đặt tên'}</p><p className="mt-1 truncate text-sm text-slate-500">{activity.evidenceUrl}</p></div></div><ExternalLink size={17} className="shrink-0 text-cyan-300" /></a>)}</div>}</section>}

      {activeTab === 'evaluation' && <div className="grid gap-5 xl:grid-cols-3"><DetailBlock title="Khó khăn và tồn tại" emptyText="Không có khó khăn được ghi nhận.">{report.challenges}</DetailBlock><DetailBlock title="Kiến nghị hỗ trợ" emptyText="Không có kiến nghị.">{report.recommendations}</DetailBlock><DetailBlock title="Kế hoạch kỳ tiếp theo" emptyText="Chưa cập nhật kế hoạch kỳ tới.">{report.nextPeriodPlan}</DetailBlock></div>}

      {activeTab === 'feedback' && <section className="rounded-xl border border-slate-800 bg-slate-900/75"><div className="border-b border-slate-800 px-5 py-4"><h2 className="text-lg font-semibold text-slate-100">Lịch sử phản hồi</h2><p className="mt-1 text-sm text-slate-500">Ý kiến và quyết định từ bộ phận xét duyệt.</p></div>{!report.feedback?.length ? <div className="flex flex-col items-center px-6 py-14 text-center"><MessageSquareText size={32} className="text-slate-600" /><p className="mt-3 text-sm text-slate-500">Báo cáo chưa có phản hồi từ người duyệt.</p></div> : <div className="divide-y divide-slate-800">{report.feedback.map((feedback) => <article key={feedback.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-semibold text-slate-200">{feedback.reviewerName || `Người duyệt #${feedback.reviewerUserId}`}</p><p className="mt-1 text-sm text-slate-500">{formatDate(feedback.createdAtUtc, true)}</p></div><span className="rounded-md border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">{feedback.decision}</span></div>{feedback.message && <p className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-950/75 p-4 text-sm leading-6 text-slate-300">{feedback.message}</p>}</article>)}</div>}</section>}

      <Modal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} title={reviewAction === 'approve' ? 'Phê duyệt báo cáo' : 'Yêu cầu chỉnh sửa'}><div className="space-y-4"><div className={`flex gap-3 rounded-lg border p-3 text-sm ${reviewAction === 'approve' ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100' : 'border-rose-400/25 bg-rose-400/10 text-rose-100'}`}><CircleAlert size={18} className="mt-0.5 shrink-0" /><p>{reviewAction === 'approve' ? 'Bạn có thể thêm nhận xét trước khi phê duyệt báo cáo.' : 'Nêu rõ nội dung cần bổ sung để câu lạc bộ có thể cập nhật báo cáo.'}</p></div><div><label className="mb-2 block text-sm font-semibold text-slate-200">Nhận xét {reviewAction === 'reject' && <span className="text-rose-300">*</span>}</label><textarea rows={5} value={feedbackNote} onChange={(event) => setFeedbackNote(event.target.value)} placeholder={reviewAction === 'approve' ? 'Nhận xét tích cực hoặc lưu ý thêm (không bắt buộc)' : 'Nội dung cần chỉnh sửa'} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none" /></div><div className="flex justify-end gap-2"><button disabled={isSubmitting} onClick={() => setReviewModalOpen(false)} className="min-h-10 rounded-lg px-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-800">Hủy</button><button disabled={isSubmitting} onClick={handleReviewSubmit} className={`min-h-10 rounded-lg px-4 text-sm font-bold disabled:opacity-60 ${reviewAction === 'approve' ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300' : 'bg-rose-400 text-slate-950 hover:bg-rose-300'}`}>{isSubmitting ? 'Đang xử lý' : reviewAction === 'approve' ? 'Xác nhận phê duyệt' : 'Gửi yêu cầu chỉnh sửa'}</button></div></div></Modal>
      
      <ExportHistoryModal isOpen={exportHistoryOpen} onClose={() => setExportHistoryOpen(false)} />
    </div>
  )
}
