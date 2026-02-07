
import { createClient } from '@/lib/supabase-server'
import { PointsForm } from '../settings/points-form'

export const dynamic = 'force-dynamic'

export default async function PointsPage() {
    const supabase = await createClient()

    // Fetch point values
    const { data: pointsData } = await supabase
        .from('point_values')
        .select('*')

    const pointValues = {
        upload_item: 0.5,
        donate_item: 1.0
    }

    if (pointsData) {
        pointsData.forEach((item: any) => {
            if (item.key === 'upload_item') pointValues.upload_item = item.value
            if (item.key === 'donate_item') pointValues.donate_item = item.value
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Points Configuration</h1>
                <p className="text-muted-foreground">
                    Manage the points awarded for various user actions.
                </p>
            </div>

            <div className="">
                <PointsForm initialValues={pointValues} />
            </div>
        </div>
    )
}
