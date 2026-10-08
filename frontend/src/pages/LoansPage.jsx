import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function LoansPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // حالات الترقيم (Pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8; // عدد الإعارات المعروضة في كل صفحة

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/loans');
      const data = response.data?.data || response.data || [];
      setLoans(data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError('غير مصرح لك بمشاهدة سجل الإعارات. يرجى تسجيل الدخول أولاً.');
      } else {
        setError('حدث خطأ أثناء جلب سجل الإعارات.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  // إعادة الترقيم إلى الصفحة الأولى عند تحديث البيانات
  useEffect(() => {
    setCurrentPage(1);
  }, [loans.length]);

  const handleReturnBook = async (loanId) => {
    if (!window.confirm('هل أنت متأكد من تأكيد إرجاع هذا الكتاب؟')) return;
    try {
      await api.post(`/loans/return/${loanId}`);
      fetchLoans();
    } catch (err) {
      alert(err.response?.data?.message || 'تعذر إرجاع الكتاب. يرجى المحاولة مرة أخرى.');
    }
  };

  // اقتطاع بيانات الصفحة الحالية
  const safeLoans = Array.isArray(loans) ? loans : [];
  const totalPages = Math.ceil(safeLoans.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLoans = safeLoans.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة الإعارات</h2>
          <p className="text-gray-500 text-sm mt-1">متابعة عمليات استعارة واسترجاع الكتب</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded-xl shadow-sm text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white p-8 text-center text-gray-500 rounded-xl shadow-sm border border-gray-100">
          جاري التحميل...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center text-xs font-semibold text-gray-500">
            <span>سجل عمليات الإعارة</span>
            <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg">
              الإجمالي: {safeLoans.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-gray-100 text-gray-500 text-sm">
                  <th className="p-4 font-semibold">رقم الإعارة</th>
                  <th className="p-4 font-semibold">الكتاب</th>
                  <th className="p-4 font-semibold">المستعير</th>
                  <th className="p-4 font-semibold">تاريخ الإعارة</th>
                  <th className="p-4 font-semibold">تاريخ الاستحقاق</th>
                  <th className="p-4 font-semibold text-center">الحالة / الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedLoans.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400 font-medium">
                      لا توجد عمليات إعارة حالياً.
                    </td>
                  </tr>
                ) : (
                  paginatedLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-gray-400 font-mono">#{loan.id}</td>
                      <td className="p-4 font-bold text-gray-800">{loan.bookTitle || `كتاب #${loan.bookId}`}</td>
                      <td className="p-4 text-gray-600">{loan.memberName || `عضو #${loan.memberId}`}</td>
                      <td className="p-4 text-gray-600">
                        {loan.loanDate ? new Date(loan.loanDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                      </td>
                      <td className="p-4 text-gray-600">
                        {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                      </td>
                      <td className="p-4 text-center">
                        {loan.isReturned || loan.returnDate ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 inline-block w-24">
                            تم الإرجاع
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleReturnBook(loan.id)}
                            className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer w-24"
                          >
                            تأكيد الإرجاع
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* عناصر التنقل بين الصفحات (Pagination Controls) */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-slate-50/50 text-xs">
              <span className="text-gray-500">
                عرض {startIndex + 1} - {Math.min(startIndex + pageSize, safeLoans.length)} من أصل {safeLoans.length}
              </span>

              <div className="flex items-center gap-1.5 dir-ltr">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white font-medium text-gray-600 hover:bg-amber-50 hover:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  السابق
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-bold transition cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white font-medium text-gray-600 hover:bg-amber-50 hover:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}