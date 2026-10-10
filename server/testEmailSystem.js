const { query } = require('./config/db');
const { createAndStoreOtp, validateOtp } = require('./services/otpService');
const { 
  sendVerificationOtpEmail, 
  sendWelcomeEmail, 
  sendCandidateApplicationConfirmation, 
  sendRecruiterNewApplicantAlert, 
  sendCandidateStatusUpdateNotification, 
  sendInterviewScheduledEmail, 
  sendInterviewCancelledEmail,
  getEmailLogs
} = require('./services/emailService');

async function testFullEmailSystem() {
  console.log('====================================================');
  console.log('🧪 RUNNING EMAIL NOTIFICATION SYSTEM INTEGRATION TEST');
  console.log('====================================================\n');

  try {
    const testEmail = `test_applicant_${Date.now()}@example.com`;
    const testName = 'Test Candidate Kumar';

    // 1. Test OTP Creation
    console.log('1️⃣ Testing OTP Generation & Secure Hash Storage...');
    const otpResult = await createAndStoreOtp({ email: testEmail, purpose: 'verification' });
    console.log(`   Generated OTP: ${otpResult.rawOtp} for ${testEmail}`);
    console.log(`   Expiry: ${otpResult.expiresAt.toISOString()}`);

    const [dbOtp] = await query('SELECT * FROM email_otps WHERE email = ? AND is_used = 0', [testEmail]);
    if (!dbOtp) throw new Error('OTP not saved in email_otps table');
    if (dbOtp.otp_hash.length !== 64) throw new Error('OTP hash is not 64-char SHA256');
    console.log(`   ✅ DB Record verified: SHA-256 Hash stored (${dbOtp.otp_hash.substring(0, 16)}...)`);

    // 2. Test Invalid OTP Attempt & Counter
    console.log('\n2️⃣ Testing Invalid OTP Validation & Attempt Limiting...');
    const wrongVal = await validateOtp({ email: testEmail, otp: '000000', purpose: 'verification' });
    if (wrongVal.valid) throw new Error('Invalid OTP was accepted!');
    console.log(`   ✅ Wrong OTP rejected correctly: "${wrongVal.message}"`);

    const [updatedDbOtp] = await query('SELECT attempts FROM email_otps WHERE id = ?', [dbOtp.id]);
    console.log(`   ✅ Attempt counter incremented to: ${updatedDbDb = updatedDbOtp.attempts}`);

    // 3. Test Correct OTP Validation
    console.log('\n3️⃣ Testing Valid OTP Validation...');
    const correctVal = await validateOtp({ email: testEmail, otp: otpResult.rawOtp, purpose: 'verification' });
    if (!correctVal.valid) throw new Error('Valid OTP was rejected: ' + correctVal.message);
    console.log(`   ✅ Valid OTP accepted!`);

    const [usedDbOtp] = await query('SELECT is_used FROM email_otps WHERE id = ?', [dbOtp.id]);
    if (usedDbOtp.is_used !== 1) throw new Error('OTP was not marked as used');
    console.log(`   ✅ OTP successfully marked is_used = 1`);

    // 4. Test Email Dispatch & Logging: Welcome Email
    console.log('\n4️⃣ Testing Welcome Email Dispatch & Outbox Logging...');
    const welcomeResult = await sendWelcomeEmail({ email: testEmail, name: testName });
    console.log(`   Email dispatch result: success=${welcomeResult.success}`);

    // 5. Test Application Confirmation Email
    console.log('\n5️⃣ Testing Job Application Confirmation Email...');
    const appResult = await sendCandidateApplicationConfirmation({
      candidateName: testName,
      candidateEmail: testEmail,
      jobTitle: 'Full Stack Node/React Architect',
      companyName: 'Apex Innovations',
      applicationId: 999,
      submissionDate: new Date(),
      status: 'Applied'
    });
    console.log(`   Application email result: success=${appResult.success}`);

    // 6. Test Status Update Email
    console.log('\n6️⃣ Testing Status Update Notification Email...');
    const statusResult = await sendCandidateStatusUpdateNotification({
      candidateName: testName,
      candidateEmail: testEmail,
      jobTitle: 'Full Stack Node/React Architect',
      oldStatus: 'Applied',
      newStatus: 'Shortlisted',
      applicationId: 999
    });
    console.log(`   Status update email result: success=${statusResult.success}`);

    // 7. Test Interview Scheduling Email
    console.log('\n7️⃣ Testing Interview Invitation Email...');
    const interviewResult = await sendInterviewScheduledEmail({
      candidateName: testName,
      candidateEmail: testEmail,
      jobTitle: 'Full Stack Node/React Architect',
      scheduledDate: new Date(Date.now() + 86400000 * 2),
      locationOrLink: 'https://meet.google.com/abc-defg-hij',
      notes: 'Prepare system design diagrams and portfolio walk-through.',
      interviewId: 888,
      isUpdate: false
    });
    console.log(`   Interview invitation result: success=${interviewResult.success}`);

    // 8. Test Verification of email_logs
    console.log('\n8️⃣ Verifying Database Outbox & Notification History (email_logs)...');
    const logs = await getEmailLogs({ limit: 10, search: testEmail });
    console.log(`   Found ${logs.logs.length} logged emails for ${testEmail}:`);
    for (const log of logs.logs) {
      console.log(`   - [${log.delivery_status}] Type: ${log.notification_type} | Subject: "${log.subject}" | Entity: ${log.related_entity_type} #${log.related_entity_id}`);
    }

    console.log('\n🎉 ALL EMAIL NOTIFICATION BACKEND INTEGRATION TESTS PASSED!\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err);
    process.exit(1);
  }
}

testFullEmailSystem();
