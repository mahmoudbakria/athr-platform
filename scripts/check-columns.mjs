
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
    console.log('--- Checking Categories Columns ---')

    // Try to select everything to see what's there
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error fetching categories:', error)
    } else if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]))
    } else {
        console.log('No data found in categories')
    }

    // Check sub_categories too
    const { data: subData, error: subError } = await supabase
        .from('sub_categories')
        .select('*')
        .limit(1)

    if (subError) {
        console.error('Error fetching subcategories:', subError)
    } else if (subData && subData.length > 0) {
        console.log('Subcategory Columns:', Object.keys(subData[0]))
    }
}

debug()
