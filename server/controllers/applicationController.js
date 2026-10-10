const path = require('path');
const fs = require('fs');
const { query } = require('../config/db');
const { 
  sendCandidateApplicationConfirmation, 
  sendRecruiterNewApplicantAlert, 
  sendCandidateStatusUpdateNotification 
} = require('../services/emailService');

// Candidate apply for job
async function applyForJob(req, res) {
  try {
    const userId = req.user.id;
    const { job_id, cover_letter } = req.body;

    if (!job_id) {
      return res.status(400).json({ message: 'Job ID is required.' });
    }

    // Get candidate ID for user
    const candidates = await query('SELECT id FROM candidates WHERE user_id = ?', [userId]);
    if (candidates.length === 0) {
      return res.status(400).json({ message: 'Candidate profile not found. Please complete your profile before applying.' });
    }
    const candidateId = candidates[0].id;

    // Prevent duplicate applications
    const existing = await query('SELECT id FROM applications WHERE job_id = ? AND candidate_id = ?', [job_id, candidateId]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already applied for this job vacancy.' });
    }

    // Handle resume upload or fetch latest uploaded resume
    let resumeId = null;
    if (req.file) {
      const resumeResult = await query(
        'INSERT INTO resumes (candidate_id, file_name, file_path, file_size) VALUES (?, ?, ?, ?)',
        [candidateId, req.file.originalname, 'uploads/' + req.file.filename, req.file.size]
      );
      resumeId = resumeResult.insertId;
    } else {
      const latestResumes = await query('SELECT id FROM resumes WHERE candidate_id = ? ORDER BY uploaded_at DESC LIMIT 1', [candidateId]);
      if (latestResumes.length > 0) {
        resumeId = latestResumes[0].id;
      }
    }

    // Insert Application
    const appResult = await query(
      'INSERT INTO applications (job_id, candidate_id, resume_id, status, cover_letter) VALUES (?, ?, ?, ?, ?)',
      [job_id, candidateId, resumeId, 'Applied', cover_letter || '']
    );

    // Fetch Job & Recruiter Details for Email Notifications & System Alert
    const jobInfo = await query(
      `SELECT j.title, r.company_name, u_rec.name as recruiter_name, u_rec.email as recruiter_email, r.user_id as recruiter_user_id 
       FROM jobs j 
       JOIN recruiters r ON j.recruiter_id = r.id 
       JOIN users u_rec ON r.user_id = u_rec.id 
       WHERE j.id = ?`,
      [job_id]
    );

    const candidateUser = await query('SELECT name, email FROM users WHERE id = ?', [userId]);
    const candidateName = candidateUser[0]?.name || req.user.name || 'Candidate';
    const candidateEmail = candidateUser[0]?.email || req.user.email;

    if (jobInfo.length > 0) {
      const jobDetails = jobInfo[0];

      // In-app Notification to recruiter
      await query(
        'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
        [jobDetails.recruiter_user_id, 'New Application Received', `${candidateName} submitted an application for "${jobDetails.title}".`]
      );

      // 📧 1. Send Confirmation Email to Candidate
      sendCandidateApplicationConfirmation({
        candidateName,
        candidateEmail,
        jobTitle: jobDetails.title,
        companyName: jobDetails.company_name,
        applicationId: appResult.insertId,
        submissionDate: new Date(),
        status: 'Applied'
      }).catch(err => console.error('Email confirmation error:', err));

      // 📧 2. Send Alert Email to Recruiter
      sendRecruiterNewApplicantAlert({
        recruiterName: jobDetails.recruiter_name,
        recruiterEmail: jobDetails.recruiter_email,
        candidateName,
        candidateEmail,
        jobTitle: jobDetails.title,
        applicationId: appResult.insertId
      }).catch(err => console.error('Recruiter email alert error:', err));
    }

    return res.status(201).json({
      message: 'Job application submitted successfully!',
      applicationId: appResult.insertId
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    return res.status(500).json({ message: 'Server error submitting application.', error: error.message });
  }
}

// Upload/Update Candidate Resume PDF
async function uploadResume(req, res) {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'Please attach a valid PDF or Word document.' });
    }

    const candidates = await query('SELECT id FROM candidates WHERE user_id = ?', [userId]);
    if (candidates.length === 0) {
      return res.status(400).json({ message: 'Candidate profile not found.' });
    }
    const candidateId = candidates[0].id;

    const resumeResult = await query(
      'INSERT INTO resumes (candidate_id, file_name, file_path, file_size) VALUES (?, ?, ?, ?)',
      [candidateId, req.file.originalname, 'uploads/' + req.file.filename, req.file.size]
    );

    return res.status(201).json({
      message: 'Resume uploaded successfully!',
      resume: {
        id: resumeResult.insertId,
        file_name: req.file.originalname,
        file_path: 'uploads/' + req.file.filename,
        uploaded_at: new Date()
      }
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    return res.status(500).json({ message: 'Server error uploading resume file.', error: error.message });
  }
}

// Get Candidate's submitted applications
async function getMyApplications(req, res) {
  try {
    const userId = req.user.id;
    const candidates = await query('SELECT id FROM candidates WHERE user_id = ?', [userId]);
    
    if (candidates.length === 0) {
      return res.json([]);
    }

    const candidateId = candidates[0].id;
    const sql = `
      SELECT a.*, j.title as job_title, j.location as job_location, j.employment_type, j.salary_range,
             d.name as department_name, r.company_name,
             i.id as interview_id, i.scheduled_date, i.location_or_link, i.notes as interview_notes, i.status as interview_status
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN departments d ON j.department_id = d.id
      JOIN recruiters r ON j.recruiter_id = r.id
      LEFT JOIN interviews i ON i.application_id = a.id
      WHERE a.candidate_id = ?
      ORDER BY a.applied_at DESC
    `;

    const apps = await query(sql, [candidateId]);
    return res.json(apps);
  } catch (error) {
    console.error('Error fetching candidate applications:', error);
    return res.status(500).json({ message: 'Server error fetching applications.', error: error.message });
  }
}

// Candidate track single application status with visual steps
async function getApplicationTracking(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const sql = `
      SELECT a.*, j.title as job_title, j.location as job_location, j.employment_type, j.description as job_description,
             d.name as department_name, r.company_name, u.name as recruiter_name, u.email as recruiter_email,
             i.id as interview_id, i.scheduled_date, i.location_or_link, i.notes as interview_notes, i.status as interview_status
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN departments d ON j.department_id = d.id
      JOIN recruiters r ON j.recruiter_id = r.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN interviews i ON i.application_id = a.id
      WHERE a.id = ?
    `;

    const apps = await query(sql, [id]);
    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application record not found.' });
    }

    return res.json(apps[0]);
  } catch (error) {
    console.error('Error in application tracking:', error);
    return res.status(500).json({ message: 'Server error loading tracking details.', error: error.message });
  }
}

// Candidate withdraw application
async function withdrawApplication(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appCheck = await query(
      `SELECT a.id, a.status FROM applications a 
       JOIN candidates c ON a.candidate_id = c.id 
       WHERE a.id = ? AND c.user_id = ?`,
      [id, userId]
    );

    if (appCheck.length === 0) {
      return res.status(404).json({ message: 'Application not found or unauthorized.' });
    }

    if (appCheck[0].status === 'Selected' || appCheck[0].status === 'Rejected') {
      return res.status(400).json({ message: `Cannot withdraw application once status is ${appCheck[0].status}.` });
    }

    await query('DELETE FROM applications WHERE id = ?', [id]);
    return res.json({ message: 'Application withdrawn successfully.' });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    return res.status(500).json({ message: 'Server error withdrawing application.', error: error.message });
  }
}

// Recruiter / Admin get all applicants (with filters by job, status, search)
async function getApplicants(req, res) {
  try {
    const { job_id, status, search } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let sql = `
      SELECT a.*, 
             j.title as job_title, j.location as job_location,
             d.name as department_name,
             c.phone as candidate_phone, c.headline as candidate_headline, c.location as candidate_location,
             c.education, c.experience_years, c.skills, c.bio,
             u.id as candidate_user_id, u.name as candidate_name, u.email as candidate_email,
             res.file_name, res.file_path,
             i.id as interview_id, i.scheduled_date, i.location_or_link, i.notes as interview_notes, i.status as interview_status
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN departments d ON j.department_id = d.id
      JOIN candidates c ON a.candidate_id = c.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN resumes res ON a.resume_id = res.id
      LEFT JOIN interviews i ON i.application_id = a.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by recruiter if recruiter role
    if (userRole === 'recruiter') {
      sql += ` AND j.recruiter_id IN (SELECT id FROM recruiters WHERE user_id = ?)`;
      params.push(userId);
    }

    if (job_id) {
      sql += ` AND a.job_id = ?`;
      params.push(job_id);
    }

    if (status) {
      sql += ` AND a.status = ?`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (u.name LIKE ? OR u.email LIKE ? OR c.skills LIKE ? OR j.title LIKE ?)`;
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    sql += ` ORDER BY a.applied_at DESC`;

    const applicants = await query(sql, params);
    return res.json(applicants);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return res.status(500).json({ message: 'Server error fetching applicants list.', error: error.message });
  }
}

// Update Application Status (Applied, Under Review, Shortlisted, Interview Scheduled, Selected, Rejected)
async function updateApplicationStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid application status provided.' });
    }

    const appDetails = await query(
      `SELECT a.id, a.status as old_status, j.title as job_title, c.user_id as candidate_user_id, u.name as candidate_name, u.email as candidate_email 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       JOIN candidates c ON a.candidate_id = c.id 
       JOIN users u ON c.user_id = u.id 
       WHERE a.id = ?`,
      [id]
    );

    if (appDetails.length === 0) {
      return res.status(404).json({ message: 'Application record not found.' });
    }

    const currentApp = appDetails[0];
    const oldStatus = currentApp.old_status;

    // Send notifications ONLY when the status genuinely changes
    if (oldStatus === status) {
      return res.json({ 
        message: `Application is already at status "${status}".`,
        updated: false 
      });
    }

    await query('UPDATE applications SET status = ? WHERE id = ?', [status, id]);

    // Send In-App Notification to Candidate
    const candidateUserId = currentApp.candidate_user_id;
    const candidateName = currentApp.candidate_name;
    const candidateEmail = currentApp.candidate_email;
    const jobTitle = currentApp.job_title;

    await query(
      'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
      [candidateUserId, `Application Status Update: ${status}`, `Your application for "${jobTitle}" has been updated from "${oldStatus}" to "${status}".`]
    );

    // 📧 Send Email Notification to Candidate on Genuine Status Change
    let emailDelivered = true;
    try {
      const emailResult = await sendCandidateStatusUpdateNotification({
        candidateName,
        candidateEmail,
        jobTitle,
        oldStatus,
        newStatus: status,
        applicationId: id
      });
      if (emailResult && !emailResult.success) {
        emailDelivered = false;
      }
    } catch (emailErr) {
      console.error('Status update email error:', emailErr.message);
      emailDelivered = false;
    }

    return res.json({ 
      message: `Application status updated to ${status}.`,
      updated: true,
      emailDelivered
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ message: 'Server error updating status.', error: error.message });
  }
}

// Download/View Resume file
async function getResumeFile(req, res) {
  try {
    const { resumeId } = req.params;
    const resumes = await query('SELECT * FROM resumes WHERE id = ?', [resumeId]);

    if (resumes.length === 0) {
      return res.status(404).json({ message: 'Resume file record not found.' });
    }

    const resume = resumes[0];
    const fullPath = path.join(__dirname, '..', resume.file_path);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'Resume file does not exist on disk server.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${resume.file_name}"`);
    return res.sendFile(fullPath);
  } catch (error) {
    console.error('Error serving resume file:', error);
    return res.status(500).json({ message: 'Server error delivering resume file.', error: error.message });
  }
}

module.exports = {
  applyForJob,
  uploadResume,
  getMyApplications,
  getApplicationTracking,
  withdrawApplication,
  getApplicants,
  updateApplicationStatus,
  getResumeFile
};
