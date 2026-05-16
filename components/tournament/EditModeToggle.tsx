'use client'

import React, { useState } from 'react'
import { Trophy, Dices, Edit3, Loader2, Check, X } from 'lucide-react'
import { shuffleRegistrations } from '@/actions/matches'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface EditModeToggleProps {
  tournamentId: string
  isEditMode: boolean
}

export default function EditModeToggle({ 
  tournamentId, 
  isEditMode
}: EditModeToggleProps) {
  const [isShuffling, setIsShuffling] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleToggleEdit = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (isEditMode) {
      params.delete('edit')
    } else {
      params.set('edit', 'true')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleAutoDraw = async () => {
    setIsShuffling(true)
    const res = await shuffleRegistrations(tournamentId, 2)
    setIsShuffling(false)
    
    if (res.success) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      router.refresh()
    } else {
      alert(res.error || 'Failed to auto draw')
    }
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="p-6 rounded-[2rem] bg-card/60 backdrop-blur-xl border border-border shadow-2xl space-y-5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-purple/5 opacity-50 pointer-events-none" />
        
        <div className="flex items-center gap-3 relative z-10">
           <div className="h-9 w-9 rounded-xl bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20">
              <Trophy size={18} className="text-accent-blue" />
           </div>
           <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/80">Organizer Hub</h4>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Arena Controls</p>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-3 relative z-10">
          <button
            onClick={handleAutoDraw}
            disabled={isShuffling || showSuccess}
            className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 border shadow-sm ${
              showSuccess 
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_10px_20px_rgba(16,185,129,0.3)]' 
                : 'bg-accent-blue/5 border-accent-blue/20 text-accent-blue hover:bg-accent-blue hover:text-white hover:shadow-xl hover:shadow-accent-blue/20 active:scale-95'
            }`}
          >
            {isShuffling ? (
              <Loader2 size={16} className="animate-spin" />
            ) : showSuccess ? (
              <Check size={16} />
            ) : (
              <Dices size={16} />
            )}
            {showSuccess ? 'Drawing Complete' : '🎲 Auto Draw'}
          </button>

          <button
            onClick={handleToggleEdit}
            className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-500 flex items-center justify-center gap-3 border shadow-sm ${
              isEditMode 
                ? 'bg-accent-purple border-accent-purple text-white shadow-[0_10px_20px_rgba(168,85,247,0.3)]' 
                : 'bg-muted/30 border-border text-foreground/70 hover:border-accent-purple/50 hover:text-accent-purple hover:bg-accent-purple/5 active:scale-95'
            }`}
          >
            {isEditMode ? <X size={16} /> : <Edit3 size={16} />}
            {isEditMode ? 'Exit Edit Mode' : '✍️ Manual Seeding'}
          </button>
        </div>

        {isEditMode && (
          <div className="pt-2 relative z-10">
            <div className="h-px w-full bg-border/50 mb-4" />
            <p className="text-[10px] text-accent-purple font-black uppercase tracking-[0.2em] text-center animate-pulse flex items-center justify-center gap-2">
               <span className="h-1.5 w-1.5 rounded-full bg-accent-purple" />
               Edit Mode Active
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
