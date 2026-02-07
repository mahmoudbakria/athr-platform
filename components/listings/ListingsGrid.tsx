import { Item } from '@/types';
import { ItemCard } from '@/components/items/ItemCard';

interface ListingsGridProps {
    items: Item[];
    isLoading?: boolean;
}

export function ListingsGrid({ items, isLoading = false }: ListingsGridProps) {
    if (isLoading) {
        return <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[300px] bg-muted/20 rounded-xl" />
            ))}
        </div>;
    }

    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-muted/10 rounded-3xl border border-dashed border-muted">
                <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">لا توجد أغراض متاحة حالياً</h3>
                <p className="text-muted-foreground max-w-sm">
                    حاول تعديل خيارات البحث أو الفلاتر، أو عد لاحقاً.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {items.map((item) => (
                <div key={item.id} className="h-full">
                    <ItemCard item={item} />
                </div>
            ))}
        </div>
    );
}
