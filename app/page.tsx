import { type Metadata } from 'next';
import {
  getCachedCategories,
  getCachedLatestItems,
  getCachedStats,
  getCachedCategoriesWithItems,
  getCachedSiteConfig,
  getCachedSystemSettings
} from '@/lib/fetchers';
import { Hero } from '@/components/home/Hero';
import { CategorySlider } from '@/components/home/CategorySlider';
import { LatestItems } from '@/components/home/LatestItems';
import { CategoryGroupedList } from '@/components/home/CategoryGroupedList';
import { Banner } from '@/components/home/Banner';
import { DualBanner } from '@/components/home/DualBanner';
import dynamic from 'next/dynamic';

const ImpactStrip = dynamic(() => import('@/components/home/ImpactStrip').then(m => m.ImpactStrip), {
  loading: () => <div className="h-[150px] bg-muted/20 animate-pulse rounded-xl my-8" />
});

export const revalidate = 60;

interface HomeProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await getCachedSiteConfig();

  const title = config.hero_title ? config.hero_title.replace(/<br\s*\/?>/gi, ' ') : 'Bridge of Good';
  const description = config.hero_description || 'Join our giving community.';
  const image = config.hero_image || '/og-image.jpg'; // Fallback image

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function Home({ searchParams }: HomeProps) {
  // Parallel data fetching to avoid waterfall
  const [
    allCategories,
    settings,
    config,
    latestItems,
    stats,
    nonEmptyCategories
  ] = await Promise.all([
    getCachedCategories(),
    getCachedSystemSettings(),
    getCachedSiteConfig(),
    getCachedLatestItems(),
    getCachedStats(),
    getCachedCategoriesWithItems()
  ]);

  // Process settings
  const maintenanceMode = settings?.find(s => s.key === 'feature_maintenance')?.value || false;
  const showVolunteer = settings?.find(s => s.key === 'feature_volunteer_delivery')?.value ?? true;

  // Process stats
  const { totalDonated, availableItems, newCondition, usedCondition } = stats;

  const categorySlug = typeof searchParams?.category === 'string' ? searchParams.category : undefined;
  const city = typeof searchParams?.city === 'string' ? searchParams.city : undefined;

  return (
    <div className="flex flex-col min-h-screen">
      <Hero />

      <CategorySlider categories={allCategories} />

      {/* DUAL BANNER */}
      <DualBanner showVolunteer={showVolunteer} />

      {/* TOP BANNER */}
      {config.banner_top_active === 'true' && (
        <Banner
          image={config.banner_top_image}
          link={config.banner_top_link}
          height={config.banner_top_height}
          alt="Top Promotion"
        />
      )}

      {(!categorySlug && !city) && (
        <LatestItems items={latestItems} showRepairBadge={maintenanceMode} />
      )}

      {/* MIDDLE BANNER */}
      {config.banner_middle_active === 'true' && (
        <Banner
          image={config.banner_middle_image}
          link={config.banner_middle_link}
          height={config.banner_middle_height}
          alt="Middle Promotion"
        />
      )}

      <ImpactStrip stats={{
        totalDonated: totalDonated || 0,
        availableItems: availableItems || 0,
        newCondition: newCondition || 0,
        usedCondition: usedCondition || 0
      }} />

      <CategoryGroupedList categories={nonEmptyCategories} showRepairBadge={maintenanceMode} />

      {/* BOTTOM BANNER */}
      {config.banner_bottom_active === 'true' && (
        <Banner
          image={config.banner_bottom_image}
          link={config.banner_bottom_link}
          height={config.banner_bottom_height}
          alt="Bottom Promotion"
        />
      )}
    </div>
  );
}
