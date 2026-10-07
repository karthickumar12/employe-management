import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Apply modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [search, department, location, type, page]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/jobs/departments');
      setDepartments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        department,
        location,
        type,
        page: page.toString(),
        limit: '9'
      }).toString();

      const res = await api.get(`/jobs?${query}`);
      setJobs(res.data.jobs || []);
      setPagination(res.data.pagination || { totalPages: 1, total: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDepartment('');
    setLocation('');
    setType('');
    setPage(1);
    setSearchParams({});
  };

  const handleApplyClick = (job) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'candidate') {
      setToast({ message: 'Only job seeker candidates can submit applications.', type: 'error' });
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
      setToast({ message: 'Application submitted successfully!', type: 'success' });
      setSelectedJob(null);
      setCoverLetter('');
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to submit application.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Available Job Vacancies</h1>
          <p className="text-sm text-slate-500 mt-1">Browse, filter, and apply for open career opportunities.</p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Search Keyword */}
            <div className="flex items-center px-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search job title or skills..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-transparent py-2.5 text-xs font-medium focus:outline-none"
              />
            </div>

            {/* Department Filter */}
            <div className="flex items-center px-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <Filter className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <select
                value={department}
                onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
                className="w-full bg-transparent py-2.5 text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="flex items-center px-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Location (e.g. Remote, Chennai)"
                value={location}
                onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                className="w-full bg-transparent py-2.5 text-xs font-medium focus:outline-none"
              />
            </div>

            {/* Employment Type */}
            <div className="flex items-center px-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1); }}
                className="w-full bg-transparent py-2.5 text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="">All Employment Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Found <strong className="text-slate-900">{pagination.total}</strong> vacancies matching your filters</span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 font-semibold text-primary-600 hover:text-primary-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 bg-slate-200/70 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-12">
            <Filter className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No Job Vacancies Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search keywords or resetting active filters.</p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 bg-primary-600 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onApply={handleApplyClick} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="p-2 border border-slate-300 bg-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-700">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              disabled={page === pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 border border-slate-300 bg-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 text-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

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
                Cover Letter / Message to Hiring Manager
              </label>
              <textarea
                rows={4}
                required
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Summarize your relevant skills, experience, and availability..."
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

export default Jobs;
