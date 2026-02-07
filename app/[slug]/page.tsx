import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase-server"
import { Metadata } from "next"

// Revalidate every hour by default, or rely on on-demand revalidation from admin action
export const revalidate = 3600

interface PageProps {
    params: Promise<{ slug: string }>
}

async function getPageContent(slug: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .single()
    return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const page = await getPageContent(slug)
    if (!page) return { title: 'Not Found' }

    return {
        title: `${page.title} | Bridge of Good`,
    }
}

export default async function DynamicPage({ params }: PageProps) {
    const { slug } = await params
    const page = await getPageContent(slug)

    if (!page) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900 border-b pb-4">
                {page.title}
            </h1>

            <div
                className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-emerald-600 prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: page.content || '' }}
            />
        </div>
    )
}
