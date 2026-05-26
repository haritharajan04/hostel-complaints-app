import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const config = {
    success: {
      bgColor: 'bg-slate-900/90 border-emerald-500/30 text-emerald-400',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
      title: 'Success'
    },
    warning: {
      bgColor: 'bg-slate-900/90 border-amber-500/30 text-amber-400',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      title: 'Warning'
    },
    error: {
      bgColor: 'bg-slate-900/90 border-rose-500/30 text-rose-400',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      title: 'Error'
    }
  };

  const current = config[type] || config.success;

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-in ${current.bgColor} max-w-sm`}>
      {current.icon}
      <div className="flex-1">
        <h4 className="font-semibold text-sm text-slate-100">{current.title}</h4>
        <p className="text-xs mt-0.5 text-slate-300">{message}</p>
      </div>
      <button 
        onClick={onClose} 
        className="text-slate-400 hover:text-slate-200 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
