import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { 
  Search, MapPin, Briefcase, Users, Building2, CheckCircle, 
  ArrowRight, Award, ShieldCheck, Zap, FileText 
} from 'lucide-react';

export const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedJobs();
    fetchDepartments();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      const res = await api.get('/jobs?limit=6');
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/jobs/departments');
      setDepartments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/jobs?search=${encodeURIComponent(searchQuery)}&department=${selectedDept}`);
  };

  const handleApplyClick = (job) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'candidate') {
      setToast({ message: 'Only candidates can apply for job vacancies.', type: 'error' });
      return;
    }
    setSelectedJob(job);
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    try {
      await api.post('/applications/apply', {
        job_id: selectedJob.id,
        cover_letter: coverLetter
      });
      setToast({ message: 'Job application submitted successfully!', type: 'success' });
      setSelectedJob(null);
      setCoverLetter('');
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to submit application.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-navy-950 text-white overflow-hidden py-20 lg:py-28 border-b border-navy-800">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-950/80 text-primary-300 border border-primary-800/60 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-primary-400" />
              <span>Enterprise Employee Recruitment Management Portal</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Streamline Hiring & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-sky-300">Talent Acquisition</span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Connecting qualified job seekers with hiring recruiters through automated application tracking, normalized database management, and interview scheduling.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="bg-white p-2.5 rounded-2xl shadow-2xl border border-slate-200 flex flex-col md:flex-row gap-2 max-w-2xl mx-auto text-slate-800 mt-8">
              <div className="flex-1 flex items-center px-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, skills, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent py-3 text-sm focus:outline-none placeholder-slate-400 font-medium"
                />
              </div>

              <div className="flex items-center px-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <Building2 className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full bg-transparent py-3 text-sm focus:outline-none font-medium text-slate-700"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                Find Jobs
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Metrics Counter */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 text-left">
              <div className="bg-navy-900/60 p-4 rounded-xl border border-navy-800 backdrop-blur-sm">
                <p className="text-2xl font-black text-white">10+</p>
                <p className="text-xs text-slate-400 font-medium">Active Vacancies</p>
              </div>
              <div className="bg-navy-900/60 p-4 rounded-xl border border-navy-800 backdrop-blur-sm">
                <p className="text-2xl font-black text-primary-400">10+</p>
                <p className="text-xs text-slate-400 font-medium">Candidates Profiles</p>
              </div>
              <div className="bg-navy-900/60 p-4 rounded-xl border border-navy-800 backdrop-blur-sm">
                <p className="text-2xl font-black text-emerald-400">5</p>
                <p className="text-xs text-slate-400 font-medium">Key Departments</p>
              </div>
              <div className="bg-navy-900/60 p-4 rounded-xl border border-navy-800 backdrop-blur-sm">
                <p className="text-2xl font-black text-amber-400">100%</p>
                <p className="text-xs text-slate-400 font-medium">Automated Tracking</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Job Openings
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore verified positions across engineering, product design, HR, and marketing.
            </p>
          </div>
          <Link
            to="/jobs"
            className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            View All Vacancies
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-slate-200/70 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onApply={handleApplyClick} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 font-bold text-sm text-slate-700 rounded-xl shadow-sm"
          >
            View All Job Listings
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Key System Features */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Comprehensive Recruitment Lifecycle
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Designed according to Object-Oriented Analysis & Software Engineering principles for enterprise scalability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-bold mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Resume & Application Hub</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Candidates upload PDF resumes, manage technical profiles, and track application status live through transparent pipeline stages.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-bold mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Recruiter Candidate Evaluation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                HR Managers create job posts, review applicant profiles, download resumes, shortlist candidates, and schedule interview dates.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Admin Analytics & Oversight</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralized system administrator console monitoring recruiters, user accounts, real-time database statistics, and interactive charts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* OOASE Project Submission Banner */}
      <section className="py-12 bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-300">OOASE Academic Evaluation Project</span>
            <h3 className="text-xl sm:text-2xl font-extrabold mt-1">Student: KARTHICKUMAR S S (Reg: 6113241041061)</h3>
            <p className="text-xs text-primary-200 mt-1">
              Full-Stack Application built with React.js, Express.js, Node.js, and MySQL.
            </p>
          </div>
          <Link
            to="/about"
            className="px-6 py-3 bg-white text-primary-900 font-bold text-sm rounded-xl shadow hover:bg-primary-50 transition-colors whitespace-nowrap"
          >
            View Project Documentation
          </Link>
        </div>
      </section>

      {/* Quick Apply Modal */}
      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob ? `Apply for ${selectedJob.title}` : 'Job Application'}
      >
        {selectedJob && (
          <form onSubmit={submitApplication} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <p><span className="font-semibold text-slate-700">Position:</span> {selectedJob.title}</p>
              <p><span className="font-semibold text-slate-700">Company:</span> {selectedJob.company_name}</p>
              <p><span className="font-semibold text-slate-700">Location:</span> {selectedJob.location}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cover Letter / Statement of Purpose
              </label>
              <textarea
                rows={4}
                required
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why you are a great fit for this position..."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm"
              >
                Submit Application
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <Footer />
    </div>
  );
};

export default Home;
