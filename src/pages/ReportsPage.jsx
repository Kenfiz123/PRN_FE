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
  approved: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'Approved' },
  pending: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400', label: 'Pending' },
  review: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', dot: 'bg-cyan-400', label: 'In Review' },
  rejected: { bg: 'bg-rose-500/15', text: 'text-rose-400', dot: 'bg-rose-400', label: 'Rejected' }
}

const priorityConfig = {
  high: { color: 'text-rose-400', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
  medium: { color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  low: { color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/30">
              Reports
            </span>
            <span className="text-gray-500 text-sm">/ Management</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Reports Management</h1>
          <p className="text-gray-400 text-sm mt-1">Review and manage club reports</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Report
        </button>
      </motion.div>

      {/* Filters & Actions */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full lg:w-auto">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          <div className="flex gap-1.5 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
            {['all', 'pending', 'review', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  selectedStatus === status
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {status === 'all' ? 'All' : status === 'review' ? 'In Review' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {selectedReports.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800 border border-cyan-500/30"
            >
              <span className="text-sm text-cyan-400 font-medium">{selectedReports.length} selected</span>
              <button
                onClick={() => handleBulkAction('approve')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
              >
                Approve All
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 text-sm font-medium hover:bg-rose-500/30 transition-colors"
              >
                Reject All
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Reports Table */}
      <motion.div variants={itemVariants} className="bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/80" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th className="px-5 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                    onChange={(e) => setSelectedReports(e.target.checked ? filteredReports.map(r => r.id) : [])}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                  />
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Report</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Club</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Author</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filteredReports.map((report, index) => (
                  <motion.tr
                    key={report.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                    className="hover:bg-white/5 transition-all group"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={(e) => setSelectedReports(prev =>
                          e.target.checked ? [...prev, report.id] : prev.filter(id => id !== report.id)
                        )}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">{report.title}</p>
                      <p className="text-xs text-gray-500 capitalize mt-0.5 uppercase tracking-wider">{report.type.replace('-', ' ')}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-300">{report.club}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                          {report.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm text-gray-300">{report.author}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">{report.date}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[report.status].bg} ${statusConfig[report.status].text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[report.status].dot}`} />
                        {statusConfig[report.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize border ${priorityConfig[report.priority].bg} ${priorityConfig[report.priority].color} ${priorityConfig[report.priority].border}`}>
                        {report.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewingReport(report)}
                          className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all"
                          title="View"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {report.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(report.id)}
                              className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                              title="Approve"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleReject(report.id)}
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                              title="Reject"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

        {filteredReports.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-12 h-12 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-sm">No reports found</p>
          </div>
        )}

        <div className="flex items-center justify-between px-5 py-4 bg-slate-900/80" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-sm text-gray-400">Showing <span className="text-white font-medium">{filteredReports.length}</span> of <span className="text-white font-medium">{reports.length}</span> reports</p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all">Previous</button>
            <button className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm font-medium border border-cyan-500/30">1</button>
            <button className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white">2</button>
            <button className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white">3</button>
            <button className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:bg-white/5 hover:text-white">Next</button>
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
              <h3 className="text-xl font-bold text-white mb-2">{viewingReport.title}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>{viewingReport.club}</span>
                <span className="text-gray-700">|</span>
                <span>By {viewingReport.author}</span>
                <span className="text-gray-700">|</span>
                <span>{viewingReport.date}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[viewingReport.status].bg} ${statusConfig[viewingReport.status].text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[viewingReport.status].dot}`} />
                  {statusConfig[viewingReport.status].label}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Type</p>
                <p className="text-sm font-semibold text-white capitalize">{viewingReport.type.replace('-', ' ')}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-medium">Priority</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold capitalize border ${priorityConfig[viewingReport.priority].bg} ${priorityConfig[viewingReport.priority].color} ${priorityConfig[viewingReport.priority].border}`}>
                  {viewingReport.priority}
                </span>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-800 border border-slate-700">
              <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Report Content</h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                This is a detailed report covering all aspects of {viewingReport.title.toLowerCase()}.
                The report includes comprehensive analysis, data visualizations, and actionable recommendations
                for the {viewingReport.club}. All figures have been verified and approved by the respective department heads.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setViewingReport(null)}
                className="flex-1 px-4 py-3 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
              {viewingReport.status === 'pending' && (
                <>
                  <button
                    onClick={() => { handleReject(viewingReport.id); setViewingReport(null) }}
                    className="px-6 py-3 bg-rose-500/20 text-rose-400 text-sm font-medium rounded-xl hover:bg-rose-500/30 transition-colors border border-rose-500/30"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => { handleApprove(viewingReport.id); setViewingReport(null) }}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
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
            <label className="block text-xs uppercase tracking-wider font-medium text-gray-400 mb-1.5">Report Title</label>
            <input type="text" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" placeholder="Enter report title" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-gray-400 mb-1.5">Club</label>
              <select className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500">
                <option>Select club</option>
                <option>Robotics Club</option>
                <option>Photography Club</option>
                <option>Music Ensemble</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-gray-400 mb-1.5">Report Type</label>
              <select className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500">
                <option>Quarterly</option>
                <option>Event</option>
                <option>Financial</option>
                <option>Annual</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-gray-400 mb-1.5">Priority</label>
              <select className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-gray-400 mb-1.5">Date</label>
              <input type="date" className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-gray-400 mb-1.5">Description</label>
            <textarea className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white min-h-[100px] resize-none focus:outline-none focus:border-cyan-500" placeholder="Enter report description..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700">Cancel</button>
            <button type="button" onClick={() => { success('Report created successfully'); setShowModal(false) }} className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/30">Create Report</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
