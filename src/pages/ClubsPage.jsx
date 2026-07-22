import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { PERMISSIONS } from '../auth/permissions'
import { api } from '../services/api'

const CATEGORY_LABELS = {
  SPORTS: 'Sports',
  ARTS: 'Arts',
  ACADEMIC: 'Academic',
  VOLUNTEER: 'Volunteer',
  TECHNOLOGY: 'Technology',
  OTHER: 'Other',
}

const CATEGORY_FIELDS = {
  SPORTS: [
    ['sport', 'Sport'],
    ['level', 'Skill level'],
    ['experience', 'Experience'],
  ],
  ARTS: [
    ['artField', 'Art discipline'],
    ['level', 'Skill level'],
  ],
  ACADEMIC: [
    ['academicInterest', 'Academic field of interest'],
    ['learningGoal', 'Learning goal'],
  ],
  VOLUNTEER: [
    ['volunteerInterest', 'Area of interest'],
    ['socialWorkExperience', 'Community service experience'],
  ],
  TECHNOLOGY: [
    ['programmingLanguages', 'Programming languages'],
    ['projects', 'Previous projects'],
  ],
  OTHER: [['other', 'Additional information']],
}

const GENDER_LABELS = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
}

const VENUE_SUPPORT_LABELS = {
  SUPPORT_NEEDED: 'Support needed',
  SELF_MANAGED: 'Self-managed',
}

const FUNDING_SUPPORT_LABELS = {
  SUPPORT_NEEDED: 'Support needed',
  SELF_FUNDED: 'Self-funded',
  COMBINED: 'Combined',
}

const ACTIVITY_FREQUENCY_UNITS = {
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
}

const STATUS_STYLES = {
  PENDING: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
  SUBMITTED: 'border-amber-500/30 bg-amber-500/15 text-amber-300',
  NEEDSREVISION: 'border-orange-500/30 bg-orange-500/15 text-orange-300',
  APPROVED: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300',
  REJECTED: 'border-rose-500/30 bg-rose-500/15 text-rose-300',
}

const STATUS_LABELS = {
  PENDING: 'Pending review',
  SUBMITTED: 'Submitted',
  NEEDSREVISION: 'Needs revision',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
}

const inputClass = 'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100'
const labelClass = 'mb-1.5 block text-sm font-semibold text-neutral-700'

function normalizedStatus(value) {
  return value?.replace(/[^a-z]/gi, '').toUpperCase() || ''
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function getAdditionalFieldLabel(category, key) {
  return (CATEGORY_FIELDS[category] || CATEGORY_FIELDS.OTHER)
    .find(([fieldKey]) => fieldKey === key)?.[1] || key
}

function parseActivityFrequency(value) {
  const text = value?.trim() || ''
  const count = text.match(/\d+/)?.[0] || ''
  const unit = /year|n\u0103m/i.test(text) ? 'YEAR' : /week|tu\u1EA7n/i.test(text) ? 'WEEK' : 'MONTH'
  return { count, unit }
}

function formatActivityFrequency(count, unit) {
  return `${Number(count)} times per ${ACTIVITY_FREQUENCY_UNITS[unit] || ACTIVITY_FREQUENCY_UNITS.MONTH}`
}

function createJoinForm(user) {
  return {
    fullName: user?.name || '',
    dateOfBirth: '',
    gender: '',
    email: user?.email || '',
    phoneNumber: '',
    address: '',
    hobbies: '',
    skills: '',
    reason: '',
    expectations: '',
    contributions: '',
    additionalInfo: {},
    acceptedClubRules: false,
    committedToParticipate: false,
    message: '',
  }
}

function createClubForm(user) {
  return {
    code: '',
    name: '',
    category: 'ACADEMIC',
    purpose: '',
    description: '',
    logoUrl: '',
    founderFullName: user?.name || '',
    founderRole: 'Club President',
    founderEmail: user?.email || '',
    founderPhone: '',
    founderOrganization: '',
    foundingMemberCount: 1,
    foundingMembers: [{
      fullName: user?.name || '',
      organization: '',
      email: user?.email || '',
    }],
    foundingMembersCommitted: false,
    mainActivities: '',
    activityFrequencyCount: '',
    activityFrequencyUnit: 'MONTH',
    expectedLocation: '',
    expectedSchedule: '',
    majorEvents: '',
    venueSupport: 'SELF_MANAGED',
    fundingSupport: 'SELF_FUNDED',
    equipmentNeeds: '',
    advisorNeeded: false,
    committedToRules: false,
    committedToResponsibility: false,
    committedToReporting: false,
  }
}

function applicationToForm(application) {
  const activityFrequency = parseActivityFrequency(application.activityFrequency)
  return {
    code: application.code || '',
    name: application.name || '',
    category: application.category || 'OTHER',
    purpose: application.purpose || '',
    description: application.description || '',
    logoUrl: application.logoUrl || '',
    founderFullName: application.requesterName || '',
    founderRole: application.founderRole || '',
    founderEmail: application.contactEmail || '',
    founderPhone: application.contactPhone || '',
    founderOrganization: application.founderOrganization || '',
    foundingMemberCount: application.foundingMemberCount || 1,
    foundingMembers: application.foundingMembers?.length
      ? application.foundingMembers
      : [{ fullName: '', organization: '', email: '' }],
    foundingMembersCommitted: Boolean(application.foundingMembersCommitted),
    mainActivities: application.mainActivities || '',
    activityFrequencyCount: activityFrequency.count,
    activityFrequencyUnit: activityFrequency.unit,
    expectedLocation: application.expectedLocation || '',
    expectedSchedule: application.expectedSchedule || '',
    majorEvents: application.majorEvents || '',
    venueSupport: application.venueSupport || 'SELF_MANAGED',
    fundingSupport: application.fundingSupport || 'SELF_FUNDED',
    equipmentNeeds: application.equipmentNeeds || '',
    advisorNeeded: Boolean(application.advisorNeeded),
    committedToRules: Boolean(application.committedToRules),
    committedToResponsibility: Boolean(application.committedToResponsibility),
    committedToReporting: Boolean(application.committedToReporting),
  }
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}{required ? ' *' : ''}</span>
      {children}
    </label>
  )
}

function TextInput({ value, onChange, required, type = 'text', maxLength, placeholder, ariaLabel }) {
  return (
    <input
      type={type}
      value={value}
      onChange={event => onChange(event.target.value)}
      required={required}
      maxLength={maxLength}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className={inputClass}
    />
  )
}

function TextArea({ value, onChange, required, rows = 3, maxLength = 1000, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={event => onChange(event.target.value)}
      required={required}
      rows={rows}
      maxLength={maxLength}
      placeholder={placeholder}
      className={inputClass}
    />
  )
}

function Checkbox({ checked, onChange, children, required = false }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={event => onChange(event.target.checked)}
        required={required}
        className="mt-0.5 h-4 w-4 accent-cyan-600"
      />
      <span>{children}</span>
    </label>
  )
}

function SectionTitle({ number, title, description }) {
  return (
    <div className="border-b border-neutral-200 pb-2">
      <h3 className="font-bold text-neutral-900">{number}. {title}</h3>
      {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
    </div>
  )
}

function StatusBadge({ status }) {
  const normalized = normalizedStatus(status)
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[normalized] || STATUS_STYLES.SUBMITTED}`}>
      {STATUS_LABELS[normalized] || status}
    </span>
  )
}

function Detail({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-neutral-800">{String(value)}</dd>
    </div>
  )
}

export default function ClubsPage() {
  const { success, error } = useToast()
  const {
    user,
    clubAccess,
    hasPermission,
    refreshClubAccess,
  } = useAuth()

  const canJoinClub = hasPermission(PERMISSIONS.JOIN_CLUB)
  const canApplyForClub = hasPermission(PERMISSIONS.APPLY_FOR_CLUB)
  const canReviewApplications = hasPermission(PERMISSIONS.REVIEW_CLUB_APPLICATIONS)
  const canDeleteClubs = hasPermission(PERMISSIONS.MANAGE_CLUB_GOVERNANCE)
  const managedClubIds = useMemo(
    () => new Set(clubAccess.filter(access => access.isManager).map(access => access.clubId)),
    [clubAccess],
  )

  const [clubs, setClubs] = useState([])
  const [memberships, setMemberships] = useState([])
  const [pendingMemberReviews, setPendingMemberReviews] = useState([])
  const [myApplications, setMyApplications] = useState([])
  const [clubApplications, setClubApplications] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [clubToDelete, setClubToDelete] = useState(null)

  const [selectedClub, setSelectedClub] = useState(null)
  const [joinForm, setJoinForm] = useState(() => createJoinForm(user))
  const [membershipReview, setMembershipReview] = useState(null)
  const [membershipReviewAction, setMembershipReviewAction] = useState('approve')
  const [membershipReviewNote, setMembershipReviewNote] = useState('')

  const [creationModalOpen, setCreationModalOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState(null)
  const [clubForm, setClubForm] = useState(() => createClubForm(user))
  const [applicationReview, setApplicationReview] = useState(null)
  const [applicationReviewAction, setApplicationReviewAction] = useState('approve')
  const [applicationReviewForm, setApplicationReviewForm] = useState({
    note: '',
    conditions: '',
    reviewerSignature: '',
  })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [clubResult, membershipResult, myApplicationResult, applicationResult] = await Promise.all([
        api.getClubs(),
        canJoinClub ? api.getMyMemberships() : Promise.resolve([]),
        canApplyForClub ? api.getMyClubApplications() : Promise.resolve([]),
        canReviewApplications ? api.getClubApplications() : Promise.resolve([]),
      ])

      setClubs(Array.isArray(clubResult) ? clubResult : [])
      setMemberships(Array.isArray(membershipResult) ? membershipResult : [])
      setMyApplications(Array.isArray(myApplicationResult) ? myApplicationResult : [])
      setClubApplications(Array.isArray(applicationResult) ? applicationResult : [])

      if (managedClubIds.size > 0) {
        const reviewLists = await Promise.all(
          [...managedClubIds].map(clubId => api.getClubMemberships(clubId)),
        )
        setPendingMemberReviews(
          reviewLists
            .flat()
            .filter(item => normalizedStatus(item.status) === 'PENDING')
            .sort((a, b) => new Date(a.requestedAtUtc) - new Date(b.requestedAtUtc)),
        )
      } else {
        setPendingMemberReviews([])
      }
    } catch (err) {
      error(err.message || 'Unable to load club data.')
    } finally {
      setIsLoading(false)
    }
  }, [
    canApplyForClub,
    canJoinClub,
    canReviewApplications,
    error,
    managedClubIds,
  ])

  useEffect(() => {
    loadData()
  }, [loadData])

  const membershipByClub = useMemo(
    () => new Map(memberships.map(item => [item.clubId, item])),
    [memberships],
  )

  const filteredClubs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return clubs
    return clubs.filter(club =>
      [club.name, club.code, club.description, CATEGORY_LABELS[club.category]]
        .some(value => value?.toLowerCase().includes(query)),
    )
  }, [clubs, searchQuery])

  const pendingClubApplications = clubApplications.filter(
    item => normalizedStatus(item.status) === 'SUBMITTED',
  )

  const openJoinForm = club => {
    setSelectedClub(club)
    setJoinForm(createJoinForm(user))
  }

  const closeJoinForm = () => {
    if (isSubmitting) return
    setSelectedClub(null)
  }

  const updateJoinField = (field, value) => {
    setJoinForm(current => ({ ...current, [field]: value }))
  }

  const submitJoinRequest = async event => {
    event.preventDefault()
    if (!selectedClub || isSubmitting) return
    if (!joinForm.acceptedClubRules || !joinForm.committedToParticipate) {
      error('You must accept both participation commitments.')
      return
    }

    setIsSubmitting(true)
    try {
      await api.joinClub(selectedClub.id, {
        ...joinForm,
        address: joinForm.address.trim() || null,
        hobbies: joinForm.hobbies.trim() || null,
        skills: joinForm.skills.trim() || null,
        expectations: joinForm.expectations.trim() || null,
        contributions: joinForm.contributions.trim() || null,
        message: joinForm.message.trim() || null,
      })
      success(`Your application to join ${selectedClub.name} has been submitted for club manager review.`)
      setSelectedClub(null)
      await loadData()
    } catch (err) {
      error(err.message || 'Unable to submit the club membership application.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitMembershipReview = async event => {
    event.preventDefault()
    if (!membershipReview || isSubmitting) return
    setIsSubmitting(true)
    try {
      if (membershipReviewAction === 'approve') {
        await api.approveClubMembership(membershipReview.id, membershipReviewNote.trim())
        success(`${membershipReview.fullName} has been approved to join ${membershipReview.clubName}.`)
      } else {
        await api.rejectClubMembership(membershipReview.id, membershipReviewNote.trim())
        success(`${membershipReview.fullName}'s application has been rejected.`)
      }
      setMembershipReview(null)
      await Promise.all([loadData(), refreshClubAccess?.()])
    } catch (err) {
      error(err.message || 'Unable to review the membership application.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openMembershipReview = (membership, action = 'approve') => {
    setMembershipReview(membership)
    setMembershipReviewAction(action)
    setMembershipReviewNote('')
  }

  const deleteClub = async () => {
    if (!clubToDelete || isSubmitting) return
    setIsSubmitting(true)
    try {
      await api.deleteClub(clubToDelete.id)
      setClubs(current => current.filter(club => club.id !== clubToDelete.id))
      setMemberships(current => current.filter(item => item.clubId !== clubToDelete.id))
      setPendingMemberReviews(current => current.filter(item => item.clubId !== clubToDelete.id))
      success(`${clubToDelete.name} has been deleted.`)
      setClubToDelete(null)
      await refreshClubAccess?.()
    } catch (err) {
      error(err.message || 'Unable to delete this club.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCreationForm = application => {
    setEditingApplication(application || null)
    setClubForm(application ? applicationToForm(application) : createClubForm(user))
    setCreationModalOpen(true)
  }

  const updateClubForm = (field, value) => {
    setClubForm(current => ({ ...current, [field]: value }))
  }

  const updateFoundingMember = (index, field, value) => {
    setClubForm(current => ({
      ...current,
      foundingMembers: current.foundingMembers.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member,
      ),
    }))
  }

  const addFoundingMember = () => {
    setClubForm(current => ({
      ...current,
      foundingMemberCount: Math.max(current.foundingMemberCount, current.foundingMembers.length + 1),
      foundingMembers: [...current.foundingMembers, { fullName: '', organization: '', email: '' }],
    }))
  }

  const removeFoundingMember = index => {
    setClubForm(current => ({
      ...current,
      foundingMembers: current.foundingMembers.filter((_, memberIndex) => memberIndex !== index),
    }))
  }

  const submitClubApplication = async event => {
    event.preventDefault()
    if (isSubmitting) return
    if (!/^[1-9][0-9]{0,2}$/.test(clubForm.activityFrequencyCount)) {
      error('The activity frequency must be a number from 1 to 999.')
      return
    }
    if (!clubForm.foundingMembersCommitted
      || !clubForm.committedToRules
      || !clubForm.committedToResponsibility
      || !clubForm.committedToReporting) {
      error('You must accept all commitments before submitting the application.')
      return
    }

    setIsSubmitting(true)
    try {
      const {
        activityFrequencyCount,
        activityFrequencyUnit,
        ...applicationFields
      } = clubForm
      const payload = {
        ...applicationFields,
        code: clubForm.code.trim() || null,
        logoUrl: clubForm.logoUrl.trim() || null,
        activityFrequency: formatActivityFrequency(
          activityFrequencyCount,
          activityFrequencyUnit,
        ),
        expectedLocation: clubForm.expectedLocation.trim() || null,
        expectedSchedule: clubForm.expectedSchedule.trim() || null,
        majorEvents: clubForm.majorEvents.trim() || null,
        equipmentNeeds: clubForm.equipmentNeeds.trim() || null,
        foundingMemberCount: Number(clubForm.foundingMemberCount),
      }
      if (editingApplication) {
        await api.updateClubApplication(editingApplication.id, payload)
        success('The club creation application has been updated and resubmitted.')
      } else {
        await api.createClubApplication(payload)
        success('The club creation application has been submitted for administrator review.')
      }
      setCreationModalOpen(false)
      setEditingApplication(null)
      await loadData()
    } catch (err) {
      error(err.message || 'Unable to submit the club creation application.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openApplicationReview = (application, action) => {
    setApplicationReview(application)
    setApplicationReviewAction(action)
    setApplicationReviewForm({ note: '', conditions: '', reviewerSignature: user?.name || '' })
  }

  const submitApplicationReview = async event => {
    event.preventDefault()
    if (!applicationReview || isSubmitting) return
    const review = {
      note: applicationReviewForm.note.trim() || null,
      conditions: applicationReviewForm.conditions.trim() || null,
      reviewerSignature: applicationReviewForm.reviewerSignature.trim() || null,
    }
    setIsSubmitting(true)
    try {
      if (applicationReviewAction === 'approve') {
        await api.approveClubApplication(applicationReview.id, review)
        success(`${applicationReview.name} has been approved.`)
      } else if (applicationReviewAction === 'revision') {
        await api.requestClubApplicationRevision(applicationReview.id, review)
        success('A revision request has been sent to the applicant.')
      } else {
        await api.rejectClubApplication(applicationReview.id, review)
        success(`The application to create ${applicationReview.name} has been rejected.`)
      }
      setApplicationReview(null)
      await Promise.all([loadData(), refreshClubAccess?.()])
    } catch (err) {
      error(err.message || 'Unable to review the club creation application.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <span className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
            Clubs
          </span>
          <h2 className="mt-3 text-3xl font-bold text-white">Discover and Join Clubs</h2>
          <p className="mt-1 max-w-3xl text-sm text-gray-400">
            Membership access is activated only after club manager approval. You can also apply to create a new club.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          {canApplyForClub && (
            <button
              type="button"
              onClick={() => openCreationForm(null)}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-5 py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-purple-500/20"
            >
              + Apply to create a club
            </button>
          )}
          <input
            aria-label="Search clubs"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder="Search by name, code, or category..."
            className="min-w-0 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500 sm:w-72"
          />
        </div>
      </motion.header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Active clubs', clubs.filter(club => club.isActive).length, 'text-cyan-300'],
          ['Joined clubs', memberships.filter(item => normalizedStatus(item.status) === 'APPROVED').length, 'text-emerald-300'],
          ['Pending membership applications', memberships.filter(item => normalizedStatus(item.status) === 'PENDING').length, 'text-amber-300'],
          ['Pending club creation applications', pendingClubApplications.length, 'text-purple-300'],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {canApplyForClub && myApplications.length > 0 && (
        <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <h3 className="text-lg font-bold text-white">My Club Creation Applications</h3>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {myApplications.map(application => (
              <div key={application.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-white">{application.name}</h4>
                    <p className="mt-1 text-xs text-gray-500">Submitted: {formatDate(application.submittedAtUtc)}</p>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
                {application.reviewNote && (
                  <p className="mt-3 rounded-lg bg-slate-900 p-3 text-sm text-gray-300">
                    <span className="font-semibold text-gray-400">Review note:</span> {application.reviewNote}
                  </p>
                )}
                {normalizedStatus(application.status) === 'NEEDSREVISION' && (
                  <button
                    type="button"
                    onClick={() => openCreationForm(application)}
                    className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Edit and resubmit
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {canReviewApplications && pendingClubApplications.length > 0 && (
        <section className="rounded-2xl border border-purple-500/25 bg-purple-500/5 p-5">
          <h3 className="text-lg font-bold text-white">Club Creation Applications Awaiting Review</h3>
          <p className="mt-1 text-sm text-gray-400">Review all submitted information before making a decision.</p>
          <div className="mt-4 space-y-3">
            {pendingClubApplications.map(application => (
              <div
                key={application.id}
                role="button"
                tabIndex={0}
                aria-label={`View club creation application for ${application.name}`}
                onClick={() => openApplicationReview(application, 'approve')}
                onKeyDown={event => {
                  if (event.target !== event.currentTarget) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openApplicationReview(application, 'approve')
                  }
                }}
                className="cursor-pointer rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-purple-400/50 hover:bg-purple-500/[0.07] focus:outline-none focus:ring-2 focus:ring-purple-400/60"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-white">{application.name}</h4>
                      <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs text-cyan-300">
                        {CATEGORY_LABELS[application.category] || application.category}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-300">Founder: {application.requesterName} · {application.founderOrganization}</p>
                    <p className="mt-1 text-sm text-gray-500">Submitted: {formatDate(application.submittedAtUtc)}</p>
                    <p className="mt-2 text-xs font-semibold text-purple-300">Click to view the full application</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={event => { event.stopPropagation(); openApplicationReview(application, 'reject') }} className="rounded-lg border border-rose-500/30 px-3 py-2 text-sm font-semibold text-rose-300">Reject</button>
                    <button type="button" onClick={event => { event.stopPropagation(); openApplicationReview(application, 'revision') }} className="rounded-lg border border-orange-500/30 px-3 py-2 text-sm font-semibold text-orange-300">Request revision</button>
                    <button type="button" onClick={event => { event.stopPropagation(); openApplicationReview(application, 'approve') }} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Approve</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {pendingMemberReviews.length > 0 && (
        <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <h3 className="text-lg font-bold text-white">Membership Applications Awaiting Club Manager Review</h3>
          <div className="mt-4 space-y-3">
            {pendingMemberReviews.map(membership => (
              <div
                key={membership.id}
                role="button"
                tabIndex={0}
                aria-label={`View membership application from ${membership.fullName}`}
                onClick={() => openMembershipReview(membership)}
                onKeyDown={event => {
                  if (event.target !== event.currentTarget) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openMembershipReview(membership)
                  }
                }}
                className="flex cursor-pointer flex-col gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-emerald-400/50 hover:bg-emerald-500/[0.07] focus:outline-none focus:ring-2 focus:ring-emerald-400/60 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <h4 className="font-semibold text-white">{membership.fullName}</h4>
                  <p className="mt-1 text-sm text-gray-400">{membership.clubName} · {membership.email} · {membership.phoneNumber}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-300">{membership.reason}</p>
                  <p className="mt-2 text-xs font-semibold text-emerald-300">Click to view the full application</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={event => { event.stopPropagation(); openMembershipReview(membership, 'reject') }} className="rounded-lg border border-rose-500/30 px-4 py-2 text-sm font-semibold text-rose-300">Reject</button>
                  <button type="button" onClick={event => { event.stopPropagation(); openMembershipReview(membership, 'approve') }} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Review and approve</button>
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
          No matching clubs.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredClubs.map((club, index) => {
            const membership = membershipByClub.get(club.id)
            const status = normalizedStatus(membership?.status)
            const isManaged = managedClubIds.has(club.id)
            const approvedMemberCount = (club.members || []).filter(
              item => normalizedStatus(item.status) === 'APPROVED',
            ).length
            return (
              <motion.article
                key={club.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/65 transition hover:-translate-y-1 hover:border-cyan-500/40"
              >
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between gap-3">
                    {club.logoUrl ? (
                      <img src={club.logoUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-xl font-bold text-cyan-300">
                        {club.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {status && <StatusBadge status={status} />}
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">{club.code}</p>
                  <h3 className="mt-1 text-xl font-bold text-white">{club.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-purple-300">{CATEGORY_LABELS[club.category] || 'Other'}</p>
                  <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-gray-400">{club.description || 'No description provided.'}</p>
                  <dl className="mt-5 space-y-2 border-t border-slate-800 pt-4 text-sm">
                    <div className="flex justify-between"><dt className="text-gray-500">Members</dt><dd className="font-semibold text-white">{approvedMemberCount}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-gray-500">Contact</dt><dd className="truncate text-gray-300">{club.contactEmail}</dd></div>
                  </dl>
                  {status === 'REJECTED' && membership?.reviewNote && (
                    <p className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-sm text-rose-200">Reason: {membership.reviewNote}</p>
                  )}
                </div>
                <div className="border-t border-slate-800 bg-black/20 p-4">
                  {canDeleteClubs || isManaged ? (
                    <div className="grid gap-2">
                      <Link
                        to={`/clubs/${club.id}/members`}
                        className="w-full rounded-xl bg-cyan-500/15 px-4 py-3 text-center font-semibold text-cyan-300 transition hover:bg-cyan-500/25"
                      >
                        Manage members
                      </Link>
                      {canDeleteClubs && (
                        <button
                          type="button"
                          onClick={() => setClubToDelete(club)}
                          className="w-full rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 font-semibold text-rose-300 transition hover:bg-rose-500/20"
                        >
                          Delete club
                        </button>
                      )}
                    </div>
                  ) : status === 'APPROVED' ? (
                    <p className="text-center text-sm font-semibold text-emerald-300">Membership is active</p>
                  ) : status === 'PENDING' ? (
                    <p className="text-center text-sm font-semibold text-amber-300">Application is awaiting club manager review</p>
                  ) : canJoinClub ? (
                    <button type="button" onClick={() => openJoinForm(club)} className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-3 font-semibold text-white">
                      {status === 'REJECTED' ? 'Resubmit application' : 'Apply to join'}
                    </button>
                  ) : (
                    <p className="text-center text-sm text-gray-500">This account cannot submit membership applications</p>
                  )}
                </div>
              </motion.article>
            )
          })}
        </div>
      )}

      <Modal isOpen={Boolean(selectedClub)} onClose={closeJoinForm} title={selectedClub ? `Apply to Join ${selectedClub.name}` : 'Club Membership Application'} size="xl">
        <form onSubmit={submitJoinRequest} className="space-y-6">
          <p className="rounded-lg bg-cyan-50 p-3 text-sm text-cyan-900">
            Submitting an application does not grant membership. Access is activated only after the club manager approves it.
          </p>
          <section className="space-y-4">
            <SectionTitle number="1" title="Personal Information" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" required><TextInput value={joinForm.fullName} onChange={value => updateJoinField('fullName', value)} required maxLength={200} /></Field>
              <Field label="Date of birth" required><TextInput type="date" value={joinForm.dateOfBirth} onChange={value => updateJoinField('dateOfBirth', value)} required /></Field>
              <Field label="Gender" required>
                <select value={joinForm.gender} onChange={event => updateJoinField('gender', event.target.value)} required className={inputClass}>
                  <option value="">Select gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
                </select>
              </Field>
              <Field label="Email" required><TextInput type="email" value={joinForm.email} onChange={value => updateJoinField('email', value)} required maxLength={255} /></Field>
              <Field label="Phone number" required><TextInput type="tel" value={joinForm.phoneNumber} onChange={value => updateJoinField('phoneNumber', value)} required placeholder="0912345678" /></Field>
              <Field label="Address"><TextInput value={joinForm.address} onChange={value => updateJoinField('address', value)} maxLength={500} /></Field>
            </div>
          </section>

          <section className="space-y-4">
            <SectionTitle number="2" title="Commitments" />
            <Checkbox checked={joinForm.acceptedClubRules} onChange={value => updateJoinField('acceptedClubRules', value)} required>I have read and agree to follow the club rules</Checkbox>
            <Checkbox checked={joinForm.committedToParticipate} onChange={value => updateJoinField('committedToParticipate', value)} required>I commit to participating fully in club activities</Checkbox>
          </section>

          <section className="space-y-4">
            <SectionTitle number="3" title="Additional Information" description={`Fields for the ${CATEGORY_LABELS[selectedClub?.category] || 'Other'} category`} />
            <div className="grid gap-4 md:grid-cols-2">
              {(CATEGORY_FIELDS[selectedClub?.category] || CATEGORY_FIELDS.OTHER).map(([key, label]) => (
                <Field key={key} label={label}>
                  <TextArea value={joinForm.additionalInfo[key] || ''} onChange={value => setJoinForm(current => ({ ...current, additionalInfo: { ...current.additionalInfo, [key]: value } }))} rows={2} />
                </Field>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <SectionTitle number="4" title="General Questions" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Your interests"><TextArea value={joinForm.hobbies} onChange={value => updateJoinField('hobbies', value)} /></Field>
              <Field label="Key skills"><TextArea value={joinForm.skills} onChange={value => updateJoinField('skills', value)} /></Field>
              <Field label="Reason for joining" required><TextArea value={joinForm.reason} onChange={value => updateJoinField('reason', value)} required /></Field>
              <Field label="What do you expect from the club?"><TextArea value={joinForm.expectations} onChange={value => updateJoinField('expectations', value)} /></Field>
              <Field label="What can you contribute to the club?"><TextArea value={joinForm.contributions} onChange={value => updateJoinField('contributions', value)} /></Field>
              <Field label="Additional message"><TextArea value={joinForm.message} onChange={value => updateJoinField('message', value)} /></Field>
            </div>
          </section>
          <div className="sticky -bottom-6 z-10 -mx-6 flex gap-3 border-t border-neutral-200 bg-white px-6 py-4 shadow-[0_-12px_24px_rgba(15,23,42,0.08)]">
            <button type="button" onClick={closeJoinForm} disabled={isSubmitting} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-4 py-3 font-semibold text-white disabled:opacity-50">{isSubmitting ? 'Submitting...' : 'Submit application'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={creationModalOpen} onClose={() => !isSubmitting && setCreationModalOpen(false)} title={editingApplication ? 'Edit Club Creation Application' : 'Club Creation Application'} size="xl">
        <form onSubmit={submitClubApplication} className="space-y-7">
          <section className="space-y-4">
            <SectionTitle number="1" title="Proposed Club Information" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Proposed club name" required><TextInput value={clubForm.name} onChange={value => updateClubForm('name', value)} required maxLength={200} /></Field>
              <Field label="Activity category" required>
                <select value={clubForm.category} onChange={event => updateClubForm('category', event.target.value)} required className={inputClass}>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </Field>
              <Field label="Abbreviation (optional)"><TextInput value={clubForm.code} onChange={value => updateClubForm('code', value.toUpperCase())} maxLength={20} placeholder="Leave blank to generate automatically" /></Field>
              <Field label="Logo/icon (optional URL)"><TextInput type="url" value={clubForm.logoUrl} onChange={value => updateClubForm('logoUrl', value)} maxLength={1000} /></Field>
            </div>
            <Field label="Objectives" required><TextArea value={clubForm.purpose} onChange={value => updateClubForm('purpose', value)} required /></Field>
            <Field label="Brief club description" required><TextArea value={clubForm.description} onChange={value => updateClubForm('description', value)} required /></Field>
          </section>

          <section className="space-y-4">
            <SectionTitle number="2" title="Founder / Club President Information" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full name" required><TextInput value={clubForm.founderFullName} onChange={value => updateClubForm('founderFullName', value)} required /></Field>
              <Field label="Proposed role" required><TextInput value={clubForm.founderRole} onChange={value => updateClubForm('founderRole', value)} required /></Field>
              <Field label="Email" required><TextInput type="email" value={clubForm.founderEmail} onChange={value => updateClubForm('founderEmail', value)} required /></Field>
              <Field label="Phone number" required><TextInput type="tel" value={clubForm.founderPhone} onChange={value => updateClubForm('founderPhone', value)} required /></Field>
              <Field label="Class / Faculty / Department" required><TextInput value={clubForm.founderOrganization} onChange={value => updateClubForm('founderOrganization', value)} required /></Field>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <SectionTitle number="3" title="Founding Members" />
              <button type="button" onClick={addFoundingMember} className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white">+ Add member</button>
            </div>
            <Field label="Number of founding members" required><input type="number" min="1" max="200" value={clubForm.foundingMemberCount} onChange={event => updateClubForm('foundingMemberCount', Number(event.target.value))} required className={inputClass} /></Field>
            <div className="space-y-3">
              {clubForm.foundingMembers.map((member, index) => (
                <div key={`${index}-${member.email}`} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-semibold text-neutral-800">Member #{index + 1}</p>
                    {clubForm.foundingMembers.length > 1 && <button type="button" onClick={() => removeFoundingMember(index)} className="text-sm font-semibold text-rose-600">Remove</button>}
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <TextInput value={member.fullName} onChange={value => updateFoundingMember(index, 'fullName', value)} required placeholder="Full name" ariaLabel={`Founding member ${index + 1} full name`} />
                    <TextInput value={member.organization} onChange={value => updateFoundingMember(index, 'organization', value)} required placeholder="Class/Faculty" ariaLabel={`Founding member ${index + 1} class or faculty`} />
                    <TextInput type="email" value={member.email} onChange={value => updateFoundingMember(index, 'email', value)} required placeholder="Email" ariaLabel={`Founding member ${index + 1} email`} />
                  </div>
                </div>
              ))}
            </div>
            <Checkbox checked={clubForm.foundingMembersCommitted} onChange={value => updateClubForm('foundingMembersCommitted', value)} required>The founding members have agreed and committed to participate</Checkbox>
          </section>

          <section className="space-y-4">
            <SectionTitle number="4" title="Activity Plan" />
            <Field label="Planned core activities" required><TextArea value={clubForm.mainActivities} onChange={value => updateClubForm('mainActivities', value)} required rows={4} maxLength={2000} /></Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Activity frequency" required>
                <div className="grid grid-cols-[minmax(0,1fr)_130px] gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[1-9][0-9]*"
                    maxLength={3}
                    value={clubForm.activityFrequencyCount}
                    onChange={event => updateClubForm(
                      'activityFrequencyCount',
                      event.target.value.replace(/\D/g, '').replace(/^0+/, '').slice(0, 3),
                    )}
                    required
                    aria-label="Number of activities"
                    placeholder="Count"
                    className={inputClass}
                  />
                  <select
                    value={clubForm.activityFrequencyUnit}
                    onChange={event => updateClubForm('activityFrequencyUnit', event.target.value)}
                    aria-label="Frequency unit"
                    className={inputClass}
                  >
                    {Object.entries(ACTIVITY_FREQUENCY_UNITS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </Field>
              <Field label="Proposed location"><TextInput value={clubForm.expectedLocation} onChange={value => updateClubForm('expectedLocation', value)} /></Field>
              <Field label="Proposed schedule"><TextInput value={clubForm.expectedSchedule} onChange={value => updateClubForm('expectedSchedule', value)} placeholder="Time slot/day" /></Field>
              <Field label="Planned major events"><TextArea value={clubForm.majorEvents} onChange={value => updateClubForm('majorEvents', value)} /></Field>
            </div>
          </section>

          <section className="space-y-4">
            <SectionTitle number="5" title="Required Resources" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Meeting room / venue">
                <select value={clubForm.venueSupport} onChange={event => updateClubForm('venueSupport', event.target.value)} className={inputClass}><option value="SUPPORT_NEEDED">Support needed</option><option value="SELF_MANAGED">Self-managed</option></select>
              </Field>
              <Field label="Funding">
                <select value={clubForm.fundingSupport} onChange={event => updateClubForm('fundingSupport', event.target.value)} className={inputClass}><option value="SUPPORT_NEEDED">Support needed</option><option value="SELF_FUNDED">Self-funded</option><option value="COMBINED">Combined</option></select>
              </Field>
              <Field label="Required equipment"><TextArea value={clubForm.equipmentNeeds} onChange={value => updateClubForm('equipmentNeeds', value)} /></Field>
              <Checkbox checked={clubForm.advisorNeeded} onChange={value => updateClubForm('advisorNeeded', value)}>Advisor or mentor needed</Checkbox>
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle number="6" title="Commitments" />
            <Checkbox checked={clubForm.committedToRules} onChange={value => updateClubForm('committedToRules', value)} required>Ensure all activities comply with applicable rules and regulations</Checkbox>
            <Checkbox checked={clubForm.committedToResponsibility} onChange={value => updateClubForm('committedToResponsibility', value)} required>Accept responsibility before the administration</Checkbox>
            <Checkbox checked={clubForm.committedToReporting} onChange={value => updateClubForm('committedToReporting', value)} required>Submit periodic activity reports</Checkbox>
          </section>
          <div className="sticky -bottom-6 z-10 -mx-6 flex gap-3 border-t border-neutral-200 bg-white px-6 py-4 shadow-[0_-12px_24px_rgba(15,23,42,0.08)]">
            <button type="button" onClick={() => setCreationModalOpen(false)} disabled={isSubmitting} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{isSubmitting ? 'Submitting...' : editingApplication ? 'Resubmit application' : 'Submit creation application'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(membershipReview)} onClose={() => !isSubmitting && setMembershipReview(null)} title={membershipReviewAction === 'approve' ? 'Review Membership Application' : 'Reject Membership Application'} size="lg">
        <form onSubmit={submitMembershipReview} className="space-y-5">
          {membershipReview && (
            <div className="grid gap-4 rounded-xl bg-neutral-50 p-4 md:grid-cols-2">
              <Detail label="Full name" value={membershipReview.fullName} />
              <Detail label="Date of birth" value={membershipReview.dateOfBirth} />
              <Detail label="Gender" value={GENDER_LABELS[membershipReview.gender] || membershipReview.gender} />
              <Detail label="Email" value={membershipReview.email} />
              <Detail label="Phone number" value={membershipReview.phoneNumber} />
              <Detail label="Address" value={membershipReview.address} />
              <Detail label="Interests" value={membershipReview.hobbies} />
              <Detail label="Skills" value={membershipReview.skills} />
              <Detail label="Reason for joining" value={membershipReview.reason} />
              <Detail label="Expectations" value={membershipReview.expectations} />
              <Detail label="Potential contributions" value={membershipReview.contributions} />
              <Detail label="Additional message" value={membershipReview.requestMessage} />
              <Detail label="Club rules commitment" value={membershipReview.acceptedClubRules ? 'Confirmed' : 'Not confirmed'} />
              <Detail label="Activity participation commitment" value={membershipReview.committedToParticipate ? 'Confirmed' : 'Not confirmed'} />
              {Object.entries(membershipReview.additionalInfo || {}).map(([key, value]) => (
                <Detail
                  key={key}
                  label={getAdditionalFieldLabel(membershipReview.clubCategory, key)}
                  value={value}
                />
              ))}
            </div>
          )}
          <Field label={membershipReviewAction === 'reject' ? 'Rejection reason' : 'Review note'} required={membershipReviewAction === 'reject'}>
            <TextArea value={membershipReviewNote} onChange={setMembershipReviewNote} required={membershipReviewAction === 'reject'} />
          </Field>
          <div className="flex gap-3">
            <button type="button" onClick={() => setMembershipReview(null)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className={`flex-1 rounded-lg px-4 py-3 font-semibold text-white ${membershipReviewAction === 'approve' ? 'bg-emerald-600' : 'bg-rose-600'}`}>{isSubmitting ? 'Processing...' : 'Confirm'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(applicationReview)} onClose={() => !isSubmitting && setApplicationReview(null)} title="Administration Review" size="xl">
        <form onSubmit={submitApplicationReview} className="space-y-6">
          {applicationReview && (
            <div className="space-y-5">
              <div className="grid gap-4 rounded-xl bg-neutral-50 p-4 md:grid-cols-3">
                <Detail label="Club name" value={applicationReview.name} />
                <Detail label="Category" value={CATEGORY_LABELS[applicationReview.category] || applicationReview.category} />
                <Detail label="Submitted" value={formatDate(applicationReview.submittedAtUtc)} />
                <Detail label="Club code" value={applicationReview.code} />
                <Detail label="Logo/icon" value={applicationReview.logoUrl} />
                <Detail label="Objectives" value={applicationReview.purpose} />
                <Detail label="Description" value={applicationReview.description} />
                <Detail label="Founder" value={`${applicationReview.requesterName} – ${applicationReview.founderRole}`} />
                <Detail label="Contact" value={`${applicationReview.contactEmail} · ${applicationReview.contactPhone}`} />
                <Detail label="Organization" value={applicationReview.founderOrganization} />
                <Detail label="Founding members" value={applicationReview.foundingMemberCount} />
                <Detail label="Core activities" value={applicationReview.mainActivities} />
                <Detail label="Frequency" value={applicationReview.activityFrequency} />
                <Detail label="Location/schedule" value={`${applicationReview.expectedLocation || '—'} · ${applicationReview.expectedSchedule || '—'}`} />
                <Detail label="Major events" value={applicationReview.majorEvents} />
                <Detail label="Meeting room / venue" value={VENUE_SUPPORT_LABELS[applicationReview.venueSupport] || applicationReview.venueSupport} />
                <Detail label="Funding" value={FUNDING_SUPPORT_LABELS[applicationReview.fundingSupport] || applicationReview.fundingSupport} />
                <Detail label="Equipment" value={applicationReview.equipmentNeeds} />
                <Detail label="Advisor needed" value={applicationReview.advisorNeeded ? 'Yes' : 'No'} />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <section className="rounded-xl border border-neutral-200 p-4">
                  <h3 className="font-semibold text-neutral-900">Founding Members</h3>
                  <div className="mt-3 space-y-2">
                    {(applicationReview.foundingMembers || []).map((member, index) => (
                      <div key={`${member.email}-${index}`} className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700">
                        <p className="font-semibold text-neutral-900">{index + 1}. {member.fullName}</p>
                        <p>{member.organization} · {member.email}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-neutral-700">
                    Member commitment: <span className="font-semibold">{applicationReview.foundingMembersCommitted ? 'Confirmed' : 'Not confirmed'}</span>
                  </p>
                </section>
                <section className="rounded-xl border border-neutral-200 p-4">
                  <h3 className="font-semibold text-neutral-900">Founder Commitments</h3>
                  <div className="mt-3 space-y-2 text-sm text-neutral-700">
                    <p>Comply with rules: <span className="font-semibold">{applicationReview.committedToRules ? 'Confirmed' : 'Not confirmed'}</span></p>
                    <p>Accept administrative responsibility: <span className="font-semibold">{applicationReview.committedToResponsibility ? 'Confirmed' : 'Not confirmed'}</span></p>
                    <p>Submit periodic activity reports: <span className="font-semibold">{applicationReview.committedToReporting ? 'Confirmed' : 'Not confirmed'}</span></p>
                  </div>
                </section>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-neutral-700">Decision *</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[['approve', 'Approve'], ['revision', 'Request revision'], ['reject', 'Reject']].map(([value, label]) => (
                    <label key={value} className={`cursor-pointer rounded-lg border p-3 text-center font-semibold ${applicationReviewAction === value ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-neutral-200 text-neutral-600'}`}>
                      <input type="radio" name="decision" value={value} checked={applicationReviewAction === value} onChange={() => setApplicationReviewAction(value)} className="sr-only" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          <Field label={applicationReviewAction === 'approve' ? 'Note' : 'Review note / required changes'} required={applicationReviewAction !== 'approve'}><TextArea value={applicationReviewForm.note} onChange={value => setApplicationReviewForm(current => ({ ...current, note: value }))} required={applicationReviewAction !== 'approve'} /></Field>
          <Field label="Conditions"><TextArea value={applicationReviewForm.conditions} onChange={value => setApplicationReviewForm(current => ({ ...current, conditions: value }))} /></Field>
          <Field label="Reviewer signature"><TextInput value={applicationReviewForm.reviewerSignature} onChange={value => setApplicationReviewForm(current => ({ ...current, reviewerSignature: value }))} maxLength={200} /></Field>
          <div className="flex gap-3">
            <button type="button" onClick={() => setApplicationReview(null)} className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{isSubmitting ? 'Processing...' : 'Confirm decision'}</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={Boolean(clubToDelete)}
        onClose={() => !isSubmitting && setClubToDelete(null)}
        title="Delete Club"
        size="md"
      >
        <div className="space-y-5">
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            <p className="font-semibold">Delete {clubToDelete?.name}?</p>
            <p className="mt-2">
              The club will be deactivated and removed from the active club list. Active manager assignments will also end.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setClubToDelete(null)}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 font-semibold text-neutral-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={deleteClub}
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-rose-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {isSubmitting ? 'Deleting...' : 'Delete club'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
