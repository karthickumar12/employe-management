import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';
import { Users, Filter, Eye, FileText, Calendar, CheckCircle, Search, Mail, Phone, ExternalLink, Award, Send, MessageSquare, Sparkles, CheckSquare } from 'lucide-react';

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

  // Make Decision Modal State
  const [decisionModalApp, setDecisionModalApp] = useState(null);
  const [decisionStatus, setDecisionStatus] = useState('Selected');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [submittingDecision, setSubmittingDecision] = useState(false);

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

  const openDecisionModal = (app, initialStatus) => {
    setDecisionModalApp(app);
    setDecisionStatus(initialStatus || app.status || 'Selected');
    setDecisionNotes(app.recruiter_notes || '');
    setSendEmailNotification(true);
  };

  const submitDecision = async (e) => {
    e.preventDefault();
    if (!decisionModalApp) return;

    setSubmittingDecision(true);
    try {
      const res = await api.put(`/applications/${decisionModalApp.id}/status`, {
        status: decisionStatus,
        notes: decisionNotes,
        sendEmail: sendEmailNotification
      });

      if (res.data.emailDelivered) {
        setToast({ 
          message: `Decision saved as "${decisionStatus}". Notification email delivered to ${res.data.candidateEmail}!`, 
          type: 'success' 
        });
      } else if (sendEmailNotification) {
        setToast({ 
          message: `Decision saved as "${decisionStatus}". Notification logged in outbox for ${res.data.candidateEmail}.`, 
          type: 'info' 
        });
      } else {
        setToast({ 
          message: `Decision updated to "${decisionStatus}" (Email skipped).`, 
          type: 'success' 
        });
      }

      setApplicants(applicants.map(a => a.id === decisionModalApp.id ? { 
        ...a, 
        status: decisionStatus, 
        recruiter_notes: decisionNotes 
      } : a));
      setDecisionModalApp(null);
    } catch (err) {
      setToast({ 
        message: err.response?.data?.message || 'Failed to record decision.', 
        type: 'error' 
      });
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleStatusChange = async (app, newStatus) => {
    openDecisionModal(app, newStatus);
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
                          <div className="space-y-1.5">
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app, e.target.value)}
                              className="text-xs p-1.5 border border-slate-300 rounded-lg bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="Applied">Applied</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Interview Scheduled">Interview Scheduled</option>
                              <option value="Selected">Selected</option>
                              <option value="Rejected">Rejected</option>
                            </select>

                            <div>
                              <button
                                type="button"
                                onClick={() => openDecisionModal(app, app.status)}
                                className="text-[11px] font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1 hover:underline"
                              >
                                <Award className="w-3.5 h-3.5 text-primary-600" />
                                Make Decision &rarr;
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => openDecisionModal(app, app.status)}
                            className="px-3 py-1.5 bg-primary-50 text-primary-700 border border-primary-200 font-bold rounded-lg hover:bg-primary-100 shadow-sm"
                            title="Make Decision & Send Candidate Notification Email"
                          >
                            <Award className="w-3.5 h-3.5 inline mr-1 text-primary-600" />
                            Decision
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setInterviewModalApp(app);
                              setScheduledDate(new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16));
                            }}
                            className="px-3 py-1.5 bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold rounded-lg hover:bg-cyan-100"
                          >
                            <Calendar className="w-3.5 h-3.5 inline mr-1" />
                            Schedule
                          </button>

                          <Link
                            to={`/recruiter/candidate/${app.candidate_id}`}
                            className="p-1.5 bg-slate-100 text-slate-700 hover:text-primary-600 rounded-lg inline-block align-middle"
                            title="View Full Profile"
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

      {/* Make Hiring Decision Modal */}
      <Modal
        isOpen={!!decisionModalApp}
        onClose={() => setDecisionModalApp(null)}
        title={decisionModalApp ? `Hiring Decision: ${decisionModalApp.candidate_name}` : 'Make Hiring Decision'}
      >
        {decisionModalApp && (
          <form onSubmit={submitDecision} className="space-y-4 text-xs">
            {/* Candidate & Job Info Card */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{decisionModalApp.candidate_name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Applied for: <span className="font-semibold text-slate-800">{decisionModalApp.job_title}</span></p>
                </div>
                <StatusBadge status={decisionModalApp.status} />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-[11px]">
                <Mail className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
                <span className="text-slate-600">Candidate Email:</span>
                <span className="font-bold text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                  {decisionModalApp.candidate_email}
                </span>
              </div>
            </div>

            {/* Decision Status Selector */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Select Recruiter Decision *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'Selected', label: 'Selected / Offer', desc: 'Delighted hiring offer', border: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-800' },
                  { id: 'Shortlisted', label: 'Shortlisted', desc: 'Advance to next round', border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-800' },
                  { id: 'Under Review', label: 'Under Review', desc: 'Actively evaluating profile', border: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-800' },
                  { id: 'Rejected', label: 'Rejected', desc: 'Not proceeding further', border: 'border-rose-500', bg: 'bg-rose-50', text: 'text-rose-800' },
                  { id: 'Interview Scheduled', label: 'Interview Scheduled', desc: 'Set interview round', border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-800' },
                  { id: 'Applied', label: 'Applied', desc: 'Initial submitted state', border: 'border-slate-400', bg: 'bg-slate-50', text: 'text-slate-700' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setDecisionStatus(item.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      decisionStatus === item.id
                        ? `${item.border} ${item.bg} ring-2 ring-offset-1 ring-primary-500`
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <p className={`font-bold text-xs ${decisionStatus === item.id ? item.text : 'text-slate-800'}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recruiter Remarks / Feedback */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Decision Remarks / Feedback to Candidate (Delivered via Email)
              </label>
              <textarea
                rows={3}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder={
                  decisionStatus === 'Selected'
                    ? 'e.g., Congratulations! We are thrilled to offer you the position. Our HR onboarding team will contact you regarding next steps and joining date.'
                    : decisionStatus === 'Rejected'
                    ? 'e.g., Thank you for interviewing with us. We were impressed by your background, but decided to move forward with candidates whose experience more closely matches our immediate project needs.'
                    : decisionStatus === 'Shortlisted'
                    ? 'e.g., Great job! You have been shortlisted for the technical interview stage. We will schedule your interview slot shortly.'
                    : 'Add optional feedback or instructions for the candidate...'
                }
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">This message is saved in database and sent in the candidate notification email.</p>
            </div>

            {/* Email Notification Option */}
            <div className="bg-primary-50/70 p-3.5 rounded-xl border border-primary-200 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="sendEmailCheck"
                checked={sendEmailNotification}
                onChange={(e) => setSendEmailNotification(e.target.checked)}
                className="mt-0.5 rounded text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="sendEmailCheck" className="cursor-pointer select-none">
                <span className="font-bold text-primary-950 block text-[11px]">
                  Send Email Notification to Candidate ({decisionModalApp.candidate_email})
                </span>
                <span className="text-[10px] text-primary-700 block mt-0.5">
                  Sends a formatted notification email with your decision and remarks to the candidate.
                </span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDecisionModalApp(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingDecision}
                className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                {submittingDecision ? 'Saving & Sending Email...' : 'Confirm Decision & Send Email'}
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
