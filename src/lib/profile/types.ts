export type ProfileRow = {
  id: string
  username: string
  avatar_url: string | null
  target_exam: string | null
  bio: string | null
  plan_tier?: string | null
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  subscription_status?: string | null
  created_at?: string
  updated_at?: string
}

export type ProfileView = {
  displayName: string | null
  targetExam: string | null
  bio: string | null
  avatarUrl: string | null
}

export function mapProfileRow(row: ProfileRow): ProfileView {
  return {
    displayName: row.username?.trim() || null,
    targetExam: row.target_exam?.trim() || null,
    bio: row.bio?.trim() || null,
    avatarUrl: row.avatar_url?.trim() || null,
  }
}
