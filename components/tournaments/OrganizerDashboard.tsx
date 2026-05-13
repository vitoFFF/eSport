'use client'

import { useState } from 'react'
import { Trophy, Plus, Settings, BarChart3, Image as ImageIcon, Layout, FileText, Share2, Gamepad2, Trophy as TrophyIcon, Users, User, GitFork, Shuffle, TrendingUp, Edit3, Upload, Sparkles, Wand2, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createTournament, deleteTournament } from '@/actions/profile'
import ModernSelect from '@/components/ui/ModernSelect'

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
  const [category, setCategory] = useState('esport')
  const [seedingMethod, setSeedingMethod] = useState('random')
  const [rankingYear, setRankingYear] = useState('2026')
  const [maxRosterSize, setMaxRosterSize] = useState(5)
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [matchFormat, setMatchFormat] = useState('bo1')
  const [promotionCount, setPromotionCount] = useState(2)
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null)
  const router = useRouter()

  async function handleCreateTournament(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    // Add default empty point policy and banner
    formData.append('pointPolicy', JSON.stringify({ "1st": 500, "2nd": 200 }))
    if (selectedBanner) formData.append('bannerUrl', selectedBanner)

    const result = await createTournament(formData)
    if (result.error) setMessage({ type: 'error', text: result.error })
    else {
      setMessage({ type: 'success', text: 'Tournament created successfully!' })
      setActiveTab('tournaments')
    }
    setLoading(false)
  }
  
  async function handleDeleteTournament(id: string) {
    // We could use a more fancy confirmation, but window.confirm is clear for now
    if (!confirm('Are you sure you want to delete this tournament?')) return
    
    setLoading(true)
    const result = await deleteTournament(id)
    if (result.error) setMessage({ type: 'error', text: result.error })
    else {
      setMessage({ type: 'success', text: 'Tournament deleted successfully!' })
      setShowDeleteId(null)
    }
    setLoading(false)
  }

  const exampleImages = [
    { id: 'esport', url: '/images/examples/esport.png', label: 'eSport' },
    { id: 'football', url: '/images/examples/football.png', label: 'Football' },
    { id: 'tennis', url: '/images/examples/tennis.png', label: 'Tennis' },
  ]

  const handleAiGenerate = () => {
    setIsGenerating(true)
    // Simulate AI Generation
    setTimeout(() => {
      const match = exampleImages.find(img => img.id === category) || exampleImages[0]
      setSelectedBanner(match.url)
      setIsGenerating(false)
    }, 2000)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedBanner(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
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
            <div 
              key={t.id} 
              onClick={() => router.push(`/tournaments/${t.id}`)}
              className="group relative overflow-hidden rounded-[2rem] border border-border bg-card hover:border-accent-blue/50 transition-all duration-300 shadow-lg hover:shadow-accent-blue/5 cursor-pointer"
            >
              <div className="aspect-[21/9] bg-muted relative">
                {t.banner_url ? (
                  <img src={t.banner_url} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 opacity-80">
                    <Trophy className="text-slate-700 h-10 w-10" />
                  </div>
                )}
                
                <div className="absolute bottom-4 left-6 z-10">
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
                <div className="flex gap-2 relative z-20">
                  {showDeleteId === t.id ? (
                    <>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteTournament(t.id)
                        }}
                        className="h-10 px-4 rounded-xl bg-red-500 text-white flex items-center gap-2 hover:bg-red-600 transition-all text-[10px] font-black uppercase tracking-widest"
                      >
                        <Trash2 size={16} />
                        Confirm
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDeleteId(null)
                        }}
                        className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-card transition-all"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDeleteId(t.id)
                        }}
                        className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-card transition-all"
                      >
                        <Settings size={16} />
                      </button>
                      <Link href={`/tournaments/${t.id}`} onClick={(e) => e.stopPropagation()}>
                        <button className="px-5 py-2 rounded-xl bg-foreground text-background text-xs font-black uppercase tracking-widest hover:scale-105 transition-all">
                          Dashboard
                        </button>
                      </Link>
                    </>
                  )}
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
              <textarea name="description" placeholder="Tell players why this tournament is legendary..." className="w-full min-h-[80px] rounded-2xl border border-border bg-muted/30 p-4 text-sm focus:ring-2 focus:ring-accent-blue/50 outline-none" />
            </div>

            {/* MatchPoint Configs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6 rounded-3xl border border-border bg-accent-blue/5">
              <ModernSelect
                label="Sport Category"
                name="category"
                value={category}
                onChange={setCategory}
                options={[
                  { value: 'esport', label: 'eSport', emoji: '🎮' },
                  { value: 'football', label: 'Football', emoji: '⚽' },
                  { value: 'tennis', label: 'Tennis', emoji: '🎾' },
                  { value: 'padel', label: 'Padel', emoji: '🏸' },
                ]}
              />
              <ModernSelect
                label="Participation Mode"
                name="participationMode"
                value={participationMode}
                onChange={setParticipationMode}
                options={[
                  { value: 'team', label: 'Team (N vs N)', emoji: '👥' },
                  { value: '1v1', label: 'Individual (1v1)', emoji: '👤' },
                ]}
              />
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
              <ModernSelect
                label="Bracket Structure"
                name="bracketStructure"
                value={bracketStructure}
                onChange={setBracketStructure}
                options={[
                  { value: 'single_elimination', label: 'Single Elimination', emoji: '🏆' },
                  { value: 'double_elimination', label: 'Double Elimination', emoji: '🥈' },
                  { value: 'round_robin', label: 'Round Robin', emoji: '🔄' },
                  { value: 'swiss_system', label: 'Swiss System', emoji: '🇨🇭' },
                  { value: 'group_stage', label: 'Group Stage', emoji: '👥' },
                  { value: 'hybrid', label: 'Hybrid (Group + Playoff)', emoji: '🔥' },
                ]}
              />
              <ModernSelect
                label="Match Format"
                name="matchFormat"
                value={matchFormat}
                onChange={setMatchFormat}
                options={[
                  { value: 'bo1', label: 'Best of 1', emoji: '1️⃣' },
                  { value: 'bo3', label: 'Best of 3', emoji: '3️⃣' },
                  { value: 'bo5', label: 'Best of 5', emoji: '5️⃣' },
                ]}
              />
              <ModernSelect
                label="Seeding Method"
                name="seedingMethod"
                value={seedingMethod}
                onChange={setSeedingMethod}
                options={[
                  { value: 'random', label: 'Random Shuffling', emoji: '🎲' },
                  { value: 'rank', label: 'Rank-based', emoji: '📈' },
                  { value: 'manual', label: 'Manual Assignment', emoji: '✍️' },
                ]}
              />
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Participants</label>
                <input name="stageParticipants" type="number" defaultValue={8} min={2} className="w-full rounded-xl border border-border bg-card p-3 font-bold text-sm outline-none" />
              </div>
              {bracketStructure === 'hybrid' && (
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Promotion Count (Per Group)</label>
                  <input name="promotionCount" type="number" value={promotionCount} onChange={(e) => setPromotionCount(parseInt(e.target.value) || 2)} min={1} className="w-full rounded-xl border border-border bg-card p-3 font-bold text-sm outline-none" />
                </div>
              )}

              {['single_elimination', 'double_elimination'].includes(bracketStructure) && (
                <div className="space-y-2 col-span-2 flex items-center gap-4 mt-6 transition-all duration-300">
                  <input type="checkbox" name="thirdPlaceMatch" value="true" className="h-5 w-5 rounded-md border-border text-accent-blue focus:ring-accent-blue" />
                  <label className="text-sm font-bold">Generate Third-Place Consolation Match</label>
                </div>
              )}
            </div>

            {/* Banner Selection */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tournament Banner</label>
              
              <div className="relative group aspect-[21/9] w-full rounded-[2rem] overflow-hidden border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center transition-all hover:border-accent-blue/50">
                {selectedBanner ? (
                  <>
                    <img src={selectedBanner} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                       <button type="button" onClick={() => setSelectedBanner(null)} className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl text-white text-xs font-bold hover:bg-white/20 transition-all">Change Image</button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8">
                    <div className="h-12 w-12 rounded-2xl bg-accent-blue/10 flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="text-accent-blue" size={24} />
                    </div>
                    <p className="text-sm font-bold text-foreground">Select a banner for your event</p>
                    <p className="text-xs text-muted-foreground mt-1">Upload, choose an example, or generate with AI</p>
                  </div>
                )}
                {isGenerating && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <div className="relative h-16 w-16 mb-4">
                      <div className="absolute inset-0 border-4 border-accent-blue/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
                      <Sparkles className="absolute inset-0 m-auto text-accent-blue animate-pulse" size={24} />
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest text-accent-blue animate-pulse">Dreaming up your banner...</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border cursor-pointer hover:border-accent-blue/50 transition-all group">
                  <Upload size={16} className="text-muted-foreground group-hover:text-accent-blue transition-colors" />
                  <span className="text-xs font-bold">Upload Custom</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                </label>

                <div className="h-8 w-px bg-border mx-2" />

                <div className="flex items-center gap-2">
                  {exampleImages.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setSelectedBanner(img.url)}
                      className={`h-10 w-16 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${selectedBanner === img.url ? 'border-accent-blue' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="flex-grow" />

                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleAiGenerate}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border border-accent-blue/20 text-accent-blue hover:from-accent-blue/20 hover:to-accent-purple/20 transition-all group shadow-sm"
                >
                  <Wand2 size={16} className="group-hover:rotate-12 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest">AI Generate Banner</span>
                </button>
              </div>
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
              <ModernSelect
                label="Filter by Year"
                name="rankingYear"
                value={rankingYear}
                onChange={setRankingYear}
                options={[
                  { value: '2026', label: '2026', emoji: '📅' },
                  { value: '2025', label: '2025', emoji: '📅' },
                  { value: '2024', label: '2024', emoji: '📅' },
                ]}
              />
            <button className="h-12 mt-6 px-10 rounded-xl bg-foreground text-background font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">
              Generate View
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
