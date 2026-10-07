import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import { Users, Filter, Eye, FileText, Calendar, CheckCircle, Search, Mail, Phone, ExternalLink } from 'lucide-react';

export const Applicants = () => {
  const [searchParams] = useSearchParams();
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters
  const [selectedJob, setSelectedJob] = useState(searchParams.get('job_id') || '');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');

  // Schedule Interview Modal
  const [interviewModalApp, setInterviewModalApp] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/rec-interview-room');
  const [interviewNotes, setInterviewNotes] = useState('');

  useEffect(() => {
    fetchJobs();
    fetchApplicants();
  }, [selectedJob, selectedStatus, search]);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/recruiter/my-jobs');
      setJobs(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplicants = async () => {
    try {
      const query = new URLSearchParams({
        job_id: selectedJob,
        status: selectedStatus,
        search
      }).toString();

      const res = await api.get(`/applications/recruiter/applicants?${query}`);
      setApplicants(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      setToast({ message: `Applicant status changed to ${newStatus}.`, type: 'success' });
      setApplicants(applicants.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update status.', type: 'error' });
    }
  };

  const submitScheduleInterview = async (e) => {
    e.preventDefault();
    try {
      await api.post('/interviews', {
        application_id: interviewModalApp.id,
        scheduled_date: scheduledDate,
        location_or_link: meetingLink,
        notes: interviewNotes
      });

      setToast({ message: 'Interview scheduled and candidate notified successfully!', type: 'success' });
      setInterviewModalApp(null);
      fetchApplicants();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to schedule interview.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Applicant Management</h1>
            <p className="text-xs text-slate-500 mt-1">Evaluate candidate profiles, download resumes, shortlist, and schedule interview rounds.</p>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Filter by Job Vacancy</label>
              <select
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="">All Job Vacancies</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Filter by Application Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="">All Application Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Under Review">Under Review</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview Scheduled">Interview Scheduled</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Search Candidate</label>
              <input
                type="text"
                placeholder="Search name, skills, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Applicants Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {loading ? (
              <div className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>
            ) : applicants.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500 space-y-2">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <p>No candidate applications matching active filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Candidate Details</th>
                      <th className="pb-3">Job Position</th>
                      <th className="pb-3">Skills & Experience</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions & Schedule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {applicants.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 pr-4">
                          <Link to={`/recruiter/candidate/${app.candidate_id}`} className="font-bold text-slate-900 text-sm hover:text-primary-600">
                            {app.candidate_name}
                          </Link>
                          <p className="text-[11px] text-slate-500">{app.candidate_email} • {app.candidate_phone || 'N/A'}</p>
                          {app.file_path && (
                            <a
                              href={`/api/applications/resume/${app.resume_id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-primary-600 hover:underline inline-flex items-center gap-1 mt-1"
                            >
                              <FileText className="w-3 h-3" />
                              View PDF Resume
                            </a>
                          )}
                        </td>

                        <td className="py-4">
                          <p className="font-bold text-slate-800">{app.job_title}</p>
                          <p className="text-[11px] text-slate-500">{app.department_name}</p>
                        </td>

                        <td className="py-4 max-w-xs">
                          <p className="font-semibold text-slate-700">{app.experience_years} Years Experience</p>
                          <p className="text-[11px] text-slate-500 truncate">{app.skills || 'Not specified'}</p>
                        </td>

                        <td className="py-4">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="text-xs p-1.5 border border-slate-300 rounded-lg bg-white font-semibold focus:outline-none"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interview Scheduled">Interview Scheduled</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>

                        <td className="py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setInterviewModalApp(app);
                              setScheduledDate(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
                            }}
                            className="px-3 py-1.5 bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold rounded-lg hover:bg-cyan-100"
                          >
                            <Calendar className="w-3.5 h-3.5 inline mr-1" />
                            Schedule Interview
                          </button>

                          <Link
                            to={`/recruiter/candidate/${app.candidate_id}`}
                            className="p-1.5 bg-slate-100 text-slate-700 hover:text-primary-600 rounded-lg inline-block align-middle"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
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

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={!!interviewModalApp}
        onClose={() => setInterviewModalApp(null)}
        title={interviewModalApp ? `Schedule Interview for ${interviewModalApp.candidate_name}` : 'Schedule Interview'}
      >
        {interviewModalApp && (
          <form onSubmit={submitScheduleInterview} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <p><span className="font-semibold text-slate-700">Candidate:</span> {interviewModalApp.candidate_name} ({interviewModalApp.candidate_email})</p>
              <p><span className="font-semibold text-slate-700">Position:</span> {interviewModalApp.job_title}</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scheduled Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Meeting Location or Google Meet Link *</label>
              <input
                type="text"
                required
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/xyz-abc-def"
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interview Instructions / Agenda</label>
              <textarea
                rows={3}
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                placeholder="Topics, technical coding evaluation, or interviewer panel details..."
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setInterviewModalApp(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-sm"
              >
                Confirm & Send Notification
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
};

export default Applicants;
