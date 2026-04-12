'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createOrganization(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const name = formData.get('name') as string
  const avatarUrl = formData.get('avatarUrl') as string

  const { data, error } = await supabase
    .from('organizations')
    .insert({
      name,
      owner_id: user.id,
      avatar_url: avatarUrl,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/profile')
  return { success: true, organization: data }
}
