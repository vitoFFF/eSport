'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Trophy, Users, Calendar, MapPin, ArrowRight, Sparkles, Flame, Clock, Zap } from 'lucide-react'
import { useLanguage } from '@/lib/LanguageContext'

interface SportTournamentsViewProps {
  tournaments: any[]
  activeSport: string
  teams?: any[]
}

const SPORT_META: Record<string, { name: string, emoji: string, tagline: string, gradient: string, accent: string, bgAccent: string }> = {
  football: { 
    name: 'Football', emoji: '⚽', 
    tagline: 'Dominate the pitch. Claim the trophy.',
    gradient: 'from-emerald-500 to-green-600',
    accent: 'text-emerald-500',
    bgAccent: 'bg-emerald-500'
  },
  tennis: { 
    name: 'Tennis', emoji: '🎾', 
    tagline: 'Every serve counts. Every rally matters.',
    gradient: 'from-amber-500 to-orange-500',
    accent: 'text-amber-500',
    bgAccent: 'bg-amber-500'
  },
  padel: { 
    name: 'Padel', emoji: '🏸', 
    tagline: 'Fast courts. Fierce competition.',
    gradient: 'from-cyan-500 to-teal-500',
    accent: 'text-cyan-500',
    bgAccent: 'bg-cyan-500'
  },
  esport: { 
    name: 'eSport', emoji: '🎮', 
    tagline: 'Log in. Level up. Dominate.',
    gradient: 'from-purple-500 to-violet-600',
    accent: 'text-purple-500',
    bgAccent: 'bg-purple-500'
  },
}

export default function SportTournamentsView({ tournaments, activeSport, teams = [] }: SportTournamentsViewProps) {
  const { t } = useLanguage()
  const meta = SPORT_META[activeSport] || SPORT_META.esport
  const filtered = tournaments.filter(t => t.category === activeSport)

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
      <motion.div 
        key={activeSport}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${meta.gradient} p-10 md:p-14 text-white`}
      >
        {/* Decorative circles */}
        <div className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full bg-white/10 blur-sm" />
        <div className="absolute bottom-[-40px] left-[20%] w-[150px] h-[150px] rounded-full bg-white/5" />
        <div className="absolute top-[30%] right-[15%] w-[80px] h-[80px] rounded-full bg-white/10 blur-lg" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{meta.emoji}</span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={12} />
              {t("dashboard.sports.liveSeason")}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-3">
            {t("dashboard.sports.activeTournaments")}
          </h1>
          <p className="text-white/80 text-lg font-medium max-w-xl leading-relaxed">
            {t("dashboard.sports.browseDescription")}
          </p>
          <p className="text-white/50 text-sm font-bold mt-1 italic">
            {t(`dashboard.sports.${activeSport}.tagline`)}
          </p>

          <div className="flex items-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-sm font-bold text-white/70">
              <Trophy size={16} />
              <span>{filtered.length} {filtered.length !== 1 ? t("dashboard.sports.events") : t("dashboard.sports.event")}</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2 text-sm font-bold text-white/70">
              <Flame size={16} />
              <span>{t("dashboard.sports.season")} 1 — 2026</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tournament Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((tournament, idx) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
            >
              <Link href={`/tournaments/${tournament.id}`}>
                <div className="dash-card overflow-hidden group cursor-pointer h-full flex flex-col">
                  {/* Banner */}
                  <div className="aspect-[21/9] bg-muted relative overflow-hidden">
                    {tournament.banner_url ? (
                      <img src={tournament.banner_url} alt={tournament.name} className="w-full h-full object-cover transition-transform duration-700" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${meta.gradient} opacity-30 flex items-center justify-center`}>
                        <Trophy className="text-white/20" size={40} />
                      </div>
                    )}
                    {/* Status pill */}
                    <div className="absolute top-4 left-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md ${
                        tournament.status === 'active' || tournament.status === 'registration_open' 
                          ? 'bg-emerald-500/80' 
                          : tournament.status === 'upcoming' 
                            ? 'bg-amber-500/80'
                            : 'bg-muted-foreground/60'
                      }`}>
                        {tournament.status === 'active' || tournament.status === 'registration_open' ? <Zap size={10} /> : <Clock size={10} />}
                        {tournament.status?.replace(/_/g, ' ') || 'Open'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${meta.accent}`}>
                        {tournament.settings?.game || (activeSport === 'esport' ? 'Competitive' : activeSport)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-500/20" />
                    </div>
                    <h3 className="text-lg font-black tracking-tight group-hover:text-[var(--sport-accent)] transition-colors mb-2 line-clamp-1">
                      {tournament.name}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                      {tournament.participation_mode && (
                        <span className="flex items-center gap-1.5">
                          <Users size={12} />
                          {tournament.participation_mode}
                        </span>
                      )}
                      {tournament.start_date && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(tournament.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                      {tournament.location_type && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={12} />
                          {tournament.location_type}
                        </span>
                      )}
                    </div>

                    {/* Prize + Action */}
                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{t("cards.prizePool")}</p>
                        <p className="text-sm font-black">{tournament.prize_pool || 'TBD'}</p>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${meta.accent} bg-[var(--sport-accent)]/10 group-hover:bg-[var(--sport-accent)]/20 transition-colors`}>
                        {t("dashboard.sports.view")}
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="dash-card p-16 text-center"
        >
          <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center mx-auto mb-6 opacity-30`}>
            <Trophy className="text-white" size={36} />
          </div>
          <h3 className="text-2xl font-black mb-3">
            {t("dashboard.sports.noEvents").replace("{sport}", t(`nav.${activeSport}`))}
          </h3>
          <p className="text-muted-foreground font-medium max-w-md mx-auto leading-relaxed mb-8">
            {t("dashboard.sports.noEventsDesc").replace("{sport}", t(`nav.${activeSport}`).toLowerCase())}
          </p>
          <Link href={`/tournaments?category=${activeSport}`} className={`inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r ${meta.gradient} text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-lg`}>
            {t("dashboard.sports.browseAll").replace("{sport}", t(`nav.${activeSport}`))}
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      )}
    </div>
  )
}
