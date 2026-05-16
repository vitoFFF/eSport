'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProfileSidebar from './ProfileSidebar'
import SportTournamentsView from './SportTournamentsView'
import { useLanguage } from '@/lib/LanguageContext'

interface DashboardShellProps {
  children: React.ReactNode
  profile: any
  headerRight: React.ReactNode
  tournaments?: any[]
  teams?: any[]
  currentTab?: string
}

const SPORT_BLOB_COLORS: Record<string, { blob1: string, blob2: string }> = {
  overview: { blob1: '#2563eb', blob2: '#9333ea' },
  football: { blob1: '#10b981', blob2: '#059669' },
  tennis:   { blob1: '#f59e0b', blob2: '#d97706' },
  padel:    { blob1: '#06b6d4', blob2: '#0891b2' },
  esport:   { blob1: '#a855f7', blob2: '#7c3aed' },
}

const SPORT_TITLES: Record<string, string> = {
  overview: 'Dashboard Overview',
  football: 'Football Command Center',
  tennis:   'Tennis Performance Hub',
  padel:    'Padel Analytics Lab',
  esport:   'eSport Battle Station',
}

const TAB_TITLES: Record<string, string> = {
  overview: 'Dashboard Overview',
  personal: 'Profile Settings',
  arena: 'Tournament Arena',
}

export { SPORT_TITLES }

export default function DashboardShell({ children, profile, headerRight, tournaments = [], teams = [], currentTab = 'overview' }: DashboardShellProps) {
  const { t } = useLanguage()
  const [activeSport, setActiveSport] = useState('overview')
  const blobColors = SPORT_BLOB_COLORS[activeSport] || SPORT_BLOB_COLORS.overview
  const isSportView = activeSport !== 'overview'

  // Dynamic title — reacts to both sport filter and current tab
  const displayTitle = isSportView ? t(`nav.${activeSport}`) : (t(`dashboard.${currentTab}`) || 'Dashboard')
  const breadcrumb = isSportView ? t(`nav.${activeSport}`) : t(`dashboard.${currentTab}`)

  return (
    <div className="fixed inset-0 bg-background flex z-[100] overflow-hidden" data-sport={activeSport}>
      <ProfileSidebar 
        profile={profile} 
        activeSport={activeSport} 
        onSportChange={setActiveSport} 
      />

      <main className="flex-grow ml-72 h-full overflow-y-auto no-scrollbar bg-[#f8fafc] dark:bg-background relative">
        {/* Ambient floating blobs */}
        <div 
          className="ambient-blob w-[500px] h-[500px] top-[-100px] right-[-100px] transition-colors duration-1000"
          style={{ background: blobColors.blob1 }}
        />
        <div 
          className="ambient-blob-2 w-[400px] h-[400px] bottom-[10%] left-[20%] transition-colors duration-1000"
          style={{ background: blobColors.blob2 }}
        />

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-8 md:p-12 min-h-full relative z-10"
        >
          {/* Dynamic top bar with reactive title */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2 transition-colors duration-300">
                Workspace / {breadcrumb}
              </h2>
              <motion.h1 
                key={displayTitle}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-black tracking-tighter uppercase"
              >
                {displayTitle}
              </motion.h1>
            </div>
            {headerRight}
          </div>
          
          <AnimatePresence mode="wait">
            {isSportView ? (
              <motion.div
                key={`sport-${activeSport}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <SportTournamentsView 
                  tournaments={tournaments} 
                  activeSport={activeSport}
                  teams={teams}
                />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard-content"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  )
}
