'use client';

import { Category, SubCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ListingsSidebarProps {
    categories: Category[];
    subCategories: SubCategory[];
    conditions: string[];
    cities: string[];
    filters: {
        category_id: string | null;
        sub_category_id: number | null;
        condition: string[];
        city: string[];
        delivery_available: boolean;
        needs_repair: boolean;
        search?: string;
    };
    onFilterChange: (key: string, value: any) => void;
}

export function ListingsSidebar({
    categories,
    subCategories,
    conditions,
    cities,
    filters,
    onFilterChange
}: ListingsSidebarProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const filteredSubCategories = filters.category_id
        ? subCategories.filter(sub => sub.category_id === filters.category_id)
        : [];

    const handleConditionChange = (checked: boolean, cond: string) => {
        const newConditions = checked
            ? [...filters.condition, cond]
            : filters.condition.filter(c => c !== cond);
        onFilterChange('condition', newConditions);
    };

    const handleCityChange = (checked: boolean, city: string) => {
        const newCities = checked
            ? [...filters.city, city]
            : filters.city.filter(c => c !== city);
        onFilterChange('city', newCities);
    };

    const clearAll = () => {
        onFilterChange('category_id', null);
        onFilterChange('sub_category_id', null);
        onFilterChange('condition', []);
        onFilterChange('city', []);
        onFilterChange('delivery_available', false);
        onFilterChange('needs_repair', false);
    };

    const hasActiveFilters = filters.category_id || filters.condition.length > 0 || filters.city.length > 0 || filters.delivery_available || filters.needs_repair;

    const FilterContent = () => (
        <div className="space-y-8 text-right" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">الفلاتر</h3>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="text-muted-foreground hover:text-destructive h-auto p-0 text-xs"
                    >
                        مسح الكل
                    </Button>
                )}
            </div>

            {/* Categories */}
            <div className="space-y-4">
                <h4 className="font-medium text-sm text-foreground/80">التصنيف</h4>
                <RadioGroup
                    dir="rtl"
                    value={filters.category_id || 'all'}
                    onValueChange={(val) => onFilterChange('category_id', val === 'all' ? null : val)}
                    className="gap-2"
                >
                    <div className="flex items-center gap-2 mb-2 w-full justify-start">
                        <RadioGroupItem value="all" id="cat-all" />
                        <Label htmlFor="cat-all" className="cursor-pointer font-normal">جميع التصنيفات</Label>
                    </div>
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center gap-2 mb-2 w-full justify-start">
                            <RadioGroupItem value={cat.id} id={`cat-${cat.id}`} />
                            <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer font-normal flex items-center gap-2">
                                <span>{cat.name}</span>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {/* Sub Categories */}
            {filteredSubCategories.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <h4 className="font-medium text-sm text-foreground/80">التصنيف الفرعي</h4>
                    <div className="space-y-2 pr-4 border-r border-border/50">
                        <div className="flex items-center gap-2 mb-2 w-full justify-start">
                            <Checkbox
                                id="sub-all"
                                checked={filters.sub_category_id === null}
                                onCheckedChange={() => onFilterChange('sub_category_id', null)}
                            />
                            <Label htmlFor="sub-all" className="font-normal cursor-pointer">الكل</Label>
                        </div>
                        {filteredSubCategories.map((sub) => (
                            <div key={sub.id} className="flex items-center gap-2 mb-2 w-full justify-start">
                                <Checkbox
                                    id={`sub-${sub.id}`}
                                    checked={filters.sub_category_id === sub.id}
                                    onCheckedChange={(checked) => onFilterChange('sub_category_id', checked ? sub.id : null)}
                                />
                                <Label htmlFor={`sub-${sub.id}`} className="font-normal cursor-pointer">{sub.name}</Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Condition */}
            {conditions.length > 0 && (
                <div className="space-y-4">
                    <h4 className="font-medium text-sm text-foreground/80">الحالة</h4>
                    <div className="space-y-2">
                        {conditions.map((cond) => (
                            <div key={cond} className="flex items-center gap-2 w-full justify-start">
                                <Checkbox
                                    id={`cond-${cond}`}
                                    checked={filters.condition.includes(cond)}
                                    onCheckedChange={(checked) => handleConditionChange(checked as boolean, cond)}
                                />
                                <Label htmlFor={`cond-${cond}`} className="font-normal cursor-pointer capitalize">
                                    {cond === 'new' ? 'جديد' :
                                        cond === 'like_new' ? 'بحالة ممتازة' :
                                            cond === 'used' ? 'مستعمل' : cond}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* City */}
            {cities.length > 0 && (
                <div className="space-y-4">
                    <h4 className="font-medium text-sm text-foreground/80">المدينة</h4>
                    <ScrollArea className="h-[140px]">
                        <div className="space-y-2">
                            {cities.map((city) => (
                                <div key={city} className="flex items-center gap-2 w-full justify-start">
                                    <Checkbox
                                        id={`city-${city}`}
                                        checked={filters.city.includes(city)}
                                        onCheckedChange={(checked) => handleCityChange(checked as boolean, city)}
                                    />
                                    <Label htmlFor={`city-${city}`} className="font-normal cursor-pointer">{city}</Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* Delivery */}
            <div className="space-y-4">
                <h4 className="font-medium text-sm text-foreground/80">خيارات</h4>
                <div className="flex items-center gap-2 w-full justify-start">
                    <Checkbox
                        id="delivery"
                        checked={filters.delivery_available}
                        onCheckedChange={(checked) => onFilterChange('delivery_available', checked as boolean)}
                    />
                    <Label htmlFor="delivery" className="font-normal cursor-pointer">التوصيل متاح</Label>
                </div>
                <div className="flex items-center gap-2 w-full justify-start">
                    <Checkbox
                        id="repair"
                        checked={filters.needs_repair}
                        onCheckedChange={(checked) => onFilterChange('needs_repair', checked as boolean)}
                    />
                    <Label htmlFor="repair" className="font-normal cursor-pointer">يحتاج إصلاح</Label>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-full space-y-8 sticky top-24 self-start text-right" dir="rtl">
                <FilterContent />
            </div>

            {/* Mobile Filter Button */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden w-full gap-2 relative">
                        <Filter className="w-4 h-4" />
                        الفلاتر
                        {hasActiveFilters && (
                            <span className="absolute right-4 w-2 h-2 bg-primary rounded-full" />
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="text-right">الفلاتر</SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 text-right" dir="rtl">
                        <FilterContent />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
