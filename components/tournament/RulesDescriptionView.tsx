'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollText, X, ChevronRight, Info } from 'lucide-react'

interface RulesDescriptionViewProps {
  description?: string
  rules?: string
}

export default function RulesDescriptionView({ description, rules }: RulesDescriptionViewProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasContent = description || rules
  const displayDescription = description || "Welcome to the ultimate arena. Compete against the best, prove your skills, and claim your place in eSports history."

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="relative w-full max-w-5xl max-h-[85vh] bg-card border border-white/10 rounded-[3rem] shadow-[0_50px_120px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 md:p-12 border-b border-white/5 flex items-center justify-between bg-muted/20 relative">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue shadow-inner">
                  <ScrollText size={32} />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Tournament Protocol</h2>
                  <div className="flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Official Rules & Guidelines</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-grow overflow-y-auto p-10 md:p-12 space-y-12 custom-scrollbar">
              {description && (
                <div className="space-y-6">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-accent-blue">Overview & Background</h3>
                  <div 
                    className="text-foreground/80 text-xl font-medium leading-[1.8] italic max-w-5xl" 
                    dangerouslySetInnerHTML={{ __html: description }} 
                  />
                </div>
              )}
              
              {rules && (
                <div className="space-y-8">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-accent-purple">Full Competition Rules</h3>
                  <div className="bg-muted/30 border border-white/5 p-10 rounded-[2.5rem] text-foreground/90 text-lg leading-[1.9] font-medium whitespace-pre-wrap">
                    {rules}
                  </div>
                </div>
              )}

              {/* Safety Clause */}
              <div className="p-8 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 flex items-center gap-6">
                 <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
                    <Info size={24} />
                 </div>
                 <p className="text-xs text-amber-500/80 font-bold leading-relaxed max-w-2xl">
                   Participation in this tournament constitutes full acceptance of these terms. Unsportsmanlike behavior, cheating, or harassment will result in immediate disqualification.
                 </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-10 border-t border-white/5 bg-muted/10 flex justify-center">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-16 py-5 rounded-2xl bg-foreground text-background font-black text-sm uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                I Accept These Rules
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <div className="flex justify-start">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-accent-blue text-white font-black text-[11px] uppercase tracking-widest hover:scale-[1.05] hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all active:scale-95 group/btn"
        >
          Full Rules & Details
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
            <ChevronRight size={14} />
          </div>
        </button>
      </div>

      {mounted ? createPortal(modalContent, document.body) : null}
    </>
  )
}
