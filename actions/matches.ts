'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitScore(matchId: string, homeScore: number, awayScore: number, details: any = {}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('matches')
    .update({
      home_score: homeScore,
      away_score: awayScore,
      details,
      status: 'submitted',
    })
    .eq('id', matchId)

  if (error) return { error: error.message }

  revalidatePath('/tournaments')
  return { success: true }
}

export async function confirmScore(matchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Depending on logic, confirmation might make it "finalized" or just "confirmed"
  const { error } = await supabase
    .from('matches')
    .update({
      status: 'confirmed',
    })
    .eq('id', matchId)

  if (error) return { error: error.message }

  revalidatePath('/tournaments')
  return { success: true }
}

export async function disputeScore(matchId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('matches')
    .update({
      status: 'disputed',
    })
    .eq('id', matchId)

  if (error) return { error: error.message }

  revalidatePath('/tournaments')
  return { success: true }
}

export async function updateMatchScore(matchId: string, homeScore: number, awayScore: number, winnerId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Fetch match details to know where it sits in the bracket
  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()
    
  if (!match) return { error: 'Match not found' }

  // Verify if the user is the organizer
  const { data: tournament } = await supabase
    .from('tournaments')
    .select('organizer_id, bracket_structure, settings')
    .eq('id', match.tournament_id)
    .single()

  if (!tournament || tournament.organizer_id !== user.id) {
    return { error: 'Not authorized' }
  }

  const participantsCount = Number(tournament.settings?.stage_participants_count) || 8

  // Determine winner IDs based on score
  let winnerTeamId = null
  let winnerPlayerId = null

  if (homeScore > awayScore) {
    winnerTeamId = match.home_team_id
    winnerPlayerId = match.home_player_id
  } else if (awayScore > homeScore) {
    winnerTeamId = match.away_team_id
    winnerPlayerId = match.away_player_id
  }

  // Update current match
  const { error } = await supabase
    .from('matches')
    .update({
      home_score: homeScore,
      away_score: awayScore,
      winner_team_id: winnerTeamId,
      winner_player_id: winnerPlayerId,
      status: 'confirmed',
    })
    .eq('id', matchId)

  if (error) return { error: error.message }

  // Progression logic
  if (winnerTeamId || winnerPlayerId) {
    const isDoubleElim = tournament.bracket_structure === 'double_elimination'
    
    // 1. Advance Winner
    let nextRound = match.bracket_round + 1
    let nextMatchOrder = Math.floor(match.match_order / 2)
    let isHomeInNext = match.match_order % 2 === 0

    // Custom logic for Double Elim progression
    if (isDoubleElim) {
      if (match.bracket_round < 10) { 
        // Winners Bracket
        const wbRounds = Math.ceil(Math.log2(participantsCount))
        if (match.bracket_round === wbRounds - 1) {
          // WB Champion goes to GF
          nextRound = 20
          nextMatchOrder = 0
          isHomeInNext = true
        }
      } else if (match.bracket_round >= 10 && match.bracket_round < 20) {
        // Losers Bracket
        const lbRoundIdx = match.bracket_round - 10
        const isSurvival = lbRoundIdx % 2 === 0
        
        nextRound = match.bracket_round + 1
        if (isSurvival) {
          // Survival (Phase A) winner stays in same match slot for next round
          nextMatchOrder = match.match_order
          isHomeInNext = true // Survivors usually take home slot in Drop-in
        } else {
          // Drop-in (Phase B) winners play each other in next survival
          nextMatchOrder = Math.floor(match.match_order / 2)
          isHomeInNext = match.match_order % 2 === 0
        }

        // LB Champion goes to GF
        const maxLbRound = (Math.ceil(Math.log2(participantsCount)) - 1) * 2
        if (lbRoundIdx === maxLbRound - 1) {
          nextRound = 20
          nextMatchOrder = 0
          isHomeInNext = false // LB Champ takes away slot in GF
        }
      }
    }

    // Find and update next match for winner
    const { data: nextMatch } = await supabase
      .from('matches')
      .select('id')
      .eq('tournament_id', match.tournament_id)
      .eq('bracket_round', nextRound)
      .eq('match_order', nextMatchOrder)
      .maybeSingle()

    if (nextMatch) {
      const updatePayload: any = {}
      if (isHomeInNext) {
        updatePayload.home_team_id = winnerTeamId
        updatePayload.home_player_id = winnerPlayerId
      } else {
        updatePayload.away_team_id = winnerTeamId
        updatePayload.away_player_id = winnerPlayerId
      }
      await supabase.from('matches').update(updatePayload).eq('id', nextMatch.id)
    }

    // 2. Handle Loser (Double Elimination only)
    if (isDoubleElim && match.bracket_round < 10) {
      const loserTeamId = winnerTeamId === match.home_team_id ? match.away_team_id : match.home_team_id
      const loserPlayerId = winnerPlayerId === match.home_player_id ? match.away_player_id : match.home_player_id
      
      if (loserTeamId || loserPlayerId) {
        let lbTargetRound = 10
        let lbTargetMatch = Math.floor(match.match_order / 2)
        let isHomeInLb = match.match_order % 2 === 0

        if (match.bracket_round === 0) {
          lbTargetRound = 10 // WB R0 losers go to LB R0 (Survival)
        } else {
          lbTargetRound = 10 + (match.bracket_round * 2 - 1) // WB R1 losers -> LB R1 (Drop-in), etc.
          lbTargetMatch = match.match_order
          isHomeInLb = false // Newcomers usually take away slot in Drop-in
        }

        const { data: lbMatch } = await supabase
          .from('matches')
          .select('id')
          .eq('tournament_id', match.tournament_id)
          .eq('bracket_round', lbTargetRound)
          .eq('match_order', lbTargetMatch)
          .maybeSingle()

        if (lbMatch) {
          const lbPayload: any = {}
          if (isHomeInLb) {
            lbPayload.home_team_id = loserTeamId
            lbPayload.home_player_id = loserPlayerId
          } else {
            lbPayload.away_team_id = loserTeamId
            lbPayload.away_player_id = loserPlayerId
          }
          await supabase.from('matches').update(lbPayload).eq('id', lbMatch.id)
        }
      }
    }
  }

  revalidatePath(`/tournaments/${match.tournament_id}`)
  return { success: true }
}

export async function generateBracketMatches(tournamentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Verify authorization
  const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single()
  if (!tournament || tournament.organizer_id !== user.id) {
    return { error: 'Not authorized' }
  }

  // Fetch registrations
  const { data: registrations } = await supabase
    .from('tournament_registrations')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('status', 'registered')

  if (!registrations || registrations.length < 2) {
    return { error: 'Not enough registrations to generate a bracket (min 2)' }
  }

  // Clear existing matches for this tournament to avoid duplicates
  await supabase.from('matches').delete().eq('tournament_id', tournamentId)

  const participantsCount = Number(tournament.settings?.stage_participants_count) || 8
  const rounds = Math.ceil(Math.log2(participantsCount))
  const matchesToInsert: any[] = []

  if (tournament.bracket_structure === 'double_elimination') {
    // 1. Winners Bracket
    for (let r = 0; r < rounds; r++) {
      const matchesInRound = Math.pow(2, rounds - r - 1)
      for (let m = 0; m < matchesInRound; m++) {
        const matchData: any = {
          tournament_id: tournamentId,
          bracket_round: r,
          match_order: m,
          status: 'pending',
          details: { bracket: 'winners' }
        }

        if (r === 0) {
          const homeIdx = m * 2
          const awayIdx = m * 2 + 1
          if (homeIdx < registrations.length) {
            matchData.home_team_id = registrations[homeIdx].team_id
            matchData.home_player_id = registrations[homeIdx].player_id
          }
          if (awayIdx < registrations.length) {
            matchData.away_team_id = registrations[awayIdx].team_id
            matchData.away_player_id = registrations[awayIdx].player_id
          }
        }
        matchesToInsert.push(matchData)
      }
    }

    // 2. Losers Bracket
    // LB has 2 * (rounds - 1) rounds
    // Pattern: Survival (Phase A) -> Drop-in (Phase B)
    let lbRoundCount = (rounds - 1) * 2
    for (let r = 0; r < lbRoundCount; r++) {
      // Logic for matches in LB round:
      // Round 0 (Survival): N/4 matches
      // Round 1 (Drop-in): N/4 matches
      // Round 2 (Survival): N/8 matches
      // Round 3 (Drop-in): N/8 matches
      const wbRoundEq = Math.floor(r / 2)
      const matchesInRound = Math.pow(2, rounds - wbRoundEq - 2)
      
      for (let m = 0; m < matchesInRound; m++) {
        matchesToInsert.push({
          tournament_id: tournamentId,
          bracket_round: 10 + r, // Offset for Losers
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
    matchesToInsert.push({
      tournament_id: tournamentId,
      bracket_round: 20, // Grand Final
      match_order: 0,
      status: 'pending',
      details: { bracket: 'grand_finals' }
    })
    
    // Potential Reset Match
    matchesToInsert.push({
      tournament_id: tournamentId,
      bracket_round: 21, // Grand Final Reset
      match_order: 0,
      status: 'pending',
      details: { bracket: 'grand_finals_reset' }
    })

  } else {
    // Standard Single Elimination
    for (let r = 0; r < rounds; r++) {
      const matchesInRound = Math.pow(2, rounds - r - 1)
      for (let m = 0; m < matchesInRound; m++) {
        const matchData: any = {
          tournament_id: tournamentId,
          bracket_round: r,
          match_order: m,
          status: 'pending',
          details: { bracket: 'winners' }
        }

        if (r === 0) {
          const homeIdx = m * 2
          const awayIdx = m * 2 + 1
          if (homeIdx < registrations.length) {
            matchData.home_team_id = registrations[homeIdx].team_id
            matchData.home_player_id = registrations[homeIdx].player_id
          }
          if (awayIdx < registrations.length) {
            matchData.away_team_id = registrations[awayIdx].team_id
            matchData.away_player_id = registrations[awayIdx].player_id
          }
        }
        matchesToInsert.push(matchData)
      }
    }
  }

  const { error } = await supabase.from('matches').insert(matchesToInsert)

  if (error) return { error: error.message }

  // Update tournament status
  await supabase.from('tournaments').update({ status: 'ongoing' }).eq('id', tournamentId)

  revalidatePath(`/tournaments/${tournamentId}`)
  return { success: true }
}
