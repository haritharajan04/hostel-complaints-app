import React, { useState, useEffect } from 'react';
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
  }, []);

  const handleUpdateSave = (updatedComplaint, successMsg) => {
    // Update local state instantly so datagrid updates
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

  // Auto reset pagination page if filters reduce result set size
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

  const getStatusBadge = (s) => {
    const configs = {
      'Pending': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'Assigned': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Resolved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Rejected': 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };
    return `px-2.5 py-1 text-xs font-semibold rounded-full border ${configs[s] || 'bg-slate-500/10 text-slate-455 border-slate-500/20'}`;
  };

  const getPriorityBadge = (p) => {
    const configs = {
      'High': 'text-rose-400 bg-rose-500/5',
      'Medium': 'text-amber-400 bg-amber-500/5',
      'Low': 'text-slate-400 bg-slate-500/5'
    };
    return `px-1.5 py-0.5 rounded text-[10px] font-semibold border border-current ${configs[p] || 'text-slate-400'}`;
  };

  return (
    <div className="space-y-6 flex-1 select-none animate-fade-in">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
            Dispatcher Desk <ShieldCheck className="w-5.5 h-5.5 text-blue-500" />
          </h2>
          <p className="text-slate-400 text-xs mt-1">Audit, categorize, route, and update status of student complaints.</p>
        </div>
        <button
          onClick={fetchComplaints}
          disabled={loading}
          className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-slate-450 hover:text-slate-200 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          title="Reload logs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Control panel filter cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900 border border-slate-850 rounded-2xl p-4 shadow-xl">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search room, student, text..."
            className="w-full bg-slate-950/60 text-slate-250 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter status */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950/60 text-slate-250 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-colors appearance-none"
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
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-950/60 text-slate-250 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-colors appearance-none"
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
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full bg-slate-950/60 text-slate-250 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 transition-colors appearance-none"
          >
            <option value="desc">Latest Inbound</option>
            <option value="asc">Oldest Inbound</option>
          </select>
        </div>

      </div>

      {/* Main Datagrid list */}
      <div className="bg-slate-900 border border-slate-850 rounded-2xl shadow-xl overflow-hidden">
        
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 text-xs font-semibold">Updating datatable query...</p>
          </div>
        ) : paginatedComplaints.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-slate-600 mb-3" />
            <h3 className="font-bold text-slate-200 text-sm">No telemetry matching results found</h3>
            <p className="text-[11px] text-slate-500 max-w-xs mt-1">Try resetting the drop down filter arrays or search term.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 bg-slate-950/45 text-slate-450 uppercase font-bold tracking-wider">
                  <th className="px-5 py-4 w-14">ID</th>
                  <th className="px-5 py-4">Student & Location</th>
                  <th className="px-5 py-4">Issue Details</th>
                  <th className="px-5 py-4 w-28">Category</th>
                  <th className="px-5 py-4 w-24">Priority</th>
                  <th className="px-5 py-4 w-32">Status Badge</th>
                  <th className="px-5 py-4 w-20 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {paginatedComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-850/30 transition-colors">
                    
                    {/* ID */}
                    <td className="px-5 py-4 font-mono font-bold text-blue-400">
                      #{c.id}
                    </td>

                    {/* Student name & room info */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-200">{c.studentName || 'Anonymous'}</div>
                      <div className="text-[10px] text-slate-450 mt-1 font-medium bg-slate-950 px-2 py-0.5 rounded border border-slate-850 inline-block">
                        Room {c.roomNumber || 'A-204'}
                      </div>
                    </td>

                    {/* Details title / description */}
                    <td className="px-5 py-4 max-w-sm">
                      <div className="font-semibold text-slate-200 truncate">{c.title}</div>
                      <p className="text-[11px] text-slate-450 mt-1 truncate max-w-xs">{c.description}</p>
                    </td>

                    {/* Category tags */}
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-950 border border-slate-850 text-slate-350 uppercase">
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
                        className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white transition-all cursor-pointer inline-flex items-center justify-center border border-blue-500/10"
                        title="Edit Dispatch Log"
                      >
                        <Eye className="w-4 h-4" />
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
          <div className="px-5 py-4 bg-slate-950/45 border-t border-slate-850 flex items-center justify-between">
            <span className="text-[10px] text-slate-450">
              Showing <span className="font-bold text-slate-300">{startIndex + 1}</span> to{' '}
              <span className="font-bold text-slate-300">
                {Math.min(startIndex + itemsPerPage, totalItems)}
              </span>{' '}
              of <span className="font-bold text-slate-300">{totalItems}</span> complaint logs
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-[11px] px-3 font-semibold text-slate-300">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
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
