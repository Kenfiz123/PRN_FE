import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../components/Modal'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { PERMISSIONS } from '../auth/permissions'

const emptyProposal = { clubId: '', activityChoice: '', customTitle: '', description: '', requestedAmount: '' }
const emptySettlement = { totalSpent: '', receiptUrl: '' }

function normalizeStatus(status) {
  return status?.toUpperCase() || 'SUBMITTED'
}

function money(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value) || 0)
}

function statusClass(status) {
  const value = normalizeStatus(status)
  if (value === 'APPROVED' || value === 'SETTLED') return 'bg-emerald-500/15 text-emerald-300'
  if (value === 'REJECTED') return 'bg-rose-500/15 text-rose-300'
  if (value === 'MANAGERAPPROVED') return 'bg-purple-500/15 text-purple-300'
  return 'bg-amber-500/15 text-amber-300'
}

function statusLabel(status) {
  const value = normalizeStatus(status)
  if (value === 'SUBMITTED') return 'Awaiting club owner'
  if (value === 'MANAGERAPPROVED') return 'Awaiting final approval'
  if (value === 'APPROVED') return 'Approved'
  if (value === 'REJECTED') return 'Rejected'
  if (value === 'SETTLED') return 'Settled'
  return status || 'Unknown'
}

function isBudgetActivity(activity) {
  if (activity.meetingDays?.length) return false
  if (normalizeStatus(activity.status) === 'CANCELLED') return false
  const content = `${activity.title || ''} ${activity.description || ''}`.toLowerCase()
  return !['attendance', 'roll call', 'check-in', 'check in', 'điểm danh', 'diem danh']
    .some(keyword => content.includes(keyword))
}

function FormField({ label, children }) {
  return (
    <label className="block text-sm font-semibold text-neutral-700">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}

export default function FinancePage() {
  const navigate = useNavigate()
  const { clubAccess, hasPermission } = useAuth()
  const { success, error } = useToast()
  const treasurerClubs = clubAccess.filter(access => access.isTreasurer)
  const treasurerClubIds = useMemo(() => new Set(treasurerClubs.map(access => access.clubId)), [treasurerClubs])
  const managerClubIds = useMemo(
    () => new Set(clubAccess.filter(access => access.isManager).map(access => access.clubId)),
    [clubAccess],
  )
  const canFinalReview = hasPermission(PERMISSIONS.REVIEW_FINANCE)

  const [proposals, setProposals] = useState([])
  const [transactions, setTransactions] = useState([])
  const [activities, setActivities] = useState([])
  const [futureReports, setFutureReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [proposalForm, setProposalForm] = useState(emptyProposal)
  const [reviewTarget, setReviewTarget] = useState(null)
  const [reviewAction, setReviewAction] = useState('approve')
  const [reviewStage, setReviewStage] = useState('manager')
  const [reviewAmount, setReviewAmount] = useState('')
  const [reviewNote, setReviewNote] = useState('')
  const [settlementTarget, setSettlementTarget] = useState(null)
  const [settlementForm, setSettlementForm] = useState(emptySettlement)

  const loadFinance = useCallback(async () => {
    setIsLoading(true)
    try {
      const [proposalResult, transactionResult, activityResult, reportResult] = await Promise.all([
        api.getBudgetProposals({ page: 1, pageSize: 100 }),
        api.getFinanceTransactions(),
        api.getActivities(),
        api.getReports({ page: 1, pageSize: 100 }),
      ])
      setProposals(Array.isArray(proposalResult?.items) ? proposalResult.items : [])
      setTransactions(Array.isArray(transactionResult) ? transactionResult : [])
      setActivities(Array.isArray(activityResult) ? activityResult : [])
      setFutureReports(Array.isArray(reportResult?.items) ? reportResult.items : [])
    } catch (err) {
      error(err.message || 'Unable to load finance data.')
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
  const eligibleActivities = useMemo(() => activities.filter(activity =>
    activity.clubId === Number(proposalForm.clubId) && isBudgetActivity(activity),
  ), [activities, proposalForm.clubId])
  const eligibleFutureReports = useMemo(() => futureReports.filter(report =>
    report.clubId === Number(proposalForm.clubId)
      && report.reportType === 'FUTURE_EVENT'
      && normalizeStatus(report.status) === 'AWAITING FINANCE'
      && !report.budgetProposalId,
  ), [futureReports, proposalForm.clubId])
  const activityById = useMemo(
    () => new Map(activities.map(activity => [activity.id, activity])),
    [activities],
  )

  const createProposal = async (event) => {
    event.preventDefault()
    if (busyId) return
    const club = treasurerClubs.find(item => item.clubId === Number(proposalForm.clubId))
    const selectedActivityId = proposalForm.activityChoice.startsWith('ACTIVITY:')
      ? Number(proposalForm.activityChoice.split(':')[1])
      : null
    const selectedReportId = proposalForm.activityChoice.startsWith('REPORT:')
      ? Number(proposalForm.activityChoice.split(':')[1])
      : null
    const selectedActivity = eligibleActivities.find(activity => activity.id === selectedActivityId)
    const selectedReport = eligibleFutureReports.find(report => report.id === selectedReportId)
    const isOther = proposalForm.activityChoice === 'OTHER'
    const proposalTitle = isOther
      ? proposalForm.customTitle.trim()
      : selectedActivity?.title?.trim() || selectedReport?.details?.[0]?.activityName?.trim()
    const requestedAmount = Number(proposalForm.requestedAmount)
    if (!club || !proposalTitle || (!isOther && !selectedActivity && !selectedReport) || !proposalForm.description.trim() || requestedAmount <= 0) {
      error('Please select an activity, a future event report, or Other, then provide the required proposal information.')
      return
    }
    setBusyId('create')
    try {
      const created = await api.createBudgetProposal({
        clubId: club.clubId,
        clubName: club.clubName,
        activityId: selectedActivity?.id || null,
        sourceReportId: selectedReport?.id || null,
        title: proposalTitle,
        description: proposalForm.description.trim(),
        requestedAmount,
      })
      setProposals(current => [created, ...current])
      setShowCreate(false)
      setProposalForm(emptyProposal)
      success('Budget proposal submitted.')
      await loadFinance()
    } catch (err) {
      error(err.message || 'Unable to create the budget proposal.')
    } finally {
      setBusyId(null)
    }
  }

  const openReview = (proposal, action, stage) => {
    setReviewTarget(proposal)
    setReviewAction(action)
    setReviewStage(stage)
    setReviewAmount(action === 'approve' && stage === 'final' ? String(proposal.requestedAmount) : '')
    setReviewNote('')
  }

  const submitReview = async (event) => {
    event.preventDefault()
    if (!reviewTarget || busyId) return
    if (reviewAction === 'reject' && !reviewNote.trim()) {
      error('Please provide a rejection reason.')
      return
    }
    const amount = Number(reviewAmount)
    if (reviewStage === 'final' && reviewAction === 'approve' && amount <= 0) {
      error('The approved amount must be greater than zero.')
      return
    }
    setBusyId(reviewTarget.id)
    try {
      let updated
      if (reviewStage === 'manager') {
        updated = reviewAction === 'approve'
          ? await api.managerApproveBudget(reviewTarget.id, reviewNote.trim())
          : await api.managerRejectBudget(reviewTarget.id, reviewNote.trim())
      } else {
        updated = reviewAction === 'approve'
          ? await api.approveBudget(reviewTarget.id, amount, reviewNote.trim())
          : await api.rejectBudget(reviewTarget.id, reviewNote.trim())
      }
      setProposals(current => current.map(item => item.id === updated.id ? updated : item))
      setReviewTarget(null)
      success(reviewAction === 'approve'
        ? reviewStage === 'manager' ? 'Proposal sent for final approval.' : 'Budget approved.'
        : 'Proposal rejected.')
      await loadFinance()
    } catch (err) {
      error(err.message || 'Unable to review the proposal.')
    } finally {
      setBusyId(null)
    }
  }

  const submitSettlement = async (event) => {
    event.preventDefault()
    if (!settlementTarget || busyId) return
    const totalSpent = Number(settlementForm.totalSpent)
    if (totalSpent <= 0 || !settlementForm.receiptUrl.trim()) {
      error('Please enter an amount and a valid HTTPS receipt URL.')
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
      success('Settlement submitted.')
      await loadFinance()
    } catch (err) {
      error(err.message || 'Unable to submit the settlement.')
    } finally {
      setBusyId(null)
    }
  }

  const approveSettlement = async (proposal, settlement) => {
    if (busyId) return
    setBusyId(`settlement-${settlement.id}`)
    try {
      await api.approveSettlement(settlement.id)
      success('Settlement approved.')
      await loadFinance()
    } catch (err) {
      error(err.message || 'Unable to approve the settlement.')
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
          <h2 className="text-2xl font-bold text-white">Finance</h2>
          <p className="mt-1 text-sm text-gray-400">Only approved club treasurers can submit proposals and settlements.</p>
        </div>
        {treasurerClubs.length > 0 && (
          <button type="button" onClick={() => setShowCreate(true)} className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-5 py-3 font-semibold text-white">
            Create proposal
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Proposals', proposals.length, 'text-cyan-300'],
          ['Pending', proposals.filter(item => ['SUBMITTED', 'MANAGERAPPROVED'].includes(normalizeStatus(item.status))).length, 'text-amber-300'],
          ['Approved budget', money(approvedBudget), 'text-emerald-300'],
          ['Settled amount', money(spent), 'text-purple-300'],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className={`text-xl font-bold sm:text-2xl ${color}`}>{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <select aria-label="Filter budget proposals by status" value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white sm:w-auto">
        <option value="ALL">All statuses</option>
        <option value="SUBMITTED">Awaiting club owner</option>
        <option value="MANAGERAPPROVED">Awaiting final approval</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
        <option value="SETTLED">Settled</option>
      </select>

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 py-16 text-center text-gray-500">No budget proposals yet.</div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map(proposal => {
            const status = normalizeStatus(proposal.status)
            const isTreasurerClub = treasurerClubIds.has(proposal.clubId)
            const isManagerClub = managerClubIds.has(proposal.clubId)
            const linkedActivity = proposal.activityId ? activityById.get(proposal.activityId) : null
            const activeSettlement = proposal.settlements?.find(item => ['SUBMITTED', 'APPROVED'].includes(normalizeStatus(item.status)))
            return (
              <article key={proposal.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">{proposal.clubName}</p><h3 className="mt-1 text-lg font-bold text-white">{proposal.title}</h3></div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}>{statusLabel(proposal.status)}</span>
                </div>
                {proposal.activityId && (
                  <p className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-xs text-cyan-300">
                    Linked activity: {linkedActivity?.title || proposal.title} · #{proposal.activityId}
                  </p>
                )}
                {proposal.sourceReportId && (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-2 text-xs text-purple-200">
                    <span>Combined future event report #{proposal.sourceReportId}</span>
                    <button type="button" onClick={() => navigate(`/reports/${proposal.sourceReportId}`)} className="font-semibold text-purple-300 hover:text-purple-200">Open report</button>
                  </div>
                )}
                {!proposal.activityId && !proposal.sourceReportId && <p className="mt-3 text-xs text-gray-500">Custom proposal title</p>}
                <p className="mt-3 text-sm leading-6 text-gray-400">{proposal.description}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-950/60 p-3"><dt className="text-xs text-gray-500">Requested</dt><dd className="mt-1 font-bold text-white">{money(proposal.requestedAmount)}</dd></div>
                  <div className="rounded-xl bg-slate-950/60 p-3"><dt className="text-xs text-gray-500">Approved</dt><dd className="mt-1 font-bold text-emerald-300">{proposal.approvedAmount ? money(proposal.approvedAmount) : '—'}</dd></div>
                </dl>
                {proposal.managerReviewNote && <p className="mt-3 rounded-lg bg-purple-500/5 p-3 text-sm text-purple-200">Club owner: {proposal.managerReviewNote}</p>}
                {proposal.reviewNote && <p className="mt-3 rounded-lg bg-slate-950/50 p-3 text-sm text-gray-300">Final review: {proposal.reviewNote}</p>}
                {proposal.settlements?.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-slate-800 pt-4">
                    {proposal.settlements.map(settlement => (
                      <div key={settlement.id} className="flex flex-col gap-2 rounded-lg bg-slate-950/50 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div><p className="text-sm font-semibold text-white">Settlement {money(settlement.totalSpent)}</p><p className="text-xs text-gray-500">{settlement.status}</p></div>
                        {canFinalReview && normalizeStatus(settlement.status) === 'SUBMITTED' && (
                          <button type="button" onClick={() => approveSettlement(proposal, settlement)} disabled={busyId === `settlement-${settlement.id}`} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-300 disabled:opacity-50">Approve settlement</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-5 flex flex-wrap gap-2">
                  {proposal.sourceReportId && ['SUBMITTED', 'MANAGERAPPROVED'].includes(status) && <button type="button" onClick={() => navigate(`/reports/${proposal.sourceReportId}`)} className="rounded-lg bg-purple-500/15 px-3 py-2 text-sm font-semibold text-purple-300">Review combined report</button>}
                  {!proposal.sourceReportId && isManagerClub && status === 'SUBMITTED' && <><button type="button" onClick={() => openReview(proposal, 'reject', 'manager')} className="rounded-lg bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-300">Reject as club owner</button><button type="button" onClick={() => openReview(proposal, 'approve', 'manager')} className="rounded-lg bg-purple-500/15 px-3 py-2 text-sm font-semibold text-purple-300">Approve as club owner</button></>}
                  {!proposal.sourceReportId && canFinalReview && status === 'MANAGERAPPROVED' && <><button type="button" onClick={() => openReview(proposal, 'reject', 'final')} className="rounded-lg bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-300">Final reject</button><button type="button" onClick={() => openReview(proposal, 'approve', 'final')} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-sm font-semibold text-emerald-300">Final approve</button></>}
                  {isTreasurerClub && status === 'APPROVED' && !activeSettlement && <button type="button" onClick={() => setSettlementTarget(proposal)} className="rounded-lg bg-cyan-500/15 px-3 py-2 text-sm font-semibold text-cyan-300">Submit settlement</button>}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Budget Proposal" size="lg">
        <form onSubmit={createProposal} className="space-y-4">
          <FormField label="Club *"><select value={proposalForm.clubId} onChange={event => setProposalForm(current => ({ ...current, clubId: event.target.value, activityChoice: '', customTitle: '' }))} required className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900"><option value="">Select a club</option>{treasurerClubs.map(club => <option key={club.clubId} value={club.clubId}>{club.clubName}</option>)}</select></FormField>
          <FormField label="Proposal title *">
            <select value={proposalForm.activityChoice} onChange={event => setProposalForm(current => ({ ...current, activityChoice: event.target.value, customTitle: '' }))} required disabled={!proposalForm.clubId} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900 disabled:bg-neutral-100">
              <option value="">Select an activity or future report</option>
              {eligibleFutureReports.map(report => <option key={`report-${report.id}`} value={`REPORT:${report.id}`}>[Future event] {report.details?.[0]?.activityName || report.period}</option>)}
              {eligibleActivities.map(activity => <option key={`activity-${activity.id}`} value={`ACTIVITY:${activity.id}`}>{activity.title}</option>)}
              <option value="OTHER">Other</option>
            </select>
          </FormField>
          {proposalForm.activityChoice === 'OTHER' && <FormField label="Custom proposal title *"><input value={proposalForm.customTitle} onChange={event => setProposalForm(current => ({ ...current, customTitle: event.target.value }))} required maxLength={200} placeholder="Enter the proposal title" className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /></FormField>}
          {proposalForm.clubId && eligibleActivities.length === 0 && eligibleFutureReports.length === 0 && <p className="text-xs text-neutral-500">No eligible activities or future event reports were found. Choose Other to enter a title.</p>}
          <FormField label="Budget use description *"><textarea value={proposalForm.description} onChange={event => setProposalForm(current => ({ ...current, description: event.target.value }))} required rows={4} maxLength={1000} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /></FormField>
          <FormField label="Requested amount (VND) *"><input type="number" min="1" value={proposalForm.requestedAmount} onChange={event => setProposalForm(current => ({ ...current, requestedAmount: event.target.value }))} required className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /></FormField>
          <div className="flex gap-3"><button type="button" onClick={() => setShowCreate(false)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Cancel</button><button type="submit" disabled={busyId === 'create'} className="flex-1 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{busyId === 'create' ? 'Submitting...' : 'Submit proposal'}</button></div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(reviewTarget)} onClose={() => setReviewTarget(null)} title={`${reviewStage === 'manager' ? 'Club Owner' : 'Final'} ${reviewAction === 'approve' ? 'Approval' : 'Rejection'}`}>
        <form onSubmit={submitReview} className="space-y-4">
          <p className="text-sm text-neutral-600">{reviewTarget?.clubName} — {reviewTarget?.title}</p>
          {reviewStage === 'final' && reviewAction === 'approve' && <FormField label="Approved amount (VND) *"><input type="number" min="1" value={reviewAmount} onChange={event => setReviewAmount(event.target.value)} required className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /></FormField>}
          <FormField label={reviewAction === 'reject' ? 'Rejection reason *' : 'Review note'}><textarea value={reviewNote} onChange={event => setReviewNote(event.target.value)} required={reviewAction === 'reject'} rows={4} maxLength={1000} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /></FormField>
          <div className="flex gap-3"><button type="button" onClick={() => setReviewTarget(null)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Cancel</button><button type="submit" disabled={busyId === reviewTarget?.id} className={`flex-1 rounded-lg px-4 py-3 font-semibold text-white disabled:opacity-50 ${reviewAction === 'approve' ? 'bg-emerald-600' : 'bg-rose-600'}`}>Confirm</button></div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(settlementTarget)} onClose={() => setSettlementTarget(null)} title="Submit Settlement">
        <form onSubmit={submitSettlement} className="space-y-4">
          <p className="text-sm text-neutral-600">{settlementTarget?.title} — maximum {money(settlementTarget?.approvedAmount)}</p>
          <FormField label="Actual total spent (VND) *"><input type="number" min="1" max={settlementTarget?.approvedAmount || undefined} value={settlementForm.totalSpent} onChange={event => setSettlementForm(current => ({ ...current, totalSpent: event.target.value }))} required className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /></FormField>
          <FormField label="Receipt URL *"><input type="url" value={settlementForm.receiptUrl} onChange={event => setSettlementForm(current => ({ ...current, receiptUrl: event.target.value }))} required pattern="https://.*" placeholder="https://..." className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" /></FormField>
          <div className="flex gap-3"><button type="button" onClick={() => setSettlementTarget(null)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Cancel</button><button type="submit" disabled={busyId === settlementTarget?.id} className="flex-1 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white disabled:opacity-50">Submit settlement</button></div>
        </form>
      </Modal>
    </div>
  )
}
