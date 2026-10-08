import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function BorrowersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // حالات الترقيم (Pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8; // عدد المستعيرين المعروضين في كل صفحة

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member'
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/members');
      const data = response.data?.data || response.data || [];
      setMembers(data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        setError('جلسة العمل انتهت أو غير مصرح لك للوصول لهذه البيانات.');
      } else {
        setError('تعذر جلب قائمة المستعيرين من السيرفر.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // إعادة ضبط الترقيم إلى الصفحة الأولى عند تغير عدد الأعضاء
  useEffect(() => {
    setCurrentPage(1);
  }, [members.length]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.post('/auth/register', formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Member'
      });
      fetchMembers();
    } catch (err) {
      console.error('Error adding borrower:', err);
      setError(err.response?.data?.message || 'فشل في إضافة المستعير الجديد.');
    }
  };

  // اقتطاع بيانات الصفحة الحالية
  const safeMembers = Array.isArray(members) ? members : [];
  const totalPages = Math.ceil(safeMembers.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMembers = safeMembers.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-6 dir-rtl" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">إدارة المستعيرين (الأعضاء)</h2>
          <p className="text-gray-500 text-sm mt-1">عرض وإدارة قائمة الأعضاء المسجلين في المكتبة</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <span>+</span> إضافة مستعير جديد
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded-xl shadow-sm text-sm">
          {error}
        </div>
      )}

      {/* Table & Content */}
      {loading ? (
        <div className="bg-white p-8 text-center text-gray-500 rounded-xl shadow-sm border border-gray-100">
          جاري التحميل...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center text-xs font-semibold text-gray-500">
            <span>قائمة الأعضاء</span>
            <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg">
              الإجمالي: {safeMembers.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-gray-100 text-gray-500 text-sm">
                  <th className="p-4 font-semibold">المعرّف</th>
                  <th className="p-4 font-semibold">رقم العضوية</th>
                  <th className="p-4 font-semibold">الاسم</th>
                  <th className="p-4 font-semibold">تاريخ الانضمام</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedMembers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-400">
                      لا يوجد أعضاء مسجلون حالياً.
                    </td>
                  </tr>
                ) : (
                  paginatedMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-gray-400 font-mono">#{m.id}</td>
                      <td className="p-4 text-amber-600 font-medium">{m.membershipNumber || '-'}</td>
                      <td className="p-4 font-bold text-gray-800">{m.name || 'غير محدد'}</td>
                      <td className="p-4 text-gray-600">
                        {m.joinDate ? new Date(m.joinDate).toLocaleDateString('ar-EG') : '-'}
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
                عرض {startIndex + 1} - {Math.min(startIndex + pageSize, safeMembers.length)} من أصل {safeMembers.length}
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

      {/* Modal إضافة مستعير جديد */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-right">
            <h3 className="text-lg font-bold text-gray-800 mb-4">إضافة مستعير (عضو جديد)</h3>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="أدخل اسم العضو..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="example@mail.com"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">كلمة المرور للحساب</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="******"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition cursor-pointer"
                >
                  إضافة المستعير
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}