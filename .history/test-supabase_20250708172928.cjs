const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

console.log('Starting test script...')
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***present***' : '***missing***')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1)
    if (error) throw error
    console.log('Success! Data:', data)
  } catch (e) {
    console.error('Caught error:', e.message)
  }
}

testConnection().then(() => console.log('Test finished'))
