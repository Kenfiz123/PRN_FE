import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout({ title, subtitle, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="min-h-screen flex flex-col lg:ml-64">
        {/* Header */}
        <Header
          title={title}
          subtitle={subtitle}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        {/* Page Content */}
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-4 sm:p-6 lg:p-8"
        >
          <div className="max-w-[1400px] mx-auto">
            {children || <Outlet />}
          </div>
        </motion.main>
      </div>
    </div>
  )
}
