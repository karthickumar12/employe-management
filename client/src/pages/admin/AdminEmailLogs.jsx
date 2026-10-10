import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Sidebar from '../../components/Sidebar';
import Toast from '../../components/Toast';
import api from '../../services/api';
import { 
  Mail, RefreshCw, Send, CheckCircle2, AlertCircle, Clock, 
  Search, Filter, ExternalLink, ShieldCheck, AlertTriangle, ArrowUpDown
} from 'lucide-react';

export const AdminEmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await api.get('/reports/email-logs', { params });
      setLogs(res.data.logs || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching email logs:', err);
      setToast({ message: 'Failed to load email notification history.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const handleRetry = async (logId) => {
    setRetryingId(logId);
    try {
      await api.post(`/reports/email-logs/${logId}/retry`);
      setToast({ message: `Email #${logId} resend attempted successfully!`, type: 'success' });
      fetchLogs();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Retry delivery failed.';
      setToast({ message: `Retry failed: ${errMsg}`, type: 'error' });
      fetchLogs();
    } finally {
      setRetryingId(null);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'OTP_VERIFICATION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">OTP Code</span>;
      case 'WELCOME_EMAIL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Welcome</span>;
      case 'APPLICATION_CONFIRMATION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Application</span>;
      case 'RECRUITER_ALERT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Recruiter Alert</span>;
      case 'STATUS_UPDATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">Status Update</span>;
      case 'INTERVIEW_SCHEDULED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Interview Invite</span>;
      case 'INTERVIEW_CANCELLED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Interview Cancelled</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{type}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Failed / Logged
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Queued
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-6 space-y-6 overflow-x-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-100 text-primary-600 rounded-xl">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Email Notification Logs & Outbox</h1>
                  <p className="text-xs text-slate-500">Live delivery history, recipient status, and manual retry management.</p>
                </div>
              </div>
            </div>

            <button
              onClick={fetchLogs}
              disabled={loading}
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-2 self-start md:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Outbox
            </button>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by recipient email, subject, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-9 text-xs w-full"
              />
            </form>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="input-field text-xs py-2 w-full sm:w-44"
              >
                <option value="">All Delivery Statuses</option>
                <option value="SENT">Delivered (SENT)</option>
                <option value="FAILED">Failed / Fallback (FAILED)</option>
                <option value="PENDING">Queued (PENDING)</option>
              </select>
            </div>
          </div>

          {/* Summary Stat Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Total Notifications</p>
                <p className="text-xl font-extrabold text-slate-900">{total}</p>
              </div>
              <Mail className="w-7 h-7 text-primary-500/30" />
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-emerald-600 uppercase">Delivered (Sent)</p>
                <p className="text-xl font-extrabold text-emerald-700">
                  {logs.filter(l => l.delivery_status === 'SENT').length} (in page)
                </p>
              </div>
              <CheckCircle2 className="w-7 h-7 text-emerald-500/30" />
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-rose-600 uppercase">Needs Attention / Offline</p>
                <p className="text-xl font-extrabold text-rose-700">
                  {logs.filter(l => l.delivery_status === 'FAILED').length} (in page)
                </p>
              </div>
              <AlertTriangle className="w-7 h-7 text-rose-500/30" />
            </div>
          </div>

          {/* Email Logs Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Delivery Status</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-12 text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
                        Loading email notification logs...
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-12 text-slate-400">
                        <Mail className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        No email notification logs found matching the filter.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-500">#{log.id}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{log.recipient_email}</p>
                        </td>
                        <td className="py-3 px-4">{getTypeBadge(log.notification_type)}</td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-800 truncate max-w-xs" title={log.subject}>
                            {log.subject}
                          </p>
                          {log.last_error && (
                            <p className="text-[10px] text-rose-600 truncate max-w-xs" title={log.last_error}>
                              ⚠️ {log.last_error}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {log.related_entity_type && log.related_entity_id ? (
                            <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                              {log.related_entity_type === 'application' ? `#APP-${log.related_entity_id}` : `#${log.related_entity_type}-${log.related_entity_id}`}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(log.delivery_status)}</td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {log.delivery_status === 'FAILED' ? (
                            <button
                              onClick={() => handleRetry(log.id)}
                              disabled={retryingId === log.id}
                              className="text-[11px] font-bold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg border border-primary-200 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                              title="Attempt resending via SMTP"
                            >
                              <RefreshCw className={`w-3 h-3 ${retryingId === log.id ? 'animate-spin' : ''}`} />
                              Retry
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-600 font-medium">Logged</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {total > limit && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <p>
                  Showing <span className="font-bold">{(page - 1) * limit + 1}</span> to{' '}
                  <span className="font-bold">{Math.min(page * limit, total)}</span> of{' '}
                  <span className="font-bold">{total}</span> notifications
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary text-xs px-3 py-1 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * limit >= total}
                    className="btn-secondary text-xs px-3 py-1 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminEmailLogs;
