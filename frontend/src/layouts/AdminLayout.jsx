import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, LogOut, Sun, Moon, Shield, Menu, X, User } from 'lucide-react';
import { apiService } from '../services/api';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Route Guard Interceptor
  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const rootClass = document.documentElement.classList;
    if (darkMode) {
      rootClass.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      rootClass.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [darkMode]);

  const handleLogout = () => {
    apiService.logout();
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Complaints', path: '/admin/complaints', icon: <ClipboardList className="w-5 h-5" /> }
  ];

  const activeClass = 'bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20';
  const inactiveClass = 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-all';

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans`}>
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-500" />
          <span className="font-bold text-lg tracking-wide text-slate-100">HostelVoice <span className="text-blue-500 text-xs">Admin</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-slate-800 text-slate-350 hover:text-slate-250 cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-850 p-6 flex flex-col justify-between transform transition-transform duration-300 md:relative md:transform-none md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:flex'}
      `}>
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="hidden md:flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-blue-500" />
            <div>
              <h1 className="font-extrabold text-lg tracking-wide text-slate-100">HostelVoice</h1>
              <p className="text-[10px] uppercase font-bold text-blue-400 tracking-widest mt-0.5">Admin Management</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${isActive ? activeClass : inactiveClass}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Settings Footer */}
        <div className="space-y-4 pt-6 border-t border-slate-850">
          <div className="hidden md:flex items-center justify-between px-2">
            <span className="text-xs text-slate-400">Appearance</span>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-850 border border-slate-700 flex items-center justify-center text-blue-400 font-bold uppercase">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-200 truncate">Hostel Administrator</h4>
              <p className="text-[10px] text-slate-450 truncate">admin@hostel.edu</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-800/80 hover:text-rose-400 text-slate-300 text-sm font-semibold py-2.5 rounded-xl border border-slate-750 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out Session
          </button>
        </div>
      </aside>

      {/* Overlay for Mobile Sidebar */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Main View Area */}
      <main className="flex-1 overflow-x-hidden p-6 md:p-10 flex flex-col justify-start">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
