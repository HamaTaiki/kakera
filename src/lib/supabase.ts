import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if variables are missing OR if they are still the placeholder values
const isSupabaseConfigured =
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'your_supabase_url_here' &&
    !supabaseUrl.includes('placeholder')

export const supabase = createClient(
    isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
    isSupabaseConfigured ? supabaseAnonKey : 'placeholder'
)

if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured yet. Please check your .env file and ensure variables start with VITE_')
}

export { isSupabaseConfigured }
