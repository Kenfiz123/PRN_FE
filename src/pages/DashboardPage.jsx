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
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-2xl lg:text-[1.75rem] font-semibold text-neutral-900 mb-1">
            Welcome back, <span className="text-primary-600">{user?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="text-sm text-neutral-500">Here's what's happening in your club network today.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center -space-x-2">
            {['SM', 'JW', 'EC', 'MB', 'LP'].map((avatar, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-xs font-semibold text-white border-2 border-white"
                style={{ zIndex: 5 - i }}
              >
                {avatar}
              </div>
            ))}
          </div>
          <div className="text-right pl-4 border-l border-neutral-200">
            <p className="text-sm font-medium text-neutral-900">24 Online</p>
            <p className="text-xs text-neutral-500">3 pending approvals</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Reports"
          value="1,247"
          change="+12.5%"
          changeType="positive"
          color="primary"
          delay={0}
          icon={
            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatCard
          title="Active Clubs"
          value="28"
          change="+2"
          changeType="positive"
          color="success"
          delay={0.1}
          icon={
            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0M7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Budget"
          value="$45.2K"
          change="+8.3%"
          changeType="positive"
          color="warning"
          delay={0.2}
          icon={
            <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Activities"
          value="89"
          change="-3.2%"
          changeType="negative"
          color="error"
          delay={0.3}
          icon={
            <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-primary-500 rounded-full" />
                <h2 className="text-base font-semibold text-neutral-900">Recent Activity</h2>
              </div>
              <button className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">View All</button>
            </div>

            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    activity.type === 'report' ? 'bg-primary-50 text-primary-600' :
                    activity.type === 'finance' ? 'bg-warning-light text-warning' :
                    activity.type === 'club' ? 'bg-purple-100 text-purple-600' :
                    'bg-success-light text-success'
                  }`}>
                    {activity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-700">
                      <span className="font-medium text-neutral-900">{activity.user}</span>
                      {' '}{activity.action}{' '}
                      <span className="text-primary-600 font-medium">{activity.target}</span>
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats & Upcoming */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 bg-purple-500 rounded-full" />
              <h2 className="text-base font-semibold text-neutral-900">Quick Stats</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 text-center group hover:border-primary-200 hover:bg-primary-50/30 transition-all"
                >
                  <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                  <p className="text-xs text-neutral-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 bg-success rounded-full" />
              <h2 className="text-base font-semibold text-neutral-900">Upcoming Events</h2>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.name}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-50 border border-neutral-200 flex flex-col items-center justify-center">
                    <span className="text-[10px] text-neutral-500 font-medium uppercase">{event.date.split(' ')[0]}</span>
                    <span className="text-lg font-bold text-neutral-900">{event.date.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{event.name}</p>
                    <p className="text-xs text-neutral-500">{event.club}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-600">{event.attendees}</p>
                    <p className="text-[10px] text-neutral-400 uppercase">Attendees</p>
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
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-primary-500 rounded-full" />
              <h2 className="text-base font-semibold text-neutral-900">Report Trends</h2>
            </div>
            <div className="flex gap-1 bg-neutral-100 p-1 rounded-lg">
              {['Week', 'Month', 'Year'].map((period, i) => (
                <button
                  key={period}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    i === 1 ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* CSS Chart */}
          <div className="h-48 flex items-end justify-between gap-2 px-2">
            {[65, 45, 78, 52, 88, 67, 92, 73, 85, 60, 76, 95].map((value, i) => (
              <div key={i} className="flex-1 group relative">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-primary-500 to-primary-400 transition-all"
                  style={{ height: `${value}%` }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-900 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {value}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-neutral-400 px-2">
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
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-warning rounded-full" />
              <h2 className="text-base font-semibold text-neutral-900">Budget Allocation</h2>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="flex items-center gap-8">
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-neutral-100)" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-primary-500)" strokeWidth="12" strokeDasharray="75.4 251.2" strokeDashoffset="0" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-success)" strokeWidth="12" strokeDasharray="62.8 251.2" strokeDashoffset="-75.4" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-warning)" strokeWidth="12" strokeDasharray="50.3 251.2" strokeDashoffset="-138.2" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-info)" strokeWidth="12" strokeDasharray="62.8 251.2" strokeDashoffset="-188.5" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-neutral-900">$45.2K</span>
                <span className="text-xs text-neutral-500">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-3">
              {[
                { name: 'Events', value: '30%', color: 'primary' },
                { name: 'Equipment', value: '25%', color: 'success' },
                { name: 'Marketing', value: '20%', color: 'warning' },
                { name: 'Operations', value: '25%', color: 'info' }
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm bg-${item.color}-500`} />
                    <span className="text-sm text-neutral-600">{item.name}</span>
                  </div>
                  <span className={`text-sm font-semibold text-${item.color}-600`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
