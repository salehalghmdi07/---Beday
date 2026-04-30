import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Plus, 
  Globe, 
  Smartphone, 
  ShoppingBag, 
  Cpu,
  Edit,
  Trash2,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Zap,
  ShieldCheck,
  AlertTriangle,
  X,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ServicesManagement() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [services, setServices] = useState([
    { id: 1, icon: <Globe size={20} />, title: "تطوير المواقع الإلكترونية", category: "Web Development", price: "4,500 SAR", status: "مفعل", deliveryTime: "5-10 أيام" },
    { id: 2, icon: <Smartphone size={20} />, title: "تطبيقات الجوال (iOS/Android)", category: "Mobile Apps", price: "12,000 SAR", status: "مفعل", deliveryTime: "15-30 يوم" },
    { id: 3, icon: <ShoppingBag size={20} />, title: "المتاجر الإلكترونية", category: "E-Commerce", price: "7,800 SAR", status: "معطل", deliveryTime: "7-14 يوم" },
    { id: 4, icon: <Cpu size={20} />, title: "تكامل الأنظمة البرمجية", category: "Solutions", price: "5,200 SAR", status: "مفعل", deliveryTime: "3-7 أيام" }
  ]);

  const handleDelete = (id: number) => {
    setServices(services.filter(s => s.id !== id));
    setShowDeleteConfirm(null);
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

      {/* Header */}
      <header className="flex flex-col md:flex-row-reverse md:items-center justify-between gap-6">
        <div className="text-right">
          <h1 className="text-3xl font-black text-on-surface font-headline">الخدمات والأسعار</h1>
          <p className="text-on-surface-variant">إدارة قائمة الخدمات التقنية وتحديد التسعير التقديري لكل منها</p>
        </div>
        <button className="tech-gradient text-on-primary-container px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/10 active:scale-95 transition-all">
          <Plus size={20} />
          <span>إضافة خدمة جديدة</span>
        </button>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: <Zap size={24} />, label: "الخدمات النشطة", value: "12", color: "text-primary" },
          { icon: <DollarSign size={24} />, label: "متوسط سعر المشروع", value: "SAR 8.5k", color: "text-secondary" },
          { icon: <ShieldCheck size={24} />, label: "الخدمات الموثقة", value: "100%", color: "text-green-400" }
        ].map((stat, i) => (
          <div key={i} className="bg-surface-container-low p-6 rounded-2xl border ghost-border flex items-center gap-4">
            <div className={`p-4 bg-primary/10 rounded-2xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">{stat.label}</p>
              <h3 className="text-2xl font-black text-on-surface">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Services Table */}
      <div className="bg-surface-container-low rounded-2xl border ghost-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-surface-container-high/50 text-on-surface-variant text-sm font-bold">
                <th className="px-6 py-4">الخدمة</th>
                <th className="px-6 py-4 text-center">التصنيف</th>
                <th className="px-6 py-4 text-center">السعر التقديري</th>
                <th className="px-6 py-4 text-center">وقت التسليم</th>
                <th className="px-6 py-4 text-center">الحالة</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-surface-container-high/20 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary-container/30 flex items-center justify-center text-primary">
                        {service.icon}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{service.title}</p>
                        <p className="text-xs text-on-surface-variant">تحديث: منذ يومين</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-xs font-bold text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded-md">{service.category}</span>
                  </td>
                  <td className="px-6 py-5 text-center font-mono text-primary font-bold">{service.price}</td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant">
                      <Clock size={14} className="text-primary" />
                      <span>{service.deliveryTime}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      service.status === 'مفعل' ? 'bg-green-500/10 text-green-400' : 'bg-surface-container-highest text-on-surface-variant'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${service.status === 'مفعل' ? 'bg-green-400' : 'bg-on-surface-variant'}`}></span>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-primary transition-all">
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => setShowDeleteConfirm(service.id)}
                        className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-error transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-surface-container/30 flex justify-between items-center text-sm">
          <span className="text-on-surface-variant">عرض 1-4 من أصل 12 خدمة</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded bg-surface-container-highest border ghost-border text-on-surface-variant hover:text-primary disabled:opacity-50" disabled>
              <ChevronRight size={16} />
            </button>
            <button className="px-3 py-1 rounded bg-primary text-on-primary-container font-bold">1</button>
            <button className="px-3 py-1 rounded bg-surface-container-highest border ghost-border text-on-surface-variant hover:text-primary">2</button>
            <button className="px-3 py-1 rounded bg-surface-container-highest border ghost-border text-on-surface-variant hover:text-primary">
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface-container-low border ghost-border rounded-3xl p-8 max-w-md w-full relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="p-2 hover:bg-surface-container-highest rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="flex items-center gap-3 text-error">
                  <AlertTriangle size={24} />
                  <h3 className="text-xl font-black">تأكيد الحذف</h3>
                </div>
              </div>
              
              <p className="text-on-surface-variant text-right mb-8 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف هذه الخدمة؟ هذا الإجراء لا يمكن التراجع عنه وسيتم إزالة كافة البيانات المرتبطة بها.
              </p>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-xl bg-surface-container-highest font-bold hover:bg-surface-container-high transition-all"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 py-3 rounded-xl bg-error text-on-error font-bold hover:bg-error/90 transition-all shadow-lg shadow-error/20"
                >
                  تأكيد الحذف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
