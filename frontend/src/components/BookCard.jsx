import React from 'react';

export default function BookCard({ book, onSelect, onBorrow }) {
  const coverImage = book.imageUrl || `/images/item-image${(book.id % 8) + 1}.jpg`;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between h-full text-right">
      <div className="flex flex-col">
        {/* صورة غلاف الكتاب */}
        <div className="relative bg-gray-50 rounded-xl overflow-hidden mb-4 h-56 flex items-center justify-center p-2 border border-gray-100">
          <img 
            src={coverImage} 
            alt={book.title} 
            className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = '/images/item-image1.jpg';
            }}
          />
          <span className="absolute top-3 right-3 text-xs bg-amber-600 text-white font-bold px-2.5 py-1 rounded-full shadow-md">
            {book.categoryName || 'عام'}
          </span>
        </div>

        {/* معلومات الكتاب */}
        <h3 className="text-base font-bold text-gray-800 line-clamp-1 mb-1">
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 mb-4">سنة النشر: {book.publishedYear || 'غير محدد'}</p>
      </div>

      {/* الشريط السفلي للبطاقة */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-gray-400">النسخ المتاحة</span>
          <span className={`text-xs font-bold ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {book.availableCopies > 0 ? `${book.availableCopies} نسخة` : 'غير متوفر'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => onSelect(book)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            التفاصيل
          </button>
          
          <button 
            onClick={() => onBorrow(book)}
            disabled={book.availableCopies <= 0}
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            استعارة
          </button>
        </div>
      </div>
    </div>
  );
}