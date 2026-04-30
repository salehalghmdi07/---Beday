import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers, 
  CreditCard, 
  ShoppingCart, 
  Users, 
  Settings, 
  Bell, 
  UserCircle,
  Search,
  Moon,
  LogOut,
  ArrowRight,
  Plus,
  Rocket,
  Briefcase,
  Menu,
  X
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import Logo from './Logo';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ to, icon, label, active, onClick }: SidebarItemProps) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-primary/10 text-primary border-r-4 border-primary' 
        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

interface UserProfile {
  displayName?: string;
  photoURL?: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Close sidebar on route change
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Real-time listener for profile data in Firestore
    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const displayName = profile?.displayName || auth.currentUser?.displayName || 'مدير النظام';
  const photoURL = profile?.photoURL || auth.currentUser?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-row-reverse">
      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 fixed right-0 top-0 h-screen bg-surface border-l ghost-border flex flex-col py-8 px-4 z-50 transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="mb-10 px-2 flex items-center justify-between">
          <div>
            <Logo size={32} />
            <p className="text-[10px] text-on-surface-variant opacity-70 mt-2">لوحة التحكم الإدارية</p>
          </div>
          <button 
            className="lg:hidden p-2 text-on-surface-variant hover:text-primary"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <SidebarItem 
            to="/dashboard" 
            icon={<LayoutDashboard size={20} />} 
            label="الرئيسية" 
            active={location.pathname === '/dashboard'} 
            onClick={() => setIsSidebarOpen(false)}
          />
          <SidebarItem 
            to="/dashboard/portfolio" 
            icon={<Briefcase size={20} />} 
            label="إدارة الأعمال" 
            active={location.pathname === '/dashboard/portfolio'} 
            onClick={() => setIsSidebarOpen(false)}
          />
          <SidebarItem 
            to="/dashboard/content" 
            icon={<Layers size={20} />} 
            label="إدارة المحتوى" 
            active={location.pathname === '/dashboard/content'} 
            onClick={() => setIsSidebarOpen(false)}
          />
          <SidebarItem 
            to="/dashboard/services" 
            icon={<CreditCard size={20} />} 
            label="الخدمات والأسعار" 
            active={location.pathname === '/dashboard/services'} 
            onClick={() => setIsSidebarOpen(false)}
          />
          <SidebarItem 
            to="/dashboard/orders" 
            icon={<ShoppingCart size={20} />} 
            label="الطلبات" 
            active={location.pathname === '/dashboard/orders'} 
            onClick={() => setIsSidebarOpen(false)}
          />
          <SidebarItem 
            to="/dashboard/clients" 
            icon={<Users size={20} />} 
            label="العملاء" 
            active={location.pathname === '/dashboard/clients'} 
            onClick={() => setIsSidebarOpen(false)}
          />
          <SidebarItem 
            to="/dashboard/settings" 
            icon={<Settings size={20} />} 
            label="الإعدادات" 
            active={location.pathname === '/dashboard/settings'} 
            onClick={() => setIsSidebarOpen(false)}
          />
          
          <button 
            onClick={() => {
              handleLogout();
              setIsSidebarOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-error hover:bg-error/10 mt-4"
          >
            <LogOut size={20} />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </nav>

        <div className="mt-auto p-4 bg-surface-container-low rounded-xl flex items-center gap-3 ghost-border">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
             <img 
               src={photoURL} 
               alt="User" 
               className="w-full h-full object-cover"
               referrerPolicy="no-referrer"
             />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate">{displayName}</p>
            <p className="text-xs text-on-surface-variant truncate">{auth.currentUser?.email || 'beday@tech.com'}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:mr-64 w-full overflow-x-hidden">
        {/* Header */}
        <header className="h-16 bg-surface/60 backdrop-blur-xl border-b ghost-border flex justify-between items-center px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-3 lg:gap-6">
            <button 
              className="lg:hidden p-2 text-on-surface-variant hover:text-primary"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="hidden sm:flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm">
              <ArrowRight size={18} />
              <span>العودة للرئيسية</span>
            </Link>
            <div className="relative hidden md:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
              <input 
                type="text" 
                placeholder="بحث سريع..." 
                className="bg-surface-container-highest border-none rounded-full pr-10 pl-4 py-1.5 text-sm w-48 lg:w-64 focus:ring-1 focus:ring-primary/30 transition-all text-on-surface outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-6">
            <button className="hidden sm:flex bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold items-center gap-2 hover:bg-primary hover:text-on-primary transition-all">
              <Plus size={14} />
              <span>خدمة جديدة</span>
            </button>
            <button className="text-on-surface-variant hover:text-on-surface transition-colors">
              <Bell size={20} />
            </button>
            <button className="hidden sm:block text-on-surface-variant hover:text-on-surface transition-colors">
              <Moon size={20} />
            </button>
            <button className="flex items-center gap-2 text-primary font-bold text-sm">
              <UserCircle size={20} />
              <span className="hidden sm:inline">الملف الشخصي</span>
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
