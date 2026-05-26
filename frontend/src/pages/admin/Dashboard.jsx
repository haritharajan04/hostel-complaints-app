import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, AlertCircle, Clock, CheckCircle, XCircle, 
  Wrench, ShieldAlert, Sparkles, ChevronRight, BarChart3
} from 'lucide-react';
import { apiService } from '../../services/api';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getComplaints();
        setComplaints(data);
      } catch (err) {
        console.error('Error fetching dashboard complaints:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Compute metrics
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const rejectedCount = complaints.filter(c => c.status === 'Rejected').length;

  // Category counts
  const categoryCounts = complaints.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  const categories = Object.keys(categoryCounts).map(name => ({
    name,
    count: categoryCounts[name],
    percentage: totalCount > 0 ? Math.round((categoryCounts[name] / totalCount) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  const getStatusText = (status) => {
    if (status === 'Assigned') return 'Assigned';
    return status;
  };

  const getStatusColor = (s) => {
    const configs = {
      'Pending': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      'Assigned': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      'In Progress': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      'Resolved': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      'Rejected': 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    };
    return configs[s] || 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  const kpis = [
    { label: 'Total Logs', value: totalCount, icon: <ClipboardList className="w-6 h-6" />, color: 'from-blue-600/20 to-blue-700/5 text-blue-400 border-blue-500/20' },
    { label: 'Pending Review', value: pendingCount, icon: <AlertCircle className="w-6 h-6" />, color: 'from-amber-600/20 to-amber-700/5 text-amber-400 border-amber-500/20' },
    { label: 'In Progress', value: inProgressCount, icon: <Clock className="w-6 h-6" />, color: 'from-indigo-600/20 to-indigo-700/5 text-indigo-400 border-indigo-500/20' },
    { label: 'Resolved', value: resolvedCount, icon: <CheckCircle className="w-6 h-6" />, color: 'from-emerald-600/20 to-emerald-700/5 text-emerald-400 border-emerald-500/20' }
  ];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] select-none">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm font-medium">Assembling analytics overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none animate-fade-in flex-1">
      
      {/* Header bar welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            Operations Center <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
          </h2>
          <p className="text-slate-400 text-xs mt-1">Real-time telemetry and management controls of hostel issues.</p>
        </div>
        <button
          onClick={() => navigate('/admin/complaints')}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold text-white text-xs rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer transition-colors"
        >
          Dispatch Actions Desk <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div 
            key={idx} 
            className={`bg-gradient-to-br ${kpi.color} border backdrop-blur-md rounded-2xl p-5 flex items-center justify-between shadow-xl transition-all duration-300 hover:translate-y-[-2px]`}
          >
            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{kpi.label}</span>
              <p className="text-3xl font-black text-slate-100">{kpi.value}</p>
            </div>
            <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5">
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Analytical Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Category distribution */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-850 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" /> Issue Distribution
            </h3>
            
            {categories.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 italic">No distribution logs yet</div>
            ) : (
              <div className="mt-5 space-y-4">
                {categories.map((cat, idx) => {
                  const colors = {
                    'Electrical': 'bg-amber-500',
                    'Plumbing': 'bg-blue-500',
                    'Cleaning': 'bg-emerald-500',
                    'Noise': 'bg-rose-500',
                    'Other': 'bg-slate-400'
                  };
                  const barColor = colors[cat.name] || 'bg-slate-450';
                  
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-300">{cat.name}</span>
                        <span className="text-slate-450">{cat.count} logs ({cat.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850/50">
                        <div 
                          className={`h-full ${barColor} rounded-full transition-all duration-500`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-850/40 text-[10px] text-slate-500 text-center leading-normal">
            Distributions represent voice tag categorization parsed by client AI engine.
          </div>
        </div>

        {/* Live System Logs / Recents */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-850 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-500" /> Recent Dispatch Alerts
            </h3>

            {complaints.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-550 italic">No telemetry reports received</div>
            ) : (
              <div className="mt-4 divide-y divide-slate-850">
                {complaints.slice(0, 4).map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200 truncate">{c.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border shrink-0 ${getStatusColor(c.status)}`}>
                          {getStatusText(c.status)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-450 mt-1 truncate">
                        Filed by <span className="text-slate-350">{c.studentName}</span> in Room <span className="text-slate-350">{c.roomNumber}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 font-medium font-mono">
                      {new Date(c.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/admin/complaints')}
            className="w-full mt-6 py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 hover:text-slate-100 text-xs font-bold rounded-xl border border-slate-850 hover:border-slate-800 transition-all text-center cursor-pointer"
          >
            Access All Complaint Telemetry
          </button>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
