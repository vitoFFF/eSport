'use client'

import { useState } from 'react'
import { Trophy, Plus, Settings, BarChart3, Image as ImageIcon, Layout, FileText, Share2, Gamepad2, Trophy as TrophyIcon, Users, User, GitFork, Shuffle, TrendingUp, Edit3, Upload, Sparkles, Wand2, Trash2, X, ShieldAlert, Settings2, GripVertical, ArrowUp, ArrowDown } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createTournament, deleteTournament } from '@/actions/profile'
import ModernSelect from '@/components/ui/ModernSelect'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false, loading: () => <p className="text-sm text-muted-foreground p-4">Loading editor...</p> })

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
  const [selectedBanner, setSelectedBanner] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [matchFormat, setMatchFormat] = useState('bo1')
  const [promotionCount, setPromotionCount] = useState(2)
  const [groupCount, setGroupCount] = useState(2)
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null)
  
  // New state variables
  const [description, setDescription] = useState('')
  const [platform, setPlatform] = useState('PC')
  const [locationType, setLocationType] = useState('online')
  const [finalMatchFormatEnabled, setFinalMatchFormatEnabled] = useState(false)
  const [finalMatchFormat, setFinalMatchFormat] = useState('bo3')
  const [scoreReportingMethod, setScoreReportingMethod] = useState('admins_only')
  const [tieBreakerRule, setTieBreakerRule] = useState('h2h')
  const [teamSize, setTeamSize] = useState('1')
  const [esportGame, setEsportGame] = useState('')
  const [participantLimit, setParticipantLimit] = useState<number | ''>('')
  
  const [isTieBreakerModalOpen, setIsTieBreakerModalOpen] = useState(false)
  const [tieBreakerRules, setTieBreakerRules] = useState([
    { id: 'h2h', label: 'Head to Head', active: true },
    { id: 'gd', label: 'Goal Difference', active: true },
    { id: 'pts', label: 'Points Scored', active: false },
    { id: 'wins', label: 'Most Wins', active: false },
  ])
  
  const router = useRouter()

  async function handleCreateTournament(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    // Add default empty point policy and banner
    formData.append('pointPolicy', JSON.stringify({ "1st": 500, "2nd": 200 }))
    if (selectedBanner) formData.append('bannerUrl', selectedBanner)
    formData.append('description', description)
    if (finalMatchFormatEnabled) formData.append('finalMatchFormat', finalMatchFormat)

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
            {/* Step 1: Basic Info & Location */}
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

            {/* Step 3 & 4: Format & Advanced Settings (MOVED UP) */}
            <div className="p-6 rounded-3xl border border-border bg-accent-blue/5 space-y-6">
              <h4 className="font-black text-lg">Format & Advanced Settings</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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

                {category === 'esport' && (
                  <ModernSelect
                    label="Select Esport Game"
                    name="game"
                    value={esportGame}
                    onChange={setEsportGame}
                    options={[
                      { value: 'CS2', label: 'Counter-Strike 2 (CS2)', emoji: '🔫' },
                      { value: 'Valorant', label: 'Valorant', emoji: '🎯' },
                      { value: 'Overwatch 2', label: 'Overwatch 2', emoji: '🛡️' },
                      { value: 'LoL', label: 'League of Legends (LoL)', emoji: '⚔️' },
                      { value: 'Dota 2', label: 'Dota 2', emoji: '🌌' },
                      { value: 'MLBB', label: 'Mobile Legends: Bang Bang', emoji: '📱' },
                      { value: 'PUBGM', label: 'PUBG Mobile', emoji: '🪂' },
                      { value: 'Apex', label: 'Apex Legends', emoji: '🏃' },
                      { value: 'Fortnite', label: 'Fortnite', emoji: '🏗️' },
                      { value: 'Warzone', label: 'Call of Duty: Warzone', emoji: '🚁' },
                      { value: 'Tekken 8', label: 'Tekken 8', emoji: '🥋' },
                      { value: 'EAFC', label: 'EA Sports FC', emoji: '⚽' },
                      { value: 'Rocket League', label: 'Rocket League', emoji: '🏎️' },
                      { value: 'NBA2K', label: 'NBA 2K', emoji: '🏀' },
                      { value: 'eFootball', label: 'eFootball', emoji: '⚽' },
                    ]}
                  />
                )}

                <ModernSelect
                  label="Participation Mode"
                  name="participationMode"
                  value={participationMode}
                  onChange={setParticipationMode}
                  options={[
                    { value: 'team', label: 'Team', emoji: '👥' },
                    { value: '1v1', label: 'Individual (1v1)', emoji: '👤' },
                  ]}
                />
                
                {participationMode === 'team' ? (
                  <ModernSelect
                    label="Team Size"
                    name="teamSize"
                    value={teamSize}
                    onChange={setTeamSize}
                    options={[
                      { value: '2', label: '2v2', emoji: '👥' },
                      { value: '5', label: '5v5', emoji: '🖐' },
                      { value: '11', label: '11v11', emoji: '⚽' },
                    ]}
                  />
                ) : (
                  <div className="space-y-2 opacity-50">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Team Size</label>
                    <input type="text" readOnly value="1v1" className="w-full rounded-xl border border-border bg-card p-3 font-bold text-sm outline-none cursor-not-allowed" />
                    <input type="hidden" name="teamSize" value="1" />
                  </div>
                )}

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
                    { value: 'hybrid', label: 'Two-Stage / Hybrid', emoji: '🔥' },
                  ]}
                />
                
                {bracketStructure === 'round_robin' && (
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Number of Groups</label>
                    <input 
                      name="groupCount" 
                      type="number" 
                      value={groupCount} 
                      onChange={(e) => setGroupCount(parseInt(e.target.value) || 1)} 
                      min={1} 
                      className="w-full rounded-xl border border-border bg-card p-3 font-bold text-sm outline-none focus:ring-2 focus:ring-accent-blue/50" 
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Participant Limit</label>
                  <input 
                    name="participantLimit" 
                    type="number" 
                    value={participantLimit}
                    onChange={(e) => setParticipantLimit(e.target.value === '' ? '' : parseInt(e.target.value))}
                    placeholder="Unlimited" 
                    className="w-full rounded-xl border border-border bg-card p-3 font-bold text-sm outline-none focus:ring-2 focus:ring-accent-blue/50" 
                  />
                  {bracketStructure === 'round_robin' && participantLimit !== '' && participantLimit < groupCount * 2 && (
                    <p className="text-[10px] font-bold text-amber-500 mt-1 flex items-center gap-1">
                      <ShieldAlert size={10} /> At least {groupCount * 2} players recommended for {groupCount} groups
                    </p>
                  )}
                </div>
                <ModernSelect
                  label="Default Match Format"
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
                    { value: 'manual', label: 'Manual Assignment', emoji: '✍️' },
                    { value: 'elo', label: 'By ELO / Ranking', emoji: '📈' },
                  ]}
                />

                <ModernSelect
                  label="Score Reporting"
                  name="scoreReportingMethod"
                  value={scoreReportingMethod}
                  onChange={setScoreReportingMethod}
                  options={[
                    { value: 'admins_only', label: 'Admins Only', emoji: '🔒' },
                    { value: 'players', label: 'Players (Approval Required)', emoji: '🤝' },
                  ]}
                />

                {bracketStructure === 'round_robin' && (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <ModernSelect
                        label="Primary Tie-breaker"
                        name="tieBreakerRule"
                        value={tieBreakerRule}
                        onChange={setTieBreakerRule}
                        options={[
                          { value: 'h2h', label: 'Head to Head', emoji: '⚔️' },
                          { value: 'goal_difference', label: 'Goal Difference', emoji: '🔢' },
                        ]}
                      />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <div className="h-4" /> {/* Spacer to match ModernSelect label height */}
                      <button 
                        type="button"
                        onClick={() => setIsTieBreakerModalOpen(true)}
                        className="h-[46px] w-[46px] flex items-center justify-center rounded-xl border border-border bg-card text-accent-blue shadow-sm hover:bg-muted/50 transition-all group shrink-0"
                        title="Configure Advanced Rules"
                      >
                        <Settings2 size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                      </button>
                    </div>
                  </div>
                )}
                
                {bracketStructure === 'hybrid' && (
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Promotion Count (Per Group)</label>
                    <input name="promotionCount" type="number" value={promotionCount} onChange={(e) => setPromotionCount(parseInt(e.target.value) || 2)} min={1} className="w-full rounded-xl border border-border bg-card p-3 font-bold text-sm outline-none" />
                  </div>
                )}
                
                {(bracketStructure === 'group_stage' || bracketStructure === 'hybrid') && (
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Requested Groups</label>
                    <input name="groupCount" type="number" value={groupCount} onChange={(e) => setGroupCount(parseInt(e.target.value) || 1)} min={1} className="w-full rounded-xl border border-border bg-card p-3 font-bold text-sm outline-none" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input 
                      type="checkbox" 
                      id="finalFormatToggle"
                      checked={finalMatchFormatEnabled}
                      onChange={(e) => setFinalMatchFormatEnabled(e.target.checked)}
                      className="h-5 w-5 rounded-md border-border text-accent-blue focus:ring-accent-blue" 
                    />
                    <label htmlFor="finalFormatToggle" className="text-sm font-bold">Use different format for final</label>
                  </div>
                  
                  {finalMatchFormatEnabled && (
                    <div className="pl-9">
                      <ModernSelect
                        label="Final Match Format"
                        name="finalMatchFormat"
                        value={finalMatchFormat}
                        onChange={setFinalMatchFormat}
                        options={[
                          { value: 'bo3', label: 'Best of 3', emoji: '3️⃣' },
                          { value: 'bo5', label: 'Best of 5', emoji: '5️⃣' },
                          { value: 'bo7', label: 'Best of 7', emoji: '7️⃣' },
                        ]}
                      />
                    </div>
                  )}
                </div>

                {['single_elimination', 'double_elimination'].includes(bracketStructure) && (
                  <div className="flex items-center gap-4">
                    <input type="checkbox" name="thirdPlaceMatch" value="true" className="h-5 w-5 rounded-md border-border text-accent-blue focus:ring-accent-blue" />
                    <label className="text-sm font-bold">Generate Third-Place Consolation Match</label>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <ModernSelect
                  label="Platform / Surface"
                  name="platform"
                  value={platform}
                  onChange={setPlatform}
                  options={[
                    { value: 'PC', label: 'PC', emoji: '💻' },
                    { value: 'PS5', label: 'PlayStation 5', emoji: '🎮' },
                    { value: 'Xbox', label: 'Xbox', emoji: '🕹️' },
                    { value: 'Crossplay', label: 'Crossplay', emoji: '🌐' },
                    { value: 'Turf', label: 'Turf (Sports)', emoji: '🏟️' },
                  ]}
                />
              </div>

              <div className="space-y-2">
                <ModernSelect
                  label="Location Type"
                  name="locationType"
                  value={locationType}
                  onChange={setLocationType}
                  options={[
                    { value: 'online', label: 'Online', emoji: '🌐' },
                    { value: 'lan_offline', label: 'LAN / Offline', emoji: '📍' },
                  ]}
                />
              </div>

              {locationType === 'online' ? (
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Discord / Twitch Link</label>
                  <input name="locationUrl" placeholder="https://discord.gg/..." className="w-full rounded-2xl border border-border bg-muted/30 p-4 text-sm focus:ring-2 focus:ring-accent-blue/50 outline-none" />
                </div>
              ) : (
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Physical Address</label>
                  <input name="locationAddress" placeholder="e.g. Arena Stadium, Tbilisi" className="w-full rounded-2xl border border-border bg-muted/30 p-4 text-sm focus:ring-2 focus:ring-accent-blue/50 outline-none" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Description & Rules</label>
              <div className="rounded-2xl overflow-hidden border border-border bg-muted/30">
                <ReactQuill theme="snow" value={description} onChange={setDescription} className="h-48 mb-12" />
              </div>
            </div>

            {/* Step 2: Registration & Schedule */}
            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-6">
               <h4 className="font-black text-lg">Registration & Schedule</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Entry Fee (Optional)</label>
                   <input name="entryFee" placeholder="e.g. Free or 10 GEL" className="w-full rounded-xl border border-border bg-muted/30 p-3 text-sm focus:ring-2 focus:ring-accent-blue/50 outline-none" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Registration Start Date</label>
                   <input name="registrationStartDate" type="datetime-local" className="w-full rounded-xl border border-border bg-muted/30 p-3 text-sm focus:ring-2 focus:ring-accent-blue/50 outline-none" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Registration End Date</label>
                   <input name="registrationEndDate" type="datetime-local" className="w-full rounded-xl border border-border bg-muted/30 p-3 text-sm focus:ring-2 focus:ring-accent-blue/50 outline-none" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tournament Start Date</label>
                   <input name="startDate" type="datetime-local" className="w-full rounded-xl border border-border bg-muted/30 p-3 text-sm focus:ring-2 focus:ring-accent-blue/50 outline-none" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tournament End Date</label>
                   <input name="endDate" type="datetime-local" className="w-full rounded-xl border border-border bg-muted/30 p-3 text-sm focus:ring-2 focus:ring-accent-blue/50 outline-none" />
                 </div>
               </div>
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

      {/* Advanced Tie-breaker Modal */}
      <AnimatePresence>
        {isTieBreakerModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsTieBreakerModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Advanced Tie-breakers</h3>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Set Rule Priority</p>
                  </div>
                  <button onClick={() => setIsTieBreakerModalOpen(false)} className="p-2 rounded-full hover:bg-muted transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  {tieBreakerRules.map((rule, index) => (
                    <div key={rule.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${rule.active ? 'border-accent-blue/30 bg-accent-blue/5' : 'border-border bg-muted/20 opacity-60'} transition-all`}>
                      <div className="flex flex-col gap-1">
                        <button 
                          type="button"
                          onClick={() => {
                            if (index === 0) return
                            const newRules = [...tieBreakerRules]
                            const [moved] = newRules.splice(index, 1)
                            newRules.splice(index - 1, 0, moved)
                            setTieBreakerRules(newRules)
                          }}
                          className="p-1 hover:text-accent-blue transition-colors disabled:opacity-30"
                          disabled={index === 0}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            if (index === tieBreakerRules.length - 1) return
                            const newRules = [...tieBreakerRules]
                            const [moved] = newRules.splice(index, 1)
                            newRules.splice(index + 1, 0, moved)
                            setTieBreakerRules(newRules)
                          }}
                          className="p-1 hover:text-accent-blue transition-colors disabled:opacity-30"
                          disabled={index === tieBreakerRules.length - 1}
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-black text-sm uppercase tracking-tight">{rule.label}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Priority {index + 1}</p>
                      </div>

                      <button 
                        type="button"
                        onClick={() => {
                          const newRules = [...tieBreakerRules]
                          newRules[index].active = !newRules[index].active
                          setTieBreakerRules(newRules)
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${rule.active ? 'bg-accent-blue text-white' : 'bg-muted text-muted-foreground'}`}
                      >
                        {rule.active ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsTieBreakerModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl bg-muted font-black uppercase tracking-widest text-xs hover:bg-muted/80 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsTieBreakerModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl bg-accent-blue text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-accent-blue/30 hover:bg-accent-blue/90 transition-all"
                  >
                    Apply Order
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
