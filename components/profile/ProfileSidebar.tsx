'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { 
  Home, Trophy, User, LayoutDashboard, 
  Settings, ChevronRight, BadgeCheck
} from 'lucide-react'
import { motion } from 'framer-motion'

interface SidebarProps {
  profile: any
  activeSport?: string
  onSportChange?: (sport: string) => void
}

const SPORT_THEMES: Record<string, { color: string, hoverBg: string, emoji: string }> = {
  football: { color: 'text-emerald-500', hoverBg: 'hover:bg-emerald-500/10', emoji: '⚽' },
  tennis:   { color: 'text-amber-500',   hoverBg: 'hover:bg-amber-500/10',   emoji: '🎾' },
  padel:    { color: 'text-cyan-500',    hoverBg: 'hover:bg-cyan-500/10',    emoji: '🏸' },
  esport:   { color: 'text-purple-500',  hoverBg: 'hover:bg-purple-500/10',  emoji: '🎮' },
}

export default function ProfileSidebar({ profile, activeSport = 'overview', onSportChange }: SidebarProps) {
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'overview'

  const sportNav = [
    { id: 'football', name: 'FOOTBALL', emoji: '⚽' },
    { id: 'tennis',   name: 'TENNIS',   emoji: '🎾' },
    { id: 'padel',    name: 'PADEL',    emoji: '🏸' },
    { id: 'esport',   name: 'ESPORT',   emoji: '🎮' },
  ]

  const dashboardNav = [
    { id: 'overview', name: 'Overview', icon: <LayoutDashboard size={18} />, href: '/profile?tab=overview' },
    { id: 'personal', name: 'Personal Profile', icon: <User size={18} />, href: '/profile?tab=personal' },
    ...(profile.role === 'manager' ? [{ id: 'arena', name: 'Tournament Arena', icon: <Trophy size={18} />, href: '/profile?tab=arena' }] : []),
  ]

  return (
    <motion.aside 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 130 }}
      className="w-72 fixed left-0 top-0 bottom-0 sidebar-glass flex flex-col z-[60] overflow-hidden"
    >
      {/* Ambient glow overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[var(--sport-accent,#2563eb)]/[0.03] via-transparent to-[var(--sport-accent,#2563eb)]/[0.01] pointer-events-none transition-colors duration-700" />
      
      {/* Logo Section — pixel-synced with Home floating nav */}
      <div className="p-8 pb-10 relative">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple shadow-[0_12px_24px_rgba(37,99,235,0.28)] transition-transform group-hover:scale-110">
            <Trophy className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground transition-colors group-hover:text-blue-700 md:text-3xl">
            Match<span className="text-accent-blue">Point</span>
          </span>
        </Link>
      </div>

      <div className="flex-grow px-3 space-y-8 overflow-y-auto no-scrollbar pb-8">
        {/* Home — explicit escape from dashboard */}
        <section>
          <Link href="/">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-accent-blue/10 hover:text-accent-blue transition-all group/item">
              <div className="w-8 h-8 rounded-lg bg-accent-blue/5 flex items-center justify-center group-hover/item:bg-accent-blue/15 transition-colors">
                <Home size={18} />
              </div>
              <span>Home</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
            </div>
          </Link>
        </section>

        {/* Sport Selector — drives theme + data */}
        <section className="space-y-2">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Sport Filter</p>
          <div className="space-y-0.5">
            {sportNav.map((sport) => {
              const isActive = activeSport === sport.id
              const theme = SPORT_THEMES[sport.id]
              return (
                <button
                  key={sport.id}
                  onClick={() => onSportChange?.(sport.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group/item relative ${
                    isActive 
                      ? `${theme.color} bg-[var(--sport-accent)]/10 nav-active-glow` 
                      : `text-muted-foreground ${theme.hoverBg} hover:text-foreground`
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-base ${
                    isActive ? 'bg-[var(--sport-accent)]/15' : 'bg-muted/50 group-hover/item:bg-muted'
                  }`}>
                    {sport.emoji}
                  </div>
                  <span className="tracking-wide">{sport.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sport-indicator"
                      className="ml-auto w-2 h-2 rounded-full"
                      style={{ background: 'var(--sport-accent)' }}
                      transition={{ type: 'spring', damping: 25 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* Dashboard Navigation */}
        <section className="space-y-2">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Dashboard</p>
          <div className="space-y-0.5">
            {dashboardNav.map((item) => (
              <Link key={item.id} href={item.href} onClick={() => onSportChange?.('overview')}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group/item relative ${
                  currentTab === item.id && activeSport === 'overview'
                    ? 'bg-accent-blue/10 text-accent-blue shadow-lg shadow-accent-blue/5 nav-active-glow' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    currentTab === item.id && activeSport === 'overview' ? 'bg-accent-blue/20' : 'bg-muted/50 group-hover/item:bg-background'
                  }`}>
                    {item.icon}
                  </div>
                  {item.name}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Account */}
        <section className="space-y-2">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Account</p>
          <div className="space-y-0.5">
            <Link href="/profile?tab=settings" onClick={() => onSportChange?.('overview')}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group/item relative ${
                currentTab === 'settings' && activeSport === 'overview'
                  ? 'bg-accent-blue/10 text-accent-blue shadow-lg shadow-accent-blue/5 nav-active-glow' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  currentTab === 'settings' && activeSport === 'overview' ? 'bg-accent-blue/20' : 'bg-muted/50 group-hover:item:bg-background'
                }`}>
                  <Settings size={18} />
                </div>
                Settings
              </div>
            </Link>
          </div>
        </section>
      </div>

      {/* Sidebar user mini-card at bottom */}
      <div className="p-4 border-t border-border/30 bg-background/30 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-2">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-accent-blue to-accent-purple flex items-center justify-center text-white text-sm font-black overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : profile.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-card status-online" />
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-black truncate">{profile.full_name}</p>
              <BadgeCheck size={14} className="text-accent-blue shrink-0" />
            </div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">{profile.role}</p>
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
