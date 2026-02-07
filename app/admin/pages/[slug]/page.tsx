import { Separator } from "@/components/ui/separator"
import { getPage } from "../actions"
import { PageForm } from "./page-form"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function EditPagePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const page = await getPage(slug)

    if (!page) {
        notFound()
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/admin/pages">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <h3 className="text-lg font-medium">Edit Page: {page.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground ml-12">
                    Editing <code>/{page.slug}</code>
                </p>
            </div>
            <Separator />

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <PageForm slug={page.slug} initialData={page} />
            </div>
        </div>
    )
}
