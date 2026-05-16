'use client'

import React, { useState, useEffect } from 'react'
import { Users, Save, Loader2, LayoutGrid } from 'lucide-react'
import { updateRegistrationGroups } from '@/actions/matches'
import { useRouter } from 'next/navigation'

interface ManualSeedingProps {
  registrations: any[]
  tournamentId: string
  isEditMode?: boolean
}

export default function ManualSeeding({ registrations, tournamentId, isEditMode = false }: ManualSeedingProps) {
  const [localRegs, setLocalRegs] = useState(registrations)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setLocalRegs(registrations)
  }, [registrations])

  const handleGroupChange = (regId: string, groupIndex: number | null) => {
    setLocalRegs(prev => prev.map(r => 
      r.id === regId ? { ...r, details: { ...r.details, group_index: groupIndex } } : r
    ))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const assignments = localRegs.map(r => ({
      id: r.id,
      groupIndex: r.details?.group_index ?? null
    }))
    
    const res = await updateRegistrationGroups(tournamentId, assignments)
    setIsSaving(false)
    
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error || 'Failed to save groups')
    }
  }

  const unassigned = localRegs.filter(r => r.details?.group_index === undefined || r.details?.group_index === null)
  const groupA = localRegs.filter(r => r.details?.group_index === 0)
  const groupB = localRegs.filter(r => r.details?.group_index === 1)

  const renderPlayerCard = (reg: any) => (
    <div key={reg.id} className="flex items-center gap-4 p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border group/card hover:border-accent-blue/30 transition-all shadow-sm hover:shadow-xl hover:-translate-y-1">
      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden shrink-0 shadow-inner border border-border">
        {reg.teams?.avatar_url || reg.profiles?.avatar_url ? (
          <img src={reg.teams?.avatar_url || reg.profiles?.avatar_url} className="w-full h-full object-cover" />
        ) : (
          <Users size={20} className="text-muted-foreground/50" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate text-foreground">
          {reg.teams?.name || reg.profiles?.username || reg.profiles?.full_name || 'Unknown'}
        </p>
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1 opacity-60">
          Confirmed
        </p>
      </div>
      
      {isEditMode && (
        <select
          value={reg.details?.group_index ?? ''}
          onChange={(e) => handleGroupChange(reg.id, e.target.value === '' ? null : parseInt(e.target.value))}
          className="bg-muted border border-border rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-accent-blue outline-none cursor-pointer hover:bg-card transition-all"
        >
          <option value="">Pool</option>
          <option value="0">Group A</option>
          <option value="1">Group B</option>
        </select>
      )}
    </div>
  )

  return (
    <div className="space-y-12">
      {/* Action Header */}
      {isEditMode && (
        <div className="p-6 rounded-3xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-between shadow-2xl backdrop-blur-md sticky top-24 z-30">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-accent-blue flex items-center justify-center text-white shadow-lg shadow-accent-blue/20">
              <Save size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-tight text-foreground">Save Assignments</h4>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Apply group changes to database</p>
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-8 py-3 bg-accent-blue text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-accent-blue/30 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Confirm Changes
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Unassigned Pool */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4">
            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
              <Users size={16} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Competitor Pool</h3>
            <span className="ml-auto bg-muted px-2 py-1 rounded text-[10px] font-black text-muted-foreground">{unassigned.length}</span>
          </div>
          <div className="space-y-3 min-h-[100px]">
            {unassigned.length > 0 ? (
               unassigned.map(renderPlayerCard)
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-center opacity-30 grayscale">
                 <Users size={32} className="mb-2" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Pool Empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Group A */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4">
            <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
              <LayoutGrid size={16} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-accent-blue">Group A</h3>
            <span className="ml-auto bg-accent-blue/10 text-accent-blue px-2 py-1 rounded text-[10px] font-black">{groupA.length}</span>
          </div>
          <div className="space-y-3 p-4 rounded-3xl bg-accent-blue/5 border border-accent-blue/10 min-h-[200px] transition-all">
             {groupA.map(renderPlayerCard)}
             {groupA.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-center py-12 opacity-20 grayscale">
                  <LayoutGrid size={32} className="mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Empty Group</p>
               </div>
             )}
          </div>
        </div>

        {/* Group B */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4">
            <div className="p-2 rounded-lg bg-accent-purple/10 text-accent-purple">
              <LayoutGrid size={16} />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-accent-purple">Group B</h3>
            <span className="ml-auto bg-accent-purple/10 text-accent-purple px-2 py-1 rounded text-[10px] font-black">{groupB.length}</span>
          </div>
          <div className="space-y-3 p-4 rounded-3xl bg-accent-purple/5 border border-accent-purple/10 min-h-[200px] transition-all">
             {groupB.map(renderPlayerCard)}
             {groupB.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-center py-12 opacity-20 grayscale">
                  <LayoutGrid size={32} className="mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Empty Group</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
