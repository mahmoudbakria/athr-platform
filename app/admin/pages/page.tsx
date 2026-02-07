import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { getPages } from "./actions"
import { Edit, FileText } from "lucide-react"

export default async function PagesAdminPage() {
    const pages = await getPages()

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Static Pages</h3>
                <p className="text-sm text-muted-foreground">
                    Manage the content of your static pages (About, Terms, etc.)
                </p>
            </div>
            <Separator />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pages.map((page: any) => (
                    <Card key={page.slug} className="hover:bg-slate-50 transition-colors">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                {page.title}
                            </CardTitle>
                            <CardDescription className="text-xs font-mono">
                                /{page.slug}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="flex justify-end">
                                <Link href={`/admin/pages/${page.slug}`}>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Edit className="w-4 h-4" />
                                        Edit Content
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
