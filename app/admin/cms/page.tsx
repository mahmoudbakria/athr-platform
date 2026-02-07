import { getSiteConfig } from "./actions"
import { CMSForm } from "./cms-form"

export const dynamic = 'force-dynamic'

export default async function CMSPage() {
    const config = await getSiteConfig()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
                <p className="text-muted-foreground">
                    Customize the look and feel of your platform.
                </p>
            </div>

            <CMSForm initialValues={config} />
        </div>
    )
}
