import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Toast from '../../components/Toast';
import { User, FileText, Upload, Save, CheckCircle2, Download, ExternalLink } from 'lucide-react';

export const CandidateProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    headline: '',
    location: '',
    education: '',
    experience_years: 0,
    skills: '',
    bio: ''
  });
  const [resume, setResume] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.user) {
        setProfile({
          name: res.data.user.name || '',
          phone: res.data.profile?.phone || '',
          headline: res.data.profile?.headline || '',
          location: res.data.profile?.location || '',
          education: res.data.profile?.education || '',
          experience_years: res.data.profile?.experience_years || 0,
          skills: res.data.profile?.skills || '',
          bio: res.data.profile?.bio || ''
        });
      }
      if (res.data.resume) {
        setResume(res.data.resume);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', profile);
      setToast({ message: 'Candidate profile details updated successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to update profile.', type: 'error' });
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setToast({ message: 'Please choose a PDF file to upload.', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('resume', selectedFile);

    setUploading(true);
    try {
      const res = await api.post('/applications/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResume(res.data.resume);
      setSelectedFile(null);
      setToast({ message: 'Resume uploaded successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Error uploading resume PDF file.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-4xl">
          
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Candidate Profile & Resume</h1>
            <p className="text-xs text-slate-500 mt-1">Manage your educational background, technical skills, and resume PDF document.</p>
          </div>

          {/* Resume Upload Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              Resume Document (PDF Format)
            </h2>

            {resume ? (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-emerald-900">{resume.file_name}</p>
                  <p className="text-emerald-700 text-[11px]">Uploaded on {new Date(resume.uploaded_at).toLocaleDateString()}</p>
                </div>
                <a
                  href={`/api/applications/resume/${resume.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 hover:bg-emerald-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View PDF
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No resume PDF uploaded yet. Please upload your resume for recruiters to review.</p>
            )}

            <form onSubmit={handleFileUpload} className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Resume'}
              </button>
            </form>
          </div>

          {/* Profile Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600" />
              Personal & Technical Profile Information
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={profile.headline}
                  onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                  placeholder="e.g. Senior Full Stack Developer | React & Node.js"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="e.g. Chennai, India"
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={profile.experience_years}
                    onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Education Background</label>
                <input
                  type="text"
                  value={profile.education}
                  onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                  placeholder="e.g. B.E. Computer Science & Engineering - Anna University"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skills & Technical Stack (comma separated)</label>
                <input
                  type="text"
                  value={profile.skills}
                  onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                  placeholder="React.js, Node.js, Express, MySQL, JavaScript, Tailwind CSS"
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Personal Biography / Summary</label>
                <textarea
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Short professional summary..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Profile Details
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

export default CandidateProfile;
