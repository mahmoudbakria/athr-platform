'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown, ShoppingBag, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Category {
    id: string;
    name: string | null;
    slug: string | null;
    sub_categories?: SubCategory[];
}

interface SubCategory {
    id: string;
    name: string | null;
    slug: string | null;
}

interface NavMenuProps {
    categories: Category[];
}

export function NavMenu({ categories }: NavMenuProps) {
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const pathname = usePathname();

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5',
                isScrolled
                    ? 'bg-background/80 backdrop-blur-md shadow-sm py-3'
                    : 'bg-transparent py-5'
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        Antigravity
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link
                        href="/"
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary",
                            pathname === "/" ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        Home
                    </Link>

                    {/* Mega Menu Trigger */}
                    <div className="group relative">
                        <button className={cn(
                            "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary py-2",
                            "text-muted-foreground"
                        )}>
                            Categories
                            <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
                        </button>

                        {/* Mega Menu Content */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[600px] w-screen max-w-3xl">
                            <div className="bg-popover/95 backdrop-blur-xl border rounded-2xl shadow-xl p-6 grid grid-cols-3 gap-6">
                                {categories.slice(0, 6).map((category) => (
                                    <div key={category.id} className="space-y-3">
                                        <Link
                                            href={`/category/${category.slug}`}
                                            className="block font-semibold text-foreground hover:text-primary transition-colors"
                                        >
                                            {category.name}
                                        </Link>
                                        <ul className="space-y-2">
                                            {category.sub_categories?.slice(0, 4).map((sub) => (
                                                <li key={sub.id}>
                                                    <Link
                                                        href={`/category/${category.slug}/${sub.slug}`}
                                                        className="text-sm text-muted-foreground hover:text-primary transition-colors block"
                                                    >
                                                        {sub.name}
                                                    </Link>
                                                </li>
                                            ))}
                                            {(category.sub_categories?.length || 0) > 4 && (
                                                <li>
                                                    <Link
                                                        href={`/category/${category.slug}`}
                                                        className="text-xs font-medium text-primary hover:underline"
                                                    >
                                                        View all
                                                    </Link>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        About
                    </Link>
                    <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Contact
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                        <Search className="w-5 h-5 text-muted-foreground" />
                    </Button>

                    {/* Mobile Menu Toggle */}
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>

                    <Button className="hidden md:flex rounded-full shadow-lg hover:shadow-primary/25 transition-all" asChild>
                        <Link href="/donate">
                            Donate Now
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-background border-b p-4 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-5">
                    <Link href="/" className="text-sm font-medium p-2 hover:bg-muted rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                        Home
                    </Link>
                    <div className="space-y-2 p-2">
                        <p className="text-sm font-semibold text-muted-foreground mb-2">Categories</p>
                        {categories.slice(0, 4).map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/listings?category=${cat.slug}`}
                                className="block text-sm pl-4 py-1 text-foreground/80"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                    <Link href="/about" className="text-sm font-medium p-2 hover:bg-muted rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                        About
                    </Link>
                    <Button className="w-full mt-2" asChild>
                        <Link href="/donate" onClick={() => setIsMobileMenuOpen(false)}>
                            Donate Now
                        </Link>
                    </Button>
                </div>
            )}
        </header>
    );
}
