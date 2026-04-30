import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Rocket, 
  DollarSign, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  UserPlus,
  Download,
  ArrowRight,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  X,
  Loader2,
  Phone,
  Mail,
  User,
  Tag,
  AtSign,
  AlertTriangle,
  Lock,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export default function ClientsManagement() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [changingStatus, setChangingStatus] = useState<any>(null);
  const [printingClient, setPrintingClient] = useState<any>(null);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    country: '',
    status: 'نشط حالياً',
    projects: 0,
    registrationTypes: [],
    projectPrice: '',
    date: new Date().getFullYear().toString()
  });

  useEffect(() => {
    const q = query(collection(db, 'clients'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const clientsList = snapshot.docs.map(doc => {
          const data = doc.data();
          const name = String(data.name || '');
          return {
            id: doc.id,
            initial: name.trim() ? name.trim().charAt(0).toUpperCase() : '؟',
            ...data
          };
        });
        setClients(clientsList);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        try {
          handleFirestoreError(error, OperationType.LIST, 'clients');
        } catch (e) {
          console.error("Firestore loading error:", e);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.phone) return;

    setIsSaving(true);
    try {
      await addDoc(collection(db, 'clients'), {
        ...newClient,
        createdAt: new Date().toISOString()
      });
      setIsAddingClient(false);
      setNewClient({
        name: '',
        phone: '',
        email: '',
        city: '',
        country: '',
        status: 'نشط حالياً',
        projects: 0,
        registrationTypes: [],
        hosting: '',
        date: new Date().getFullYear().toString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'clients');
      alert('حدث خطأ أثناء حفظ بيانات العميل. يرجى التأكد من صلاحياتك وصحة البيانات.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'clients', editingClient.id), {
        ...editingClient
      });
      setEditingClient(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `clients/${editingClient.id}`);
      alert('حدث خطأ أثناء تحديث بيانات العميل.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'clients', id), {
        status: newStatus
      });
      setChangingStatus(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `clients/${id}`);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    try {
      await deleteDoc(doc(db, 'clients', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'clients');
    }
  };

  const toggleClientStatus = async (client: any) => {
    const newStatus = client.status === 'نشط حالياً' ? 'متوقف' : 'نشط حالياً';
    try {
      await updateDoc(doc(db, 'clients', client.id), {
        status: newStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'clients');
    }
  };

  const handlePrint = (client: any) => {
    setPrintingClient(client);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const filteredClients = useMemo(() => {
    let result = clients.filter(client => 
      client.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      client.phone?.includes(searchQuery)
    );

    if (statusFilter !== 'all') {
      result = result.filter(client => client.status === statusFilter);
    }

    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'projects') return b.projects - a.projects;
      return 0;
    });

    return result;
  }, [searchQuery, statusFilter, sortBy, clients]);

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
      <header className="flex flex-col md:flex-row-reverse md:items-end justify-between gap-6">
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end mb-2">
            <span className="h-[2px] w-8 bg-primary"></span>
            <span className="text-primary font-bold tracking-widest text-sm uppercase">قاعدة البيانات</span>
          </div>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-2 font-headline">إدارة العملاء</h1>
          <p className="text-on-surface-variant max-w-xl">مرحباً بك في وحدة التحكم المركزية. هنا يمكنك تتبع جميع عملائك، مشاريعهم النشطة، وبيانات التواصل الخاصة بهم بدقة عالية.</p>
        </div>
        <div className="flex items-center gap-3 flex-row-reverse">
          <button 
            onClick={() => setIsAddingClient(true)}
            className="tech-gradient text-on-primary-container px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/10 active:scale-95 transition-all"
          >
            <UserPlus size={20} />
            <span>إضافة عميل جديد</span>
          </button>
          <button className="border border-outline-variant/30 text-on-surface px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-surface-container-high transition-colors">
            <Download size={20} />
            <span>تصدير البيانات</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: <Users size={24} />, label: "إجمالي العملاء", value: clients.length.toLocaleString('ar-SA'), trend: "+12%", color: "text-primary" },
          { icon: <Rocket size={24} />, label: "المشاريع القائمة", value: clients.reduce((acc, c) => acc + (c.projects || 0), 0).toLocaleString('ar-SA'), trend: "نشط", color: "text-secondary" },
          { icon: <DollarSign size={24} />, label: "متوسط قيمة العميل", value: "SAR 4.2k", trend: "الشهري", color: "text-tertiary" }
        ].map((stat, i) => (
          <div key={i} className="bg-surface-container-low p-6 rounded-2xl border ghost-border shadow-sm">
            <div className="flex justify-between items-start flex-row-reverse mb-4">
              <div className={`p-3 bg-primary/10 rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
              <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-full">{stat.trend}</span>
            </div>
            <p className="text-on-surface-variant text-sm mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-on-surface">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-surface-container-low rounded-2xl border ghost-border overflow-hidden shadow-xl">
        <div className="p-4 border-b ghost-border flex flex-col md:flex-row-reverse justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input 
              type="text" 
              placeholder="البحث عن اسم، بريد، أو هاتف..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-highest border-none rounded-xl py-3 px-10 text-right focus:ring-2 focus:ring-primary/30 transition-all text-on-surface outline-none"
            />
          </div>
          <div className="flex items-center gap-2 flex-row-reverse">
            <div className="relative group">
              <button className="bg-surface-container-highest px-4 py-2 rounded-lg text-sm text-on-surface flex items-center gap-2 hover:bg-surface-container-low transition-colors">
                <Filter size={16} />
                <span>فلترة: {statusFilter === 'all' ? 'الكل' : statusFilter}</span>
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container-high border ghost-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <div className="p-2 space-y-1">
                  {['all', 'نشط حالياً', 'مكتمل', 'متوقف'].map((status) => (
                    <button 
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`w-full text-right px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                        statusFilter === status ? 'bg-primary text-on-primary-container' : 'hover:bg-surface-variant text-on-surface'
                      }`}
                    >
                      {status === 'all' ? 'الكل' : status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative group">
              <button className="bg-surface-container-highest px-4 py-2 rounded-lg text-sm text-on-surface flex items-center gap-2 hover:bg-surface-container-low transition-colors">
                <ArrowUpDown size={16} />
                <span>ترتيب حسب: {sortBy === 'name' ? 'الاسم' : 'المشاريع'}</span>
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container-high border ghost-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <div className="p-2 space-y-1">
                  {[
                    { id: 'name', label: 'الاسم' },
                    { id: 'projects', label: 'عدد المشاريع' }
                  ].map((option) => (
                    <button 
                      key={option.id}
                      onClick={() => setSortBy(option.id)}
                      className={`w-full text-right px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                        sortBy === option.id ? 'bg-primary text-on-primary-container' : 'hover:bg-surface-variant text-on-surface'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-on-surface-variant font-bold">جاري تحميل بيانات العملاء...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant mb-2">
                <Users size={40} />
              </div>
              <h3 className="text-xl font-bold text-on-surface">لا يوجد عملاء حالياً</h3>
              <p className="text-on-surface-variant max-w-xs">ابدأ بإضافة أول عميل لقاعدة البيانات الخاصة بك لتبدأ إدارة المشاريع.</p>
              <button 
                onClick={() => setIsAddingClient(true)}
                className="mt-4 text-primary font-bold flex items-center gap-2 hover:underline"
              >
                <UserPlus size={18} />
                <span>إضافة أول عميل</span>
              </button>
            </div>
          ) : (
            <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 text-on-surface-variant text-sm font-bold">
                <th className="px-6 py-4">العميل</th>
                <th className="px-6 py-4">رقم الجوال</th>
                <th className="px-6 py-4 hidden lg:table-cell">البريد الإلكتروني</th>
                <th className="px-6 py-4">التسجيل</th>
                <th className="px-6 py-4">سعر المشروع</th>
                <th className="px-6 py-4">المشاريع</th>
                <th className="px-6 py-4 text-center">الحالة</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-surface-container-high/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3 flex-row-reverse">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/10 text-primary font-bold">
                        {client.initial}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{client.name}</p>
                        <p className="text-xs text-on-surface-variant">عضو منذ {client.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-on-surface-variant font-medium">{client.phone}</td>
                  <td className="px-6 py-5 text-on-surface-variant font-medium lg:table-cell hidden">{client.email}</td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
                      {Array.isArray(client.registrationTypes) ? client.registrationTypes.join('، ') : (client.registrationTypes || 'غير محدد')}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">
                      {client.projectPrice || client.hosting || 'لم يحدد'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 flex-row-reverse">
                      <span className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-bold text-primary border ghost-border">
                        {client.projects}
                      </span>
                      <span className="text-xs text-on-surface-variant">مشاريع</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        client.status === 'نشط حالياً' ? 'bg-primary/10 text-primary' : (client.status === 'مكتمل' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-surface-variant text-on-surface-variant')
                      }`}>
                        {client.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-left relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === client.id ? null : client.id)}
                      className="p-2 hover:bg-surface-variant rounded-lg transition-colors"
                    >
                      <MoreVertical className="text-on-surface-variant" size={18} />
                    </button>
                    
                    <AnimatePresence>
                      {openMenuId === client.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-30" 
                            onClick={() => setOpenMenuId(null)}
                          />
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute left-6 top-14 w-48 bg-surface-container-high border ghost-border rounded-xl shadow-2xl z-40 p-2"
                          >
                            <button 
                              onClick={() => setEditingClient(client)}
                              className="w-full flex items-center justify-end gap-3 px-3 py-2 rounded-lg hover:bg-surface-variant text-sm font-bold text-on-surface transition-colors"
                            >
                              <span>تعديل البيانات</span>
                              <Edit size={16} className="text-on-surface-variant" />
                            </button>
                            <button 
                              onClick={() => setChangingStatus(client)}
                              className="w-full flex items-center justify-end gap-3 px-3 py-2 rounded-lg hover:bg-surface-variant text-sm font-bold text-on-surface transition-colors"
                            >
                              <span>تغيير الحالة</span>
                              <Tag size={16} className="text-on-surface-variant" />
                            </button>
                            <a 
                              href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full flex items-center justify-end gap-3 px-3 py-2 rounded-lg hover:bg-surface-variant text-sm font-bold text-on-surface transition-colors"
                            >
                              <span>إرسال واتساب للعميل</span>
                              <MessageCircle size={16} className="text-on-surface-variant" />
                            </a>
                            <a 
                              href={`mailto:${client.email}`}
                              className="w-full flex items-center justify-end gap-3 px-3 py-2 rounded-lg hover:bg-surface-variant text-sm font-bold text-on-surface transition-colors"
                            >
                              <span>إرسال بريد</span>
                              <Mail size={16} className="text-on-surface-variant" />
                            </a>
                            <button 
                              onClick={() => toggleClientStatus(client)}
                              className="w-full flex items-center justify-end gap-3 px-3 py-2 rounded-lg hover:bg-surface-variant text-sm font-bold text-on-surface-variant transition-colors"
                            >
                              <span>تعطيل مؤقت</span>
                              <Lock size={16} />
                            </button>
                            <div className="h-px bg-outline-variant/10 my-2" />
                            <button 
                              onClick={() => handleDeleteClient(client.id)}
                              className="w-full flex items-center justify-end gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-sm font-bold text-red-500 transition-colors"
                            >
                              <span>حذف العميل</span>
                              <Trash2 size={16} />
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

        <div className="p-6 bg-surface-container-high/20 border-t ghost-border flex flex-col md:flex-row-reverse justify-between items-center gap-4">
          <p className="text-on-surface-variant text-sm">عرض <span className="text-on-surface font-bold">{filteredClients.length}</span> من أصل <span className="text-on-surface font-bold">{clients.length}</span> عميل</p>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container-highest text-on-surface-variant hover:text-primary transition-all">
              <ChevronRight size={18} />
            </button>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary text-on-primary-container font-bold shadow-md">1</button>
            <button className="w-10 h-10 rounded-lg flex items-center justify-center bg-surface-container-highest text-on-surface-variant hover:text-primary transition-all">
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Client Modal */}
      <AnimatePresence>
        {isAddingClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAddingClient(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container-lowest w-full max-w-lg rounded-3xl overflow-hidden relative z-50 shadow-2xl"
              dir="rtl"
            >
              <div className="p-6 border-b ghost-border flex justify-between items-center bg-surface-container-low">
                <h3 className="text-xl font-black text-on-surface">إضافة عميل جديد</h3>
                <button 
                  onClick={() => setIsAddingClient(false)}
                  className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveClient} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-8 h-2 bg-primary rounded-full"></span>
                    <h4 className="font-bold text-primary">المرحلة السادسة: التواصل</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-on-surface">اسم العميل بالكامل</label>
                      <div className="relative">
                        <input 
                          type="text"
                          required
                          value={newClient.name}
                          onChange={e => setNewClient({...newClient, name: e.target.value})}
                          placeholder="مثال: صالح الغامدي"
                          className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 pr-14 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                        />
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={20} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-on-surface">رقم الجوال</label>
                        <div className="relative">
                          <input 
                            type="tel"
                            required
                            value={newClient.phone}
                            onChange={e => setNewClient({...newClient, phone: e.target.value})}
                            placeholder="05xxxxxxx"
                            className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 pr-14 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                          />
                          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={20} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-on-surface">البريد الإلكتروني</label>
                        <div className="relative">
                          <input 
                            type="email"
                            value={newClient.email}
                            onChange={e => setNewClient({...newClient, email: e.target.value})}
                            placeholder="name@example.com"
                            className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 pr-14 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                          />
                          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={20} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-on-surface">الدولة</label>
                        <input 
                          type="text"
                          value={newClient.country}
                          onChange={e => setNewClient({...newClient, country: e.target.value})}
                          placeholder="مثال: المملكة العربية السعودية"
                          className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-on-surface">المدينة</label>
                        <input 
                          type="text"
                          value={newClient.city}
                          onChange={e => setNewClient({...newClient, city: e.target.value})}
                          placeholder="مثال: الرياض"
                          className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 tech-gradient text-on-primary-container py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                    <span>{isSaving ? 'جاري الحفظ...' : 'حفظ العميل'}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsAddingClient(false)}
                    className="flex-1 bg-surface-container-high text-on-surface py-4 rounded-2xl font-bold hover:bg-surface-container-highest transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Client Modal */}
      <AnimatePresence>
        {editingClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditingClient(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container-lowest w-full max-w-lg rounded-3xl overflow-hidden relative z-50 shadow-2xl"
              dir="rtl"
            >
              <div className="p-6 border-b ghost-border flex justify-between items-center bg-surface-container-low">
                <h3 className="text-xl font-black text-on-surface">تعديل بيانات العميل</h3>
                <button 
                  onClick={() => setEditingClient(null)}
                  className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateClient} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface">اسم العميل</label>
                    <input 
                      type="text"
                      required
                      value={editingClient.name}
                      onChange={e => setEditingClient({...editingClient, name: e.target.value})}
                      className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-on-surface">الجوال</label>
                      <input 
                        type="tel"
                        required
                        value={editingClient.phone}
                        onChange={e => setEditingClient({...editingClient, phone: e.target.value})}
                        className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-on-surface">البريد</label>
                      <input 
                        type="email"
                        value={editingClient.email}
                        onChange={e => setEditingClient({...editingClient, email: e.target.value})}
                        className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-on-surface">الدولة</label>
                      <input 
                        type="text"
                        value={editingClient.country}
                        onChange={e => setEditingClient({...editingClient, country: e.target.value})}
                        className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-on-surface">المدينة</label>
                      <input 
                        type="text"
                        value={editingClient.city}
                        onChange={e => setEditingClient({...editingClient, city: e.target.value})}
                        className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 tech-gradient text-on-primary-container py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Edit size={20} />}
                    <span>حفظ التعديلات</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Status Modal */}
      <AnimatePresence>
        {changingStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setChangingStatus(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface-container-lowest w-full max-w-sm rounded-3xl overflow-hidden relative z-50 shadow-2xl p-6"
              dir="rtl"
            >
              <h3 className="text-xl font-black text-on-surface mb-6">تغيير حالة العميل</h3>
              <div className="space-y-2">
                {['نشط حالياً', 'مكتمل', 'متوقف', 'تعطيل مؤقت'].map(status => (
                  <button 
                    key={status}
                    onClick={() => handleUpdateStatus(changingStatus.id, status)}
                    className={`w-full text-right px-6 py-4 rounded-xl font-bold transition-all ${
                      changingStatus.status === status ? 'bg-primary text-on-primary-container' : 'bg-surface-container-low hover:bg-surface-container-high'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printable Contract - Hidden by default, visible only on print */}
      {printingClient && (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-12 text-right text-black overflow-y-auto" dir="rtl" style={{ fontFamily: 'Arial, sans-serif' }}>
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
            <div className="text-right">
              <h1 className="text-2xl font-black mb-2">عقد تقديم خدمات تقنية</h1>
              <p className="text-sm">رقم العقد: CN-{printingClient.id} / ....................... التاريخ : الموافق {new Date().toLocaleDateString('ar-SA')} م</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-left font-black text-2xl">بـدايتـك</div>
            </div>
          </div>

          <div className="space-y-6 text-sm leading-relaxed">
            <h2 className="text-lg font-bold underline text-center">أطراف التعاقد</h2>
            <h3 className="font-bold underline text-right">تمهــــــــــيد</h3>
            <p>الطرف الأول بدايتك تعمل في مجال البرمجيات والإنترنت وتوفير الدعم الفني لكافة التطبيقات والبرامج ومواقع الإنترنت وغيرها من الحلول الذكية، موثقة بالمركز السعودي للأعمال برقم .......................</p>
            <p>الطرف الثاني يرغب بالتعاقد مع الطرف الأول على القيام بإنشاء (تفاصيل المشروع الموضحه بالبند الثاني)</p>
            <p>وقد لاقى هذا قبولاَ لدى الطرف الأول، وأقر الطرفين بأهليتهما للتصرف والتعاقد شرعاً وقانوناً واتفقا على البنود التالية:</p>

            <section className="space-y-4">
              <div>
                <h4 className="font-bold underline">البند الأول</h4>
                <p>يعتبر التمهيد السابق جزء لا يتجزأ من هذا العقد ومتمماً ومكملاً له</p>
              </div>

              <div>
                <h4 className="font-bold underline">البند الثاني (الخدمة المطلوبة)</h4>
                <p>اتفق الطرفان على أن يقوم الطرف الأول في هذا العقد بالقيام بتنفيذ تفاصيل المشروع التالية:</p>
                <div className="border border-dashed border-gray-300 p-4 h-20 mt-2"></div>
              </div>

              <div>
                <h4 className="font-bold underline">البند الثالث (قيمة التعاقد والدفعات)</h4>
                <p>يلتزم الطرف الثاني بسداد مبلغ (..........) ريال سعودي فقط لا غير للطرف الأول وذلك نظير تقديم وتوفير الخدمة المنصوص عليها في البند الثاني، وعلى أن يتم سداد هذا المبلغ على الدفعات التالية:</p>
                <ul className="list-disc pr-6 space-y-1">
                  <li>25% يتم سدادها من إجمالي العقد كدفعة مقدمة عند توقيع العقد.</li>
                  <li>25% يتم سدادها عند عرض التصميم من قبل الطرف الأول واعتماده من الطرف الثاني.</li>
                  <li>25% يتم سدادها بعد انتهاء الطرف الأول من جميع الاعمال المطلوبة وتسليم المشروع للطرف الثاني.</li>
                </ul>
                <p className="mt-2 italic">" وذلك طبقاً للخدمات المتفق عليها الموضحة بالبند الثاني، علماً بأنه لا يجوز تعديل الأعمال بدون موافقة كتابية من طرفي التعاقد عن طريق المراسلات الإلكترونية الرسمية "</p>
              </div>

              <div>
                <h4 className="font-bold underline">البند الرابع (مدة التنفيذ)</h4>
                <p>يلتزم الطرف الأول بتسليم المشروع في مدة (.........)، قابلة للزيادة وفقا لأي مستجدات قد تطرأ بالعمل على ان يرفق ملحق بسبب الزيادة موقع من الطرفين، ويتم احتساب مده التنفيذ بداء من اليوم التالي لتوقيع العقد واستلام الدفعة الأولى، وبعد ذلك يتم اختبار المشروع من قبل الطرفين (علماً بأن أيام العمل الرسمية تبدأ من يوم الأحد وتنتهي يوم الخميس من كل اسبوع، والإجازات الرسمية لا تحتسب من ضمن مده التنفيذ).</p>
              </div>

              <div>
                <h4 className="font-bold underline">البند الخامس (الضمان والدعم الفني)</h4>
                <p>يتعهد الطرف الأول بضمان جميع الخدمات البرمجية المقدمة وتوفير الدعم الفني ثلاث شهور من تاريخ استلام المشروع</p>
              </div>

              <div>
                <h4 className="font-bold underline">البند السادس (التزام السداد)</h4>
                <p>يتعهد الطرف الثاني بالالتزام بسداد الدفعات المقررة بالبند الثالث في موعدها المتفق عليها بموجب هذا العقد وإلا اعتبر العقد مفسوخاً من تلقاء نفسه ولا يحق للطرف الثاني مطالبة الطرف الأول بالدفعات السابقة التي تم سدادها، كما يلتزم الطرف الأول بتسليم المشروع في المدة المتفق عليها والمواصفات المتفق عليها وإلا يحق للطرف الثاني فسخ العقد واسترداد جميع الدفعات من الطرف الأول.</p>
              </div>

              <div>
                <h4 className="font-bold underline">البند السابع (الاطلاع على الأعمال)</h4>
                <p>يلتزم الطرف الأول بالسماح للطرف الثاني بالاطلاع على الأعمال المطلوبة في مراحل تنفيذها وإعطاء التعديلات المطلوبة، كما ان المراسلات الإلكترونية الرسمية تكون عن طريق أدوات التواصل الموضحة في بيانات طرفي التعاقد.</p>
              </div>

              <div>
                <h4 className="font-bold underline">البند الثامن (سرية المعلومات)</h4>
                <p>يتعهد كل من طرفي التعاقد بالحفاظ على سرية المعلومات والبيانات التي يحصل عليها الطرف الآخر بموجب هذا العقد كما يتعهد الطرف الأول للطرف الثاني بموجب هذا العقد على عدم الإفصاح بهويه الموقع وعرض تصميمه على سبيل الدعاية الا بعد الانتهاء من جميع الاعمال ورفع الموقع عبر الانترنت وفي حاله مخالفه الطرف الأول لذلك يحق للطرف الثاني بطلب تعويض كما تنص عليه الشريعة الإسلامية لما وقع عليه من ضرر ناتج عن الإفصاح بهويه المشروع.</p>
              </div>

              <div>
                <h4 className="font-bold underline">البند التاسع (إنها الالتزامات)</h4>
                <p>يتعهد الطرفان بإنهاء الالتزامات المقررة بموجب هذا العقد.</p>
              </div>

              <div>
                <h4 className="font-bold underline">البند العاشر (نسخ العقد)</h4>
                <p>تحرر هذا العقد من عدد (.........) صفحة، بيد كل طرف نسخة للعمل بمقتضاها بعد التوقيع.</p>
              </div>

              <div>
                <h4 className="font-bold underline">البند الحادي عشر (اختصاص المحاكم)</h4>
                <p>اتفق الطرفان على انه في حالة وجود نزاع لا قدر الله يكون الاختصاص بالفصل معقوداً للجهات المختصة بالمملكة العربية السعودية على اختلاف درجاتها وأنواعها.</p>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-20 pt-12">
              <div className="text-center">
                <p className="font-bold">الطرف الأول (بدايتك)</p>
                <div className="h-20 border-b border-black"></div>
              </div>
              <div className="text-center">
                <p className="font-bold">الطرف الثاني ({printingClient.name})</p>
                <div className="h-20 border-b border-black"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
