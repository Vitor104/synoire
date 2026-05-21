import { isSupabaseConfigured } from '@/lib/supabase'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Best-effort persist on tab close. Uses fetch keepalive so Authorization can be sent.
 * Fire-and-forget; errors are not surfaced to the UI.
 */
export function flushPartialSessionKeepalive(
  accessToken: string,
  roomId: string,
  durationMinutes: number,
): void {
  if (durationMinutes < 1 || !isSupabaseConfigured || !url || !anonKey) return

  void fetch(`${url}/rest/v1/rpc/record_study_time`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      p_room_id: roomId,
      p_duration_minutes: durationMinutes,
    }),
    keepalive: true,
  })
}
