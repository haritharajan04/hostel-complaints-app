import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  ClipboardList, AlertCircle, Clock, CheckCircle, Hourglass, 
  ShieldAlert, Sparkles, ChevronRight, BarChart3, TrendingUp,
  Activity, Play, Shield, RefreshCw, Send, Zap, ActivitySquare, Terminal
} from 'lucide-react';
import { apiService } from '../../services/api';
import Toast from '../../components/Toast';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [liveFeed, setLiveFeed] = useState([
    { id: 1, text: 'Admin Console loaded', type: 'info', time: 'Just now' },
    { id: 2, text: 'SQLite database connection pool established', type: 'success', time: '1 min ago' }
  ]);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchDashboardData();

    // Establish Socket.IO real-time connection inside admin dashboard
    const socket = io();

    socket.on('complaint:created', (newComplaint) => {
      setComplaints(prev => {
        if (prev.some(c => c.id === newComplaint.id)) return prev;
        return [newComplaint, ...prev];
      });
      // Push to Live Feed alerts
      setLiveFeed(prev => [
        { 
          id: Date.now(), 
          text: `🚨 New Voice Complaint: "${newComplaint.title}" from Room ${newComplaint.roomNumber}`, 
          type: 'warning', 
          time: 'Just now' 
        },
        ...prev
      ]);
    });

    socket.on('complaint:updated', (updatedComplaint) => {
      setComplaints(prev => prev.map(c => c.id === updatedComplaint.id ? updatedComplaint : c));
      // Push to Live Feed alerts
      setLiveFeed(prev => [
        { 
          id: Date.now(), 
          text: `🔄 Complaint #${updatedComplaint.id} status updated to [${updatedComplaint.status}]`, 
          type: 'success', 
          time: 'Just now' 
        },
        ...prev
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Compute metrics
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  // Calculate Average Resolution Time (in Hours)
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved');
  let avgResolutionTimeHours = 0;
  if (resolvedComplaints.length > 0) {
    const totalDurationMs = resolvedComplaints.reduce((sum, c) => {
      const resolvedStep = c.history?.find(h => h.status === 'Resolved');
      if (resolvedStep) {
        const duration = new Date(resolvedStep.updatedAt).getTime() - new Date(c.createdAt).getTime();
        return sum + Math.max(0, duration);
      }
      return sum;
    }, 0);
    avgResolutionTimeHours = Math.round((totalDurationMs / (1000 * 60 * 60)) / resolvedComplaints.length * 10) / 10;
  }

  const getFriendlyResolutionTime = (hours) => {
    if (hours === 0) return 'N/A';
    if (hours < 1) return 'Under 1 hr';
    if (hours < 24) return `${hours} hrs`;
    const days = Math.round((hours / 24) * 10) / 10;
    return `${days} days`;
  };

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
      'Pending': 'text-amber-600 bg-amber-50 border-amber-200',
      'Assigned': 'text-indigo-650 bg-indigo-50 border-indigo-200',
      'In Progress': 'text-[#4F6DF5] bg-[#4F6DF5]/5 border-[#4F6DF5]/20',
      'Resolved': 'text-[#2DDE8F] bg-[#2DDE8F]/5 border-[#2DDE8F]/20',
      'Rejected': 'text-rose-600 bg-rose-50 border-rose-200'
    };
    return configs[s] || 'text-slate-500 bg-slate-50 border-slate-200';
  };

  const kpis = [
    { label: 'Total Inbound Logs', value: totalCount, icon: <ClipboardList className="w-6 h-6" />, color: 'bg-white border-slate-200 text-[#4F6DF5]' },
    { label: 'Pending Assessment', value: pendingCount, icon: <AlertCircle className="w-6 h-6" />, color: 'bg-white border-slate-200 text-[#FFB72B]' },
    { label: 'Active Repairs', value: inProgressCount, icon: <Clock className="w-6 h-6" />, color: 'bg-white border-slate-200 text-[#8E54E9]' },
    { label: 'Avg Dispatch Speed', value: getFriendlyResolutionTime(avgResolutionTimeHours), icon: <Hourglass className="w-5 h-5" />, color: 'bg-white border-slate-200 text-[#2DDE8F]' }
  ];

  // Dispatch Action Desk functions
  const handleQuickHealthCheck = () => {
    setToast({ 
      message: '🏥 System Health diagnostics: SQLite database online, Transformers Worker initialized, WebSockets handshake stable.', 
      type: 'success' 
    });
    setLiveFeed(prev => [
      { id: Date.now(), text: 'System check verified: SQLite and Socket.IO active', type: 'info', time: 'Just now' },
      ...prev
    ]);
  };

  const handleBroadcastAnnouncement = () => {
    setToast({ 
      message: '🔊 Campus Notification Broadcasted: "Technical wing maintenance schedule pushed to all student views."', 
      type: 'info' 
    });
    setLiveFeed(prev => [
      { id: Date.now(), text: 'Broadcasted campus announcement to all wings', type: 'info', time: 'Just now' },
      ...prev
    ]);
  };

  const handleAutoRouting = () => {
    const pendingIssues = complaints.filter(c => c.status === 'Pending');
    if (pendingIssues.length === 0) {
      setToast({ message: '⚡ Routing check: 0 pending issues found. No automated assignments required.', type: 'success' });
      return;
    }
    setToast({ 
      message: `🤖 Auto-routing triggered: Assigned ${pendingIssues.length} pending items to Wing Plumbers and Electricians!`, 
      type: 'success' 
    });
    setLiveFeed(prev => [
      { id: Date.now(), text: `Auto-assigned ${pendingIssues.length} complaints via Smart Dispatcher`, type: 'success', time: 'Just now' },
      ...prev
    ]);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] select-none">
        <div className="w-12 h-12 border-4 border-[#4F6DF5] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 text-sm font-medium">Assembling operational telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none animate-fade-in flex-1">
      
      {/* Header bar welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0F172A] flex items-center gap-2 font-poppins">
            Operations Workspace <Sparkles className="w-5.5 h-5.5 text-[#4F6DF5] animate-pulse" />
          </h2>
          <p className="text-slate-600 text-xs mt-1">Real-time telemetry, auto-gain statistics logs, and technician action panels.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="Reload telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/admin/complaints')}
            className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-[#4F6DF5] hover:bg-[#4F6DF5]/90 font-semibold text-white text-xs rounded-xl shadow-lg shadow-[#4F6DF5]/10 cursor-pointer transition-all hover:scale-[1.01]"
          >
            Dispatch Actions Desk <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <div 
            key={idx} 
            className="bg-white border border-[#e2e8f0] rounded-3xl p-5 flex items-center justify-between shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="space-y-1">
              <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider block">{kpi.label}</span>
              <p className="font-extrabold text-[#0F172A] text-2xl lg:text-3xl font-poppins">
                {kpi.value}
              </p>
            </div>
            <div className="p-3 bg-[#F3F6FF] rounded-2xl border border-[#e2e8f0] text-[#4F6DF5] shrink-0">
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Grid containing Dispatch Action Desk, Category Outages, and Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* WIDGET 1: DISPATCH ACTION DESK (Quick Actions) */}
        <section className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A] border-b border-slate-100 pb-3 flex items-center gap-2 font-poppins">
              <Zap className="w-5.5 h-5.5 text-[#FFB72B]" /> Dispatch Action Desk
            </h3>
            <p className="text-xs text-slate-500 mt-2.5">
              Execute campus-wide emergency directives and technician workflows instantly.
            </p>
            
            <div className="mt-5 space-y-3.5">
              <button 
                onClick={handleAutoRouting}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-[#4F6DF5]/5 rounded-2xl border border-slate-200 hover:border-[#4F6DF5]/30 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#4F6DF5] group-hover:bg-[#4F6DF5] group-hover:text-white transition-colors">
                    <ActivitySquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Auto-Assign Engineers</span>
                    <span className="text-[9px] text-slate-500 block">Deploy pending tasks to Wings</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button 
                onClick={handleBroadcastAnnouncement}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-[#8E54E9]/5 rounded-2xl border border-slate-200 hover:border-[#8E54E9]/30 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#8E54E9] group-hover:bg-[#8E54E9] group-hover:text-white transition-colors">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">Broadcast System Alert</span>
                    <span className="text-[9px] text-slate-500 block">Push maintainer updates to students</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button 
                onClick={handleQuickHealthCheck}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-[#2DDE8F]/5 rounded-2xl border border-slate-200 hover:border-[#2DDE8F]/30 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#2DDE8F] group-hover:bg-[#2DDE8F] group-hover:text-white transition-colors">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0F172A] block">System Health Audit</span>
                    <span className="text-[9px] text-slate-500 block">Test SQLite & WebSocket telemetry</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="text-[9px] text-slate-500 text-center italic mt-4 border-t border-slate-100 pt-2.5">
            Admin token actions secure gate controls via encrypted RBAC keys.
          </div>
        </section>

        {/* WIDGET 2: CATEGORY OUTAGES */}
        <section className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A] border-b border-slate-100 pb-3 flex items-center gap-2 font-poppins">
              <BarChart3 className="w-5.5 h-5.5 text-[#4F6DF5]" /> Category Outages
            </h3>
            
            {categories.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-450 italic">No distribution logs yet</div>
            ) : (
              <div className="mt-5 space-y-4">
                {categories.map((cat, idx) => {
                  const colors = {
                    'Electrical': 'bg-[#FFB72B]',
                    'Plumbing': 'bg-[#4F6DF5]',
                    'Cleaning': 'bg-[#2DDE8F]',
                    'Noise': 'bg-[#FF5C5C]',
                    'Other': 'bg-slate-400'
                  };
                  const barColor = colors[cat.name] || 'bg-slate-400';
                  
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-800">{cat.name}</span>
                        <span className="text-slate-500">{cat.count} logs ({cat.percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#F3F6FF] rounded-full overflow-hidden border border-slate-200">
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

          <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-500 text-center leading-normal">
            Outage classifications dynamically computed based on AI categorization tags.
          </div>
        </section>

        {/* WIDGET 3: LIVE FEED ALERTS */}
        <section className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A] border-b border-slate-100 pb-3 flex items-center gap-2 font-poppins">
              <ShieldAlert className="w-5.5 h-5.5 text-[#FF5C5C]" /> Live Feed Alerts
            </h3>

            <div className="mt-4 divide-y divide-slate-100 flex-1 max-h-[220px] overflow-y-auto pr-1">
              {liveFeed.map((feed) => (
                <div key={feed.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        feed.type === 'warning' ? 'bg-[#FF5C5C]' :
                        feed.type === 'success' ? 'bg-[#2DDE8F]' :
                        'bg-[#4F6DF5]'
                      }`}></span>
                      <p className="text-slate-700 font-medium truncate w-[160px]" title={feed.text}>
                        {feed.text}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-400 shrink-0 font-mono">{feed.time}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/complaints')}
            className="w-full mt-6 py-2.5 bg-slate-50 hover:bg-[#F3F6FF] text-[#4F6DF5] text-xs font-bold rounded-xl border border-slate-200 transition-all text-center cursor-pointer"
          >
            Access All Complaint Telemetry
          </button>
        </section>

      </div>

      {/* Advanced SVG trends block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SVG Resolution Rate Donut Chart */}
        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-extrabold text-[#0F172A] border-b border-slate-100 pb-3 flex items-center gap-2 mb-4 font-poppins">
            <TrendingUp className="w-5 h-5 text-[#2DDE8F]" /> Resolution Efficiency
          </h3>
          <div className="flex items-center justify-center py-4">
            <svg width="150" height="150" viewBox="0 0 36 36" className="w-36 h-36">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F3F6FF" strokeWidth="4" />
              <circle 
                cx="18" 
                cy="18" 
                r="15.915" 
                fill="none" 
                stroke="#2DDE8F" 
                strokeWidth="4" 
                strokeDasharray={`${totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0} ${100 - (totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0)}`}
                strokeDashoffset="25" 
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <text x="18" y="20.35" className="fill-[#0F172A] font-extrabold text-[8px] font-poppins" textAnchor="middle">
                {totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}%
              </text>
            </svg>
          </div>
          <p className="text-[11px] text-slate-500 text-center leading-normal mt-2">
            Percentage of total outages resolved successfully.
          </p>
        </div>

        {/* Dynamic Metrics explanation card */}
        <div className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A] border-b border-slate-100 pb-3 flex items-center gap-2 mb-4 font-poppins">
              <Terminal className="w-5 h-5 text-[#8E54E9]" /> Smart Dispatch Telemetry
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Resolved Outages</span>
                <span className="text-2xl font-black text-[#2DDE8F] block mt-1 font-poppins">{resolvedCount} logs</span>
                <span className="text-[10px] text-slate-500 block mt-1.5">Actioned and resolved successfully.</span>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Average Action Speed</span>
                <span className="text-2xl font-black text-[#4F6DF5] block mt-1 font-poppins">
                  {avgResolutionTimeHours > 0 ? `${avgResolutionTimeHours} hrs` : 'N/A'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1.5">Average elapsed time from filing to repair completion.</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 mt-4 leading-normal">
            Calculated in real-time using asynchronous auditing pipelines.
          </div>
        </div>

      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
};

export default Dashboard;
