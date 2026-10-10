import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { Mail, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, KeyRound, Clock, ShieldCheck } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [toast, setToast] = useState(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  // Cooldown timer state for resend (60 seconds default)
  const [cooldown, setCooldown] = useState(60);

  // 10-minute expiry countdown timer (600 seconds)
  const [expiryTime, setExpiryTime] = useState(600);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Expiry countdown timer
  useEffect(() => {
    if (expiryTime <= 0) return;
    const interval = setInterval(() => {
      setExpiryTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [expiryTime]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle individual digit input
  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  // Submit OTP Verification
  const handleVerify = async (e) => {
    e?.preventDefault();
    const fullOtp = otpDigits.join('');

    if (fullOtp.length !== 6) {
      setToast({ message: 'Please enter all 6 digits of your verification code.', type: 'error' });
      return;
    }

    if (!email) {
      setToast({ message: 'Please provide your registered email address.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        email: email.trim(),
        otp: fullOtp
      });

      const { token, user } = response.data;

      // Save token and user to log candidate in automatically
      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
      }

      setVerifiedSuccess(true);
      setToast({ message: 'Email verified successfully! Welcome to RecruitX.', type: 'success' });

      setTimeout(() => {
        navigate('/candidate/dashboard');
      }, 2000);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Verification failed. Please check the code and try again.';
      setToast({ message: errMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code
  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    if (!email) {
      setToast({ message: 'Please enter your registered email address.', type: 'error' });
      return;
    }

    setResending(true);
    try {
      const res = await api.post('/auth/resend-otp', { email: email.trim() });
      setToast({ message: res.data.message || 'New 6-digit verification code sent!', type: 'success' });
      setCooldown(60);
      setExpiryTime(600);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to resend code. Please try again.';
      setToast({ message: errMsg, type: 'error' });
      if (err.response?.data?.cooldownRemaining) {
        setCooldown(err.response.data.cooldownRemaining);
      }
    } finally {
      setResending(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6 w-full">
          {/* Header Icon */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center font-bold mx-auto mb-2 border border-primary-100 shadow-sm">
              {verifiedSuccess ? (
                <CheckCircle2 className="w-9 h-9 text-emerald-600 animate-bounce" />
              ) : (
                <KeyRound className="w-8 h-8 text-primary-600" />
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {verifiedSuccess ? 'Email Verified!' : 'Verify Your Email'}
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {verifiedSuccess
                ? 'Your candidate account has been activated. Redirecting to your dashboard...'
                : 'A 6-digit verification code has been dispatched to your email address.'}
            </p>
          </div>

          {verifiedSuccess ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
              <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-emerald-900 text-sm">Account Activation Complete</h3>
              <p className="text-xs text-emerald-700">
                You can now browse job vacancies, submit applications, and track interview schedules.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/candidate/dashboard')}
                  className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-1.5"
                >
                  Go to Candidate Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              {/* Email Address Display or Editable Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="input-field pl-9 text-xs"
                  />
                </div>
              </div>

              {/* 6-Digit OTP Boxes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    6-Digit Verification Code
                  </label>
                  <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Expires in:{' '}
                    <span className={expiryTime < 60 ? 'text-rose-600 font-bold' : 'text-slate-700 font-semibold'}>
                      {formatTimer(expiryTime)}
                    </span>
                  </span>
                </div>

                <div className="flex justify-between gap-2" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-14 text-center text-xl font-extrabold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-primary-600 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                      required
                    />
                  ))}
                </div>
                {expiryTime === 0 && (
                  <p className="text-[11px] text-rose-600 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Code has expired. Please request a new one below.
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || otpDigits.join('').length !== 6 || expiryTime === 0}
                className="w-full btn-primary py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Code...
                  </>
                ) : (
                  <>
                    Verify & Continue <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend OTP Section with Cooldown */}
              <div className="pt-2 text-center border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">Didn't receive the email verification code?</p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700 disabled:text-slate-400 disabled:cursor-not-allowed inline-flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  {resending
                    ? 'Sending Code...'
                    : cooldown > 0
                    ? `Resend Code in (${cooldown}s)`
                    : 'Resend Verification Code'}
                </button>
              </div>

              {/* Back to Login */}
              <div className="text-center">
                <Link to="/login" className="text-xs text-slate-500 hover:text-slate-700">
                  Already verified? Sign in to your account
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default VerifyEmail;
