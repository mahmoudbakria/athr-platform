import { getVolunteerDeliveries, toggleVolunteerSystem } from '@/app/admin/volunteers/actions'
import AdminVolunteerTable from '@/components/admin/volunteers/AdminVolunteerTable'
import { createClient } from '@/lib/supabase-server'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'


export const dynamic = 'force-dynamic'

export default async function AdminVolunteersPage() {
    const { success, data, error } = await getVolunteerDeliveries()
    const supabase = await createClient()

    if (!success) {
        return (
            <div className="p-6 text-red-500">
                Error loading deliveries: {error}
                <br />
                Please ensure you are an admin.
            </div>
        )
    }

    // Check user role for debugging
    const { data: { user } } = await supabase.auth.getUser()
    let isUserAdmin = false
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile && (profile.role === 'admin' || profile.role === 'moderator')) {
            isUserAdmin = true
        }
    }



    return (
        <div className="flex flex-col gap-6 p-6">
            {!isUserAdmin && (
                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md border border-yellow-200">
                    <strong>Warning:</strong> Your account does not have 'admin' or 'moderator' role in the profiles table.
                    You may not see any data due to security policies.
                </div>
            )}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Volunteer Deliveries</h1>
                <p className="text-muted-foreground">Manage volunteer delivery requests and system status.</p>
            </div>

            <AdminVolunteerTable data={data || []} />
        </div >
    )
}
