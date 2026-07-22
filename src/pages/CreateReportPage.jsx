import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

const REPORT_TYPES = [
  { value: 'QUARTERLY', label: 'Quarterly report' },
  { value: 'MONTHLY', label: 'Monthly report' },
  { value: 'SEMESTER', label: 'Semester report' },
  { value: 'ANNUAL', label: 'Annual report' },
  { value: 'AD_HOC', label: 'Ad-hoc report' },
  { value: 'FUTURE_EVENT', label: 'Future event proposal' },
]

const DEFAULT_PERIODS = [
  { period: '2026-Q3', label: 'Quarter III / 2026', dueDate: '2026-09-30' },
  { period: '2026-Q4', label: 'Quarter IV / 2026', dueDate: '2026-12-31' },
  { period: '2026-Q2', label: 'Quarter II / 2026', dueDate: '2026-06-30' },
  { period: '2026-HK1', label: 'Semester I / 2026-2027', dueDate: '2026-11-15' },
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
  const isFutureEvent = reportType === 'FUTURE_EVENT'

  const [activities, setActivities] = useState([
    {
      id: generateUniqueId(),
      dbId: null,
      activityName: '',
      activityType: 'Professional',
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
    if (isFutureEvent) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const minimumDate = tomorrow.toISOString().split('T')[0]
      setActivities((current) => current.slice(0, 1).map((activity) => ({
        ...activity,
        activityDate: activity.activityDate >= minimumDate ? activity.activityDate : minimumDate,
      })))
    }
  }, [isFutureEvent])

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
              activityType: d.activityType || 'Professional',
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
        error(err.message || 'Unable to load the report for editing.')
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
        const match = reportType === 'FUTURE_EVENT'
          ? null
          : items.find((item) => Number(item.clubId) === Number(clubId) && item.period === period && item.reportType === reportType)
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
        activityType: 'Professional',
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
      error('An activity report must include at least one activity.')
      return
    }
    setActivities((prev) => prev.filter((act) => act.id !== id))
  }

  const validateStep1 = () => {
    if (!clubId) {
      error('Please select a club.')
      return false
    }
    if (!period) {
      error('Please select a reporting period.')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (isFutureEvent && activities.length !== 1) {
      error('A future event proposal must contain exactly one planned event.')
      return false
    }
    if (activities.length === 0) {
      error('The report must include at least one activity.')
      return false
    }
    for (let i = 0; i < activities.length; i++) {
      const act = activities[i]
      if (!act.activityName.trim()) {
        error(`Please enter a name for Activity ${i + 1}.`)
        return false
      }
      if (!act.activityDate) {
        error(`Please select a date for Activity ${i + 1}.`)
        return false
      }
      if (isFutureEvent) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const eventDate = new Date(`${act.activityDate}T00:00:00`)
        if (eventDate <= today) {
          error('The planned event date must be in the future.')
          return false
        }
        if (!act.location.trim()) {
          error('Please enter the planned event location.')
          return false
        }
      }
      if (!act.description.trim()) {
        error(`Please enter a description for Activity ${i + 1}.`)
        return false
      }
      if (act.participantCount < 0) {
        error(`The participant count for Activity ${i + 1} cannot be negative.`)
        return false
      }
      if (!act.outcome.trim()) {
        error(`Please enter the outcome for Activity ${i + 1}.`)
        return false
      }
    }
    return true
  }

  const validateStep3 = () => {
    if (!executiveSummary.trim()) {
      error('Please enter the activity summary for this period.')
      return false
    }
    if (!achievements.trim()) {
      error('Please enter the key achievements for this period.')
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
        participantCount: isFutureEvent ? 0 : Number(act.participantCount) || 0,
        outcome: act.outcome.trim(),
        budgetSpent: isFutureEvent ? null : Number(act.budgetSpent) || 0,
        evidenceUrl: isFutureEvent ? null : act.evidenceUrl.trim() || null,
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
        success('Report draft updated successfully!')
      } else {
        result = await api.createReport(payload)
        success('Report draft saved successfully!')
      }
      navigate(`/reports/${result.id}`)
    } catch (err) {
      error(err.message || 'Unable to save the report draft.')
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
      success(isFutureEvent
        ? 'Future event report submitted. The club treasurer has been asked to add the budget.'
        : 'Activity report submitted successfully and is awaiting review!')
      navigate(`/reports/${targetId}`)
    } catch (err) {
      error(err.message || 'Unable to submit the report.')
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
            {isEditMode ? 'EDIT ACTIVITY REPORT' : 'CREATE CLUB ACTIVITY REPORT'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create and submit a periodic club activity report
          </p>
        </div>
        <button
          onClick={() => navigate('/reports')}
          className="min-h-11 px-4 py-2 text-sm font-semibold rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
        >
          Cancel and go back
        </button>
      </div>

      {existingReport && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100 sm:flex-row sm:items-center sm:justify-between">
          <p>A report already exists for this club, period, and report type.</p>
          <div className="flex shrink-0 gap-3 font-semibold">
            <button onClick={() => navigate(`/reports/${existingReport.id}`)} className="text-cyan-200 hover:text-cyan-100">View report</button>
            {['DRAFT', 'REJECTED'].includes(String(existingReport.status || '').toUpperCase()) && <button onClick={() => navigate(`/reports/${existingReport.id}/edit`)} className="text-cyan-200 hover:text-cyan-100">Edit</button>}
          </div>
        </div>
      )}

      {/* Stepper Navigation */}
      <div className="p-3 sm:p-4 border border-slate-800 bg-slate-900/75 rounded-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-center text-sm font-semibold">
          {[
            { stepNum: 1, label: '1. General information' },
            { stepNum: 2, label: '2. Period activities' },
            { stepNum: 3, label: '3. Summary and plan' },
            { stepNum: 4, label: '4. Preview and submit' },
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
            <h2 className="text-lg font-bold font-orbitron text-cyan-400">STEP 1: GENERAL INFORMATION</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Club <span className="text-rose-500">*</span>
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
                    You do not manage any clubs yet, or the club list is still loading.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Reporting period <span className="text-rose-500">*</span>
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  {deadlines.map((d) => (
                    <option key={d.period} value={d.period}>
                      {d.label || d.period} (Due: {d.dueDate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Report type <span className="text-rose-500">*</span>
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
                  Report deadline (set automatically)
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
                  Report author
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
                  Initial status
                </label>
                <input
                  type="text"
                  readOnly
                  value="Draft"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-amber-400 cursor-not-allowed font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={handleNextStep}
                className="px-5 py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition-all text-xs"
              >
                Continue: STEP 2 (Activities) &rarr;
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
              {isFutureEvent ? 'PLANNED FUTURE EVENT' : `ACTIVITIES COMPLETED DURING THE PERIOD (${activities.length})`}
            </h2>
            {!isFutureEvent && <button
              onClick={addActivity}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg border border-cyan-500/30 transition-all"
            >
              + Add activity
            </button>}
          </div>

          {isFutureEvent && <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-sm leading-6 text-purple-100">After submission, the club treasurer will receive a notification to add the event budget. Financial information is not entered in this content report.</div>}

          <div className={`grid gap-4 bg-cyan-950/30 border border-cyan-500/30 rounded-xl p-4 text-center ${isFutureEvent ? 'grid-cols-2' : 'grid-cols-3'}`}>
            <div>
              <p className="text-xs text-slate-400 uppercase">Total activities</p>
              <p className="text-xl font-orbitron font-bold text-cyan-400">{totals.totalActivities}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase">{isFutureEvent ? 'Expected participants' : 'Total participants'}</p>
              <p className="text-xl font-orbitron font-bold text-emerald-400">{isFutureEvent ? activities[0]?.targetParticipantCount || 0 : totals.totalParticipants} people</p>
            </div>
            {!isFutureEvent && <div>
              <p className="text-xs text-slate-400 uppercase">Total actual cost</p>
              <p className="text-xl font-orbitron font-bold text-amber-400">
                {totals.totalBudgetSpent.toLocaleString('en-US')} VND
              </p>
            </div>}
          </div>

          {activities.map((act, index) => (
            <div
              key={act.id}
              className="border border-slate-800 bg-slate-900/80 rounded-xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="font-orbitron font-bold text-cyan-400 text-sm">
                  ACTIVITY #{index + 1}
                </span>
                {!isFutureEvent && activities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeActivity(act.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 bg-rose-950/40 rounded border border-rose-500/30"
                  >
                    Remove this activity
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Activity name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={act.activityName}
                    onChange={(e) => updateActivityField(act.id, 'activityName', e.target.value)}
                    placeholder="Example: Microservices Programming Workshop with .NET 8"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Activity type
                  </label>
                  <input
                    type="text"
                    value={act.activityType}
                    onChange={(e) => updateActivityField(act.id, 'activityType', e.target.value)}
                    placeholder="Example: Professional / Community / Partnership"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Activity date <span className="text-rose-500">*</span>
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
                    Location
                  </label>
                  <input
                    type="text"
                    value={act.location}
                    onChange={(e) => updateActivityField(act.id, 'location', e.target.value)}
                    placeholder="Example: Alpha Hall, FPT University"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Partner organization
                  </label>
                  <input
                    type="text"
                    value={act.partnerUnit}
                    onChange={(e) => updateActivityField(act.id, 'partnerUnit', e.target.value)}
                    placeholder="Example: FPT Software / Information Technology Department"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isFutureEvent ? 'Expected participants' : 'Expected / Actual participants'} <span className="text-rose-500">*</span>
                  </label>
                  <div className={`grid gap-2 ${isFutureEvent ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <input
                      type="number"
                      value={act.targetParticipantCount}
                      onChange={(e) => updateActivityField(act.id, 'targetParticipantCount', Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="Expected"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                    {!isFutureEvent && <input
                      type="number"
                      value={act.participantCount}
                      onChange={(e) => updateActivityField(act.id, 'participantCount', Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="Actual"
                      className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Activity details / Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={act.description}
                    onChange={(e) => updateActivityField(act.id, 'description', e.target.value)}
                    placeholder={isFutureEvent ? 'Describe the planned event and how it will be organized...' : 'Describe how the activity was conducted...'}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isFutureEvent ? 'Expected outcome' : 'Outcome'} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={act.outcome}
                    onChange={(e) => updateActivityField(act.id, 'outcome', e.target.value)}
                    placeholder={isFutureEvent ? 'Describe the expected result of this event...' : 'Example: 85% of students mastered the material and 10 projects received awards...'}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                {!isFutureEvent && <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Actual cost (VND)
                  </label>
                  <input
                    type="number"
                    value={act.budgetSpent}
                    onChange={(e) => updateActivityField(act.id, 'budgetSpent', Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>}

                {!isFutureEvent && <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Evidence link (Image/Drive URL)
                  </label>
                  <input
                    type="url"
                    value={act.evidenceUrl}
                    onChange={(e) => updateActivityField(act.id, 'evidenceUrl', e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>}
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-4">
            <button
              onClick={handlePrevStep}
              className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 text-xs"
            >
              &larr; Back
            </button>
            <button
              onClick={handleNextStep}
              className="px-5 py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition-all text-xs"
            >
              Continue: STEP 3 (Summary) &rarr;
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: Summary & Future Plans */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
            <h2 className="text-lg font-bold font-orbitron text-cyan-400">STEP 3: SUMMARY AND PLAN</h2>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Activity summary for the period <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={executiveSummary}
                onChange={(e) => setExecutiveSummary(e.target.value)}
                placeholder="Summarize the club's main highlights during this period..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Key achievements <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="List awards, certifications, or outstanding results..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Challenges and outstanding issues
              </label>
              <textarea
                rows={3}
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
                placeholder="Describe issues involving venues, funding, staffing, or other resources..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Recommendations and support requests
              </label>
              <textarea
                rows={3}
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                placeholder="Request support from the university or Student Affairs Office..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Next-period plan
              </label>
              <textarea
                rows={3}
                value={nextPeriodPlan}
                onChange={(e) => setNextPeriodPlan(e.target.value)}
                placeholder="Outline goals and events planned for the next period..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-800">
              <button
                onClick={handlePrevStep}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 text-xs"
              >
                &larr; Back
              </button>
              <button
                onClick={handleNextStep}
                className="px-5 py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-lg hover:bg-cyan-400 transition-all text-xs"
              >
                Continue: STEP 4 (Preview) &rarr;
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* STEP 4: Preview & Submit */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="p-6 bg-slate-900/80 border border-cyan-500/30 rounded-xl space-y-6">
            <h2 className="text-lg font-bold font-orbitron text-cyan-400">STEP 4: PREVIEW AND SUBMIT REPORT</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <div>
                <p className="text-xs text-slate-400">Reporting period</p>
                <p className="font-semibold text-cyan-400">{period}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Report type</p>
                <p className="font-semibold text-slate-200">{reportType}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Deadline</p>
                <p className="font-semibold text-amber-400 font-mono">{currentDueDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Activities</p>
                <p className="font-semibold text-emerald-400">{totals.totalActivities} activities</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase text-cyan-400 tracking-wider">Activity summary</h4>
                <p className="text-slate-300 text-sm mt-1 bg-slate-950 p-3 rounded border border-slate-800 whitespace-pre-wrap">
                  {executiveSummary}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase text-cyan-400 tracking-wider">Key achievements</h4>
                <p className="text-slate-300 text-sm mt-1 bg-slate-950 p-3 rounded border border-slate-800 whitespace-pre-wrap">
                  {achievements}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-cyan-400 tracking-wider mb-2">Activity list ({activities.length})</h4>
                <div className="space-y-3">
                  {activities.map((act, idx) => (
                    <div key={act.id} className="p-3 bg-slate-950 rounded border border-slate-800 text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-slate-200">
                        <span>#{idx + 1}. {act.activityName}</span>
                        <span className="text-cyan-400">{act.activityDate}</span>
                      </div>
                      <p className="text-slate-400">{act.description}</p>
                      <div className="flex gap-4 text-slate-400 pt-1">
                        <span>{isFutureEvent ? 'Expected participants' : 'Participants'}: <strong className="text-emerald-400">{isFutureEvent ? act.targetParticipantCount : act.participantCount} people</strong></span>
                        {!isFutureEvent && <span>Cost: <strong className="text-amber-400">{act.budgetSpent.toLocaleString('en-US')} VND</strong></span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {isFutureEvent && <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-sm text-purple-100">Submitting this report sends a budget request notification to the club treasurer. The club owner will review the combined package after the treasurer completes it.</div>}

            <div className="flex justify-between pt-6 border-t border-slate-800">
              <button
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 text-xs"
              >
                &larr; Back to edit
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold rounded-lg border border-cyan-500/30 text-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save draft'}
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg shadow-lg shadow-cyan-500/20 text-xs"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit report now'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
