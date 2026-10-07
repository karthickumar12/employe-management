import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import { Briefcase, PlusCircle, Edit, Trash2, Search, Users } from 'lucide-react';

export const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchDepartments();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/recruiter/my-jobs');
      setJobs(res.data || []);
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

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/jobs/${editingJob.id}`, editingJob);
      setToast({ message: 'Job vacancy updated successfully!', type: 'success' });
      setEditingJob(null);
      fetchJobs();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update job.', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/jobs/${deleteId}`);
      setToast({ message: 'Job vacancy deleted successfully.', type: 'success' });
      setJobs(jobs.filter(j => j.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete job.', type: 'error' });
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(search.toLowerCase()) || 
    j.location.toLowerCase().includes(search.toLowerCase()) ||
    j.department_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Job Postings</h1>
              <p className="text-xs text-slate-500 mt-1">Publish, edit, update status, or delete job vacancies.</p>
            </div>
            <Link
              to="/recruiter/jobs/create"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Create New Job
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            
            {/* Search */}
            <div className="max-w-xs flex items-center px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search job title or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-2.5 focus:outline-none"
              />
            </div>

            {loading ? (
              <div className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 space-y-2">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                <p>No job postings found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Job Title & Location</th>
                      <th className="pb-3">Department</th>
                      <th className="pb-3">Applicants</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 pr-4">
                          <p className="font-bold text-slate-900 text-sm">{job.title}</p>
                          <p className="text-[11px] text-slate-500">{job.location} • {job.employment_type}</p>
                        </td>
                        <td className="py-4 text-slate-700 font-semibold">{job.department_name}</td>
                        <td className="py-4">
                          <Link to={`/recruiter/applicants?job_id=${job.id}`} className="font-bold text-primary-600 hover:underline flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {job.total_applicants} Applicants
                          </Link>
                        </td>
                        <td className="py-4"><StatusBadge status={job.status} /></td>
                        <td className="py-4 text-right space-x-2">
                          <button
                            onClick={() => setEditingJob(job)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(job.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Job Modal */}
      <Modal
        isOpen={!!editingJob}
        onClose={() => setEditingJob(null)}
        title="Edit Job Posting"
      >
        {editingJob && (
          <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={editingJob.title}
                onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                <select
                  value={editingJob.department_id}
                  onChange={(e) => setEditingJob({ ...editingJob, department_id: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editingJob.status}
                  onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editingJob.location}
                  onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Salary Range</label>
                <input
                  type="text"
                  value={editingJob.salary_range}
                  onChange={(e) => setEditingJob({ ...editingJob, salary_range: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Job Description</label>
              <textarea
                rows={4}
                value={editingJob.description}
                onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm Job Deletion"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to delete this job vacancy? All associated candidate applications will also be removed.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
};

export default ManageJobs;
