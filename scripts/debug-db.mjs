
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
    console.log('--- Debugging Supabase Data ---')

    // 1. Check Categories
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name')

    if (catError) {
        console.error('Error fetching categories:', catError)
    } else {
        console.log(`Found ${categories?.length || 0} categories:`)
        console.table(categories)
    }

    // 2. Check Subcategories
    const { data: subcats, error: subError } = await supabase
        .from('sub_categories')
        .select('id, name, category_id')
        .limit(5)

    if (subError) {
        console.error('Error fetching subcategories:', subError)
    } else {
        console.log(`Found ${subcats?.length || 0} subcategories (showing first 5):`)
        console.table(subcats)
    }

    // 3. Check Items
    const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('id, title, status, category_id')
        .eq('status', 'active')
        .limit(5)

    if (itemsError) {
        console.error('Error fetching items:', itemsError)
    } else {
        console.log(`Found ${items?.length || 0} active items (showing first 5):`)
        console.table(items)
    }

    // 4. Check if RLS might be the issue (try to fetch something that should be public)
    const { count, error: countError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })

    if (countError) {
        console.error('Error counting categories:', countError)
    } else {
        console.log(`Total category count: ${count}`)
    }
}

debug()
