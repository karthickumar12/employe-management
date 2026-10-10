const { query } = require('../config/db');

// Get Dashboard Statistics based on user role
async function getDashboardStats(req, res) {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    if (role === 'admin') {
      const [candidates] = await query("SELECT COUNT(*) as count FROM users WHERE role = 'candidate'");
      const [recruiters] = await query("SELECT COUNT(*) as count FROM users WHERE role = 'recruiter'");
      const [jobs] = await query("SELECT COUNT(*) as count FROM jobs");
      const [applications] = await query("SELECT COUNT(*) as count FROM applications");
      const [selected] = await query("SELECT COUNT(*) as count FROM applications WHERE status = 'Selected'");

      return res.json({
        totalCandidates: candidates.count,
        totalRecruiters: recruiters.count,
        totalJobVacancies: jobs.count,
        totalApplications: applications.count,
        selectedCandidates: selected.count
      });
    }

    if (role === 'recruiter') {
      // Find recruiter id
      const recs = await query("SELECT id FROM recruiters WHERE user_id = ?", [userId]);
      const recId = recs.length > 0 ? recs[0].id : 0;

      const [activeJobs] = await query("SELECT COUNT(*) as count FROM jobs WHERE recruiter_id = ? AND status = 'Open'", [recId]);
      const [totalApplicants] = await query(
        `SELECT COUNT(*) as count FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.recruiter_id = ?`,
        [recId]
      );
      const [shortlisted] = await query(
        `SELECT COUNT(*) as count FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.recruiter_id = ? AND a.status = 'Shortlisted'`,
        [recId]
      );
      const [interviews] = await query(
        `SELECT COUNT(*) as count FROM interviews i JOIN applications a ON i.application_id = a.id JOIN jobs j ON a.job_id = j.id WHERE j.recruiter_id = ? AND i.status = 'Scheduled'`,
        [recId]
      );

      return res.json({
        activeJobVacancies: activeJobs.count,
        totalApplicants: totalApplicants.count,
        shortlistedCandidates: shortlisted.count,
        upcomingInterviews: interviews.count
      });
    }

    if (role === 'candidate') {
      const cands = await query("SELECT id FROM candidates WHERE user_id = ?", [userId]);
      const candId = cands.length > 0 ? cands[0].id : 0;

      const [availableJobs] = await query("SELECT COUNT(*) as count FROM jobs WHERE status = 'Open'");
      const [appliedJobs] = await query("SELECT COUNT(*) as count FROM applications WHERE candidate_id = ?", [candId]);
      const [underReview] = await query("SELECT COUNT(*) as count FROM applications WHERE candidate_id = ? AND status = 'Under Review'", [candId]);
      const [interviews] = await query(
        `SELECT COUNT(*) as count FROM interviews i JOIN applications a ON i.application_id = a.id WHERE a.candidate_id = ? AND i.status = 'Scheduled'`,
        [candId]
      );

      return res.json({
        availableJobs: availableJobs.count,
        appliedJobs: appliedJobs.count,
        applicationsUnderReview: underReview.count,
        upcomingInterviews: interviews.count
      });
    }

    return res.status(400).json({ message: 'Invalid user role.' });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ message: 'Server error computing dashboard statistics.', error: error.message });
  }
}

// Get detailed recruitment analytics & charts data
async function getReports(req, res) {
  try {
    // 1. Status Breakdown
    const statusBreakdown = await query(`
      SELECT status, COUNT(*) as count 
      FROM applications 
      GROUP BY status
    `);

    // 2. Department-wise jobs and application distribution
    const departmentDistribution = await query(`
      SELECT d.name as department, 
             COUNT(DISTINCT j.id) as total_jobs, 
             COUNT(DISTINCT a.id) as total_applications
      FROM departments d
      LEFT JOIN jobs j ON j.department_id = d.id
      LEFT JOIN applications a ON a.job_id = j.id
      GROUP BY d.id, d.name
    `);

    // 3. Top jobs by popularity
    const topJobs = await query(`
      SELECT j.id, j.title, d.name as department_name, j.location, COUNT(a.id) as applicant_count
      FROM jobs j
      JOIN departments d ON j.department_id = d.id
      LEFT JOIN applications a ON a.job_id = j.id
      GROUP BY j.id, j.title, d.name, j.location
      ORDER BY applicant_count DESC
      LIMIT 5
    `);

    // 4. Monthly recruitment trend (mock/simulated timeline grouping by applied_at)
    const monthlyTrends = await query(`
      SELECT DATE_FORMAT(applied_at, '%b %Y') as month, COUNT(*) as applications
      FROM applications
      GROUP BY DATE_FORMAT(applied_at, '%b %Y')
      ORDER BY MIN(applied_at) ASC
    `);

    return res.json({
      statusBreakdown,
      departmentDistribution,
      topJobs,
      monthlyTrends
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    return res.status(500).json({ message: 'Server error generating recruitment analytics.', error: error.message });
  }
}

const { getEmailLogs: fetchEmailLogs, retryFailedEmail } = require('../services/emailService');

// Get User Notifications
async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const notifications = await query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20', [userId]);
    return res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Server error fetching notifications.', error: error.message });
  }
}

// Mark notification as read
async function markNotificationRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Error marking notification read:', error);
    return res.status(500).json({ message: 'Server error updating notification.', error: error.message });
  }
}

// Admin Email Notification History & Outbox Viewer
async function getEmailLogs(req, res) {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const result = await fetchEmailLogs({
      limit: parseInt(limit),
      offset,
      status: status || undefined,
      search: search || undefined
    });

    return res.json({
      logs: result.logs,
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(result.total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return res.status(500).json({ message: 'Server error retrieving email history.', error: error.message });
  }
}

// Admin Retry Failed Outbox Email
async function retryEmail(req, res) {
  try {
    const { id } = req.params;
    const result = await retryFailedEmail(id);
    return res.json({ message: 'Email retry dispatched successfully.', result });
  } catch (error) {
    console.error('Error retrying email:', error);
    return res.status(500).json({ message: 'Failed to resend email: ' + error.message });
  }
}

module.exports = {
  getDashboardStats,
  getReports,
  getNotifications,
  markNotificationRead,
  getEmailLogs,
  retryEmail
};

