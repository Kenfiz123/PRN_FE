import { motion } from 'framer-motion'

export default function StatCard({ title, value, change, changeType, icon, color = 'primary', delay = 0 }) {
  const colorVariants = {
    primary: {
      bg: 'from-primary-50 to-primary-100/50',
      border: 'border-primary-100',
      text: 'text-primary-600',
      bgHover: 'group-hover:border-primary-200',
    },
    success: {
      bg: 'from-success-light to-success-light/50',
      border: 'border-success-light',
      text: 'text-success',
      bgHover: 'group-hover:border-success-light',
    },
    warning: {
      bg: 'from-warning-light to-warning-light/50',
      border: 'border-warning-light',
      text: 'text-warning',
      bgHover: 'group-hover:border-warning-light',
    },
    error: {
      bg: 'from-error-light to-error-light/50',
      border: 'border-error-light',
      text: 'text-error',
      bgHover: 'group-hover:border-error-light',
    }
  }

  const variant = colorVariants[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2 }}
      className={`relative p-5 lg:p-6 rounded-xl bg-gradient-to-br ${variant.bg} border ${variant.border} ${variant.bgHover} transition-all duration-200 group cursor-pointer`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">{title}</p>
          <h3 className={`text-2xl lg:text-3xl font-bold ${variant.text}`}>{value}</h3>
        </div>
        {icon && (
          <div className={`p-2.5 rounded-lg bg-white/60 border border-neutral-200`}>
            {icon}
          </div>
        )}
      </div>

      {/* Change Indicator */}
      {change && (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
            changeType === 'positive'
              ? 'bg-success-light/70 text-success'
              : 'bg-error-light/70 text-error'
          }`}>
            {changeType === 'positive' ? (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {change}
          </span>
          <span className="text-xs text-neutral-500">vs last month</span>
        </div>
      )}

      {/* Mini Chart */}
      <div className="mt-4 h-12 flex items-end gap-1">
        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
            className={`flex-1 rounded-t-sm bg-gradient-to-t ${variant.text} opacity-30 group-hover:opacity-50 transition-opacity`}
          />
        ))}
      </div>
    </motion.div>
  )
}
