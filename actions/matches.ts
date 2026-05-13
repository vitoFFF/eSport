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

export async function updateMatchScore(matchId: string, homeScore: number, awayScore: number, winnerId?: string, isWalkover: boolean = false, setScores: string = '') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: match } = await supabase.from('matches').select('*').eq('id', matchId).single()
  if (!match) return { error: 'Match not found' }

  const { data: tournament } = await supabase.from('tournaments').select('organizer_id, bracket_structure, settings, third_place_match').eq('id', match.tournament_id).single()
  if (!tournament || tournament.organizer_id !== user.id) return { error: 'Not authorized' }

  const participantsCount = Number(tournament.settings?.stage_participants_count) || 8
  const matchFormat = tournament.settings?.match_format || 'bo1'

  // Validation
  let isFinished = true;
  if (!isWalkover) {
    const maxScore = Math.max(homeScore, awayScore);
    if (matchFormat === 'bo3' && maxScore < 2) isFinished = false;
    if (matchFormat === 'bo5' && maxScore < 3) isFinished = false;
    if (isFinished && homeScore === awayScore && tournament.bracket_structure !== 'round_robin' && tournament.bracket_structure !== 'group_stage' && tournament.bracket_structure !== 'swiss_system') {
      return { error: 'Elimination matches cannot end in a draw.' }
    }
  }

  // Determine winner IDs based on score
  let winnerTeamId = null
  let winnerPlayerId = null

  if (isFinished) {
      if (isWalkover && winnerId) {
        if (winnerId === match.home_team_id || winnerId === match.home_player_id) {
           winnerTeamId = match.home_team_id; winnerPlayerId = match.home_player_id;
        } else if (winnerId === match.away_team_id || winnerId === match.away_player_id) {
           winnerTeamId = match.away_team_id; winnerPlayerId = match.away_player_id;
        }
      } else {
        if (homeScore > awayScore) {
          winnerTeamId = match.home_team_id
          winnerPlayerId = match.home_player_id
        } else if (awayScore > homeScore) {
          winnerTeamId = match.away_team_id
          winnerPlayerId = match.away_player_id
        }
      }
  }

  const { error } = await supabase
    .from('matches')
    .update({
      home_score: homeScore,
      away_score: awayScore,
      winner_team_id: winnerTeamId,
      winner_player_id: winnerPlayerId,
      status: isFinished ? 'confirmed' : 'in_progress',
      details: { ...match.details, is_walkover: isWalkover, set_scores: setScores }
    })
    .eq('id', matchId)

  if (error) return { error: error.message }

  // Progression logic
  if (isFinished && (winnerTeamId || winnerPlayerId)) {
    const isDoubleElim = tournament.bracket_structure === 'double_elimination'
    const isSingleElim = tournament.bracket_structure === 'single_elimination' || tournament.bracket_structure === 'hybrid'
    const isElimination = isDoubleElim || isSingleElim;

    if (isElimination) {
      // Advance Winner
      let nextRound = match.bracket_round + 1
      let nextMatchOrder = Math.floor(match.match_order / 2)
      let isHomeInNext = match.match_order % 2 === 0

      if (isDoubleElim) {
        if (match.bracket_round < 10) { 
          const wbRounds = Math.ceil(Math.log2(participantsCount))
          if (match.bracket_round === wbRounds - 1) {
            nextRound = 20
            nextMatchOrder = 0
            isHomeInNext = true
          }
        } else if (match.bracket_round >= 10 && match.bracket_round < 20) {
          const lbRoundIdx = match.bracket_round - 10
          const isSurvival = lbRoundIdx % 2 === 0
          nextRound = match.bracket_round + 1
          if (isSurvival) {
            nextMatchOrder = match.match_order
            isHomeInNext = true 
          } else {
            nextMatchOrder = Math.floor(match.match_order / 2)
            isHomeInNext = match.match_order % 2 === 0
          }
          const maxLbRound = (Math.ceil(Math.log2(participantsCount)) - 1) * 2
          if (lbRoundIdx === maxLbRound - 1) {
            nextRound = 20
            nextMatchOrder = 0
            isHomeInNext = false 
          }
        }
      }

      if (nextRound !== 99 && match.bracket_round < 99) {
          const { data: nextMatch } = await supabase.from('matches').select('id').eq('tournament_id', match.tournament_id).eq('bracket_round', nextRound).eq('match_order', nextMatchOrder).maybeSingle()
          if (nextMatch) {
            const updatePayload: any = {}
            if (isHomeInNext) {
              updatePayload.home_team_id = winnerTeamId; updatePayload.home_player_id = winnerPlayerId;
            } else {
              updatePayload.away_team_id = winnerTeamId; updatePayload.away_player_id = winnerPlayerId;
            }
            await supabase.from('matches').update(updatePayload).eq('id', nextMatch.id)
          }
      }

      // Handle Loser (Double/Single Elimination)
      const loserTeamId = winnerTeamId === match.home_team_id ? match.away_team_id : match.home_team_id
      const loserPlayerId = winnerPlayerId === match.home_player_id ? match.away_player_id : match.home_player_id
      
      if (loserTeamId || loserPlayerId) {
        if (isDoubleElim && match.bracket_round < 10) {
          let lbTargetRound = 10
          let lbTargetMatch = Math.floor(match.match_order / 2)
          let isHomeInLb = match.match_order % 2 === 0

          if (match.bracket_round === 0) {
            lbTargetRound = 10 
          } else {
            lbTargetRound = 10 + (match.bracket_round * 2 - 1) 
            lbTargetMatch = match.match_order
            isHomeInLb = false 
          }

          // Cross-over
          if (lbTargetRound > 10 && lbTargetRound % 2 !== 0) {
              const matchesInLbRound = Math.pow(2, Math.ceil(Math.log2(participantsCount)) - Math.floor((lbTargetRound - 10) / 2) - 2);
              lbTargetMatch = (matchesInLbRound - 1) - lbTargetMatch;
          }

          const { data: lbMatch } = await supabase.from('matches').select('id').eq('tournament_id', match.tournament_id).eq('bracket_round', lbTargetRound).eq('match_order', lbTargetMatch).maybeSingle()
          if (lbMatch) {
            const lbPayload: any = {}
            if (isHomeInLb) {
              lbPayload.home_team_id = loserTeamId; lbPayload.home_player_id = loserPlayerId;
            } else {
              lbPayload.away_team_id = loserTeamId; lbPayload.away_player_id = loserPlayerId;
            }
            await supabase.from('matches').update(lbPayload).eq('id', lbMatch.id)
          }
        }

        // Third-place match routing
        if (isSingleElim && tournament.third_place_match) {
           const wbRounds = Math.ceil(Math.log2(participantsCount));
           if (match.bracket_round === wbRounds - 2) { // Semi-finals
              const { data: thirdMatch } = await supabase.from('matches').select('id').eq('tournament_id', match.tournament_id).eq('bracket_round', 99).maybeSingle();
              if (thirdMatch) {
                 const tpPayload: any = {}
                 if (match.match_order % 2 === 0) {
                     tpPayload.home_team_id = loserTeamId; tpPayload.home_player_id = loserPlayerId;
                 } else {
                     tpPayload.away_team_id = loserTeamId; tpPayload.away_player_id = loserPlayerId;
                 }
                 await supabase.from('matches').update(tpPayload).eq('id', thirdMatch.id);
              }
           }
        }
      }

      // GF Reset logic
      if (isDoubleElim && match.bracket_round === 20) {
          if (winnerTeamId === match.away_team_id || winnerPlayerId === match.away_player_id) {
              const { data: resetMatch } = await supabase.from('matches').select('id').eq('tournament_id', match.tournament_id).eq('bracket_round', 21).maybeSingle();
              if (resetMatch) {
                  await supabase.from('matches').update({
                      home_team_id: match.home_team_id, home_player_id: match.home_player_id,
                      away_team_id: match.away_team_id, away_player_id: match.away_player_id
                  }).eq('id', resetMatch.id)
              }
          } else {
              await supabase.from('matches').delete().eq('tournament_id', match.tournament_id).eq('bracket_round', 21)
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

  const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single()
  if (!tournament || tournament.organizer_id !== user.id) return { error: 'Not authorized' }

  const { data: registrationsData } = await supabase.from('tournament_registrations').select('*').eq('tournament_id', tournamentId).eq('status', 'registered')

  if (!registrationsData || registrationsData.length < 2) return { error: 'Not enough registrations to generate a bracket (min 2)' }

  let registrations = [...registrationsData]
  if (tournament.seeding_method === 'random') {
    for (let i = registrations.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [registrations[i], registrations[j]] = [registrations[j], registrations[i]];
    }
  } else {
    registrations.sort((a, b) => (a.details?.seed_index || 0) - (b.details?.seed_index || 0));
  }

  await supabase.from('matches').delete().eq('tournament_id', tournamentId)

  let participantsCount = registrations.length
  const matchesToInsert: any[] = []
  const structure = tournament.bracket_structure

  if (structure === 'double_elimination' || structure === 'single_elimination') {
    const powerOfTwo = Math.pow(2, Math.ceil(Math.log2(participantsCount)))
    const rounds = Math.log2(powerOfTwo)
    const byes = powerOfTwo - participantsCount

    const bracketParticipants = new Array(powerOfTwo).fill(undefined)
    for (let i = 0; i < byes; i++) {
        bracketParticipants[i * 2] = registrations[i]
        bracketParticipants[i * 2 + 1] = null // null means BYE
    }
    let regIndex = byes;
    for (let i = 0; i < powerOfTwo; i++) {
        if (bracketParticipants[i] === undefined) bracketParticipants[i] = registrations[regIndex++];
    }

    if (structure === 'single_elimination') {
      for (let r = 0; r < rounds; r++) {
        const matchesInRound = Math.pow(2, rounds - r - 1)
        for (let m = 0; m < matchesInRound; m++) {
          const matchData: any = { tournament_id: tournamentId, bracket_round: r, match_order: m, status: 'pending', details: { bracket: 'winners' } }
          if (r === 0) {
            const home = bracketParticipants[m * 2]
            const away = bracketParticipants[m * 2 + 1]
            if (home) { matchData.home_team_id = home.team_id; matchData.home_player_id = home.player_id }
            if (away) { matchData.away_team_id = away.team_id; matchData.away_player_id = away.player_id }
            else if (home) {
                matchData.status = 'confirmed'
                matchData.winner_team_id = home.team_id
                matchData.winner_player_id = home.player_id
                matchData.details.is_walkover = true
            }
          }
          matchesToInsert.push(matchData)
        }
      }
      if (tournament.third_place_match) {
        matchesToInsert.push({ tournament_id: tournamentId, bracket_round: 99, match_order: 0, status: 'pending', details: { bracket: 'third_place' } })
      }
    } else {
      for (let r = 0; r < rounds; r++) {
        const matchesInRound = Math.pow(2, rounds - r - 1)
        for (let m = 0; m < matchesInRound; m++) {
          const matchData: any = { tournament_id: tournamentId, bracket_round: r, match_order: m, status: 'pending', details: { bracket: 'winners' } }
          if (r === 0) {
            const home = bracketParticipants[m * 2]
            const away = bracketParticipants[m * 2 + 1]
            if (home) { matchData.home_team_id = home.team_id; matchData.home_player_id = home.player_id }
            if (away) { matchData.away_team_id = away.team_id; matchData.away_player_id = away.player_id }
            else if (home) {
                matchData.status = 'confirmed'
                matchData.winner_team_id = home.team_id
                matchData.winner_player_id = home.player_id
                matchData.details.is_walkover = true
            }
          }
          matchesToInsert.push(matchData)
        }
      }
      let lbRoundCount = (rounds - 1) * 2
      for (let r = 0; r < lbRoundCount; r++) {
        const wbRoundEq = Math.floor(r / 2)
        const matchesInRound = Math.pow(2, rounds - wbRoundEq - 2)
        for (let m = 0; m < matchesInRound; m++) {
          matchesToInsert.push({ tournament_id: tournamentId, bracket_round: 10 + r, match_order: m, status: 'pending', details: { bracket: 'losers', phase: r % 2 === 0 ? 'survival' : 'drop-in' } })
        }
      }
      matchesToInsert.push({ tournament_id: tournamentId, bracket_round: 20, match_order: 0, status: 'pending', details: { bracket: 'grand_finals' } })
      matchesToInsert.push({ tournament_id: tournamentId, bracket_round: 21, match_order: 0, status: 'pending', details: { bracket: 'grand_finals_reset' } })
    }

  } else if (structure === 'round_robin' || structure === 'group_stage' || structure === 'hybrid') {
    const groupCount = (structure === 'group_stage' || structure === 'hybrid') ? Math.max(1, Math.ceil(registrations.length / 4)) : 1;
    const groups: any[][] = Array.from({length: groupCount}, () => []);
    
    for (let i = 0; i < registrations.length; i++) {
        const roundTrip = Math.floor(i / groupCount);
        const direction = roundTrip % 2 === 0 ? 1 : -1;
        const groupIndex = direction === 1 ? i % groupCount : (groupCount - 1) - (i % groupCount);
        groups[groupIndex].push(registrations[i]);
    }

    groups.forEach((groupRegs, gIndex) => {
        const isOdd = groupRegs.length % 2 !== 0;
        const players = [...groupRegs];
        if (isOdd) players.push(null);
        const n = players.length;
        const rounds = n - 1;
        const half = n / 2;

        for (let r = 0; r < rounds; r++) {
            for (let i = 0; i < half; i++) {
                const home = players[i];
                const away = players[n - 1 - i];
                if (home !== null && away !== null) {
                    matchesToInsert.push({
                        tournament_id: tournamentId,
                        bracket_round: gIndex,
                        match_order: matchesToInsert.length,
                        status: 'pending',
                        home_team_id: home.team_id,
                        home_player_id: home.player_id,
                        away_team_id: away.team_id,
                        away_player_id: away.player_id,
                        details: { bracket: structure, group_index: gIndex, rr_round: r }
                    });
                }
            }
            players.splice(1, 0, players.pop() as any);
        }
    });

    if (structure === 'hybrid') {
        const promotionCount = parseInt(tournament.settings?.promotion_count || '2');
        const playoffCount = groupCount * promotionCount;
        const playoffRounds = Math.ceil(Math.log2(playoffCount));
        for (let r = 0; r < playoffRounds; r++) {
            const matchesInRound = Math.pow(2, playoffRounds - r - 1);
            for (let m = 0; m < matchesInRound; m++) {
                matchesToInsert.push({ tournament_id: tournamentId, bracket_round: 50 + r, match_order: m, status: 'pending', details: { bracket: 'playoffs' } });
            }
        }
    }

  } else if (structure === 'swiss_system') {
    const n = registrations.length;
    const isOdd = n % 2 !== 0;
    const players = [...registrations];
    
    if (isOdd) {
       const byePlayer = players.pop();
       matchesToInsert.push({
           tournament_id: tournamentId,
           bracket_round: 0,
           match_order: 0,
           status: 'confirmed',
           home_team_id: byePlayer.team_id,
           home_player_id: byePlayer.player_id,
           winner_team_id: byePlayer.team_id,
           winner_player_id: byePlayer.player_id,
           home_score: 1, away_score: 0,
           details: { bracket: 'swiss', is_walkover: true, is_bye: true }
       });
    }

    const half = Math.floor(players.length / 2);
    for (let m = 0; m < half; m++) {
        const home = players[m];
        const away = players[m + half];
        matchesToInsert.push({
            tournament_id: tournamentId,
            bracket_round: 0,
            match_order: m + (isOdd ? 1 : 0),
            status: 'pending',
            home_team_id: home.team_id,
            home_player_id: home.player_id,
            away_team_id: away.team_id,
            away_player_id: away.player_id,
            details: { bracket: 'swiss' }
        });
    }
  }

  const { error } = await supabase.from('matches').insert(matchesToInsert)
  if (error) return { error: error.message }

  await supabase.from('tournaments').update({ status: 'ongoing' }).eq('id', tournamentId)

  // Auto progress walkovers
  const { data: insertedMatches } = await supabase.from('matches').select('*').eq('tournament_id', tournamentId).eq('status', 'confirmed');
  if (insertedMatches) {
      for (const m of insertedMatches) {
          if (m.details?.is_walkover && (structure === 'single_elimination' || structure === 'double_elimination')) {
              await updateMatchScore(m.id, 1, 0, m.winner_team_id || m.winner_player_id, true);
          }
      }
  }

  revalidatePath(`/tournaments/${tournamentId}`)
  return { success: true }
}

export async function generateNextSwissRound(tournamentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: tournament } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single()
  if (!tournament || tournament.organizer_id !== user.id) return { error: 'Not authorized' }

  const { data: matches } = await supabase.from('matches').select('*').eq('tournament_id', tournamentId)
  
  if (!matches) return { error: 'No matches found' }

  const pending = matches.filter(m => m.status !== 'confirmed')
  if (pending.length > 0) return { error: 'Cannot generate next round while matches are pending.' }

  const currentRound = Math.max(...matches.map(m => m.bracket_round))
  
  // Build stats
  const { data: registrations } = await supabase.from('tournament_registrations').select('*').eq('tournament_id', tournamentId)
  if (!registrations) return { error: 'No registrations found' }

  const stats = registrations.reduce((acc, r) => {
      const id = r.team_id || r.player_id;
      acc[id] = { id, points: 0, opponents: new Set<string>(), hadBye: false, rObj: r }
      return acc
  }, {} as Record<string, any>);

  matches.forEach(m => {
      const hId = m.home_team_id || m.home_player_id
      const aId = m.away_team_id || m.away_player_id
      if (hId && stats[hId]) {
          if (m.details?.is_bye) stats[hId].hadBye = true;
          if (aId) stats[hId].opponents.add(aId)
          if (m.winner_team_id === hId || m.winner_player_id === hId) stats[hId].points += 3
      }
      if (aId && stats[aId]) {
          if (hId) stats[aId].opponents.add(hId)
          if (m.winner_team_id === aId || m.winner_player_id === aId) stats[aId].points += 3
      }
  });

  const players: any[] = Object.values(stats).sort((a: any, b: any) => b.points - a.points);
  const nextRoundMatches: any[] = []
  
  let matchOrder = 0;
  
  if (players.length % 2 !== 0) {
      // Find lowest points player who hasn't had a bye
      let byePlayerIdx = -1;
      for (let i = players.length - 1; i >= 0; i--) {
          if (!players[i].hadBye) {
              byePlayerIdx = i;
              break;
          }
      }
      if (byePlayerIdx !== -1) {
          const byePlayer = players.splice(byePlayerIdx, 1)[0]
          nextRoundMatches.push({
              tournament_id: tournamentId,
              bracket_round: currentRound + 1,
              match_order: matchOrder++,
              status: 'confirmed',
              home_team_id: byePlayer.rObj.team_id,
              home_player_id: byePlayer.rObj.player_id,
              winner_team_id: byePlayer.rObj.team_id,
              winner_player_id: byePlayer.rObj.player_id,
              home_score: 1, away_score: 0,
              details: { bracket: 'swiss', is_walkover: true, is_bye: true }
          })
      }
  }

  // Simple pairing logic avoiding rematches
  const paired = new Set<string>();
  for (let i = 0; i < players.length; i++) {
      if (paired.has(players[i].id)) continue;
      const p1 = players[i];
      let pairedIdx = -1;
      
      for (let j = i + 1; j < players.length; j++) {
          if (paired.has(players[j].id)) continue;
          if (!p1.opponents.has(players[j].id)) {
              pairedIdx = j;
              break;
          }
      }
      
      // Fallback if everyone played everyone (rare in proper swiss, but just in case pair with next)
      if (pairedIdx === -1) {
          for (let j = i + 1; j < players.length; j++) {
              if (!paired.has(players[j].id)) {
                  pairedIdx = j;
                  break;
              }
          }
      }
      
      if (pairedIdx !== -1) {
          const p2 = players[pairedIdx];
          paired.add(p1.id);
          paired.add(p2.id);
          nextRoundMatches.push({
              tournament_id: tournamentId,
              bracket_round: currentRound + 1,
              match_order: matchOrder++,
              status: 'pending',
              home_team_id: p1.rObj.team_id,
              home_player_id: p1.rObj.player_id,
              away_team_id: p2.rObj.team_id,
              away_player_id: p2.rObj.player_id,
              details: { bracket: 'swiss' }
          });
      }
  }

  const { error } = await supabase.from('matches').insert(nextRoundMatches)
  if (error) return { error: error.message }

  revalidatePath(`/tournaments/${tournamentId}`)
  return { success: true }
}
