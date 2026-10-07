import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import { Users, Search, ToggleLeft, ToggleRight, Trash2, ShieldCheck, UserCheck, Building2 } from 'lucide-react';

export const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [role, search]);

  const fetchUsers = async () => {
    try {
      const query = new URLSearchParams({ role, search }).toString();
      const res = await api.get(`/users?${query}`);
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/users/${userId}/status`, { status: newStatus });
      setToast({ message: `Account status updated to ${newStatus}.`, type: 'success' });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update status.', type: 'error' });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/users/${deleteId}`);
      setToast({ message: 'User account removed successfully.', type: 'success' });
      setUsers(users.filter(u => u.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete user.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Account Directory</h1>
            <p className="text-xs text-slate-500 mt-1">Manage system access permissions, activate/deactivate accounts, or remove users.</p>
          </div>

          {/* Filters */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 text-xs">
            <div className="flex-1 flex items-center px-3 bg-slate-50 border border-slate-200 rounded-xl">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent py-2.5 focus:outline-none font-medium"
              />
            </div>

            <div className="w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-3">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-transparent py-2.5 font-medium text-slate-700 focus:outline-none"
              >
                <option value="">All User Roles</option>
                <option value="admin">System Admin</option>
                <option value="recruiter">Recruiter</option>
                <option value="candidate">Candidate</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {loading ? (
              <div className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>
            ) : users.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-12">No users matching search filters.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">User Details</th>
                      <th className="pb-3">Role</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Joined Date</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 pr-4">
                          <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </td>

                        <td className="py-4">
                          <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {u.role}
                          </span>
                        </td>

                        <td className="py-4"><StatusBadge status={u.status} /></td>

                        <td className="py-4 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>

                        <td className="py-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleStatus(u.id, u.status)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 rounded-lg"
                          >
                            Toggle Status
                          </button>

                          <button
                            onClick={() => setDeleteId(u.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg inline-block align-middle"
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

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Confirm User Account Deletion"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Are you sure you want to delete this user account? All associated profile and application data will be permanently removed.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancel
            </button>
            <button onClick={handleDeleteUser} className="px-5 py-2 bg-rose-600 text-white font-bold rounded-lg shadow-sm">
              Delete User Account
            </button>
          </div>
        </div>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
};

export default ManageUsers;
