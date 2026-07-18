import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'

const clubsData = [
  { id: 1, name: 'Robotics Club', president: 'Alex Chen', members: 45, reports: 12, status: 'active', budget: '$5,200', category: 'Technology', color: 'cyan' },
  { id: 2, name: 'Photography Club', president: 'Sarah Miller', members: 38, reports: 8, status: 'active', budget: '$3,800', category: 'Arts', color: 'purple' },
  { id: 3, name: 'Debate Society', president: 'James Wilson', members: 52, reports: 15, status: 'active', budget: '$2,500', category: 'Academic', color: 'pink' },
  { id: 4, name: 'Music Ensemble', president: 'Emily Chen', members: 67, reports: 6, status: 'active', budget: '$8,900', category: 'Arts', color: 'green' },
  { id: 5, name: 'Drama Club', president: 'Michael Brown', members: 41, reports: 9, status: 'active', budget: '$4,200', category: 'Arts', color: 'yellow' },
  { id: 6, name: 'Coding Club', president: 'Lisa Park', members: 89, reports: 21, status: 'active', budget: '$6,700', category: 'Technology', color: 'cyan' },
  { id: 7, name: 'Chess Club', president: 'David Kim', members: 28, reports: 4, status: 'inactive', budget: '$1,200', category: 'Academic', color: 'gray' },
  { id: 8, name: 'Environmental Club', president: 'Emma Johnson', members: 56, reports: 11, status: 'active', budget: '$3,500', category: 'Social', color: 'green' },
  { id: 9, name: 'Literary Society', president: 'Oliver Smith', members: 34, reports: 7, status: 'active', budget: '$2,800', category: 'Academic', color: 'purple' },
  { id: 10, name: 'Sports Club', president: 'Lucas Garcia', members: 124, reports: 18, status: 'active', budget: '$12,500', category: 'Sports', color: 'pink' }
]

const categories = ['All', 'Technology', 'Arts', 'Academic', 'Sports', 'Social']
const colorMap = {
  cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/50' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  pink: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/50' },
  green: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50' },
  yellow: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
  gray: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50' }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function ClubsPage() {
  const { success } = useToast()
  const [clubs, setClubs] = useState(clubsData)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingClub, setEditingClub] = useState(null)
  const [sortBy, setSortBy] = useState('name')

  const filteredClubs = clubs
    .filter(club => selectedCategory === 'All' || club.category === selectedCategory)
    .filter(club => club.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'members') return b.members - a.members
      if (sortBy === 'reports') return b.reports - a.reports
      return 0
    })

  const handleAddClub = () => {
    setEditingClub(null)
    setShowModal(true)
  }

  const handleEditClub = (club) => {
    setEditingClub(club)
    setShowModal(true)
  }

  const handleDeleteClub = (clubId) => {
    setClubs(prev => prev.filter(c => c.id !== clubId))
    success('Club deleted successfully')
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium border border-purple-500/30">
              Clubs
            </span>
            <span className="text-gray-500 text-sm">/ Management</span>
          </div>
          <h2 className="text-3xl font-bold text-white">Clubs Management</h2>
          <p className="text-gray-400 text-sm mt-1">Manage and monitor all registered clubs</p>
        </div>
        <button
          onClick={handleAddClub}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Club
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clubs..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-slate-800 text-gray-400 border border-slate-700 hover:border-slate-600 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
        >
          <option value="name">Sort by Name</option>
          <option value="members">Sort by Members</option>
          <option value="reports">Sort by Reports</option>
        </select>
      </motion.div>

      {/* Stats Summary */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Clubs', value: clubs.length, gradient: 'from-cyan-500/20 to-cyan-500/5', text: 'text-cyan-400', border: 'border-cyan-500/30' },
          { label: 'Active Clubs', value: clubs.filter(c => c.status === 'active').length, gradient: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', border: 'border-emerald-500/30' },
          { label: 'Total Members', value: clubs.reduce((acc, c) => acc + c.members, 0), gradient: 'from-purple-500/20 to-purple-500/5', text: 'text-purple-400', border: 'border-purple-500/30' },
          { label: 'Total Reports', value: clubs.reduce((acc, c) => acc + c.reports, 0), gradient: 'from-pink-500/20 to-pink-500/5', text: 'text-pink-400', border: 'border-pink-500/30' }
        ].map((stat) => (
          <div
            key={stat.label}
            className={`p-4 rounded-xl bg-gradient-to-br ${stat.gradient} border ${stat.border} backdrop-blur`}
          >
            <p className={`text-3xl font-bold ${stat.text}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 uppercase tracking-wider mt-1 font-medium">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Clubs Grid */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        <AnimatePresence mode="popLayout">
          {filteredClubs.map((club, index) => {
            const colors = colorMap[club.color]
            return (
              <motion.div
                key={club.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                whileHover={{ y: -4 }}
                className="group bg-slate-900/60 backdrop-blur rounded-xl border border-slate-800 overflow-hidden hover:border-cyan-500/50 transition-all"
              >
                {/* Card Header */}
                <div className="relative p-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border ${colors.border} flex items-center justify-center`}>
                      <span className={`text-2xl font-bold ${colors.text}`}>{club.name[0]}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${club.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}>
                      {club.status === 'active' ? '● Active' : '○ Inactive'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{club.name}</h3>
                  <p className="text-gray-500 text-xs mt-1 uppercase tracking-wider font-medium">{club.category}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 p-5 pt-4">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-2xl font-bold text-white">{club.members}</p>
                    <p className="text-xs text-gray-400 uppercase font-medium mt-0.5">Members</p>
                  </div>
                  <div className="p-3 rounded-lg bg-cyan-500/10">
                    <p className="text-2xl font-bold text-cyan-400">{club.reports}</p>
                    <p className="text-xs text-cyan-400/70 uppercase font-medium mt-0.5">Reports</p>
                  </div>
                </div>

                {/* Details */}
                <div className="px-5 pb-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">President</span>
                    <span className="text-white font-medium">{club.president}</span>
                  </div>
                  <div className="flex items-center justify-between py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Budget</span>
                    <span className="text-emerald-400 font-bold">{club.budget}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 p-4 bg-black/30" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button
                    onClick={() => handleEditClub(club)}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-medium bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClub(club.id)}
                    className="flex-1 py-2 px-3 rounded-lg text-xs font-medium bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredClubs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0M7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500">No clubs found matching your criteria</p>
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingClub ? 'Edit Club' : 'Add New Club'}
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider font-medium">Club Name</label>
            <input type="text" defaultValue={editingClub?.name || ''} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" placeholder="Enter club name" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider font-medium">President</label>
            <input type="text" defaultValue={editingClub?.president || ''} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" placeholder="Enter president name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider font-medium">Category</label>
              <select className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500">
                <option value="Technology">Technology</option>
                <option value="Arts">Arts</option>
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
                <option value="Social">Social</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2 uppercase tracking-wider font-medium">Budget</label>
              <input type="text" defaultValue={editingClub?.budget || ''} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" placeholder="$0,000" />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700">Cancel</button>
            <button
              type="button"
              onClick={() => {
                success(editingClub ? 'Club updated successfully' : 'Club added successfully')
                setShowModal(false)
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/30"
            >
              {editingClub ? 'Update' : 'Create'} Club
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
