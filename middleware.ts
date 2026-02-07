import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set(name, value)
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    // Copy i18n headers if creating new response
                    // i18nResponse.headers.forEach((v, k) => response.headers.set(k, v));

                    response.cookies.set({
                        name,
                        value,
                        ...options,
                        secure: process.env.NODE_ENV === 'production',
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set(name, '')
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    // Copy i18n headers
                    // i18nResponse.headers.forEach((v, k) => response.headers.set(k, v));

                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                        secure: process.env.NODE_ENV === 'production',
                    })
                },
            },
        }
    )


    // Protect /admin routes
    if (request.nextUrl.pathname.includes('/admin')) {
        console.log("Middleware: Checking admin route", request.nextUrl.pathname)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            const url = new URL('/auth/login', request.url)
            url.searchParams.set('next', request.nextUrl.pathname)
            return NextResponse.redirect(url)
        }

        // Check user role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // Redirect /items to /listings
    if (request.nextUrl.pathname === '/items' || request.nextUrl.pathname === '/items/') {
        return NextResponse.redirect(new URL('/listings', request.url))
    }


    return response
}

export const config = {
    matcher: [
        // Match all pathnames except for
        // - … if they start with `/api`, `/_next` or `/_vercel`
        // - … the ones containing a dot (e.g. `favicon.ico`)
        '/((?!api|_next|_vercel|.*\\..*).*)',
    ],
}
