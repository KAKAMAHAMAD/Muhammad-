import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Package, Users, History, Settings, Calculator, ShoppingCart, Menu, X } from 'lucide-react';
import { useStore } from '../store';

type Tab = 'dashboard' | 'inventory' | 'customers' | 'pos' | 'history' | 'calculator' | 'settings';

interface LayoutProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { cart } = useStore();

  const navItems: { id: string; label: string; icon: any; badge?: number | null }[] = [
    { id: 'dashboard', label: 'سەرەکی', icon: LayoutDashboard },
    { id: 'pos', label: 'فرۆشتن', icon: ShoppingCart, badge: cart.length > 0 ? cart.length : null },
    { id: 'inventory', label: 'کۆگا', icon: Package },
    { id: 'customers', label: 'کڕیارەکان', icon: Users },
    { id: 'history', label: 'مێژوو', icon: History },
    { id: 'calculator', label: 'ژمێرەر', icon: Calculator },
    { id: 'settings', label: 'ڕێکخستنەکان', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-64 bg-white border-l border-slate-200 shadow-xl flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <h1 className="text-2xl font-bold text-indigo-600">کۆگاکەم</h1>
          <button className="lg:hidden text-slate-500" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as Tab);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="mr-auto bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 lg:px-8 justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-slate-800 hidden sm:block">
              {navItems.find((i) => i.id === activeTab)?.label}
            </h2>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 lg:p-8 pb-24 lg:pb-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};
