import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Award,
  BarChart3,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  Target,
  Users,
  XCircle,
} from 'lucide-react'
import { ROLES } from '../auth/permissions'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

const ADMIN_ROLES = new Set([ROLES.ADMIN, ROLES.STUDENT_AFFAIRS_ADMIN])

const RATING_STYLES = {
  Excellent: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
  Good: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
  Average: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
  'Needs Improvement': 'border-rose-400/30 bg-rose-400/10 text-rose-300',
}

const DEFAULT_RULES = [
  { code: 'APPROVED_REPORT', name: 'Approved report', points: 50, description: 'Each approved report' },
  { code: 'ACTIVITY', name: 'Activity', points: 5, description: 'Each activity in an approved report' },
  { code: 'PARTICIPATION', name: 'Participant', points: 0.1, description: 'Each participant in approved activities' },
  { code: 'REJECTED_REPORT', name: 'Rejected report', points: -10, description: 'Each rejected report' },
  { code: 'OVERDUE_REPORT', name: 'Overdue report', points: -20, description: 'Each overdue draft or rejected report' },
]

function formatPoints(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value) || 0)
}

function RatingBadge({ rating }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${RATING_STYLES[rating] || RATING_STYLES['Needs Improvement']}`}>
      {rating || 'Needs Improvement'}
    </span>
  )
}

function MetricCard({ icon: Icon, label, value, tone = 'cyan' }) {
  const tones = {
    cyan: 'border-cyan-400/20 bg-cyan-400/5 text-cyan-300',
    emerald: 'border-emerald-400/20 bg-emerald-400/5 text-emerald-300',
    purple: 'border-purple-400/20 bg-purple-400/5 text-purple-300',
    rose: 'border-rose-400/20 bg-rose-400/5 text-rose-300',
    amber: 'border-amber-400/20 bg-amber-400/5 text-amber-300',
  }

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <Icon size={18} />
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{formatPoints(value)}</p>
    </div>
  )
}

function ClubKpiDetail({ club }) {
  const score = Number(club?.points) || 0
  const nextTarget = score < 50 ? 50 : score < 200 ? 200 : score < 500 ? 500 : 500
  const progress = score >= 500 ? 100 : Math.min(100, (score / nextTarget) * 100)
  const nextLabel = score >= 500 ? 'Highest rating achieved' : `${formatPoints(nextTarget - score)} points to the next rating`

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[1.1fr_1.9fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 via-slate-900 to-purple-500/10 p-7"
        >
          <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />
          <p className="relative text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Club KPI score</p>
          <h2 className="relative mt-2 truncate text-xl font-bold text-white sm:text-2xl">{club.clubName}</h2>
          <div className="relative mt-7 flex items-end gap-3">
            <span className="text-6xl font-black leading-none text-white">{formatPoints(score)}</span>
            <span className="pb-1 text-sm uppercase tracking-widest text-slate-500">points</span>
          </div>
          <div className="relative mt-5"><RatingBadge rating={club.rating} /></div>
          <div className="relative mt-7">
            <div className="mb-2 flex justify-between gap-3 text-xs text-slate-400">
              <span>{nextLabel}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <MetricCard icon={CheckCircle2} label="Approved reports" value={club.approvedReports} tone="emerald" />
          <MetricCard icon={Activity} label="Activities" value={club.activities} tone="cyan" />
          <MetricCard icon={Users} label="Participants" value={club.participants} tone="purple" />
          <MetricCard icon={XCircle} label="Rejected reports" value={club.rejectedReports} tone="rose" />
          <MetricCard icon={Clock3} label="Overdue reports" value={club.overdueReports} tone="amber" />
          <MetricCard icon={Target} label="Penalty points" value={Number(club.rejectedReports || 0) * 10 + Number(club.overdueReports || 0) * 20} tone="rose" />
        </div>
      </section>
    </div>
  )
}

export default function KpiPage() {
  const { user } = useAuth()
  const isAdmin = user?.roles?.some(role => ADMIN_ROLES.has(role)) || false
  const [clubs, setClubs] = useState([])
  const [rules, setRules] = useState(DEFAULT_RULES)
  const [selectedClubId, setSelectedClubId] = useState('')
  const [periodInput, setPeriodInput] = useState('')
  const [period, setPeriod] = useState('')
  const [search, setSearch] = useState('')
  const [calculatedAt, setCalculatedAt] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadKpis = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const [leaderboard, ruleData] = await Promise.all([
        api.getKpiLeaderboard(period || undefined),
        api.getKpiRules(),
      ])
      const nextClubs = Array.isArray(leaderboard?.clubs) ? leaderboard.clubs : []
      setClubs(nextClubs)
      setRules(Array.isArray(ruleData) && ruleData.length > 0 ? ruleData : DEFAULT_RULES)
      setCalculatedAt(leaderboard?.calculatedAtUtc || null)
      setSelectedClubId(current => {
        if (nextClubs.some(club => String(club.clubId) === String(current))) return current
        return nextClubs[0] ? String(nextClubs[0].clubId) : ''
      })
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load KPI data.')
    } finally {
      setIsLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadKpis()
  }, [loadKpis])

  const selectedClub = clubs.find(club => String(club.clubId) === String(selectedClubId)) || clubs[0]
  const filteredClubs = useMemo(() => {
    const query = search.trim().toLowerCase()
    return query ? clubs.filter(club => club.clubName?.toLowerCase().includes(query)) : clubs
  }, [clubs, search])

  const overview = useMemo(() => ({
    total: clubs.length,
    excellent: clubs.filter(club => club.rating === 'Excellent').length,
    averageScore: clubs.length ? clubs.reduce((sum, club) => sum + Number(club.points || 0), 0) / clubs.length : 0,
    highest: clubs.length ? Math.max(...clubs.map(club => Number(club.points || 0))) : 0,
  }), [clubs])

  const applyPeriod = event => {
    event.preventDefault()
    setPeriod(periodInput.trim())
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-300"><BarChart3 size={18} /><span className="text-xs font-bold uppercase tracking-[0.24em]">Performance analytics</span></div>
            <h1 className="mt-3 text-3xl font-black text-white">CLUB KPI</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              {isAdmin ? 'Compare KPI results across every club.' : 'View the KPI result for clubs where you are an approved member.'}
            </p>
          </div>
          <form onSubmit={applyPeriod} className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <input
              value={periodInput}
              onChange={event => setPeriodInput(event.target.value)}
              placeholder="All periods"
              className="min-w-52 rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/60"
            />
            <button type="submit" className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300">Apply</button>
            <button type="button" onClick={loadKpis} aria-label="Refresh KPI" className="flex items-center justify-center rounded-xl border border-slate-700 px-4 py-3 text-slate-300 transition hover:border-cyan-400/50 hover:text-cyan-300">
              <RefreshCw size={17} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </form>
        </div>
        <p className="mt-5 text-xs text-slate-600">
          {period ? `Period: ${period}` : 'All-time calculation'}
          {calculatedAt ? ` · Updated ${new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(calculatedAt))}` : ''}
        </p>
      </section>

      {error && <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-300">{error}</div>}

      {isLoading && clubs.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/50"><div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" /></div>
      ) : clubs.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-20 text-center">
          <Award className="mx-auto text-slate-600" size={44} />
          <h2 className="mt-4 text-lg font-bold text-white">No KPI data available</h2>
          <p className="mt-2 text-sm text-slate-500">{isAdmin ? 'No clubs are available.' : 'You need an approved club membership to view a club KPI.'}</p>
        </div>
      ) : isAdmin ? (
        <>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard icon={BarChart3} label="All clubs" value={overview.total} tone="cyan" />
            <MetricCard icon={Award} label="Excellent clubs" value={overview.excellent} tone="emerald" />
            <MetricCard icon={Target} label="Average score" value={overview.averageScore} tone="purple" />
            <MetricCard icon={CheckCircle2} label="Highest score" value={overview.highest} tone="amber" />
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/55">
            <div className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-lg font-bold text-white">All club rankings</h2><p className="mt-1 text-xs text-slate-500">{filteredClubs.length} clubs shown</p></div>
              <label className="relative block sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
                <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search club..." className="w-full rounded-xl border border-slate-700 bg-slate-950/60 py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-cyan-400/50" />
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[920px] w-full text-left text-sm">
                <thead className="bg-slate-950/40 text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Rank</th><th className="px-5 py-4">Club</th><th className="px-5 py-4">Score</th><th className="px-5 py-4">Rating</th><th className="px-5 py-4">Approved</th><th className="px-5 py-4">Activities</th><th className="px-5 py-4">Participants</th><th className="px-5 py-4">Rejected</th><th className="px-5 py-4">Overdue</th></tr></thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredClubs.map(club => (
                    <tr key={club.clubId} className="transition hover:bg-cyan-400/[0.03]">
                      <td className="px-5 py-4 font-bold text-cyan-300">#{club.rank}</td>
                      <td className="px-5 py-4 font-semibold text-white">{club.clubName}</td>
                      <td className="px-5 py-4 text-lg font-black text-white">{formatPoints(club.points)}</td>
                      <td className="px-5 py-4"><RatingBadge rating={club.rating} /></td>
                      <td className="px-5 py-4 text-slate-300">{club.approvedReports}</td>
                      <td className="px-5 py-4 text-slate-300">{club.activities}</td>
                      <td className="px-5 py-4 text-slate-300">{club.participants}</td>
                      <td className="px-5 py-4 text-rose-300">{club.rejectedReports}</td>
                      <td className="px-5 py-4 text-amber-300">{club.overdueReports}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <>
          {clubs.length > 1 && (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <label htmlFor="kpi-club" className="text-sm font-semibold text-slate-300">Select club</label>
              <select id="kpi-club" value={selectedClubId} onChange={event => setSelectedClubId(event.target.value)} className="min-w-56 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50">
                {clubs.map(club => <option key={club.clubId} value={club.clubId}>{club.clubName}</option>)}
              </select>
            </div>
          )}
          <ClubKpiDetail club={selectedClub} />
        </>
      )}

      <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
        <div><h2 className="text-lg font-bold text-white">KPI calculation rules</h2><p className="mt-1 text-xs text-slate-500">Scores never fall below zero.</p></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {rules.map(rule => (
            <div key={rule.code} className="rounded-2xl border border-slate-800 bg-slate-950/45 p-4">
              <p className={`text-2xl font-black ${Number(rule.points) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{Number(rule.points) > 0 ? '+' : ''}{formatPoints(rule.points)}</p>
              <p className="mt-2 text-sm font-bold text-white">{rule.name}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{rule.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-center text-xs sm:grid-cols-4">
          {[['Excellent', '≥ 500'], ['Good', '≥ 200'], ['Average', '≥ 50'], ['Needs Improvement', '< 50']].map(([rating, range]) => (
            <div key={rating} className="rounded-xl border border-slate-800 p-3"><p className="font-bold text-white">{rating}</p><p className="mt-1 text-slate-500">{range} points</p></div>
          ))}
        </div>
      </section>
    </div>
  )
}
