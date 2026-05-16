'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Trophy, Edit3, X, Check, Loader2, Sparkles, LayoutGrid, Calendar } from 'lucide-react'
import { updateMatchScore, generateBracketMatches, generateNextSwissRound, GameData } from '@/actions/matches'
 
const CARD_HEIGHT = 120
const VERTICAL_GAP = 48
const HORIZONTAL_GAP = 48
 
interface Match {
  id: string
  home_team?: { name: string, avatar_url?: string }
  away_team?: { name: string, avatar_url?: string }
  home_score?: number
  away_score?: number
  bracket_round: number
  match_order: number
  status: string
  winner_team_id?: string
  home_team_id?: string
  away_team_id?: string
}

interface BracketViewProps {
  matches: any[]
  registrations?: any[]
  totalParticipants?: number
  isOrganizer?: boolean
  tournamentId?: string
  bracketStructure?: string
  matchFormat?: string
  currentUserId?: string
}

const getRoundName = (roundIdx: number, totalRounds: number) => {
  if (totalRounds <= 1) return 'Final'
  if (roundIdx === totalRounds - 1) return 'Final'
  if (roundIdx === totalRounds - 2) return 'Semi-Final'
  if (roundIdx === totalRounds - 3) return 'Quarter-Final'
  return `Round ${roundIdx + 1}`
}

export default function BracketView({
  matches,
  registrations = [],
  totalParticipants = 8,
  isOrganizer = false,
  tournamentId,
  bracketStructure = 'single_elimination',
  matchFormat = 'bo1',
  currentUserId
}: BracketViewProps) {
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingRound, setIsGeneratingRound] = useState(false)
  const [editGames, setEditGames] = useState<GameData[]>([])
  const [isWalkover, setIsWalkover] = useState(false)
  const [walkoverWinner, setWalkoverWinner] = useState<string | null>(null)
  const [activeGroupIdx, setActiveGroupIdx] = useState(0)
  const [activeRoundIdx, setActiveRoundIdx] = useState(0)
  const router = useRouter()

  // Normalize participants and matches
  const normalizedParticipants = React.useMemo(() => {
    return registrations.map(reg => ({
      id: reg.team_id || reg.player_id,
      name: reg.teams?.name || reg.profiles?.username || reg.profiles?.full_name || 'Unknown',
      avatar_url: reg.teams?.avatar_url || reg.profiles?.avatar_url
    }))
  }, [registrations])

  // Skeleton generation or Real match normalization
  const displayMatches = React.useMemo(() => {
    // If we have real matches, normalize their team/player names
    if (matches && matches.length > 0) {
      return matches.map(m => ({
        ...m,
        home_team: m.home_team || (m.home_player ? {
          name: m.home_player.username || m.home_player.full_name,
          avatar_url: m.home_player.avatar_url
        } : null),
        away_team: m.away_team || (m.away_player ? {
          name: m.away_player.username || m.away_player.full_name,
          avatar_url: m.away_player.avatar_url
        } : null)
      }))
    }

    const skeleton: any[] = []
    const participantsCount = Number(totalParticipants) || 8

    if (bracketStructure === 'double_elimination') {
      const rounds = Math.ceil(Math.log2(participantsCount))

      // 1. Winners Bracket Skeleton
      for (let r = 0; r < rounds; r++) {
        const matchesInRound = Math.pow(2, rounds - r - 1)
        for (let m = 0; m < matchesInRound; m++) {
          const homeParticipant = r === 0 ? normalizedParticipants[m * 2] : null
          const awayParticipant = r === 0 ? normalizedParticipants[m * 2 + 1] : null
          skeleton.push({
            id: `skeleton-winners-${r}-${m}`,
            bracket_round: r,
            match_order: m,
            status: 'pending',
            home_team: homeParticipant,
            away_team: awayParticipant,
            details: { bracket: 'winners' }
          })
        }
      }

      // 2. Losers Bracket Skeleton
      let lbRoundCount = (rounds - 1) * 2
      for (let r = 0; r < lbRoundCount; r++) {
        const wbRoundEq = Math.floor(r / 2)
        const matchesInRound = Math.pow(2, rounds - wbRoundEq - 2)
        for (let m = 0; m < matchesInRound; m++) {
          skeleton.push({
            id: `skeleton-losers-${r}-${m}`,
            bracket_round: 10 + r,
            match_order: m,
            status: 'pending',
            details: {
              bracket: 'losers',
              phase: r % 2 === 0 ? 'survival' : 'drop-in'
            }
          })
        }
      }

      // 3. Grand Finals
      skeleton.push({
        id: `skeleton-gf`,
        bracket_round: 20,
        match_order: 0,
        status: 'pending',
        details: { bracket: 'grand_finals' }
      })
      skeleton.push({
        id: `skeleton-gf-reset`,
        bracket_round: 21,
        match_order: 0,
        status: 'pending',
        details: { bracket: 'grand_finals_reset' }
      })

      return skeleton
    }

    if (['single_elimination', 'swiss_system'].includes(bracketStructure)) {
      let currentRoundParticipants = participantsCount
      let roundIdx = 0

      while (currentRoundParticipants > 1) {
        const matchesInRound = Math.floor(currentRoundParticipants / 2)
        for (let i = 0; i < matchesInRound; i++) {
          const homeParticipant = roundIdx === 0 ? normalizedParticipants[i * 2] : null
          const awayParticipant = roundIdx === 0 ? normalizedParticipants[i * 2 + 1] : null

          skeleton.push({
            id: `skeleton-${roundIdx}-${i}`,
            bracket_round: roundIdx,
            match_order: i,
            status: 'pending',
            home_team: homeParticipant,
            away_team: awayParticipant
          })
        }
        currentRoundParticipants = matchesInRound
        roundIdx++
      }
    }
    return skeleton
  }, [matches, totalParticipants, bracketStructure, normalizedParticipants])

  // Group matches by round for single/double/swiss
  const roundsMap = displayMatches.reduce((acc, match) => {
    const round = match.bracket_round
    if (!acc[round]) acc[round] = []
    acc[round].push(match)
    return acc
  }, {} as Record<number, any[]>)

  const sortedRoundIds = Object.keys(roundsMap).map(Number).sort((a: number, b: number) => a - b)
  const totalRounds = sortedRoundIds.length

  const handleEditClick = (match: any) => {
    if (match.id && match.id.toString().includes('skeleton')) return
    setSelectedMatch(match)
    
    let gamesCount = 1
    if (matchFormat === 'bo3') gamesCount = 3
    if (matchFormat === 'bo5') gamesCount = 5

    const existingGames = match.details?.games || []
    const games: GameData[] = Array.from({ length: gamesCount }).map((_, i) => {
      if (existingGames[i]) return existingGames[i]
      return {
        game_id: i + 1,
        home_score: 0,
        away_score: 0,
        winner_id: null,
        home_forfeit: false,
        away_forfeit: false
      }
    })

    setEditGames(games)
    setIsWalkover(match.details?.is_walkover || false)
    setWalkoverWinner(match.details?.is_walkover ? (match.winner_team_id || match.winner_player_id) : null)
  }

  const handleGenerateBracket = async () => {
    if (!tournamentId) return
    setIsGenerating(true)
    const result = await generateBracketMatches(tournamentId)
    if (result.error) {
      alert(result.error)
    }
    setIsGenerating(false)
  }

  const handleGenerateNextRound = async () => {
    if (!tournamentId) return
    setIsGeneratingRound(true)
    const res = await generateNextSwissRound(tournamentId)
    if (res.error) {
      alert(res.error)
    }
    setIsGeneratingRound(false)
  }

  const handleSaveScore = async () => {
    if (!selectedMatch) return
    setIsSubmitting(true)

    let winnerId: string | null = null
    if (isWalkover && walkoverWinner) {
       winnerId = walkoverWinner
    }

    const result = await updateMatchScore(
      selectedMatch.id,
      editGames,
      isWalkover,
      winnerId || undefined
    )

    if (result.success) {
      if (result.message) alert(result.message)
      setSelectedMatch(null)
      router.refresh()
    } else {
      alert(result.error || 'Failed to update score')
    }
    setIsSubmitting(false)
  }

  const MatchConnector = ({ roundIdx, verticalReach, totalRoundsForBracket }: { roundIdx: number, verticalReach: number, totalRoundsForBracket: number }) => {
    if (roundIdx >= totalRoundsForBracket - 1) return null

    const width = HORIZONTAL_GAP
    const height = Math.abs(verticalReach) + 4
    
    const pathYStart = verticalReach > 0 ? 2 : Math.abs(verticalReach) + 2
    const pathYEnd = verticalReach > 0 ? verticalReach + 2 : 2
    
    const d = verticalReach === 0
      ? `M 0,2 L ${width},2`
      : `M 0,${pathYStart} C ${width/2},${pathYStart} ${width/2},${pathYEnd} ${width},${pathYEnd}`

    return (
      <div 
        className="absolute z-0 pointer-events-none" 
        style={{ 
          width: HORIZONTAL_GAP, 
          height: Math.max(4, Math.abs(verticalReach)),
          right: -HORIZONTAL_GAP,
          top: verticalReach >= 0 ? '50%' : `calc(50% - ${Math.abs(verticalReach)}px)`
        }}
      >
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" className="overflow-visible">
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: roundIdx * 0.1 }}
            d={d}
            stroke="url(#bracket-connector-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            className="drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
          />
        </svg>
      </div>
    )
  }

  const renderMatchCard = (match: any, matchIdx: number, roundIdx: number, totalRoundsForBracket: number, reach: number = 0) => {
    const isSkeleton = match.id && match.id.toString().includes('skeleton')
    const isWinnerHome = (match.winner_team_id && match.winner_team_id === match.home_team_id) || (match.winner_player_id && match.winner_player_id === match.home_player_id)
    const isWinnerAway = (match.winner_team_id && match.winner_team_id === match.away_team_id) || (match.winner_player_id && match.winner_player_id === match.away_player_id)
    const isConfirmed = match.status === 'confirmed'
    const isLive = match.status === 'in_progress'
    const isDraw = isConfirmed && match.home_score === match.away_score && match.home_score !== null

    const isPlayerInMatch = currentUserId && (match.home_player_id === currentUserId || match.away_player_id === currentUserId || match.home_team_id === currentUserId || match.away_team_id === currentUserId)
    const canEdit = (isOrganizer || isPlayerInMatch) && !isSkeleton && !isConfirmed

    return (
      <div key={match.id} className="relative group" style={{ height: CARD_HEIGHT }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: (roundIdx * 0.1) + (matchIdx * 0.05) }}
          onClick={() => canEdit && handleEditClick(match)}
          className={`relative z-10 w-full h-full rounded-[2.5rem] border transition-all duration-700 overflow-hidden flex flex-col group/card ${
            isLive ? 'border-accent-blue/30 bg-accent-blue/5 shadow-[0_30px_60px_-12px_rgba(37,99,235,0.15)]' : 
            'border-white/40 border-t-white/80 bg-white/60 backdrop-blur-3xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] hover:border-white/60 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.18)]'
          } ${isSkeleton ? 'opacity-30 grayscale' : ''} ${canEdit ? 'cursor-pointer hover:-translate-y-2' : ''}`}
        >
          {/* Subtle Rim Light Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none opacity-50" />
          {/* Decorative Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-accent-purple/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700" />
          {/* Status Badges */}
          <div className="absolute top-4 left-6 flex items-center gap-2 z-20">
            {isLive && (
              <div className="flex items-center gap-2 bg-accent-blue px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(37,99,235,0.2)]">
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Live</span>
              </div>
            )}
            {match.status === 'submitted' && (
              <div className="flex items-center gap-2 bg-amber-500 px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(245,158,11,0.2)]">
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Pending Verification</span>
              </div>
            )}
            {match.status === 'disputed' && (
              <div className="flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(239,68,68,0.2)]">
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">Disputed</span>
              </div>
            )}
          </div>

          {canEdit && (
            <div className="absolute top-3 right-3 p-2 rounded-xl bg-accent-blue/10 opacity-0 group-hover/card:opacity-100 transition-all transform hover:scale-110">
              <Edit3 size={14} className="text-accent-blue" />
            </div>
          )}

          {/* Home Team */}
          <div className={`flex-1 px-8 flex items-center justify-between relative transition-all duration-700 ${isWinnerHome ? 'bg-accent-blue/5' : ''}`}>
            <div className="flex items-center gap-5">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border transition-all duration-700 group-hover/card:scale-110 ${isWinnerHome ? 'border-accent-blue/20 shadow-md bg-white' : 'border-slate-100 bg-slate-50/50 shadow-inner'}`}>
                {match.home_team?.avatar_url ? (
                  <img src={match.home_team.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <Users size={22} className="text-slate-300" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-[15px] font-bold tracking-tight truncate max-w-[150px] uppercase transition-colors ${isWinnerHome ? 'text-accent-blue' : isConfirmed && !isWinnerHome ? 'text-slate-400' : 'text-slate-900'}`}>
                  {match.home_team?.name || 'TBD'}
                </span>
                {isWinnerHome && <span className="text-[9px] font-black text-accent-blue/50 uppercase tracking-[0.2em] leading-none mt-1.5">Winner</span>}
              </div>
            </div>
            <div className={`h-11 w-14 flex items-center justify-center rounded-2xl font-black text-xl transition-all duration-700 ${
              isWinnerHome ? 'bg-gradient-to-br from-accent-blue to-accent-purple text-white shadow-[0_12px_24px_-5px_rgba(37,99,235,0.3)] scale-110' : 
              'bg-white text-slate-400 border border-slate-100 shadow-sm'
            }`}>
              {match.home_score ?? '-'}
            </div>
          </div>

          {/* Central Separator */}
          <div className="h-px w-full bg-slate-100/50 relative">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-white rounded-full border border-slate-100 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] shadow-md z-10">VS</div>
          </div>

          {/* Away Team */}
          <div className={`flex-1 px-8 flex items-center justify-between transition-all duration-700 ${isWinnerAway ? 'bg-accent-blue/5' : ''}`}>
            <div className="flex items-center gap-5">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border transition-all duration-700 group-hover/card:scale-110 ${isWinnerAway ? 'border-accent-blue/20 shadow-md bg-white' : 'border-slate-100 bg-slate-50/50 shadow-inner'}`}>
                {match.away_team?.avatar_url ? (
                  <img src={match.away_team.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <Users size={22} className="text-slate-300" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-[15px] font-bold tracking-tight truncate max-w-[150px] uppercase transition-colors ${isWinnerAway ? 'text-accent-blue' : isConfirmed && !isWinnerAway ? 'text-slate-400' : 'text-slate-900'}`}>
                  {match.away_team?.name || 'TBD'}
                </span>
                {isWinnerAway && <span className="text-[9px] font-black text-accent-blue/60 uppercase tracking-[0.2em] leading-none mt-1.5">Winner</span>}
              </div>
            </div>
            <div className={`h-11 w-14 flex items-center justify-center rounded-2xl font-black text-xl transition-all duration-700 ${
              isWinnerAway ? 'bg-gradient-to-br from-accent-blue to-accent-purple text-white shadow-[0_12px_24px_-5px_rgba(37,99,235,0.3)] scale-110' : 
              'bg-white text-slate-400 border border-slate-100 shadow-sm'
            }`}>
              {match.away_score ?? '-'}
            </div>
          </div>
        </motion.div>

        {/* Connecting Lines */}
        <MatchConnector roundIdx={roundIdx} verticalReach={reach} totalRoundsForBracket={totalRoundsForBracket} />
      </div>
    )
  }
  const renderSingleElimination = () => {
    const rounds = displayMatches.filter(m => m.details?.bracket === 'winners' || (!m.details?.bracket && m.bracket_round < 50))
    const thirdPlaceMatch = displayMatches.find(m => m.details?.bracket === 'third_place' || m.bracket_round === 99)

    const roundsMapSingle = rounds.reduce((acc, m) => {
      if (!acc[m.bracket_round]) acc[m.bracket_round] = []
      acc[m.bracket_round].push(m)
      return acc
    }, {} as any)

    const sortedIds = Object.keys(roundsMapSingle).map(Number).sort((a, b) => a - b)

    return (
      <div className="space-y-12 py-10">
        <div className="flex gap-12 min-w-max pb-8 items-center">
          {sortedIds.map((roundId, roundIdx) => {
            // Calculate dynamic spacing to keep parent centered between children
            // The gap increases exponentially to keep the matches aligned as the tree branches
            const currentVerticalGap = roundIdx === 0 
                ? VERTICAL_GAP 
                : (Math.pow(2, roundIdx) * (CARD_HEIGHT + VERTICAL_GAP)) - CARD_HEIGHT

            return (
              <div key={roundId} className="flex flex-col w-72">
                <div className="text-center pb-12">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-blue bg-accent-blue/10 border border-accent-blue/20 px-6 py-2 rounded-full inline-block luxury-border-glow shadow-lg">
                    {getRoundName(roundIdx, sortedIds.length)}
                  </h4>
                </div>
                <div 
                  className="flex flex-col justify-center"
                  style={{ gap: currentVerticalGap }}
                >
                  {roundsMapSingle[roundId].sort((a: any, b: any) => a.match_order - b.match_order).map((match: any, matchIdx: number) => {
                    const isTop = matchIdx % 2 === 0
                    const reach = (CARD_HEIGHT + currentVerticalGap) / 2 * (isTop ? 1 : -1)
                    return renderMatchCard(match, matchIdx, roundIdx, sortedIds.length, reach)
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {thirdPlaceMatch && (
          <div className="pt-12 border-t border-border/50 border-dashed max-w-sm mx-auto">
            <div className="text-center mb-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 bg-amber-500/10 px-6 py-2 rounded-full inline-block border border-amber-500/20">
                Third-Place Match
              </h4>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Semi-Final Losers</p>
            </div>
            {renderMatchCard(thirdPlaceMatch, 0, 0, 0)}
          </div>
        )}
      </div>
    )
  }

  const renderDoubleElimination = () => {
    const winnersMatches = displayMatches.filter(m => m.details?.bracket === 'winners' || m.bracket_round < 10)
    const losersMatches = displayMatches.filter(m => m.details?.bracket === 'losers' || (m.bracket_round >= 10 && m.bracket_round < 20))
    const gfMatches = displayMatches.filter(m => m.details?.bracket?.startsWith('grand_finals') || m.bracket_round >= 20)

    const winnersRounds = winnersMatches.reduce((acc, m) => {
      if (!acc[m.bracket_round]) acc[m.bracket_round] = []
      acc[m.bracket_round].push(m)
      return acc
    }, {} as any)

    const losersRounds = losersMatches.reduce((acc, m) => {
      if (!acc[m.bracket_round]) acc[m.bracket_round] = []
      acc[m.bracket_round].push(m)
      return acc
    }, {} as any)

    const sortedWinnersIds = Object.keys(winnersRounds).map(Number).sort((a, b) => a - b)
    const sortedLosersIds = Object.keys(losersRounds).map(Number).sort((a, b) => a - b)

    return (
      <div className="space-y-24">
        {/* Winners Bracket */}
        <section>
          <div className="flex items-center gap-4 mb-10">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <Trophy size={20} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-emerald-500">Winners Bracket</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Undefeated Progression</p>
            </div>
          </div>
          <div className="flex gap-12 min-w-max pb-4 items-center">
            {sortedWinnersIds.map((roundId, idx) => {
              const currentVerticalGap = idx === 0 
                ? VERTICAL_GAP 
                : (Math.pow(2, idx) * (CARD_HEIGHT + VERTICAL_GAP)) - CARD_HEIGHT

              return (
                <div key={roundId} className="flex flex-col w-72">
                  <div className="text-center pb-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 bg-emerald-500/10 px-4 py-1 rounded-full inline-block border border-emerald-500/20">
                      {getRoundName(idx, sortedWinnersIds.length)}
                    </h4>
                  </div>
                  <div 
                    className="flex flex-col justify-center"
                    style={{ gap: currentVerticalGap }}
                  >
                    {winnersRounds[roundId].sort((a: any, b: any) => a.match_order - b.match_order).map((match: any, mIdx: number) => {
                      const isTop = mIdx % 2 === 0
                      const reach = (CARD_HEIGHT + currentVerticalGap) / 2 * (isTop ? 1 : -1)
                      return renderMatchCard(match, mIdx, idx, sortedWinnersIds.length, reach)
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Losers Bracket */}
        <section className="pt-12 border-t border-border/50 border-dashed">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-10 w-10 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <X size={20} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-red-500">Losers Bracket</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">One Loss Recovery</p>
            </div>
          </div>
          <div className="flex gap-12 min-w-max pb-4 items-center">
            {sortedLosersIds.map((roundId, idx) => {
              const phase = losersRounds[roundId][0]?.details?.phase || (idx % 2 === 0 ? 'survival' : 'drop-in')
              
              // Spacing in losers bracket is flatter because it doesn't always branch
              const currentVerticalGap = (idx > 0 && phase === 'survival')
                ? (Math.pow(2, Math.floor(idx/2)) * (CARD_HEIGHT + VERTICAL_GAP)) - CARD_HEIGHT
                : VERTICAL_GAP

              return (
                <div key={roundId} className="flex flex-col w-72">
                  <div className="text-center space-y-2 pb-8">
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full inline-block border ${phase === 'survival' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 'text-red-500 bg-red-500/10 border-red-500/20'}`}>
                      {phase === 'survival' ? 'Phase A: Survival' : 'Phase B: Drop-in'}
                    </h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Round {idx + 1}</p>
                  </div>
                  <div 
                    className="flex flex-col justify-center"
                    style={{ gap: currentVerticalGap }}
                  >
                    {losersRounds[roundId].sort((a: any, b: any) => a.match_order - b.match_order).map((match: any, mIdx: number) => {
                      const isTop = mIdx % 2 === 0
                      // In Losers Bracket:
                      // If phase is survival, it's 1-to-1 connection (reach = 0)
                      // If phase is drop-in, it's 2-to-1 connection (reach = branched)
                      
                      // Check if next round exists and has half the matches
                      const nextRoundId = sortedLosersIds[idx + 1]
                      const nextRoundMatches = nextRoundId ? losersRounds[nextRoundId] : []
                      const isBranching = nextRoundMatches.length < losersRounds[roundId].length
                      
                      const reach = isBranching 
                        ? (CARD_HEIGHT + currentVerticalGap) / 2 * (isTop ? 1 : -1)
                        : 0
                        
                      return renderMatchCard(match, mIdx, idx, sortedLosersIds.length, reach)
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Grand Finals */}
        <section className="pt-12 border-t border-border/50 border-dashed">
          <div className="flex items-center justify-center flex-col gap-4 mb-12">
            <div className="h-16 w-16 rounded-3xl bg-accent-blue/10 flex items-center justify-center">
              <Trophy size={32} className="text-accent-blue animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black uppercase tracking-tighter text-accent-blue">Grand Finals</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground max-w-[200px] mt-1 mx-auto">Winners Champion vs Losers Champion</p>
            </div>
          </div>
          <div className="flex justify-center items-center gap-16">
            {gfMatches.sort((a, b) => a.bracket_round - b.bracket_round).map((match, idx) => (
              <div key={match.id} className="w-80">
                <div className="text-center mb-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-purple bg-accent-purple/10 px-6 py-2 rounded-full inline-block border border-accent-purple/20">
                    {idx === 0 ? 'Championship Match' : 'Grand Final Reset'}
                  </h4>
                  {idx === 1 && (
                    <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-2 animate-pulse">If Losers Champion Wins</p>
                  )}
                </div>
                {renderMatchCard(match, idx, 0, 0)}
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  const renderRoundRobin = () => {
    const groupIds = Array.from(new Set(displayMatches.map(m => m.bracket_round))).sort((a, b) => a - b)
    
    // Ensure active group exists
    const currentGroupIdx = groupIds.includes(activeGroupIdx) ? activeGroupIdx : (groupIds[0] || 0)
    const groupMatches = displayMatches.filter(m => m.bracket_round === currentGroupIdx)
    
    // Get unique rounds for this group
    const rounds = Array.from(new Set(groupMatches.map(m => m.details?.rr_round ?? 0))).sort((a, b) => a - b)
    const currentRoundIdx = rounds.includes(activeRoundIdx) ? activeRoundIdx : (rounds[0] || 0)
    
    const roundMatches = groupMatches.filter(m => 
      (m.details?.rr_round ?? 0) === currentRoundIdx && 
      !m.details?.is_bye // Remove BYE/TBD matches from schedule
    )

    // Standings calculation for current group
    const participantIdsInGroup = new Set<string>()
    groupMatches.forEach(m => {
      if (m.home_team_id || m.home_player_id) participantIdsInGroup.add(m.home_team_id || m.home_player_id)
      if (m.away_team_id || m.away_player_id) participantIdsInGroup.add(m.away_team_id || m.away_player_id)
    })

    const groupParticipants = normalizedParticipants.filter(p => participantIdsInGroup.has(p.id))
    
    const stats = groupParticipants.reduce((acc, p) => {
      acc[p.id] = { 
        id: p.id, name: p.name, avatar_url: p.avatar_url, 
        pld: 0, w: 0, d: 0, l: 0, f: 0, sa: 0, pts: 0 
      }
      return acc
    }, {} as any)

    groupMatches.forEach(m => {
      if (m.status === 'confirmed' && !m.details?.is_bye) {
        const homeId = m.home_team_id || m.home_player_id
        const awayId = m.away_team_id || m.away_player_id
        if (!stats[homeId] || !stats[awayId]) return

        stats[homeId].pld++
        stats[awayId].pld++

        const homeScore = m.home_score || 0
        const awayScore = m.away_score || 0
        
        stats[homeId].f += homeScore
        stats[homeId].sa += awayScore
        stats[awayId].f += awayScore
        stats[awayId].sa += homeScore

        if (homeScore > awayScore) {
          stats[homeId].w++; stats[homeId].pts += 3; stats[awayId].l++
        } else if (awayScore > homeScore) {
          stats[awayId].w++; stats[awayId].pts += 3; stats[homeId].l++
        } else {
          stats[homeId].d++; stats[homeId].pts += 1; stats[awayId].d++; stats[awayId].pts += 1
        }
      }
    })

    const standings = Object.values(stats).sort((a: any, b: any) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      const aDiff = a.f - a.sa
      const bDiff = b.f - b.sa
      if (bDiff !== aDiff) return bDiff - aDiff
      return b.f - a.f // Goals For tiebreaker
    })

    return (
      <div className="w-full space-y-12">
        {/* Group Navigation */}
        {groupIds.length > 1 && (
          <div className="flex flex-wrap gap-2 p-1.5 bg-muted/30 rounded-2xl border border-border w-fit mx-auto mb-8">
            {groupIds.map((gid) => (
              <button
                key={gid}
                onClick={() => setActiveGroupIdx(gid)}
                className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  currentGroupIdx === gid 
                    ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/20' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-white'
                }`}
              >
                Group {String.fromCharCode(65 + gid)}
              </button>
            ))}
          </div>
        )}

        <div className="max-w-6xl mx-auto space-y-12">
          {/* Standings Card */}
          <div className="rounded-[2.5rem] border border-border bg-card/40 backdrop-blur-xl overflow-hidden shadow-3d luxury-border-glow">
            <div className="bg-muted/50 px-8 py-6 border-b border-border flex justify-between items-center">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3">
                 <LayoutGrid size={18} className="text-accent-blue" /> 
                 Standings: Group {String.fromCharCode(65 + currentGroupIdx)}
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[800px]">
                <thead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50">
                  <tr>
                    <th className="px-6 py-5">Rank</th>
                    <th className="px-6 py-5">Competitor</th>
                    <th className="px-4 py-5 text-center">P</th>
                    <th className="px-4 py-5 text-center">W</th>
                    <th className="px-4 py-5 text-center">D</th>
                    <th className="px-4 py-5 text-center">L</th>
                    <th className="px-4 py-5 text-center">F</th>
                    <th className="px-4 py-5 text-center">SA</th>
                    <th className="px-4 py-5 text-center">+/-</th>
                    <th className="px-8 py-5 text-right text-accent-blue">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team: any, idx: number) => (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={team.id}
                      className="border-b border-border/50 hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-5 font-black">
                        <span className={idx < 3 ? 'text-accent-blue' : 'text-muted-foreground'}>{idx + 1}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border overflow-hidden shadow-inner group-hover:scale-110 transition-transform">
                            {team.avatar_url ? (
                              <img src={team.avatar_url} className="w-full h-full object-cover" />
                            ) : (
                              <Users size={18} className="text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-bold text-base truncate max-w-[150px]">{team.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center font-bold text-muted-foreground">{team.pld}</td>
                      <td className="px-4 py-5 text-center font-bold text-emerald-500">{team.w}</td>
                      <td className="px-4 py-5 text-center font-bold text-amber-500">{team.d}</td>
                      <td className="px-4 py-5 text-center font-bold text-red-500">{team.l}</td>
                      <td className="px-4 py-5 text-center font-bold">{team.f}</td>
                      <td className="px-4 py-5 text-center font-bold text-muted-foreground">{team.sa}</td>
                      <td className="px-4 py-5 text-center font-bold text-accent-blue">{team.f - team.sa}</td>
                      <td className="px-8 py-5 text-right font-black text-accent-blue text-xl">{team.pts}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Match Schedule with Round Tabs */}
          <div className="space-y-8">
            <div className="flex flex-col items-center gap-10">
            <div className="flex flex-col items-center gap-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-blue/60 flex items-center gap-2 mb-2">
                <Sparkles size={12} className="animate-pulse" /> Tournament Schedule
              </h4>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-foreground flex items-center gap-4">
                <Calendar size={32} className="text-accent-blue" /> 
                Match Schedule
              </h3>
            </div>
            
            {rounds.length > 1 && (
                <div className="flex flex-wrap justify-center gap-2 p-2 bg-card/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 shadow-2xl relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/5 to-accent-purple/5 rounded-[2.5rem] pointer-events-none" />
                  {rounds.map((round) => (
                    <button
                      key={round}
                      onClick={() => setActiveRoundIdx(round)}
                      className={`relative px-10 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all duration-500 group ${
                        currentRoundIdx === round 
                          ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)] scale-105 z-10' 
                          : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      }`}
                    >
                      Round {round + 1}
                      {currentRoundIdx === round && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute inset-0 rounded-[2rem] bg-white/10 blur-md"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
              <AnimatePresence mode="wait">
                {roundMatches.length > 0 ? roundMatches.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      delay: i * 0.1 
                    }}
                    className="relative"
                  >
                    {renderMatchCard(m, i, 0, 0)}
                  </motion.div>
                )) : (
                  <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-[3rem] bg-white/5 backdrop-blur-sm">
                    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                      <Calendar className="text-muted-foreground/30" size={24} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">No matches scheduled for this round</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSwissSystem = () => {
    // Calculate standings for Swiss with Buchholz
    const stats = normalizedParticipants.reduce((acc, p) => {
      acc[p.id] = { id: p.id, name: p.name, avatar_url: p.avatar_url, w: 0, l: 0, pts: 0, opponents: [], buchholz: 0 }
      return acc
    }, {} as any)

    matches.forEach(m => {
      if (m.status === 'confirmed') {
        const homeId = m.home_team_id || m.home_player_id
        const awayId = m.away_team_id || m.away_player_id
        if (homeId && stats[homeId] && awayId && stats[awayId]) {
            stats[homeId].opponents.push(awayId)
            stats[awayId].opponents.push(homeId)
        }
        
        if (m.home_score > m.away_score && stats[homeId]) {
          stats[homeId].w++; stats[homeId].pts += 3
          if (stats[awayId]) stats[awayId].l++
        } else if (m.away_score > m.home_score && stats[awayId]) {
          stats[awayId].w++; stats[awayId].pts += 3
          if (stats[homeId]) stats[homeId].l++
        }
      }
    })

    // Compute Buchholz score
    Object.values(stats).forEach((team: any) => {
        team.buchholz = team.opponents.reduce((sum: number, oppId: string) => {
            return sum + (stats[oppId]?.pts || 0)
        }, 0)
    })

    const standings = Object.values(stats).sort((a: any, b: any) => {
        if (b.pts !== a.pts) return b.pts - a.pts
        return b.buchholz - a.buchholz
    })

    return (
      <div className="w-full space-y-16">
        <div className="flex gap-12 min-w-max pb-4 overflow-x-auto">
          {sortedRoundIds.map((roundId, roundIdx) => (
            <div key={roundId} className="flex flex-col space-y-8 w-72">
              <div className="text-center pb-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue bg-accent-blue/10 px-4 py-1 rounded-full inline-block">
                  Swiss Round {roundIdx + 1}
                </h4>
              </div>
              <div className="flex flex-col justify-around flex-grow space-y-8">
                {roundsMap[roundId].sort((a: any, b: any) => a.match_order - b.match_order).map((match: any, matchIdx: number) =>
                  renderMatchCard(match, matchIdx, roundIdx, 0)
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card/50 overflow-hidden backdrop-blur-sm max-w-2xl mx-auto">
          <div className="bg-muted/50 px-6 py-4 border-b border-border">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Current Standings</h4>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/20">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Competitor</th>
                <th className="px-6 py-4 text-center">W-L</th>
                <th className="px-6 py-4 text-center">Bhlz</th>
                <th className="px-6 py-4 text-right text-accent-blue">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team: any, idx: number) => (
                <tr key={team.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-black">{idx + 1}</td>
                  <td className="px-6 py-4 font-bold">{team.name}</td>
                  <td className="px-6 py-4 text-center text-muted-foreground">{team.w}-{team.l}</td>
                  <td className="px-6 py-4 text-center text-amber-500 font-bold">{team.buchholz}</td>
                  <td className="px-6 py-4 text-right font-black text-accent-blue">{team.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Generate Next Round Button */}
          {isOrganizer && matches.length > 0 && matches.every(m => m.status === 'confirmed') && (
              <div className="p-6 border-t border-border flex justify-end">
                <button 
                  onClick={handleGenerateNextRound}
                  disabled={isGeneratingRound}
                  className="px-6 py-3 bg-accent-blue text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-accent-blue/20 hover:bg-accent-blue/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {isGeneratingRound ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Generate Next Round
                </button>
              </div>
          )}
        </div>
      </div>
    )
  }

  const renderGroupStage = () => {
    const numGroups = Math.max(2, Math.ceil(normalizedParticipants.length / 4))
    const groups = Array.from({ length: numGroups }).map((_, i) => `Group ${String.fromCharCode(65 + i)}`)

    return (
      <div className="w-full space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {groups.map((groupName, groupIdx) => {
            const groupMatches = matches.filter(m => m.details?.group_index === groupIdx || m.bracket_round === groupIdx)
            const groupStats: any = {}

            // Filter participants for this group
            const groupParticipants = normalizedParticipants.slice(groupIdx * 4, (groupIdx + 1) * 4)
            groupParticipants.forEach(p => {
              groupStats[p.id] = { id: p.id, name: p.name, avatar_url: p.avatar_url, w: 0, l: 0, pts: 0 }
            })

            groupMatches.forEach(m => {
              if (m.status === 'confirmed') {
                const homeId = m.home_team_id || m.home_player_id
                const awayId = m.away_team_id || m.away_player_id
                if (!groupStats[homeId] || !groupStats[awayId]) return
                if (m.home_score > m.away_score) {
                  groupStats[homeId].w++; groupStats[homeId].pts += 3
                } else if (m.away_score > m.home_score) {
                  groupStats[awayId].w++; groupStats[awayId].pts += 3
                }
              }
            })

            const sortedStandings = Object.values(groupStats).sort((a: any, b: any) => b.pts - a.pts)

            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: groupIdx * 0.1 }}
                key={groupName}
                className="rounded-2xl border border-border bg-card/50 overflow-hidden backdrop-blur-sm"
              >
                <div className="bg-muted/50 px-6 py-4 border-b border-border flex justify-between items-center">
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <LayoutGrid size={16} className="text-accent-blue" /> {groupName}
                  </h4>
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded">Top 2 Advance</span>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/20">
                    <tr>
                      <th className="px-4 py-3">Team</th>
                      <th className="px-4 py-3 text-center">W-L</th>
                      <th className="px-4 py-3 text-right text-accent-blue">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStandings.map((team: any, i: number) => (
                      <tr key={team.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className={`font-black text-xs ${i < 2 ? 'text-emerald-500' : 'text-muted-foreground'}`}>{i + 1}</span>
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border overflow-hidden">
                              {team.avatar_url ? (
                                <img src={team.avatar_url} className="w-full h-full object-cover" />
                              ) : (
                                <Users size={10} className="text-muted-foreground" />
                              )}
                            </div>
                            <span className="font-bold">{team.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-muted-foreground">{team.w}-{team.l}</td>
                        <td className="px-4 py-3 text-right font-black">{team.pts}</td>
                      </tr>
                    ))}
                    {sortedStandings.length === 0 && Array.from({ length: 4 }).map((_, i) => (
                      <tr key={`empty-${i}`} className="opacity-20">
                        <td className="px-4 py-3 flex items-center gap-3">
                          <span className="text-xs font-black">{i + 1}</span>
                          <span className="font-bold">TBD</span>
                        </td>
                        <td className="px-4 py-3 text-center">0-0</td>
                        <td className="px-4 py-3 text-right">0</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )
          })}
        </div>

        <div className="pt-12 border-t border-border border-dashed">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-8 text-center flex items-center justify-center gap-2">
            <Trophy size={16} /> Knockout Stage Preview
          </h3>
          <div className="opacity-50 scale-90 origin-top flex justify-center">
            {renderSingleElimination()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-x-auto pb-12 pt-4 px-4 custom-scrollbar">
      {/* Global SVG Definitions */}
      <svg className="absolute w-0 h-0 pointer-events-none overflow-hidden">
        <defs>
          <linearGradient id="bracket-connector-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-blue)" />
            <stop offset="100%" stopColor="var(--accent-purple)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Generate Bracket Overlay for Organizers */}
      {isOrganizer && matches.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-background/10 backdrop-blur-[2px] rounded-[3rem]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 rounded-[3rem] bg-card/90 border border-border shadow-2xl text-center space-y-6 max-w-md mx-4"
          >
            <div className="h-20 w-20 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="text-accent-blue h-10 w-10 animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Finalize Bracket</h3>
              <p className="text-muted-foreground font-medium mt-2">Ready to start the competition? Generate the match schedule based on confirmed registrations.</p>
            </div>
            <button
              onClick={handleGenerateBracket}
              disabled={isGenerating}
              className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-accent-blue to-accent-purple text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-accent-blue/20 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <Trophy size={20} />}
              Generate Bracket
            </button>
          </motion.div>
        </div>
      )}

      <div className={`transition-all duration-700 ${isOrganizer && matches.length === 0 ? 'blur-md opacity-30 grayscale pointer-events-none' : ''}`}>
        {(bracketStructure === 'single_elimination' || bracketStructure === 'hybrid') && renderSingleElimination()}
        {bracketStructure === 'double_elimination' && renderDoubleElimination()}
        {bracketStructure === 'round_robin' && renderRoundRobin()}
        {bracketStructure === 'swiss_system' && renderSwissSystem()}
        {(bracketStructure === 'group_stage' || bracketStructure === 'hybrid') && renderGroupStage()}
      </div>

      {/* Score Editor Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMatch(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border p-8 rounded-[2.5rem] shadow-2xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Update Score</h3>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Confirmed Result</p>
                </div>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/30">
                  <input type="checkbox" checked={isWalkover} onChange={(e) => setIsWalkover(e.target.checked)} className="h-5 w-5 rounded-md border-border text-accent-blue focus:ring-accent-blue" />
                  <label className="text-sm font-bold uppercase tracking-widest">Mark as Walkover (W.O.)</label>
                </div>

                {isWalkover ? (
                  <div className="space-y-4">
                     <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Winner</p>
                     <div className="flex gap-4">
                       <button onClick={() => setWalkoverWinner(selectedMatch.home_team_id || selectedMatch.home_player_id)} className={`flex-1 p-4 rounded-2xl border font-bold transition-all ${walkoverWinner === (selectedMatch.home_team_id || selectedMatch.home_player_id) ? 'border-accent-blue bg-accent-blue/10 text-accent-blue' : 'border-border bg-card'}`}>
                         {selectedMatch.home_team?.name || 'Home Team'}
                       </button>
                       <button onClick={() => setWalkoverWinner(selectedMatch.away_team_id || selectedMatch.away_player_id)} className={`flex-1 p-4 rounded-2xl border font-bold transition-all ${walkoverWinner === (selectedMatch.away_team_id || selectedMatch.away_player_id) ? 'border-accent-blue bg-accent-blue/10 text-accent-blue' : 'border-border bg-card'}`}>
                         {selectedMatch.away_team?.name || 'Away Team'}
                       </button>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                    {editGames.map((game, index) => {
                      const homeId = selectedMatch.home_team_id || selectedMatch.home_player_id
                      const awayId = selectedMatch.away_team_id || selectedMatch.away_player_id
                      const threshold = matchFormat === 'bo5' ? 3 : matchFormat === 'bo3' ? 2 : 1
                      
                      // Calculate wins achieved IN PREVIOUS GAMES to determine if this game is needed
                      let homeWinsSoFar = 0
                      let awayWinsSoFar = 0
                      for (let i = 0; i < index; i++) {
                        const g = editGames[i]
                        if (g.winner_id === homeId || g.away_forfeit) homeWinsSoFar++
                        else if (g.winner_id === awayId || g.home_forfeit) awayWinsSoFar++
                      }

                      const isMatchAlreadyWon = homeWinsSoFar >= threshold || awayWinsSoFar >= threshold
                      if (isMatchAlreadyWon && !editGames[index].winner_id && editGames[index].home_score === 0 && editGames[index].away_score === 0) {
                        return null
                      }

                      const updateGame = (newGameData: Partial<GameData>) => {
                        const newGames = [...editGames]
                        newGames[index] = { ...newGames[index], ...newGameData }
                        setEditGames(newGames)
                      }

                      return (
                        <div key={index} className="p-4 rounded-2xl bg-muted/30 border border-border space-y-4 relative">
                          <div className="absolute -top-3 left-4 bg-card px-2 text-[10px] font-black uppercase tracking-widest text-accent-blue border border-border rounded-full">
                            Game {index + 1}
                          </div>
                          
                          {/* Home Row */}
                          <div className="flex items-center justify-between gap-3 pt-2">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="h-8 w-8 rounded-lg bg-card flex items-center justify-center shrink-0 border border-border overflow-hidden">
                                {selectedMatch.home_team?.avatar_url ? (
                                  <img src={selectedMatch.home_team.avatar_url} className="w-full h-full object-cover" />
                                ) : (
                                  <Users size={14} className="text-muted-foreground" />
                                )}
                              </div>
                              <span className="font-bold text-sm truncate">{selectedMatch.home_team?.name || 'Home Team'}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 text-[10px] uppercase font-bold text-muted-foreground mr-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={game.home_forfeit}
                                  onChange={(e) => updateGame({ home_forfeit: e.target.checked, winner_id: e.target.checked ? awayId : null })}
                                  className="h-3 w-3 rounded-sm text-red-500" 
                                />
                                FF
                              </label>

                              <input
                                type="number"
                                value={game.home_score}
                                onChange={(e) => updateGame({ home_score: parseInt(e.target.value) || 0 })}
                                className="w-12 h-8 bg-card border border-border rounded-lg text-center font-black text-sm focus:ring-1 ring-accent-blue/50 outline-none"
                              />

                              <div className="flex bg-card rounded-lg border border-border overflow-hidden h-8">
                                <button 
                                  onClick={() => updateGame({ winner_id: game.winner_id === homeId ? null : homeId, home_forfeit: false, away_forfeit: false })}
                                  className={`px-2 text-xs font-black transition-colors ${game.winner_id === homeId ? 'bg-emerald-500/20 text-emerald-500' : 'hover:bg-muted text-muted-foreground'}`}
                                >W</button>
                                <div className="w-px bg-border"></div>
                                <button 
                                  onClick={() => updateGame({ winner_id: game.winner_id === 'draw' ? null : 'draw', home_forfeit: false, away_forfeit: false })}
                                  className={`px-2 text-xs font-black transition-colors ${game.winner_id === 'draw' ? 'bg-amber-500/20 text-amber-500' : 'hover:bg-muted text-muted-foreground'}`}
                                >D</button>
                                <div className="w-px bg-border"></div>
                                <button 
                                  onClick={() => updateGame({ winner_id: game.winner_id === awayId ? null : awayId, home_forfeit: false, away_forfeit: false })}
                                  className={`px-2 text-xs font-black transition-colors ${game.winner_id === awayId ? 'bg-red-500/20 text-red-500' : 'hover:bg-muted text-muted-foreground'}`}
                                >L</button>
                              </div>
                            </div>
                          </div>

                          {/* Away Row */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="h-8 w-8 rounded-lg bg-card flex items-center justify-center shrink-0 border border-border overflow-hidden">
                                {selectedMatch.away_team?.avatar_url ? (
                                  <img src={selectedMatch.away_team.avatar_url} className="w-full h-full object-cover" />
                                ) : (
                                  <Users size={14} className="text-muted-foreground" />
                                )}
                              </div>
                              <span className="font-bold text-sm truncate">{selectedMatch.away_team?.name || 'Away Team'}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-1 text-[10px] uppercase font-bold text-muted-foreground mr-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={game.away_forfeit}
                                  onChange={(e) => updateGame({ away_forfeit: e.target.checked, winner_id: e.target.checked ? homeId : null })}
                                  className="h-3 w-3 rounded-sm text-red-500" 
                                />
                                FF
                              </label>

                              <input
                                type="number"
                                value={game.away_score}
                                onChange={(e) => updateGame({ away_score: parseInt(e.target.value) || 0 })}
                                className="w-12 h-8 bg-card border border-border rounded-lg text-center font-black text-sm focus:ring-1 ring-accent-blue/50 outline-none"
                              />

                              <div className="flex bg-card rounded-lg border border-border overflow-hidden h-8">
                                <button 
                                  onClick={() => updateGame({ winner_id: game.winner_id === awayId ? null : awayId, home_forfeit: false, away_forfeit: false })}
                                  className={`px-2 text-xs font-black transition-colors ${game.winner_id === awayId ? 'bg-emerald-500/20 text-emerald-500' : 'hover:bg-muted text-muted-foreground'}`}
                                >W</button>
                                <div className="w-px bg-border"></div>
                                <button 
                                  onClick={() => updateGame({ winner_id: game.winner_id === 'draw' ? null : 'draw', home_forfeit: false, away_forfeit: false })}
                                  className={`px-2 text-xs font-black transition-colors ${game.winner_id === 'draw' ? 'bg-amber-500/20 text-amber-500' : 'hover:bg-muted text-muted-foreground'}`}
                                >D</button>
                                <div className="w-px bg-border"></div>
                                <button 
                                  onClick={() => updateGame({ winner_id: game.winner_id === homeId ? null : homeId, home_forfeit: false, away_forfeit: false })}
                                  className={`px-2 text-xs font-black transition-colors ${game.winner_id === homeId ? 'bg-red-500/20 text-red-500' : 'hover:bg-muted text-muted-foreground'}`}
                                >L</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="flex-1 py-4 rounded-2xl bg-muted font-bold hover:bg-muted/80 transition-all uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={handleSaveScore}
                  className="flex-1 py-4 rounded-2xl bg-accent-blue text-white font-black hover:bg-accent-blue/90 transition-all shadow-lg shadow-accent-blue/30 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  Save Score
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
