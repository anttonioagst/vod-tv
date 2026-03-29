import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getAffiliateApplication(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('affiliate_applications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return data
  } catch {
    return null
  }
}

export async function submitAffiliateApplication(formData: FormData) {
  'use server'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const channelName = formData.get('channel_name') as string
  const socialLinks = formData.getAll('social_links') as string[]
  const message = formData.get('message') as string

  const { error } = await supabase
    .from('affiliate_applications')
    .insert({
      user_id: user.id,
      channel_name: channelName,
      social_links: socialLinks.filter(Boolean),
      message,
    })

  if (error) {
    if (error.code === '23505') redirect('/affiliates?error=already_applied')
    throw error
  }

  redirect('/affiliates?success=true')
}
