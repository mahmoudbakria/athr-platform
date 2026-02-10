export type SiteConfig = typeof siteConfig

export const siteConfig = {
    name: process.env.NEXT_PUBLIC_SITE_NAME || "Athr",
    description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Charity Platform",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    ogImage: "/kheer_og_image.png",
    links: {
        twitter: "https://twitter.com/athr",
        github: "https://github.com/athr",
    },
}
