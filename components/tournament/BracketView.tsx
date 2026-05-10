'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Trophy, Edit3, X, Check, Loader2, Sparkles } from 'lucide-react'
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
  totalParticipants?: number
  isOrganizer?: boolean
  tournamentId?: string
}

const getRoundName = (roundIdx: number, totalRounds: number) => {
  if (totalRounds <= 1) return 'Final'
  if (roundIdx === totalRounds - 1) return 'Final'
  if (roundIdx === totalRounds - 2) return 'Semi-Final'
  if (roundIdx === totalRounds - 3) return 'Quarter-Final'
  return `Round ${roundIdx + 1}`
}

export default function BracketView({ matches, totalParticipants = 8, isOrganizer = false, tournamentId }: BracketViewProps) {
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editScores, setEditScores] = useState({ home: 0, away: 0 })

  // If no matches, generate a skeleton structure
  const displayMatches = React.useMemo(() => {
    if (matches && matches.length > 0) return matches

    const skeleton: any[] = []
    let currentRoundParticipants = totalParticipants
    let roundIdx = 0
    
    while (currentRoundParticipants > 1) {
      const matchesInRound = Math.floor(currentRoundParticipants / 2)
      for (let i = 0; i < matchesInRound; i++) {
        skeleton.push({
          id: `skeleton-${roundIdx}-${i}`,
          bracket_round: roundIdx,
          match_order: i,
          status: 'pending'
        })
      }
      currentRoundParticipants = matchesInRound
      roundIdx++
    }
    return skeleton
  }, [matches, totalParticipants])

  // Group matches by round
  const roundsMap = displayMatches.reduce((acc, match) => {
    const round = match.bracket_round
    if (!acc[round]) acc[round] = []
    acc[round].push(match)
    return acc
  }, {} as Record<number, any[]>)

  const sortedRoundIds = Object.keys(roundsMap).map(Number).sort((a: number, b: number) => a - b)
  const totalRounds = sortedRoundIds.length

  const handleEditClick = (match: any) => {
    if (match.id.includes('skeleton')) return
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

      <div className={`flex gap-12 min-w-max transition-all duration-700 ${isOrganizer && matches.length === 0 ? 'blur-md opacity-30 grayscale pointer-events-none' : ''}`}>
        {sortedRoundIds.map((roundId, roundIdx) => (
          <div key={roundId} className="flex flex-col space-y-8 w-72">
            <div className="text-center pb-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-blue bg-accent-blue/10 px-4 py-1 rounded-full inline-block">
                {getRoundName(roundIdx, totalRounds)}
              </h4>
            </div>
            
            <div className="flex flex-col justify-around flex-grow space-y-12">
              {roundsMap[roundId].sort((a: any, b: any) => a.match_order - b.match_order).map((match: any, matchIdx: number) => (
                <div key={match.id} className="relative group">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (roundIdx * 0.1) + (matchIdx * 0.05) }}
                    onClick={() => isOrganizer && handleEditClick(match)}
                    className={`relative z-10 rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-xl hover:border-accent-blue/50 transition-all duration-300 overflow-hidden ${match.id.includes('skeleton') ? 'opacity-40 grayscale-[0.5]' : ''} ${isOrganizer && !match.id.includes('skeleton') ? 'cursor-pointer hover:ring-2 ring-accent-blue/30' : ''}`}
                  >
                    {isOrganizer && !match.id.includes('skeleton') && (
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
                  {roundIdx < totalRounds - 1 && (
                    <div className="absolute top-1/2 -right-12 w-12 h-px bg-border group-hover:bg-accent-blue/50 transition-colors z-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
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
