import type { Metadata } from "next";
import { Inter, Cairo, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { UserLocationProvider } from "@/context/UserLocationContext";
import { createClient } from "@/lib/supabase-server";
import { siteConfig as staticSiteConfig } from "@/config/site";
import { getCachedCategories, getCachedSiteConfig, getCachedSystemSettings } from "@/lib/fetchers";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const geistSans = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(staticSiteConfig.url),
  title: {
    default: staticSiteConfig.name,
    template: `%s | ${staticSiteConfig.name}`,
  },
  description: staticSiteConfig.description,
  openGraph: {
    title: staticSiteConfig.name,
    description: staticSiteConfig.description,
    url: staticSiteConfig.url,
    siteName: staticSiteConfig.name,
    images: [
      {
        url: staticSiteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: staticSiteConfig.name,
      },
    ],
    locale: "ar_SA",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

//export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  // 1. Parallel Fetching of Independent Data & User
  const [
    categories,
    siteConfigMap,
    systemSettings,
    { data: { user } }
  ] = await Promise.all([
    getCachedCategories(),
    getCachedSiteConfig(),
    getCachedSystemSettings(),
    supabase.auth.getUser()
  ]);

  // 2. Conditional Fetching (Dependent on User)
  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('id, full_name, avatar_url, role, email, phone, created_at, points, volunteer_points, is_banned, show_avatar').eq('id', user.id).single();
    profile = data;
  }

  // 3. Process Data
  const siteConfig = siteConfigMap;

  const enableGamification = !!systemSettings?.find(s => s.key === 'feature_gamification')?.value;
  const enableVolunteer = !!systemSettings?.find(s => s.key === 'feature_volunteer_delivery')?.value;
  const enableVolunteerPoints = !!systemSettings?.find(s => s.key === 'enable_volunteer_points')?.value;

  const themeColor = siteConfig.theme_primary_color || 'oklch(0.6 0.15 180)';

  return (
    <html lang="ar" dir="rtl">
      <head>
        {siteConfig.theme_primary_color && (
          <style dangerouslySetInnerHTML={{
            __html: `
                :root {
                  --primary: ${themeColor};
                  --ring: ${themeColor};
                  --sidebar-primary: ${themeColor};
                }
              `
          }} />
        )}
      </head>
      <body
        className={`${cairo.variable} ${cairo.className} ${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <UserLocationProvider>
          <Navbar
            categories={(categories || []) as any}
            user={user}
            profile={profile}
            logoUrl={siteConfig.site_logo}
            enableGamification={enableGamification}
            enableVolunteer={enableVolunteer}
            enableVolunteerPoints={enableVolunteerPoints}
          />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
        </UserLocationProvider>
      </body>
    </html>
  );
}
