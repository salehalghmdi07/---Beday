import { motion } from 'motion/react';
import { 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  Scale, 
  Globe, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-surface-container-lowest py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="text-center space-y-4 mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold hover:underline mb-4">
            <ArrowRight size={18} />
            العودة للرئيسية
          </Link>
          <h1 className="text-4xl md:text-5xl font-black font-headline text-on-surface">سياسة الخصوصية وشروط الاستخدام</h1>
          <p className="text-on-surface-variant max-w-2xl mx-auto">نحن في <span className="brand-text"><span className="brand-black">بدايــــ</span> <span className="brand-color">تك</span></span> نلتزم بحماية بياناتك وضمان تجربة رقمية آمنة وشفافة لجميع عملائنا.</p>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Content Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 bg-surface-container-low rounded-3xl p-8 md:p-10 border ghost-border shadow-xl space-y-8"
          >
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Shield size={24} />
                <h2 className="text-2xl font-bold font-headline">1. جمع المعلومات</h2>
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند طلب مشروع أو التواصل معنا، بما في ذلك الاسم، البريد الإلكتروني، رقم الهاتف، وتفاصيل المشروع التقنية. نستخدم هذه البيانات فقط لتقديم خدماتنا وتحسين تجربتك.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Lock size={24} />
                <h2 className="text-2xl font-bold font-headline">2. حماية البيانات</h2>
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                نطبق معايير أمنية تقنية وإدارية صارمة لحماية بياناتك من الوصول غير المصرح به أو التغيير أو الإفصاح. يتم تشفير جميع البيانات الحساسة باستخدام بروتوكولات SSL المتقدمة.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-primary mb-2">
                <Scale size={24} />
                <h2 className="text-2xl font-bold font-headline">3. حقوق الملكية الفكرية</h2>
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                جميع الأكواد البرمجية والتصاميم التي يتم تطويرها لعملائنا تخضع لاتفاقيات ملكية محددة يتم توقيعها عند بدء المشروع، مع احتفاظ <span className="brand-text"><span className="brand-black">بدايــــ</span> <span className="brand-color">تك</span></span> بحقوق الملكية الفكرية للأدوات والمكتبات البرمجية الخاصة بها.
              </p>
            </section>
          </motion.div>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-primary/5 rounded-3xl p-8 border border-primary/20"
            >
              <FileText className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">تحديثات السياسة</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">آخر تحديث: 24 مارس 2024. نحتفظ بالحق في تعديل هذه السياسة في أي وقت، وسيتم إخطار العملاء النشطين بأي تغييرات جوهرية.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface-container-high rounded-3xl p-8 border ghost-border"
            >
              <Globe className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-bold mb-3">ملفات تعريف الارتباط</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">نستخدم ملفات تعريف الارتباط (Cookies) لتحليل حركة المرور على الموقع وتحسين الأداء. يمكنك تعطيلها من إعدادات متصفحك.</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="tech-gradient rounded-3xl p-8 text-on-primary-container shadow-lg shadow-primary/20"
            >
              <h3 className="text-xl font-black mb-3">لديك استفسار؟</h3>
              <p className="text-sm font-medium mb-6 opacity-90">فريقنا القانوني والتقني جاهز للإجابة على أي تساؤلات تتعلق بخصوصيتك.</p>
              <button className="w-full py-3 bg-white/20 backdrop-blur-md rounded-xl font-bold text-sm hover:bg-white/30 transition-all">تواصل معنا</button>
            </motion.div>
          </div>
        </div>

        {/* Footer Info */}
        <footer className="pt-12 text-center border-t ghost-border">
          <p className="text-xs text-on-surface-variant">جميع الحقوق محفوظة لموقع بدايــــ تك © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}
