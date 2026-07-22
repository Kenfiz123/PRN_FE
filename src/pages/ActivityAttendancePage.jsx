import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'

const STATUSES = ['NotMarked', 'Present', 'Absent', 'Excused', 'Late']
const STATUS_STYLE = { NotMarked: 'text-gray-300', Present: 'text-emerald-300', Absent: 'text-rose-300', Excused: 'text-amber-300', Late: 'text-purple-300' }
const formatDate = value => new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

export default function ActivityAttendancePage() {
  const { clubId } = useParams()
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [club, setClub] = useState(null)
  const [activities, setActivities] = useState([])
  const [activityId, setActivityId] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([api.getClub(clubId), api.getActivities(clubId)])
      .then(([clubResult, activityResult]) => {
        const rows = Array.isArray(activityResult) ? activityResult : []
        setClub(clubResult); setActivities(rows)
        if (rows.length) setActivityId(String(rows[0].id))
      })
      .catch(err => { error(err.message || 'Unable to load club activities.'); if (err.status === 403) navigate('/clubs') })
  }, [clubId, error, navigate])

  const loadAttendance = useCallback(async () => {
    if (!activityId) { setLoading(false); setData(null); return }
    setLoading(true)
    try {
      const result = await api.getActivityAttendance(clubId, activityId, { search, page, pageSize: 20 })
      setData(result)
      setDrafts(Object.fromEntries(result.items.map(item => [item.memberId, { status: item.status, note: item.note || '' }])))
    } catch (err) {
      error(err.message || 'Unable to load attendance roster.')
    } finally {
      setLoading(false)
    }
  }, [activityId, clubId, error, page, search])

  useEffect(() => { const timer = setTimeout(loadAttendance, search ? 250 : 0); return () => clearTimeout(timer) }, [loadAttendance, search])

  const selectedActivity = useMemo(() => activities.find(item => item.id === Number(activityId)), [activities, activityId])
  const setDraft = (memberId, patch) => setDrafts(current => ({ ...current, [memberId]: { ...current[memberId], ...patch } }))
  const markVisiblePresent = () => setDrafts(current => ({ ...current, ...Object.fromEntries((data?.items || []).map(item => [item.memberId, { ...current[item.memberId], status: 'Present' }])) }))

  const save = async () => {
    if (!data?.items.length || saving) return
    setSaving(true)
    try {
      await api.bulkUpdateActivityAttendance(clubId, activityId, data.items.map(item => ({ memberId: item.memberId, status: drafts[item.memberId]?.status || 'NotMarked', note: drafts[item.memberId]?.note || null })))
      success(`Attendance saved for ${data.items.length} members.`)
      await loadAttendance()
    } catch (err) {
      error(err.message || 'Attendance was not saved. No partial changes were applied.')
    } finally {
      setSaving(false)
    }
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><button type="button" onClick={() => navigate(`/clubs/${clubId}/members`)} className="mb-3 text-sm font-semibold text-cyan-400">← Member management</button><h2 className="text-2xl font-bold text-white">{club?.name || 'Club'} Attendance</h2><p className="mt-1 text-sm text-gray-400">Select an activity, mark eligible members, then save the roster in one transaction.</p></div>{selectedActivity && <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-right"><p className="font-semibold text-white">{selectedActivity.title}</p><p className="text-xs text-gray-500">{formatDate(selectedActivity.startTimeUtc)}</p></div>}</div>

    <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 lg:grid-cols-[2fr_2fr_auto]">
      <select value={activityId} onChange={event => { setActivityId(event.target.value); setPage(1) }} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"><option value="">Select an activity</option>{activities.map(item => <option key={item.id} value={item.id}>{item.title} — {formatDate(item.startTimeUtc)}</option>)}</select>
      <input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder="Search eligible members..." className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500" />
      <button type="button" onClick={markVisiblePresent} disabled={!data?.items.length} className="rounded-xl bg-emerald-500/15 px-5 py-3 font-semibold text-emerald-300 disabled:opacity-40">Mark visible as present</button>
    </div>

    {data && <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{[['Present', data.presentCount], ['Absent', data.absentCount], ['Excused', data.excusedCount], ['Late', data.lateCount], ['Not marked', data.notMarkedCount]].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"><p className="text-2xl font-bold text-white">{value}</p><p className="text-xs uppercase tracking-wider text-gray-500">{label}</p></div>)}</div>}

    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
      {loading ? <div className="flex min-h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" /></div> : !activityId ? <div className="py-16 text-center text-gray-500">Select an activity to prepare its attendance roster.</div> : !data?.items.length ? <div className="py-16 text-center text-gray-500">No eligible members. Members must have joined on or before the activity start.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left text-sm"><thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase text-gray-500"><tr><th className="px-5 py-4">Member</th><th className="px-5 py-4">Position</th><th className="px-5 py-4">Joined</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Note</th></tr></thead><tbody className="divide-y divide-slate-800">{data.items.map(member => <tr key={member.memberId}><td className="px-5 py-4"><p className="font-semibold text-white">{member.fullName}</p><p className="text-xs text-gray-500">{member.email}</p></td><td className="px-5 py-4 text-gray-300">{member.role}</td><td className="px-5 py-4 text-gray-300">{new Date(member.joinedAtUtc).toLocaleDateString('en-US')}</td><td className="px-5 py-4"><select value={drafts[member.memberId]?.status || member.status} onChange={event => setDraft(member.memberId, { status: event.target.value })} className={`rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-semibold ${STATUS_STYLE[drafts[member.memberId]?.status || member.status]}`}>{STATUSES.map(status => <option key={status}>{status}</option>)}</select></td><td className="px-5 py-4"><input maxLength={1000} value={drafts[member.memberId]?.note || ''} onChange={event => setDraft(member.memberId, { note: event.target.value })} placeholder="Optional note" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /></td></tr>)}</tbody></table></div>}
      {data && <div className="flex flex-col gap-3 border-t border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-sm text-gray-400"><button disabled={page <= 1} onClick={() => setPage(value => value - 1)} className="rounded-lg border border-slate-700 px-3 py-2 disabled:opacity-30">Previous</button><span>Page {page} of {Math.max(data.totalPages || 1, 1)}</span><button disabled={page >= data.totalPages} onClick={() => setPage(value => value + 1)} className="rounded-lg border border-slate-700 px-3 py-2 disabled:opacity-30">Next</button></div><button type="button" onClick={save} disabled={saving || !data.items.length || data.activityStatus === 'Cancelled'} className="rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white disabled:opacity-40">{saving ? 'Saving...' : 'Save visible attendance'}</button></div>}
    </div>
  </div>
}
