import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Toast from '../../components/Toast';
import { PlusCircle, ArrowLeft, Sparkles, Building2 } from 'lucide-react';

export const CreateJob = () => {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    department_id: '',
    description: '',
    requirements: '',
    location: '',
    employment_type: 'Full-time',
    salary_range: '',
    experience_level: 'Mid Level',
    status: 'Open'
  });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/jobs/departments');
      setDepartments(res.data || []);
      if (res.data && res.data.length > 0) {
        setFormData(prev => ({ ...prev, department_id: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fillDemoJob = () => {
    setFormData({
      title: 'Senior Cloud DevOps Engineer',
      department_id: departments[0]?.id || 1,
      description: 'We are seeking an experienced Cloud DevOps Engineer to manage AWS infrastructure, Kubernetes clusters, and automated CI/CD deployment pipelines.',
      requirements: '• 3+ years experience with AWS Cloud Infrastructure & Kubernetes\n• Hands-on expertise in Terraform, Docker, and GitHub Actions\n• Knowledge of Linux bash scripting and security compliance.',
      location: 'Remote / Chennai',
      employment_type: 'Full-time',
      salary_range: '$95,000 - $125,000 / year',
      experience_level: 'Senior Level (4+ years)',
      status: 'Open'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/jobs', formData);
      setToast({ message: 'Job vacancy published successfully!', type: 'success' });
      setTimeout(() => navigate('/recruiter/jobs'), 1000);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to create job vacancy.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-4xl">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Job Vacancy</h1>
              <p className="text-xs text-slate-500 mt-1">Fill in vacancy details, eligibility, salary, and publish to the candidate job portal.</p>
            </div>
            
            <button
              type="button"
              onClick={fillDemoJob}
              className="px-3.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-amber-100"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              Demo Autofill
            </button>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Vacancy Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Full Stack Developer"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Chennai, India (Hybrid)"
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={formData.salary_range}
                    onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                    placeholder="e.g. $80,000 - $110,000 / year"
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Experience Level</label>
                  <input
                    type="text"
                    value={formData.experience_level}
                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                    placeholder="e.g. Mid-Senior Level (3+ yrs)"
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Job Description *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of duties and team responsibilities..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requirements & Qualifications *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Bullet points for required skills, education, and technical experience..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/recruiter/jobs')}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  {loading ? 'Publishing...' : 'Publish Job Posting'}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
};

export default CreateJob;
