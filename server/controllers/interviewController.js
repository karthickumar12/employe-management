const { query } = require('../config/db');

// Schedule interview
async function scheduleInterview(req, res) {
  try {
    const { application_id, scheduled_date, location_or_link, notes } = req.body;

    if (!application_id || !scheduled_date || !location_or_link) {
      return res.status(400).json({ message: 'Application ID, scheduled date, and meeting location/link are required.' });
    }

    const apps = await query(
      `SELECT a.id, a.job_id, j.title as job_title, c.user_id as candidate_user_id 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       JOIN candidates c ON a.candidate_id = c.id 
       WHERE a.id = ?`,
      [application_id]
    );

    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application record not found.' });
    }

    // Check if interview already scheduled
    const existingInt = await query('SELECT id FROM interviews WHERE application_id = ?', [application_id]);
    let interviewId;

    if (existingInt.length > 0) {
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

    // Send Notification to candidate
    const formattedDate = new Date(scheduled_date).toLocaleString();
    await query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [
        apps[0].candidate_user_id,
        'Interview Scheduled!',
        `Your interview for "${apps[0].job_title}" has been scheduled for ${formattedDate}. Location/Link: ${location_or_link}`
      ]
    );

    return res.status(201).json({
      message: 'Interview scheduled successfully!',
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

    const intCheck = await query('SELECT * FROM interviews WHERE id = ?', [id]);
    if (intCheck.length === 0) {
      return res.status(404).json({ message: 'Interview record not found.' });
    }

    await query(
      'UPDATE interviews SET status = ?, notes = COALESCE(?, notes) WHERE id = ?',
      [status, notes || null, id]
    );

    // If Passed or Failed, update application status accordingly
    if (status === 'Passed') {
      await query('UPDATE applications SET status = "Selected" WHERE id = ?', [intCheck[0].application_id]);
    } else if (status === 'Failed') {
      await query('UPDATE applications SET status = "Rejected" WHERE id = ?', [intCheck[0].application_id]);
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
