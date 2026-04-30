import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Logo from '../components/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('خطأ في البريد الإلكتروني أو كلمة المرور. يرجى التأكد من البيانات والمحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-[100px] -z-10 animate-pulse delay-1000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10 flex flex-col items-center">
          <Link to="/" className="mb-8">
            <Logo size={80} showText={true} />
          </Link>
          <h1 className="text-4xl font-black font-headline text-on-surface mb-2">تسجيل الدخول</h1>
          <p className="text-on-surface-variant font-bold">مرحباً بك في لوحة تحكم بدايتك</p>
        </div>

        <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 border ghost-border shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-error/10 border border-error/20 flex items-center gap-3 text-error text-sm font-bold"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface mr-2">البريد الإلكتروني</label>
              <div className="relative">
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface-container-low border ghost-border rounded-2xl px-12 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface text-right"
                  dir="ltr"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={20} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-on-surface mr-2">كلمة المرور</label>
              <div className="relative">
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low border ghost-border rounded-2xl px-12 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface text-right"
                  dir="ltr"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={20} />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl tech-gradient text-on-primary-container font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري التحميل...' : (
                <>
                  دخول
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t ghost-border text-center">
            <p className="text-xs text-on-surface-variant">
              هذه المنطقة مخصصة للإدارة فقط. إذا كنت عميلاً، يمكنك العودة لطلب خدمة.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
