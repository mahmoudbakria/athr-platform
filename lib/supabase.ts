import { createBrowserClient } from '@supabase/ssr'

// Export createClient function (Preferred for App Router)
export const createClient = () =>
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

// Export singleton instance (For legacy compatibility)
export const supabase = createClient()