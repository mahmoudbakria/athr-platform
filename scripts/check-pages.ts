
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPages() {
    console.log('Checking pages table...');
    const { data, error } = await supabase.from('pages').select('*');

    if (error) {
        console.error('Error fetching pages:', error.message);
        if (error.message.includes('relation "pages" does not exist')) {
            console.log('TABLE MISSING: The "pages" table does not exist.');
        }
    } else {
        console.log(`Found ${data.length} pages.`);
        data.forEach(p => console.log(` - /${p.slug}: ${p.title}`));
    }
}

checkPages();
