import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, FileText, ArrowLeft, ExternalLink } from 'lucide-react';

export const CandidateDetails = () => {
  const { candidateId } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidateInfo();
  }, [candidateId]);

  const fetchCandidateInfo = async () => {
    try {
      const res = await api.get('/users/candidates');
      const cand = res.data.find(c => c.id === parseInt(candidateId));
      setCandidate(cand || null);
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

  if (!candidate) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900">Candidate Profile Not Found</h2>
          <Link to="/recruiter/applicants" className="mt-4 px-4 py-2 bg-primary-600 text-white font-bold text-xs rounded-lg">
            Back to Applicants List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-4xl">
          <Link
            to="/recruiter/applicants"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Applicants Review
          </Link>

          {/* Profile Header */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                {candidate.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">{candidate.name}</h1>
                <p className="text-xs font-semibold text-primary-700">{candidate.headline || 'Job Candidate'}</p>
                <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {candidate.email}
                  <Phone className="w-3.5 h-3.5 text-slate-400 ml-2" /> {candidate.phone || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Sections */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs text-slate-700">
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary-600" /> Education & Qualifications
              </h3>
              <p className="bg-slate-50 p-4 rounded-xl border border-slate-200">{candidate.education || 'Not specified'}</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary-600" /> Work Experience
              </h3>
              <p className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-semibold text-slate-900">
                {candidate.experience_years} Years Professional Experience
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-2">Technical Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills ? (
                  candidate.skills.split(',').map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 border border-primary-200 font-semibold rounded-lg">
                      {skill.trim()}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-400">No skills listed</p>
                )}
              </div>
            </div>

            {candidate.bio && (
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-2">Personal Biography</h3>
                <p className="bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed italic">
                  "{candidate.bio}"
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-slate-400">Total Applications Submitted: <strong className="text-slate-900">{candidate.total_applications}</strong></span>
              <Link to={`/recruiter/applicants?search=${encodeURIComponent(candidate.name)}`} className="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg shadow-sm">
                Review Job Applications
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CandidateDetails;
