import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { MapPin, Briefcase, DollarSign, Building2, Calendar, ArrowLeft, CheckCircle2, Mail, Phone, UserCheck } from 'lucide-react';

export const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [toast, setToast] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/applications/apply', {
        job_id: job.id,
        cover_letter: coverLetter
      });
      setToast({ message: 'Application submitted successfully!', type: 'success' });
      setShowApplyModal(false);
      setCoverLetter('');
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to submit application.', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto p-8 w-full">
          <div className="h-64 bg-slate-200 rounded-xl animate-pulse"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Job Posting Not Found</h2>
          <Link to="/jobs" className="mt-4 px-4 py-2 bg-primary-600 text-white font-bold text-xs rounded-lg">
            Back to All Vacancies
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Available Vacancies
        </Link>

        {/* Job Header Hero Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200 mb-3">
                {job.department_name}
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{job.title}</h1>
              <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 mt-1">
                <Building2 className="w-4 h-4 text-slate-400" />
                {job.company_name}
              </p>
            </div>
            <StatusBadge status={job.status} />
          </div>

          <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 text-xs text-slate-700 font-medium">
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>{job.employment_type}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold">
              <DollarSign className="w-4 h-4" />
              <span>{job.salary_range || 'Competitive'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-50 text-purple-800 px-3 py-1.5 rounded-lg border border-purple-200 font-semibold">
              <UserCheck className="w-4 h-4" />
              <span>{job.experience_level || 'Mid Level'}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              Job ID: <span className="font-semibold text-slate-600">#JOB-{job.id}</span> • Posted on {new Date(job.created_at).toLocaleDateString()}
            </p>

            {user?.role === 'candidate' || !user ? (
              <button
                onClick={() => {
                  if (!user) navigate('/login');
                  else setShowApplyModal(true);
                }}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                Apply for Vacancy
              </button>
            ) : (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                You are logged in as {user.role}
              </span>
            )}
          </div>
        </div>

        {/* Description & Requirements Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Job Description</h2>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Requirements */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-slate-900">Requirements & Eligibility</h2>
              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {job.requirements}
              </div>
            </div>

          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-slate-400">
                Recruiter & Contact
              </h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Hiring Recruiter:</p>
                  <p className="font-bold text-slate-900">{job.recruiter_name}</p>
                  <p className="text-slate-500">{job.recruiter_designation}</p>
                </div>

                <div>
                  <p className="text-slate-400 font-medium">Department:</p>
                  <p className="font-semibold text-slate-800">{job.department_name}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.recruiter_email}</span>
                  </div>
                  {job.recruiter_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.recruiter_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      <Modal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title={`Apply for ${job.title}`}
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cover Letter / Statement of Purpose
            </label>
            <textarea
              rows={4}
              required
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Why are you qualified for this position..."
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowApplyModal(false)}
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
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
      <Footer />
    </div>
  );
};

export default JobDetails;
