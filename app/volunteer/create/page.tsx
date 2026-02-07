import VolunteerForm from '@/components/volunteer/VolunteerForm'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function VolunteerPage() {
    const supabase = await createClient()
    const { data: feature } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'feature_volunteer_delivery')
        .maybeSingle()

    if (feature && feature.value === false) {
        redirect('/')
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        const message = encodeURIComponent('لا يمكنك التبرع بالتوصيل إلا عند تسجيل دخولك')
        redirect(`/login?error=${message}`)
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <VolunteerForm />
        </div>
    )
}
