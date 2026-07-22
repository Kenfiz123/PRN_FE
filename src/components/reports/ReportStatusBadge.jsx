const STATUS_META = {
  DRAFT: { label: 'Draft', className: 'border-amber-400/30 bg-amber-400/10 text-amber-200' },
  AWAITINGFINANCE: { label: 'Awaiting finance', className: 'border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200' },
  SUBMITTED: { label: 'Submitted', className: 'border-sky-400/30 bg-sky-400/10 text-sky-200' },
  UNDERREVIEW: { label: 'Under review', className: 'border-violet-400/30 bg-violet-400/10 text-violet-200' },
  APPROVED: { label: 'Approved', className: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' },
  REJECTED: { label: 'Revision required', className: 'border-rose-400/30 bg-rose-400/10 text-rose-200' },
}

export function normalizeReportStatus(status) {
  return status?.toUpperCase().replace(/\s+/g, '') || 'DRAFT'
}

export function reportStatusLabel(status) {
  return (STATUS_META[normalizeReportStatus(status)] || STATUS_META.DRAFT).label
}

export default function ReportStatusBadge({ status, className = '' }) {
  const meta = STATUS_META[normalizeReportStatus(status)] || STATUS_META.DRAFT

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold ${meta.className} ${className}`}>
      {meta.label}
    </span>
  )
}
