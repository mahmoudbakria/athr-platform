import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function checkVolunteers() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data, error } = await supabase
        .from('volunteer_deliveries')
        .select('*')

    if (error) {
        console.error("Error:", error)
        return
    }

    console.log(`Total volunteers: ${data.length}`)
    data.forEach(v => {
        console.log(`- ID: ${v.id}, From: ${v.from_city}, To: ${v.to_city}, Status: ${v.status}, Date: ${v.delivery_date}`)
    })

    const { data: settings } = await supabase
        .from('system_settings')
        .select('*')

    console.log("\nSystem Settings:")
    settings?.forEach(s => {
        console.log(`- ${s.key}: ${s.value}`)
    })
}

checkVolunteers()
