import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { apiService } from '../../services/api';
import Toast from '../../components/Toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Redirect to Dashboard if already authenticated
  useEffect(() => {
    if (apiService.isAuthenticated()) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all credentials fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiService.login(username, password);
      setToast({ message: 'Authentication successful! Redirecting...', type: 'success' });
      setTimeout(() => {
        navigate('/admin/dashboard', { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid username or credentials keys');
      setToast({ message: 'Access denied: Invalid credentials', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative font-sans select-none overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-650/15 blur-[120px] pointer-events-none" />

      {/* Main Glass card container */}
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-2xl p-8 shadow-2xl relative z-10 animate-fade-in">
        
        {/* Branding header logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600/10 border border-blue-500/25 rounded-2xl flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/5 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-wide text-center">Admin Console</h2>
          <p className="text-slate-400 text-xs mt-1 text-center font-medium">Hostel Complaint Management System</p>
        </div>

        {/* Localized Form error message */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs leading-normal animate-slide-down">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Operator Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-950/60 text-slate-200 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Access Code Key
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/60 text-slate-200 border border-slate-800 rounded-xl pl-10 pr-11 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 cursor-pointer"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick tips display */}
          <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-850/60 flex items-center justify-between text-[11px] text-slate-500">
            <span>Demo user: <strong className="text-slate-400">admin</strong></span>
            <span>Demo code: <strong className="text-slate-400">admin123</strong></span>
          </div>

          {/* Login Submission button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-3 rounded-xl text-sm transition-colors mt-2 cursor-pointer shadow-lg shadow-blue-500/10 hover:shadow-blue-500/15"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verifying Access...
              </div>
            ) : (
              'Verify Access Authorization'
            )}
          </button>
        </form>
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

export default Login;
