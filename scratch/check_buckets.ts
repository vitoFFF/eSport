
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://otkvnzxwisiokmtvybhf.supabase.co',
  'sb_publishable_vJvkgO8uhCjJ2KOJvc5IOA_Jr01j6_W'
)

async function checkBuckets() {
  const { data, error } = await supabase.storage.listBuckets()
  if (error) {
    console.error('Error listing buckets:', error)
  } else {
    console.log('Buckets:', data)
  }
}

checkBuckets()
