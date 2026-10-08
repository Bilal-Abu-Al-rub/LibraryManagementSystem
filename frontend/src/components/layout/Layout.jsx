import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsSearchOpen] = useState(false);

  // القائمة الجانبية للتنقل داخل الإدارة
  const navItems = [
    { path: '/admin', label: 'الرئيسية والإحصائيات', icon: '📊', exact: true },
    { path: '/admin/books', label: 'إدارة الكتب', icon: '📚' },
    { path: '/admin/categories', label: 'إدارة الأقسام', icon: '🏷️️' },
    { path: '/admin/borrowers', label: 'المستعيرون', icon: '👥' },
    { path: '/admin/loans', label: 'سجل الإعارات', icon: '📖' },
  ];

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-right" dir="rtl">
      
      {/* 1. الشريط الجانبي (Sidebar) */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 p-6 flex flex-col justify-between shadow-xl">
        <div>
          {/* الشعار */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img src="/images/main-logo.png" alt="Bookly Logo" className="h-8 bg-white p-1 rounded-lg" />
              <span className="text-lg font-bold text-white">لوحة الإدارة</span>
            </div>
            
            {/* زر الشاشات الصغيرة */}
            <button 
              onClick={() => setIsSearchOpen(!isMobileMenuOpen)} 
              className="md:hidden text-gray-400 hover:text-white text-xl"
            >
              ☰
            </button>
          </div>

          {/* روابط اللوحة */}
          <nav className={`space-y-1 ${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active 
                      ? 'bg-amber-600 text-white shadow-md' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* أسفل الشريط الجانبي: العودة للموقع العام */}
        <div className="pt-6 border-t border-slate-800 mt-6 md:mt-0">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-amber-600 text-white py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors duration-200"
          >
            <span>🌐</span>
            <span>العودة للبوابة العامة</span>
          </Link>
        </div>
      </aside>

      {/* 2. منطقة المحتوى الرئيسي (Main Content) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* الشريط العلوى للوحة Admin Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-lg font-bold text-slate-800">
            نظام إدارة المكتبة الشامل
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
              ● النظام متصل
            </span>
            <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow">
              م
            </div>
          </div>
        </header>

        {/* جسم الصفحة المنتقل إليها (Page Outlet) */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}