'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight } from 'lucide-react'
import TournamentProtocolModal from './TournamentProtocolModal'

interface RulesDescriptionViewProps {
  tournament: any
}

export default function RulesDescriptionView({ tournament }: RulesDescriptionViewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

      {mounted && createPortal(
        <TournamentProtocolModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          tournament={tournament}
        />,
        document.body
      )}
    </>
  )
}
