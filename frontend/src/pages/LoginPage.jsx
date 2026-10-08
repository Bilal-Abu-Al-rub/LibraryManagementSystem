import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // التبديل بين تسجيل الدخول وإنشاء حساب
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // رسالة تنبيه قادمة في حال التحويل من طلب الاستعارة
  const redirectNotice = location.state?.message;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        // تسجيل الدخول
        const res = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        });

        const { token, email, role } = res.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ email, role }));

        setSuccessMsg('تم تسجيل الدخول بنجاح! جاري تحويلك...');

        setTimeout(() => {
          if (role === 'Admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 800);

      } else {
        // إنشاء حساب مستعير جديد
        const res = await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'Member'
        });

        const { token, email, role } = res.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ email, role }));

        setSuccessMsg('تم إنشاء الحساب بنجاح! يمكنك الآن استعارة الكتب.');

        setTimeout(() => {
          navigate('/');
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else if (err.response?.status === 409) {
        setError('هذا البريد الإلكتروني مُسجل مسبقاً.');
      } else {
        setError('حدث خطأ أثناء الاتصال بالسيرفر.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 text-right dir-rtl" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-8">
        
        {/* الشعار */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <img src="/images/main-logo.png" alt="Logo" className="h-9 object-contain" />
            <span className="text-2xl font-bold text-amber-700">المكتبة الرقمية</span>
          </Link>
          <p className="text-xs text-slate-500">
            {isLogin ? 'قم بتسجيل الدخول للاستفادة من خدمات الاستعارة' : 'أنشئ حسابك الجديد للبدء باستعارة الكتب'}
          </p>
        </div>

        {/* إشعار التحويل من الاستعارة */}
        {redirectNotice && (
          <div className="bg-amber-50 border-r-4 border-amber-500 text-amber-800 p-3 rounded-xl text-xs mb-4">
            {redirectNotice}
          </div>
        )}

        {/* تنبيه الأخطاء أو النجاح */}
        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-3 rounded-xl text-xs mb-4">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border-r-4 border-emerald-500 text-emerald-700 p-3 rounded-xl text-xs mb-4">
            {successMsg}
          </div>
        )}

        {/* أزرار التبديل */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
              isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
              !isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            إنشاء حساب جديد
          </button>
        </div>

        {/* النموذج */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">الاسم الكامل</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                placeholder="أدخل اسمك الكامل..."
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="example@domain.com"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">كلمة المرور</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-amber-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl transition duration-200 shadow-sm disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'جاري المعالجة...' : isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}
          </button>
        </form>

        {/* رابط العودة */}
        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <Link to="/" className="text-xs text-slate-500 hover:text-amber-600 font-medium transition">
            ← العودة لكتالوج الكتب
          </Link>
        </div>

      </div>
    </div>
  );
}