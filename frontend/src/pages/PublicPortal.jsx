import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import BookCard from '../components/BookCard';
import CategorySection from '../components/CategorySection';
import Footer from '../components/Footer';

export function PublicPortal() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // الترقيم (Pagination)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchBooks = () => {
    setLoading(true);
    api.get('/books', { params: { pageSize: 150 } })
      .then(res => {
        const resData = res.data;
        let itemsList = [];
        if (Array.isArray(resData)) {
          itemsList = resData;
        } else if (resData?.items && Array.isArray(resData.items)) {
          itemsList = resData.items;
        } else if (resData?.data && Array.isArray(resData.data)) {
          itemsList = resData.data;
        }
        setBooks(itemsList);
      })
      .catch(err => {
        console.error('خطأ في جلب الكتب:', err);
        setBooks([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // دالة طلب الاستعارة مع التحقق من الدخول
  const handleBorrowRequest = async (book) => {
    const token = localStorage.getItem('token');
    
    // 1. إذا لم يكن مسجلاً لدخوله -> توجيهه لصفحة الدخول
    if (!token) {
      navigate('/login', { 
        state: { message: `عذراً، يجب عليك تسجيل الدخول أولاً لتتمكن من استعارة كتاب "${book.title}".` } 
      });
      return;
    }

    // 2. إذا كان مسجلاً الدخول -> تنفيذ طلب الاستعارة
    try {
      // جلب قائمة المستعيرين للتحقق من معرف المستعير الحالي
      const membersRes = await api.get('/members').catch(() => ({ data: [] }));
      const membersData = membersRes.data?.data || membersRes.data || [];
      
      const userStr = localStorage.getItem('user');
      const userObj = userStr ? JSON.parse(userStr) : null;

      // العثور على العضو المطابق للمستخدم أو استخدام أول عضو متاح
      let member = membersData.find(m => m.email === userObj?.email) || membersData[0];

      if (!member) {
        alert('تعذر العثور على سجل مستعير مرتبط بحسابك. يرجى مراجعة إدارة المكتبة.');
        return;
      }

      await api.post('/loans/borrow', {
        bookId: book.id,
        memberId: member.id,
        daysToBorrow: 14
      });

      alert(`تمت استعارة كتاب "${book.title}" بنجاح لمدة 14 يوماً!`);
      setSelectedBook(null);
      fetchBooks(); // تحديث أعداد النسخ المتاحة
    } catch (err) {
      console.error('Borrow error:', err);
      alert(err.response?.data?.message || err.response?.data || 'تعذر إتمام عملية الاستعارة حالياً.');
    }
  };

  const safeBooks = Array.isArray(books) ? books : [];
  const filteredBooks = safeBooks.filter(book => {
    if (!book) return false;
    const categoryName = (book.categoryName || '').toLowerCase();
    const bookTitle = (book.title || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesCategory = selectedCategory === 'all' 
      || categoryName.includes(selectedCategory.toLowerCase());

    const matchesSearch = bookTitle.includes(search);

    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredBooks.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + pageSize);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dir-rtl text-right flex flex-col justify-between" dir="rtl">
      <div>
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Hero Banner */}
        <section className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-16 px-6 text-center shadow-inner">
          <div className="max-w-4xl mx-auto space-y-4">
            <span className="bg-amber-800/40 text-amber-100 text-xs px-3 py-1 rounded-full font-medium inline-block">
              مكتبتك الرقمية الشاملة 📚
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              مرحباً بك في كتالوج المكتبة الرقمية
            </h1>
            <p className="text-amber-100 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              استكشف مجموعة واسعة من الكتب والمراجع المتاحة للاستعارة بسهولة وسرعة.
            </p>
          </div>
        </section>

        {/* الأقسام */}
        <div id="categories-section">
          <CategorySection 
            selectedCategory={selectedCategory} 
            onSelectCategory={(catId) => setSelectedCategory(catId)} 
          />
        </div>

        {/* شبكة الكتب */}
        <main id="books-section" className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8 border-b pb-4 border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">الكتب المتاحة للاستعارة</h2>
              <p className="text-xs text-gray-500 mt-1">
                {searchTerm 
                  ? `نتائج البحث عن: "${searchTerm}"`
                  : selectedCategory === 'all' ? 'عرض جميع الكتب' : `قسم: ${selectedCategory}`}
              </p>
            </div>
            <span className="text-sm font-semibold bg-amber-100 text-amber-800 px-3 py-1 rounded-lg">
              إجمالي الكتب: {filteredBooks.length}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-500">
              جاري تحميل الكتب...
            </div>
          ) : paginatedBooks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {paginatedBooks.map(book => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    onSelect={(b) => setSelectedBook(b)}
                    onBorrow={(b) => handleBorrowRequest(b)} 
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 dir-ltr">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-amber-50 hover:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    السابق
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition cursor-pointer ${
                        currentPage === pageNum
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-1.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-amber-50 hover:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    التالي
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-gray-500 font-medium">لم يتم العثور على أي كتب تطابق بحثك الحالي.</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                className="mt-4 text-xs text-amber-600 underline font-bold hover:text-amber-700 cursor-pointer"
              >
                إعادة ضبط البحث
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />

      {/* Modal التفاصيل */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 text-right">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-bold text-gray-800">{selectedBook.title}</h3>
              <button 
                onClick={() => setSelectedBook(null)} 
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <p><strong className="text-gray-700">التصنيف:</strong> {selectedBook.categoryName || 'عام'}</p>
              <p><strong className="text-gray-700">رقم الـ ISBN:</strong> <span className="font-mono text-gray-600">{selectedBook.isbn || 'غير مسجل'}</span></p>
              <p><strong className="text-gray-700">سنة النشر:</strong> {selectedBook.publishedYear || 'غير محدد'}</p>
              <p><strong className="text-gray-700">النسخ المتاحة للاستعارة:</strong> {selectedBook.availableCopies} من أصل {selectedBook.totalCopies || selectedBook.availableCopies}</p>
              <div className="bg-gray-50 p-3 rounded-xl border text-gray-600">
                <strong>الوصف / التفاصيل:</strong>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  {selectedBook.description || 'هذا الكتاب متوفر حالياً في قاعدة بيانات المكتبة المركزية ويمكن طلب استعارته مباشرة من خلال قسم الإعارات.'}
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-gray-100">
              <button 
                onClick={() => handleBorrowRequest(selectedBook)}
                disabled={selectedBook.availableCopies <= 0}
                className="bg-amber-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-amber-700 disabled:opacity-40 transition-colors cursor-pointer"
              >
                طلب استعارة الكتاب 📖
              </button>

              <button 
                onClick={() => setSelectedBook(null)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}