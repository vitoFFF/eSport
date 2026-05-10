'use client'

import { useState } from 'react'
import { Trophy, Plus, Settings, BarChart3, Image as ImageIcon, Layout, FileText, Share2 } from 'lucide-react'
import Link from 'next/link'
import { createTournament } from '@/actions/profile'

interface OrganizerDashboardProps {
  profile: any
  tournaments: any[]
}

export default function OrganizerDashboard({ profile, tournaments }: OrganizerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'create' | 'rankings'>('tournaments')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [participationMode, setParticipationMode] = useState('team')
  const [bracketStructure, setBracketStructure] = useState('single_elimination')
  const [maxRosterSize, setMaxRosterSize] = useState(5)

  async function handleCreateTournament(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    // Add default empty point policy
    formData.append('pointPolicy', JSON.stringify({ "1st": 500, "2nd": 200 }))
    
    const result = await createTournament(formData)
    if (result.error) setMessage({ type: 'error', text: result.error })
    else {
      setMessage({ type: 'success', text: 'Tournament created successfully!' })
      setActiveTab('tournaments')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-foreground">Organizer Hub</h2>
          <p className="text-muted-foreground font-medium">Manage your circuit and community.</p>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-muted rounded-2xl border border-border">
          <button 
            onClick={() => setActiveTab('tournaments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'tournaments' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            My Events
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'create' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Create New
          </button>
          <button 
            onClick={() => setActiveTab('rankings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'rankings' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Leaderboards
          </button>
        </div>
      </div>

      {activeTab === 'tournaments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournaments?.length > 0 ? tournaments.map((t) => (
            <div key={t.id} className="group relative overflow-hidden rounded-[2rem] border border-border bg-card hover:border-accent-blue/50 transition-all duration-300 shadow-lg hover:shadow-accent-blue/5">
              <div className="aspect-[21/9] bg-muted relative">
                {t.banner_url ? (
                  <img src={t.banner_url} alt={t.name} className="w-full h-full object-cover opacity-60" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 opacity-80">
                    <Trophy className="text-slate-700 h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent-blue bg-accent-blue/10 px-2 py-1 rounded-md mb-2 inline-block">
                    {t.status}
                  </span>
                  <h3 className="text-xl font-black text-white">{t.name}</h3>
                </div>
              </div>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Entries</p>
                    <p className="text-sm font-black">0</p>
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">Prize</p>
                    <p className="text-sm font-black">{t.prize_pool || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-card transition-all">
                    <Settings size={16} />
                  </button>
                  <Link href={`/tournaments/${t.id}`}>
                    <button className="px-5 py-2 rounded-xl bg-foreground text-background text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">
                      Dashboard
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center rounded-[2rem] border border-dashed border-border flex flex-col items-center justify-center">
              <Trophy className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-medium mb-6 italic text-sm">You haven't hosted any tournaments yet.</p>
              <button 
                onClick={() => setActiveTab('create')}
                className="px-8 py-4 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl shadow-black/10"
              >
                Launch Your First Tournament
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="max-w-4xl mx-auto p-8 rounded-[2.5rem] border border-border bg-card shadow-2xl">
          <h3 className="text-2xl font-black mb-8 flex items-center gap-2">
            <Plus className="text-accent-blue" />
            Tournament Configuration
          </h3>
          
          <form onSubmit={handleCreateTournament} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Grand Tournament Title</label>
                <input name="name" required placeholder="Ultimate Champions Cup" className="w-full rounded-2xl border border-border bg-muted/30 p-4 text-sm focus:ring-2 focus:ring-accent-blue/50 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Prize Pool Offering</label>
                <input name="prizePool" placeholder="$10,000 USD" className="w-full rounded-2xl border border-border bg-muted/30 p-4 text-sm focus:ring-2 focus:ring-accent-blue/50 outline-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Description & Lore</label>
              <textarea name="description" placeholder="Tell players why this tournament is legendary..." className="w-full min-h-[120px] rounded-2xl border border-border bg-muted/30 p-4 text-sm focus:ring-2 focus:ring-accent-blue/50 outline-none" />
            </div>

            {/* MatchPoint Configs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-3xl border border-border bg-accent-blue/5">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sport Category</label>
                    <select name="category" required className="w-full rounded-xl border border-border bg-card p-3 font-bold text-sm outline-none">
                        <option value="esport">eSport</option>
                        <option value="football">Football</option>
                        <option value="tennis">Tennis</option>
                        <option value="padel">Padel</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Participation Mode</label>
                    <select 
                        name="participationMode" 
                        value={participationMode}
                        onChange={(e) => setParticipationMode(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card p-3 font-bold text-sm outline-none"
                    >
                        <option value="team">Team (N vs N)</option>
                        <option value="1v1">Individual (1v1)</option>
                    </select>
                </div>
                <div className="space-y-2 transition-all duration-300">
                    <label className={`text-xs font-black uppercase tracking-widest text-muted-foreground ${participationMode === '1v1' ? 'opacity-50' : ''}`}>Max Roster Size</label>
                    <input 
                      name="maxRosterSize" 
                      type="number" 
                      min={1} 
                      readOnly={participationMode === '1v1'} 
                      value={participationMode === '1v1' ? 1 : maxRosterSize} 
                      onChange={(e) => setMaxRosterSize(parseInt(e.target.value) || 1)}
                      className={`w-full rounded-xl border border-border bg-card p-3 font-bold text-sm outline-none ${participationMode === '1v1' ? 'opacity-50 cursor-not-allowed' : ''}`} 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Bracket Structure</label>
                    <select 
                        name="bracketStructure" 
                        value={bracketStructure}
                        onChange={(e) => setBracketStructure(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card p-3 font-bold text-sm outline-none"
                    >
                        <option value="single_elimination">Single Elimination</option>
                        <option value="double_elimination">Double Elimination</option>
                        <option value="round_robin">Round Robin</option>
                        <option value="swiss_system">Swiss System</option>
                        <option value="league">League</option>
                        <option value="gauntlet">Gauntlet</option>
                        <option value="bracket_groups">Bracket Groups</option>
                        <option value="custom">Custom</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Seeding Method</label>
                    <select name="seedingMethod" className="w-full rounded-xl border border-border bg-card p-3 font-bold text-sm outline-none">
                        <option value="random">Random Shuffling</option>
                        <option value="rank">Rank-based</option>
                        <option value="manual">Manual Assignment</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Stage Start Participants</label>
                    <input name="stageParticipants" type="number" defaultValue={8} min={2} className="w-full rounded-xl border border-border bg-card p-3 font-bold text-sm outline-none" />
                </div>
                
                {bracketStructure === 'custom' && (
                    <div className="space-y-2 col-span-1 md:col-span-4 transition-all duration-300">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Custom Structure Details</label>
                        <input name="customBracketStructure" placeholder="Describe your custom bracket..." className="w-full rounded-xl border border-border bg-card p-3 font-bold text-sm outline-none focus:ring-2 focus:ring-accent-blue/50" />
                    </div>
                )}
                
                {['single_elimination', 'double_elimination'].includes(bracketStructure) && (
                    <div className="space-y-2 col-span-2 flex items-center gap-4 mt-6 transition-all duration-300">
                        <input type="checkbox" name="thirdPlaceMatch" value="true" className="h-5 w-5 rounded-md border-border text-accent-blue focus:ring-accent-blue" />
                        <label className="text-sm font-bold">Generate Third-Place Consolation Match</label>
                    </div>
                )}
            </div>

            <button disabled={loading} className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-accent-blue to-accent-purple text-white font-black uppercase tracking-widest hover:scale-[1.01] active:scale-[0.98] transition-all shadow-xl shadow-accent-blue/20">
              {loading ? 'Processing...' : 'Publish Tournament Event'}
            </button>
            {message && <p className={`text-center font-bold text-sm ${message.type === 'error' ? 'text-red-500' : 'text-emerald-500'}`}>{message.text}</p>}
          </form>
        </div>
      )}

      {activeTab === 'rankings' && (
        <div className="p-12 text-center rounded-[3rem] bg-muted/20 border border-border">
          <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground/20 mb-6" />
          <h3 className="text-2xl font-black text-foreground mb-4">Ecosystem Rankings</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">Publish cross-tournament leaderboards. Filter by year and category to show who rules the arena.</p>
          <div className="flex flex-wrap justify-center gap-4">
             <div className="w-full max-w-xs space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Filter by Year</label>
                <select className="w-full rounded-xl border border-border bg-card p-3 font-bold text-sm outline-none">
                  {[2026, 2025, 2024].map(y => <option key={y}>{y}</option>)}
                </select>
             </div>
             <button className="h-12 mt-6 px-10 rounded-xl bg-foreground text-background font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">
                Generate View
             </button>
          </div>
        </div>
      )}
    </div>
  )
}
