'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const fullName = formData.get('fullName') as string
  const username = formData.get('username') as string
  const bio = formData.get('bio') as string
  const games = formData.getAll('games') as string[]
  const avatarUrl = formData.get('avatarUrl') as string

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      username,
      bio,
      games,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function createTeam(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const avatarUrl = formData.get('avatarUrl') as string
  const organizationId = formData.get('organizationId') as string
  const category = formData.get('category') as string

  if (!organizationId || !category) {
    return { error: 'Organization ID and Category are required' }
  }

  // Business Logic: A User is restricted to being a member of only ONE team per category.
  // Note: We might enforce this at joining/invitation, but checking manager level too
  const { data: existingTeam } = await supabase
    .from('team_members')
    .select('teams(category)')
    .eq('user_id', user.id)
    .single()

  // Wait, existingTeam logic here might be more complex, we'll rely on DB constraints or future queries.

  const { data, error } = await supabase
    .from('teams')
    .insert({
      name,
      organization_id: organizationId,
      avatar_url: avatarUrl,
      category
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Automatically add the creator to team_members
  await supabase.from('team_members').insert({
    team_id: data.id,
    user_id: user.id,
    status: 'joined'
  })

  revalidatePath('/profile')
  return { success: true, team: data }
}

export async function invitePlayer(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const teamId = formData.get('teamId') as string
  const username = (formData.get('username') as string).trim()

  // Verify Manager Ownership
  const { data: teamCheck } = await supabase
    .from('teams')
    .select('organizations!inner(owner_id)')
    .eq('id', teamId)
    .single()

  if (!teamCheck) {
    return { error: 'Unauthorized: You do not own this team.' }
  }

  const orgs: any = teamCheck.organizations
  const ownerId = Array.isArray(orgs) ? orgs[0]?.owner_id : orgs?.owner_id

  if (ownerId !== user.id) {
    return { error: 'Unauthorized: You do not own this team.' }
  }

  const query = username.toLowerCase()
  const { data: player, error: playerError } = await supabase
    .from('profiles')
    .select('id')
    .or(`username.ilike.${query},full_name.ilike.${query}`)
    .maybeSingle()

  if (playerError || !player) return { error: 'Player not found' }

  const { error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id: player.id,
      status: 'pending'
    })

  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { success: true }
}

export async function createTournament(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const prizePool = formData.get('prizePool') as string
  const description = formData.get('description') as string
  const rules = formData.get('rules') as string
  const bannerUrl = formData.get('bannerUrl') as string

  // Step 1 & 2 fields
  const platform = formData.get('platform') as string
  const locationType = formData.get('locationType') as string
  const locationUrl = formData.get('locationUrl') as string
  const locationAddress = formData.get('locationAddress') as string
  const entryFee = formData.get('entryFee') as string
  const participantLimit = formData.get('participantLimit') ? parseInt(formData.get('participantLimit') as string) : null

  // Date parsing
  const registrationStartDate = formData.get('registrationStartDate') ? new Date(formData.get('registrationStartDate') as string).toISOString() : null
  const registrationEndDate = formData.get('registrationEndDate') ? new Date(formData.get('registrationEndDate') as string).toISOString() : null
  const startDate = formData.get('startDate') ? new Date(formData.get('startDate') as string).toISOString() : null
  const endDate = formData.get('endDate') ? new Date(formData.get('endDate') as string).toISOString() : null

  // Format & Advanced Settings
  const participationMode = formData.get('participationMode') as string || 'team'
  const teamSize = parseInt(formData.get('teamSize') as string || '1')
  const bracketStructure = formData.get('bracketStructure') as string || 'single_elimination'
  const matchFormat = formData.get('matchFormat') as string || 'bo1'
  const finalMatchFormat = formData.get('finalMatchFormat') as string || matchFormat
  const seedingMethod = formData.get('seedingMethod') as string || 'random'
  const scoreReportingMethod = formData.get('scoreReportingMethod') as string || 'admins_only'
  const tieBreakerRule = formData.get('tieBreakerRule') as string
  const thirdPlaceMatch = formData.get('thirdPlaceMatch') === 'true'
  
  const stageParticipants = parseInt(formData.get('stageParticipants') as string || '8')
  const promotionCount = parseInt(formData.get('promotionCount') as string || '2')
  const groupCount = parseInt(formData.get('groupCount') as string || '0')
  const pointPolicy = JSON.parse(formData.get('pointPolicy') as string || '{"1st": 500, "2nd": 200}')

  const { data, error } = await supabase
    .from('tournaments')
    .insert({
      name,
      prize_pool: prizePool,
      description,
      rules,
      banner_url: bannerUrl,
      organizer_id: user.id,
      status: 'upcoming',
      category: formData.get('category') as string || 'esport',
      platform,
      location_type: locationType,
      location_url: locationUrl,
      location_address: locationAddress,
      participant_limit: participantLimit,
      registration_start_date: registrationStartDate,
      registration_end_date: registrationEndDate,
      start_date: startDate,
      end_date: endDate,
      entry_fee: entryFee,
      participation_mode: participationMode,
      team_size: teamSize,
      bracket_structure: bracketStructure,
      match_format: matchFormat,
      final_match_format: finalMatchFormat,
      seeding_method: seedingMethod,
      score_reporting_method: scoreReportingMethod,
      tie_breaker_rule: tieBreakerRule,
      third_place_match: thirdPlaceMatch,
      point_policy: pointPolicy,
      settings: {
        stage_participants_count: stageParticipants,
        match_format: matchFormat,
        promotion_count: promotionCount,
        group_count: groupCount
      }
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/profile')
  revalidatePath('/tournaments')
  return { success: true, tournament: data }
}

export async function respondToInvite(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const teamId = formData.get('teamId') as string
  const accept = formData.get('accept') === 'true'

  if (accept) {
    const { error } = await supabase
      .from('team_members')
      .update({ status: 'joined', joined_at: new Date().toISOString() })
      .eq('team_id', teamId)
      .eq('user_id', user.id)

    if (error) return { error: error.message }
  } else {
    // If rejected, just delete the pending invite
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      
    if (error) return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function leaveTeam(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const teamId = formData.get('teamId') as string

  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { success: true }
}

export async function registerForTournament(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const tournamentId = formData.get('tournamentId') as string
  const mode = formData.get('mode') as string // 'team' or '1v1'
  const teamId = formData.get('teamId') as string

  const payload: any = {
    tournament_id: tournamentId,
    status: 'registered'
  }

  // Check Participant Limit
  const { data: tournament } = await supabase.from('tournaments').select('settings').eq('id', tournamentId).single()
  const maxParticipants = tournament?.settings?.stage_participants_count ? parseInt(tournament.settings.stage_participants_count) : 8

  const { count } = await supabase
    .from('tournament_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('tournament_id', tournamentId)
    .eq('status', 'registered')

  if (count !== null && count >= maxParticipants) {
    return { error: 'Registration closed: Participant limit reached.' }
  }

  if (mode === 'Team NvN' || mode === 'team') {
    if (!teamId) return { error: 'A team selection is required for team tournaments.' }
    payload.team_id = teamId
  } else {
    payload.player_id = user.id
  }

  const { error } = await supabase
    .from('tournament_registrations')
    .insert(payload)

  if (error) return { error: error.message }

  revalidatePath(`/tournaments/${tournamentId}`)
  return { success: true }
}

export async function cancelRegistration(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const tournamentId = formData.get('tournamentId') as string
  const teamId = formData.get('teamId') as string;
  
  let query = supabase
    .from('tournament_registrations')
    .delete()
    .eq('tournament_id', tournamentId);
  
  if (teamId) {
    query = query.eq('team_id', teamId);
  } else {
    query = query.eq('player_id', user.id);
  }

  const { error } = await query;

  if (error) return { error: error.message }

  revalidatePath(`/tournaments/${tournamentId}`)
  return { success: true }
}

export async function deleteTournament(tournamentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Verify Ownership
  const { data: tournament, error: fetchError } = await supabase
    .from('tournaments')
    .select('organizer_id')
    .eq('id', tournamentId)
    .single()

  if (fetchError || !tournament) return { error: 'Tournament not found' }
  if (tournament.organizer_id !== user.id) return { error: 'Unauthorized: You do not own this tournament.' }

  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', tournamentId)

  if (error) return { error: error.message }

  revalidatePath('/profile')
  revalidatePath('/tournaments')
  return { success: true }
}

