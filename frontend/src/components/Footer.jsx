import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 pt-12 pb-6 border-t border-slate-800 text-right" dir="rtl">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        
        {/* العمود الأول: عن المكتبة */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <img src="/images/main-logo.png" alt="Bookly" className="h-8 bg-white p-1 rounded-md" />
            <span className="text-xl font-bold text-white">المكتبة الرقمية</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            منصتك الحديثة لاستكشاف واستعارة الكتب والمراجع العلمية بسهولة، نعمل على توفير المعرفة في مكان واحد.
          </p>
        </div>

        {/* العمود الثاني: روابط سريعة */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-base border-b border-slate-700 pb-2 inline-block">روابط سريعة</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/#" className="hover:text-amber-500 transition">الرئيسية</a>
            </li>
            <li>
              <a href="/#books-section" className="hover:text-amber-500 transition">قائمة الكتب</a>
            </li>
            <li>
              <a href="/#categories-section" className="hover:text-amber-500 transition">الأقسام</a>
            </li>
            <li>
              <Link to="/admin" className="hover:text-amber-500 transition">لوحة التحكم</Link>
            </li>
          </ul>
        </div>

        {/* العمود الثالث: مواعيد العمل */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-base border-b border-slate-700 pb-2 inline-block">ساعات العمل</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>الأحد - الخميس: 8:00 صباحاً - 4:00 مساءً</li>
            <li>الجمعة - السبت: مغلق</li>
            <li>خدمات الاستعارة الرقمية مجهزة 24/7</li>
          </ul>
        </div>

        {/* العمود الرابع: وسائل المساعدة والشركاء */}
        <div className="space-y-3">
          <h4 className="text-white font-bold text-base border-b border-slate-700 pb-2 inline-block">وسائل المساعدة</h4>
          <p className="text-sm text-gray-400">يمكنك التواصل مع إدارة المكتبة لأي استفسارات حول الإعارة.</p>
          <div className="flex gap-3 pt-2">
            <img src="/images/paypal.jpg" alt="Paypal" className="h-6 rounded bg-white p-0.5" />
            <img src="/images/mastercard.jpg" alt="Mastercard" className="h-6 rounded bg-white p-0.5" />
            <img src="/images/dhl.png" alt="DHL" className="h-6 rounded bg-white p-0.5" />
          </div>
        </div>

      </div>

      {/* حقوق الملكية */}
      <div className="border-t border-slate-800 pt-6 text-center text-xs text-gray-500">
        © 2026 جميع الحقوق محفوظة - نظام إدارة المكتبة (Library Management System).
      </div>
    </footer>
  );
}