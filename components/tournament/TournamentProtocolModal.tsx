'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollText, X, Info } from 'lucide-react'

interface TournamentProtocolModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept?: () => void
  tournament: {
    description?: string
    rules?: string
    name?: string
  }
}

export default function TournamentProtocolModal({ 
  isOpen, 
  onClose, 
  onAccept, 
  tournament 
}: TournamentProtocolModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="relative w-full max-w-7xl max-h-[85vh] bg-card border border-white/10 rounded-[3.5rem] shadow-[0_50px_120px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col"
          >
            <div className="p-10 md:p-14 border-b border-white/5 flex items-center justify-between bg-muted/20 relative">
              <div className="flex items-center gap-8">
                <div className="w-20 h-20 rounded-3xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue shadow-inner">
                  <ScrollText size={40} />
                </div>
                <div>
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">Tournament Protocol</h2>
                  <div className="flex items-center gap-4 mt-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-accent-blue animate-pulse" />
                     <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.4em]">Official Regulation & Handbook</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <X size={32} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto overflow-x-hidden p-12 md:p-16 space-y-16 custom-scrollbar">
              {tournament.description && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="h-px w-8 bg-accent-blue/30" />
                    <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-accent-blue">Executive Summary</h3>
                  </div>
                  <div 
                    className="text-foreground/90 text-2xl font-semibold leading-[1.8] italic break-words w-full" 
                    dangerouslySetInnerHTML={{ __html: tournament.description }} 
                  />
                </div>
              )}
              
              {tournament.rules && (
                <div className="space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="h-px w-8 bg-accent-purple/30" />
                    <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-accent-purple">Regulatory Framework</h3>
                  </div>
                  <div className="bg-muted/40 border border-white/5 p-12 rounded-[3rem] text-foreground/90 text-xl leading-[2] font-medium whitespace-pre-wrap break-words shadow-inner w-full">
                    {tournament.rules}
                  </div>
                </div>
              )}

              <div className="p-10 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 flex items-start gap-8">
                 <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner flex-shrink-0">
                    <Info size={32} />
                 </div>
                 <div className="space-y-2 flex-grow">
                    <p className="text-sm font-black text-amber-500 uppercase tracking-widest">Enforcement Notice</p>
                    <p className="text-sm text-amber-500/70 font-bold leading-relaxed break-words">
                      By participating, you acknowledge full adherence to these standards. MatchPoint reserves the right to disqualify any participant found violating the spirit of fair play.
                    </p>
                 </div>
              </div>
            </div>

            <div className="p-12 border-t border-white/5 bg-muted/10 flex justify-center">
              <button 
                onClick={() => {
                  if (onAccept) onAccept()
                  onClose()
                }}
                className="px-20 py-6 rounded-2xl bg-foreground text-background font-black text-base uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
              >
                {onAccept ? 'I Acknowledge & Accept' : 'Close Protocol'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
