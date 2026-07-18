import { useCallback, useEffect, useMemo, useState } from 'react'
import Modal from '../components/Modal'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { PERMISSIONS } from '../auth/permissions'

const emptyProposal = { clubId: '', title: '', description: '', requestedAmount: '', activityId: '' }
const emptySettlement = { totalSpent: '', receiptUrl: '' }

function normalizeStatus(status) {
  return status?.toUpperCase() || 'SUBMITTED'
}

function money(value) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value) || 0)
}

function statusClass(status) {
  const value = normalizeStatus(status)
  if (value === 'APPROVED' || value === 'SETTLED') return 'bg-emerald-500/15 text-emerald-300'
  if (value === 'REJECTED') return 'bg-rose-500/15 text-rose-300'
  return 'bg-amber-500/15 text-amber-300'
}

export default function FinancePage() {
  const { clubAccess, hasPermission } = useAuth()
  const { success, error } = useToast()
  const treasurerClubs = clubAccess.filter(access => access.isTreasurer)
  const treasurerClubIds = useMemo(() => new Set(treasurerClubs.map(access => access.clubId)), [treasurerClubs])
  const canReview = hasPermission(PERMISSIONS.REVIEW_FINANCE)

  const [proposals, setProposals] = useState([])
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [proposalForm, setProposalForm] = useState(emptyProposal)
  const [reviewTarget, setReviewTarget] = useState(null)
  const [reviewAction, setReviewAction] = useState('approve')
  const [reviewAmount, setReviewAmount] = useState('')
  const [reviewNote, setReviewNote] = useState('')
  const [settlementTarget, setSettlementTarget] = useState(null)
  const [settlementForm, setSettlementForm] = useState(emptySettlement)

  const loadFinance = useCallback(async () => {
    setIsLoading(true)
    try {
      const [proposalResult, transactionResult] = await Promise.all([
        api.getBudgetProposals({ page: 1, pageSize: 100 }),
        api.getFinanceTransactions(),
      ])
      setProposals(Array.isArray(proposalResult?.items) ? proposalResult.items : [])
      setTransactions(Array.isArray(transactionResult) ? transactionResult : [])
    } catch (err) {
      error(err.message || 'Không thể tải dữ liệu tài chính.')
    } finally {
      setIsLoading(false)
    }
  }, [error])

  useEffect(() => {
    loadFinance()
  }, [loadFinance])

  const filtered = statusFilter === 'ALL'
    ? proposals
    : proposals.filter(proposal => normalizeStatus(proposal.status) === statusFilter)

  const createProposal = async (event) => {
    event.preventDefault()
    if (busyId) return
    const club = treasurerClubs.find(item => item.clubId === Number(proposalForm.clubId))
    const requestedAmount = Number(proposalForm.requestedAmount)
    if (!club || !proposalForm.title.trim() || !proposalForm.description.trim() || requestedAmount <= 0) {
      error('Vui lòng nhập đầy đủ CLB, tiêu đề, mô tả và số tiền hợp lệ.')
      return
    }
    setBusyId('create')
    try {
      const created = await api.createBudgetProposal({
        clubId: club.clubId,
        clubName: club.clubName,
        activityId: proposalForm.activityId ? Number(proposalForm.activityId) : null,
        title: proposalForm.title.trim(),
        description: proposalForm.description.trim(),
        requestedAmount,
      })
      setProposals(current => [created, ...current])
      setShowCreate(false)
      setProposalForm(emptyProposal)
      success('Đã gửi đề xuất ngân sách.')
      await loadFinance()
    } catch (err) {
      error(err.message || 'Không thể tạo đề xuất ngân sách.')
    } finally {
      setBusyId(null)
    }
  }

  const openReview = (proposal, action) => {
    setReviewTarget(proposal)
    setReviewAction(action)
    setReviewAmount(action === 'approve' ? String(proposal.requestedAmount) : '')
    setReviewNote('')
  }

  const submitReview = async (event) => {
    event.preventDefault()
    if (!reviewTarget || busyId) return
    if (reviewAction === 'reject' && !reviewNote.trim()) {
      error('Vui lòng nhập lý do từ chối.')
      return
    }
    const amount = Number(reviewAmount)
    if (reviewAction === 'approve' && amount <= 0) {
      error('Số tiền phê duyệt phải lớn hơn 0.')
      return
    }
    setBusyId(reviewTarget.id)
    try {
      const updated = reviewAction === 'approve'
        ? await api.approveBudget(reviewTarget.id, amount, reviewNote.trim())
        : await api.rejectBudget(reviewTarget.id, reviewNote.trim())
      setProposals(current => current.map(item => item.id === updated.id ? updated : item))
      setReviewTarget(null)
      success(reviewAction === 'approve' ? 'Đã phê duyệt ngân sách.' : 'Đã từ chối đề xuất.')
      await loadFinance()
    } catch (err) {
      error(err.message || 'Không thể xét duyệt đề xuất.')
    } finally {
      setBusyId(null)
    }
  }

  const submitSettlement = async (event) => {
    event.preventDefault()
    if (!settlementTarget || busyId) return
    const totalSpent = Number(settlementForm.totalSpent)
    if (totalSpent <= 0 || !settlementForm.receiptUrl.trim()) {
      error('Vui lòng nhập số tiền và URL chứng từ HTTPS hợp lệ.')
      return
    }
    setBusyId(settlementTarget.id)
    try {
      const updated = await api.createSettlement(settlementTarget.id, {
        totalSpent,
        receiptUrl: settlementForm.receiptUrl.trim(),
      })
      setProposals(current => current.map(item => item.id === updated.id ? updated : item))
      setSettlementTarget(null)
      setSettlementForm(emptySettlement)
      success('Đã gửi quyết toán.')
      await loadFinance()
    } catch (err) {
      error(err.message || 'Không thể gửi quyết toán.')
    } finally {
      setBusyId(null)
    }
  }

  const approveSettlement = async (proposal, settlement) => {
    if (busyId) return
    setBusyId(`settlement-${settlement.id}`)
    try {
      await api.approveSettlement(settlement.id)
      success('Đã duyệt quyết toán.')
      await loadFinance()
    } catch (err) {
      error(err.message || 'Không thể duyệt quyết toán.')
    } finally {
      setBusyId(null)
    }
  }

  const approvedBudget = proposals.reduce((sum, item) => sum + Number(item.approvedAmount || 0), 0)
  const spent = transactions
    .filter(item => item.type === 'SettlementApproved')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Tài chính</h2>
          <p className="mt-1 text-sm text-gray-400">Chỉ thủ quỹ đã được duyệt của CLB mới có thể gửi đề xuất và quyết toán.</p>
        </div>
        {treasurerClubs.length > 0 && (
          <button type="button" onClick={() => setShowCreate(true)} className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-5 py-3 font-semibold text-white">
            Tạo đề xuất
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Đề xuất', proposals.length, 'text-cyan-300'],
          ['Đang chờ', proposals.filter(item => normalizeStatus(item.status) === 'SUBMITTED').length, 'text-amber-300'],
          ['Ngân sách duyệt', money(approvedBudget), 'text-emerald-300'],
          ['Đã quyết toán', money(spent), 'text-purple-300'],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className={`text-xl font-bold sm:text-2xl ${color}`}>{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white sm:w-auto">
        <option value="ALL">Tất cả trạng thái</option>
        <option value="SUBMITTED">Đang chờ</option>
        <option value="APPROVED">Đã duyệt</option>
        <option value="REJECTED">Bị từ chối</option>
        <option value="SETTLED">Đã quyết toán</option>
      </select>

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 py-16 text-center text-gray-500">Chưa có đề xuất ngân sách.</div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map(proposal => {
            const status = normalizeStatus(proposal.status)
            const isTreasurerClub = treasurerClubIds.has(proposal.clubId)
            const activeSettlement = proposal.settlements?.find(item => ['SUBMITTED', 'APPROVED'].includes(normalizeStatus(item.status)))
            return (
              <article key={proposal.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">{proposal.clubName}</p><h3 className="mt-1 text-lg font-bold text-white">{proposal.title}</h3></div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}>{proposal.status}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-400">{proposal.description}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-950/60 p-3"><dt className="text-xs text-gray-500">Đề xuất</dt><dd className="mt-1 font-bold text-white">{money(proposal.requestedAmount)}</dd></div>
                  <div className="rounded-xl bg-slate-950/60 p-3"><dt className="text-xs text-gray-500">Được duyệt</dt><dd className="mt-1 font-bold text-emerald-300">{proposal.approvedAmount ? money(proposal.approvedAmount) : '—'}</dd></div>
                </dl>
                {proposal.reviewNote && <p className="mt-3 rounded-lg bg-slate-950/50 p-3 text-sm text-gray-300">Ghi chú: {proposal.reviewNote}</p>}
                {proposal.settlements?.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
                    {proposal.settlements.map(settlement => (
                      <div key={settlement.id} className="flex flex-col gap-2 rounded-lg bg-slate-950/50 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div><p className="text-sm font-semibold text-white">Quyết toán {money(settlement.totalSpent)}</p><p className="text-xs text-gray-500">{settlement.status}</p></div>
                        {canReview && normalizeStatus(settlement.status) === 'SUBMITTED' && (
                          <button type="button" onClick={() => approveSettlement(proposal, settlement)} disabled={busyId === `settlement-${settlement.id}`} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 disabled:opacity-50">Duyệt quyết toán</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-5 flex flex-wrap gap-2">
                  {canReview && status === 'SUBMITTED' && <><button type="button" onClick={() => openReview(proposal, 'reject')} className="rounded-lg bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-300">Từ chối</button><button type="button" onClick={() => openReview(proposal, 'approve')} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-300">Phê duyệt</button></>}
                  {isTreasurerClub && status === 'APPROVED' && !activeSettlement && <button type="button" onClick={() => setSettlementTarget(proposal)} className="rounded-lg bg-cyan-500/15 px-3 py-2 text-sm font-semibold text-cyan-300">Gửi quyết toán</button>}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Tạo đề xuất ngân sách" size="lg">
        <form onSubmit={createProposal} className="space-y-4">
          <select value={proposalForm.clubId} onChange={event => setProposalForm(current => ({ ...current, clubId: event.target.value }))} required className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900"><option value="">Chọn CLB</option>{treasurerClubs.map(club => <option key={club.clubId} value={club.clubId}>{club.clubName}</option>)}</select>
          <input value={proposalForm.title} onChange={event => setProposalForm(current => ({ ...current, title: event.target.value }))} required maxLength={200} placeholder="Tiêu đề đề xuất" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
          <textarea value={proposalForm.description} onChange={event => setProposalForm(current => ({ ...current, description: event.target.value }))} required rows={4} maxLength={1000} placeholder="Mô tả mục đích sử dụng ngân sách" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
          <div className="grid gap-4 sm:grid-cols-2"><input type="number" min="1" value={proposalForm.requestedAmount} onChange={event => setProposalForm(current => ({ ...current, requestedAmount: event.target.value }))} required placeholder="Số tiền đề xuất" className="rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /><input type="number" min="1" value={proposalForm.activityId} onChange={event => setProposalForm(current => ({ ...current, activityId: event.target.value }))} placeholder="Mã hoạt động (không bắt buộc)" className="rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /></div>
          <div className="flex gap-3"><button type="button" onClick={() => setShowCreate(false)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Hủy</button><button type="submit" disabled={busyId === 'create'} className="flex-1 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{busyId === 'create' ? 'Đang gửi...' : 'Gửi đề xuất'}</button></div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(reviewTarget)} onClose={() => setReviewTarget(null)} title={reviewAction === 'approve' ? 'Phê duyệt ngân sách' : 'Từ chối đề xuất'}>
        <form onSubmit={submitReview} className="space-y-4">
          <p className="text-sm text-neutral-600">{reviewTarget?.clubName} — {reviewTarget?.title}</p>
          {reviewAction === 'approve' && <input type="number" min="1" value={reviewAmount} onChange={event => setReviewAmount(event.target.value)} required className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" placeholder="Số tiền phê duyệt" />}
          <textarea value={reviewNote} onChange={event => setReviewNote(event.target.value)} required={reviewAction === 'reject'} rows={4} maxLength={1000} placeholder={reviewAction === 'reject' ? 'Lý do từ chối' : 'Ghi chú'} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
          <div className="flex gap-3"><button type="button" onClick={() => setReviewTarget(null)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Hủy</button><button type="submit" disabled={busyId === reviewTarget?.id} className={`flex-1 rounded-lg px-4 py-3 font-semibold text-white disabled:opacity-50 ${reviewAction === 'approve' ? 'bg-emerald-600' : 'bg-rose-600'}`}>Xác nhận</button></div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(settlementTarget)} onClose={() => setSettlementTarget(null)} title="Gửi quyết toán">
        <form onSubmit={submitSettlement} className="space-y-4">
          <p className="text-sm text-neutral-600">{settlementTarget?.title} — tối đa {money(settlementTarget?.approvedAmount)}</p>
          <input type="number" min="1" max={settlementTarget?.approvedAmount || undefined} value={settlementForm.totalSpent} onChange={event => setSettlementForm(current => ({ ...current, totalSpent: event.target.value }))} required placeholder="Tổng chi thực tế" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
          <input type="url" value={settlementForm.receiptUrl} onChange={event => setSettlementForm(current => ({ ...current, receiptUrl: event.target.value }))} required pattern="https://.*" placeholder="https://... URL chứng từ" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
          <div className="flex gap-3"><button type="button" onClick={() => setSettlementTarget(null)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Hủy</button><button type="submit" disabled={busyId === settlementTarget?.id} className="flex-1 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white disabled:opacity-50">Gửi quyết toán</button></div>
        </form>
      </Modal>
    </div>
  )
}
