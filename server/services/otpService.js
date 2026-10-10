const crypto = require('crypto');
const { query } = require('../config/db');

/**
 * Generate a cryptographically secure 6-digit OTP
 */
function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Hash an OTP with the user email for secure database storage
 */
function hashOtp(otp, email) {
  return crypto.createHash('sha256').update(otp + email.toLowerCase().trim()).digest('hex');
}

/**
 * Create and store a new hashed OTP with 10-minute expiry and 60-second cooldown check
 */
async function createAndStoreOtp({ email, purpose = 'verification' }) {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check rate limit / cooldown (60 seconds)
  const recent = await query(
    `SELECT last_sent_at, TIMESTAMPDIFF(SECOND, last_sent_at, NOW()) as seconds_since_last 
     FROM email_otps 
     WHERE email = ? AND purpose = ? AND is_used = 0 
     ORDER BY id DESC LIMIT 1`,
    [normalizedEmail, purpose]
  );

  if (recent.length > 0 && recent[0].seconds_since_last !== null && recent[0].seconds_since_last < 60) {
    const waitSeconds = 60 - recent[0].seconds_since_last;
    const err = new Error(`Please wait ${waitSeconds} seconds before requesting a new OTP.`);
    err.cooldownRemaining = waitSeconds;
    throw err;
  }

  // 2. Invalidate any previous unused OTPs for this email & purpose
  await query(
    'UPDATE email_otps SET is_used = 1 WHERE email = ? AND purpose = ? AND is_used = 0',
    [normalizedEmail, purpose]
  );

  // 3. Generate raw 6-digit OTP and compute SHA-256 hash
  const rawOtp = generateOtp();
  const otpHash = hashOtp(rawOtp, normalizedEmail);

  // 4. Set expiry to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // 5. Store hashed OTP in database
  const insertResult = await query(
    `INSERT INTO email_otps (email, otp_hash, purpose, attempts, max_attempts, is_used, expires_at, last_sent_at) 
     VALUES (?, ?, ?, 0, 5, 0, ?, NOW())`,
    [normalizedEmail, otpHash, purpose, expiresAt]
  );

  return {
    otpId: insertResult.insertId,
    rawOtp,
    expiresAt
  };
}

/**
 * Validate submitted OTP against database hash
 */
async function validateOtp({ email, otp, purpose = 'verification' }) {
  const normalizedEmail = email.toLowerCase().trim();
  const trimmedOtp = (otp || '').toString().trim();

  if (!trimmedOtp || trimmedOtp.length !== 6) {
    return { valid: false, message: 'Please enter a valid 6-digit verification code.' };
  }

  // Lookup the latest unused OTP
  const records = await query(
    `SELECT id, otp_hash, attempts, max_attempts, expires_at, NOW() as current_db_time 
     FROM email_otps 
     WHERE email = ? AND purpose = ? AND is_used = 0 
     ORDER BY id DESC LIMIT 1`,
    [normalizedEmail, purpose]
  );

  if (records.length === 0) {
    return { valid: false, message: 'No active verification code found. Please request a new code.' };
  }

  const record = records[0];

  // Check expiration (10 minutes)
  const isExpired = new Date(record.expires_at) < new Date(record.current_db_time);
  if (isExpired) {
    await query('UPDATE email_otps SET is_used = 1 WHERE id = ?', [record.id]);
    return { valid: false, message: 'Verification code has expired. Please request a new one.' };
  }

  // Check maximum failed attempts limit (max 5)
  if (record.attempts >= record.max_attempts) {
    await query('UPDATE email_otps SET is_used = 1 WHERE id = ?', [record.id]);
    return { valid: false, message: 'Too many incorrect attempts. For security, please request a new verification code.' };
  }

  // Hash the incoming OTP
  const expectedHash = hashOtp(trimmedOtp, normalizedEmail);

  if (expectedHash !== record.otp_hash) {
    // Increment attempts
    const newAttempts = record.attempts + 1;
    await query('UPDATE email_otps SET attempts = ? WHERE id = ?', [newAttempts, record.id]);
    const attemptsLeft = Math.max(0, record.max_attempts - newAttempts);
    return {
      valid: false,
      message: attemptsLeft > 0 
        ? `Incorrect code. ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.` 
        : 'Too many incorrect attempts. Please request a new verification code.'
    };
  }

  // OTP is valid! Mark as used so it cannot be replayed
  await query('UPDATE email_otps SET is_used = 1 WHERE id = ?', [record.id]);

  return { valid: true };
}

module.exports = {
  generateOtp,
  hashOtp,
  createAndStoreOtp,
  validateOtp
};
