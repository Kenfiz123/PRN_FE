import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

const REPORT_TYPES = [
  { value: 'QUARTERLY', label: 'Báo cáo quý (Quarterly)' },
  { value: 'MONTHLY', label: 'Báo cáo tháng (Monthly)' },
  { value: 'SEMESTER', label: 'Báo cáo học kỳ (Semester)' },
  { value: 'ANNUAL', label: 'Báo cáo năm (Annual)' },
  { value: 'AD_HOC', label: 'Báo cáo đột xuất (Ad-hoc)' },
]

const DEFAULT_PERIODS = [
  { period: '2026-Q3', label: 'Quý III / 2026', dueDate: '2026-09-30' },
  { period: '2026-Q4', label: 'Quý IV / 2026', dueDate: '2026-12-31' },
  { period: '2026-Q2', label: 'Quý II / 2026', dueDate: '2026-06-30' },
  { period: '2026-HK1', label: 'Học kỳ I / 2026-2027', dueDate: '2026-11-15' },
]

function generateUniqueId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export default function CreateReportPage() {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const { user, clubAccess } = useAuth()
  const { success, error } = useToast()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deadlines, setDeadlines] = useState([])
  const [managedClubs, setManagedClubs] = useState([])
  const [existingReport, setExistingReport] = useState(null)

  const [clubId, setClubId] = useState('')
  const [period, setPeriod] = useState('2026-Q3')
  const [reportType, setReportType] = useState('QUARTERLY')
  const [executiveSummary, setExecutiveSummary] = useState('')
  const [achievements, setAchievements] = useState('')
  const [challenges, setChallenges] = useState('')
  const [recommendations, setRecommendations] = useState('')
  const [nextPeriodPlan, setNextPeriodPlan] = useState('')

  const [activities, setActivities] = useState([
    {
      id: generateUniqueId(),
      dbId: null,
      activityName: '',
      activityType: 'Chuyên môn',
      activityDate: new Date().toISOString().split('T')[0],
      location: '',
      partnerUnit: '',
      objective: '',
      description: '',
      targetParticipantCount: 50,
      participantCount: 0,
      outcome: '',
      budgetSpent: 0,
      evidenceUrl: '',
    },
  ])

  const userManagedClubs = useMemo(() => {
    return clubAccess.filter((access) => access.isManager)
  }, [clubAccess])

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [clubsRes, deadlinesRes] = await Promise.all([
          api.getClubs(),
          api.getReportingDeadlines().catch(() => []),
        ])

        const clubsList = Array.isArray(clubsRes) ? clubsRes : []
        const managedIds = new Set(userManagedClubs.map((c) => c.clubId))
        const filteredManaged = clubsList.filter((c) => managedIds.has(c.id))

        setManagedClubs(filteredManaged)
        if (filteredManaged.length > 0 && !clubId) {
          setClubId(filteredManaged[0].id)
        }

        if (Array.isArray(deadlinesRes) && deadlinesRes.length > 0) {
          setDeadlines(deadlinesRes)
        } else {
          setDeadlines(DEFAULT_PERIODS)
        }
      } catch (err) {
        console.error('Error loading report creation dependencies:', err)
      }
    }
    loadInitialData()
  }, [clubAccess, userManagedClubs])

  useEffect(() => {
    if (!isEditMode) return
    async function loadReportForEdit() {
      setIsLoading(true)
      try {
        const rep = await api.getReport(id)
        setClubId(rep.clubId)
        setPeriod(rep.period || '2026-Q3')
        setReportType(rep.reportType || 'QUARTERLY')
        setExecutiveSummary(rep.executiveSummary || '')
        setAchievements(rep.achievements || '')
        setChallenges(rep.challenges || '')
        setRecommendations(rep.recommendations || '')
        setNextPeriodPlan(rep.nextPeriodPlan || '')

        if (Array.isArray(rep.details) && rep.details.length > 0) {
          setActivities(
            rep.details.map((d) => ({
              id: generateUniqueId(),
              dbId: d.id,
              activityName: d.activityName || '',
              activityType: d.activityType || 'Chuyên môn',
              activityDate: d.activityDate || new Date().toISOString().split('T')[0],
              location: d.location || '',
              partnerUnit: d.partnerUnit || '',
              objective: d.objective || '',
              description: d.description || '',
              targetParticipantCount: d.targetParticipantCount || 0,
              participantCount: d.participantCount || 0,
              outcome: d.outcome || '',
              budgetSpent: d.budgetSpent || 0,
              evidenceUrl: d.evidenceUrl || '',
            })),
          )
        }
      } catch (err) {
        error(err.message || 'Không thể tải thông tin báo cáo để chỉnh sửa.')
        navigate('/reports')
      } finally {
        setIsLoading(false)
      }
    }
    loadReportForEdit()
  }, [id, isEditMode, navigate, error])

  const currentDueDate = useMemo(() => {
    const matched = deadlines.find((d) => d.period === period)
    if (matched) return matched.dueDate
    return '2026-09-30'
  }, [period, deadlines])

  useEffect(() => {
    if (isEditMode || !clubId || !period || !reportType) {
      setExistingReport(null)
      return undefined
    }

    let isActive = true
    api.getReports({ page: 1, pageSize: 100 })
      .then((result) => {
        const items = Array.isArray(result?.items) ? result.items : Array.isArray(result) ? result : []
        const match = items.find((item) => Number(item.clubId) === Number(clubId) && item.period === period && item.reportType === reportType)
        if (isActive) setExistingReport(match || null)
      })
      .catch(() => { if (isActive) setExistingReport(null) })
    return () => { isActive = false }
  }, [clubId, isEditMode, period, reportType])

  const totals = useMemo(() => {
    const totalActivities = activities.length
    const totalParticipants = activities.reduce((sum, act) => sum + (Number(act.participantCount) || 0), 0)
    const totalBudgetSpent = activities.reduce((sum, act) => sum + (Number(act.budgetSpent) || 0), 0)
    return { totalActivities, totalParticipants, totalBudgetSpent }
  }, [activities])

  const addActivity = () => {
    setActivities((prev) => [
      ...prev,
      {
        id: generateUniqueId(),
        dbId: null,
        activityName: '',
        activityType: 'Chuyên môn',
        activityDate: new Date().toISOString().split('T')[0],
        location: '',
        partnerUnit: '',
        objective: '',
        description: '',
        targetParticipantCount: 50,
        participantCount: 0,
        outcome: '',
        budgetSpent: 0,
        evidenceUrl: '',
      },
    ])
  }

  const updateActivityField = (id, field, value) => {
    setActivities((prev) =>
      prev.map((act) => (act.id === id ? { ...act, [field]: value } : act)),
    )
  }

  const removeActivity = (id) => {
    if (activities.length <= 1) {
      error('Báo cáo hoạt động phải có ít nhất 1 hoạt động.')
      return
    }
    setActivities((prev) => prev.filter((act) => act.id !== id))
  }

  const validateStep1 = () => {
    if (!clubId) {
      error('Vui lòng chọn Câu lạc bộ.')
      return false
    }
    if (!period) {
      error('Vui lòng chọn Kỳ báo cáo.')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (activities.length === 0) {
      error('Báo cáo phải chứa ít nhất 1 hoạt động.')
      return false
    }
    for (let i = 0; i < activities.length; i++) {
      const act = activities[i]
      if (!act.activityName.trim()) {
        error(`Vui lòng nhập tên cho Hoạt động ${i + 1}.`)
        return false
      }
      if (!act.activityDate) {
        error(`Vui lòng chọn ngày tổ chức cho Hoạt động ${i + 1}.`)
        return false
      }
      if (!act.description.trim()) {
        error(`Vui lòng nhập mô tả cho Hoạt động ${i + 1}.`)
        return false
      }
      if (act.participantCount < 0) {
        error(`Số người tham gia Hoạt động ${i + 1} không được âm.`)
        return false
      }
      if (!act.outcome.trim()) {
        error(`Vui lòng nhập kết quả đạt được cho Hoạt động ${i + 1}.`)
        return false
      }
    }
    return true
  }

  const validateStep3 = () => {
    if (!executiveSummary.trim()) {
      error('Vui lòng nhập Tóm tắt hoạt động trong kỳ.')
      return false
    }
    if (!achievements.trim()) {
      error('Vui lòng nhập Thành tựu nổi bật trong kỳ.')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    if (step === 3 && !validateStep3()) return
    setStep((prev) => Math.min(prev + 1, 4))
  }

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const buildPayload = () => {
    return {
      clubId: Number(clubId),
      period: period.trim(),
      reportType,
      executiveSummary: executiveSummary.trim(),
      achievements: achievements.trim(),
      challenges: challenges.trim() || null,
      recommendations: recommendations.trim() || null,
      nextPeriodPlan: nextPeriodPlan.trim() || null,
      details: activities.map((act, index) => ({
        id: act.dbId || undefined,
        activityName: act.activityName.trim(),
        activityType: act.activityType.trim(),
        activityDate: act.activityDate,
        location: act.location.trim() || null,
        partnerUnit: act.partnerUnit.trim() || null,
        objective: act.objective.trim() || null,
        description: act.description.trim(),
        targetParticipantCount: Number(act.targetParticipantCount) || 0,
        participantCount: Number(act.participantCount) || 0,
        outcome: act.outcome.trim(),
        budgetSpent: Number(act.budgetSpent) || 0,
        evidenceUrl: act.evidenceUrl.trim() || null,
        sortOrder: index + 1,
      })),
    }
  }

  const handleSaveDraft = async () => {
    if (!validateStep1()) return
    setIsSubmitting(true)
    try {
      const payload = buildPayload()
      let result
      if (isEditMode) {
        result = await api.updateReport(id, payload)
        success('Đã cập nhật bản nháp báo cáo thành công!')
      } else {
        result = await api.createReport(payload)
        success('Đã lưu bản nháp báo cáo thành công!')
      }
      navigate(`/reports/${result.id}`)
    } catch (err) {
      error(err.message || 'Không thể lưu bản nháp báo cáo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReport = async () => {
    if (!validateStep1() || !validateStep2() || !validateStep3()) return
    setIsSubmitting(true)
    try {
      const payload = buildPayload()
      let targetId = id
      if (isEditMode) {
        await api.updateReport(id, payload)
      } else {
        const created = await api.createReport(payload)
        targetId = created.id
      }

      await api.submitReport(targetId)
      success('Đã nộp báo cáo hoạt động thành công! Đang chờ duyệt.')
      navigate(`/reports/${targetId}`)
    } catch (err) {
      error(err.message || 'Không thể nộp báo cáo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="cyber-spinner mb-4" />
      </div>
    )
  }

  return (
    <div className="report-form max-w-[1200px] mx-auto space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/75 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h1 className="text-2xl font-bold font-orbitron text-slate-100 sm:text-3xl">
            {isEditMode ? 'CHỈNH SỬA BÁO CÁO HOẠT ĐỘNG' : 'LẬP BÁO CÁO HOẠT ĐỘNG CLB'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Quy trình lập và nộp báo cáo tổng kết hoạt động định kỳ cho CLB
          </p>
        </div>
        <button
          onClick={() => navigate('/reports')}
          className="min-h-11 px-4 py-2 text-sm font-semibold rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
        >
          Hủy & Quay lại
        </button>
      </div>

      {existingReport && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between">
          <p>Đã có báo cáo cho câu lạc bộ, kỳ và loại báo cáo này.</p>
          <div className="flex shrink-0 gap-3 font-semibold">
            <button onClick={() => navigate(`/reports/${existingReport.id}`)} className="text-cyan-200 hover:text-cyan-100">Xem báo cáo</button>
            {['DRAFT', 'REJECTED'].includes(String(existingReport.status || '').toUpperCase()) && <button onClick={() => navigate(`/reports/${existingReport.id}/edit`)} className="text-cyan-200 hover:text-cyan-100">Chỉnh sửa</button>}
          </div>
        </div>
      )}

      {/* Stepper Navigation */}
      <div className="p-3 sm:p-4 border border-slate-800 bg-slate-900/75 rounded-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-center text-sm font-semibold">
          {[
            { stepNum: 1, label: '1. Thông tin chung' },
            { stepNum: 2, label: '2. Hoạt động trong kỳ' },
            { stepNum: 3, label: '3. Tổng kết & Kế hoạch' },
            { stepNum: 4, label: '4. Preview & Gửi' },
          ].map((s) => (
            <button
              key={s.stepNum}
              onClick={() => {
                if (s.stepNum < step) setStep(s.stepNum)
              }}
              disabled={s.stepNum > step}
              className={`min-h-12 py-2 px-3 rounded-lg transition-all ${
                step === s.stepNum
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                  : s.stepNum < step
                  ? 'bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/40'
                  : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: General Info */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
            <h2 className="text-lg font-bold font-orbitron text-cyan-400">BƯỚC 1: THÔNG TIN CHUNG</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Câu lạc bộ <span className="text-rose-500">*</span>
                </label>
                {managedClubs.length > 0 ? (
                  <select
                    value={clubId}
                    onChange={(e) => setClubId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  >
                    {managedClubs.map((club) => (
                      <option key={club.id} value={club.id}>
                        {club.name} ({club.code})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-rose-400 text-xs py-2">
                    Bạn chưa là Manager của CLB nào hoặc danh sách đang tải.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Kỳ báo cáo <span className="text-rose-500">*</span>
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  {deadlines.map((d) => (
                    <option key={d.period} value={d.period}>
                      {d.label || d.period} (Hạn: {d.dueDate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Loại báo cáo <span className="text-rose-500">*</span>
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  {REPORT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Hạn nộp báo cáo (Tự động từ hệ thống)
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentDueDate}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-cyan-400 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Người lập báo cáo
                </label>
                <input
                  type="text"
                  readOnly
                  value={user?.name || user?.username || 'Club Manager'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Trạng thái khởi tạo
                </label>
                <input
                  type="text"
                  readOnly
                  value="Draft (Bản nháp)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-amber-400 cursor-not-allowed font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={handleNextStep}
                className="px-5 py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition-all text-xs"
              >
                Tiếp tục: BƯỚC 2 (Hoạt động) &rarr;
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 2: Activities */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-orbitron font-semibold text-cyan-400">
              CÁC HOẠT ĐỘNG ĐÃ THỰC HIỆN TRONG KỲ ({activities.length})
            </h2>
            <button
              onClick={addActivity}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg border border-cyan-500/30 transition-all"
            >
              + Thêm hoạt động
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-4 text-center">
            <div>
              <p className="text-xs text-slate-400 uppercase">Tổng số hoạt động</p>
              <p className="text-xl font-orbitron font-bold text-cyan-400">{totals.totalActivities}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase">Tổng người tham gia</p>
              <p className="text-xl font-orbitron font-bold text-emerald-400">{totals.totalParticipants} người</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase">Tổng chi phí thực tế</p>
              <p className="text-xl font-orbitron font-bold text-amber-400">
                {totals.totalBudgetSpent.toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
          </div>

          {activities.map((act, index) => (
            <div
              key={act.id}
              className="border border-slate-800 bg-slate-900/80 rounded-xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-orbitron font-bold text-cyan-400 text-sm">
                  HOẠT ĐỘNG #{index + 1}
                </span>
                {activities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeActivity(act.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 bg-rose-950/40 rounded border border-rose-500/30"
                  >
                    Xóa hoạt động này
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tên hoạt động <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={act.activityName}
                    onChange={(e) => updateActivityField(act.id, 'activityName', e.target.value)}
                    placeholder="VD: Workshop Lập trình Microservices với .NET 8"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Loại hoạt động
                  </label>
                  <input
                    type="text"
                    value={act.activityType}
                    onChange={(e) => updateActivityField(act.id, 'activityType', e.target.value)}
                    placeholder="VD: Chuyên môn / Phong trào / Hợp tác"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ngày tổ chức <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={act.activityDate}
                    onChange={(e) => updateActivityField(act.id, 'activityDate', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Địa điểm tổ chức
                  </label>
                  <input
                    type="text"
                    value={act.location}
                    onChange={(e) => updateActivityField(act.id, 'location', e.target.value)}
                    placeholder="VD: Hội trường Alpha, FPT University"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Đơn vị phối hợp
                  </label>
                  <input
                    type="text"
                    value={act.partnerUnit}
                    onChange={(e) => updateActivityField(act.id, 'partnerUnit', e.target.value)}
                    placeholder="VD: Doanh nghiệp FPT Software / Khoa CNTT"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số người dự kiến / Thực tế <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={act.targetParticipantCount}
                      onChange={(e) => updateActivityField(act.id, 'targetParticipantCount', Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="Dự kiến"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                    <input
                      type="number"
                      value={act.participantCount}
                      onChange={(e) => updateActivityField(act.id, 'participantCount', Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="Thực tế"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nội dung / Mô tả hoạt động <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={act.description}
                    onChange={(e) => updateActivityField(act.id, 'description', e.target.value)}
                    placeholder="Chi tiết về diễn biến hoạt động..."
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kết quả đạt được <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={act.outcome}
                    onChange={(e) => updateActivityField(act.id, 'outcome', e.target.value)}
                    placeholder="VD: 85% sinh viên nắm vững kiến thức, 10 dự án được trao giải..."
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Chi phí thực tế (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={act.budgetSpent}
                    onChange={(e) => updateActivityField(act.id, 'budgetSpent', Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Link minh chứng (Ảnh/Drive URL)
                  </label>
                  <input
                    type="url"
                    value={act.evidenceUrl}
                    onChange={(e) => updateActivityField(act.id, 'evidenceUrl', e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-4">
            <button
              onClick={handlePrevStep}
              className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 text-xs"
            >
              &larr; Quay lại
            </button>
            <button
              onClick={handleNextStep}
              className="px-5 py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition-all text-xs"
            >
              Tiếp tục: BƯỚC 3 (Tổng kết) &rarr;
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: Summary & Future Plans */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
            <h2 className="text-lg font-bold font-orbitron text-cyan-400">BƯỚC 3: TỔNG KẾT VÀ KẾ HOẠCH</h2>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Tóm tắt hoạt động trong kỳ <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={executiveSummary}
                onChange={(e) => setExecutiveSummary(e.target.value)}
                placeholder="Nêu tóm tắt chung các điểm nhấn chính của CLB trong kỳ vừa qua..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Thành tựu nổi bật <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="Liệt kê các giải thưởng, chứng nhận hoặc kết quả xuất sắc đạt được..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Khó khăn & Tồn tại
              </label>
              <textarea
                rows={3}
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                placeholder="Các vướng mắc về địa điểm, kinh phí, nhân sự..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Kiến nghị & Đề xuất hỗ trợ
              </label>
              <textarea
                rows={3}
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="Đề xuất hỗ trợ từ Nhà trường, Phòng CTSV..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Kế hoạch kỳ tiếp theo
              </label>
              <textarea
                rows={3}
                value={nextPeriodPlan}
                onChange={(e) => setNextPeriodPlan(e.target.value)}
                placeholder="Định hướng và các sự kiện dự kiến tổ chức trong kỳ tới..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={handlePrevStep}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 text-xs"
              >
                &larr; Quay lại
              </button>
              <button
                onClick={handleNextStep}
                className="px-5 py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition-all text-xs"
              >
                Tiếp tục: BƯỚC 4 (Preview) &rarr;
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 4: Preview & Submit */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="p-6 bg-slate-900/80 border border-cyan-500/30 rounded-xl space-y-6">
            <h2 className="text-lg font-bold font-orbitron text-cyan-400">BƯỚC 4: XEM TRƯỚC VÀ NỘP BÁO CÁO</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <div>
                <p className="text-xs text-slate-400">Kỳ báo cáo</p>
                <p className="font-semibold text-cyan-400">{period}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Loại báo cáo</p>
                <p className="font-semibold text-slate-200">{reportType}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Hạn nộp</p>
                <p className="font-semibold text-amber-400 font-mono">{currentDueDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Số hoạt động</p>
                <p className="font-semibold text-emerald-400">{totals.totalActivities} hoạt động</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase text-cyan-400 tracking-wider">Tóm tắt hoạt động</h4>
                <p className="text-slate-300 text-sm mt-1 bg-slate-950 p-3 rounded border border-slate-800 whitespace-pre-wrap">
                  {executiveSummary}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase text-cyan-400 tracking-wider">Thành tựu nổi bật</h4>
                <p className="text-slate-300 text-sm mt-1 bg-slate-950 p-3 rounded border border-slate-800 whitespace-pre-wrap">
                  {achievements}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-cyan-400 tracking-wider mb-2">Danh sách hoạt động ({activities.length})</h4>
                <div className="space-y-3">
                  {activities.map((act, idx) => (
                    <div key={act.id} className="p-3 bg-slate-950 rounded border border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-slate-200">
                        <span>#{idx + 1}. {act.activityName}</span>
                        <span className="text-cyan-400">{act.activityDate}</span>
                      </div>
                      <p className="text-slate-400">{act.description}</p>
                      <div className="flex gap-4 text-slate-400 pt-1">
                        <span>Tham gia: <strong className="text-emerald-400">{act.participantCount} người</strong></span>
                        <span>Chi phí: <strong className="text-amber-400">{act.budgetSpent.toLocaleString('vi-VN')} VNĐ</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-slate-800">
              <button
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 text-xs"
              >
                &larr; Quay lại sửa
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold rounded-lg border border-cyan-500/30 text-xs"
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu bản nháp'}
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg shadow-lg shadow-cyan-500/20 text-xs"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Nộp báo cáo ngay'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
