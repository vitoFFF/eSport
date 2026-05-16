'use client'

import { useState } from 'react'
import { updateProfile, respondToInvite, leaveTeam } from '@/actions/profile'
import { User, Gamepad2, Save, CheckCircle2, AlertCircle, Trophy, Users, Star, Swords, Calendar, ChevronRight, Target, Zap, Rocket, BadgeCheck, LayoutDashboard, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/lib/LanguageContext'
import Link from 'next/link'

interface PlayerProfileProps {
  profile: any
  playerTeams?: any[]
  teamInvites?: any[]
  stats?: {
    matchesPlayed: number
    wins: number
    mvpAwards: number
  }
  registeredTournaments?: any[]
}

const AVAILABLE_GAMES = [
  'Valorant', 'League of Legends', 'CS:GO', 'Dota 2',
  'Rocket League', 'FIFA', 'Call of Duty', 'Overwatch 2'
]

const MOCK_MATCHES = [
  { id: 1, tournament: 'Global Qualifiers', opponent: 'Shadow Realm', score: '2 - 0', result: 'WIN', date: '2 days ago', category: 'Valorant' },
  { id: 2, tournament: 'Sunday Cup', opponent: 'Team Liquid', score: '1 - 2', result: 'LOSS', date: '5 days ago', category: 'CS:GO' },
  { id: 3, tournament: 'Pro Series S4', opponent: 'Alpha Squad', score: '3 - 0', result: 'WIN', date: '1 week ago', category: 'League of Legends' },
]

const MOCK_ACHIEVEMENTS = [
  { id: 1, name: 'First Victory', description: 'Win your first competitive match', icon: <Trophy size={20} />, earned: true },
  { id: 2, name: 'Team Player', description: 'Join your first professional team', icon: <Users size={20} />, earned: true },
  { id: 3, name: 'Rising Star', description: 'Reach top 5000 global ranking', icon: <Star size={20} />, earned: true },
  { id: 4, name: 'Marathoner', description: 'Play 50 matches in a single season', icon: <Rocket size={20} />, earned: true },
  { id: 5, name: 'Veteran', description: 'Maintain active status for 6 months', icon: <BadgeCheck size={20} />, earned: false },
  { id: 6, name: 'Champion', description: 'Win a prestige tournament', icon: <Trophy size={20} />, earned: false },
  { id: 7, name: 'Precision King', description: 'Achieve 75% headshot ratio', icon: <Target size={20} />, earned: true },
  { id: 8, name: 'Unstoppable', description: 'Maintain a 10-match win streak', icon: <Zap size={20} />, earned: true },
  { id: 9, name: 'Master Tactician', description: 'Lead team as captain in 20 matches', icon: <LayoutDashboard size={20} />, earned: false },
]

const MOCK_HIGHLIGHTS = [
  { id: 1, title: 'Triple Kill Clutch', game: 'Valorant', date: '12 June', thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop', type: 'video' },
  { id: 2, title: 'Tournament Winning Goal', game: 'Football', date: '05 May', thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=400&auto=format&fit=crop', type: 'photo' },
  { id: 3, title: 'Rank Up: Immortal', game: 'Valorant', date: '01 May', thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop', type: 'video' },
]

const MOCK_MILESTONES = [
  { id: 1, date: 'May 2026', title: 'Joined MatchPoint', description: 'Started the professional journey', type: 'entry' },
  { id: 2, date: 'June 2026', title: 'First Tournament Win', description: 'Victory in the Sunday Cup', type: 'victory' },
  { id: 3, date: 'July 2026', title: 'Signed by Alpha Squad', description: 'Joined a professional organization', type: 'team' },
]

const RADAR_DATA = [
  { label: 'Strategy', value: 85 },
  { label: 'Teamwork', value: 92 },
  { label: 'Mechanics', value: 78 },
  { label: 'Consistency', value: 88 },
  { label: 'Versatility', value: 70 },
]

const LEADERBOARD_PLAYERS = [
  { rank: 1, name: 'Neon Ninja', points: 2840, winRate: '78%', avatar: null, trend: 'up' },
  { rank: 2, name: 'Cyber Shadow', points: 2710, winRate: '75%', avatar: null, trend: 'down' },
  { rank: 3, name: 'Glitch Ghost', points: 2650, winRate: '72%', avatar: null, trend: 'up' },
  { rank: 4, name: 'Vortex', points: 2590, winRate: '70%', avatar: null, trend: 'up' },
  { rank: 1242, name: 'You', points: 1842, winRate: '68%', avatar: null, trend: 'up', isCurrent: true },
]

export default function PlayerProfile({ profile, playerTeams = [], teamInvites = [], stats, registeredTournaments = [] }: PlayerProfileProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'achievements' | 'activity' | 'rosters'>('achievements')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const winRate = stats?.matchesPlayed && stats.matchesPlayed > 0 
    ? Math.round((stats.wins / stats.matchesPlayed) * 100) 
    : 0;

  const tabItems = [
    { id: 'achievements', label: t("dashboard.overview"), icon: <Star size={14} /> },
    { id: 'activity', label: t("dashboard.arena"), icon: <Rocket size={14} /> },
    { id: 'rosters', label: t("dashboard.personal"), icon: <Users size={14} /> },
  ]

  return (
    <div className="space-y-12 pb-24">
      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
          }`}>
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Win Rate" value={`${winRate}%`} sub="Career Average" icon={<Trophy size={20} className="text-amber-400" />} />
        <StatCard label={t("dashboard.matches")} value={stats?.matchesPlayed?.toString() || "0"} sub="Career Total" icon={<Gamepad2 size={20} className="text-accent-blue" />} />
        <StatCard label="Active Teams" value={playerTeams.length.toString()} sub="Competing In" icon={<Users size={20} className="text-accent-purple" />} />
        <StatCard label={t("dashboard.mvp")} value={stats?.mvpAwards?.toString() || "0"} sub="Achievements" icon={<Star size={20} className="text-pink-500" />} trend={stats?.mvpAwards && stats.mvpAwards > 0 ? "Verified" : undefined} />
      </div>

      {/* Top Row: Analytics & History (Side by Side) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        {/* Performance Analysis - Skill Matrix */}
        <div className="xl:col-span-7 p-12 dash-card relative overflow-hidden group flex flex-col justify-center min-h-[500px]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-blue/5 blur-[120px] -z-10 group-hover:bg-accent-blue/10 transition-colors duration-1000" />
          <h3 className="text-xl font-black flex items-center gap-4 uppercase tracking-tight mb-12">
            <Target size={26} className="text-accent-blue" />
            Skill Matrix
          </h3>
          <div className="flex flex-col xl:flex-row gap-16 items-center">
            <div className="w-full xl:w-2/5 space-y-8">
              {RADAR_DATA.map(stat => (
                <div key={stat.label} className="space-y-3">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em]">
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className="text-accent-blue">{stat.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden p-[2px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.value}%` }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className="h-full bg-gradient-to-r from-accent-blue via-accent-purple to-accent-blue bg-[length:200%_100%] animate-shimmer rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="w-full xl:w-3/5 flex justify-center scale-150 transform-gpu">
              <RadarChart data={RADAR_DATA} />
            </div>
            <ComingSoonOverlay message="Skill Matrix Unlocks After 5 Ranked Matches" />
          </div>
        </div>

        {/* My Tournaments */}
        <div className="xl:col-span-5 space-y-6 flex flex-col">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-black flex items-center gap-4 uppercase tracking-tight">
              <Trophy size={26} className="text-accent-blue" />
              {t("dashboard.myTournaments")}
            </h3>
            <Link href="/tournaments" className="text-[10px] font-black uppercase tracking-widest text-accent-blue hover:underline">
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="space-y-4 flex-grow relative overflow-y-auto max-h-[500px] no-scrollbar">
            {registeredTournaments.length > 0 ? (
              registeredTournaments.map((tournament, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={tournament.id}
                  className="p-7 dash-card transition-all group hover:scale-[1.01] flex flex-col justify-center"
                >
                  <Link href={`/tournaments/${tournament.id}`}>
                    <div className="flex items-center justify-between gap-8">
                      <div className="flex items-center gap-8">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner ${
                          tournament.status === 'ongoing' || tournament.status === 'open' 
                            ? 'bg-accent-blue/10 text-accent-blue' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {tournament.status === 'ongoing' || tournament.status === 'open' ? <Zap size={24} /> : <CheckCircle2 size={24} />}
                        </div>
                        <div>
                          <p className="font-black text-lg tracking-tight group-hover:text-accent-blue transition-colors truncate max-w-[200px]">
                            {tournament.name}
                          </p>
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
                            {tournament.status === 'ongoing' || tournament.status === 'open' 
                              ? t("dashboard.ongoing") 
                              : t("dashboard.completed")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <ChevronRight size={20} className="text-muted-foreground group-hover:text-accent-blue transition-colors" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-50 h-full">
                 <Trophy size={48} className="mb-4 text-muted-foreground" />
                 <p className="text-sm font-bold uppercase tracking-widest">{t("dashboard.noTournaments")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Second Row: Global Rank & Tabbed Panel & Persona Update */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
        {/* Global Rank Card */}
        <div className="xl:col-span-5 flex flex-col">
          <div className="p-10 dash-card relative overflow-hidden group flex-grow">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-3xl -z-10" />
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black flex items-center gap-4 uppercase tracking-tight">
                <Trophy size={26} className="text-amber-500" />
                Global Rank
              </h3>
              <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest text-amber-600">
                Season 4
              </div>
            </div>

            <ComingSoonOverlay message="Global Ranking System in Development" />

            <div className="space-y-4">
              {LEADERBOARD_PLAYERS.map((player) => (
                <div
                  key={player.rank}
                  className={`p-5 rounded-2xl flex items-center justify-between transition-all group/player ${player.isCurrent
                    ? 'bg-accent-blue/10 border border-accent-blue/20 shadow-lg shadow-accent-blue/5'
                    : 'hover:bg-muted/50 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${player.rank === 1 ? 'bg-amber-500 text-white' :
                      player.rank === 2 ? 'bg-slate-400 text-white' :
                        player.rank === 3 ? 'bg-amber-700 text-white' :
                          'bg-muted text-muted-foreground'
                      }`}>
                      {player.rank > 3 ? `#${player.rank}` : player.rank}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-muted to-border flex items-center justify-center text-xs font-bold text-muted-foreground shadow-inner">
                        {player.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className={`text-base font-black tracking-tight ${player.isCurrent ? 'text-accent-blue' : ''}`}>
                          {player.name}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{player.winRate} Win Rate</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black tracking-tight">{player.points.toLocaleString()} RP</p>
                    <div className={`flex items-center justify-end gap-1.5 mt-1 ${player.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {player.trend === 'up' ? 'climbing' : 'falling'}
                      </span>
                      {player.trend === 'up' ? <Rocket size={10} /> : <Target size={10} />}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 p-7 rounded-3xl bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-1">Next Milestone</p>
                <p className="text-sm font-black tracking-tight text-foreground">Top 1000 Entry</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-amber-600">-158 RP</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recruitment & Tabbed Panel */}
        <div className="xl:col-span-4 flex flex-col">
          {teamInvites && teamInvites.length > 0 && (
            <div className="space-y-6 p-8 rounded-[2.5rem] border border-amber-500/20 bg-amber-500/[0.03] shadow-lg mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Recruitment Center
              </h3>
              <div className="space-y-4">
                {teamInvites.map((team: any) => (
                  <div key={team.id} className="p-5 rounded-2xl bg-card border border-amber-500/10 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="font-black text-foreground text-sm tracking-tight">{team.name}</p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{team.organizations?.name}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <form action={async (formData) => {
                        formData.append('teamId', team.team_id)
                        formData.append('accept', 'true')
                        const res = await respondToInvite(formData)
                        if (res.error) setMessage({ type: 'error', text: res.error })
                      }} className="w-full">
                        <button className="w-full py-2.5 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">Accept</button>
                      </form>
                      <form action={async (formData) => {
                        formData.append('teamId', team.team_id)
                        formData.append('accept', 'false')
                        await respondToInvite(formData)
                      }} className="w-full">
                        <button className="w-full py-2.5 rounded-xl bg-muted border border-border text-muted-foreground text-[10px] font-black uppercase tracking-widest hover:bg-muted/80 transition-colors">Decline</button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col h-full">
            <div className="p-1.5 mb-6 rounded-2xl bg-muted/30 backdrop-blur-[15px] border border-border/50 flex items-center gap-1">
              {tabItems.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${isActive
                      ? 'text-accent-blue'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 bg-accent-blue/10 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.15)] z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {tab.icon}
                      {tab.label}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex-grow">
              <AnimatePresence mode="wait">
                {activeTab === 'activity' && (
                  <motion.div
                    key="activity"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 p-10 dash-card relative overflow-hidden group flex-grow h-full"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent-blue/5 blur-2xl -z-10 group-hover:bg-accent-blue/10 transition-colors" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-3 mb-8">
                      <Rocket size={18} className="text-accent-blue" />
                      Timeline
                    </h3>
                    <div className="space-y-8 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-border flex-grow">
                      {MOCK_MILESTONES.map((milestone) => (
                        <div key={milestone.id} className="relative pl-10">
                          <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-card flex items-center justify-center z-10 ${milestone.type === 'victory' ? 'bg-amber-500' : milestone.type === 'team' ? 'bg-accent-purple' : 'bg-accent-blue'
                            }`}>
                            {milestone.type === 'victory' ? <Trophy size={14} className="text-white" /> : milestone.type === 'team' ? <Users size={14} className="text-white" /> : <Zap size={14} className="text-white" />}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{milestone.date}</p>
                            <p className="font-black text-xs tracking-tight leading-none">{milestone.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'rosters' && (
                  <motion.div
                    key="rosters"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 p-10 dash-card flex-grow h-full"
                  >
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-3 mb-8">
                      <Users size={18} className="text-accent-purple" />
                      Rosters
                    </h3>
                    <div className="space-y-4 flex-grow">
                      {playerTeams.length > 0 ? (
                        playerTeams.map((team: any) => (
                          <div key={team.id} className="p-5 rounded-2xl bg-muted/30 border border-border group hover:border-accent-purple/30 transition-all">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center text-accent-purple font-black text-xs">
                                  {team.category.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-black text-foreground text-sm tracking-tight">{team.name}</p>
                                  <p className="text-[9px] font-black text-accent-purple uppercase tracking-widest">{team.category}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Member since 2026</p>
                              <form action={async (formData) => {
                                if (!window.confirm('Are you sure you want to leave this team?')) return;
                                formData.append('teamId', team.team_id)
                                const res = await leaveTeam(formData)
                                if (res.error) setMessage({ type: 'error', text: res.error })
                              }}>
                                <button type="submit" className="text-[9px] uppercase font-black text-red-500 hover:text-red-400 tracking-widest transition-colors">Leave</button>
                              </form>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center space-y-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground/30">
                            <Users size={20} />
                          </div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No active teams</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'achievements' && (
                  <motion.div
                    key="achievements"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6 p-10 dash-card relative overflow-hidden flex-grow h-full"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent-purple/10 blur-3xl -z-10" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-foreground flex items-center gap-3 mb-8">
                      <Star size={18} className="text-accent-purple" />
                      Hall of Fame
                    </h3>
                    <div className="grid grid-cols-3 gap-6 flex-grow">
                      {MOCK_ACHIEVEMENTS.map((achievement) => (
                        <AchievementBadge key={achievement.id} achievement={achievement} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Highlights Card (Replaced Update Persona) */}
        <div className="xl:col-span-3 flex flex-col">
          <div className="p-8 dash-card relative overflow-hidden group h-full flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/5 blur-3xl -z-10 group-hover:bg-accent-purple/10 transition-colors" />

            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-3">
                <Zap size={18} className="text-accent-purple" />
                Top Highlights
              </h3>
              <button className="text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-accent-purple transition-colors">
                View All
              </button>
            </div>

            <ComingSoonOverlay message="Media Highlights Coming Soon" />

            <div className="space-y-4 flex-grow overflow-y-auto no-scrollbar">
              {MOCK_HIGHLIGHTS.map((highlight) => (
                <div key={highlight.id} className="relative rounded-2xl overflow-hidden group/item cursor-pointer aspect-video border border-border/50">
                  <img
                    src={highlight.thumbnail}
                    alt={highlight.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 opacity-100 group-hover/item:opacity-90 transition-opacity">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-white leading-tight mb-1">{highlight.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-bold text-accent-purple uppercase tracking-widest">{highlight.game}</span>
                          <span className="text-[8px] font-bold text-white/40 uppercase">{highlight.date}</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-transform group-hover/item:scale-110">
                        {highlight.type === 'video' ? <Zap size={14} /> : <Star size={14} />}
                      </div>
                    </div>
                  </div>
                  {highlight.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-accent-purple flex items-center justify-center text-white shadow-xl shadow-accent-purple/20">
                        <Rocket size={24} className="fill-current" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-6 mt-6 border-t border-border/50">
              <button className="w-full py-4 rounded-xl bg-muted/50 border border-dashed border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all hover:border-accent-purple/50 group/add">
                <span className="flex items-center justify-center gap-2 group-hover/add:text-accent-purple">
                  Upload Moment +
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AchievementBadge({ achievement }: { achievement: any }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePos({ x: 0, y: 0 });
      }}
      style={{
        perspective: 1000,
      }}
      className="relative group/badge aspect-square"
    >
      <motion.div
        animate={{
          rotateY: mousePos.x * 30,
          rotateX: -mousePos.y * 30,
          scale: isHovering ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        title={`${achievement.name}: ${achievement.description}`}
        className={`w-full h-full rounded-2xl flex items-center justify-center transition-all cursor-help relative overflow-hidden border shadow-2xl ${achievement.earned
            ? 'bg-gradient-to-br from-accent-blue/10 via-accent-purple/10 to-pink-500/10 border-accent-blue/20 text-accent-blue'
            : 'bg-muted/30 border-border text-muted-foreground opacity-30'
          }`}
      >
        {/* Shine Effect */}
        {isHovering && achievement.earned && (
          <motion.div
            className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/30 to-transparent z-10"
            animate={{
              opacity: [0.3, 0.5, 0.3],
              x: mousePos.x * 50,
              y: mousePos.y * 50,
            }}
          />
        )}

        {/* Ambient Glow */}
        {achievement.earned && (
          <div className="absolute -inset-1 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 blur-xl opacity-0 group-hover/badge:opacity-100 transition-opacity" />
        )}

        {/* Inner Content */}
        <div className="relative z-20 transform-gpu group-hover/badge:scale-125 transition-transform duration-500">
          {achievement.icon}
        </div>

        {/* Highlight Ring */}
        {achievement.earned && (
          <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
        )}
      </motion.div>
    </motion.div>
  );
}

function StatCard({ label, value, sub, icon, trend }: { label: string, value: string, sub: string, icon: React.ReactNode, trend?: string }) {
  return (
    <div className="p-6 dash-card group transition-all relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
            {icon}
          </div>
          {trend && (
            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${trend === 'New' ? 'bg-pink-500/10 text-pink-500' : 'bg-emerald-500/10 text-emerald-500'
              }`}>
              {trend}
            </span>
          )}
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black tracking-tight">{value}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase">{sub}</p>
        </div>
      </div>
    </div>
  )
}

function RadarChart({ data }: { data: { label: string, value: number }[] }) {
  const size = 200;
  const center = size / 2;
  const radius = size * 0.4;

  // Calculate points
  const points = data.map((d, i) => {
    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
    const r = (radius * d.value) / 100;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      labelX: center + (radius + 20) * Math.cos(angle),
      labelY: center + (radius + 20) * Math.sin(angle),
    };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="relative">
      <svg width={size + 40} height={size + 40} viewBox={`-20 -20 ${size + 40} ${size + 40}`}>
        {/* Background Grid */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((tick) => (
          <polygon
            key={tick}
            points={data.map((_, i) => {
              const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
              const r = radius * tick;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(' ')}
            className="fill-none stroke-border stroke-1"
          />
        ))}

        {/* Axes */}
        {data.map((_, i) => {
          const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              className="stroke-border stroke-1"
            />
          );
        })}

        {/* Data Polygon */}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d={pathData}
          className="fill-accent-blue/20 stroke-accent-blue stroke-2"
        />

        {/* Data Points */}
        {points.map((p, i) => (
          <motion.circle
            initial={{ r: 0 }}
            animate={{ r: 3 }}
            transition={{ delay: 1 + i * 0.1 }}
            key={i}
            cx={p.x}
            cy={p.y}
            className="fill-accent-blue shadow-lg"
          />
        ))}
      </svg>
    </div>
  );
}

function ComingSoonOverlay({ message }: { message: string }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-background/40 backdrop-blur-[6px] transition-all group-hover:backdrop-blur-[8px]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue shadow-[0_0_30px_rgba(37,99,235,0.2)]">
          <Lock size={28} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-foreground mb-1">Feature Locked</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest max-w-[150px] mx-auto leading-relaxed">
            {message}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
