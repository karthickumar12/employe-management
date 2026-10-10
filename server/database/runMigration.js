const { query } = require('../config/db');

async function runMigration() {
  try {
    console.log('--- Starting Email System Database Migration ---');
    
    // 1. Add is_verified to users
    const cols = await query("SHOW COLUMNS FROM users LIKE 'is_verified'");
    if (cols.length === 0) {
      console.log('Adding is_verified column to users...');
      await query('ALTER TABLE users ADD COLUMN is_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER role');
    } else {
      console.log('Column is_verified already exists.');
    }
    
    // Ensure existing demo users are verified
    await query('UPDATE users SET is_verified = 1');
    console.log('All existing users marked as verified.');

    // 2. email_otps table
    await query(`
      CREATE TABLE IF NOT EXISTS email_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        purpose VARCHAR(50) NOT NULL DEFAULT 'verification',
        attempts INT NOT NULL DEFAULT 0,
        max_attempts INT NOT NULL DEFAULT 5,
        is_used TINYINT(1) NOT NULL DEFAULT 0,
        expires_at DATETIME NOT NULL,
        last_sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email_purpose (email, purpose),
        INDEX idx_expires (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Table email_otps created/verified.');

    // 3. email_logs table
    await query(`
      CREATE TABLE IF NOT EXISTS email_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recipient_email VARCHAR(100) NOT NULL,
        notification_type VARCHAR(50) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        body_preview TEXT NULL,
        related_entity_type VARCHAR(50) NULL,
        related_entity_id INT NULL,
        delivery_status ENUM('PENDING', 'SENT', 'FAILED') NOT NULL DEFAULT 'PENDING',
        retry_count INT NOT NULL DEFAULT 0,
        last_error TEXT NULL,
        sent_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_recipient (recipient_email),
        INDEX idx_status (delivery_status),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Table email_logs created/verified.');

    const stats = await query('SELECT count(*) as total_users, sum(is_verified) as verified_users FROM users');
    console.log('User stats:', stats[0]);
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
