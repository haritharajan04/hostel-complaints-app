import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Hash, MapPin, Wrench, Shield, CheckCircle, Clipboard, UserCheck, AlertTriangle } from 'lucide-react';

const ComplaintDetailsModal = ({ complaintId, onClose, onSave, api }) => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [priority, setPriority] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await api.getComplaintById(complaintId);
        setComplaint(data);
        setStatus(data.status);
        setAssignedTo(data.assignedTo || '');
        setRemarks(data.remarks || '');
        setPriority(data.priority || 'Medium');
      } catch (err) {
        console.error('Error fetching complaint details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [complaintId, api]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateComplaint(complaintId, {
        status,
        assignedTo,
        remarks,
        priority
      });
      onSave(updated, `Complaint #${complaintId} updated successfully`);
    } catch (err) {
      console.error('Error updating complaint:', err);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (s) => {
    const configs = {
      'Pending': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'Assigned': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      'In Progress': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Resolved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'Rejected': 'bg-rose-500/10 text-rose-400 border-rose-500/20'
    };
    return `px-2.5 py-1 text-xs font-semibold rounded-full border ${configs[s] || 'bg-slate-500/10 text-slate-400'}`;
  };

  const getPriorityBadge = (p) => {
    const configs = {
      'High': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      'Medium': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'Low': 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    };
    return `px-2 py-0.5 text-xs font-medium rounded-md border ${configs[p] || 'bg-slate-500/10 text-slate-400'}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm">Fetching complaint logs...</p>
        </div>
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-blue-500 font-bold flex items-center gap-1">
              <Hash className="w-5 h-5" /> {complaint.id}
            </span>
            <span className={getStatusBadge(complaint.status)}>
              {complaint.status}
            </span>
            <span className={getPriorityBadge(complaint.priority)}>
              {complaint.priority} Priority
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/55 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Main Info Column */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
                {complaint.category} Category
              </span>
              <h2 className="text-2xl font-bold text-slate-100 mt-1">{complaint.title}</h2>
              <p className="text-slate-350 text-sm mt-3 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                {complaint.description}
              </p>

              {complaint.fileUrl && (
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attached Evidence Attachment</span>
                  <div className="w-full max-h-60 rounded-xl overflow-hidden border border-slate-850 bg-slate-950/80">
                    <img 
                      src={`http://localhost:5000${complaint.fileUrl}`} 
                      alt="Student uploaded attachment" 
                      className="w-full h-full object-contain max-h-60"
                      onError={(e) => {
                        e.target.src = complaint.fileUrl;
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Student & Location Meta */}
            <div className="grid grid-cols-2 gap-4 bg-slate-950/30 p-4 rounded-xl border border-slate-850/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Student Name</p>
                  <p className="text-sm font-semibold text-slate-200">{complaint.studentName || 'Anonymous Student'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Room Number</p>
                  <p className="text-sm font-semibold text-slate-200">{complaint.roomNumber || 'A-204'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 col-span-2 pt-2 border-t border-slate-850/30">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Filing Timestamp</p>
                  <p className="text-sm text-slate-300">
                    {new Date(complaint.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline Log */}
            <div>
              <h3 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Clipboard className="w-4 h-4 text-blue-400" />
                Complaint Timeline Log
              </h3>
              <div className="relative pl-6 border-l-2 border-slate-800 space-y-5 ml-3">
                {complaint.history && complaint.history.map((log, idx) => (
                  <div key={idx} className="relative">
                    {/* Ring Icon */}
                    <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border-2 border-blue-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                          {log.status}
                        </span>
                        <span className="text-[10px] text-slate-450">
                          {new Date(log.updatedAt).toLocaleString(undefined, {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{log.remarks}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Column */}
          <div className="lg:col-span-2 bg-slate-950/45 p-6 rounded-xl border border-slate-850 flex flex-col justify-between">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-2">
                Manage Operations
              </h3>

              {/* Status workflow dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-1.5 uppercase tracking-wide">
                  Transition Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Pending">Pending Review</option>
                  <option value="Assigned">Assigned (Technician)</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved / Repaired</option>
                  <option value="Rejected">Rejected / Closed</option>
                </select>
              </div>

              {/* Priority override */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-1.5 uppercase tracking-wide">
                  Set Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
              </div>

              {/* Staff Assignment */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-1.5 uppercase tracking-wide">
                  Assign Staff Member
                </label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g. Ramesh (Plumber), Warden"
                  className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg p-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Remarks logs */}
              <div>
                <label className="block text-xs font-semibold text-slate-450 mb-1.5 uppercase tracking-wide">
                  Admin Resolution Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows="3"
                  placeholder="Details of action taken, updates for students, or rejection grounds..."
                  className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg p-2.5 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving log...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" /> Save Dispatch Actions
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 leading-normal flex items-start gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>Saving updates writes directly to local storage and updates history audits instantly. Toggle database to connect SQL backend.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailsModal;
