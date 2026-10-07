import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Toast from '../components/Toast';
import { User, Briefcase, Mail, Lock, Phone, MapPin, Building2, UserPlus, Sparkles } from 'lucide-react';

export const Register = () => {
  const [role, setRole] = useState('candidate');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    headline: '',
    location: '',
    education: '',
    skills: '',
    company_name: '',
    designation: ''
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fillDemoCandidate = () => {
    const randomNum = Math.floor(Math.random() * 1000);
    setRole('candidate');
    setFormData({
      name: `Applicant ${randomNum}`,
      email: `candidate_${randomNum}@recruitment.com`,
      password: 'password123',
      phone: '+91 9876500000',
      headline: 'Software Engineer & Full Stack Developer',
      location: 'Chennai, India',
      education: 'B.E. Computer Science & Engineering',
      skills: 'React.js, Node.js, Express, MySQL, JavaScript, HTML5',
      company_name: '',
      designation: ''
    });
  };

  const fillDemoRecruiter = () => {
    const randomNum = Math.floor(Math.random() * 1000);
    setRole('recruiter');
    setFormData({
      name: `HR Specialist ${randomNum}`,
      email: `recruiter_${randomNum}@recruitment.com`,
      password: 'password123',
      phone: '+1 555-0999',
      headline: '',
      location: '',
      education: '',
      skills: '',
      company_name: 'Apex Global Enterprises',
      designation: 'Senior Talent Acquisition Lead'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newUser = await register({ ...formData, role });
      setToast({ message: 'Registration successful! Redirecting to dashboard...', type: 'success' });
      setTimeout(() => {
        if (newUser.role === 'recruiter') navigate('/recruiter/dashboard');
        else navigate('/candidate/dashboard');
      }, 1000);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Registration failed. Please check form fields.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Your Account</h1>
            <p className="text-xs text-slate-500">Join the Recruitment Management System platform.</p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                role === 'candidate' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              Job Seeker / Candidate
            </button>
            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 ${
                role === 'recruiter' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Recruiter / HR Manager
            </button>
          </div>

          {/* Quick Demo Autofill */}
          <div className="flex items-center justify-between bg-primary-50 p-3 rounded-xl border border-primary-200 text-xs">
            <span className="font-semibold text-primary-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary-600" />
              Quick Fill Demo Data:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={fillDemoCandidate}
                className="px-2.5 py-1 bg-white border border-primary-300 text-primary-700 font-bold rounded-lg hover:bg-primary-100"
              >
                Candidate Form
              </button>
              <button
                type="button"
                onClick={fillDemoRecruiter}
                className="px-2.5 py-1 bg-white border border-primary-300 text-primary-700 font-bold rounded-lg hover:bg-primary-100"
              >
                Recruiter Form
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Karthickumar S S"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Candidate Specific Fields */}
            {role === 'candidate' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Headline</label>
                  <input
                    type="text"
                    name="headline"
                    value={formData.headline}
                    onChange={handleChange}
                    placeholder="e.g. Senior Full Stack Developer"
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g. Chennai, India"
                      className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Highest Education</label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      placeholder="e.g. B.E. Computer Science"
                      className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g. React.js, Node.js, MySQL, Python"
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Recruiter Specific Fields */}
            {role === 'recruiter' && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization Name</label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      placeholder="e.g. TechCorp Solutions"
                      className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / HR Title</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="e.g. Senior Talent Lead"
                      className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-6"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating Account...' : `Register as ${role}`}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:underline">
              Log in here
            </Link>
          </p>

        </div>
      </main>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <Footer />
    </div>
  );
};

export default Register;
