import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../auth/permissions'
import { api } from '../services/api'

const emptyJoinForm = {
  personalInfo: '',
  goals: '',
  reason: '',
  message: '',
}

const statusStyles = {
  PENDING: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  APPROVED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  REJECTED: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
}

const statusLabels = {
  PENDING: 'Đang chờ duyệt',
  APPROVED: 'Đã là thành viên',
  REJECTED: 'Đã bị từ chối',
}

function getMembershipStatus(membership) {
  return membership?.status?.toUpperCase()
}

export default function ClubsPage() {
  const { success, error } = useToast()
  const { clubAccess, hasPermission, refreshClubAccess } = useAuth()
  const canJoinClub = hasPermission(PERMISSIONS.JOIN_CLUB)
  const managedClubIds = useMemo(
    () => new Set(clubAccess.filter(access => access.isManager).map(access => access.clubId)),
    [clubAccess],
  )

  const [clubs, setClubs] = useState([])
  const [memberships, setMemberships] = useState([])
  const [pendingReviews, setPendingReviews] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedClub, setSelectedClub] = useState(null)
  const [joinForm, setJoinForm] = useState(emptyJoinForm)
  const [reviewTarget, setReviewTarget] = useState(null)
  const [reviewAction, setReviewAction] = useState('approve')
  const [reviewNote, setReviewNote] = useState('')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [clubResult, membershipResult] = await Promise.all([
        api.getClubs(),
        canJoinClub ? api.getMyMemberships() : Promise.resolve([]),
      ])

      const normalizedClubs = Array.isArray(clubResult) ? clubResult : []
      const normalizedMemberships = Array.isArray(membershipResult) ? membershipResult : []
      setClubs(normalizedClubs)
      setMemberships(normalizedMemberships)

      if (managedClubIds.size > 0) {
        const reviewLists = await Promise.all(
          [...managedClubIds].map(clubId => api.getClubMemberships(clubId)),
        )
        setPendingReviews(
          reviewLists
            .flat()
            .filter(membership => getMembershipStatus(membership) === 'PENDING')
            .sort((a, b) => new Date(a.requestedAtUtc) - new Date(b.requestedAtUtc)),
        )
      } else {
        setPendingReviews([])
      }
    } catch (err) {
      error(err.message || 'Không thể tải danh sách câu lạc bộ.')
    } finally {
      setIsLoading(false)
    }
  }, [canJoinClub, error, managedClubIds])

  useEffect(() => {
    loadData()
  }, [loadData])

  const membershipByClub = useMemo(
    () => new Map(memberships.map(membership => [membership.clubId, membership])),
    [memberships],
  )

  const filteredClubs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return clubs
    return clubs.filter(club =>
      club.name.toLowerCase().includes(query)
      || club.code.toLowerCase().includes(query)
      || club.description.toLowerCase().includes(query),
    )
  }, [clubs, searchQuery])

  const approvedMemberships = memberships.filter(
    membership => getMembershipStatus(membership) === 'APPROVED',
  )
  const pendingMemberships = memberships.filter(
    membership => getMembershipStatus(membership) === 'PENDING',
  )

  const openJoinForm = (club) => {
    setSelectedClub(club)
    setJoinForm(emptyJoinForm)
  }

  const closeJoinForm = () => {
    if (isSubmitting) return
    setSelectedClub(null)
    setJoinForm(emptyJoinForm)
  }

  const submitJoinRequest = async (event) => {
    event.preventDefault()
    if (isSubmitting || !selectedClub) return

    const payload = {
      personalInfo: joinForm.personalInfo.trim(),
      goals: joinForm.goals.trim(),
      reason: joinForm.reason.trim(),
      message: joinForm.message.trim() || null,
    }
    if (!payload.personalInfo || !payload.goals || !payload.reason) {
      error('Vui lòng nhập đầy đủ thông tin cá nhân, mục tiêu và lý do tham gia.')
      return
    }

    setIsSubmitting(true)
    try {
      await api.joinClub(selectedClub.id, payload)
      success(`Đã gửi đơn tham gia ${selectedClub.name}. Vui lòng chờ chủ CLB duyệt.`)
      setSelectedClub(null)
      setJoinForm(emptyJoinForm)
      await loadData()
    } catch (err) {
      error(err.message || 'Không thể gửi đơn tham gia câu lạc bộ.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openReview = (membership, action) => {
    setReviewTarget(membership)
    setReviewAction(action)
    setReviewNote('')
  }

  const closeReview = () => {
    if (isSubmitting) return
    setReviewTarget(null)
    setReviewNote('')
  }

  const submitReview = async (event) => {
    event.preventDefault()
    if (isSubmitting || !reviewTarget) return

    setIsSubmitting(true)
    try {
      if (reviewAction === 'approve') {
        await api.approveClubMembership(reviewTarget.id, reviewNote.trim())
        success(`Đã duyệt ${reviewTarget.fullName} vào ${reviewTarget.clubName}.`)
      } else {
        await api.rejectClubMembership(reviewTarget.id, reviewNote.trim())
        success(`Đã từ chối đơn của ${reviewTarget.fullName}.`)
      }
      setReviewTarget(null)
      setReviewNote('')
      await Promise.all([loadData(), refreshClubAccess?.()])
    } catch (err) {
      error(err.message || 'Không thể xét duyệt đơn tham gia.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Câu lạc bộ
          </span>
          <h2 className="mt-3 text-3xl font-bold text-white">Chọn CLB phù hợp với bạn</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-400">
            Tài khoản mới chưa thuộc câu lạc bộ nào. Hãy chọn một CLB, gửi đơn và chờ chủ CLB xét duyệt.
          </p>
        </div>
        <div className="relative w-full lg:w-96">
          <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder="Tìm theo tên, mã hoặc mô tả..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none transition focus:border-cyan-500"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['CLB đang hoạt động', clubs.filter(club => club.isActive).length, 'text-cyan-300'],
          ['CLB đang tham gia', approvedMemberships.length, 'text-emerald-300'],
          ['Đơn đang chờ', pendingMemberships.length, 'text-amber-300'],
          ['Đơn cần tôi duyệt', pendingReviews.length, 'text-purple-300'],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {pendingReviews.length > 0 && (
        <section className="rounded-2xl border border-purple-500/25 bg-purple-500/5 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Đơn chờ chủ CLB xét duyệt</h3>
              <p className="text-sm text-gray-400">Chỉ chủ CLB được gán cho đúng CLB này mới có thể duyệt.</p>
            </div>
            <span className="rounded-full bg-purple-500/20 px-3 py-1 text-sm font-bold text-purple-300">
              {pendingReviews.length}
            </span>
          </div>
          <div className="space-y-3">
            {pendingReviews.map(membership => (
              <div key={membership.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-white">{membership.fullName}</h4>
                      <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-300">
                        {membership.clubName}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-300"><span className="text-gray-500">Thông tin:</span> {membership.personalInfo}</p>
                    <p className="mt-1 text-sm text-gray-300"><span className="text-gray-500">Mục tiêu:</span> {membership.goals}</p>
                    <p className="mt-1 text-sm text-gray-300"><span className="text-gray-500">Lý do:</span> {membership.reason}</p>
                    {membership.requestMessage && (
                      <p className="mt-1 text-sm text-gray-300"><span className="text-gray-500">Lời nhắn:</span> {membership.requestMessage}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => openReview(membership, 'reject')}
                      className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/20"
                    >
                      Từ chối
                    </button>
                    <button
                      type="button"
                      onClick={() => openReview(membership, 'approve')}
                      className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                    >
                      Đồng ý
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {isLoading ? (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 py-16 text-center text-gray-500">
          Chưa có câu lạc bộ phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredClubs.map((club, index) => {
            const membership = membershipByClub.get(club.id)
            const status = getMembershipStatus(membership)
            const isManaged = managedClubIds.has(club.id)
            const approvedMemberCount = (club.members || []).filter(
              member => getMembershipStatus(member) === 'APPROVED',
            ).length
            const activeManager = (club.managers || []).find(manager => manager.isActive)

            return (
              <motion.article
                key={club.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/65 transition hover:-translate-y-1 hover:border-cyan-500/40"
              >
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-xl font-bold text-cyan-300">
                      {club.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      {isManaged && (
                        <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-300">
                          CLB của bạn
                        </span>
                      )}
                      {status && (
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>
                          {statusLabels[status]}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">{club.code}</p>
                  <h3 className="mt-1 text-xl font-bold text-white">{club.name}</h3>
                  <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-gray-400">
                    {club.description || 'Chưa có mô tả.'}
                  </p>

                  <dl className="mt-5 space-y-2 border-t border-slate-800 pt-4 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Chủ CLB</dt>
                      <dd className="text-right text-gray-200">{activeManager?.managerName || 'Chưa phân công'}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Thành viên đã duyệt</dt>
                      <dd className="font-semibold text-white">{approvedMemberCount}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-gray-500">Liên hệ</dt>
                      <dd className="truncate text-right text-gray-300">{club.contactEmail}</dd>
                    </div>
                  </dl>

                  {status === 'REJECTED' && membership.reviewNote && (
                    <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-sm text-rose-200">
                      Lý do từ chối: {membership.reviewNote}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-800 bg-black/20 p-4">
                  {isManaged ? (
                    <p className="text-center text-sm font-semibold text-purple-300">
                      Bạn đang là chủ CLB này
                    </p>
                  ) : status === 'APPROVED' ? (
                    <p className="text-center text-sm font-semibold text-emerald-300">
                      Quyền thành viên đã được kích hoạt
                    </p>
                  ) : status === 'PENDING' ? (
                    <p className="text-center text-sm font-semibold text-amber-300">
                      Đơn đã gửi — đang chờ chủ CLB duyệt
                    </p>
                  ) : canJoinClub ? (
                    <button
                      type="button"
                      onClick={() => openJoinForm(club)}
                      className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-cyan-500/20"
                    >
                      {status === 'REJECTED' ? 'Gửi lại đơn đăng ký' : 'Đăng ký tham gia'}
                    </button>
                  ) : (
                    <p className="text-center text-sm text-gray-500">Chỉ tài khoản thành viên mới được gửi đơn</p>
                  )}
                </div>
              </motion.article>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={Boolean(selectedClub)}
        onClose={closeJoinForm}
        title={selectedClub ? `Đăng ký tham gia ${selectedClub.name}` : 'Đăng ký tham gia CLB'}
        size="lg"
      >
        <form onSubmit={submitJoinRequest} className="space-y-4">
          <p className="rounded-lg bg-cyan-50 p-3 text-sm text-cyan-900">
            Gửi đơn không đồng nghĩa với đã vào CLB. Tư cách thành viên chỉ có hiệu lực sau khi chủ CLB đồng ý.
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Thông tin cá nhân *</label>
            <textarea
              value={joinForm.personalInfo}
              onChange={event => setJoinForm(current => ({ ...current, personalInfo: event.target.value }))}
              rows={3}
              maxLength={500}
              required
              placeholder="Ngành học, khóa, kỹ năng hoặc kinh nghiệm liên quan..."
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Mục tiêu khi tham gia *</label>
            <textarea
              value={joinForm.goals}
              onChange={event => setJoinForm(current => ({ ...current, goals: event.target.value }))}
              rows={3}
              maxLength={500}
              required
              placeholder="Bạn muốn học hỏi hoặc đóng góp điều gì?"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Lý do chọn CLB *</label>
            <textarea
              value={joinForm.reason}
              onChange={event => setJoinForm(current => ({ ...current, reason: event.target.value }))}
              rows={3}
              maxLength={500}
              required
              placeholder="Vì sao bạn muốn trở thành thành viên của CLB này?"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Lời nhắn thêm</label>
            <textarea
              value={joinForm.message}
              onChange={event => setJoinForm(current => ({ ...current, message: event.target.value }))}
              rows={2}
              maxLength={500}
              placeholder="Nội dung bổ sung (không bắt buộc)"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeJoinForm}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700 hover:bg-neutral-200 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi đơn đăng ký'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(reviewTarget)}
        onClose={closeReview}
        title={reviewAction === 'approve' ? 'Duyệt thành viên' : 'Từ chối đơn đăng ký'}
      >
        <form onSubmit={submitReview} className="space-y-4">
          <p className="text-sm text-neutral-600">
            {reviewAction === 'approve'
              ? `Sau khi xác nhận, ${reviewTarget?.fullName || 'người đăng ký'} sẽ chính thức trở thành thành viên của ${reviewTarget?.clubName || 'CLB'}.`
              : `${reviewTarget?.fullName || 'Người đăng ký'} sẽ chưa có quyền thành viên và có thể gửi lại đơn sau.`}
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
              Ghi chú xét duyệt {reviewAction === 'reject' ? '*' : ''}
            </label>
            <textarea
              value={reviewNote}
              onChange={event => setReviewNote(event.target.value)}
              rows={4}
              maxLength={1000}
              required={reviewAction === 'reject'}
              placeholder={reviewAction === 'approve' ? 'Ghi chú thêm (không bắt buộc)' : 'Nhập lý do từ chối'}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={closeReview}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 rounded-lg px-4 py-3 font-semibold text-white disabled:opacity-50 ${
                reviewAction === 'approve' ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {isSubmitting ? 'Đang xử lý...' : reviewAction === 'approve' ? 'Xác nhận đồng ý' : 'Xác nhận từ chối'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
