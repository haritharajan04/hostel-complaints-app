import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { 
  Search, SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, 
  Eye, Filter, RefreshCw, AlertCircle, Calendar, ShieldCheck
} from 'lucide-react';
import { apiService } from '../../services/api';
import ComplaintDetailsModal from '../../components/ComplaintDetailsModal';
import Toast from '../../components/Toast';

const ComplaintsList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // desc = latest, asc = oldest
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected complaint details modal state
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await apiService.getComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();

    // Establish Socket.IO real-time client connection inside admin console
    const socket = io();

    socket.on('complaint:created', (newComplaint) => {
      setComplaints(prev => {
        if (prev.some(c => c.id === newComplaint.id)) return prev;
        return [newComplaint, ...prev];
      });
      setToast({ 
        message: `🚨 New voice complaint filed from Room ${newComplaint.roomNumber || 'A-204'}!`, 
        type: 'warning' 
      });
    });

    socket.on('complaint:updated', (updatedComplaint) => {
      setComplaints(prev => prev.map(c => c.id === updatedComplaint.id ? updatedComplaint : c));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleUpdateSave = (updatedComplaint, successMsg) => {
    setComplaints(prev => prev.map(c => c.id === updatedComplaint.id ? updatedComplaint : c));
    setSelectedComplaintId(null);
    setToast({ message: successMsg, type: 'success' });
  };

  // Filtering & Search logics
  const filteredComplaints = complaints
    .filter(c => {
      const matchSearch = 
        c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter ? c.status === statusFilter : true;
      const matchCategory = categoryFilter ? c.category === categoryFilter : true;

      return matchSearch && matchStatus && matchCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  // Pagination calculation
  const totalItems = filteredComplaints.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedComplaints = filteredComplaints.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

  const getStatusBadge = (s) => {
    const configs = {
      'Pending': 'bg-amber-50 text-amber-600 border border-amber-200',
      'Assigned': 'bg-indigo-50 text-indigo-650 border border-indigo-200',
      'In Progress': 'bg-[#4F6DF5]/5 text-[#4F6DF5] border border-[#4F6DF5]/20',
      'Resolved': 'bg-[#2DDE8F]/5 text-[#2DDE8F] border border-[#2DDE8F]/20',
      'Rejected': 'bg-rose-50 text-rose-650 border border-rose-200'
    };
    return `px-3 py-1 text-xs font-semibold rounded-full ${configs[s] || 'bg-slate-50 text-slate-500 border border-slate-200'}`;
  };

  const getPriorityBadge = (p) => {
    const configs = {
      'High': 'text-rose-550 bg-rose-50 border border-rose-200',
      'Medium': 'text-amber-600 bg-amber-50 border border-amber-200',
      'Low': 'text-slate-500 bg-slate-50 border border-slate-200'
    };
    return `px-2 py-0.5 rounded text-[10px] font-semibold ${configs[p] || 'text-slate-500 bg-slate-50 border border-slate-200'}`;
  };

  return (
    <div className="space-y-6 flex-1 select-none animate-fade-in text-[#0F172A]">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#0F172A] flex items-center gap-2 font-poppins">
            Dispatcher Desk <ShieldCheck className="w-5.5 h-5.5 text-[#4F6DF5]" />
          </h2>
          <p className="text-slate-600 text-xs mt-1">Audit, route, and dispatch technician remarks in real-time.</p>
        </div>
        <button
          onClick={fetchComplaints}
          disabled={loading}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-slate-800 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          title="Reload logs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Control panel filter cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white border border-[#e2e8f0] rounded-3xl p-4 shadow-sm">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search room, student, issues..."
            className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#4F6DF5] focus:bg-white transition-colors"
          />
        </div>

        {/* Filter status */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#4F6DF5] focus:bg-white transition-colors appearance-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Filter category */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#4F6DF5] focus:bg-white transition-colors appearance-none"
          >
            <option value="">All Categories</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Noise">Noise</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Sorting order */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#4F6DF5] focus:bg-white transition-colors appearance-none"
          >
            <option value="desc">Latest Inbound</option>
            <option value="asc">Oldest Inbound</option>
          </select>
        </div>

      </div>

      {/* Main Datagrid list */}
      <div className="bg-white border border-[#e2e8f0] rounded-3xl shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-[#4F6DF5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 text-xs font-semibold">Updating datagrid query...</p>
          </div>
        ) : paginatedComplaints.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="font-bold text-[#0F172A] text-sm">No complaints logged yet</h3>
            <p className="text-[11px] text-slate-500 max-w-xs mt-1">Verify filters or await dynamic student submissions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-600 uppercase font-bold tracking-wider">
                  <th className="px-5 py-4 w-14">ID</th>
                  <th className="px-5 py-4">Student & Wing Info</th>
                  <th className="px-5 py-4">Issue Title & Telemetry</th>
                  <th className="px-5 py-4 w-28">Category</th>
                  <th className="px-5 py-4 w-24">Priority</th>
                  <th className="px-5 py-4 w-32">Status Badge</th>
                  <th className="px-5 py-4 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* ID */}
                    <td className="px-5 py-4 font-mono font-bold text-[#4F6DF5]">
                      #{c.id}
                    </td>

                    {/* Student name & room info */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#0F172A]">{c.studentName || 'Anonymous Student'}</div>
                      <div className="text-[10px] text-slate-600 mt-1 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                        Room {c.roomNumber || 'A-204'}
                      </div>
                    </td>

                    {/* Details title / description */}
                    <td className="px-5 py-4 max-w-sm">
                      <div className="font-semibold text-[#0F172A] truncate">{c.title}</div>
                      <p className="text-[11px] text-slate-500 mt-1 truncate max-w-xs">{c.description}</p>
                    </td>

                    {/* Category tags */}
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-600 uppercase">
                        {c.category}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="px-5 py-4">
                      <span className={getPriorityBadge(c.priority)}>
                        {c.priority}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={getStatusBadge(c.status)}>
                        {c.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => setSelectedComplaintId(c.id)}
                        className="p-2.5 rounded-lg bg-[#4F6DF5]/10 hover:bg-[#4F6DF5] text-[#4F6DF5] hover:text-white transition-all cursor-pointer inline-flex items-center justify-center border border-[#4F6DF5]/10"
                        title="Open Audit Panel"
                      >
                        <Eye className="w-4 h-4 stroke-[2]" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Navigation Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-semibold">
              Showing <span className="font-extrabold text-[#0F172A]">{startIndex + 1}</span> to{' '}
              <span className="font-extrabold text-[#0F172A]">
                {Math.min(startIndex + itemsPerPage, totalItems)}
              </span>{' '}
              of <span className="font-extrabold text-[#0F172A]">{totalItems}</span> complaint logs
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-[11px] px-3 font-bold text-slate-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Details action Modal popup overlay */}
      {selectedComplaintId && (
        <ComplaintDetailsModal
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
          onSave={handleUpdateSave}
          api={apiService}
        />
      )}

      {/* Custom feedback toast notifications */}
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

export default ComplaintsList;
