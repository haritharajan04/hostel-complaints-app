import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, LogOut, Sun, Shield, Menu, X, User } from 'lucide-react';
import { apiService } from '../services/api';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Route Guard Interceptor
  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    // Explicitly enforce Light Theme Mode globally for premium Linear look
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }, []);

  const handleLogout = () => {
    apiService.logout();
    navigate('/admin/login', { replace: true });
  };

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Complaints', path: '/admin/complaints', icon: <ClipboardList className="w-5 h-5" /> }
  ];

  const activeClass = 'bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-500 shadow-sm';
  const inactiveClass = 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all';

  return (
    <div className="min-h-screen bg-[#F3F6FF] text-[#0F172A] flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <span className="font-extrabold text-base tracking-wide text-slate-900">HostelVoice <span className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-0.5 rounded">Admin</span></span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-700 cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between transform transition-transform duration-300 md:relative md:transform-none md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:flex'}
      `}>
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="hidden md:flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-blue-600" />
            <div>
              <h1 className="font-black text-lg tracking-wide text-slate-900">HostelVoice</h1>
              <p className="text-[10px] uppercase font-bold text-violet-500 tracking-widest mt-0.5">Admin Management</p>
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
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600 font-bold uppercase">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-800 truncate">Hostel Administrator</h4>
              <p className="text-[10px] text-slate-450 truncate">admin@hostel.edu</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-655 text-sm font-semibold py-2.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
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
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs md:hidden"
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
