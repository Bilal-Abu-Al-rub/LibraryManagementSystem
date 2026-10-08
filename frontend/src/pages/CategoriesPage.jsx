import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');

  // حالات الترقيم (Pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8; // عدد التصنيفات المعروضة في كل صفحة

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories').catch(() => ({ data: [] }));
      const catsData = res.data?.data || res.data?.items || res.data || [];
      setCategories(Array.isArray(catsData) ? catsData : []);
    } catch (err) {
      console.error('خطأ في جلب الأقسام:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // إعادة ضبط الصفحة إلى الأولى عند تغيير إجمالي عدد التصنيفات
  useEffect(() => {
    setCurrentPage(1);
  }, [categories.length]);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name || '');
    } else {
      setEditingCategory(null);
      setName('');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, { name });
      } else {
        await api.post('/categories', { name });
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      console.error('خطأ في حفظ القسم:', err);
      alert('حدث خطأ أثناء حفظ القسم');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت تأكد من حذف هذا القسم؟')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error('خطأ في حذف القسم:', err);
      alert('تعذر حذف القسم، قد تكون هناك كتب مرتبطة به');
    }
  };

  // حساب أرقام الصفحات واقتطاع العناصر
  const safeCategories = Array.isArray(categories) ? categories : [];
  const totalPages = Math.ceil(safeCategories.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCategories = safeCategories.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6 text-right dir-rtl" dir="rtl">
      {/* الرأس */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">إدارة تصنيفات الكتب</h2>
          <p className="text-xs text-slate-500 mt-1">إضافة وتعديل التصنيفات لربط الكتب بها</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <span>🏷</span>
          <span>إضافة تصنيف جديد</span>
        </button>
      </div>

      {/* الجدول والترقيم */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center text-xs font-semibold text-gray-500">
          <span>قائمة الأقسام والتصنيفات</span>
          <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg">
            الإجمالي: {safeCategories.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="p-4">#</th>
                <th className="p-4">اسم التصنيف</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center p-8 text-slate-400">جاري التحميل...</td>
                </tr>
              ) : paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center p-8 text-slate-400">لا توجد تصنيفات مسجلة.</td>
                </tr>
              ) : (
                paginatedCategories.map((cat, idx) => (
                  <tr key={cat.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-slate-400 font-mono text-xs">{startIndex + idx + 1}</td>
                    <td className="p-4 font-bold text-slate-800">
                      <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs border border-amber-100 ml-2">
                        🏷
                      </span>
                      {cat.name}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          تعديل ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          حذف 🗑
                        </button>
                      </div>
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
              عرض {startIndex + 1} - {Math.min(startIndex + pageSize, safeCategories.length)} من أصل {safeCategories.length}
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

      {/* Modal النافذة المنبثقة */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم التصنيف</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-amber-600"
                  placeholder="مثل: روايات، تكنولوجيا، تاريخ..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl text-sm font-medium cursor-pointer"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}