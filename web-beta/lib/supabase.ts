import { createBrowserClient } from "@supabase/ssr"

export const supabaseBrowser = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

export type WaitlistInsert = {
  email: string
  android_version?: string
  device_model?: string
  photographer_type?: "hobbyist" | "creator" | "pro" | "ecommerce" | "student"
  current_apps?: string[]
  pain_point?: string
  country?: string
  referral?: string
  consent_marketing: boolean
  // Beta Program fields
  beta_tier?: "pioneer" | "open"
  agree_nda?: boolean
}
