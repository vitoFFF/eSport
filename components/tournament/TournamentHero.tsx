'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users, Calendar, LayoutGrid, ScrollText, ChevronRight } from 'lucide-react'
import { useTheme } from 'next-themes'
import { createPortal } from 'react-dom'
import TournamentProtocolModal from './TournamentProtocolModal'

interface TournamentHeroProps {
  tournament: any
}

export default function TournamentHero({ tournament }: TournamentHeroProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isDark = mounted && resolvedTheme === 'dark'
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className={`w-full h-[700px] relative overflow-hidden transition-colors duration-700 ${isDark ? 'bg-[#020617]' : 'bg-white'}`}>
      {/* Modern Dynamic Hero Background */}
      <div className="absolute inset-0 z-0">
        {/* Base Mesh Gradient */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${isDark ? 'opacity-100' : 'opacity-40'}`}
             style={{ backgroundImage: isDark 
               ? 'radial-gradient(circle at 50% 50%, rgba(37,99,235,0.15) 0%, transparent 70%)' 
               : 'radial-gradient(circle at 50% 50%, rgba(37,99,235,0.08) 0%, transparent 70%)' 
             }} />
        
        <div className={`absolute inset-0 transition-opacity duration-700 ${isDark ? 'opacity-100' : 'opacity-30'}`}
             style={{ backgroundImage: isDark 
               ? 'radial-gradient(circle at 20% 30%, rgba(147,51,234,0.1) 0%, transparent 50%)' 
               : 'radial-gradient(circle at 20% 30%, rgba(147,51,234,0.05) 0%, transparent 50%)' 
             }} />
        
        {/* Animated Light Leaks */}
        <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-pulse transition-colors duration-700 ${isDark ? 'bg-accent-blue/20' : 'bg-accent-blue/10'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] animate-pulse transition-colors duration-700 [animation-delay:2s] ${isDark ? 'bg-accent-purple/20' : 'bg-accent-purple/10'}`} />

        {/* Premium Patterns */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${isDark ? 'opacity-[0.15]' : 'opacity-[0.05]'}`} 
             style={{ 
               backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 0)`, 
               backgroundSize: '48px 48px' 
             }} />
        
        {/* Decorative Overlays */}
        <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent z-10 transition-colors duration-700 ${isDark ? 'from-[#020617]' : 'from-white'}`} />
        
        {/* Floating Category Indicator */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none transition-opacity duration-700 ${isDark ? 'opacity-[0.05]' : 'opacity-[0.03]'}`}>
           <span className={`text-[30vw] font-black uppercase tracking-tighter leading-none italic rotate-[-2deg] transition-colors duration-700 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {tournament.category}
           </span>
        </div>
      </div>

      {/* Centered Cinematic Content Container */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pt-48 pb-12">
          {/* Top Badge Container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex items-center gap-6 mb-12"
          >
            <div className={`h-px w-16 transition-colors duration-700 ${isDark ? 'bg-accent-blue/30' : 'bg-accent-blue/20'}`} />
            <div className={`px-6 py-2 rounded-2xl border backdrop-blur-xl transition-all duration-700 ${isDark ? 'bg-accent-blue/10 border-accent-blue/20' : 'bg-accent-blue/5 border-accent-blue/10'}`}>
              <span className="text-accent-blue text-[10px] font-black uppercase tracking-[0.4em]">
                {tournament.settings?.game || (tournament.category === 'esport' ? 'Competitive' : tournament.category)}
              </span>
            </div>
            <div className={`h-px w-16 transition-colors duration-700 ${isDark ? 'bg-accent-blue/30' : 'bg-accent-blue/20'}`} />
          </motion.div>

          {/* Title Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-6 mb-16 max-w-7xl mx-auto"
          >
            <h4 className={`text-[14px] font-black uppercase tracking-[0.6em] leading-none opacity-80 transition-colors duration-700 ${isDark ? 'text-accent-purple' : 'text-purple-600'}`}>
              Official Masters Series 2026
            </h4>
            <h1 className={`text-8xl md:text-[11rem] font-black uppercase tracking-tighter leading-[0.8] italic drop-shadow-2xl transition-colors duration-700 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {tournament.name}
            </h1>
          </motion.div>

          {/* Repositioned Technical Details */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="flex flex-wrap justify-center items-stretch gap-6 mb-12"
          >
            {[
              { icon: LayoutGrid, label: 'Platform', value: tournament.platform || 'Multi-Platform', color: 'blue' },
              { icon: Calendar, label: 'Commences', value: tournament.start_date ? new Date(tournament.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' }) : 'TBD', color: 'purple' },
              { icon: Users, label: 'Format', value: tournament.participation_mode === 'team' ? `${tournament.team_size}v${tournament.team_size}` : '1v1 Duel', color: 'emerald' }
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-4 px-8 py-4 rounded-3xl border backdrop-blur-2xl shadow-xl transition-all hover:scale-105 ${isDark ? 'bg-white/5 border-white/10 hover:border-accent-blue/30' : 'bg-white border-slate-200 hover:border-accent-blue/20'}`}>
                <div className={`p-2.5 rounded-xl transition-colors duration-700 ${isDark ? `bg-accent-${item.color}/10 text-accent-${item.color}` : `bg-${item.color}-500/10 text-${item.color}-600`}`}>
                  <item.icon size={20} />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1.5 transition-colors duration-700 ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{item.label}</span>
                  <span className={`text-xs font-black uppercase tracking-widest transition-colors duration-700 ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.value}</span>
                </div>
              </div>
            ))}

            {/* Rules Trigger Button aligned with cards */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center gap-4 px-8 py-4 rounded-3xl border backdrop-blur-2xl shadow-xl transition-all hover:scale-105 active:scale-95 group/rules ${isDark ? 'bg-accent-blue/10 border-accent-blue/30 hover:bg-accent-blue/20 text-white' : 'bg-accent-blue text-white border-accent-blue/20 shadow-[0_15px_30px_rgba(37,99,235,0.25)]'}`}
            >
              <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/10 text-white' : 'bg-white/20 text-white'}`}>
                <ScrollText size={20} />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1.5 ${isDark ? 'text-white/50' : 'text-white/70'}`}>Tournament</span>
                <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  Full Rules
                  <ChevronRight size={14} className="group-hover/rules:translate-x-1 transition-transform" />
                </span>
              </div>
            </button>
            
            {tournament.status === 'active' && (
              <div className="flex items-center gap-4 px-8 py-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-2xl shadow-xl animate-pulse">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981]" />
                <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Live Arena</span>
              </div>
            )}
          </motion.div>
      </div>
      {mounted && createPortal(
        <TournamentProtocolModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tournament={tournament}
        />,
        document.body
      )}
    </div>
  )
}
