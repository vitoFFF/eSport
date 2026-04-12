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
