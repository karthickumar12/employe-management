const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { query } = require('../config/db');

dotenv.config();

let transporter = null;

/**
 * Initialize or get Nodemailer Transporter
 */
function getTransporter() {
  if (!transporter) {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || '';
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';

    if (smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 7000
      });
      console.log('📧 Nodemailer Transporter initialized for:', smtpUser);
    } else {
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('\n📬 --- [CONSOLE EMAIL SIMULATOR] ---');
          console.log(`FROM: ${mailOptions.from || 'noreply@recruitment.com'}`);
          console.log(`TO: ${mailOptions.to}`);
          console.log(`SUBJECT: ${mailOptions.subject}`);
          console.log(`BODY PREVIEW: ${(mailOptions.text || '').substring(0, 300)}...`);
          console.log('-------------------------------------\n');
          return { messageId: 'simulated-' + Date.now() };
        }
      };
      console.log('ℹ️ Nodemailer operating in Console Fallback mode (No SMTP credentials configured).');
    }
  }
  return transporter;
}

/**
 * Insert record into database email_logs (Outbox)
 */
async function logEmail({ recipientEmail, notificationType, subject, bodyPreview, relatedEntityType, relatedEntityId }) {
  try {
    const result = await query(
      `INSERT INTO email_logs 
       (recipient_email, notification_type, subject, body_preview, related_entity_type, related_entity_id, delivery_status, retry_count) 
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 0)`,
      [
        recipientEmail,
        notificationType,
        subject,
        (bodyPreview || '').substring(0, 1000),
        relatedEntityType || null,
        relatedEntityId || null
      ]
    );
    return result.insertId;
  } catch (err) {
    console.error('Failed to insert email log record:', err.message);
    return null;
  }
}

/**
 * Update delivery status in email_logs
 */
async function updateEmailLog(logId, { status, error }) {
  if (!logId) return;
  try {
    if (status === 'SENT') {
      await query(
        `UPDATE email_logs 
         SET delivery_status = 'SENT', sent_at = NOW(), last_error = NULL 
         WHERE id = ?`,
        [logId]
      );
    } else {
      await query(
        `UPDATE email_logs 
         SET delivery_status = 'FAILED', last_error = ? 
         WHERE id = ?`,
        [error || 'Unknown delivery failure', logId]
      );
    }
  } catch (err) {
    console.error('Failed to update email log:', err.message);
  }
}

/**
 * Universal email dispatcher with outbox logging and resilient fallback
 */
async function dispatchEmail({
  to,
  subject,
  text,
  html,
  notificationType,
  relatedEntityType,
  relatedEntityId
}) {
  const fromUser = process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@recruitment.com';
  const mailOptions = {
    from: `"RecruitX Portal" <${fromUser}>`,
    to,
    subject,
    text,
    html
  };

  // 1. Create outbox log record (PENDING)
  const logId = await logEmail({
    recipientEmail: to,
    notificationType,
    subject,
    bodyPreview: text || subject,
    relatedEntityType,
    relatedEntityId
  });

  // 2. Dispatch via Nodemailer
  try {
    const t = getTransporter();
    const info = await t.sendMail(mailOptions);
    console.log(`✅ [EMAIL SENT] To: ${to} | Subject: "${subject}" | MsgId: ${info.messageId}`);
    await updateEmailLog(logId, { status: 'SENT' });
    return { success: true, messageId: info.messageId, logId };
  } catch (err) {
    console.warn(`⚠️ [SMTP DELIVERY NOTICE] Could not deliver to ${to}: ${err.message}`);
    console.log(`📬 [FALLBACK LOGGED] SUBJECT: "${subject}" | RECIPIENT: ${to}`);
    if (text) {
      console.log(`📄 CONTENT PREVIEW:\n${text.substring(0, 350)}\n`);
    }
    await updateEmailLog(logId, { status: 'FAILED', error: err.message });
    return { success: false, error: err.message, logId };
  }
}

/**
 * Helper to build styled HTML email container
 */
function buildHtmlTemplate({ headerTitle, headerColor = '#0284c7', contentHtml, footerNote }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; }
        .container { max-width: 600px; margin: 24px auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, ${headerColor}, #0f172a); padding: 24px 30px; text-align: left; }
        .header h1 { margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.025em; }
        .header p { margin: 4px 0 0 0; color: #bae6fd; font-size: 12px; }
        .body { padding: 30px; }
        .card { background-color: #f8fafc; border-radius: 8px; border-left: 4px solid ${headerColor}; padding: 16px 20px; margin: 20px 0; }
        .footer { background-color: #f1f5f9; padding: 18px 30px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .btn { display: inline-block; background-color: ${headerColor}; color: #ffffff !important; padding: 10px 22px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>RecruitX ERP</h1>
          <p>Employee Recruitment Management System</p>
        </div>
        <div class="body">
          <h2 style="margin-top:0; color:#0f172a; font-size: 18px;">${headerTitle}</h2>
          ${contentHtml}
        </div>
        <div class="footer">
          <p style="margin: 0 0 4px 0;">${footerNote || 'This is an automated recruitment system notification. Please do not reply directly.'}</p>
          <p style="margin: 0; font-size: 11px; color: #94a3b8;">OOASE College Academic Project | Anna University Chennai</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================================================
// 1. Candidate Registration & OTP Verification Email
// ============================================================================
async function sendVerificationOtpEmail({ email, name, otp }) {
  const subject = `Your Verification Code: ${otp} - RecruitX Portal`;
  const text = `Hello ${name},\n\nYour 6-digit email verification code is: ${otp}\n\nThis code will expire in 10 minutes.\nFor your security, do not share this OTP with anyone.\n\nBest regards,\nRecruitX Team`;

  const contentHtml = `
    <p>Dear <strong>${name || 'Candidate'}</strong>,</p>
    <p>Thank you for registering on the RecruitX Recruitment Management Portal. To complete your registration and activate your candidate account, please enter the one-time code below:</p>
    <div style="background-color: #f0fdf4; border: 2px dashed #22c55e; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
      <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #15803d; font-family: monospace;">${otp}</span>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #166534; font-weight: 600;">Code expires in 10 minutes (Single use only)</p>
    </div>
    <p style="font-size: 13px; color: #64748b;">If you did not initiate this registration request, please disregard this email safely.</p>
  `;

  return await dispatchEmail({
    to: email,
    subject,
    text,
    html: buildHtmlTemplate({
      headerTitle: 'Email Account Verification',
      headerColor: '#16a34a',
      contentHtml
    }),
    notificationType: 'OTP_VERIFICATION'
  });
}

// ============================================================================
// 2. Candidate Welcome Email (Post-Verification)
// ============================================================================
async function sendWelcomeEmail({ email, name }) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const subject = `Welcome to RecruitX, ${name}! Your Account is Verified`;
  const text = `Hello ${name},\n\nWelcome to RecruitX Employee Recruitment Management System! Your email has been verified successfully.\n\nYou can now browse open vacancies, submit job applications, track application stages, and attend interviews.\n\nLogin URL: ${clientUrl}/login\n\nBest regards,\nRecruitX Talent Acquisition Team`;

  const contentHtml = `
    <p>Dear <strong>${name}</strong>,</p>
    <p>Welcome to <strong>RecruitX</strong>! Your email address has been successfully verified, and your candidate profile is now active.</p>
    <div class="card">
      <h4 style="margin: 0 0 8px 0; color: #0369a1;">What you can do now:</h4>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.6;">
        <li>Explore active job vacancies across engineering, product, and management</li>
        <li>Upload and keep your professional resume updated</li>
        <li>Track your application progress with real-time status updates</li>
        <li>Receive direct interview schedule invitations</li>
      </ul>
    </div>
    <div style="text-align: center; margin: 25px 0 10px 0;">
      <a href="${clientUrl}/login" class="btn" style="background-color: #0284c7;">Sign In to Candidate Portal &rarr;</a>
    </div>
  `;

  return await dispatchEmail({
    to: email,
    subject,
    text,
    html: buildHtmlTemplate({
      headerTitle: 'Welcome to RecruitX Portal',
      headerColor: '#0284c7',
      contentHtml
    }),
    notificationType: 'WELCOME_EMAIL'
  });
}

// ============================================================================
// 3. Job Application Confirmation (To Candidate)
// ============================================================================
async function sendCandidateApplicationConfirmation({
  candidateName,
  candidateEmail,
  jobTitle,
  companyName,
  applicationId,
  submissionDate,
  status
}) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const refNum = applicationId ? `#APP-${applicationId}` : '#APP-REF';
  const dateStr = submissionDate ? new Date(submissionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : new Date().toLocaleDateString();
  const currentStatus = status || 'Applied';

  const subject = `Application Received: ${jobTitle} (${refNum})`;
  const text = `Hello ${candidateName},\n\nThank you for applying for the position of "${jobTitle}" at ${companyName || 'RecruitX'}.\n\nReference: ${refNum}\nSubmission Date: ${dateStr}\nStatus: ${currentStatus}\n\nOur recruitment team will review your application. You can track progress in your Candidate Portal: ${clientUrl}/candidate/applications\n\nBest regards,\nRecruitment Team`;

  const contentHtml = `
    <p>Dear <strong>${candidateName}</strong>,</p>
    <p>Thank you for submitting your job application for <strong>${jobTitle}</strong> at <strong>${companyName || 'Apex Tech Solutions'}</strong>.</p>
    <div class="card">
      <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; font-weight: 600;">Application Ref:</td><td style="color: #0284c7; font-weight: 700;">${refNum}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Position:</td><td>${jobTitle}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Company / Org:</td><td>${companyName || 'Apex Tech Solutions'}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Submission Date:</td><td>${dateStr}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Current Status:</td><td><span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${currentStatus}</span></td></tr>
      </table>
    </div>
    <p style="font-size: 13px; color: #64748b;">Our hiring managers will review your profile qualifications and update your status accordingly.</p>
    <div style="text-align: center; margin: 20px 0 10px 0;">
      <a href="${clientUrl}/candidate/applications" class="btn">View Application Progress &rarr;</a>
    </div>
  `;

  return await dispatchEmail({
    to: candidateEmail,
    subject,
    text,
    html: buildHtmlTemplate({
      headerTitle: 'Application Confirmation',
      headerColor: '#0284c7',
      contentHtml
    }),
    notificationType: 'APPLICATION_CONFIRMATION',
    relatedEntityType: 'application',
    relatedEntityId: applicationId
  });
}

// ============================================================================
// 4. Recruiter Alert: New Applicant Received
// ============================================================================
async function sendRecruiterNewApplicantAlert({
  recruiterName,
  recruiterEmail,
  candidateName,
  candidateEmail,
  jobTitle,
  applicationId
}) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const subject = `New Application for ${jobTitle}: ${candidateName}`;
  const text = `Hello ${recruiterName},\n\nA new candidate, ${candidateName} (${candidateEmail}), has applied for "${jobTitle}".\n\nPlease log in to review their profile: ${clientUrl}/recruiter/applicants\n\nRecruitX System`;

  const contentHtml = `
    <p>Dear <strong>${recruiterName}</strong>,</p>
    <p>A new candidate has submitted an application for your vacancy:</p>
    <div class="card" style="border-left-color: #9333ea;">
      <p style="margin: 0; font-size: 14px;"><strong>Job Title:</strong> ${jobTitle}</p>
      <p style="margin: 6px 0 0 0; font-size: 14px;"><strong>Candidate Name:</strong> ${candidateName}</p>
      <p style="margin: 6px 0 0 0; font-size: 14px;"><strong>Candidate Email:</strong> ${candidateEmail}</p>
      <p style="margin: 6px 0 0 0; font-size: 14px;"><strong>Application ID:</strong> #${applicationId}</p>
    </div>
    <p style="font-size: 13px;">Log in to the Recruiter Console to evaluate this candidate's credentials and resume.</p>
    <div style="text-align: center; margin: 20px 0 10px 0;">
      <a href="${clientUrl}/recruiter/applicants" class="btn" style="background-color: #9333ea;">Review Applicants &rarr;</a>
    </div>
  `;

  return await dispatchEmail({
    to: recruiterEmail,
    subject,
    text,
    html: buildHtmlTemplate({
      headerTitle: 'New Applicant Notification',
      headerColor: '#9333ea',
      contentHtml
    }),
    notificationType: 'RECRUITER_ALERT',
    relatedEntityType: 'application',
    relatedEntityId: applicationId
  });
}

// ============================================================================
// 5. Application Status Change Notification (To Candidate)
// ============================================================================
async function sendCandidateStatusUpdateNotification({
  candidateName,
  candidateEmail,
  jobTitle,
  oldStatus,
  newStatus,
  applicationId
}) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const subject = `Status Update for ${jobTitle}: ${newStatus}`;

  let statusMessage = `Your application for "${jobTitle}" has moved to the next step.`;
  let badgeColor = '#0284c7';
  let badgeBg = '#e0f2fe';

  if (newStatus === 'Shortlisted') {
    statusMessage = 'Congratulations! Your qualifications have impressed our team and you have been shortlisted for this role.';
    badgeColor = '#16a34a';
    badgeBg = '#dcfce7';
  } else if (newStatus === 'Interview Scheduled') {
    statusMessage = 'An interview session has been arranged for your application. Please check your interview schedule in the portal.';
    badgeColor = '#9333ea';
    badgeBg = '#f3e8ff';
  } else if (newStatus === 'Selected') {
    statusMessage = 'Congratulations! We are delighted to announce that you have been selected for this position!';
    badgeColor = '#059669';
    badgeBg = '#d1fae5';
  } else if (newStatus === 'Rejected') {
    statusMessage = 'Thank you for your interest and the time invested in our recruitment process. While we are unable to offer you this specific position at this time, we will retain your profile for future openings.';
    badgeColor = '#dc2626';
    badgeBg = '#fee2e2';
  } else if (newStatus === 'Under Review') {
    statusMessage = 'Your application and credentials are currently being reviewed in detail by our hiring manager.';
  }

  const text = `Hello ${candidateName},\n\nYour application status for "${jobTitle}" has been updated:\n\nPrevious Status: ${oldStatus || 'N/A'}\nNew Status: ${newStatus}\n\n${statusMessage}\n\nView details: ${clientUrl}/candidate/applications\n\nBest regards,\nHiring Team`;

  const contentHtml = `
    <p>Dear <strong>${candidateName}</strong>,</p>
    <p>We are writing to provide an update regarding your application for <strong>${jobTitle}</strong>:</p>
    <div style="background-color: ${badgeBg}; border: 1px solid ${badgeColor}33; border-radius: 8px; padding: 18px; margin: 20px 0; text-align: center;">
      <span style="font-size: 12px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Application Status</span>
      <span style="font-size: 22px; font-weight: 800; color: ${badgeColor};">${newStatus}</span>
    </div>
    <p style="font-size: 14px; color: #334155; line-height: 1.6;">${statusMessage}</p>
    <div style="text-align: center; margin: 25px 0 10px 0;">
      <a href="${clientUrl}/candidate/applications" class="btn" style="background-color: ${badgeColor};">View Application Details &rarr;</a>
    </div>
  `;

  return await dispatchEmail({
    to: candidateEmail,
    subject,
    text,
    html: buildHtmlTemplate({
      headerTitle: 'Application Status Notification',
      headerColor: badgeColor,
      contentHtml
    }),
    notificationType: 'STATUS_UPDATE',
    relatedEntityType: 'application',
    relatedEntityId: applicationId
  });
}

// ============================================================================
// 6. Interview Scheduled / Rescheduled Invitation (To Candidate)
// ============================================================================
async function sendInterviewScheduledEmail({
  candidateName,
  candidateEmail,
  jobTitle,
  scheduledDate,
  locationOrLink,
  notes,
  interviewId,
  isUpdate = false
}) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const dateObj = new Date(scheduledDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const actionText = isUpdate ? 'Rescheduled' : 'Scheduled';
  const subject = `${isUpdate ? 'Rescheduled: ' : ''}Interview Invitation: ${jobTitle} - RecruitX`;
  const text = `Hello ${candidateName},\n\nYour interview for the position "${jobTitle}" has been ${actionText.toLowerCase()}.\n\nDate: ${formattedDate}\nTime: ${formattedTime}\nLocation / Meeting Link: ${locationOrLink}\n${notes ? `Notes / Instructions: ${notes}\n` : ''}\nPlease review details in your candidate portal: ${clientUrl}/candidate/interviews\n\nBest regards,\nRecruitment Team`;

  const contentHtml = `
    <p>Dear <strong>${candidateName}</strong>,</p>
    <p>Your interview round for <strong>${jobTitle}</strong> has been successfully <strong>${actionText.toLowerCase()}</strong>.</p>
    <div class="card" style="border-left-color: #6366f1;">
      <table style="width: 100%; font-size: 13px; color: #334155; border-collapse: collapse;">
        <tr><td style="padding: 5px 0; font-weight: 600; width: 140px;">Position:</td><td>${jobTitle}</td></tr>
        <tr><td style="padding: 5px 0; font-weight: 600;">Interview Date:</td><td style="color: #4338ca; font-weight: 700;">${formattedDate}</td></tr>
        <tr><td style="padding: 5px 0; font-weight: 600;">Time & Timezone:</td><td style="color: #4338ca; font-weight: 700;">${formattedTime}</td></tr>
        <tr><td style="padding: 5px 0; font-weight: 600;">Location / Link:</td><td><a href="${locationOrLink}" style="color: #0284c7; word-break: break-all;">${locationOrLink}</a></td></tr>
        ${notes ? `<tr><td style="padding: 5px 0; font-weight: 600; vertical-align: top;">Instructions:</td><td>${notes}</td></tr>` : ''}
      </table>
    </div>
    <p style="font-size: 13px; color: #64748b;">Please ensure your camera and microphone are configured if joining virtually. Join 5 minutes before scheduled start time.</p>
    <div style="text-align: center; margin: 25px 0 10px 0;">
      <a href="${clientUrl}/candidate/interviews" class="btn" style="background-color: #4f46e5;">View Interview Details &rarr;</a>
    </div>
  `;

  return await dispatchEmail({
    to: candidateEmail,
    subject,
    text,
    html: buildHtmlTemplate({
      headerTitle: `Interview ${actionText}`,
      headerColor: '#4f46e5',
      contentHtml
    }),
    notificationType: 'INTERVIEW_SCHEDULED',
    relatedEntityType: 'interview',
    relatedEntityId: interviewId
  });
}

// ============================================================================
// 7. Interview Cancelled Notification (To Candidate)
// ============================================================================
async function sendInterviewCancelledEmail({
  candidateName,
  candidateEmail,
  jobTitle,
  interviewId,
  notes
}) {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const subject = `Interview Cancelled: ${jobTitle} - RecruitX`;
  const text = `Hello ${candidateName},\n\nPlease be advised that the interview session for "${jobTitle}" has been cancelled.\n${notes ? `Reason: ${notes}\n` : ''}\nOur team will reach out regarding further updates.\n\nBest regards,\nRecruitment Team`;

  const contentHtml = `
    <p>Dear <strong>${candidateName}</strong>,</p>
    <p>Please be informed that your scheduled interview round for <strong>${jobTitle}</strong> has been <strong>cancelled</strong>.</p>
    <div class="card" style="border-left-color: #ef4444; background-color: #fef2f2;">
      <p style="margin: 0; font-size: 14px; color: #b91c1c;"><strong>Status:</strong> Cancelled</p>
      ${notes ? `<p style="margin: 8px 0 0 0; font-size: 13px; color: #7f1d1d;"><strong>Reason / Notes:</strong> ${notes}</p>` : ''}
    </div>
    <p style="font-size: 13px; color: #64748b;">Our talent acquisition team will contact you if an alternative interview date is scheduled.</p>
  `;

  return await dispatchEmail({
    to: candidateEmail,
    subject,
    text,
    html: buildHtmlTemplate({
      headerTitle: 'Interview Notice: Cancelled',
      headerColor: '#ef4444',
      contentHtml
    }),
    notificationType: 'INTERVIEW_CANCELLED',
    relatedEntityType: 'interview',
    relatedEntityId: interviewId
  });
}

// ============================================================================
// 8. Outbox Retry & Admin History
// ============================================================================
async function retryFailedEmail(logId) {
  const records = await query('SELECT * FROM email_logs WHERE id = ?', [logId]);
  if (records.length === 0) {
    throw new Error('Email log record not found');
  }
  const log = records[0];

  const fromUser = process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@recruitment.com';
  const mailOptions = {
    from: `"RecruitX Portal" <${fromUser}>`,
    to: log.recipient_email,
    subject: log.subject,
    text: log.body_preview,
    html: buildHtmlTemplate({
      headerTitle: log.subject,
      headerColor: '#0284c7',
      contentHtml: `<p>${log.body_preview}</p>`,
      footerNote: 'Retried delivery notification.'
    })
  };

  try {
    const t = getTransporter();
    const info = await t.sendMail(mailOptions);
    await query(
      `UPDATE email_logs 
       SET delivery_status = 'SENT', retry_count = retry_count + 1, sent_at = NOW(), last_error = NULL 
       WHERE id = ?`,
      [logId]
    );
    return { success: true, messageId: info.messageId };
  } catch (err) {
    await query(
      `UPDATE email_logs 
       SET delivery_status = 'FAILED', retry_count = retry_count + 1, last_error = ? 
       WHERE id = ?`,
      [err.message, logId]
    );
    throw err;
  }
}

async function getEmailLogs({ limit = 50, offset = 0, status, search }) {
  let sql = 'SELECT * FROM email_logs WHERE 1=1';
  const params = [];

  if (status) {
    sql += ' AND delivery_status = ?';
    params.push(status);
  }

  if (search) {
    sql += ' AND (recipient_email LIKE ? OR subject LIKE ? OR notification_type LIKE ?)';
    const pattern = `%${search}%`;
    params.push(pattern, pattern, pattern);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const rows = await query(sql, params);

  // Get total count
  let countSql = 'SELECT COUNT(*) as total FROM email_logs WHERE 1=1';
  const countParams = [];
  if (status) {
    countSql += ' AND delivery_status = ?';
    countParams.push(status);
  }
  if (search) {
    countSql += ' AND (recipient_email LIKE ? OR subject LIKE ? OR notification_type LIKE ?)';
    const pattern = `%${search}%`;
    countParams.push(pattern, pattern, pattern);
  }
  const countRows = await query(countSql, countParams);

  return {
    logs: rows,
    total: countRows[0].total
  };
}

module.exports = {
  getTransporter,
  sendVerificationOtpEmail,
  sendWelcomeEmail,
  sendCandidateApplicationConfirmation,
  sendRecruiterNewApplicantAlert,
  sendCandidateStatusUpdateNotification,
  sendInterviewScheduledEmail,
  sendInterviewCancelledEmail,
  retryFailedEmail,
  getEmailLogs
};
