import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Download,
  Calendar,
  User,
  ArrowRight,
  Printer,
  Edit3,
  X,
  FileText,
  ChevronDown,
  Loader2,
  Trash2,
  DollarSign,
  ClipboardList,
  CheckCircle,
  Tag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  updateDoc,
  doc,
  deleteDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export default function OrdersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [changingStatusOrder, setChangingStatusOrder] = useState<any>(null);
  const [pricingOrder, setPricingOrder] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const ordersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersList);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        try {
          handleFirestoreError(error, OperationType.LIST, 'orders');
        } catch (e) {
          console.error("Firestore loading error:", e);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredOrders = useMemo(() => {
    let result = orders.filter(order => 
      (order.name || order.customer || '').includes(searchQuery) || 
      order.id.includes(searchQuery) ||
      (order.service || '').includes(searchQuery)
    );

    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    return result;
  }, [searchQuery, statusFilter, orders]);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'قيد المراجعة' || o.status === 'بانتظار المراجعة').length,
    inProgress: orders.filter(o => o.status === 'جاري العمل على المشروع').length,
    completed: orders.filter(o => o.status === 'تم الانتهاء والتسليم' || o.status === 'منتهي').length,
  };

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus
      });
      setChangingStatusOrder(null);
      setOpenMenuId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
      alert('حدث خطأ أثناء تحديث حالة الطلب.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricingOrder) return;

    setIsSaving(true);
    try {
      // Calculate total price from installments
      const installments = pricingOrder.installments || [];
      const total = installments.reduce((acc: number, curr: any) => acc + (parseFloat(curr.amount) || 0), 0);

      await updateDoc(doc(db, 'orders', pricingOrder.id), {
        installments: pricingOrder.installments,
        totalPrice: total,
        installmentCount: pricingOrder.installmentCount || 1
      });
      setPricingOrder(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${pricingOrder.id}`);
      alert('حدث خطأ أثناء تحديث سعر المشروع.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `orders/${id}`);
    }
  };

  const handleInstallmentChange = (count: number) => {
    const currentInstallments = pricingOrder.installments || [];
    let newInstallments = [...currentInstallments];

    if (count > newInstallments.length) {
      // Add more
      for (let i = newInstallments.length; i < count; i++) {
        newInstallments.push({ name: `الدفعة ${i + 1}`, amount: '', dueDate: '' });
      }
    } else {
      // Remove
      newInstallments = newInstallments.slice(0, count);
    }

    setPricingOrder({ ...pricingOrder, installmentCount: count, installments: newInstallments });
  };

  const toggleListItem = (list: string[] | undefined, item: string) => {
    const currentList = list || [];
    return currentList.includes(item) ? currentList.filter(i => i !== item) : [...currentList, item];
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-40 gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-on-surface-variant font-bold">جاري تحميل بيانات الطلبات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div className="flex justify-start print:hidden">
        <Link to="/" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm">
          <ArrowRight size={18} />
          <span>العودة للرئيسية</span>
        </Link>
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row-reverse md:items-center justify-between gap-6 print:hidden">
        <div className="text-right">
          <h1 className="text-3xl font-black text-on-surface font-headline">إدارة الطلبات</h1>
          <p className="text-on-surface-variant">تتبع حالة المشاريع والطلبات الواردة من العملاء</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-low border ghost-border px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-surface-container-high transition-colors">
            <Download size={18} />
            <span>تصدير التقرير</span>
          </button>
          <button className="tech-gradient text-on-primary-container px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary/10">
            تحديث البيانات
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:hidden">
        {[
          { icon: <ShoppingCart size={20} />, label: "إجمالي الطلبات", value: stats.total, color: "text-primary" },
          { icon: <Clock size={20} />, label: "قيد المراجعة", value: stats.pending, color: "text-secondary" },
          { icon: <Loader2 size={20} className="animate-spin-slow" />, label: "جاري العمل", value: stats.inProgress, color: "text-blue-400" },
          { icon: <CheckCircle2 size={20} />, label: "مشاريع منتهية", value: stats.completed, color: "text-green-400" }
        ].map((stat, i) => (
          <div key={i} className="bg-surface-container-low p-5 rounded-2xl border ghost-border">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 bg-primary/5 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-xs text-on-surface-variant font-medium">{stat.label}</span>
            </div>
            <h3 className="text-2xl font-black text-on-surface">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-low p-4 rounded-2xl border ghost-border flex flex-col md:flex-row-reverse gap-4 items-center justify-between print:hidden">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input 
            type="text" 
            placeholder="بحث برقم الطلب أو العميل..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-highest border-none rounded-xl py-2 px-10 text-right text-sm focus:ring-2 focus:ring-primary/30 outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto flex-row-reverse">
          <div className="relative group">
            <button className="px-4 py-2 bg-surface-container-highest rounded-xl text-xs font-bold flex items-center justify-center gap-2 min-w-[120px]">
              <Filter size={14} />
              <span>{statusFilter === 'all' ? 'كل الحالات' : statusFilter}</span>
              <ChevronDown size={14} />
            </button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container-high border ghost-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 p-2 space-y-1">
              {[
                'all', 
                'قيد المراجعة',
                'جاري العمل على المشروع',
                'تم الانتهاء والتسليم',
                'متوقف حالياً',
                'فسخ عقد',
                'منتهي'
              ].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`w-full text-right px-4 py-2 rounded-lg text-xs font-bold transition-colors ${statusFilter === s ? 'bg-primary text-on-primary-container' : 'hover:bg-surface-variant text-on-surface'}`}
                >
                  {s === 'all' ? 'الكل' : s}
                </button>
              ))}
            </div>
          </div>
          <button className="flex-1 md:flex-none px-4 py-2 bg-surface-container-highest rounded-xl text-xs font-bold flex items-center justify-center gap-2">
            <Calendar size={14} />
            <span>التاريخ</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-container-low rounded-2xl border ghost-border overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-surface-container-high/50 text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">رقم الطلب</th>
                <th className="px-6 py-4">العميل</th>
                <th className="px-6 py-4">الخدمة</th>
                <th className="px-6 py-4">سعر المشروع</th>
                <th className="px-6 py-4 text-center">الصفحات</th>
                <th className="px-6 py-4 text-center">المدة</th>
                <th className="px-6 py-4 text-center">الحالة</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredOrders.map((order, i) => (
                <tr key={i} className="hover:bg-surface-container-high/20 transition-colors">
                  <td className="px-6 py-5 font-mono text-sm text-primary font-bold">{order.id}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                        <User size={14} />
                      </div>
                      <span className="font-bold text-sm">{order.name || order.customer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">{order.projectTypes?.join('، ') || order.service}</td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-black text-on-surface">
                      {order.totalPrice ? `${parseFloat(order.totalPrice).toLocaleString()} ر.س` : 'لم يحدد'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center font-bold text-sm">{order.pages?.length || 0}</td>
                  <td className="px-6 py-5 text-center font-bold text-sm">{order.deadline || order.timeline}</td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        order.status === 'جاري العمل على المشروع' ? 'bg-blue-500/10 text-blue-400' :
                        (order.status === 'تم الانتهاء والتسليم' || order.status === 'منتهي') ? 'bg-green-500/10 text-green-400' :
                        order.status === 'فسخ عقد' ? 'bg-error/10 text-error' :
                        order.status === 'متوقف حالياً' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-secondary-container/30 text-secondary'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-left relative">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingOrder(order)}
                        className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-primary transition-all"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                        className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {openMenuId === order.id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute left-6 top-12 w-52 bg-surface-container-high border ghost-border rounded-xl shadow-2xl z-40 p-2">
                            <button 
                              onClick={() => { setEditingOrder(order); setOpenMenuId(null); }}
                              className="w-full flex items-center justify-end gap-3 px-3 py-2 rounded-lg hover:bg-surface-variant text-sm font-bold text-on-surface transition-colors"
                            >
                              <span>تعديل الطلب</span>
                              <Edit3 size={16} className="text-on-surface-variant" />
                            </button>
                            <button 
                              onClick={() => { setChangingStatusOrder(order); setOpenMenuId(null); }}
                              className="w-full flex items-center justify-end gap-3 px-3 py-2 rounded-lg hover:bg-surface-variant text-sm font-bold text-on-surface transition-colors"
                            >
                              <span>تغيير الحالة</span>
                              <Tag size={16} className="text-on-surface-variant" />
                            </button>
                            <button 
                              onClick={() => { setPricingOrder(order); setOpenMenuId(null); }}
                              className="w-full flex items-center justify-end gap-3 px-3 py-2 rounded-lg hover:bg-surface-variant text-sm font-bold text-on-surface transition-colors"
                            >
                              <span>تحديد سعر المشروع</span>
                              <DollarSign size={16} className="text-on-surface-variant" />
                            </button>
                            <button 
                              onClick={() => { setEditingOrder(order); setOpenMenuId(null); setTimeout(handlePrint, 100); }}
                              className="w-full flex items-center justify-end gap-3 px-3 py-2 rounded-lg hover:bg-surface-variant text-sm font-bold text-on-surface transition-colors"
                            >
                              <span>طباعة تفاصيل المشروع</span>
                              <Printer size={16} className="text-on-surface-variant" />
                            </button>
                            <div className="h-px bg-outline-variant/10 my-2" />
                            <button 
                              onClick={() => { handleDeleteOrder(order.id); setOpenMenuId(null); }}
                              className="w-full flex items-center justify-end gap-3 px-3 py-2 rounded-lg hover:bg-error/10 text-sm font-bold text-error transition-colors"
                            >
                              <span>حذف المشروع</span>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Print Modal */}
      <AnimatePresence>
        {editingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm print:hidden" 
              onClick={() => setEditingOrder(null)} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container-lowest w-full max-w-3xl rounded-3xl overflow-hidden relative z-50 shadow-2xl print:shadow-none print:rounded-none print:p-0 print:m-0 print:absolute print:inset-0 print:bg-white print:w-full print:max-w-none print:h-auto"
              dir="rtl"
            >
              {/* Modal Header */}
              <div className="p-6 border-b ghost-border flex items-center justify-between bg-surface-container-low print:hidden">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">تفاصيل الطلب</h2>
                    <p className="text-xs text-on-surface-variant uppercase font-mono">{editingOrder.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingOrder(null)}
                  className="p-2 hover:bg-surface-variant rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Printing Template (Hidden in UI, Visible in Print) */}
              <div className="hidden print:block p-10 text-black leading-tight">
                <div className="flex justify-between items-center border-b-2 border-black pb-6 mb-6">
                  <div className="text-right">
                    <h1 className="text-2xl font-black mb-1">تفاصيل طلب مشروع متكامل</h1>
                    <p className="text-[10px] opacity-70">رقم الطلب: {editingOrder.id} | التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                  </div>
                  <div className="text-xl font-black">بـدايتـك للحلول التقنية</div>
                </div>

                <div className="space-y-5">
                  {/* Phase 1 & 2 Row */}
                  <div className="grid grid-cols-2 gap-6">
                    <section>
                      <h3 className="text-sm font-bold border-r-4 border-primary pr-2 mb-2 bg-gray-50 py-1">أولاً: نوع المشروع</h3>
                      <div className="pr-2">
                        <p className="text-xs font-medium">{editingOrder.projectTypes?.join('، ') || editingOrder.service}</p>
                      </div>
                    </section>
                    <section>
                      <h3 className="text-sm font-bold border-r-4 border-primary pr-2 mb-2 bg-gray-50 py-1">ثانياً: الهوية البصرية</h3>
                      <div className="pr-2">
                        <p className="text-xs font-medium">
                          {editingOrder.hasIdentity === true ? 'لدي هوية جاهزة' : 
                           editingOrder.hasIdentity === false ? 'أحتاج تصميم هوية جديدة' : 
                           editingOrder.brandStatus || 'غير محدد'}
                        </p>
                      </div>
                    </section>
                  </div>

                  {/* 3. الصفحات */}
                  <section>
                    <h3 className="text-sm font-bold border-r-4 border-primary pr-2 mb-2 bg-gray-50 py-1">ثالثاً: الصفحات المطلوبة</h3>
                    <div className="pr-2 flex flex-wrap gap-2 text-[10px]">
                      {(editingOrder.pages || []).map((p: string) => (
                        <span key={p} className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{p}</span>
                      ))}
                    </div>
                  </section>

                  {/* 4. التقنيات */}
                  <section>
                    <h3 className="text-sm font-bold border-r-4 border-primary pr-2 mb-2 bg-gray-50 py-1">رابعاً: المميزات والتقنيات</h3>
                    <div className="pr-2 grid grid-cols-3 gap-4 text-[10px]">
                      <div className="col-span-1">
                        <p className="font-bold mb-1 underline">الميزات:</p>
                        <ul className="list-disc pr-4 space-y-0.5">
                          {(editingOrder.features || []).map((f: string) => <li key={f}>{f}</li>)}
                        </ul>
                      </div>
                      <div className="col-span-2 grid grid-cols-2 gap-x-4 gap-y-1">
                        <p><span className="font-bold">المتاجر:</span> {editingOrder.appUpload?.join('، ') || 'لا يوجد'}</p>
                        <p><span className="font-bold">الاستضافة:</span> {editingOrder.hosting || 'غير محدد'}</p>
                        <p><span className="font-bold">الدعم الفني:</span> {editingOrder.techSupport?.join('، ') || 'لا يوجد'}</p>
                        <p><span className="font-bold">التسجيل:</span> {editingOrder.registrationTypes?.join('، ') || 'لا يوجد'}</p>
                      </div>
                    </div>
                  </section>

                  {/* 5. التفاصيل */}
                  <section>
                    <h3 className="text-sm font-bold border-r-4 border-primary pr-2 mb-2 bg-gray-50 py-1">خامساً: تفاصيل المشروع والمخطط الزمني</h3>
                    <div className="pr-2">
                      <p className="text-xs font-bold mb-1">المدة المتوقعة: <span className="font-normal">{editingOrder.deadline || editingOrder.timeline}</span></p>
                      <div className="p-3 border border-gray-200 bg-gray-50 text-[10px] leading-relaxed rounded-lg">
                        {editingOrder.description || editingOrder.details}
                      </div>
                    </div>
                  </section>

                  {/* 6. التواصل */}
                  <section>
                    <h3 className="text-sm font-bold border-r-4 border-primary pr-2 mb-2 bg-gray-50 py-1">سادساً: بيانات التواصل</h3>
                    <div className="pr-2 grid grid-cols-2 gap-y-2 text-[10px]">
                      <p><span className="font-bold">الاسم:</span> {editingOrder.name || editingOrder.customer}</p>
                      <p><span className="font-bold">الجوال:</span> {editingOrder.phone}</p>
                      <p><span className="font-bold">البريد:</span> {editingOrder.email}</p>
                      <p><span className="font-bold">الموقع:</span> {editingOrder.country} - {editingOrder.city}</p>
                    </div>
                  </section>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between items-center">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500">تم توليد التقرير عبر لوحة تحكم بـدايتـك</p>
                    <p className="text-[9px] text-gray-400">تاريخ الطباعة: {new Date().toLocaleString('ar-SA')}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-lg">بـدايتـك</p>
                    <p className="text-[8px] text-gray-400 uppercase tracking-widest">Solutions & Technology</p>
                  </div>
                </div>
              </div>

              {/* Modal Body (Editable Form) */}
              <div className="p-8 max-h-[75vh] overflow-y-auto print:hidden">
                <div className="space-y-10">
                  {/* Phase 1: النوع */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="w-8 h-2 bg-primary rounded-full"></span>
                       <h4 className="font-bold text-primary">المرحلة الأولى: النوع</h4>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-bold">الخدمة المطلوبة</label>
                      <select 
                        value={editingOrder.service}
                        onChange={(e) => setEditingOrder({...editingOrder, service: e.target.value})}
                        className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface appearance-none"
                      >
                        <option>تطوير متجر إلكتروني</option>
                        <option>تصميم موقع تعريفي</option>
                        <option>تطبيق جوال (iOS)</option>
                        <option>تكامل أنظمة ERP</option>
                      </select>
                    </div>
                  </div>

                  {/* Phase 2: الهوية */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="w-8 h-2 bg-primary rounded-full"></span>
                       <h4 className="font-bold text-primary">المرحلة الثانية: الهوية</h4>
                    </div>
                    <div className="flex gap-4">
                      {['لدي هوية جاهزة', 'أحتاج تصميم هوية جديدة'].map(opt => (
                        <label key={opt} className="flex-1 p-4 rounded-xl border border-outline-variant/20 flex items-center justify-between cursor-pointer hover:border-primary transition-colors">
                          <span className="text-sm font-bold">{opt}</span>
                          <input 
                            type="radio" 
                            name="brandStatus"
                            checked={editingOrder.brandStatus === opt}
                            onChange={() => setEditingOrder({...editingOrder, brandStatus: opt})}
                            className="accent-primary" 
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Phase 3: الصفحات */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="w-8 h-2 bg-primary rounded-full"></span>
                       <h4 className="font-bold text-primary">المرحلة الثالثة: الصفحات</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['الرئيسية', 'من نحن', 'اتصل بنا', 'سياسة الخصوصية', 'الشروط والأحكام', 'مدونة', 'متجر'].map(p => (
                        <button 
                          key={p}
                          onClick={() => setEditingOrder({...editingOrder, pages: toggleListItem(editingOrder.pages, p)})}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                            editingOrder.pages.includes(p) ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container-high text-on-surface border-outline-variant/10'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Phase 4: التقنيات */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="w-8 h-2 bg-primary rounded-full"></span>
                       <h4 className="font-bold text-primary">المرحلة الرابعة: التقنيات</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <p className="text-xs font-bold">الميزات الإضافية</p>
                        <div className="grid grid-cols-1 gap-2">
                          {['تسجيل دخول؟', 'لوحة تحكم للمدير؟', 'نظام دفع إلكتروني؟', 'نظام إشعارات؟'].map(f => (
                            <label key={f} className="flex items-center gap-2 cursor-pointer group">
                              <input 
                                type="checkbox" 
                                checked={editingOrder.features.includes(f)}
                                onChange={() => setEditingOrder({...editingOrder, features: toggleListItem(editingOrder.features, f)})}
                                className="accent-primary" 
                              />
                              <span className="text-xs group-hover:text-primary">{f}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-xs font-bold">رفع التطبيقات</p>
                        <div className="flex gap-4">
                          {['قوقل بلاي', 'ابل ستور'].map(s => (
                             <label key={s} className="flex items-center gap-2 cursor-pointer group">
                              <input 
                                type="checkbox" 
                                checked={editingOrder.appUpload.includes(s)}
                                onChange={() => setEditingOrder({...editingOrder, appUpload: toggleListItem(editingOrder.appUpload, s)})}
                                className="accent-primary" 
                              />
                              <span className="text-xs group-hover:text-primary">{s}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phase 5: التفاصيل */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="w-8 h-2 bg-primary rounded-full"></span>
                       <h4 className="font-bold text-primary">المرحلة الخامسة: التفاصيل</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold">المخطط الزمني</label>
                        <input 
                          type="text" 
                          value={editingOrder.timeline}
                          onChange={(e) => setEditingOrder({...editingOrder, timeline: e.target.value})}
                          className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold">وصف المشروع</label>
                        <textarea 
                          rows={4}
                          value={editingOrder.details}
                          onChange={(e) => setEditingOrder({...editingOrder, details: e.target.value})}
                          className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phase 6: التواصل */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="w-8 h-2 bg-primary rounded-full"></span>
                       <h4 className="font-bold text-primary">المرحلة السادسة: التواصل</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold">اسم العميل</label>
                        <input 
                          type="text" 
                          value={editingOrder.customer}
                          onChange={(e) => setEditingOrder({...editingOrder, customer: e.target.value})}
                          className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold">رقم الجوال</label>
                        <input 
                          type="text" 
                          value={editingOrder.phone}
                          onChange={(e) => setEditingOrder({...editingOrder, phone: e.target.value})}
                          className="w-full bg-surface-container-highest border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-surface-container-low border-t ghost-border flex flex-col md:flex-row gap-3 print:hidden">
                <button 
                  onClick={handlePrint}
                  className="flex-1 bg-primary text-on-primary-container px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
                >
                  <Printer size={18} />
                  <span>طباعة تفاصيل الطلب</span>
                </button>
                <button 
                  onClick={() => handleUpdateStatus(editingOrder.id, editingOrder.status)}
                  className="px-8 py-3 bg-emerald-500/10 text-emerald-500 rounded-2xl font-bold hover:bg-emerald-500/20 transition-all"
                >
                  حفظ التعديلات
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Status Modal */}
      <AnimatePresence>
        {changingStatusOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setChangingStatusOrder(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container-lowest w-full max-w-sm rounded-3xl overflow-hidden relative z-50 shadow-2xl p-6"
              dir="rtl"
            >
              <h3 className="text-xl font-black text-on-surface mb-6 flex items-center gap-2">
                <Tag className="text-primary" size={24} />
                <span>تغيير حالة المشروع</span>
              </h3>
              <div className="space-y-2">
                {[
                  'قيد المراجعة',
                  'جاري العمل على المشروع',
                  'تم الانتهاء والتسليم',
                  'متوقف حالياً',
                  'فسخ عقد',
                  'منتهي'
                ].map(status => (
                  <button 
                    key={status}
                    onClick={() => handleUpdateStatus(changingStatusOrder.id, status)}
                    disabled={isSaving}
                    className={`w-full text-right px-6 py-4 rounded-xl font-bold transition-all flex items-center justify-between ${
                      changingStatusOrder.status === status ? 'bg-primary text-on-primary-container' : 'bg-surface-container-low hover:bg-surface-container-high'
                    }`}
                  >
                    <span>{status}</span>
                    {changingStatusOrder.status === status && <CheckCircle size={16} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pricing and Installments Modal */}
      <AnimatePresence>
        {pricingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setPricingOrder(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl overflow-hidden relative z-50 shadow-2xl"
              dir="rtl"
            >
              <div className="p-6 border-b ghost-border flex items-center justify-between bg-surface-container-low">
                <h3 className="text-xl font-black text-on-surface">تحديد سعر المشروع والدفعات</h3>
                <button onClick={() => setPricingOrder(null)} className="p-2 hover:bg-surface-variant rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleUpdatePricing} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-on-surface-variant">عدد الدفعات</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleInstallmentChange(num)}
                          className={`flex-1 py-3 rounded-xl font-black transition-all ${
                            (pricingOrder.installmentCount || 1) === num ? 'bg-primary text-on-primary-container shadow-lg' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex flex-col items-center justify-center">
                    <span className="text-xs font-bold text-primary mb-1 uppercase tracking-widest">إجمالي سعر المشروع</span>
                    <h4 className="text-3xl font-black text-primary">
                      {((pricingOrder.installments || []).reduce((acc: number, curr: any) => acc + (parseFloat(curr.amount) || 0), 0)).toLocaleString()} ر.س
                    </h4>
                  </div>
                </div>

                <div className="space-y-4">
                   <h4 className="font-bold text-on-surface flex items-center gap-2">
                     <ClipboardList size={18} className="text-primary" />
                     <span>تفاصيل الدفعات</span>
                   </h4>
                   <div className="grid grid-cols-1 gap-4">
                     {(pricingOrder.installments || [{ name: 'الدفعة الأولى', amount: '', dueDate: '' }]).map((inst: any, idx: number) => (
                       <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-surface-container-low p-4 rounded-2xl border ghost-border group">
                         <div className="col-span-1 text-center self-center">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mx-auto">{idx + 1}</span>
                         </div>
                         <div className="col-span-4 space-y-1">
                           <label className="text-[10px] font-bold text-on-surface-variant mr-2">اسم الدفعة</label>
                           <input 
                             type="text"
                             value={inst.name}
                             onChange={(e) => {
                               const newInst = [...pricingOrder.installments];
                               newInst[idx].name = e.target.value;
                               setPricingOrder({...pricingOrder, installments: newInst});
                             }}
                             placeholder="مثال: دفعة الحجز"
                             className="w-full bg-surface-container-lowest border ghost-border rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-primary/30 outline-none"
                           />
                         </div>
                         <div className="col-span-3 space-y-1">
                           <label className="text-[10px] font-bold text-on-surface-variant mr-2">المبلغ (SAR)</label>
                           <input 
                             type="number"
                             value={inst.amount}
                             onChange={(e) => {
                               const newInst = [...pricingOrder.installments];
                               newInst[idx].amount = e.target.value;
                               setPricingOrder({...pricingOrder, installments: newInst});
                             }}
                             placeholder="0.00"
                             className="w-full bg-surface-container-lowest border ghost-border rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-primary/30 outline-none font-bold"
                           />
                         </div>
                         <div className="col-span-4 space-y-1">
                           <label className="text-[10px] font-bold text-on-surface-variant mr-2">تاريخ الاستحقاق</label>
                           <input 
                             type="date"
                             value={inst.dueDate}
                             onChange={(e) => {
                               const newInst = [...pricingOrder.installments];
                               newInst[idx].dueDate = e.target.value;
                               setPricingOrder({...pricingOrder, installments: newInst});
                             }}
                             className="w-full bg-surface-container-lowest border ghost-border rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-primary/30 outline-none"
                           />
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="w-full tech-gradient text-on-primary-container py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                    <span>حفظ التسعير والدفعات</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
