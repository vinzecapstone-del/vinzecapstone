const { createClient } = require('@supabase/supabase-js')

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\nSet SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment and re-run.')
  process.exit(1)
}

const supabase = createClient(url, key)

async function run() {
  try {
    const { data: existing, error: selErr } = await supabase.from('system_settings').select('*').limit(1).maybeSingle()
    if (selErr) throw selErr

    if (existing && existing.id) {
      const { error } = await supabase
        .from('system_settings')
        .update({ captain_name: 'Hon. Eduardo I. Madeja', updated_at: new Date().toISOString() })
        .eq('id', existing.id)

      if (error) throw error
      console.log(`Updated system_settings id=${existing.id} to Hon. Eduardo I. Madeja`)
    } else {
      const { data, error } = await supabase
        .from('system_settings')
        .insert({ captain_name: 'Hon. Eduardo I. Madeja', created_at: new Date().toISOString() })
        .select()
        .maybeSingle()

      if (error) throw error
      console.log(`Inserted new system_settings id=${data?.id ?? '(unknown)'} with Hon. Eduardo I. Madeja`)
    }
  } catch (err) {
    console.error('Operation failed:', err)
    process.exit(1)
  }
}

run()
