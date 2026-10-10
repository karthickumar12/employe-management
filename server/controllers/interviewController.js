const { query } = require('../config/db');
const { 
  sendInterviewScheduledEmail, 
  sendInterviewCancelledEmail,
  sendCandidateStatusUpdateNotification 
} = require('../services/emailService');

// Schedule or reschedule interview
async function scheduleInterview(req, res) {
  try {
    const { application_id, scheduled_date, location_or_link, notes } = req.body;

    if (!application_id || !scheduled_date || !location_or_link) {
      return res.status(400).json({ message: 'Application ID, scheduled date, and meeting location/link are required.' });
    }

    const apps = await query(
      `SELECT a.id, a.job_id, j.title as job_title, c.user_id as candidate_user_id, u.name as candidate_name, u.email as candidate_email 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       JOIN candidates c ON a.candidate_id = c.id 
       JOIN users u ON c.user_id = u.id 
       WHERE a.id = ?`,
      [application_id]
    );

    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application record not found.' });
    }

    const appInfo = apps[0];

    // Check if interview already scheduled (to distinguish new vs reschedule)
    const existingInt = await query('SELECT id FROM interviews WHERE application_id = ?', [application_id]);
    let interviewId;
    const isUpdate = existingInt.length > 0;

    if (isUpdate) {
      interviewId = existingInt[0].id;
      await query(
        'UPDATE interviews SET scheduled_date = ?, location_or_link = ?, notes = ?, status = ? WHERE id = ?',
        [scheduled_date, location_or_link, notes || '', 'Scheduled', interviewId]
      );
    } else {
      const result = await query(
        'INSERT INTO interviews (application_id, scheduled_date, location_or_link, notes, status) VALUES (?, ?, ?, ?, ?)',
        [application_id, scheduled_date, location_or_link, notes || '', 'Scheduled']
      );
      interviewId = result.insertId;
    }

    // Update Application status to 'Interview Scheduled'
    await query('UPDATE applications SET status = "Interview Scheduled" WHERE id = ?', [application_id]);

    // Send in-app notification to candidate
    const formattedDate = new Date(scheduled_date).toLocaleString();
    await query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [
        appInfo.candidate_user_id,
        isUpdate ? 'Interview Rescheduled!' : 'Interview Scheduled!',
        `Your interview for "${appInfo.job_title}" has been ${isUpdate ? 'rescheduled' : 'scheduled'} for ${formattedDate}. Location/Link: ${location_or_link}`
      ]
    );

    // 📧 Send Interview Scheduled / Rescheduled Email Notification to Candidate
    sendInterviewScheduledEmail({
      candidateName: appInfo.candidate_name,
      candidateEmail: appInfo.candidate_email,
      jobTitle: appInfo.job_title,
      scheduledDate,
      locationOrLink,
      notes,
      interviewId,
      isUpdate
    }).catch(err => console.error('Interview schedule email dispatch error:', err.message));

    return res.status(201).json({
      message: `Interview ${isUpdate ? 'rescheduled' : 'scheduled'} successfully!`,
      interviewId
    });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    return res.status(500).json({ message: 'Server error scheduling interview.', error: error.message });
  }
}

// Get Interviews for current user (Candidate, Recruiter, Admin)
async function getInterviews(req, res) {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let sql = `
      SELECT i.*, 
             a.status as application_status, a.cover_letter,
             j.title as job_title, j.location as job_location,
             d.name as department_name, r.company_name,
             u_cand.name as candidate_name, u_cand.email as candidate_email, c.phone as candidate_phone,
             u_rec.name as recruiter_name
      FROM interviews i
      JOIN applications a ON i.application_id = a.id
      JOIN jobs j ON a.job_id = j.id
      JOIN departments d ON j.department_id = d.id
      JOIN recruiters r ON j.recruiter_id = r.id
      JOIN users u_rec ON r.user_id = u_rec.id
      JOIN candidates c ON a.candidate_id = c.id
      JOIN users u_cand ON c.user_id = u_cand.id
      WHERE 1=1
    `;
    const params = [];

    if (role === 'candidate') {
      sql += ` AND c.user_id = ?`;
      params.push(userId);
    } else if (role === 'recruiter') {
      sql += ` AND r.user_id = ?`;
      params.push(userId);
    }

    sql += ` ORDER BY i.scheduled_date ASC`;

    const interviews = await query(sql, params);
    return res.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return res.status(500).json({ message: 'Server error fetching interview list.', error: error.message });
  }
}

// Update interview status/outcome
async function updateInterviewStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'Passed', 'Failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid interview status.' });
    }

    const intDetails = await query(
      `SELECT i.*, a.job_id, j.title as job_title, u.id as candidate_user_id, u.name as candidate_name, u.email as candidate_email 
       FROM interviews i 
       JOIN applications a ON i.application_id = a.id 
       JOIN jobs j ON a.job_id = j.id 
       JOIN candidates c ON a.candidate_id = c.id 
       JOIN users u ON c.user_id = u.id 
       WHERE i.id = ?`,
      [id]
    );

    if (intDetails.length === 0) {
      return res.status(404).json({ message: 'Interview record not found.' });
    }

    const intRecord = intDetails[0];

    await query(
      'UPDATE interviews SET status = ?, notes = COALESCE(?, notes) WHERE id = ?',
      [status, notes || null, id]
    );

    // If Cancelled, send cancellation email
    if (status === 'Cancelled') {
      sendInterviewCancelledEmail({
        candidateName: intRecord.candidate_name,
        candidateEmail: intRecord.candidate_email,
        jobTitle: intRecord.job_title,
        interviewId: id,
        notes: notes || intRecord.notes
      }).catch(err => console.error('Interview cancellation email error:', err.message));

      await query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [intRecord.candidate_user_id, 'Interview Cancelled', `Your interview for "${intRecord.job_title}" has been cancelled.`]
      );
    }

    // If Passed or Failed, update application status accordingly and notify candidate
    if (status === 'Passed') {
      await query('UPDATE applications SET status = "Selected" WHERE id = ?', [intRecord.application_id]);
      sendCandidateStatusUpdateNotification({
        candidateName: intRecord.candidate_name,
        candidateEmail: intRecord.candidate_email,
        jobTitle: intRecord.job_title,
        oldStatus: 'Interview Scheduled',
        newStatus: 'Selected',
        applicationId: intRecord.application_id
      }).catch(err => console.error('Outcome status update email error:', err.message));
    } else if (status === 'Failed') {
      await query('UPDATE applications SET status = "Rejected" WHERE id = ?', [intRecord.application_id]);
      sendCandidateStatusUpdateNotification({
        candidateName: intRecord.candidate_name,
        candidateEmail: intRecord.candidate_email,
        jobTitle: intRecord.job_title,
        oldStatus: 'Interview Scheduled',
        newStatus: 'Rejected',
        applicationId: intRecord.application_id
      }).catch(err => console.error('Outcome status update email error:', err.message));
    }

    return res.json({ message: `Interview status updated to ${status}.` });
  } catch (error) {
    console.error('Error updating interview status:', error);
    return res.status(500).json({ message: 'Server error updating interview status.', error: error.message });
  }
}

module.exports = {
  scheduleInterview,
  getInterviews,
  updateInterviewStatus
};
