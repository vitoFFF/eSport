'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Trophy, Edit3, X, Check, Loader2, Sparkles, LayoutGrid } from 'lucide-react'
import { updateMatchScore, generateBracketMatches } from '@/actions/matches'

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
  const [editScores, setEditScores] = useState({ home: 0, away: 0 })

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

  const handleSaveScore = async () => {
    if (!selectedMatch) return
    setIsSubmitting(true)

    let winnerId = undefined
    if (editScores.home > editScores.away) winnerId = selectedMatch.home_team_id
    else if (editScores.away > editScores.home) winnerId = selectedMatch.away_team_id

    const result = await updateMatchScore(
      selectedMatch.id,
      editScores.home,
      editScores.away,
      winnerId
    )

    if (result.success) {
      setSelectedMatch(null)
    } else {
      alert(result.error || 'Failed to update score')
    }
    setIsSubmitting(false)
  }

  const renderMatchCard = (match: any, matchIdx: number, roundIdx: number, hasConnectingLines: boolean = true) => {
    return (
      <div key={match.id} className="relative group">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: (roundIdx * 0.1) + (matchIdx * 0.05) }}
          onClick={() => isOrganizer && handleEditClick(match)}
          className={`relative z-10 rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-xl hover:border-accent-blue/50 transition-all duration-300 overflow-hidden ${match.id && match.id.toString().includes('skeleton') ? 'opacity-40 grayscale-[0.5]' : ''} ${isOrganizer && (!match.id || !match.id.toString().includes('skeleton')) ? 'cursor-pointer hover:ring-2 ring-accent-blue/30' : ''}`}
        >
          {isOrganizer && (!match.id || !match.id.toString().includes('skeleton')) && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit3 size={12} className="text-accent-blue" />
            </div>
          )}

          {/* Home Team */}
          <div className={`p-4 flex items-center justify-between border-b border-border/50 ${match.winner_team_id && match.winner_team_id === match.home_team_id ? 'bg-accent-blue/5' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
                {match.home_team?.avatar_url ? (
                  <img src={match.home_team.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <Users size={14} className="text-muted-foreground" />
                )}
              </div>
              <span className={`text-sm font-bold truncate max-w-[140px] ${match.winner_team_id && match.winner_team_id === match.home_team_id ? 'text-foreground' : 'text-muted-foreground'}`}>
                {match.home_team?.name || 'TBD'}
              </span>
            </div>
            <div className={`h-8 w-10 flex items-center justify-center rounded-lg font-black text-sm ${match.winner_team_id && match.winner_team_id === match.home_team_id ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/30' : 'bg-muted text-muted-foreground'}`}>
              {match.home_score ?? '-'}
            </div>
          </div>

          {/* Away Team */}
          <div className={`p-4 flex items-center justify-between ${match.winner_team_id && match.winner_team_id === match.away_team_id ? 'bg-accent-blue/5' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border">
                {match.away_team?.avatar_url ? (
                  <img src={match.away_team.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <Users size={14} className="text-muted-foreground" />
                )}
              </div>
              <span className={`text-sm font-bold truncate max-w-[140px] ${match.winner_team_id && match.winner_team_id === match.away_team_id ? 'text-foreground' : 'text-muted-foreground'}`}>
                {match.away_team?.name || 'TBD'}
              </span>
            </div>
            <div className={`h-8 w-10 flex items-center justify-center rounded-lg font-black text-sm ${match.winner_team_id && match.winner_team_id === match.away_team_id ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/30' : 'bg-muted text-muted-foreground'}`}>
              {match.away_score ?? '-'}
            </div>
          </div>
        </motion.div>

        {/* Connecting Lines */}
        {hasConnectingLines && roundIdx < totalRounds - 1 && (
          <div className="absolute top-1/2 -right-12 w-12 h-px bg-border group-hover:bg-accent-blue/50 transition-colors z-0" />
        )}
      </div>
    )
  }

  const renderSingleElimination = () => (
    <div className="flex gap-12 min-w-max transition-all duration-700">
      {sortedRoundIds.map((roundId, roundIdx) => (
        <div key={roundId} className="flex flex-col space-y-8 w-72">
          <div className="text-center pb-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue bg-accent-blue/10 px-4 py-1 rounded-full inline-block">
              {getRoundName(roundIdx, totalRounds)}
            </h4>
          </div>
          <div className="flex flex-col justify-around flex-grow space-y-12">
            {roundsMap[roundId].sort((a: any, b: any) => a.match_order - b.match_order).map((match: any, matchIdx: number) =>
              renderMatchCard(match, matchIdx, roundIdx, true)
            )}
          </div>
        </div>
      ))}
    </div>
  )

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
          <div className="flex gap-12 min-w-max pb-4">
            {sortedWinnersIds.map((roundId, idx) => (
              <div key={roundId} className="flex flex-col space-y-8 w-72">
                <div className="text-center">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 bg-emerald-500/10 px-4 py-1 rounded-full inline-block">
                    {getRoundName(idx, sortedWinnersIds.length)}
                  </h4>
                </div>
                <div className="flex flex-col justify-around flex-grow space-y-12">
                  {winnersRounds[roundId].sort((a: any, b: any) => a.match_order - b.match_order).map((match: any, mIdx: number) =>
                    renderMatchCard(match, mIdx, idx, true)
                  )}
                </div>
              </div>
            ))}
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
          <div className="flex gap-12 min-w-max pb-4">
            {sortedLosersIds.map((roundId, idx) => {
              const phase = losersRounds[roundId][0]?.details?.phase || (idx % 2 === 0 ? 'survival' : 'drop-in')
              return (
                <div key={roundId} className="flex flex-col space-y-8 w-72">
                  <div className="text-center space-y-2">
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1 rounded-full inline-block ${phase === 'survival' ? 'text-amber-500 bg-amber-500/10' : 'text-red-500 bg-red-500/10'}`}>
                      {phase === 'survival' ? 'Phase A: Survival' : 'Phase B: Drop-in'}
                    </h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Losers Round {idx + 1}</p>
                  </div>
                  <div className="flex flex-col justify-around flex-grow space-y-8">
                    {losersRounds[roundId].sort((a: any, b: any) => a.match_order - b.match_order).map((match: any, mIdx: number) =>
                      renderMatchCard(match, mIdx, idx, true)
                    )}
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
                    <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-2 animate-bounce">If Losers Champion Wins</p>
                  )}
                </div>
                {renderMatchCard(match, idx, 0, false)}
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  }

  const renderRoundRobin = () => {
    // Use normalized participants or fallback to dummy
    const standings = Array.from({ length: totalParticipants }).map((_, i) => {
      const p = normalizedParticipants[i]
      return {
        id: p?.id || i,
        rank: i + 1,
        name: p?.name || `Team ${String.fromCharCode(65 + i)}`,
        avatar_url: p?.avatar_url,
        played: matches.length > 0 ? 5 : 0,
        won: matches.length > 0 ? 5 - i : 0,
        lost: matches.length > 0 ? i : 0,
        drawn: 0,
        points: matches.length > 0 ? (5 - i) * 3 : 0
      }
    })

    return (
      <div className="w-full max-w-4xl mx-auto">
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
                <th className="px-6 py-4 text-right text-accent-blue">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, idx) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={team.id}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 font-black">{team.rank}</td>
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
                  <td className="px-6 py-4 text-center font-bold text-muted-foreground">{team.played}</td>
                  <td className="px-6 py-4 text-center font-bold text-emerald-500">{team.won}</td>
                  <td className="px-6 py-4 text-center font-bold text-amber-500">{team.drawn}</td>
                  <td className="px-6 py-4 text-center font-bold text-red-500">{team.lost}</td>
                  <td className="px-6 py-4 text-right font-black text-accent-blue text-lg">{team.points}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderSwissSystem = () => (
    <div className="flex flex-col gap-12 w-full max-w-3xl mx-auto transition-all duration-700">
      {sortedRoundIds.map((roundId, roundIdx) => (
        <div key={roundId} className="flex flex-col space-y-6 w-full">
          <div className="pb-2 border-b border-border/50 flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-purple bg-accent-purple/10 px-4 py-1 rounded-full inline-block">
              Round {roundIdx + 1}
            </h4>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              {roundsMap[roundId].length} Matches
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roundsMap[roundId].sort((a: any, b: any) => a.match_order - b.match_order).map((match: any, matchIdx: number) =>
              renderMatchCard(match, matchIdx, roundIdx, false)
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderGroupStage = () => {
    const groups = ['Group A', 'Group B', 'Group C', 'Group D'].slice(0, Math.max(2, Math.ceil(totalParticipants / 4)))

    return (
      <div className="w-full space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {groups.map((groupName, groupIdx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: groupIdx * 0.1 }}
              key={groupName}
              className="rounded-2xl border border-border bg-card/50 overflow-hidden backdrop-blur-sm"
            >
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <h4 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <LayoutGrid size={16} className="text-accent-blue" /> {groupName}
                </h4>
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
                  {Array.from({ length: 4 }).map((_, i) => {
                    const p = normalizedParticipants[groupIdx * 4 + i]
                    return (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className={`font-black text-xs ${i < 2 ? 'text-emerald-500' : 'text-muted-foreground'}`}>{i + 1}</span>
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 border border-border overflow-hidden">
                              {p?.avatar_url ? (
                                <img src={p.avatar_url} className="w-full h-full object-cover" />
                              ) : (
                                <Users size={10} className="text-muted-foreground" />
                              )}
                            </div>
                            <span className="font-bold">{p?.name || `Team ${String.fromCharCode(65 + (groupIdx * 4) + i)}`}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-muted-foreground">0-0</td>
                        <td className="px-4 py-3 text-right font-black">0</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </motion.div>
          ))}
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
        {bracketStructure === 'single_elimination' && renderSingleElimination()}
        {bracketStructure === 'double_elimination' && renderDoubleElimination()}
        {bracketStructure === 'round_robin' && renderRoundRobin()}
        {bracketStructure === 'swiss_system' && renderSwissSystem()}
        {bracketStructure === 'group_stage' && renderGroupStage()}
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
                {/* Home Team Input */}
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

                {/* Away Team Input */}
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
