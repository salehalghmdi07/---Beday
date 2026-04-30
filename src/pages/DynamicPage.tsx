import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Logo from '../components/Logo';
import { Loader2, ArrowRight, Share2, Mail } from 'lucide-react';

export default function DynamicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [siteConfig, setSiteConfig] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;

    // Clean current slug from params
    const cleanSlug = slug.replace(/^\/+|\/+$/g, '');

    // Search for pages that match the cleaned slug
    // We try multiple variants to be compatible with legacy data
    const q = query(collection(db, 'pages'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const foundPage = docs.find((p: any) => {
        const pSlug = (p.slug || '').replace(/^\/+|\/+$/g, '');
        return pSlug === cleanSlug;
      });

      if (foundPage) {
        if (foundPage.active) {
          setPage(foundPage);
        } else {
          setPage(null);
        }
      } else {
        setPage(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore error in DynamicPage:", error);
      setLoading(false);
    });

    const unsubscribeConfig = onSnapshot(doc(db, 'site_config', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        setSiteConfig(snapshot.data());
      }
    });

    return () => {
      unsubscribe();
      unsubscribeConfig();
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-8 text-center">
        <h1 className="text-9xl font-black text-primary/10 mb-4 tracking-tighter">404</h1>
        <h2 className="text-3xl font-bold mb-4">عذراً، الصفحة غير موجودة</h2>
        <p className="text-on-surface-variant mb-8 max-w-md">ربما تم حذف الصفحة أو أن الرابط الذي اتبعته غير صحيح.</p>
        <Link to="/" className="px-8 py-3 tech-gradient text-on-primary-container rounded-2xl font-bold shadow-xl active:scale-95 transition-transform flex items-center gap-2">
          <ArrowRight size={20} />
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b ghost-border">
        <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
          <Logo size={40} />
          <Link to="/" className="text-on-surface-variant hover:text-primary font-bold transition-colors">الرئيسية</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-20 px-8 relative overflow-hidden">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10"></div>
         <div className="max-w-4xl mx-auto text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black mb-6"
            >
              {page.content?.hero?.title || page.title}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-on-surface-variant leading-relaxed mb-12"
            >
              {page.content?.hero?.sub}
            </motion.p>

            {page.content?.hero?.image && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative mx-auto mt-12 max-w-5xl"
              >
                {/* Visual accents behind the image */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-transparent blur-2xl rounded-[3rem] -z-10"></div>
                <div className="absolute -inset-4 bg-gradient-to-bl from-secondary/10 to-transparent blur-3xl rounded-[3rem] -z-10 scale-95"></div>
                
                <div className="rounded-[2rem] overflow-hidden border ghost-border shadow-2xl bg-surface-container-low">
                  <img 
                    src={page.content.hero.image} 
                    alt={page.title}
                    className="w-full aspect-[16/9] object-cover hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>
            )}
         </div>
      </section>

      {/* Page Body Content */}
      {page.content?.body && (
        <section className="py-20 px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="glass-panel p-8 md:p-12 rounded-[2.5rem] border ghost-border shadow-xl text-on-surface whitespace-pre-wrap leading-relaxed text-lg text-right"
            >
              {page.content.body}
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-surface-container-lowest py-12 border-t ghost-border mt-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Logo size={32} />
            <p className="text-sm text-on-surface-variant max-w-xs text-center md:text-right">
              {siteConfig?.footerText || `نحن في بدايتك نصمم ونطور الحلول البرمجية التي تقود مستقبل الشركات في العصر الرقمي.`}
            </p>
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
            <p className="text-sm text-on-surface-variant">جميع الحقوق محفوظة لموقع بدايتك © {new Date().getFullYear()}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
