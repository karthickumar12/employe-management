import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import { ArrowLeft, CheckCircle2, Clock, Calendar, Building2, MapPin, User, Mail, MessageSquare, Award } from 'lucide-react';

export const ApplicationTracking = () => {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrackingData();
  }, [id]);

  const fetchTrackingData = async () => {
    try {
      const res = await api.get(`/applications/track/${id}`);
      setApp(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto p-8 w-full">
          <div className="h-64 bg-slate-200 animate-pulse rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900">Application Record Not Found</h2>
          <Link to="/candidate/applications" className="mt-4 px-4 py-2 bg-primary-600 text-white font-bold text-xs rounded-lg">
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  // Pipeline stages calculation
  const stages = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected'];
  const currentStatus = app.status;

  const getStageState = (stageName) => {
    if (currentStatus === 'Rejected') {
      if (stageName === 'Applied') return 'completed';
      return 'failed';
    }

    const stageOrder = {
      'Applied': 1,
      'Under Review': 2,
      'Shortlisted': 3,
      'Interview Scheduled': 4,
      'Selected': 5
    };

    const currentRank = stageOrder[currentStatus] || 1;
    const stageRank = stageOrder[stageName] || 1;

    if (stageRank < currentRank) return 'completed';
    if (stageRank === currentRank) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-4xl">
          <Link
            to="/candidate/applications"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Applications
          </Link>

          {/* Application Job Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded border border-primary-200">
                  {app.department_name}
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">{app.job_title}</h1>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {app.company_name} • <MapPin className="w-3.5 h-3.5 text-slate-400 ml-1" /> {app.job_location}
                </p>
              </div>
              <StatusBadge status={app.status} />
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-500">
              <p>Application ID: <strong className="text-slate-900">#APP-{app.id}</strong></p>
              <p>Submitted On: <strong className="text-slate-900">{new Date(app.applied_at).toLocaleString()}</strong></p>
            </div>
          </div>

          {/* Recruiter Decision Feedback & Notes */}
          {app.recruiter_notes && (
            <div className={`p-5 rounded-2xl border shadow-sm ${
              app.status === 'Selected' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' :
              app.status === 'Rejected' ? 'bg-slate-50 border-slate-300 text-slate-800' :
              app.status === 'Shortlisted' ? 'bg-blue-50/80 border-blue-200 text-blue-950' :
              'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                <MessageSquare className={`w-4 h-4 ${
                  app.status === 'Selected' ? 'text-emerald-700' :
                  app.status === 'Rejected' ? 'text-slate-600' :
                  app.status === 'Shortlisted' ? 'text-blue-700' :
                  'text-amber-700'
                }`} />
                <span>Recruiter Decision Remarks & Feedback:</span>
              </div>
              <p className="text-xs leading-relaxed font-medium whitespace-pre-line pl-6">
                {app.recruiter_notes}
              </p>
            </div>
          )}

          {/* Visual Step Timeline Tracker */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900">Recruitment Status Timeline</h2>

            <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 py-2">
              {stages.map((stage, idx) => {
                const state = getStageState(stage);

                return (
                  <div key={stage} className="relative pl-6">
                    {/* Circle Node */}
                    <div className={`absolute -left-[17px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                      state === 'completed' 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : state === 'current'
                        ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/30'
                        : state === 'failed'
                        ? 'bg-rose-100 border-rose-400 text-rose-700'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}>
                      {state === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div>
                      <h3 className={`text-sm font-bold ${
                        state === 'current' ? 'text-primary-700' : state === 'completed' ? 'text-emerald-900' : 'text-slate-500'
                      }`}>
                        {stage}
                      </h3>
                      
                      <p className="text-xs text-slate-500 mt-0.5">
                        {stage === 'Applied' && 'Application recorded in recruitment database.'}
                        {stage === 'Under Review' && 'Recruiter is reviewing education, skills, and resume PDF.'}
                        {stage === 'Shortlisted' && 'Profile meets eligibility criteria for technical interview.'}
                        {stage === 'Interview Scheduled' && (app.scheduled_date ? `Scheduled for ${new Date(app.scheduled_date).toLocaleString()}` : 'Awaiting interview date slot.')}
                        {stage === 'Selected' && 'Congratulations! You have been selected for this position.'}
                      </p>

                      {stage === 'Interview Scheduled' && app.location_or_link && (
                        <div className="mt-2 p-3 bg-cyan-50 rounded-xl border border-cyan-200 text-xs">
                          <p className="font-bold text-cyan-900">Interview Meeting Details:</p>
                          <p className="text-cyan-800 font-semibold">{new Date(app.scheduled_date).toLocaleString()}</p>
                          <a href={app.location_or_link} target="_blank" rel="noreferrer" className="text-primary-700 font-bold hover:underline block truncate mt-0.5">
                            {app.location_or_link}
                          </a>
                          {app.interview_notes && <p className="text-slate-600 mt-1 italic">"{app.interview_notes}"</p>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cover Letter Box */}
          {app.cover_letter && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Submitted Cover Letter</h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80 italic">
                "{app.cover_letter}"
              </p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default ApplicationTracking;
