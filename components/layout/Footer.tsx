import Link from 'next/link';
import NextImage from 'next/image';
import { Facebook, Instagram, Twitter, Heart } from 'lucide-react';
import { getSiteConfig } from '@/app/admin/cms/actions';
import { siteConfig } from '@/config/site';

export async function Footer() {
    const config = await getSiteConfig();

    return (
        <footer className="bg-muted/30 border-t mt-auto">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-4 items-start">
                            {config.footer_logo ? (
                                <div className="relative h-14 w-14 md:h-[80px] md:w-[80px]">
                                    <NextImage
                                        src={config.footer_logo}
                                        alt="Logo"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 p-2 rounded-lg">
                                        <Heart className="w-5 h-5 text-primary" fill="currentColor" />
                                    </div>
                                    <span className="text-xl font-bold">{siteConfig.name}</span>
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {config.footer_description || 'ارفع العبء، شارك الثقل. توفير متجر كريم لمن هم في أمس الحاجة إليه.'}
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div>
                        <h3 className="font-semibold mb-4">{config.footer_col1_title || 'المنصة'}</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {(config.footer_col1_links || 'من نحن|/about\nاتصل بنا|/contact').split('\n').map((line, i) => {
                                const [label, url] = line.split('|');
                                if (!label || !url) return null;
                                return (
                                    <li key={i}>
                                        <Link href={url.trim()} className="hover:text-primary transition-colors">
                                            {label.trim()}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h3 className="font-semibold mb-4">{config.footer_col2_title || 'قانوني'}</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {(config.footer_col2_links || 'سياسة الخصوصية|/privacy\nالشروط والأحكام|/terms').split('\n').map((line, i) => {
                                const [label, url] = line.split('|');
                                if (!label || !url) return null;
                                return (
                                    <li key={i}>
                                        <Link href={url.trim()} className="hover:text-primary transition-colors">
                                            {label.trim()}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="font-semibold mb-4">تواصل معنا</h3>
                        <div className="flex gap-4">
                            {config.social_facebook && config.social_facebook_active === 'true' && (
                                <Link href={config.social_facebook} target="_blank" className="p-2 bg-background hover:bg-primary/10 rounded-full transition-colors text-muted-foreground hover:text-primary">
                                    <Facebook className="w-5 h-5" />
                                </Link>
                            )}
                            {config.social_twitter && config.social_twitter_active === 'true' && (
                                <Link href={config.social_twitter} target="_blank" className="p-2 bg-background hover:bg-primary/10 rounded-full transition-colors text-muted-foreground hover:text-primary">
                                    <Twitter className="w-5 h-5" />
                                </Link>
                            )}
                            {config.social_instagram && config.social_instagram_active === 'true' && (
                                <Link href={config.social_instagram} target="_blank" className="p-2 bg-background hover:bg-primary/10 rounded-full transition-colors text-muted-foreground hover:text-primary">
                                    <Instagram className="w-5 h-5" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} {config.footer_copyright || `${siteConfig.name}. جميع الحقوق محفوظة.`}</p>
                </div>
            </div>
        </footer>
    );
}
