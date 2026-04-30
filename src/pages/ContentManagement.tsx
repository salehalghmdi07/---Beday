import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Clock, 
  UserPlus, 
  Edit3, 
  Plus, 
  Globe, 
  Smartphone, 
  ShoppingBag, 
  Cpu,
  Edit,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Save,
  Layers,
  ArrowRight,
  X,
  PlusCircle,
  Settings2,
  Layout,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  serverTimestamp,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface Page {
  id: string;
  title: string;
  slug: string;
  location: 'header' | 'body';
  order: number;
  content: any;
  active: boolean;
}

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'global'>('overview');
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageData, setNewPageData] = useState({
    title: '',
    slug: '',
    location: 'body' as 'header' | 'body',
    order: 0
  });
  const [footerText, setFooterText] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const seedDefaultPages = async () => {
    setIsSaving(true);
    const defaultPages = [
      {
        title: "الرئيسية",
        slug: "home",
        location: "header",
        order: 0,
        active: true,
        content: {
          hero: {
            title: "أطلب موقعك أو\nتطبيقك بأفضل الأسعار.",
            sub: "نموذج ذكي، تسعير تقديري فوري، وبناء احترافي. نجمع بين السرعة والإتقان",
            image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80"
          }
        }
      },
      {
        title: "خدماتنا",
        slug: "services",
        location: "header",
        order: 1,
        active: true,
        content: {
          hero: {
            title: "خدمات تقنية متكاملة",
            sub: "نقدم حلولاً مخصصة تناسب احتياجات مشروعك وأهدافك التجارية.",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
          }
        }
      },
      {
        title: "أعمالنا",
        slug: "portfolio",
        location: "header",
        order: 2,
        active: true,
        content: {
          hero: {
            title: "معرض الأعمال",
            sub: "استعرض قصص النجاح والمشاريع التي قمنا بتنفيذها لعملائنا.",
            image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
          }
        }
      },
      {
        title: "من نحن",
        slug: "about",
        location: "header",
        order: 3,
        active: true,
        content: {
          hero: {
            title: "عن بدايتك",
            sub: "فريق شغوف بالابتكار يسعى لتمكين الشركات تقنياً في العالم الرقمي.",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
          },
          body: "نحن في بدايتك نؤمن بأن كل فكرة عظيمة تستحق بداية تقنية قوية. \n\nنعمل كشركاء نجاح لعملائنا، حيث نحول الرؤى المبتكرة إلى واقع رقمي ملموس من خلال تصميم وتطوير المواقع والتطبيقات بأعلى معايير الجودة العالمية.\n\nفريقنا يجمع بين الخبرة التقنية والرؤية التصميمية لضمان تقديم حلول لا تكتفي فقط بالأداء العالي، بل تقدم تجربة مستخدم استثنائية."
        }
      },
      {
        title: "الشروط والخصوصية",
        slug: "privacy",
        location: "body",
        order: 4,
        active: true,
        content: {
          hero: {
            title: "سياسة الخصوصية وشروط الاستخدام",
            sub: "نحن نلتزم بحماية بياناتك وتوضيح حقوقك والتزاماتك عند استخدام منصتنا.",
            image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80"
          },
          body: "1. جمع المعلومات:\nنقوم بجمع المعلومات التي تقدمها لنا مباشرة عند طلب مشروع أو التواصل معنا.\n\n2. حماية البيانات:\nنطبق معايير أمنية تقنية وإدارية صارمة لحماية بياناتك من الوصول غير المصرح به.\n\n3. حقوق الملكية الفكرية:\nجميع الأكواد البرمجية والتصاميم التي يتم تطويرها لعملائنا تخضع لاتفاقيات ملكية محددة."
        }
      }
    ];

    try {
      for (const page of defaultPages) {
        // Check if page already exists
        const exists = pages.some(p => p.slug === page.slug);
        if (!exists) {
          await addDoc(collection(db, 'pages'), {
            ...page,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      }
      alert('تمت إضافة الصفحات الافتراضية بنجاح (تم تخطي الموجود مسبقاً)');
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'pages');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'pages'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const p = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Page))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setPages(p);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pages');
    });

    // Load global config
    getDoc(doc(db, 'site_config', 'global')).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setFooterText(data.footerText || '');
        setContactEmail(data.contactEmail || '');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    let originalSlug = newPageData.slug || newPageData.title;
    // Clean slug: remove spaces, special chars, leading/trailing slashes
    let slug = originalSlug
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\u0600-\u06FF\-]/g, '') // Allow Arabic chars in slugs too
      .replace(/^\/+|\/+$/g, ''); 

    if (pages.some(p => p.slug === slug)) {
      alert('هذا الرابط مستخدم بالفعل، يرجى اختيار رابط آخر');
      setIsSaving(false);
      return;
    }

    try {
      const newPageDataToSave = {
        title: newPageData.title,
        slug,
        location: newPageData.location,
        order: Number(newPageData.order),
        active: true,
        content: { 
          hero: { 
            title: newPageData.title, 
            sub: 'هذا مجرد وصف افتراضي، يمكنك تغييره من محرر الصفحات.', 
            image: (newPageData as any).heroImage || '' 
          } 
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, 'pages'), newPageDataToSave);
      setIsAddingPage(false);
      setNewPageData({ title: '', slug: '', location: 'body', order: pages.length });
      setEditingPage({ id: docRef.id, ...newPageDataToSave } as Page);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'pages');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'new' | 'edit' = 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 2 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'edit' && editingPage) {
          setEditingPage({
            ...editingPage,
            content: {
              ...editingPage.content,
              hero: { ...editingPage.content?.hero, image: reader.result as string }
            }
          });
        } else if (type === 'new') {
          // Store preview for new page
          setNewPageData(prev => ({
            ...prev,
            heroImage: reader.result as string
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePageContent = async () => {
    if (!editingPage) return;
    setIsSaving(true);
    try {
      const { id, ...saveData } = editingPage;
      // Clean slug before save
      saveData.slug = saveData.slug.trim().replace(/^\/+|\/+$/g, '');
      
      await updateDoc(doc(db, 'pages', id), {
        ...saveData,
        updatedAt: serverTimestamp()
      });
      setEditingPage(null);
      alert('تم حفظ الصفحة بنجاح');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'pages');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGlobal = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'site_config', 'global'), {
        footerText,
        contactEmail,
        updatedAt: serverTimestamp()
      });
      alert('تم حفظ الإعدادات العامة');
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'site_config');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصفحة؟')) return;
    try {
      await deleteDoc(doc(db, 'pages', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'pages');
    }
  };

  const handleToggleActive = async (page: Page) => {
    try {
      await updateDoc(doc(db, 'pages', page.id), {
        active: !page.active,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'pages');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-surface-container-low p-1 rounded-2xl border ghost-border">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            نظرة عامة
          </button>
          <button 
            onClick={() => setActiveTab('pages')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'pages' ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            إدارة الصفحات
          </button>
          <button 
            onClick={() => setActiveTab('global')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'global' ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            الإعدادات العامة
          </button>
        </div>
        
        {activeTab === 'pages' && (
          <div className="flex gap-4">
            <button 
              onClick={seedDefaultPages}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-surface-container-high text-on-surface rounded-xl font-bold border ghost-border hover:bg-surface-container-highest transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Layers size={20} />}
              استعادة الصفحات الأساسية
            </button>
            <button 
              onClick={() => setIsAddingPage(true)}
              className="flex items-center gap-2 px-6 py-2.5 tech-gradient text-on-primary-container rounded-xl font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
            >
              <PlusCircle size={20} />
              إضافة صفحة جديدة
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Stats Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <TrendingUp size={24} />, label: "إجمالي الصفحات", value: pages.length.toString(), trend: "مفعلة", color: "text-primary" },
                { icon: <Clock size={24} />, label: "آخر تحديث", value: "اليوم", trend: "08:30 AM", color: "text-secondary" },
                { icon: <Layout size={24} />, label: "زيارات الموقع", value: "3,402", trend: "+5% أسبوعي", color: "text-primary" }
              ].map((stat, i) => (
                <div key={i} className="bg-surface-container-low rounded-2xl p-6 border ghost-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 bg-primary/10 rounded-xl ${stat.color}`}>{stat.icon}</div>
                    <span className="text-xs text-on-surface-variant font-medium">{stat.trend}</span>
                  </div>
                  <p className="text-on-surface-variant text-sm font-medium">{stat.label}</p>
                  <h3 className="text-3xl font-black text-on-surface mt-1">{stat.value}</h3>
                </div>
              ))}
            </section>

            <div className="bg-surface-container-low rounded-3xl p-8 border ghost-border border-dashed">
              <div className="flex flex-col items-center text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary mb-6">
                  <Settings2 size={32} />
                </div>
                <h3 className="text-2xl font-black mb-4">إدارة محتوى المنصة</h3>
                <p className="text-on-surface-variant mb-8 leading-relaxed">
                  يمكنك من هنا التحكم في كامل الموقع، إضافة صفحات جديدة، تغيير العناوين، وإدارة الروابط في الشريط السفلي بكل سهولة.
                </p>
                <button 
                  onClick={() => setActiveTab('pages')}
                  className="px-8 py-3 bg-primary text-on-primary rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  ابدأ بإدارة الصفحات
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'pages' && (
          <motion.div 
            key="pages"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? (
              <div className="col-span-full flex justify-center py-20">
                <Loader2 className="animate-spin text-primary" size={48} />
              </div>
            ) : pages.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-surface-container-low rounded-3xl border border-dashed ghost-border flex flex-col items-center">
                <p className="text-on-surface-variant mb-6">لا توجد صفحات مضافة بعد. ابدأ بإضافة صفحة جديدة أو استخدم الإعداد الافتراضي!</p>
                <button 
                  onClick={seedDefaultPages}
                  disabled={isSaving}
                  className="px-8 py-3 bg-primary text-on-primary rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Layers size={20} />}
                  إضافة الصفحات الافتراضية
                </button>
              </div>
            ) : pages.map(page => (
              <div key={page.id} className="bg-surface-container-low rounded-2xl border ghost-border overflow-hidden hover:shadow-xl transition-all group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-primary/5 rounded-lg text-primary group-hover:scale-110 transition-transform">
                      <Globe size={24} />
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => setEditingPage(page)}
                        className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-primary transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeletePage(page.id)}
                        className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-error transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold mb-1">{page.title}</h4>
                  <p className="text-xs text-on-surface-variant mb-2 font-mono">/{page.slug}</p>
                  <p className="text-[10px] bg-primary/5 text-primary inline-block px-2 py-0.5 rounded-md font-bold mb-4">
                    {page.location === 'header' ? 'الشريط العلوي (رأس)' : 'محتوى الصفحة (جسم)'} | ترتيب: {page.order || 0}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleToggleActive(page)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${page.active ? 'bg-primary' : 'bg-surface-container-highest'}`}
                      >
                        <div className={`absolute top-1 transition-all w-3 h-3 rounded-full bg-white ${page.active ? 'left-6' : 'left-1'}`}></div>
                      </button>
                      <span className={`text-[10px] font-black uppercase ${page.active ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {page.active ? 'ظاهرة' : 'مخفية'}
                      </span>
                    </div>
                    <Link 
                      to={page.slug === 'home' ? '/' : `/p/${page.slug.replace(/^\/+|\/+$/g, '')}`} 
                      target="_blank"
                      className="text-sm font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                      معاينة <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'global' && (
          <motion.div 
            key="global"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl"
          >
            <div className="bg-surface-container-low rounded-3xl p-8 border ghost-border space-y-8">
              <div>
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <Smartphone className="text-primary" size={24} />
                  تذييل الصفحة (Footer)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2 mr-1">نص حقوق الملكية</label>
                    <textarea 
                      rows={3}
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      placeholder="جميع الحقوق محفوظة لشركة بدايتك..."
                      className="w-full bg-surface-container-highest border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none resize-none text-on-surface leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2 mr-1">بريد التواصل</label>
                    <input 
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="hello@beday.tech"
                      className="w-full bg-surface-container-highest border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant/10">
                <button 
                  onClick={handleSaveGlobal}
                  disabled={isSaving}
                  className="w-full py-4 tech-gradient text-on-primary-container rounded-2xl font-black shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  حفظ الإعدادات العامة
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Content Editor Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditingPage(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-4xl bg-surface rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b ghost-border flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="text-xl font-black leading-none">تعديل محتوى الصفحة</h3>
                <p className="text-xs text-on-surface-variant mt-2">تعديل: {editingPage.title} (/{editingPage.slug})</p>
              </div>
              <button 
                onClick={() => setEditingPage(null)}
                className="w-10 h-10 rounded-xl hover:bg-surface-container-highest flex items-center justify-center transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Hero Editor */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-primary flex items-center gap-2">
                    <div className="w-2 h-8 bg-primary rounded-full"></div>
                    إعدادات الصفحة العامة
                  </h4>
                  <div className="flex items-center gap-3 bg-surface-container-low p-2 rounded-xl border ghost-border text-xs font-bold">
                    <span>حالة الظهور:</span>
                    <button 
                      onClick={() => setEditingPage({ ...editingPage, active: !editingPage.active })}
                      className={`px-4 py-1.5 rounded-lg transition-all ${editingPage.active ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}
                    >
                      {editingPage.active ? 'ظاهرة (نشطة)' : 'مخفية (مسودة)'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">اسم الصفحة (للعرض في الإدارة)</label>
                    <input 
                      type="text"
                      value={editingPage.title}
                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                      className="w-full bg-surface-container-low border ghost-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">الرابط البديل (Slug)</label>
                    <input 
                      type="text"
                      value={editingPage.slug}
                      onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\u0600-\u06FF\-]/g, '') })}
                      className="w-full bg-surface-container-low border ghost-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">موقع الصفحة</label>
                    <select 
                      value={editingPage.location}
                      onChange={(e) => setEditingPage({ ...editingPage, location: e.target.value as any })}
                      className="w-full bg-surface-container-low border ghost-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                    >
                      <option value="header">الرأس (Navigation)</option>
                      <option value="body">الجسم (Page Sections)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">الترتيب</label>
                    <input 
                      type="number"
                      value={editingPage.order || 0}
                      onChange={(e) => setEditingPage({ ...editingPage, order: Number(e.target.value) })}
                      className="w-full bg-surface-container-low border ghost-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>

                <h4 className="font-black text-primary flex items-center gap-2 pt-4">
                  <div className="w-2 h-8 bg-primary rounded-full"></div>
                  قسم الواجهة (Hero)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">العنوان الرئيسي</label>
                    <input 
                      type="text"
                      value={editingPage.content?.hero?.title || ''}
                      onChange={(e) => setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, hero: { ...editingPage.content?.hero, title: e.target.value } }
                      })}
                      className="w-full bg-surface-container-low border ghost-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">إدراج صورة</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'edit')}
                        className="hidden"
                        id="hero-image-upload"
                      />
                        <label 
                          htmlFor="hero-image-upload"
                          className="flex-1 bg-surface-container-low border ghost-border rounded-xl px-4 py-3 cursor-pointer hover:bg-surface-container-high transition-all flex items-center justify-between"
                        >
                          <span className="text-xs text-on-surface-variant">
                            {editingPage.content?.hero?.image ? 'تم إدراج صورة' : 'اختر ملف صورة...'}
                          </span>
                          <Layout size={18} className="text-primary" />
                        </label>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">الوصف الفرعي</label>
                    <textarea 
                      rows={3}
                      value={editingPage.content?.hero?.sub || ''}
                      onChange={(e) => setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, hero: { ...editingPage.content?.hero, sub: e.target.value } }
                      })}
                      className="w-full bg-surface-container-low border ghost-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    />
                  </div>
                  {editingPage.content?.hero?.image && (
                    <div className="md:col-span-2">
                      <img 
                        src={editingPage.content.hero.image} 
                        alt="Preview" 
                        className="w-full max-h-48 object-cover rounded-2xl border ghost-border"
                      />
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-on-surface-variant mb-2">محتوى الصفحة (اختياري)</label>
                    <textarea 
                      rows={10}
                      value={editingPage.content?.body || ''}
                      onChange={(e) => setEditingPage({
                        ...editingPage,
                        content: { ...editingPage.content, body: e.target.value }
                      })}
                      placeholder="اكتب محتوى الصفحة هنا..."
                      className="w-full bg-surface-container-low border ghost-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Sections (Example) */}
              <div className="pt-8 border-t border-outline-variant/10">
                <div className="flex justify-between items-center mb-6">
                   <h4 className="font-black text-on-surface">أقسام إضافية</h4>
                   <button className="flex items-center gap-2 text-xs font-bold bg-primary/10 text-primary px-4 py-2 rounded-xl hover:bg-primary/20 transition-all">
                     <Plus size={14} /> إضافة قسم جديد
                   </button>
                </div>
                <div className="text-center py-12 border-2 border-dashed ghost-border rounded-3xl bg-surface-container-low">
                   <p className="text-on-surface-variant text-sm">سيتم إضافة دعم محرر الأقسام المتقدم قريباً...</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-surface-container-low border-t ghost-border flex justify-end gap-4">
              <button 
                onClick={() => setEditingPage(null)}
                className="px-6 py-2.5 rounded-xl font-bold bg-surface-container-highest text-on-surface-variant hover:text-on-surface transition-all"
              >
                إلغاء
              </button>
              <button 
                onClick={handleSavePageContent}
                disabled={isSaving}
                className="px-8 py-2.5 tech-gradient text-on-primary-container rounded-xl font-black shadow-lg shadow-primary/10 flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                حفظ التغييرات
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add New Page Modal */}
      <AnimatePresence>
        {isAddingPage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAddingPage(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-surface rounded-3xl shadow-2xl p-8"
              dir="rtl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">إضافة صفحة جديدة</h3>
                <button onClick={() => setIsAddingPage(false)} className="p-2 hover:bg-surface-container-high rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreatePage} className="space-y-6">
                <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-on-surface-variant">عنوان الصفحة</label>
                     <input 
                       required
                       type="text"
                       value={newPageData.title}
                       onChange={e => setNewPageData({...newPageData, title: e.target.value})}
                       placeholder="مثال: من نحن"
                       className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-sm font-bold text-on-surface-variant">الرابط (Slug) - اختياري</label>
                     <input 
                       type="text"
                       value={newPageData.slug}
                       onChange={e => setNewPageData({...newPageData, slug: e.target.value})}
                       placeholder="مثال: about"
                       className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-left"
                       dir="ltr"
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-sm font-bold text-on-surface-variant">إدراج صورة العرض</label>
                     <div className="flex items-center gap-4">
                       <input 
                         type="file"
                         accept="image/*"
                         onChange={(e) => handleFileChange(e, 'new')}
                         className="hidden"
                         id="new-hero-image-upload"
                       />
                       <label 
                         htmlFor="new-hero-image-upload"
                         className="flex-1 bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 cursor-pointer hover:bg-surface-container-high transition-all flex items-center justify-between"
                       >
                         <span className="text-sm text-on-surface-variant truncate">
                           {(newPageData as any).heroImage ? 'تم إدراج صورة بنجاح' : 'اختر صورة للواجهة...'}
                         </span>
                         <Layout size={20} className="text-primary" />
                       </label>
                     </div>
                     {(newPageData as any).heroImage && (
                        <div className="mt-2 rounded-xl overflow-hidden border ghost-border h-24">
                           <img src={(newPageData as any).heroImage} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                     )}
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-on-surface-variant">موقع الصفحة</label>
                       <select 
                         value={newPageData.location}
                         onChange={e => setNewPageData({...newPageData, location: e.target.value as any})}
                         className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                       >
                         <option value="header">الرأس (Navigation)</option>
                         <option value="body">الجسم (Page Sections)</option>
                       </select>
                     </div>
                     <div className="space-y-2">
                       <label className="text-sm font-bold text-on-surface-variant">الترتيب</label>
                       <input 
                         type="number"
                         value={newPageData.order}
                         onChange={e => setNewPageData({...newPageData, order: Number(e.target.value)})}
                         className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none"
                       />
                     </div>
                   </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-4 tech-gradient text-on-primary-container rounded-2xl font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                  <span>إنشاء الصفحة</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Save Button Indicator (only if active tab has its own internal save) */}
      {editingPage && (
        <button 
          onClick={handleSavePageContent}
          disabled={isSaving}
          className={`fixed bottom-8 left-8 w-14 h-14 tech-gradient text-on-primary-container rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[110] ${isSaving ? 'opacity-50' : ''}`}
        >
          <Save size={24} className={isSaving ? 'animate-spin' : ''} />
        </button>
      )}
    </div>
  );
}

