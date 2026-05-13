'use client'

import React, { useState } from 'react'
import { ArrowUp, ArrowDown, Users, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function ManualSeeding({ registrations, tournamentId }: { registrations: any[], tournamentId: string }) {
  const [items, setItems] = useState(() => {
    // Sort by seed_index if it exists, else use original order
    const sorted = [...registrations].sort((a, b) => (a.details?.seed_index || 0) - (b.details?.seed_index || 0))
    return sorted
  })
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const moveUp = (index: number) => {
    if (index === 0) return
    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[index - 1]
    newItems[index - 1] = temp
    setItems(newItems)
  }

  const moveDown = (index: number) => {
    if (index === items.length - 1) return
    const newItems = [...items]
    const temp = newItems[index]
    newItems[index] = newItems[index + 1]
    newItems[index + 1] = temp
    setItems(newItems)
  }

  const handleSave = async () => {
    setIsSaving(true)
    for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const newDetails = { ...(item.details || {}), seed_index: i }
        await supabase.from('tournament_registrations').update({ details: newDetails }).eq('id', item.id)
    }
    setIsSaving(false)
    router.refresh()
  }

  return (
    <div className="p-10 rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-md">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Users size={20} className="text-accent-purple" /> Manage Seeding
        </h3>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="px-4 py-2 bg-accent-blue/10 text-accent-blue hover:bg-accent-blue hover:text-white rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Seeds
        </button>
      </div>
      
      <div className="space-y-3">
        {items.map((reg, idx) => (
          <div key={reg.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
            <span className="w-8 text-center font-black text-muted-foreground">#{idx + 1}</span>
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border overflow-hidden">
                {reg.teams?.avatar_url || reg.profiles?.avatar_url ? (
                    <img src={reg.teams?.avatar_url || reg.profiles?.avatar_url} className="w-full h-full object-cover" />
                ) : (
                    <Users size={16} className="text-muted-foreground" />
                )}
            </div>
            <span className="font-bold flex-1">
                {reg.teams?.name || reg.profiles?.username || reg.profiles?.full_name || 'Unknown'}
            </span>
            <div className="flex items-center gap-1">
                <button 
                  onClick={() => moveUp(idx)} 
                  disabled={idx === 0}
                  className="p-2 rounded-lg bg-card border border-border hover:bg-muted disabled:opacity-30 transition-colors"
                >
                    <ArrowUp size={16} />
                </button>
                <button 
                  onClick={() => moveDown(idx)} 
                  disabled={idx === items.length - 1}
                  className="p-2 rounded-lg bg-card border border-border hover:bg-muted disabled:opacity-30 transition-colors"
                >
                    <ArrowDown size={16} />
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
