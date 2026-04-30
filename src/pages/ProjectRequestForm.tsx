import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Rocket,
  Globe, 
  Smartphone, 
  ShoppingBag, 
  Cpu,
  Info,
  Calendar,
  DollarSign,
  Layout,
  Palette,
  Layers,
  Zap,
  Upload,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

const ARAB_COUNTRIES_CITIES: Record<string, string[]> = {
  "المملكة العربية السعودية": ["الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "أبها", "تبوك", "حائل", "نجران", "الجوف", "الباحة"],
  "الإمارات العربية المتحدة": ["دبي", "أبوظبي", "الشارقة", "عجمان", "رأس الخيمة", "الفجيرة", "أم القيوين"],
  "مصر": ["القاهرة", "الإسكندرية", "الجيزة", "المنصورة", "بورسعيد", "السويس", "الأقصر", "أسوان"],
  "قطر": ["الدوحة", "الوكيرة", "الخور", "الريان", "الشمال"],
  "الكويت": ["مدينة الكويت", "الأحمدي", "حولي", "الفروانية", "الجهراء"],
  "البحرين": ["المنامة", "المحرق", "الرفاع", "حمد", "عيسى"],
  "سلطنة عمان": ["مسقط", "صلالة", "صحار", "نزوى", "صور"],
  "الأردن": ["عمان", "إربد", "الزرقاء", "العقبة", "المفرق"],
  "المغرب": ["الرباط", "الدار البيضاء", "مراكش", "فاس", "طنجة", "أكادير"],
  "الجزائر": ["الجزائر", "وهران", "قسنطينة", "عنابة", "سطيف"],
  "تونس": ["تونس", "صفاقس", "سوسة", "القيروان", "بنزرت"],
  "ليبيا": ["طرابلس", "بنغازي", "مصراتة", "الزاوية"],
  "العراق": ["بغداد", "البصرة", "الموصل", "أربيل", "كركوك"],
  "لبنان": ["بيروت", "طرابلس", "صيدا", "زحلة"],
  "سوريا": ["دمشق", "حلب", "حمص", "اللاذقية"],
  "اليمن": ["صنعاء", "عدن", "تعز", "المكلا"],
  "فلسطين": ["القدس", "غزة", "رام الله", "نابلس", "الخليل"],
  "السودان": ["الخرطوم", "أم درمان", "بورتسودان", "نيالا"],
  "موريتانيا": ["نواكشوط", "نواذيبو"],
  "الصومال": ["مقديشو", "هرجيسا"],
  "جيبوتي": ["جيبوتي"],
  "جزر القمر": ["موروني"]
};

export default function ProjectRequestForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectTypes: [] as string[],
    hasLogo: null as boolean | null,
    hasIdentity: null as boolean | null,
    designStyle: '',
    selectedColors: [] as string[],
    expectedPageCount: '',
    pages: [] as string[],
    features: [] as string[],
    description: '',
    budget: '',
    deadline: '',
    name: '',
    phone: '',
    email: '',
    country: '',
    city: '',
    appUpload: [] as string[],
    hosting: '',
    techSupport: [] as string[],
    registrationTypes: [] as string[],
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [customPage, setCustomPage] = useState('');
  const [additionalPages, setAdditionalPages] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState('');
  const [additionalFeatures, setAdditionalFeatures] = useState<string[]>([]);

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleAddCustomPage = () => {
    const trimmed = customPage.trim();
    if (trimmed) {
      if (!formData.pages.includes(trimmed)) {
        setFormData(prev => ({
          ...prev,
          pages: [...prev.pages, trimmed]
        }));
      }
      if (!additionalPages.includes(trimmed)) {
        setAdditionalPages(prev => [...prev, trimmed]);
      }
      setCustomPage('');
    }
  };

  const handleAddCustomFeature = () => {
    const trimmed = customFeature.trim();
    if (trimmed) {
      if (!formData.features.includes(trimmed)) {
        setFormData(prev => ({
          ...prev,
          features: [...prev.features, trimmed]
        }));
      }
      if (!additionalFeatures.includes(trimmed)) {
        setAdditionalFeatures(prev => [...prev, trimmed]);
      }
      setCustomFeature('');
    }
  };

  const toggleSelection = (list: string[], item: string) => {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.country || !formData.city) {
      alert('الرجاء إكمال جميع بيانات التواصل الإلزامية');
      return;
    }

    setIsSaving(true);
    try {
      // 1. Save the order
      await addDoc(collection(db, 'orders'), {
        ...formData,
        status: 'قيد المراجعة',
        createdAt: new Date().toISOString()
      });

      // 2. Add or Update Client
      const clientsRef = collection(db, 'clients');
      const q = query(clientsRef, where('phone', '==', formData.phone));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Update existing client
        const clientDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'clients', clientDoc.id), {
          projects: increment(1),
          lastProjectDate: new Date().toISOString(),
          city: formData.city,
          email: formData.email
        });
      } else {
        // Create new client
        await addDoc(collection(db, 'clients'), {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          status: 'نشط حالياً',
          projects: 1,
          registrationTypes: formData.registrationTypes || [],
          hosting: formData.hosting || 'غير محدد',
          date: new Date().getFullYear().toString(),
          createdAt: new Date().toISOString()
        });
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting request:", error);
      alert('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSaving(false);
    }
  };

  const steps = [
    { id: 1, title: 'النوع' },
    { id: 2, title: 'الهوية' },
    { id: 3, title: 'الصفحات' },
    { id: 4, title: 'التقنيات' },
    { id: 5, title: 'التفاصيل' },
    { id: 6, title: 'التواصل' },
  ];

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4 md:p-8">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Summary Card */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 space-y-6"
        >
          <div className="bg-surface-container-low rounded-3xl p-8 border ghost-border relative overflow-hidden h-full flex flex-col glass-panel">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all group border ghost-border">
                <span className="text-sm font-bold">الرئيسية</span>
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Logo size={32} />
            </div>

            <h2 className="text-2xl font-black font-headline mb-8 metallic-text">تفاصيل الطلب</h2>

            <div className="space-y-6 flex-1">
              <div className="flex justify-between items-start">
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant mb-1">نوع المشروع</p>
                  <p className="font-bold text-sm">{formData.projectTypes.join('، ') || 'لم يتم الاختيار'}</p>
                </div>
                <div className="text-primary"><Layout size={20} /></div>
              </div>

              <div className="flex justify-between items-start">
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant mb-1">نمط التصميم</p>
                  <p className="font-bold text-sm">{formData.designStyle || 'لم يتم الاختيار'}</p>
                </div>
                <div className="text-primary"><Palette size={20} /></div>
              </div>

              <div className="flex justify-between items-start">
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant mb-1">عدد الصفحات المتوقع</p>
                  <p className="font-bold text-sm">{formData.expectedPageCount || '0'} صفحة</p>
                </div>
                <div className="text-primary"><Layers size={20} /></div>
              </div>

              <div className="flex justify-between items-start">
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant mb-1">المميزات المختارة</p>
                  <p className="font-bold text-sm">{formData.features.length} مميزة</p>
                </div>
                <div className="text-primary"><Zap size={20} /></div>
              </div>

              <div className="pt-6 border-t ghost-border">
                <div className="p-4 rounded-xl bg-primary/5 text-center">
                  <p className="text-xs font-bold text-primary">بانتظار مراجعة طلبك</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">سنقوم بدراسة المتطلبات وتقديم الجدول الزمني والعرض المالي المناسب</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-2xl bg-surface-container-highest/30 border ghost-border flex items-center gap-3">
              <ShieldCheck className="text-primary" size={20} />
              <div className="text-right">
                <p className="text-[10px] font-bold">خصوصية بياناتك</p>
                <p className="text-[9px] text-on-surface-variant">يتم تشفير كافة البيانات المرفوعة ببروتوكول AES-256</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Form Steps */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 space-y-6"
        >
          {/* Progress Bar */}
          <div className="bg-surface-container-low rounded-3xl p-4 border ghost-border flex justify-between items-center gap-2">
            {steps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-2 flex-1 relative">
                <div className={`w-full h-1.5 rounded-full transition-all duration-700 ${
                  step >= s.id ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]' : 'bg-surface-container-highest'
                }`}></div>
                <span className={`text-[9px] font-black uppercase tracking-tighter ${step >= s.id ? 'text-primary' : 'text-on-surface-variant'}`}>{s.title}</span>
              </div>
            ))}
          </div>

          <div className="bg-surface-container-low rounded-3xl p-8 md:p-10 border ghost-border shadow-2xl min-h-[600px] flex flex-col relative overflow-hidden">
            <AnimatePresence mode="wait">
              {isSubmitted && (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <CheckCircle2 size={64} />
                  </div>
                  <h3 className="text-3xl font-black font-headline">تم استلام طلبك بنجاح!</h3>
                  <p className="text-on-surface-variant max-w-md mx-auto leading-relaxed">
                    تم استلام طلبك وسيتم التواصل معك بأقرب وقت لمناقشة التفاصيل وبدء العمل على مشروعك.
                  </p>
                  <Link 
                    to="/" 
                    className="mt-8 px-8 py-3 rounded-xl tech-gradient text-on-primary-container font-bold shadow-lg active:scale-95 transition-transform"
                  >
                    العودة للرئيسية
                  </Link>
                </motion.div>
              )}

              {!isSubmitted && step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8 flex-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <h3 className="text-2xl font-black font-headline">المرحلة 1: نوع المشروع</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: 'web', icon: <Globe />, title: 'موقع إلكتروني', desc: 'تعريفي، مدونة، أو معرض أعمال' },
                      { id: 'app', icon: <Smartphone />, title: 'تطبيق جوال', desc: 'تطبيقات iOS و Android Native' },
                      { id: 'store', icon: <ShoppingBag />, title: 'متجر إلكتروني', desc: 'منصة بيع متكاملة مع بوابات دفع' },
                      { id: 'custom', icon: <Cpu />, title: 'لوحة تحكم فقط', desc: 'أنظمة إدارة داخلية (SaaS)' }
                    ].map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => setFormData({...formData, projectTypes: toggleSelection(formData.projectTypes, item.title)})}
                        className={`p-6 rounded-2xl border text-right transition-all duration-300 group relative overflow-hidden ${
                          formData.projectTypes.includes(item.title) 
                            ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' 
                            : 'bg-surface-container-high border-outline-variant/10 hover:border-primary/30'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                          formData.projectTypes.includes(item.title) ? 'bg-primary text-on-primary-container' : 'bg-surface-container-highest text-primary'
                        }`}>
                          {item.icon}
                        </div>
                        <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                        <p className="text-[10px] text-on-surface-variant">{item.desc}</p>
                        {formData.projectTypes.includes(item.title) && (
                          <div className="absolute top-4 left-4 text-primary">
                            <CheckCircle2 size={20} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {!isSubmitted && step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10 flex-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <h3 className="text-2xl font-black font-headline">المرحلة 2: الهوية والتصميم</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-sm font-bold">هل لديك شعار جاهز؟</p>
                      <div className="flex gap-2">
                        {[true, false].map((val) => (
                          <button 
                            key={String(val)}
                            onClick={() => setFormData({...formData, hasLogo: val})}
                            className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${
                              formData.hasLogo === val ? 'bg-primary text-on-primary-container border-primary' : 'bg-surface-container-high border-outline-variant/10'
                            }`}
                          >
                            {val ? 'نعم' : 'لا'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm font-bold">هل لديك هوية بصرية؟</p>
                      <div className="flex gap-2">
                        {[true, false].map((val) => (
                          <button 
                            key={String(val)}
                            onClick={() => setFormData({...formData, hasIdentity: val})}
                            className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${
                              formData.hasIdentity === val ? 'bg-primary text-on-primary-container border-primary' : 'bg-surface-container-high border-outline-variant/10'
                            }`}
                          >
                            {val ? 'نعم' : 'لا'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-bold">نمط التصميم المفضل</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['عصري', 'رسمي', 'بسيط', 'فاخر'].map((style) => (
                        <button 
                          key={style}
                          onClick={() => setFormData({...formData, designStyle: style})}
                          className={`py-3 rounded-xl border font-bold text-sm transition-all ${
                            formData.designStyle === style ? 'bg-primary text-on-primary-container border-primary' : 'bg-surface-container-high border-outline-variant/10'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-bold">اختيار الألوان</p>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
                      {[
                        '#4a8eff', '#00c853', '#ffab00', '#ff5252', '#9c27b0',
                        '#e91e63', '#673ab7', '#3f51b5', '#03a9f4', '#00bcd4',
                        '#009688', '#8bc34a', '#cddc39', '#ffeb3b', '#ff9800',
                        '#ff5722', '#795548', '#9e9e9e', '#607d8b', '#212121',
                        '#ffffff'
                      ].map((color) => (
                        <button 
                          key={color}
                          onClick={() => setFormData({...formData, selectedColors: toggleSelection(formData.selectedColors, color)})}
                          className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm ${
                            formData.selectedColors.includes(color) ? 'border-primary scale-110 shadow-primary/30' : 'border-outline-variant/20'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {!isSubmitted && step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8 flex-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <h3 className="text-2xl font-black font-headline">المرحلة 3: الصفحات المطلوبة</h3>
                  </div>
                  <div className="flex flex-col gap-8">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold">أضف خيار عدد الصفحات المتوقع طلبها</label>
                      <input 
                        type="number" 
                        value={formData.expectedPageCount}
                        onChange={(e) => setFormData({...formData, expectedPageCount: e.target.value})}
                        placeholder="مثلاً: 5"
                        className="w-full max-w-xs bg-surface-container-highest border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface text-sm"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold">الصفحات المطلوبة تحديداً</label>
                      <div className="flex flex-wrap gap-3">
                        {['الرئيسية', 'من نحن', 'اتصل بنا', 'سياسة الخصوصية', 'الشروط والأحكام', 'مدونة', 'متجر', ...additionalPages].map((page) => (
                          <button 
                            key={page}
                            onClick={() => setFormData({...formData, pages: toggleSelection(formData.pages, page)})}
                            className={`px-6 py-3 rounded-xl border font-bold text-sm transition-all ${
                              formData.pages.includes(page) ? 'bg-primary text-on-primary-container border-primary' : 'bg-surface-container-high border-outline-variant/10'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 mt-4 max-w-md">
                        <input 
                          type="text" 
                          value={customPage}
                          onChange={(e) => setCustomPage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomPage())}
                          placeholder="أدخل اسم صفحة مخصصة..."
                          className="flex-1 bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface text-sm"
                        />
                        <button 
                          type="button"
                          onClick={handleAddCustomPage}
                          className="bg-primary/10 text-primary hover:bg-primary/20 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                        >
                          أضف صفحة
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {!isSubmitted && step === 4 && (
                <motion.div 
                  key="step4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8 flex-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <h3 className="text-2xl font-black font-headline">المرحلة 4: المميزات التقنية</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      'تسجيل حساب؟', 'تسجيل دخول؟', 'لوحة تحكم للمدير؟', 
                      'نظام دفع إلكتروني؟', 'نظام إشعارات؟', 'API أو تكاملات خارجية؟',
                      ...additionalFeatures
                    ].map((feature) => (
                      <button 
                        key={feature}
                        onClick={() => setFormData({...formData, features: toggleSelection(formData.features, feature)})}
                        className={`p-5 rounded-2xl border text-right font-bold text-sm transition-all flex items-center justify-between ${
                          formData.features.includes(feature) ? 'bg-primary/10 border-primary' : 'bg-surface-container-high border-outline-variant/10 hover:border-primary/30'
                        }`}
                      >
                        <span>{feature}</span>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.features.includes(feature) ? 'bg-primary border-primary' : 'border-outline-variant/30'}`}>
                          {formData.features.includes(feature) && <CheckCircle2 size={14} className="text-on-primary-container" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                    <input 
                      type="text" 
                      value={customFeature}
                      onChange={(e) => setCustomFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomFeature())}
                      placeholder="أدخل ميزة تقنية مخصصة..."
                      className="flex-1 bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface text-sm"
                    />
                    <button 
                      type="button"
                      onClick={handleAddCustomFeature}
                      className="bg-primary/10 text-primary hover:bg-primary/20 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                    >
                      أضف ميزة
                    </button>
                  </div>

                  <div className="pt-4 space-y-6">
                    <div className="space-y-3">
                      <p className="text-[11px] font-bold text-on-surface">التسجيل عبر:</p>
                      <div className="flex gap-4">
                        {['Google', 'Apple'].map(type => (
                          <label key={type} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={formData.registrationTypes.includes(type)}
                              onChange={() => setFormData({...formData, registrationTypes: toggleSelection(formData.registrationTypes, type)})}
                              className="accent-primary w-4 h-4" 
                            />
                            <span className="text-xs text-on-surface-variant group-hover:text-primary transition-colors">{type}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[11px] font-bold text-on-surface">رفع التطبيقات:</p>
                      <div className="flex gap-4">
                        {['قوقل بلاي', 'ابل ستور'].map(store => (
                          <label key={store} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={formData.appUpload.includes(store)}
                              onChange={() => setFormData({...formData, appUpload: toggleSelection(formData.appUpload, store)})}
                              className="accent-primary w-4 h-4" 
                            />
                            <span className="text-xs text-on-surface-variant group-hover:text-primary transition-colors">{store}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[11px] font-bold text-on-surface">الاستضافة للمواقع الإلكترونية:</p>
                      <div className="flex gap-4">
                        {[
                          { id: 'owned', label: 'لدي استضافة' },
                          { id: 'yours', label: 'الرفع على استضافتكم' }
                        ].map(opt => (
                          <label key={opt.id} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="radio" 
                              name="hosting"
                              checked={formData.hosting === opt.label}
                              onChange={() => setFormData({...formData, hosting: opt.label})}
                              className="accent-primary w-4 h-4" 
                            />
                            <span className="text-xs text-on-surface-variant group-hover:text-primary transition-colors">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[11px] font-bold text-on-surface">الدعم الفني:</p>
                      <div className="flex gap-4">
                        {[
                          { id: '3free', label: '٣ مجانية' },
                          { id: 'year', label: 'سنة' }
                        ].map(opt => (
                          <label key={opt.id} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={formData.techSupport.includes(opt.label)}
                              onChange={() => setFormData({...formData, techSupport: toggleSelection(formData.techSupport, opt.label)})}
                              className="accent-primary w-4 h-4" 
                            />
                            <span className="text-xs text-on-surface-variant group-hover:text-primary transition-colors">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {!isSubmitted && step === 5 && (
                <motion.div 
                  key="step5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8 flex-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <h3 className="text-2xl font-black font-headline">المرحلة 5: تفاصيل إضافية</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="block text-sm font-bold">وصف المشروع</label>
                    <textarea 
                      rows={5}
                      placeholder="اشرح لنا فكرتك باختصار...معلومات فكرتك وما يقدم لنا من معلومات سرية ولا نبوح بها لأي شخص ونتحمل المسئولية تجاه ذلك"
                      className="w-full bg-surface-container-highest border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface resize-none text-sm"
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold">الميزانية المتوقعة (اختياري)</label>
                      <input 
                        type="text" 
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                        placeholder="مثلاً: 5000 - 10000"
                        className="w-full bg-surface-container-highest border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface text-sm"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold">الجدول الزمني المطلوب (بالشهور)</label>
                      <select 
                        value={formData.deadline}
                        onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                        className="w-full bg-surface-container-highest border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface text-sm appearance-none"
                      >
                        <option value="">اختر المدة...</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <option key={month} value={month}>{month} {month === 1 ? 'شهر' : (month === 2 ? 'شهران' : 'شهور')}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold">رفع ملفات (شعار / نماذج)</label>
                    <div className="border-2 border-dashed border-outline-variant/30 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 bg-surface-container-highest/20 hover:bg-surface-container-highest/40 transition-colors cursor-pointer">
                      <Upload className="text-primary" size={32} />
                      <p className="text-xs text-on-surface-variant font-bold">اسحب الملفات هنا أو اضغط للاختيار</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {!isSubmitted && step === 6 && (
                <motion.div 
                  key="step6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8 flex-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <h3 className="text-2xl font-black font-headline">المرحلة 6: بيانات التواصل</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="block text-sm font-bold flex items-center gap-2">
                        <User size={16} className="text-primary" />
                        الاسم الكامل <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="أدخل اسمك"
                        className="w-full bg-surface-container-highest border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface text-sm"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold flex items-center gap-2">
                        <Phone size={16} className="text-primary" />
                        رقم الجوال <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="05XXXXXXXX"
                        className="w-full bg-surface-container-highest border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface text-sm"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold flex items-center gap-2">
                        <Globe size={16} className="text-primary" />
                        الدولة <span className="text-red-500">*</span>
                      </label>
                      <select 
                        required
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value, city: ''})}
                        className="w-full bg-surface-container-highest border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface text-sm appearance-none"
                      >
                        <option value="">اختر الدولة...</option>
                        {Object.keys(ARAB_COUNTRIES_CITIES).map((country) => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold flex items-center gap-2">
                        <MapPin size={16} className="text-primary" />
                        المدينة <span className="text-red-500">*</span>
                      </label>
                      <select 
                        required
                        disabled={!formData.country}
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full bg-surface-container-highest border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface text-sm appearance-none disabled:opacity-50"
                      >
                        <option value="">اختر المدينة...</option>
                        {formData.country && ARAB_COUNTRIES_CITIES[formData.country].map((city) => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <label className="block text-sm font-bold flex items-center gap-2">
                        <Mail size={16} className="text-primary" />
                        البريد الإلكتروني <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="email" 
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="name@example.com"
                        className="w-full bg-surface-container-highest border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface text-sm"
                      />
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 flex items-center gap-4">
                    <ShieldCheck className="text-primary shrink-0" size={24} />
                    <p className="text-[10px] text-on-surface-variant leading-relaxed font-bold">
                      سيتم مراجعة طلبك والتواصل معك خلال الأيام القادمة. نحن نضمن سرية تامة لجميع المعلومات المرفوعة.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {!isSubmitted && (
              <div className="mt-12 flex justify-between items-center pt-8 border-t ghost-border">
                <button 
                  onClick={prevStep}
                  disabled={step === 1}
                  className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black transition-all ${
                    step === 1 ? 'opacity-0 pointer-events-none' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest'
                  }`}
                >
                  <ArrowRight size={20} />
                  <span>السابق</span>
                </button>

                <button 
                  onClick={() => step === 6 ? handleSubmit() : nextStep()}
                  disabled={isSaving}
                  className="flex items-center gap-3 px-12 py-4 rounded-2xl tech-gradient text-on-primary-container font-black shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all group disabled:opacity-50 disabled:scale-100"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>جاري الإرسال...</span>
                    </>
                  ) : (
                    <>
                      <span>{step === 6 ? 'إرسال الطلب' : 'الخطوة التالية'}</span>
                      <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
