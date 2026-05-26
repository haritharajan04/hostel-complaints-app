import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import ComplaintForm from './components/ComplaintForm';

// Admin imports
import Login from './pages/admin/Login';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ComplaintsList from './pages/admin/ComplaintsList';

// Dedicated Student Panel View preserving original voice integration logic
const StudentPanel = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComplaints = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/complaints');
      if (!response.ok) throw new Error('Failed to fetch complaints');
      const data = await response.json();
      setComplaints(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load recent complaints. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleComplaintAdded = (newComplaint) => {
    setComplaints(prev => [newComplaint, ...prev]);
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-[1200px] mx-auto p-8 font-sans select-none min-h-screen flex flex-col justify-between">
      <div>
        <header className="text-center mb-12 relative">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">
            HostelVoice
          </h1>
          <p className="text-slate-400 text-sm mt-2">Smart Offline Complaint Logging System</p>
          
          <Link 
            to="/admin/login" 
            className="absolute top-0 right-0 flex items-center gap-1 text-[11px] font-bold text-blue-500 hover:text-blue-400 border border-blue-500/20 hover:border-blue-500/40 bg-blue-500/5 px-3 py-1.5 rounded-lg transition-all"
          >
            <Shield className="w-3.5 h-3.5" /> Admin Console
          </Link>
        </header>

        <main>
          <div className="max-w-[600px] mx-auto">
            <ComplaintForm onComplaintAdded={handleComplaintAdded} />
          </div>

          <section className="mt-16">
            <h2 className="text-lg font-bold text-slate-300 border-b border-slate-800 pb-3 mb-6">
              Recent Complaints
            </h2>
            
            {loading ? (
              <p className="text-xs text-slate-450 italic">Loading complaints list...</p>
            ) : error ? (
              <p className="text-xs text-rose-400">{error}</p>
            ) : complaints.length === 0 ? (
              <p className="text-xs text-slate-450 italic">No complaints filed yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {complaints.map(complaint => (
                  <div key={complaint.id || complaint._id} className="bg-slate-900 border border-slate-850 rounded-xl p-5 flex flex-col justify-between shadow-lg">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase ${
                          complaint.category === 'Electrical' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          complaint.category === 'Plumbing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          complaint.category === 'Cleaning' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          complaint.category === 'Noise' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {complaint.category}
                        </span>
                        <span className="text-[10px] text-slate-450 font-mono">
                          {formatDate(complaint.createdAt)}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-200 text-sm truncate">{complaint.title}</h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">{complaint.description}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-850 flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">
                        Status: <strong className={
                          complaint.status === 'Pending' ? 'text-amber-400' :
                          complaint.status === 'Assigned' ? 'text-indigo-400' :
                          complaint.status === 'In Progress' ? 'text-blue-400' :
                          complaint.status === 'Resolved' ? 'text-emerald-400' :
                          'text-slate-450'
                        }>{complaint.status || 'Pending'}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <footer className="mt-16 pt-6 border-t border-slate-900 text-center text-[10px] text-slate-500">
        HostelVoice Smart Voice System &copy; 2026. Made with Tailwind CSS & React.
      </footer>
    </div>
  );
};

// Global Routing Configurations
function App() {
  return (
    <Router>
      <Routes>
        {/* Student View */}
        <Route path="/" element={<StudentPanel />} />
        
        {/* Admin Login Route */}
        <Route path="/admin/login" element={<Login />} />
        
        {/* Protected Admin Console Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="complaints" element={<ComplaintsList />} />
        </Route>
        
        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
