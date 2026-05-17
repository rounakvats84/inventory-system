import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, LayoutDashboard, Database, LogOut, BarChart3, Hexagon } from 'lucide-react';
import { motion } from 'framer-motion';

import { ShoppingCart } from 'lucide-react';

const Layout = ({ user, onLogout }) => {
  const location = useLocation();

  const navItems = user?.role === 'Admin' ? [
    { name: 'Inventory', path: '/inventory', icon: Database },
    { name: 'Restock History', path: '/purchases', icon: Package },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Orders', path: '/admin-orders', icon: LayoutDashboard }
  ] : [
    { name: 'Catalog', path: '/products', icon: Package },
    { name: 'My Cart', path: '/cart', icon: ShoppingCart },
    { name: 'My Orders', path: '/orders', icon: LayoutDashboard }
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row text-slate-100 selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-full md:w-64 md:h-screen glass-panel border-r-0 md:border-r border-b md:border-b-0 flex-shrink-0 relative z-20 flex flex-col justify-between sticky top-0">
        <div className="flex-1 overflow-y-auto">
            <div className="h-20 flex items-center px-6 border-b border-white/5 bg-black/10">
              <Hexagon className="w-8 h-8 text-indigo-400 mr-3" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">SmartInv</h1>
            </div>
            <nav className="p-4 space-y-2 mt-4">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="relative block"
                  >
                    {active && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute inset-0 bg-indigo-500/20 rounded-xl border border-indigo-500/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <div className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${active ? 'text-indigo-300 font-semibold shadow-inner' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}`}>
                        <Icon className={`w-5 h-5 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <span>{item.name}</span>
                    </div>
                  </Link>
                )
              })}
            </nav>
        </div>
        
        <div className="p-4 border-t border-white/5 bg-black/10 mt-auto sticky bottom-0 z-50">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-200">{user?.name}</span>
              <span className="text-xs text-indigo-400/80 font-medium tracking-wide">{user?.role}</span>
            </div>
            <button onClick={onLogout} className="p-2 text-slate-500 group-hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
