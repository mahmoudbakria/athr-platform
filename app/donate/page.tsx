import { getCachedCategories, getCachedSubCategories, getCachedSystemSettings } from '@/lib/fetchers'
import { ItemForm } from '@/components/items/ItemForm'

export const revalidate = 60

export default async function DonatePage() {
    // Fetch categories, sub-categories, and settings in parallel
    const [categories, subCategories, settings] = await Promise.all([
        getCachedCategories(),
        getCachedSubCategories(),
        getCachedSystemSettings()
    ])

    // Feature Flags
    const maintenance = settings.find(s => s.key === 'feature_maintenance')?.value || false


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto mb-8 text-center pt-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">تبرع بغرض</h1>
                <p className="text-muted-foreground text-lg">
                    يرجى تعبئة التفاصيل أدناه لإدراج غرضك. شكراً لك على كرمك!
                </p>
            </div>

            <ItemForm
                categories={categories}
                subCategories={subCategories as any}
                featureFlags={{ maintenance }}
            />
        </div>
    )
}
