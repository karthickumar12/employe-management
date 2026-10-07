import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Register from './pages/Register';
import Login from './pages/Login';
import Contact from './pages/Contact';

// Candidate Pages
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import CandidateProfile from './pages/candidate/CandidateProfile';
import MyApplications from './pages/candidate/MyApplications';
import ApplicationTracking from './pages/candidate/ApplicationTracking';
import CandidateInterviews from './pages/candidate/CandidateInterviews';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import ManageJobs from './pages/recruiter/ManageJobs';
import CreateJob from './pages/recruiter/CreateJob';
import Applicants from './pages/recruiter/Applicants';
import CandidateDetails from './pages/recruiter/CandidateDetails';
import InterviewManagement from './pages/recruiter/InterviewManagement';
import RecruiterReports from './pages/recruiter/RecruiterReports';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageRecruiters from './pages/admin/ManageRecruiters';
import ManageCandidates from './pages/admin/ManageCandidates';
import AdminJobs from './pages/admin/AdminJobs';
import AdminApplications from './pages/admin/AdminApplications';
import AdminReports from './pages/admin/AdminReports';

// Role Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />;
    return <Navigate to="/candidate/dashboard" replace />;
  }

  return children;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Contact />} />

          {/* Candidate Protected Routes */}
          <Route path="/candidate/dashboard" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard /></ProtectedRoute>} />
          <Route path="/candidate/profile" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateProfile /></ProtectedRoute>} />
          <Route path="/candidate/applications" element={<ProtectedRoute allowedRoles={['candidate']}><MyApplications /></ProtectedRoute>} />
          <Route path="/candidate/tracking/:id" element={<ProtectedRoute allowedRoles={['candidate']}><ApplicationTracking /></ProtectedRoute>} />
          <Route path="/candidate/interviews" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateInterviews /></ProtectedRoute>} />

          {/* Recruiter Protected Routes */}
          <Route path="/recruiter/dashboard" element={<ProtectedRoute allowedRoles={['recruiter', 'admin']}><RecruiterDashboard /></ProtectedRoute>} />
          <Route path="/recruiter/jobs" element={<ProtectedRoute allowedRoles={['recruiter', 'admin']}><ManageJobs /></ProtectedRoute>} />
          <Route path="/recruiter/jobs/create" element={<ProtectedRoute allowedRoles={['recruiter', 'admin']}><CreateJob /></ProtectedRoute>} />
          <Route path="/recruiter/applicants" element={<ProtectedRoute allowedRoles={['recruiter', 'admin']}><Applicants /></ProtectedRoute>} />
          <Route path="/recruiter/candidate/:candidateId" element={<ProtectedRoute allowedRoles={['recruiter', 'admin']}><CandidateDetails /></ProtectedRoute>} />
          <Route path="/recruiter/interviews" element={<ProtectedRoute allowedRoles={['recruiter', 'admin']}><InterviewManagement /></ProtectedRoute>} />
          <Route path="/recruiter/reports" element={<ProtectedRoute allowedRoles={['recruiter', 'admin']}><RecruiterReports /></ProtectedRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/recruiters" element={<ProtectedRoute allowedRoles={['admin']}><ManageRecruiters /></ProtectedRoute>} />
          <Route path="/admin/candidates" element={<ProtectedRoute allowedRoles={['admin']}><ManageCandidates /></ProtectedRoute>} />
          <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['admin']}><AdminJobs /></ProtectedRoute>} />
          <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={['admin']}><AdminApplications /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
