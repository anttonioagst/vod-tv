import { createClient } from '@supabase/supabase-js'
import { config } from './config.js'

export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
)

export type CreatorChannelRow = {
  id: string
  channel_id: string
  platform: string
  platform_user_id: string
  platform_username: string
  twitch_webhook_id: string | null
  auto_record: boolean
}

export type LiveSessionRow = {
  id: string
  channel_id: string
  platform: string
  stream_title: string | null
  started_at: string | null
  ended_at: string | null
  status: string
  recording_path: string | null
  hls_url: string | null
  video_id: string | null
}

export async function getActiveCreatorChannels(): Promise<CreatorChannelRow[]> {
  const { data, error } = await supabase
    .from('creator_channels')
    .select('*')
    .eq('platform', 'twitch')
    .eq('auto_record', true)
  if (error) throw error
  return data ?? []
}

export async function getRecordingLiveSessions(): Promise<LiveSessionRow[]> {
  const { data, error } = await supabase
    .from('live_sessions')
    .select('*')
    .eq('status', 'recording')
  if (error) throw error
  return data ?? []
}

export async function updateLiveSessionWebhookId(
  channelId: string,
  webhookId: string
): Promise<void> {
  await supabase
    .from('creator_channels')
    .update({ twitch_webhook_id: webhookId })
    .eq('channel_id', channelId)
    .eq('platform', 'twitch')
}
