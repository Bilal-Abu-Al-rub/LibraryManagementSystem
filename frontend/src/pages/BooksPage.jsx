import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function BooksPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // حالات الترقيم والبحث
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    categoryId: '',
    publishedYear: new Date().getFullYear(),
    availableCopies: 1,
    totalCopies: 1,
    description: '',
  });

  // دالة جلب الكتب
  const fetchBooks = async (page = pageNumber, size = pageSize, querySearch = search) => {
    try {
      setLoading(true);
      const res = await api.get('/books', {
        params: {
          pageNumber: page,
          pageSize: size,
          search: querySearch ? querySearch.trim() : undefined,
        },
      });

      const resData = res.data;

      let itemsList = [];
      if (Array.isArray(resData)) {
        itemsList = resData;
      } else if (resData?.items && Array.isArray(resData.items)) {
        itemsList = resData.items;
      } else if (resData?.data && Array.isArray(resData.data)) {
        itemsList = resData.data;
      }

      const total = resData?.totalCount ?? resData?.data?.totalCount ?? itemsList.length;
      const calcPages = resData?.totalPages ?? Math.max(1, Math.ceil(total / size));

      setBooks(itemsList);
      setTotalCount(total);
      setTotalPages(calcPages);
    } catch (err) {
      console.error('خطأ في جلب الكتب:', err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories').catch(() => ({ data: [] }));
      const catsData = res.data?.items || res.data?.data || res.data || [];
      setCategories(Array.isArray(catsData) ? catsData : []);
    } catch (err) {
      console.error('خطأ في جلب التصنيفات:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks(pageNumber, pageSize, search);
  }, [pageNumber, pageSize]);

  const handleNextPage = () => {
    if (pageNumber < totalPages && !loading) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageNumber > 1 && !loading) {
      setPageNumber((prev) => prev - 1);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPageNumber(1);
    fetchBooks(1, pageSize, val);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPageSize(newSize);
    setPageNumber(1);
  };

  const handleOpenModal = (book = null) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book.title || '',
        isbn: book.isbn || '',
        categoryId: book.categoryId || categories[0]?.id || '',
        publishedYear: book.publishedYear || new Date().getFullYear(),
        availableCopies: book.availableCopies ?? 1,
        totalCopies: book.totalCopies ?? 1,
        description: book.description || '',
      });
    } else {
      setEditingBook(null);
      setFormData({
        title: '',
        isbn: '',
        categoryId: categories[0]?.id || '',
        publishedYear: new Date().getFullYear(),
        availableCopies: 1,
        totalCopies: 1,
        description: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title.trim(),
        isbn: formData.isbn.trim(),
        categoryId: parseInt(formData.categoryId) || (categories[0]?.id || 1),
        publishedYear: parseInt(formData.publishedYear) || new Date().getFullYear(),
        totalCopies: parseInt(formData.totalCopies) || 1,
        availableCopies: parseInt(formData.availableCopies) ?? 1,
      };

      if (editingBook) {
        await api.put(`/books/${editingBook.id}`, payload);
      } else {
        await api.post('/books', payload);
      }
      setShowModal(false);
      fetchBooks(pageNumber, pageSize, search);
    } catch (err) {
      console.error('خطأ في حفظ الكتاب:', err);
      const errMsg = err.response?.data?.message || err.response?.data || 'حدث خطأ أثناء حفظ بيانات الكتاب';
      alert(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت تأكد من حذف هذا الكتاب؟')) return;
    try {
      await api.delete(`/books/${id}`);
      fetchBooks(pageNumber, pageSize, search);
    } catch (err) {
      console.error('خطأ في حذف الكتاب:', err);
      alert('عذراً، تعذر حذف الكتاب');
    }
  };

  return (
    <div className="space-y-6 text-right dir-rtl" dir="rtl">
      {/* رأس الصفحة مع البحث وزر الإضافة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">إدارة الكتب والمراجع</h2>
          <p className="text-xs text-slate-500 mt-1">
            إجمالي الكتب المسجلة: <span className="font-bold text-amber-600">{totalCount}</span> كتاب
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="بحث عن كتاب أو ISBN..."
            value={search}
            onChange={handleSearchChange}
            className="w-full sm:w-64 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-600"
          />

          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>➕</span>
            <span>إضافة كتاب جديد</span>
          </button>
        </div>
      </div>

      {/* جدول عرض الكتب */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="p-4">الكتاب</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4">رقم ISBN</th>
                <th className="p-4">سنة النشر</th>
                <th className="p-4">النسخ المتاحة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-slate-400">جاري تحميل البيانات...</td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-slate-400">لا توجد كتب مسجلة حالياً.</td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-medium text-slate-800 flex items-center gap-3">
                      <div className="w-10 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200">
                        <img 
                          src={`/images/item-image${(book.id % 8) + 1}.jpg`} 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/images/item-image1.jpg'; }}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{book.title}</div>
                        <div className="text-xs text-slate-400 line-clamp-1">{book.description || 'لا يوجد وصف'}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        {book.categoryName || 'عام'}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-600">{book.isbn || '-'}</td>
                    <td className="p-4 text-slate-600">{book.publishedYear}</td>
                    <td className="p-4">
                      <span className="text-emerald-600 font-bold">{book.availableCopies}</span>
                      <span className="text-slate-400 text-xs"> / {book.totalCopies || book.availableCopies}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(book)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          تعديل ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
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

        {/* شريط التحكم بالصفحات */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>عرض</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={120}>عرض الكل (120)</option>
            </select>
            <span>عنصر في الصفحة</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevPage}
              disabled={pageNumber <= 1 || loading}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              السابق
            </button>

            <span className="text-xs text-slate-600">
              صفحة <strong className="text-slate-800">{pageNumber}</strong> من <strong className="text-slate-800">{totalPages}</strong>
            </span>

            <button
              onClick={handleNextPage}
              disabled={pageNumber >= totalPages || loading}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              التالي
            </button>
          </div>
        </div>
      </div>

      {/* النافذة المنبثقة للنموذج (Modal) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {editingBook ? 'تعديل بيانات كتاب' : 'إضافة كتاب جديد'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الكتاب</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-amber-600"
                  >
                    <option value="">اختر القسم</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">سنة النشر</label>
                  <input
                    type="number"
                    required
                    value={formData.publishedYear}
                    onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">النسخ الإجمالية</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalCopies}
                    onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">النسخ المتاحة</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.availableCopies}
                    onChange={(e) => setFormData({ ...formData, availableCopies: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الـ ISBN</label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-amber-600 font-mono"
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
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}