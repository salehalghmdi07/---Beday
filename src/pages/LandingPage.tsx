import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { 
  Globe, 
  Smartphone, 
  Settings2, 
  ArrowLeft,
  Mail,
  Share2,
  CheckCircle2,
  Loader2,
  Zap,
  ShieldCheck,
  Headphones,
  FileText,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Logo from '../components/Logo';

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  link?: string;
}

export default function LandingPage() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<any[]>([]);
  const [siteConfig, setSiteConfig] = useState<any>(null);

  useEffect(() => {
    // Portfolio
    const q = query(collection(db, 'portfolio'), orderBy('order', 'asc'));
    const unsubscribePortfolio = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PortfolioItem[];
      setPortfolioItems(data);
    });

    // Dynamic Pages
    const qPages = query(collection(db, 'pages'));
    const unsubscribePages = onSnapshot(qPages, (snapshot) => {
      const allPages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      setPages(allPages);
      setLoading(false);
    });

    // Site Config
    const unsubscribeConfig = onSnapshot(doc(db, 'site_config', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        setSiteConfig(snapshot.data());
      }
    });

    return () => {
      unsubscribePortfolio();
      unsubscribePages();
      unsubscribeConfig();
    };
  }, []);

  const homePage = pages.find(p => p.slug === '/' || p.slug === '' || p.slug === 'home');
  const headerPages = pages.filter(p => p.location === 'header' && p.active && p.slug !== '/' && p.slug !== '' && p.slug !== 'home');
  const bodyPages = pages.filter(p => p.location === 'body' && p.active);

  const heroContent = homePage?.content?.hero || {
    title: "أطلب موقعك أو تطبيقك بأفضل الأسعار.",
    sub: "نموذج ذكي، تسعير تقديري فوري، وبناء احترافي. نجمع بين السرعة والإتقان",
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80"
  };

  const [activeTab, setActiveTab] = useState('home');

  const navItems = [
    { id: 'home', label: 'الرئيسية', href: '#' },
    { id: 'services', label: 'خدماتنا', href: '#services' },
    { id: 'portfolio', label: 'أعمالنا', href: '#portfolio' },
    ...headerPages.map(p => {
      const cleanSlug = p.slug.replace(/^\/+|\/+$/g, '');
      return {
        id: p.id,
        label: p.title,
        href: `/p/${cleanSlug}`
      };
    })
  ];

  // Helper to find dynamic page link
  const getPageLink = (slug: string) => {
    const page = pages.find(p => p.slug.replace(/^\/+|\/+$/g, '') === slug.replace(/^\/+|\/+$/g, ''));
    if (page) return `/p/${page.slug.replace(/^\/+|\/+$/g, '')}`;
    return `/p/${slug}`;
  };

  return (
    <div className="min-h-screen bg-surface selection:bg-primary/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b ghost-border">
        <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Logo size={40} />
            <div className="hidden md:flex gap-4">
              {navItems.map((item) => (
                <div key={item.id} className="relative px-3 py-2">
                  {item.href.startsWith('/') ? (
                    <Link
                      to={item.href}
                      onClick={() => setActiveTab(item.id)}
                      className={`text-lg font-bold transition-colors ${
                        activeTab === item.id ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      onClick={() => setActiveTab(item.id)}
                      className={`text-lg font-bold transition-colors ${
                        activeTab === item.id ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {item.label}
                    </a>
                  )}
                  {activeTab === item.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              to="/request" 
              className="px-6 py-2.5 rounded-xl tech-gradient text-on-primary-container font-bold text-sm active:scale-95 transform transition-transform shadow-lg shadow-primary/20"
            >
              أطلب موقعك الآن
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 px-8 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-container/10 rounded-full blur-[100px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center flex flex-col items-center"
          >
            <h1 className="text-4xl lg:text-6xl font-black font-headline leading-[1.3] mb-10 text-on-surface whitespace-pre-line tracking-tight">
              {"أطلب موقعـك\nأو تطبيقـك\nبأفضـل الأسعـار"}
            </h1>
            <p className="text-xl text-on-surface-variant max-w-xl leading-relaxed mx-auto">
              {heroContent.sub.includes('. ') ? (
                <>
                  {heroContent.sub.split('. ')[0]}.
                  <br />
                  {heroContent.sub.split('. ')[1]}
                </>
              ) : heroContent.sub}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden glass-panel p-4 border ghost-border shadow-2xl">
              <img 
                src={heroContent.image} 
                alt="App Mockup" 
                className="rounded-2xl w-full h-auto"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -top-6 -right-6 p-6 glass-panel rounded-2xl border ghost-border hidden md:block">
                <Zap className="text-primary mb-2" size={32} />
                <div className="text-xs font-bold text-on-surface-variant">تسعير فوري</div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-3xl -z-10 scale-110"></div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-8 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-headline mb-4">خدماتنا</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">نستخدم أحدث التقنيات لنضمن لك أداءً فائقاً وتجربة مستخدم لا تُنسى</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Globe size={32} />, title: "تصميم المواقع", desc: "مواقع ويب تفاعلية سريعة الاستجابة، مصممة خصيصاً لتعكس هوية علامتك التجارية وتجذب عملائك بفعالية." },
              { icon: <Smartphone size={32} />, title: "تطوير التطبيقات", desc: "بناء تطبيقات هواتف ذكية (iOS & Android) قوية، آمنة، وسهلة الاستخدام باستخدام أحدث أطر العمل العالمية." },
              { icon: <Settings2 size={32} />, title: "حلول تقنية مخصصة", desc: "حلول برمجية متكاملة مصممة لحل تحدياتك التقنية الفريدة وتحسين كفاءة عملياتك الرقمية." }
            ].map((service, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-3xl bg-surface-container-high hover:bg-surface-container-highest transition-all duration-500 border ghost-border hover:border-primary/30 flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 mb-6 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold font-headline mb-4">{service.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Trust Us Section */}
      <section className="py-24 px-8 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-headline mb-4">لماذا تثق بنا؟</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: <FileText size={40} />, 
                title: "عقد رسمي", 
                desc: "ضمان قانوني لحقوقك" 
              },
              { 
                icon: <ShieldCheck size={40} />, 
                title: "جودة مضمونة", 
                desc: "أكواد نظيفة وتصميم عصري" 
              },
              { 
                icon: <Headphones size={40} />, 
                title: "دعم فني مستمر", 
                desc: "متوفر 7 أيام أسبوعياً" 
              },
              { 
                icon: <Zap size={40} />, 
                title: "تسليم سريع", 
                desc: "التزام تام بالمواعيد" 
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-surface rounded-3xl p-8 border ghost-border shadow-lg hover:shadow-primary/5 transition-all text-center group"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold font-headline mb-2">{item.title}</h3>
                <p className="text-sm text-on-surface-variant">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black font-headline mb-4">أعمالنا</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">نفتخر بتقديم حلول رقمية متميزة لعملائنا، إليك بعض من مشاريعنا الأخيرة</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-on-surface-variant font-bold">جاري تحميل أعمالنا...</p>
              </div>
            ) : portfolioItems.length > 0 ? (
              portfolioItems.map((project, i) => (
                <motion.div 
                   key={project.id}
                   initial={{ opacity: 0, scale: 0.95 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   transition={{ delay: i * 0.1 }}
                   viewport={{ once: true }}
                   className="group relative rounded-3xl overflow-hidden border ghost-border bg-surface shadow-lg"
                 >
                   <div className="aspect-video relative">
                     <img 
                       src={project.image} 
                       alt={project.title} 
                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                       referrerPolicy="no-referrer"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-surface/40 to-transparent"></div>
                   </div>
                   <div className="absolute bottom-4 right-4 left-4">
                     <div className="glass-panel p-4 rounded-2xl border ghost-border shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 text-right backdrop-blur-md bg-surface/90">
                       <span className="text-[10px] font-black text-primary mb-1.5 block uppercase tracking-widest">{project.category}</span>
                       <div className="flex items-center justify-between gap-4">
                         <h4 className="text-base font-bold text-on-surface">{project.title}</h4>
                         {project.link && (
                           <a 
                             href={project.link} 
                             target="_blank" 
                             rel="noreferrer"
                             className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-on-primary-container transition-all"
                             onClick={(e) => e.stopPropagation()}
                           >
                             {/* ExternalLink icon not imported in LandingPage currently, checking imports... Wait, I should import it if it's not there */}
                             {/* I saw ExternalLink was missing in imports of LandingPage.tsx previously, I'll add it to imports later or use it here if I imported it */}
                             {/* Checking imports: lines 1-20 in LandingPage.tsx didn't have ExternalLink */}
                             <ExternalLink size={16} />
                           </a>
                         )}
                       </div>
                     </div>
                   </div>
                 </motion.div>
               ))
            ) : (
              [
                { id: '1', title: "منصة إي-كوميرس", category: "موقع إلكتروني", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" },
                { id: '2', title: "تطبيق فيتنس", category: "تطبيق جوال", image: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=800&q=80" },
                { id: '3', title: "نظام إدارة عقارات", category: "نظام سحابي", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80" }
              ].map((project, i) => (
                <motion.div 
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative rounded-3xl overflow-hidden border ghost-border bg-surface shadow-lg"
                >
                  <div className="aspect-video relative">
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface/40 to-transparent"></div>
                  </div>
                  <div className="absolute bottom-4 right-4 left-4">
                    <div className="glass-panel p-4 rounded-2xl border ghost-border shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 text-right backdrop-blur-md bg-surface/90">
                      <span className="text-[10px] font-black text-primary mb-1.5 block uppercase tracking-widest">{project.category}</span>
                      <h4 className="text-base font-bold text-on-surface">{project.title}</h4>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          <div className="mt-16 text-center">
            <Link 
              to="/request" 
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl tech-gradient text-on-primary-container font-bold text-lg active:scale-95 transform transition-transform shadow-xl shadow-primary/20"
            >
              ابدأ مشروعك معنا
              <ArrowLeft size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Body Sections */}
      {bodyPages.map((page, i) => (
        <section 
          key={page.id} 
          className={`py-24 px-8 ${i % 2 === 0 ? 'bg-surface-container-low' : 'bg-surface-container-lowest'}`}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className={`${i % 2 === 0 ? 'order-1' : 'order-2'}`}>
                <h2 className="text-4xl font-black font-headline mb-6 text-on-surface">{page.content?.hero?.title || page.title}</h2>
                <p className="text-xl text-on-surface-variant leading-relaxed whitespace-pre-line mb-8">
                  {page.content?.hero?.sub}
                </p>
                {page.content?.body && (
                  <div className="text-on-surface-variant leading-relaxed whitespace-pre-line">
                    {page.content.body}
                  </div>
                )}
                <div className="mt-10">
                  <Link 
                    to={`/p/${page.slug.replace(/^\/+|\/+$/g, '')}`}
                    className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                  >
                    عرض الصفحة كاملة <ArrowLeft size={18} />
                  </Link>
                </div>
              </div>
              
              <div className={`${i % 2 === 0 ? 'order-2' : 'order-1'}`}>
                {page.content?.hero?.image && (
                  <div className="rounded-3xl overflow-hidden shadow-2xl border ghost-border group">
                    <img 
                      src={page.content.hero.image} 
                      alt={page.title}
                      className="w-full h-auto group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      {/* Footer */}
      <footer className="bg-surface-container-lowest py-12 border-t ghost-border">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Logo size={32} />
            <p className="text-sm text-on-surface-variant max-w-xs text-center md:text-right">
              {siteConfig?.footerText || `نحن في بدايتك نصمم ونطور الحلول البرمجية التي تقود مستقبل الشركات في العصر الرقمي.`}
            </p>
          </div>
          <div className="flex gap-8">
            <Link to={getPageLink('privacy')} className="text-sm text-on-surface-variant hover:text-primary transition-colors">الشروط والخصوصية</Link>
            <Link to={getPageLink('about')} className="text-sm text-on-surface-variant hover:text-primary transition-colors">من نحن</Link>
          </div>
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex gap-4">
              <Share2 className="text-primary cursor-pointer hover:scale-110 transition-transform" size={20} />
              {siteConfig?.contactEmail && (
                <a href={`mailto:${siteConfig.contactEmail}`}>
                  <Mail className="text-primary cursor-pointer hover:scale-110 transition-transform" size={20} />
                </a>
              )}
            </div>
            <p className="text-sm text-on-surface-variant">
              جميع الحقوق محفوظة لموقع بدايــــ تك © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

