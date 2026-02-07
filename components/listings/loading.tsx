export default function ListingsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 1. هيكل العنوان والفلتر (Header Skeleton) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded-lg" />
          <div className="h-4 w-64 bg-gray-100 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-200 rounded-lg" />
          <div className="h-10 w-24 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* 2. شبكة العناصر الوهمية (Items Grid Skeleton) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* نكرر الهيكل 8 مرات عشان نعبي الشاشة */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i} 
            className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm flex flex-col"
          >
            {/* مكان الصورة */}
            <div className="aspect-[4/3] w-full bg-gray-200 animate-pulse relative">
               <div className="absolute top-3 right-3 h-6 w-16 bg-white/50 rounded-full" />
            </div>

            {/* تفاصيل العنصر */}
            <div className="p-4 space-y-3 flex-1">
              <div className="flex justify-between items-center">
                <div className="h-3 w-20 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 rounded-full animate-pulse" />
              </div>
              
              <div className="h-6 w-3/4 bg-gray-200 rounded-lg animate-pulse" />
              
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            
            {/* زر وهمي في الأسفل */}
            <div className="p-4 border-t border-gray-50">
               <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}