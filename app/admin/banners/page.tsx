import { Separator } from "@/components/ui/separator"
import { getSiteConfig } from "../cms/actions"
import { BannersForm } from "./banners-form"

export default async function BannersAdminPage() {
    const config = await getSiteConfig()

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Homepage Banners</h3>
                <p className="text-sm text-muted-foreground">
                    Control promotional and motivational banners on the homepage.
                </p>
            </div>
            <Separator />
            <BannersForm initialValues={config} />
        </div>
    )
}
