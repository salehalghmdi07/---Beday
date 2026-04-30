import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  Settings, 
  Terminal, 
  Calendar, 
  Shield, 
  Download, 
  AlertTriangle,
  ChevronDown,
  Edit,
  Phone,
  ArrowRight,
  Loader2,
  Camera,
  Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!auth.currentUser) return;
      
      try {
        // Try to get from Firestore first
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setDisplayName(data.displayName || auth.currentUser.displayName || '');
          setPhotoURL(data.photoURL || auth.currentUser.photoURL || '');
        } else {
          setDisplayName(auth.currentUser.displayName || '');
          setPhotoURL(auth.currentUser.photoURL || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Increased to 2MB as Firestore can handle it
        alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      // 1. Update Firestore Profile (Can handle large Base64)
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        displayName,
        photoURL,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // 2. Update Auth Profile (Only name, clear photo link to avoid errors if it's base64)
      // Auth profile photoURL has small length limit (around 2048 chars)
      const authPhoto = photoURL.startsWith('http') ? photoURL : ''; 
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL: authPhoto
      });

      alert('تم تحديث الملف الشخصي بنجاح');
      window.location.reload(); 
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('حدث خطأ أثناء التحديث. يرجى التأكد من حجم الصورة.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div className="flex justify-start">
        <Link to="/" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm">
          <ArrowRight size={18} />
          <span>العودة للرئيسية</span>
        </Link>
      </div>

      <header className="text-right">
        <h2 className="text-3xl font-extrabold text-primary mb-2 tracking-tight font-headline">إعدادات النظام</h2>
        <p className="text-on-surface-variant">إدارة حسابك الشخصي وتخصيص تجربة المنصة التقنية</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Info */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-surface-container-low rounded-2xl p-8 ghost-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            {isLoading ? (
              <div className="flex items-center justify-center p-20">
                <Loader2 className="animate-spin text-primary" size={48} />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
                    <User size={24} />
                  </div>
                  <h3 className="text-xl font-bold">الملف الشخصي</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-on-surface-variant mr-1">الاسم الكامل</label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 transition-all outline-none text-on-surface"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-on-surface-variant mr-1">الصورة الشخصية</label>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-highest border ghost-border group relative">
                        <img 
                          src={photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 bg-surface-container-highest border-none rounded-xl px-4 py-3 flex items-center justify-between hover:bg-primary/10 transition-all text-on-surface-variant group"
                      >
                        <span className="text-xs font-bold">إدراج صورة من الجهاز...</span>
                        <Upload size={18} className="group-hover:text-primary transition-colors" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 opacity-60">
                    <label className="block text-sm font-medium text-on-surface-variant mr-1">البريد الإلكتروني (غير قابل للتغيير هنا)</label>
                    <input 
                      type="email" 
                      value={auth.currentUser?.email || ''}
                      disabled
                      className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 outline-none text-on-surface cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-on-surface-variant mr-1">تغيير كلمة المرور</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••"
                        className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 transition-all outline-none text-on-surface"
                      />
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="tech-gradient text-on-primary-container px-8 py-3 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : null}
                    حفظ التغييرات
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Platform Settings */}
          <div className="bg-surface-container-low rounded-2xl p-8 ghost-border">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-tertiary">
                <Terminal size={24} />
              </div>
              <h3 className="text-xl font-bold">إعدادات المنصة</h3>
            </div>
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-on-surface mb-1">استقبال الطلبات الجديدة</h4>
                  <p className="text-sm text-on-surface-variant">تفعيل أو تعطيل ظهور زر الطلب للعملاء</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-14 h-7 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full rtl:peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/15">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-on-surface-variant mr-1">عملة المنصة الرئيسية</label>
                  <div className="relative">
                    <select className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface appearance-none cursor-pointer">
                      <option value="SAR">ريال سعودي (SAR)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="AED">درهم إماراتي (AED)</option>
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-on-surface-variant mr-1">بريد إشعارات الطلبات</label>
                  <input 
                    type="email" 
                    defaultValue="salehalghmdi07@gmail.com"
                    className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-on-surface-variant mr-1">رقم واتساب المدير</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                    <input 
                      type="text" 
                      defaultValue="https://iwtsp.com/966554043330"
                      className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <section className="space-y-6">
          <div className="bg-surface-container-high rounded-2xl p-6 ghost-border text-center">
            <div className="relative inline-block mb-4">
              <img 
                src={photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 p-1"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 left-0 bg-primary text-on-primary-container w-8 h-8 rounded-full flex items-center justify-center border-2 border-surface-container-high cursor-pointer">
                <Edit size={14} />
              </div>
            </div>
            <h3 className="text-lg font-bold">{displayName || 'مدير النظام'}</h3>
            <p className="text-primary text-sm font-medium mb-6">مدير النظام (Admin)</p>
            <div className="text-right space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="text-on-surface-variant" size={16} />
                <span className="text-on-surface-variant">تاريخ الانضمام: 12 مايو 2023</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="text-on-surface-variant" size={16} />
                <span className="text-on-surface-variant">آخر تسجيل دخول: منذ ساعتين</span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 ghost-border space-y-6">
            <h4 className="font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              حالة النظام
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">سعة تخزين الملفات</span>
                  <span className="text-primary">75%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">معدل استجابة الخادم</span>
                  <span className="text-tertiary">120ms</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary-container rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-outline-variant/15">
              <button className="w-full py-2.5 px-4 rounded-xl text-sm font-bold border border-primary/30 text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                <Download size={16} />
                تحميل نسخة احتياطية
              </button>
            </div>
          </div>

          <div className="bg-error-container/10 rounded-2xl p-6 border border-error/20">
            <h4 className="font-bold text-error flex items-center gap-2 mb-2">
              <AlertTriangle size={18} />
              منطقة الخطر
            </h4>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">بمجرد تصفير لوحة التحكم، سيتم حذف جميع الطلبات، العملاء، والأعمال المسجلة. لا يمكن التراجع عن هذا الإجراء.</p>
            
            <div className="space-y-3">
              <button 
                onClick={async () => {
                  if (window.confirm('هل أنت متأكد من رغبتك في تصفير كافة البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
                    try {
                      const collections = ['orders', 'clients', 'portfolio', 'services', 'pages', 'site_config'];
                      const { getDocs, collection, deleteDoc, doc } = await import('firebase/firestore');
                      const { db } = await import('../lib/firebase');
                      
                      for (const collName of collections) {
                        const querySnapshot = await getDocs(collection(db, collName));
                        const deletePromises = querySnapshot.docs.map(d => deleteDoc(doc(db, collName, d.id)));
                        await Promise.all(deletePromises);
                      }
                      
                      alert('تم تصفير البيانات بنجاح');
                    } catch (error) {
                      console.error('Error resetting data:', error);
                      alert('حدث خطأ أثناء تصفير البيانات');
                    }
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-bold bg-error text-on-error hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                تصفير كافة البيانات
              </button>
              <button className="text-error text-xs font-bold hover:underline w-full text-center">تعطيل المنصة مؤقتاً</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
