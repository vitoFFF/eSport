'use client'

import { useState } from 'react'
import { updateProfile, respondToInvite, leaveTeam } from '@/actions/profile'
import { User, Gamepad2, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface PlayerProfileProps {
  profile: any
  playerTeams?: any[]
  teamInvites?: any[]
}

const AVAILABLE_GAMES = [
  'Valorant', 'League of Legends', 'CS:GO', 'Dota 2', 
  'Rocket League', 'FIFA', 'Call of Duty', 'Overwatch 2'
]

export default function PlayerProfile({ profile, playerTeams = [], teamInvites = [] }: PlayerProfileProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [selectedGames, setSelectedGames] = useState<string[]>(profile?.games || [])

  const toggleGame = (game: string) => {
    setSelectedGames(prev => 
      prev.includes(game) ? prev.filter(g => g !== game) : [...prev, game]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    selectedGames.forEach(game => formData.append('games', game))

    const result = await updateProfile(formData)
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover rounded-2xl" />
          ) : (
            <User className="h-10 w-10 text-white" />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-black text-foreground">{profile?.full_name}</h2>
          <p className="text-muted-foreground italic font-semibold">@{profile?.username}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Pending Invitations */}
        {teamInvites && teamInvites.length > 0 && (
          <div className="space-y-4 p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5">
            <h3 className="text-sm font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
              <AlertCircle size={18} /> Pending Invitations
            </h3>
            <div className="space-y-3">
              {teamInvites.map((team: any) => (
                <div key={team.id} className="p-3 rounded-xl bg-card border border-border flex items-center justify-between shadow-sm">
                  <div>
                    <p className="font-bold text-foreground text-sm">{team.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{team.organizations?.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <form action={async (formData) => {
                      formData.append('teamId', team.team_id)
                      formData.append('accept', 'true')
                      const res = await respondToInvite(formData)
                      if (res.error) setMessage({ type: 'error', text: res.error })
                    }}>
                      <button className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold hover:bg-emerald-500/20 transition-colors">Accept</button>
                    </form>
                    <form action={async (formData) => {
                      formData.append('teamId', team.team_id)
                      formData.append('accept', 'false')
                      await respondToInvite(formData)
                    }}>
                      <button className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-colors">Decline</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Teams */}
        {playerTeams && playerTeams.length > 0 && (
          <div className="space-y-4 p-6 rounded-3xl border border-border bg-card/50">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
              My Active Teams
            </h3>
            <div className="space-y-3">
              {playerTeams.map((team: any) => (
                <div key={team.id} className="p-3 rounded-xl bg-muted/50 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs uppercase">
                      {team.category.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm leading-none">{team.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {team.category}
                      </p>
                    </div>
                  </div>
                  <form action={async (formData) => {
                    if(!window.confirm('Are you sure you want to leave this team?')) return;
                    formData.append('teamId', team.team_id)
                    const res = await leaveTeam(formData)
                    if (res.error) setMessage({ type: 'error', text: res.error })
                  }}>
                     <button type="submit" className="text-[10px] uppercase font-bold text-red-500 hover:text-red-400">Leave Team</button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 p-4 rounded-xl text-sm font-bold ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </motion.div>
        )}

        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Player Bio</label>
          <textarea
            name="bio"
            defaultValue={profile?.bio || ''}
            placeholder="Tell us about your competitive background..."
            className="w-full min-h-[120px] rounded-2xl border border-border bg-card/50 p-4 text-foreground focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
          />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Games / Sports Played</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AVAILABLE_GAMES.map((game) => (
              <button
                key={game}
                type="button"
                onClick={() => toggleGame(game)}
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedGames.includes(game)
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-500'
                    : 'bg-muted border-border text-muted-foreground hover:border-border/80'
                }`}
              >
                <Gamepad2 size={14} />
                {game}
              </button>
            ))}
          </div>
        </div>

        <input type="hidden" name="fullName" value={profile?.full_name} />
        <input type="hidden" name="username" value={profile?.username} />

        <button
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-4 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : (
            <>
              <Save size={18} />
              Save Profile
            </>
          )}
        </button>
      </form>
    </div>
  )
}
