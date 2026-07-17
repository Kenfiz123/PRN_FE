import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'

const reportsData = [
  { id: 1, title: 'Q4 Event Summary Report', club: 'Robotics Club', author: 'Alex Chen', date: '2024-12-10', status: 'approved', type: 'quarterly', priority: 'high' },
  { id: 2, title: 'Budget Allocation Proposal', club: 'Photography Club', author: 'Sarah Miller', date: '2024-12-09', status: 'pending', type: 'financial', priority: 'high' },
  { id: 3, title: 'Winter Concert Planning', club: 'Music Ensemble', author: 'Emily Chen', date: '2024-12-08', status: 'review', type: 'event', priority: 'medium' },
  { id: 4, title: 'Equipment Purchase Request', club: 'Coding Club', author: 'Lisa Park', date: '2024-12-07', status: 'approved', type: 'procurement', priority: 'low' },
  { id: 5, title: 'Annual Club Performance', club: 'Debate Society', author: 'James Wilson', date: '2024-12-06', status: 'pending', type: 'annual', priority: 'high' },
  { id: 6, title: 'New Member Registration', club: 'Drama Club', author: 'Michael Brown', date: '2024-12-05', status: 'approved', type: 'membership', priority: 'low' },
  { id: 7, title: 'Community Outreach Summary', club: 'Environmental Club', author: 'Emma Johnson', date: '2024-12-04', status: 'review', type: 'social', priority: 'medium' },
  { id: 8, title: 'Tech Symposium Budget', club: 'Coding Club', author: 'Lisa Park', date: '2024-12-03', status: 'pending', type: 'financial', priority: 'high' },
  { id: 9, title: 'Sports Day Report', club: 'Sports Club', author: 'Lucas Garcia', date: '2024-12-02', status: 'approved', type: 'event', priority: 'medium' },
  { id: 10, title: 'Equipment Maintenance Log', club: 'Robotics Club', author: 'Alex Chen', date: '2024-12-01', status: 'approved', type: 'maintenance', priority: 'low' }
]

const statusConfig = {
  approved: { bg: 'bg-success-light', text: 'text-success', label: 'Approved' },
  pending: { bg: 'bg-warning-light', text: 'text-warning', label: 'Pending' },
  review: { bg: 'bg-primary-50', text: 'text-primary-600', label: 'In Review' },
  rejected: { bg: 'bg-error-light', text: 'text-error', label: 'Rejected' }
}

const priorityConfig = {
  high: { color: 'text-error', bg: 'bg-error-light' },
  medium: { color: 'text-warning', bg: 'bg-warning-light' },
  low: { color: 'text-success', bg: 'bg-success-light' }
}

export default function ReportsPage() {
  const { success, error } = useToast()
  const [reports, setReports] = useState(reportsData)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewingReport, setViewingReport] = useState(null)
  const [selectedReports, setSelectedReports] = useState([])

  const filteredReports = reports
    .filter(report => selectedStatus === 'all' || report.status === selectedStatus)
    .filter(report => report.title.toLowerCase().includes(searchQuery.toLowerCase()) || report.club.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleApprove = (reportId) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'approved' } : r))
    success('Report approved successfully')
  }

  const handleReject = (reportId) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'rejected' } : r))
    error('Report rejected')
  }

  const handleBulkAction = (action) => {
    if (selectedReports.length === 0) return
    setReports(prev => prev.map(r =>
      selectedReports.includes(r.id) ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r
    ))
    success(`${selectedReports.length} reports ${action}d successfully`)
    setSelectedReports([])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-neutral-900">Reports Management</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Review and manage club reports</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Report
        </button>
      </motion.div>

      {/* Filters & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
      >
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
            />
          </div>

          <div className="flex gap-1.5 bg-neutral-100 p-1 rounded-lg">
            {['all', 'pending', 'review', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  selectedStatus === status
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                {status === 'all' ? 'All' : status === 'review' ? 'In Review' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedReports.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-3"
            >
              <span className="text-sm text-neutral-500">{selectedReports.length} selected</span>
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-3 py-1.5 rounded-lg bg-success-light text-success text-sm font-medium hover:bg-success/20 transition-colors"
              >
                Approve All
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="px-3 py-1.5 rounded-lg bg-error-light text-error text-sm font-medium hover:bg-error/20 transition-colors"
              >
                Reject All
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Reports Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="px-5 py-3.5 text-left">
                  <input
                    type="checkbox"
                    checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                    onChange={(e) => setSelectedReports(e.target.checked ? filteredReports.map(r => r.id) : [])}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Report</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Club</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Author</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Priority</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredReports.map((report, index) => (
                  <motion.tr
                    key={report.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={(e) => setSelectedReports(prev =>
                          e.target.checked ? [...prev, report.id] : prev.filter(id => id !== report.id)
                        )}
                        className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-neutral-900 group-hover:text-primary-600 transition-colors cursor-pointer">{report.title}</p>
                      <p className="text-xs text-neutral-400 capitalize mt-0.5">{report.type.replace('-', ' ')}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-neutral-600">{report.club}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-[10px] font-semibold text-white">
                          {report.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm text-neutral-600">{report.author}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-neutral-500">{report.date}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[report.status].bg} ${statusConfig[report.status].text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          report.status === 'approved' ? 'bg-success' :
                          report.status === 'pending' ? 'bg-warning' :
                          report.status === 'review' ? 'bg-primary-500' :
                          'bg-error'
                        }`} />
                        {statusConfig[report.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium capitalize ${priorityConfig[report.priority].bg} ${priorityConfig[report.priority].color}`}>
                        {report.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewingReport(report)}
                          className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-all"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {report.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(report.id)}
                              className="p-1.5 rounded-lg bg-success-light/50 hover:bg-success-light text-success transition-all"
                              title="Approve"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleReject(report.id)}
                              className="p-1.5 rounded-lg bg-error-light/50 hover:bg-error-light text-error transition-all"
                              title="Reject"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-12 h-12 mx-auto text-neutral-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-neutral-500 text-sm">No reports found</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-neutral-100 bg-neutral-50/50">
          <p className="text-sm text-neutral-500">Showing {filteredReports.length} of {reports.length} reports</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-lg text-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-50 transition-all">Previous</button>
            <button className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 text-sm font-medium">1</button>
            <button className="px-3 py-1.5 rounded-lg text-sm text-neutral-500 hover:bg-neutral-100">2</button>
            <button className="px-3 py-1.5 rounded-lg text-sm text-neutral-500 hover:bg-neutral-100">3</button>
            <button className="px-3 py-1.5 rounded-lg text-sm text-neutral-500 hover:bg-neutral-100">Next</button>
          </div>
        </div>
      </motion.div>

      {/* View Report Modal */}
      <Modal
        isOpen={!!viewingReport}
        onClose={() => setViewingReport(null)}
        title="Report Details"
        size="lg"
      >
        {viewingReport && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{viewingReport.title}</h3>
              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <span>{viewingReport.club}</span>
                <span className="text-neutral-300">|</span>
                <span>By {viewingReport.author}</span>
                <span className="text-neutral-300">|</span>
                <span>{viewingReport.date}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[viewingReport.status].bg} ${statusConfig[viewingReport.status].text}`}>
                  {statusConfig[viewingReport.status].label}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Type</p>
                <p className="text-sm font-medium text-neutral-900 capitalize">{viewingReport.type.replace('-', ' ')}</p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Priority</p>
                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium capitalize ${priorityConfig[viewingReport.priority].bg} ${priorityConfig[viewingReport.priority].color}`}>
                  {viewingReport.priority}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-lg bg-neutral-50 border border-neutral-100">
              <h4 className="text-sm font-semibold text-neutral-900 mb-3">Report Content</h4>
              <p className="text-sm text-neutral-600 leading-relaxed">
                This is a detailed report covering all aspects of {viewingReport.title.toLowerCase()}.
                The report includes comprehensive analysis, data visualizations, and actionable recommendations
                for the {viewingReport.club}. All figures have been verified and approved by the respective department heads.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setViewingReport(null)}
                className="flex-1 px-4 py-2.5 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Close
              </button>
              {viewingReport.status === 'pending' && (
                <>
                  <button
                    onClick={() => { handleReject(viewingReport.id); setViewingReport(null) }}
                    className="px-4 py-2.5 bg-error-light text-error text-sm font-medium rounded-lg hover:bg-error/20 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => { handleApprove(viewingReport.id); setViewingReport(null) }}
                    className="px-4 py-2.5 bg-success text-white text-sm font-medium rounded-lg hover:bg-success/90 transition-colors"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Report Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Report"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Report Title</label>
            <input type="text" className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" placeholder="Enter report title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Club</label>
              <select className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all">
                <option>Select club</option>
                <option>Robotics Club</option>
                <option>Photography Club</option>
                <option>Music Ensemble</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Report Type</label>
              <select className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all">
                <option>Quarterly</option>
                <option>Event</option>
                <option>Financial</option>
                <option>Annual</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Priority</label>
              <select className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Date</label>
              <input type="date" className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
            <textarea className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg text-sm min-h-[100px] resize-none focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all" placeholder="Enter report description..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors">Cancel</button>
            <button type="button" onClick={() => { success('Report created successfully'); setShowModal(false) }} className="flex-1 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">Create Report</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
