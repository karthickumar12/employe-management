import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { LogIn, Key, Mail, Lock, ShieldAlert, Sparkles, User, Briefcase, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickFill = (demoEmail, demoPassword = 'password123') => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedUser = await login(email, password);
      setToast({ message: `Welcome back, ${loggedUser.name}!`, type: 'success' });
      setTimeout(() => {
        if (loggedUser.role === 'admin') navigate('/admin/dashboard');
        else if (loggedUser.role === 'recruiter') navigate('/recruiter/dashboard');
        else navigate('/candidate/dashboard');
      }, 500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Login failed. Please verify credentials.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center font-bold mx-auto mb-2">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Portal Sign In</h1>
            <p className="text-xs text-slate-500">Access Admin, Recruiter, or Candidate accounts.</p>
          </div>

          {/* Quick Fill Demo Test Credentials Buttons */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <p className="font-bold text-slate-800 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Demo Test Credentials (1-Click Fill):
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@recruitment.com')}
                className="w-full text-left p-2 bg-white rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-purple-900 text-[11px] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> System Admin
                  </p>
                  <p className="text-[10px] text-slate-500">admin@recruitment.com</p>
                </div>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">Fill</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('sarah.recruiter@recruitment.com')}
                className="w-full text-left p-2 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-blue-900 text-[11px] flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" /> HR Recruiter Lead
                  </p>
                  <p className="text-[10px] text-slate-500">sarah.recruiter@recruitment.com</p>
                </div>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Fill</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('karthick.candidate@recruitment.com')}
                className="w-full text-left p-2 bg-white rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-emerald-900 text-[11px] flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-600" /> Candidate (Karthickumar)
                  </p>
                  <p className="text-[10px] text-slate-500">karthick.candidate@recruitment.com</p>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Fill</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@recruitment.com"
                  className="w-full text-xs pl-9 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-9 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Sign In to Account'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-primary-600 hover:underline">
              Register here
            </Link>
          </p>

        </div>
      </main>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <Footer />
    </div>
  );
};

export default Login;
