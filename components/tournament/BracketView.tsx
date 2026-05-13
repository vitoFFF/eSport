'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Trophy, Edit3, X, Check, Loader2, Sparkles, LayoutGrid } from 'lucide-react'
import { updateMatchScore, generateBracketMatches, generateNextSwissRound } from '@/actions/matches'
 
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
  bracketStructure = 'single_elimination'
}: BracketViewProps) {
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingRound, setIsGeneratingRound] = useState(false)
  const [editScores, setEditScores] = useState({ home: 0, away: 0 })
  const [isWalkover, setIsWalkover] = useState(false)
  const [walkoverWinner, setWalkoverWinner] = useState<string | null>(null)
  const [setScoresInput, setSetScoresInput] = useState('')

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
    setEditScores({
      home: match.home_score || 0,
      away: match.away_score || 0
    })
    setIsWalkover(match.details?.is_walkover || false)
    setWalkoverWinner(match.details?.is_walkover ? (match.winner_team_id || match.winner_player_id) : null)
    setSetScoresInput(match.details?.set_scores || '')
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
       if (winnerId === selectedMatch.home_team_id || winnerId === selectedMatch.home_player_id) {
           editScores.home = 1; editScores.away = 0;
       } else {
           editScores.home = 0; editScores.away = 1;
       }
    } else {
       if (editScores.home > editScores.away) winnerId = selectedMatch.home_team_id || selectedMatch.home_player_id
       else if (editScores.away > editScores.home) winnerId = selectedMatch.away_team_id || selectedMatch.away_player_id
    }

    const result = await updateMatchScore(
      selectedMatch.id,
      editScores.home,
      editScores.away,
      winnerId || undefined,
      isWalkover,
      setScoresInput
    )

    if (result.success) {
      setSelectedMatch(null)
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
    const isWinnerHome = match.winner_team_id && match.winner_team_id === match.home_team_id
    const isWinnerAway = match.winner_team_id && match.winner_team_id === match.away_team_id

    return (
      <div key={match.id} className="relative group" style={{ height: CARD_HEIGHT }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: (roundIdx * 0.1) + (matchIdx * 0.05) }}
          onClick={() => isOrganizer && !isSkeleton && handleEditClick(match)}
          className={`relative z-10 w-full h-full rounded-[1.25rem] border border-white/10 bg-card/40 backdrop-blur-xl shadow-3d hover:border-accent-blue/50 transition-all duration-500 overflow-hidden flex flex-col luxury-border-glow shimmer-glint ${isSkeleton ? 'opacity-30 grayscale' : ''} ${isOrganizer && !isSkeleton ? 'cursor-pointer hover:translate-y-[-2px]' : ''}`}
        >
          {isOrganizer && !isSkeleton && (
            <div className="absolute top-2 right-2 p-1 rounded-md bg-accent-blue/10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit3 size={10} className="text-accent-blue" />
            </div>
          )}

          {/* Home Team */}
          <div className={`flex-1 px-4 flex items-center justify-between border-b border-white/5 transition-colors ${isWinnerHome ? 'bg-accent-blue/10' : ''}`}>
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-white/10 shadow-inner transition-transform duration-500 group-hover:scale-110 ${isWinnerHome ? 'ring-2 ring-accent-blue/50' : 'bg-muted/50'}`}>
                {match.home_team?.avatar_url ? (
                  <img src={match.home_team.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <Users size={14} className="text-muted-foreground/50" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-[13px] font-black tracking-tight truncate max-w-[120px] uppercase italic ${isWinnerHome ? 'text-white' : 'text-muted-foreground'}`}>
                  {match.home_team?.name || 'TBD'}
                </span>
                {isWinnerHome && <span className="text-[8px] font-black text-accent-blue uppercase tracking-widest leading-none">Winner</span>}
              </div>
            </div>
            <div className={`h-8 w-10 flex items-center justify-center rounded-lg font-black text-sm transition-all duration-500 ${isWinnerHome ? 'bg-accent-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-black/20 text-muted-foreground'}`}>
              {match.home_score ?? '-'}
            </div>
          </div>

          {/* Away Team */}
          <div className={`flex-1 px-4 flex items-center justify-between transition-colors ${isWinnerAway ? 'bg-accent-blue/10' : ''}`}>
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0 border border-white/10 shadow-inner transition-transform duration-500 group-hover:scale-110 ${isWinnerAway ? 'ring-2 ring-accent-blue/50' : 'bg-muted/50'}`}>
                {match.away_team?.avatar_url ? (
                  <img src={match.away_team.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <Users size={14} className="text-muted-foreground/50" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-[13px] font-black tracking-tight truncate max-w-[120px] uppercase italic ${isWinnerAway ? 'text-white' : 'text-muted-foreground'}`}>
                  {match.away_team?.name || 'TBD'}
                </span>
                {isWinnerAway && <span className="text-[8px] font-black text-accent-blue uppercase tracking-widest leading-none">Winner</span>}
              </div>
            </div>
            <div className={`h-8 w-10 flex items-center justify-center rounded-lg font-black text-sm transition-all duration-500 ${isWinnerAway ? 'bg-accent-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-black/20 text-muted-foreground'}`}>
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
    // Calculate standings from matches
    const stats = normalizedParticipants.reduce((acc, p) => {
      acc[p.id] = { id: p.id, name: p.name, avatar_url: p.avatar_url, pld: 0, w: 0, d: 0, l: 0, pts: 0, diff: 0 }
      return acc
    }, {} as any)

    matches.forEach(m => {
      if (m.status === 'confirmed') {
        const homeId = m.home_team_id || m.home_player_id
        const awayId = m.away_team_id || m.away_player_id
        if (!stats[homeId] || !stats[awayId]) return

        stats[homeId].pld++
        stats[awayId].pld++

        const homeScore = m.home_score || 0
        const awayScore = m.away_score || 0
        stats[homeId].diff += (homeScore - awayScore)
        stats[awayId].diff += (awayScore - homeScore)

        if (homeScore > awayScore) {
          stats[homeId].w++
          stats[homeId].pts += 3
          stats[awayId].l++
        } else if (awayScore > homeScore) {
          stats[awayId].w++
          stats[awayId].pts += 3
          stats[homeId].l++
        } else {
          stats[homeId].d++
          stats[homeId].pts += 1
          stats[awayId].d++
          stats[awayId].pts += 1
        }
      }
    })

    const standings = Object.values(stats).sort((a: any, b: any) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      return b.diff - a.diff // Differential tiebreaker
    })

    return (
      <div className="w-full space-y-12">
        <div className="rounded-2xl border border-border bg-card/50 overflow-hidden backdrop-blur-sm">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50">
              <tr>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Competitor</th>
                <th className="px-6 py-4 text-center">Pld</th>
                <th className="px-6 py-4 text-center">W</th>
                <th className="px-6 py-4 text-center">D</th>
                <th className="px-6 py-4 text-center">L</th>
                <th className="px-6 py-4 text-center">+/-</th>
                <th className="px-6 py-4 text-right text-accent-blue">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team: any, idx: number) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={team.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 font-black">
                    <span className={idx < 3 ? 'text-accent-blue' : ''}>{idx + 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border overflow-hidden">
                        {team.avatar_url ? (
                          <img src={team.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                          <Users size={14} className="text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-bold">{team.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-muted-foreground">{team.pld}</td>
                  <td className="px-6 py-4 text-center font-bold text-emerald-500">{team.w}</td>
                  <td className="px-6 py-4 text-center font-bold text-amber-500">{team.d}</td>
                  <td className="px-6 py-4 text-center font-bold text-red-500">{team.l}</td>
                  <td className="px-6 py-4 text-center font-bold">{team.diff > 0 ? `+${team.diff}` : team.diff}</td>
                  <td className="px-6 py-4 text-right font-black text-accent-blue text-lg">{team.pts}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Schedule List */}
        <div className="space-y-6">
          <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-4">Match Schedule</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m, i) => renderMatchCard(m, i, 0, 0))}
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
                  <>
                    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center shrink-0 border border-border">
                          {selectedMatch.home_team?.avatar_url ? (
                            <img src={selectedMatch.home_team.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            <Users size={18} className="text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-bold truncate max-w-[150px]">{selectedMatch.home_team?.name || 'Home Team'}</span>
                      </div>
                      <input
                        type="number"
                        value={editScores.home}
                        onChange={(e) => setEditScores({ ...editScores, home: parseInt(e.target.value) || 0 })}
                        className="w-16 h-12 bg-card border border-border rounded-xl text-center font-black text-lg focus:ring-2 ring-accent-blue/50 outline-none transition-all"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center shrink-0 border border-border">
                          {selectedMatch.away_team?.avatar_url ? (
                            <img src={selectedMatch.away_team.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                            <Users size={18} className="text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-bold truncate max-w-[150px]">{selectedMatch.away_team?.name || 'Away Team'}</span>
                      </div>
                      <input
                        type="number"
                        value={editScores.away}
                        onChange={(e) => setEditScores({ ...editScores, away: parseInt(e.target.value) || 0 })}
                        className="w-16 h-12 bg-card border border-border rounded-xl text-center font-black text-lg focus:ring-2 ring-accent-blue/50 outline-none transition-all"
                      />
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Set Scores (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 16-14, 16-12"
                        value={setScoresInput}
                        onChange={(e) => setSetScoresInput(e.target.value)}
                        className="w-full h-12 bg-card border border-border rounded-xl px-4 font-bold text-sm focus:ring-2 ring-accent-blue/50 outline-none transition-all"
                      />
                    </div>
                  </>
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
