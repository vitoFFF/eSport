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
  const { data: tournament } = await supabase.from('tournaments').select('organizer_id').eq('id', match.tournament_id).single()
  if (!tournament || tournament.organizer_id !== user.id) {
    return { error: 'Not authorized' }
  }

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

  // Progression logic: Move winner to next round
  if (winnerTeamId || winnerPlayerId) {
    const nextRound = match.bracket_round + 1
    const nextMatchOrder = Math.floor(match.match_order / 2)
    const isHomeInNext = match.match_order % 2 === 0

    // Find the recipient match in the next round
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

      await supabase
        .from('matches')
        .update(updatePayload)
        .eq('id', nextMatch.id)
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

  const participantsCount = tournament.settings?.stage_participants_count || 8
  const rounds = Math.ceil(Math.log2(participantsCount))
  
  const matchesToInsert: any[] = []

  // Create matches for each round
  for (let r = 0; r < rounds; r++) {
    const matchesInRound = Math.pow(2, rounds - r - 1)
    for (let m = 0; m < matchesInRound; m++) {
      const matchData: any = {
        tournament_id: tournamentId,
        bracket_round: r,
        match_order: m,
        status: 'pending'
      }

      // Assign teams to the first round
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

  const { error } = await supabase.from('matches').insert(matchesToInsert)

  if (error) return { error: error.message }

  // Update tournament status
  await supabase.from('tournaments').update({ status: 'ongoing' }).eq('id', tournamentId)

  revalidatePath(`/tournaments/${tournamentId}`)
  return { success: true }
}
