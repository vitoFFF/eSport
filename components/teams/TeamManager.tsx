'use client'

import { useState } from 'react'
import { createTeam, invitePlayer } from '@/actions/profile'
import { Users, UserPlus, Trophy, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface TeamManagerProps {
  profile: any
  team: any
  members: any[]
}

export default function TeamManager({ profile, team, members }: TeamManagerProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleCreateTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await createTeam(formData)
    if (result.error) setMessage({ type: 'error', text: result.error })
    else setMessage({ type: 'success', text: 'Team created successfully!' })
    setLoading(false)
  }

  async function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('teamId', team.id)
    const result = await invitePlayer(formData)
    if (result.error) setMessage({ type: 'error', text: result.error })
    else setMessage({ type: 'success', text: 'Invite sent!' })
    setLoading(false)
  }

  if (!team) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12 px-6 rounded-3xl border border-dashed border-border bg-muted/30">
          <PlusCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-black text-foreground">No Team Found</h2>
          <p className="text-muted-foreground mt-2 mb-8">You haven't created a team yet. Managers must lead a squad.</p>
          
          <form onSubmit={handleCreateTeam} className="max-w-md mx-auto space-y-4">
             <div className="space-y-2 text-left">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Team Name</label>
                <input
                  name="name"
                  required
                  placeholder="The Elite Squadron"
                  className="w-full rounded-2xl border border-border bg-card p-4 text-foreground focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                />
             </div>
             <button
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
             >
                {loading ? 'Creating...' : 'Create Team'}
             </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="p-6 rounded-3xl border border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg text-white">
              <Users size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground">{team.name}</h2>
              <p className="text-emerald-500 font-bold text-xs uppercase tracking-widest">Team Official Roster</p>
            </div>
          </div>

          <div className="space-y-3">
            {members?.length > 0 ? members.map((member: any) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-muted border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-border flex items-center justify-center">
                    <Users size={14} className="text-muted-foreground" />
                  </div>
                  <span className="text-sm font-bold">{member.profiles?.username}</span>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                  member.status === 'joined' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'
                }`}>
                  {member.status}
                </span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4 italic">No members in squad yet.</p>
            )}
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-border bg-card/50 backdrop-blur-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Invite Players</h3>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              name="username"
              required
              placeholder="Player Username"
              className="flex-grow rounded-xl border border-border bg-muted p-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
            />
            <button
              disabled={loading}
              className="px-4 py-3 rounded-xl bg-foreground text-background font-black uppercase tracking-[0.1em] text-[10px] hover:scale-105 transition-all"
            >
              <UserPlus size={16} />
            </button>
          </form>
          {message && <p className={`mt-2 text-[10px] font-bold ${message.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{message.text}</p>}
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-border bg-gradient-to-br from-card/80 to-muted/80 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="text-amber-500" size={20} />
          <h3 className="text-sm font-black uppercase tracking-widest">Tournament Entries</h3>
        </div>
        <div className="space-y-4">
           {/* We will implement actual registration listing later */}
           <div className="p-8 text-center rounded-2xl border border-border bg-muted/20">
              <p className="text-sm text-muted-foreground italic">Your team has no active tournament entries. Set your roster to qualify.</p>
              <button className="mt-4 px-6 py-3 rounded-xl bg-card border border-border text-xs font-bold hover:bg-muted transition-all">
                Browse Tournaments
              </button>
           </div>
        </div>
      </div>
    </div>
  )
}
