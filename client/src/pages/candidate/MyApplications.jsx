import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import { FileText, Eye, Trash2, Calendar, MapPin, Building2 } from 'lucide-react';

export const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawId, setWithdrawId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications');
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmWithdraw = async () => {
    if (!withdrawId) return;
    try {
      await api.delete(`/applications/${withdrawId}/withdraw`);
      setToast({ message: 'Application withdrawn successfully.', type: 'success' });
      setApplications(applications.filter(a => a.id !== withdrawId));
      setWithdrawId(null);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to withdraw application.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Job Applications</h1>
            <p className="text-xs text-slate-500 mt-1">Review status updates and progress for all your submitted job applications.</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {loading ? (
              <div className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 space-y-3">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <p>You haven't submitted any job applications yet.</p>
                <Link to="/jobs" className="inline-block px-5 py-2.5 bg-primary-600 text-white font-bold rounded-xl shadow">
                  Browse Available Vacancies
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Position & Company</th>
                      <th className="pb-3">Department</th>
                      <th className="pb-3">Applied Date</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 pr-4">
                          <p className="font-bold text-slate-900 text-sm">{app.job_title}</p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {app.company_name} • <MapPin className="w-3 h-3 text-slate-400 ml-1" /> {app.job_location}
                          </p>
                        </td>
                        <td className="py-4 text-slate-700 font-semibold">{app.department_name}</td>
                        <td className="py-4 text-slate-500">{new Date(app.applied_at).toLocaleDateString()}</td>
                        <td className="py-4"><StatusBadge status={app.status} /></td>
                        <td className="py-4 text-right space-x-3">
                          <Link
                            to={`/candidate/tracking/${app.id}`}
                            className="inline-flex items-center gap-1 font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Track Status
                          </Link>

                          {app.status !== 'Selected' && app.status !== 'Rejected' && (
                            <button
                              onClick={() => setWithdrawId(app.id)}
                              className="inline-flex items-center gap-1 font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Withdraw
                            </button>
                          )}
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

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!withdrawId}
        onClose={() => setWithdrawId(null)}
        title="Confirm Application Withdrawal"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to withdraw your application? This action will remove your application from the recruiter's candidate pool.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setWithdrawId(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={confirmWithdraw}
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
            >
              Yes, Withdraw Application
            </button>
          </div>
        </div>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
};

export default MyApplications;
