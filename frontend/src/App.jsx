import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { BooksPage } from './pages/BooksPage';
import { BorrowersPage } from './pages/BorrowersPage';
import { LoansPage } from './pages/LoansPage';
import { PublicPortal } from './pages/PublicPortal';
import { LoginPage } from './pages/LoginPage';
import { api } from './services/api';
import { CategoriesPage } from './pages/CategoriesPage';

function AdminHome() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeLoans: 0,
    totalMembers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [booksRes, membersRes, loansRes] = await Promise.all([
          api.get('/books', { params: { pageSize: 1 } }).catch(() => ({ data: {} })),
          api.get('/members').catch(() => ({ data: [] })),
          api.get('/loans').catch(() => ({ data: [] })),
        ]);

        // استخراج إجمالي عدد الكتب الصحيح من response الـ API
        const booksObj = booksRes.data || {};
        const booksData = booksObj.items || booksObj.data || (Array.isArray(booksObj) ? booksObj : []);
        const totalBooksCount = booksObj.totalCount ?? booksObj.totalItems ?? booksData.length ?? 0;

        const membersData = membersRes.data?.data || membersRes.data || [];
        const loansData = loansRes.data?.data || loansRes.data || [];

        setStats({
          totalBooks: totalBooksCount,
          totalMembers: Array.isArray(membersData) ? membersData.length : 0,
          activeLoans: Array.isArray(loansData) 
            ? loansData.filter(l => !l.returnDate && !l.isReturned).length 
            : 0,
        });
      } catch (err) {
        console.error('خطأ في جلب الإحصائيات:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">نظرة عامة على المكتبة</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm">إجمالي الكتب</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {loading ? '...' : stats.totalBooks}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm">الإعارات النشطة</h3>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            {loading ? '...' : stats.activeLoans}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm">المستعيرون المسجلون</h3>
          <p className="text-3xl font-bold text-amber-600 mt-2">
            {loading ? '...' : stats.totalMembers}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* البوابة العامة للزوار */}
        <Route path="/" element={<PublicPortal />} />

        {/* صفحة تسجيل الدخول / إنشاء حساب */}
        <Route path="/login" element={<LoginPage />} />

        {/* لوحة التحكم الإدارية */}
        <Route path="/admin" element={<Layout />}>
          <Route index element={<AdminHome />} />
          <Route path="books" element={<BooksPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="borrowers" element={<BorrowersPage />} />
          <Route path="loans" element={<LoansPage />} />
        </Route>

        {/* إعادة توجيه المسارات المباشرة */}
        <Route path="/books" element={<Navigate to="/admin/books" replace />} />
        <Route path="/categories" element={<Navigate to="/admin/categories" replace />} />
        <Route path="/borrowers" element={<Navigate to="/admin/borrowers" replace />} />
        <Route path="/loans" element={<Navigate to="/admin/loans" replace />} />
      </Routes>
    </BrowserRouter>
  );
}