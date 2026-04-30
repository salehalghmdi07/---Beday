import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit,
  Image as ImageIcon, 
  Search,
  ExternalLink,
  Loader2,
  CheckCircle2,
  X,
  Upload
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  link: string;
  order: number;
}

export default function PortfolioManagement() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioItem | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('تمت إضافة المشروع بنجاح!');
  
  const [newProject, setNewProject] = useState({
    title: '',
    category: '',
    image: '',
    link: '',
    order: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'portfolio'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PortfolioItem[];
      setItems(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'portfolio');
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.image) {
      alert('يرجى اختيار صورة للمشروع');
      return;
    }
    try {
      await addDoc(collection(db, 'portfolio'), {
        ...newProject,
        createdAt: new Date().toISOString()
      });
      setIsAdding(false);
      setNewProject({ title: '', category: '', image: '', link: '', order: items.length });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'portfolio');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !editingProject.image) {
      alert('يرجى اختيار صورة للمشروع');
      return;
    }
    try {
      const { id, ...data } = editingProject;
      await updateDoc(doc(db, 'portfolio', id), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      setEditingProject(null);
      setToastMessage('تم تحديث المشروع بنجاح!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `portfolio/${editingProject?.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشروع؟')) return;
    try {
      await deleteDoc(doc(db, 'portfolio', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'portfolio');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { 
        alert('حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 1 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEditing && editingProject) {
          setEditingProject({ ...editingProject, image: reader.result as string });
        } else {
          setNewProject({ ...newProject, image: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 pb-20 text-right" dir="rtl">
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl border ghost-border shadow-sm">
        <div>
          <h1 className="text-3xl font-black font-headline text-on-surface mb-2">إدارة الأعمال</h1>
          <p className="text-on-surface-variant">أضف أو احذف المشاريع المعروضة في المحفظة</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl tech-gradient text-on-primary-container font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          مشروع جديد
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-on-surface-variant font-bold">جاري تحميل الأعمال...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white rounded-3xl overflow-hidden border ghost-border hover:shadow-xl hover:shadow-primary/5 transition-all"
            >
              <div className="aspect-video relative">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setEditingProject(item)}
                    className="w-10 h-10 rounded-xl bg-primary/90 text-white flex items-center justify-center hover:scale-110 active:scale-90 transition-transform shadow-lg"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="w-10 h-10 rounded-xl bg-error/90 text-white flex items-center justify-center hover:scale-110 active:scale-90 transition-transform shadow-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-surface/80 backdrop-blur-md text-[10px] font-black text-on-surface border ghost-border">
                  ترتيب: {item.order}
                </div>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">
                  {item.category}
                </span>
                <h3 className="text-xl font-bold text-on-surface mb-2">{item.title}</h3>
              </div>
            </motion.div>
          ))}
          
          {items.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-outline-variant/30 rounded-3xl py-20 flex flex-col items-center gap-4">
              <ImageIcon className="text-on-surface-variant opacity-20" size={64} />
              <p className="text-on-surface-variant font-bold">لا توجد أعمال لعرضها حالياً</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="text-primary font-bold hover:underline"
              >
                أضف أول مشروع لك الآن
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Project Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-surface/80 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-4xl p-8 border ghost-border shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black font-headline">إضافة مشروع جديد</h2>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-on-surface">اسم المشروع</label>
                  <input 
                    type="text"
                    value={newProject.title}
                    onChange={e => setNewProject({...newProject, title: e.target.value})}
                    placeholder="مثال: منصة متجر إلكتروني"
                    className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-on-surface">رابط المشروع (اختياري)</label>
                  <input 
                    type="url"
                    value={newProject.link}
                    onChange={e => setNewProject({...newProject, link: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface">التصنيف</label>
                    <select 
                      value={newProject.category}
                      onChange={e => setNewProject({...newProject, category: e.target.value})}
                      className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                      required
                    >
                      <option value="">اختر التصنيف</option>
                      <option value="موقع إلكتروني">موقع إلكتروني</option>
                      <option value="تطبيق جوال">تطبيق جوال</option>
                      <option value="نظام سحابي">نظام سحابي</option>
                      <option value="هوية بصرية">هوية بصرية</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface">الترتيب</label>
                    <input 
                      type="number"
                      value={newProject.order}
                      onChange={e => setNewProject({...newProject, order: parseInt(e.target.value)})}
                      className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-on-surface">إدراج صورة</label>
                  <div className="relative group">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="project-image-upload"
                    />
                    <label 
                      htmlFor="project-image-upload"
                      className="flex flex-col items-center justify-center w-full aspect-video bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-3xl cursor-pointer hover:border-primary/50 hover:bg-surface-container-high transition-all overflow-hidden"
                    >
                      {newProject.image ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={newProject.image} 
                            alt="preview" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="text-white" size={32} />
                            <span className="text-white font-bold mr-2 text-sm">تغيير الصورة</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                            <Upload size={32} />
                          </div>
                          <p className="text-on-surface-variant font-bold">اضغط لرفع الصورة</p>
                          <p className="text-[10px] text-on-surface-variant/60 mt-1 uppercase tracking-widest">PNG, JPG up to 1MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 py-4 rounded-2xl tech-gradient text-on-primary-container font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    حفظ المشروع
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-4 rounded-2xl bg-surface-container-low border ghost-border text-on-surface-variant font-bold text-lg hover:bg-surface-container-high transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProject(null)}
              className="absolute inset-0 bg-surface/80 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-4xl p-8 border ghost-border shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black font-headline text-on-surface">تعديل المشروع</h2>
                <button 
                  onClick={() => setEditingProject(null)}
                  className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-on-surface">اسم المشروع</label>
                  <input 
                    type="text"
                    value={editingProject.title}
                    onChange={e => setEditingProject({...editingProject, title: e.target.value})}
                    placeholder="مثال: منصة متجر إلكتروني"
                    className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-on-surface">رابط المشروع (اختياري)</label>
                  <input 
                    type="url"
                    value={editingProject.link || ''}
                    onChange={e => setEditingProject({...editingProject, link: e.target.value})}
                    placeholder="https://example.com"
                    className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface">التصنيف</label>
                    <select 
                      value={editingProject.category}
                      onChange={e => setEditingProject({...editingProject, category: e.target.value})}
                      className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                      required
                    >
                      <option value="">اختر التصنيف</option>
                      <option value="موقع إلكتروني">موقع إلكتروني</option>
                      <option value="تطبيق جوال">تطبيق جوال</option>
                      <option value="نظام سحابي">نظام سحابي</option>
                      <option value="هوية بصرية">هوية بصرية</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface">الترتيب</label>
                    <input 
                      type="number"
                      value={editingProject.order}
                      onChange={e => setEditingProject({...editingProject, order: parseInt(e.target.value)})}
                      className="w-full bg-surface-container-low border ghost-border rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/30 outline-none text-on-surface"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-on-surface">تغيير الصورة</label>
                  <div className="relative group">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, true)}
                      className="hidden"
                      id="edit-project-image-upload"
                    />
                    <label 
                      htmlFor="edit-project-image-upload"
                      className="flex flex-col items-center justify-center w-full aspect-video bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-3xl cursor-pointer hover:border-primary/50 hover:bg-surface-container-high transition-all overflow-hidden"
                    >
                      {editingProject.image ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={editingProject.image} 
                            alt="preview" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="text-white" size={32} />
                            <span className="text-white font-bold mr-2 text-sm">تغيير الصورة</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                            <Upload size={32} />
                          </div>
                          <p className="text-on-surface-variant font-bold">اضغط لرفع الصورة</p>
                          <p className="text-[10px] text-on-surface-variant/60 mt-1 uppercase tracking-widest">PNG, JPG up to 1MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 py-4 rounded-2xl tech-gradient text-on-primary-container font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    حفظ التغييرات
                  </button>
                  <button 
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="flex-1 py-4 rounded-2xl bg-surface-container-low border ghost-border text-on-surface-variant font-bold text-lg hover:bg-surface-container-high transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[200] bg-on-surface text-surface px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <CheckCircle2 className="text-secondary" size={24} />
            <span className="font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
