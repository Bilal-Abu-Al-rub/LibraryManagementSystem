import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ searchTerm, setSearchTerm }) {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      user = null;
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* الشعار */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/images/main-logo.png" alt="Bookly Logo" className="h-8 object-contain" />
            <span className="text-xl font-bold text-amber-700">المكتبة الرقمية</span>
          </Link>
        </div>

        {/* روابط التنقل السريعة */}
        <nav className="hidden md:flex items-center gap-8 font-medium">
          <Link 
            to="/" 
            className="text-gray-700 hover:text-amber-600 transition px-2 py-1"
          >
            الرئيسية
          </Link>
          <a 
            href="#books-section" 
            className="text-gray-700 hover:text-amber-600 transition px-2 py-1"
          >
            الكتب المتاحة
          </a>
          <a 
            href="#categories-section" 
            className="text-gray-700 hover:text-amber-600 transition px-2 py-1"
          >
            الأقسام
          </a>
        </nav>

        {/* أزرار البحث والحساب */}
        <div className="flex items-center gap-3">
          {/* مربع البحث */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="ابحث عن كتاب باسمه..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-40 sm:w-56 border border-gray-300 rounded-xl pl-8 pr-4 py-1.5 text-xs focus:outline-none focus:border-amber-600 transition-all text-right"
            />
            <span className="absolute left-3 text-gray-400 text-xs">🔍</span>
          </div>

          {/* حالة التوثيق */}
          {token && user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-1.5 rounded-xl hidden sm:inline-block">
                👤 {user.email}
              </span>

              {user.role === 'Admin' && (
                <Link 
                  to="/admin" 
                  className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs font-medium transition shadow-sm"
                >
                  لوحة التحكم ⚙️
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer"
              >
                خروج
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm whitespace-nowrap"
            >
              تسجيل الدخول / حساب جديد
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}