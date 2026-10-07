import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-in fade-in slide-in-from-bottom-5 duration-300 ${
      isSuccess 
        ? 'bg-emerald-900 text-emerald-100 border-emerald-700 shadow-emerald-900/20' 
        : 'bg-rose-900 text-rose-100 border-rose-700 shadow-rose-900/20'
    }`}>
      {isSuccess ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
      )}
      <span className="pr-2">{message}</span>
      <button 
        onClick={onClose}
        className="p-1 rounded-md hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
