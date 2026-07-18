import { motion } from 'framer-motion'
import StatCard from '../components/StatCard'
import { useAuth } from '../context/AuthContext'

const recentActivities = [
  { id: 1, user: 'Sarah Miller', action: 'submitted a new report', target: 'Q4 Event Summary', time: '2 hours ago', avatar: 'SM', type: 'report' },
  { id: 2, user: 'James Wilson', action: 'approved budget for', target: 'Tech Symposium 2024', time: '4 hours ago', avatar: 'JW', type: 'finance' },
  { id: 3, user: 'Emily Chen', action: 'registered new club', target: 'AI Research Society', time: '6 hours ago', avatar: 'EC', type: 'club' },
  { id: 4, user: 'Michael Brown', action: 'completed activity', target: 'Spring Festival Setup', time: '8 hours ago', avatar: 'MB', type: 'activity' },
  { id: 5, user: 'Lisa Park', action: 'updated profile for', target: 'Drama Club', time: '1 day ago', avatar: 'LP', type: 'profile' }
]

const quickStats = [
  { label: 'Reports Today', value: '12' },
  { label: 'Pending Approval', value: '5' },
  { label: 'Active Members', value: '847' },
  { label: 'Events This Week', value: '8' }
]

const upcomingEvents = [
  { name: 'Tech Symposium 2024', date: 'Dec 15', club: 'Coding Club', attendees: 156 },
  { name: 'Winter Concert', date: 'Dec 18', club: 'Music Ensemble', attendees: 234 },
  { name: 'Photography Exhibition', date: 'Dec 20', club: 'Photography Club', attendees: 89 },
  { name: 'Robot Battle Championship', date: 'Dec 22', club: 'Robotics Club', attendees: 312 }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
}

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome Section - Dark themed header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/30">
                  Dashboard
                </span>
                <span className="text-gray-500 text-sm">/ Overview</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                Welcome back, <span className="text-cyan-400">{user?.name?.split(' ')[0] || 'User'}</span>
              </h1>
              <p className="text-gray-400 text-base max-w-xl">
                Here's what's happening in your club network today. Stay updated with all activities.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-5 py-3 bg-black/30 rounded-xl border border-white/10 backdrop-blur">
                <div className="flex items-center -space-x-2">
                  {['SM', 'JW', 'EC', 'MB', 'LP'].map((avatar, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white border-2 border-slate-800"
                      style={{ zIndex: 5 - i }}
                    >
                      {avatar}
                    </div>
                  ))}
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div className="text-right">
                  <p className="text-white font-bold">24 <span className="text-gray-400 font-normal">Online</span></p>
                  <p className="text-amber-400 text-xs font-medium">3 pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reports"
          value="1,247"
          change="+12.5%"
          changeType="positive"
          color="primary"
          delay={0}
        />
        <StatCard
          title="Active Clubs"
          value="28"
          change="+2"
          changeType="positive"
          color="success"
          delay={0.1}
        />
        <StatCard
          title="Total Budget"
          value="$45.2K"
          change="+8.3%"
          changeType="positive"
          color="warning"
          delay={0.2}
        />
        <StatCard
          title="Activities"
          value="89"
          change="-3.2%"
          changeType="negative"
          color="error"
          delay={0.3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Dark card */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="cyber-card">
            <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full" />
                <h2 className="text-lg font-bold text-white">Recent Activity</h2>
              </div>
              <button className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                View All
              </button>
            </div>

            <div className="space-y-1">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all group cursor-pointer"
                  style={{ borderBottom: index < recentActivities.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                    activity.type === 'report' ? 'bg-cyan-500/20 text-cyan-400' :
                    activity.type === 'finance' ? 'bg-amber-500/20 text-amber-400' :
                    activity.type === 'club' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {activity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium">
                      {activity.user}
                      <span className="text-gray-400 font-normal"> {activity.action} </span>
                      <span className="text-cyan-400 font-medium">{activity.target}</span>
                    </p>
                    <p className="text-gray-500 text-sm mt-1">{activity.time}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7-7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats & Upcoming - Sidebar */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Quick Stats */}
          <div className="cyber-card">
            <div className="flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
              <h2 className="text-lg font-bold text-white">Quick Stats</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 text-center group hover:border-cyan-500/30 hover:bg-white/10 transition-all cursor-pointer"
                >
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-500 text-xs mt-1 font-medium uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="cyber-card">
            <div className="flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-400 to-cyan-400 rounded-full" />
              <h2 className="text-lg font-bold text-white">Upcoming Events</h2>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.name}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] text-gray-400 uppercase font-bold">{event.date.split(' ')[0]}</span>
                    <span className="text-lg font-bold text-white">{event.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{event.name}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{event.club}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-cyan-400 font-bold">{event.attendees}</p>
                    <p className="text-gray-500 text-[10px] uppercase"> attendees</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Trends */}
        <div className="cyber-card">
          <div className="flex items-center justify-between pb-4 mb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-400 rounded-full" />
              <h2 className="text-lg font-bold text-white">Report Trends</h2>
            </div>
            <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
              {['Week', 'Month', 'Year'].map((period, i) => (
                <button
                  key={period}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    i === 1
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-48 flex items-end justify-between gap-2">
            {[65, 45, 78, 52, 88, 67, 92, 73, 85, 60, 76, 95].map((value, i) => (
              <div key={i} className="flex-1 group relative">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-cyan-500 to-cyan-400 transition-all group-hover:from-cyan-400 group-hover:to-cyan-300"
                  style={{ height: `${value}%` }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-cyan-400 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-cyan-500/30">
                  {value}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-500 font-medium px-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
          </div>
        </div>

        {/* Budget Allocation */}
        <div className="cyber-card">
          <div className="flex items-center gap-3 pb-4 mb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full" />
            <h2 className="text-lg font-bold text-white">Budget Allocation</h2>
          </div>

          <div className="flex items-center gap-8">
            {/* Donut Chart */}
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#gradient1)" strokeWidth="12" strokeDasharray="75.4 251.2" strokeDashoffset="0" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#gradient2)" strokeWidth="12" strokeDasharray="62.8 251.2" strokeDashoffset="-75.4" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#gradient3)" strokeWidth="12" strokeDasharray="50.3 251.2" strokeDashoffset="-138.2" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="url(#gradient4)" strokeWidth="12" strokeDasharray="62.8 251.2" strokeDashoffset="-188.5" strokeLinecap="round" />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                  <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                  <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">$45.2K</span>
                <span className="text-xs text-gray-500">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-3">
              {[
                { name: 'Events', value: '30%', color: 'cyan' },
                { name: 'Equipment', value: '25%', color: 'emerald' },
                { name: 'Marketing', value: '20%', color: 'amber' },
                { name: 'Operations', value: '25%', color: 'violet' }
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm bg-${item.color}-500`} />
                    <span className="text-gray-300 text-sm font-medium">{item.name}</span>
                  </div>
                  <span className={`text-${item.color}-400 text-sm font-bold`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
