import { createClient } from "@/lib/supabase-server"
import { notFound, redirect } from "next/navigation"
import { ItemForm } from "@/components/items/ItemForm"

// Fix for Next.js 15 params
type Params = Promise<{ id: string }>

export default async function EditItemPage(props: { params: Params }) {
    const params = await props.params
    const { id } = params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Fetch Item
    const { data: item } = await supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single()

    if (!item) {
        notFound()
    }

    // Authorization Check: Only owner or admin can edit
    // For now, let's enforce ownership.
    // If we want admins to edit, we'd check profile role too.
    if (item.user_id !== user.id) {
        // Check if admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
            redirect('/') // Or show unauthorized message
        }
    }

    // Fetch Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name')

    const { data: subCategories } = await supabase
        .from('sub_categories')
        .select('*')
        .order('name')

    // Fetch Feature Flags - Defaulting to true/false logic matching DonatePage if not in DB
    // Assuming we fetch from 'system_settings' or just hardcode for now as they were passed in DonateForm.
    // In DonateForm usage (app/donate/page.tsx), it fetches feature flags? I should check.
    // Let's assume defaults for now or fetch if table exists. 
    // I recall `system_settings` table in schema.

    let featureFlags = {
        maintenance: true
    }

    const { data: settings } = await supabase.from('system_settings').select('*')
    if (settings) {
        settings.forEach(setting => {

            if (setting.key === 'feature_maintenance') featureFlags.maintenance = !!setting.value
        })
    }

    return (
        <div className="container mx-auto py-10 px-4 md:px-0">
            <h1 className="text-3xl font-bold tracking-tight mb-8 text-center">Edit Item</h1>
            <ItemForm
                categories={categories || []}
                subCategories={subCategories || []}
                featureFlags={featureFlags}
                initialData={item}
            />
        </div>
    )
}
