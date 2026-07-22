import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Modal from '../components/Modal'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const emptyForm = {
  kind: 'ONE_TIME',
  clubId: '',
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  location: '',
  meetingDays: [],
}

const WEEK_DAYS = [
  [1, 'Mon'], [2, 'Tue'], [3, 'Wed'], [4, 'Thu'], [5, 'Fri'], [6, 'Sat'], [7, 'Sun'],
]

function MeetingDayPicker({ value, onChange }) {
  const toggle = day => onChange(value.includes(day) ? value.filter(item => item !== day) : [...value, day].sort())
  return <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">{WEEK_DAYS.map(([day, label]) => (
    <button key={day} type="button" onClick={() => toggle(day)} className={`rounded-lg border px-2 py-2.5 text-sm font-semibold transition ${value.includes(day) ? 'border-cyan-500 bg-cyan-500 text-white' : 'border-neutral-300 bg-white text-neutral-600 hover:border-cyan-400'}`}>{label}</button>
  ))}</div>
}

function formatMeetingDays(days = []) {
  return days.map(day => WEEK_DAYS.find(item => item[0] === day)?.[1]).filter(Boolean).join(', ')
}

function normalizeStatus(status) {
  return status?.toUpperCase() || 'PLANNED'
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function FormField({ label, children }) {
  return (
    <label className="block text-sm font-semibold text-neutral-700">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}

export default function ActivitiesPage() {
  const { user, clubAccess } = useAuth()
  const { success, error } = useToast()
  const managedClubs = clubAccess.filter(access => access.isManager)
  const accessByClub = useMemo(
    () => new Map(clubAccess.map(access => [access.clubId, access])),
    [clubAccess],
  )

  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [attendanceSummary, setAttendanceSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  const loadActivities = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await api.getActivities()
      setActivities(Array.isArray(result) ? result : [])
    } catch (err) {
      error(err.message || 'Unable to load activities.')
    } finally {
      setIsLoading(false)
    }
  }, [error])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  useEffect(() => {
    if (!selectedActivity?.meetingDays?.length) {
      setAttendanceSummary(null)
      return
    }
    setSummaryLoading(true)
    api.getMyActivityAttendance(selectedActivity.id)
      .then(setAttendanceSummary)
      .catch(err => error(err.message || 'Unable to load attendance history.'))
      .finally(() => setSummaryLoading(false))
  }, [selectedActivity, error])

  const filteredActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return activities.filter(activity => {
      const matchesQuery = !query
        || activity.title.toLowerCase().includes(query)
        || activity.clubName.toLowerCase().includes(query)
        || activity.location.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'ALL' || normalizeStatus(activity.status) === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [activities, searchQuery, statusFilter])

  const registerForActivity = async (activity) => {
    if (busyId) return
    setBusyId(activity.id)
    try {
      const updated = await api.registerParticipant(activity.id, null, user?.name)
      setActivities(current => current.map(item => item.id === activity.id ? updated : item))
      success('Activity registration completed.')
    } catch (err) {
      error(err.message || 'Unable to register for this activity.')
    } finally {
      setBusyId(null)
    }
  }

  const completeActivity = async (activity) => {
    if (busyId) return
    setBusyId(activity.id)
    try {
      const updated = await api.completeActivity(activity.id)
      setActivities(current => current.map(item => item.id === activity.id ? updated : item))
      setSelectedActivity(updated)
      success('Activity marked as completed.')
    } catch (err) {
      error(err.message || 'Unable to complete this activity.')
    } finally {
      setBusyId(null)
    }
  }

  const checkIn = async activity => {
    if (busyId) return
    setBusyId(`check-in-${activity.id}`)
    try {
      const updated = await api.checkInActivity(activity.id)
      setActivities(current => current.map(item => item.id === activity.id ? updated : item))
      setSelectedActivity(updated)
      const summary = await api.getMyActivityAttendance(activity.id)
      setAttendanceSummary(summary)
      success('Attendance recorded for today (Vietnam time).')
    } catch (err) {
      error(err.message || 'Attendance is not available today.')
    } finally {
      setBusyId(null)
    }
  }

  const saveSchedule = async event => {
    event.preventDefault()
    if (!editingSchedule || busyId) return
    if (!editingSchedule.meetingDays.length) {
      error('Select at least one day from Monday to Sunday.')
      return
    }
    setBusyId(`schedule-${editingSchedule.id}`)
    try {
      const updated = await api.updateActivity(editingSchedule.id, {
        title: editingSchedule.title,
        description: editingSchedule.description || '',
        startTimeUtc: editingSchedule.startTimeUtc,
        endTimeUtc: editingSchedule.endTimeUtc,
        location: editingSchedule.location,
        status: editingSchedule.status,
        meetingDays: editingSchedule.meetingDays,
      })
      setActivities(current => current.map(item => item.id === updated.id ? updated : item))
      setSelectedActivity(updated)
      setEditingSchedule(null)
      success('Weekly meeting schedule updated.')
    } catch (err) {
      error(err.message || 'Unable to update the weekly schedule.')
    } finally {
      setBusyId(null)
    }
  }

  const createActivity = async (event) => {
    event.preventDefault()
    if (busyId) return
    const club = managedClubs.find(item => item.clubId === Number(formData.clubId))
    const isWeekly = formData.kind === 'WEEKLY'
    if (!club || !formData.title.trim() || !formData.location.trim()
      || (isWeekly ? formData.meetingDays.length === 0 : (!formData.startTime || !formData.endTime))) {
      error('Please provide the club, title, schedule, and location.')
      return
    }
    if (!isWeekly && new Date(formData.endTime) <= new Date(formData.startTime)) {
      error('The end time must be later than the start time.')
      return
    }

    setBusyId('create')
    try {
      const created = await api.createActivity({
        clubId: club.clubId,
        clubName: club.clubName,
        title: formData.title.trim(),
        description: formData.description.trim(),
        startTimeUtc: isWeekly ? null : new Date(formData.startTime).toISOString(),
        endTimeUtc: isWeekly ? null : new Date(formData.endTime).toISOString(),
        location: formData.location.trim(),
        meetingDays: isWeekly ? formData.meetingDays : [],
      })
      setActivities(current => [...current, created].sort((a, b) => new Date(a.startTimeUtc) - new Date(b.startTimeUtc)))
      setShowCreate(false)
      setFormData(emptyForm)
      success(isWeekly ? 'Weekly meeting schedule created.' : 'Activity created successfully.')
    } catch (err) {
      error(err.message || 'Unable to create the activity.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Club Activities</h2>
          <p className="mt-1 text-sm text-gray-400">Only activities from clubs you can access are displayed.</p>
        </div>
        {managedClubs.length > 0 && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-5 py-3 font-semibold text-white"
          >
            Create activity or schedule
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Total activities', activities.length, 'text-cyan-300'],
          ['Upcoming', activities.filter(item => normalizeStatus(item.status) !== 'COMPLETED' && new Date(item.startTimeUtc) > new Date()).length, 'text-purple-300'],
          ['Completed', activities.filter(item => normalizeStatus(item.status) === 'COMPLETED').length, 'text-emerald-300'],
          ['Weekly schedules', activities.filter(item => item.meetingDays?.length).length, 'text-amber-300'],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          aria-label="Search activities"
          value={searchQuery}
          onChange={event => setSearchQuery(event.target.value)}
          placeholder="Search activities, clubs, or locations..."
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
        />
        <select
          aria-label="Filter activities by status"
          value={statusFilter}
          onChange={event => setStatusFilter(event.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none"
        >
          <option value="ALL">All statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 py-16 text-center text-gray-500">
          No activities are available for your current access.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredActivities.map((activity, index) => {
            const status = normalizeStatus(activity.status)
            const access = accessByClub.get(activity.clubId)
            const registered = activity.participants?.some(participant => participant.userId === user?.id)
            const canParticipate = Boolean(access?.isApprovedMember || access?.isManager || access?.isTreasurer)
            const isWeekly = Boolean(activity.meetingDays?.length)

            return (
              <motion.article
                key={activity.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.035 }}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                    {activity.clubName} · {isWeekly ? 'Weekly meeting' : 'Activity'}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    status === 'COMPLETED' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-purple-500/15 text-purple-300'
                  }`}>
                    {activity.status}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{activity.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-400">{activity.description || 'No description provided.'}</p>
                <dl className="mt-4 space-y-2 border-t border-slate-800 pt-4 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-gray-500">{isWeekly ? 'Meeting days' : 'Starts'}</dt><dd className="text-right text-gray-200">{isWeekly ? formatMeetingDays(activity.meetingDays) : formatDate(activity.startTimeUtc)}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-gray-500">Location</dt><dd className="text-right text-gray-200">{activity.location}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-gray-500">Registrations</dt><dd className="font-semibold text-white">{activity.participants?.length || 0}</dd></div>
                </dl>
                <div className="mt-auto flex gap-2 pt-5">
                  <button
                    type="button"
                    onClick={() => setSelectedActivity(activity)}
                    className="flex-1 rounded-xl border border-slate-700 px-3 py-2.5 text-sm font-semibold text-gray-300"
                  >
                    Details
                  </button>
                  {isWeekly && status !== 'COMPLETED' && canParticipate ? (
                    <button
                      type="button"
                      onClick={() => checkIn(activity)}
                      disabled={busyId === `check-in-${activity.id}`}
                      className="flex-1 rounded-xl bg-emerald-500/15 px-3 py-2.5 text-sm font-semibold text-emerald-300 disabled:opacity-45"
                    >
                      {busyId === `check-in-${activity.id}` ? 'Checking in...' : 'Check in today'}
                    </button>
                  ) : status !== 'COMPLETED' && canParticipate && (
                    <button
                      type="button"
                      onClick={() => registerForActivity(activity)}
                      disabled={registered || busyId === activity.id}
                      className="flex-1 rounded-xl bg-cyan-500/15 px-3 py-2.5 text-sm font-semibold text-cyan-300 disabled:opacity-45"
                    >
                      {registered ? 'Registered' : busyId === activity.id ? 'Processing...' : 'Join'}
                    </button>
                  )}
                </div>
              </motion.article>
            )
          })}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Activity or Weekly Schedule" size="lg">
        <form onSubmit={createActivity} className="space-y-4">
          <FormField label="Type *">
            <select value={formData.kind} onChange={event => setFormData(current => ({ ...current, kind: event.target.value }))} className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900">
              <option value="ONE_TIME">One-time activity</option>
              <option value="WEEKLY">Weekly club meeting</option>
            </select>
          </FormField>
          <FormField label="Club *">
            <select
              value={formData.clubId}
              onChange={event => setFormData(current => ({ ...current, clubId: event.target.value }))}
              required
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900"
            >
              <option value="">Select a club you manage</option>
              {managedClubs.map(club => <option key={club.clubId} value={club.clubId}>{club.clubName}</option>)}
            </select>
          </FormField>
          <FormField label="Activity name *">
            <input
              value={formData.title}
              onChange={event => setFormData(current => ({ ...current, title: event.target.value }))}
              required
              maxLength={200}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900"
            />
          </FormField>
          <FormField label="Description">
            <textarea
              value={formData.description}
              onChange={event => setFormData(current => ({ ...current, description: event.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900"
            />
          </FormField>
          {formData.kind === 'WEEKLY' ? (
            <FormField label="Weekly meeting days (Vietnam time) *">
              <MeetingDayPicker value={formData.meetingDays} onChange={meetingDays => setFormData(current => ({ ...current, meetingDays }))} />
              <span className="mt-2 block text-xs font-normal text-neutral-500">Members can check in once on each selected weekday.</span>
            </FormField>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-neutral-700">Start time
                <input type="datetime-local" value={formData.startTime} onChange={event => setFormData(current => ({ ...current, startTime: event.target.value }))} required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
              </label>
              <label className="text-sm font-semibold text-neutral-700">End time
                <input type="datetime-local" value={formData.endTime} onChange={event => setFormData(current => ({ ...current, endTime: event.target.value }))} required className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900" />
              </label>
            </div>
          )}
          <FormField label="Location *">
            <input
              value={formData.location}
              onChange={event => setFormData(current => ({ ...current, location: event.target.value }))}
              required
              maxLength={200}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-neutral-900"
            />
          </FormField>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Cancel</button>
            <button type="submit" disabled={busyId === 'create'} className="flex-1 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white disabled:opacity-50">
              {busyId === 'create' ? 'Creating...' : formData.kind === 'WEEKLY' ? 'Create schedule' : 'Create activity'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(selectedActivity)} onClose={() => setSelectedActivity(null)} title={selectedActivity?.title || 'Activity Details'} size="lg">
        {selectedActivity && (
          <div className="space-y-4 text-neutral-700">
            <p>{selectedActivity.description || 'No description provided.'}</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-neutral-50 p-3"><dt className="text-xs text-neutral-500">Club</dt><dd className="mt-1 font-semibold">{selectedActivity.clubName}</dd></div>
              <div className="rounded-lg bg-neutral-50 p-3"><dt className="text-xs text-neutral-500">Location</dt><dd className="mt-1 font-semibold">{selectedActivity.location}</dd></div>
              {selectedActivity.meetingDays?.length ? (
                <div className="rounded-lg bg-neutral-50 p-3 sm:col-span-2"><dt className="text-xs text-neutral-500">Weekly meeting days · Vietnam time</dt><dd className="mt-1 font-semibold">{formatMeetingDays(selectedActivity.meetingDays)}</dd></div>
              ) : <>
                <div className="rounded-lg bg-neutral-50 p-3"><dt className="text-xs text-neutral-500">Starts</dt><dd className="mt-1 font-semibold">{formatDate(selectedActivity.startTimeUtc)}</dd></div>
                <div className="rounded-lg bg-neutral-50 p-3"><dt className="text-xs text-neutral-500">Ends</dt><dd className="mt-1 font-semibold">{formatDate(selectedActivity.endTimeUtc)}</dd></div>
              </>}
            </dl>
            {selectedActivity.meetingDays?.length && (
              <section className="space-y-3 rounded-xl border border-neutral-200 p-4">
                <div className="flex items-center justify-between"><h3 className="font-bold">My attendance</h3>{summaryLoading && <span className="text-xs text-neutral-500">Loading...</span>}</div>
                {attendanceSummary && <>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-cyan-50 p-3"><p className="text-xl font-bold text-cyan-700">{attendanceSummary.scheduledDays}</p><p className="text-xs text-neutral-500">Scheduled</p></div>
                    <div className="rounded-lg bg-emerald-50 p-3"><p className="text-xl font-bold text-emerald-700">{attendanceSummary.attendedDays}</p><p className="text-xs text-neutral-500">Attended</p></div>
                    <div className="rounded-lg bg-purple-50 p-3"><p className="text-xl font-bold text-purple-700">{Number(attendanceSummary.attendanceRate).toFixed(2)}%</p><p className="text-xs text-neutral-500">Rate</p></div>
                  </div>
                  <p className={`rounded-lg p-3 text-sm font-semibold ${attendanceSummary.canCheckInToday ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>
                    {attendanceSummary.alreadyCheckedInToday ? 'You have already checked in today.' : attendanceSummary.isScheduledToday ? 'Attendance is open today.' : 'Today is not a scheduled meeting day.'}
                  </p>
                  <div className="max-h-48 divide-y divide-neutral-200 overflow-y-auto rounded-lg border border-neutral-200">
                    {attendanceSummary.history.length ? attendanceSummary.history.map(item => <div key={item.id} className="flex items-center justify-between p-3 text-sm"><span>{new Date(`${item.attendanceDate}T00:00:00`).toLocaleDateString('en-US')}</span><span className="font-semibold text-emerald-700">{item.status}</span></div>) : <p className="p-4 text-center text-sm text-neutral-500">No attendance history yet.</p>}
                  </div>
                  <button type="button" onClick={() => checkIn(selectedActivity)} disabled={!attendanceSummary.canCheckInToday || busyId === `check-in-${selectedActivity.id}`} className="w-full rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white disabled:opacity-40">
                    {busyId === `check-in-${selectedActivity.id}` ? 'Checking in...' : attendanceSummary.alreadyCheckedInToday ? 'Already checked in' : 'Check in today'}
                  </button>
                </>}
              </section>
            )}
            {accessByClub.get(selectedActivity.clubId)?.isManager && selectedActivity.meetingDays?.length > 0 && (
              <button type="button" onClick={() => { setEditingSchedule({ ...selectedActivity, meetingDays: [...selectedActivity.meetingDays] }); setSelectedActivity(null) }} className="w-full rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white">Edit weekly schedule</button>
            )}
            {accessByClub.get(selectedActivity.clubId)?.isManager && normalizeStatus(selectedActivity.status) !== 'COMPLETED' && (
              <button
                type="button"
                onClick={() => completeActivity(selectedActivity)}
                disabled={busyId === selectedActivity.id}
                className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
              >
                {busyId === selectedActivity.id ? 'Processing...' : 'Mark as completed'}
              </button>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={Boolean(editingSchedule)} onClose={() => setEditingSchedule(null)} title="Edit Weekly Meeting Schedule" size="lg">
        {editingSchedule && <form onSubmit={saveSchedule} className="space-y-5">
          <div><p className="font-semibold text-neutral-900">{editingSchedule.title}</p><p className="text-sm text-neutral-500">Select every weekday when members are allowed to check in.</p></div>
          <MeetingDayPicker value={editingSchedule.meetingDays} onChange={meetingDays => setEditingSchedule(current => ({ ...current, meetingDays }))} />
          <div className="flex gap-3"><button type="button" onClick={() => setEditingSchedule(null)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Cancel</button><button type="submit" disabled={busyId === `schedule-${editingSchedule.id}`} className="flex-1 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{busyId === `schedule-${editingSchedule.id}` ? 'Saving...' : 'Save schedule'}</button></div>
        </form>}
      </Modal>
    </div>
  )
}
