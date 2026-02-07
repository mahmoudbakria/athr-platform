"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { HeartHandshake, Menu, Search, Heart, Truck } from 'lucide-react'
import { SearchBar } from "@/components/layout/SearchBar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Category, Profile } from "@/types"
import { cn } from "@/lib/utils"
import { UserNav } from "@/components/UserNav";
import { siteConfig } from "@/config/site";


interface HeaderProps {
  categories: Category[]
  user: any
  profile: Profile | null
  logoUrl?: string
  enableGamification?: boolean
  enableVolunteer?: boolean
  enableVolunteerPoints?: boolean
}

export function Navbar({ categories, user, profile, logoUrl, enableGamification, enableVolunteer, enableVolunteerPoints }: HeaderProps) {
  const pathname = usePathname()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setIsOpen(false)
    setActiveCategoryId(null)
  }, [pathname])

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Find active category to show subs
  const activeCategory = activeCategoryId ? categories.find(c => c.id === activeCategoryId) : null;

  return (
    <header className="flex flex-col w-full z-50 sticky top-0" onMouseLeave={() => setActiveCategoryId(null)}>
      {/* Row 1: Utility Bar (Light) */}
      <div className="bg-white/90 backdrop-blur-md text-slate-800 h-20 md:h-[100px] flex items-center shadow-sm z-20 relative border-b border-slate-100">
        <div className="container mx-auto px-4 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-90 shrink-0">
            {logoUrl ? (
              <div className="relative h-14 w-14 md:h-[80px] md:w-[80px]">
                <Image
                  src={logoUrl}
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            ) : (
              <>
                <HeartHandshake className="h-6 w-6 text-emerald-600" />
                <span className="hidden sm:inline-block tracking-tight">{siteConfig.name}</span>
                <span className="sm:hidden">{siteConfig.name}</span>
              </>
            )}
          </Link>

          {/* Search Bar (Central) */}
          <SearchBar className="flex-1 max-w-xl mx-auto hidden md:block" />

          {/* Right Icons */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Mobile Search Trigger */}
            <Button variant="ghost" size="icon" className="md:hidden text-slate-600 hover:bg-slate-100" onClick={() => setIsSearchOpen(!isSearchOpen)}>
              <Search className="h-5 w-5" />
            </Button>

            <Button asChild variant="ghost" size="icon" className="md:hidden text-slate-600 hover:bg-slate-100 hover:text-emerald-600">
              <Link href="/volunteer/create">
                <Truck className="h-6 w-6" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="hidden md:flex gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
              <Link href="/volunteer/create">
                <Truck className="h-4 w-4" />
                <span>تبرع بالتوصيل</span>
              </Link>
            </Button>

            {/* User Profile / Auth */}
            {user ? (
              <UserNav user={user} profile={profile} enableGamification={enableGamification} enableVolunteer={enableVolunteer} enableVolunteerPoints={enableVolunteerPoints} />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">تسجيل دخول</Link>
                <span className="text-slate-300">|</span>
                <Link href="/auth/register" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">تسجيل</Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-600 hover:bg-slate-100">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader className="text-right mb-6">
                  <SheetTitle className="flex items-center gap-2">
                    <HeartHandshake className="h-6 w-6 text-emerald-600" />
                    {siteConfig.name}
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4">
                  <Link href="/" className="text-lg font-medium text-right">الرئيسية</Link>
                  <Link href="/donate" className="text-lg font-medium text-emerald-600 text-right">تبرع بغرض</Link>
                  <div className="border-t my-2" />
                  <span className="text-sm font-semibold text-muted-foreground mb-2 text-right">التصنيفات</span>
                  <div className="flex flex-col gap-1 pr-2">
                    <Accordion type="single" collapsible className="w-full">
                      {categories.map(cat => {
                        const hasSubs = (cat as any).sub_categories && (cat as any).sub_categories.length > 0;

                        if (!hasSubs) {
                          return (
                            <Link key={cat.id} href={`/listings?category=${cat.slug}`} className="block py-3 text-base font-medium text-slate-700 hover:text-emerald-600 text-right border-b last:border-0 border-slate-100">
                              {cat.name}
                            </Link>
                          )
                        }

                        return (
                          <AccordionItem key={cat.id} value={cat.id} className="border-b border-slate-100 last:border-0">
                            <AccordionTrigger className="text-base font-medium text-slate-700 hover:text-emerald-600 py-3 text-right justify-between">
                              {cat.name}
                            </AccordionTrigger>
                            <AccordionContent className="flex flex-col gap-3 pr-4 pb-4">
                              <Link href={`/listings?category=${cat.slug}`} className="text-sm font-semibold text-emerald-600 text-right block">
                                عرض الكل
                              </Link>
                              {(cat as any).sub_categories.map((sub: any) => (
                                <Link
                                  key={sub.id}
                                  href={`/listings?category=${cat.slug}&sub=${sub.id}`}
                                  className="text-sm text-slate-600 text-right hover:text-emerald-600 block"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </AccordionContent>
                          </AccordionItem>
                        )
                      })}
                    </Accordion>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Row 2: Navigation Bar (White/Light Gray) */}
      <div className="bg-white border-b border-slate-200 text-slate-700 h-12 flex items-center shadow-sm z-10 relative">
        <div className="container mx-auto px-4 flex items-center h-full">

          {/* All Category Dropdown (Desktop) */}
          <div className="hidden md:flex items-center h-full border-l border-slate-100 pl-4 ml-4 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-emerald-600 transition-colors outline-none">
                <Menu className="h-4 w-4" />
                جميع التصنيفات
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-white text-slate-800 border-slate-200 shadow-lg" align="start">
                <Link href="/listings" className="block px-2 py-2 text-sm hover:bg-slate-50 hover:text-emerald-600 rounded transition-colors mb-1 font-semibold">
                  عرض جميع الأغراض
                </Link>
                {categories.map(cat => {
                  const imageUrl = cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('/')) ? cat.icon : null;

                  return (
                    <DropdownMenuItem key={cat.id} asChild className="focus:bg-slate-50 focus:text-emerald-600 cursor-pointer p-2">
                      <Link href={`/listings?category=${cat.slug}`} className="flex items-center gap-3">
                        <div className="relative h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                          {imageUrl ? (
                            <Image src={imageUrl} alt={cat.name} fill className="object-cover" />
                          ) : (
                            <span className="text-sm">{cat.icon || "📦"}</span>
                          )}
                        </div>
                        <span className="font-medium">{cat.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Dynamic Horizontal Scroll List */}
          <div className="flex-1 overflow-x-auto no-scrollbar h-full flex items-center md:mask-image-linear-to-r">
            <div className="flex items-center gap-6 md:gap-8 whitespace-nowrap px-2 h-full">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="h-full flex items-center"
                  onMouseEnter={() => setActiveCategoryId(category.id)}
                >
                  <Link
                    href={`/listings?category=${category.slug}`}
                    className={cn(
                      "text-sm font-medium transition-colors border-b-2 border-transparent hover:border-emerald-500 py-1",
                      activeCategoryId === category.id ? "text-emerald-600 border-emerald-500 font-semibold" : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {category.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Row 3: Sub-Category Overlay (Hover Interaction) */}
      {(activeCategoryId && activeCategory && (activeCategory as any).sub_categories?.length > 0) && (
        <div
          className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xl z-0 animate-in fade-in slide-in-from-top-1 duration-200"
          onMouseEnter={() => setActiveCategoryId(activeCategory.id)}
          onMouseLeave={() => setActiveCategoryId(null)}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <span className="text-sm font-semibold text-slate-400 self-center uppercase tracking-wide text-xs mr-4 border-r border-slate-200 pr-4 h-full flex items-center">
                {activeCategory.name}
              </span>
              {(activeCategory as any).sub_categories.map((sub: any) => (
                <Link
                  key={sub.id}
                  href={`/listings?category=${activeCategory.slug}&sub=${sub.id}`}
                  className="text-sm text-slate-600 hover:text-emerald-600 hover:underline decoration-emerald-500/50 underline-offset-4 transition-colors font-medium"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white p-4 border-b border-slate-200 shadow-lg z-10 animate-in slide-in-from-top-2">
          <SearchBar />
        </div>
      )}
    </header>
  )
}
