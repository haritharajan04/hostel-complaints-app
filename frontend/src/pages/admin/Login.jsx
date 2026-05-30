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
    <div className="min-h-screen bg-[#F3F6FF] flex flex-col items-center justify-center p-4 relative font-sans select-none overflow-hidden">
      {/* Soft Harmonic Glowing Ambient Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#4F6DF5]/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#8E54E9]/10 blur-[100px] pointer-events-none" />

      {/* Main Premium Card container */}
      <div className="w-full max-w-md bg-white border border-[#e2e8f0] rounded-3xl p-8 shadow-xl relative z-10 animate-fade-in">
        
        {/* Branding header logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#4F6DF5]/10 border border-[#4F6DF5]/20 rounded-2xl flex items-center justify-center text-[#4F6DF5] shadow-lg shadow-[#4F6DF5]/5 mb-4">
            <Shield className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight text-center font-poppins">Admin Console</h2>
          <p className="text-[#475569] text-xs mt-1 text-center font-medium">Hostel Complaint Management System</p>
        </div>

        {/* Localized Form error message */}
        {error && (
          <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs leading-normal animate-slide-down">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Operator Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#4F6DF5] focus:bg-white transition-colors"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Access Code Key
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-xl pl-10 pr-11 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#4F6DF5] focus:bg-white transition-colors"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick tips display */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>Demo user: <strong className="text-slate-700">admin</strong></span>
            <span>Demo code: <strong className="text-slate-700">admin123</strong></span>
          </div>

          {/* Login Submission button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-[#4F6DF5] hover:bg-[#4F6DF5]/90 disabled:bg-[#4F6DF5]/50 text-white font-semibold py-3 rounded-xl text-sm transition-colors mt-2 cursor-pointer shadow-lg shadow-[#4F6DF5]/20 hover:shadow-[#4F6DF5]/30"
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
