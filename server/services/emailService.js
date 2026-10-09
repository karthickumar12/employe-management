const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create Nodemailer Transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = process.env.SMTP_PASS || '';

    if (smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      console.log('📧 SMTP Email Transporter configured for:', smtpUser);
    } else {
      // Development mock transporter (logs email output cleanly to console)
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('\n📬 --- [EMAIL NOTIFICATION LOGGED] ---');
          console.log(`FROM: ${mailOptions.from || 'noreply@recruitment-system.com'}`);
          console.log(`TO: ${mailOptions.to}`);
          console.log(`SUBJECT: ${mailOptions.subject}`);
          console.log(`BODY:\n${mailOptions.text || mailOptions.html}`);
          console.log('-------------------------------------\n');
          return { messageId: 'mock-email-' + Date.now() };
        }
      };
      console.log('ℹ️ SMTP credentials not set in .env. Email Service operating in Console Logging Mode.');
    }
  }
  return transporter;
}

// 1. Send confirmation email to candidate who applied
async function sendCandidateApplicationConfirmation({ candidateName, candidateEmail, jobTitle, companyName }) {
  try {
    const t = getTransporter();
    const mailOptions = {
      from: `"${companyName || 'RecruitX ERP'}" <noreply@recruitment.com>`,
      to: candidateEmail,
      subject: `Application Confirmation: ${jobTitle}`,
      text: `Hello ${candidateName},\n\nThank you for submitting your job application for the position of "${jobTitle}" at ${companyName || 'Apex Tech Solutions'}.\n\nYour application has been received and is currently under review by our hiring recruitment team.\n\nYou can log in to your Candidate Portal anytime to track your application status step-by-step.\n\nBest regards,\nRecruitment & Talent Acquisition Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 10px;">
          <h2 style="color: #0270c7;">Application Confirmation</h2>
          <p>Dear <strong>${candidateName}</strong>,</p>
          <p>Thank you for submitting your job application for <strong>${jobTitle}</strong> at <strong>${companyName || 'Apex Tech Solutions'}</strong>.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #0270c7; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Position:</strong> ${jobTitle}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Status:</strong> Applied (Under Review)</p>
          </div>
          <p>Our hiring management team will review your qualifications and update your candidate portal with next steps.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">This is an automated notification from the Employee Recruitment Management System.</p>
        </div>
      `
    };

    const info = await t.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error('Error sending candidate email:', err.message);
  }
}

// 2. Send notification email to recruiter when a candidate applies
async function sendRecruiterNewApplicantAlert({ recruiterName, recruiterEmail, candidateName, candidateEmail, jobTitle }) {
  try {
    const t = getTransporter();
    const mailOptions = {
      from: `"RecruitX ERP System" <noreply@recruitment.com>`,
      to: recruiterEmail,
      subject: `New Application Received: ${jobTitle} - ${candidateName}`,
      text: `Hello ${recruiterName},\n\nA new candidate, ${candidateName} (${candidateEmail}), has submitted an application for your job posting "${jobTitle}".\n\nPlease log in to your Recruiter HR Dashboard to review candidate profile details and resume.\n\nBest regards,\nRecruitX System`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 10px;">
          <h2 style="color: #0270c7;">New Applicant Alert</h2>
          <p>Dear <strong>${recruiterName}</strong>,</p>
          <p>A new job seeker has applied for your published vacancy:</p>
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #9333ea; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;"><strong>Job Posting:</strong> ${jobTitle}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Candidate Name:</strong> ${candidateName}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Candidate Email:</strong> ${candidateEmail}</p>
          </div>
          <p>Please log in to your Recruiter Console to evaluate this candidate and download their PDF resume.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Recruitment Management Portal System Notification.</p>
        </div>
      `
    };

    const info = await t.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error('Error sending recruiter alert email:', err.message);
  }
}

// 3. Send status change update email to candidate
async function sendCandidateStatusUpdateNotification({ candidateName, candidateEmail, jobTitle, newStatus }) {
  try {
    const t = getTransporter();
    const mailOptions = {
      from: `"RecruitX ERP" <noreply@recruitment.com>`,
      to: candidateEmail,
      subject: `Status Update for ${jobTitle}: ${newStatus}`,
      text: `Hello ${candidateName},\n\nYour application status for "${jobTitle}" has been updated to "${newStatus}".\n\nPlease log in to your candidate dashboard for full details.\n\nBest regards,\nHiring Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 10px;">
          <h2 style="color: #0270c7;">Application Status Update</h2>
          <p>Dear <strong>${candidateName}</strong>,</p>
          <p>Your job application status for <strong>${jobTitle}</strong> has been updated to:</p>
          <div style="background-color: #f0f7ff; padding: 15px; border-left: 4px solid #0270c7; margin: 20px 0;">
            <h3 style="margin: 0; color: #0270c7;">${newStatus}</h3>
          </div>
          <p>Log in to your Candidate Portal to view full details and scheduled interview dates.</p>
        </div>
      `
    };

    await t.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending status update email:', err.message);
  }
}

module.exports = {
  sendCandidateApplicationConfirmation,
  sendRecruiterNewApplicantAlert,
  sendCandidateStatusUpdateNotification
};
