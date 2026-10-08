import React from 'react';

export default function CategorySection({ selectedCategory, onSelectCategory }) {
  const categories = [
    { 
      id: 'all', 
      name: 'الكل', 
      count: 'جميع الكتب', 
      icon: (
        <svg className="w-7 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      ) 
    },
    { 
      id: 'Technology', 
      name: 'تكنولوجيا وعلوم', 
      count: 'قسم التقنية', 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h6l-.75-1M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
        </svg>
      ) 
    },
    { 
      id: 'History', 
      name: 'تاريخ وحضارات', 
      count: 'التاريخ العربي والحديث', 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
        </svg>
      ) 
    },
    { 
      id: 'Literature', 
      name: 'روايات وأدب', 
      count: 'قصص وروايات', 
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
        </svg>
      ) 
    },
  ];

  return (
    <section className="py-10 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">أقسام المكتبة المميزة</h2>
            <p className="text-xs text-gray-500 mt-1">اضغط على القسم لفلترة الكتب المعروضة بالأسفل</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div 
                key={cat.id} 
                onClick={() => onSelectCategory(cat.id)}
                className={`group relative rounded-2xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between h-36 overflow-hidden border ${
                  isSelected 
                    ? 'bg-amber-50/50 border-amber-500 shadow-md text-amber-900' 
                    : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                {/* الأيقونة */}
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    isSelected 
                      ? 'bg-amber-600 text-white shadow-md' 
                      : 'bg-white text-amber-600 group-hover:bg-amber-600 group-hover:text-white shadow-sm border border-slate-100'
                  }`}>
                    {cat.icon}
                  </div>
                </div>

                {/* الاسم والوصف */}
                <div className="text-right">
                  <h3 className="font-bold text-base text-gray-800 group-hover:text-amber-700 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">
                    {cat.count}
                  </span>
                </div>

                {/* البوردر السفلي المتحرك مع الهوفر */}
                <span 
                  className={`absolute bottom-0 right-0 h-1 bg-amber-600 transition-all duration-300 rounded-b-2xl ${
                    isSelected ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}