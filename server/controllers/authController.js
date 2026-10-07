const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

// Register candidate or recruiter
async function register(req, res) {
  try {
    const { name, email, password, role, phone, headline, location, education, experience_years, skills, bio, company_name, designation, department_id } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const assignedRole = (role === 'recruiter' || role === 'admin') ? role : 'candidate';

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'A user with this email address already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userResult = await query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase().trim(), hashedPassword, assignedRole]
    );

    const userId = userResult.insertId;

    // Create profile according to role
    if (assignedRole === 'candidate') {
      await query(
        'INSERT INTO candidates (user_id, phone, headline, location, education, experience_years, skills, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, phone || '', headline || 'Job Seeker', location || '', education || '', experience_years || 0, skills || '', bio || '']
      );
    } else if (assignedRole === 'recruiter') {
      await query(
        'INSERT INTO recruiters (user_id, department_id, company_name, phone, designation) VALUES (?, ?, ?, ?, ?)',
        [userId, department_id || null, company_name || 'Enterprise Solutions', phone || '', designation || 'Recruiter']
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email, role: assignedRole, name },
      process.env.JWT_SECRET || 'recruitment_ooase_jwt_secret_key_6113241041061',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: { id: userId, name, email: email.toLowerCase().trim(), role: assignedRole }
    });
  } catch (error) {
    console.error('Error in register:', error);
    return res.status(500).json({ message: 'Server error during registration.', error: error.message });
  }
}

// Login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const users = await query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials. User not found.' });
    }

    const user = users[0];

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'recruitment_ooase_jwt_secret_key_6113241041061',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
}

// Get current logged-in user profile details
async function getMe(req, res) {
  try {
    const userId = req.user.id;
    const users = await query('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const user = users[0];

    let profile = null;
    let resume = null;

    if (user.role === 'candidate') {
      const candidates = await query('SELECT * FROM candidates WHERE user_id = ?', [userId]);
      if (candidates.length > 0) {
        profile = candidates[0];
        const resumes = await query('SELECT * FROM resumes WHERE candidate_id = ? ORDER BY uploaded_at DESC LIMIT 1', [profile.id]);
        if (resumes.length > 0) {
          resume = resumes[0];
        }
      }
    } else if (user.role === 'recruiter') {
      const recruiters = await query(
        `SELECT r.*, d.name as department_name 
         FROM recruiters r 
         LEFT JOIN departments d ON r.department_id = d.id 
         WHERE r.user_id = ?`,
        [userId]
      );
      if (recruiters.length > 0) {
        profile = recruiters[0];
      }
    }

    return res.json({
      user,
      profile,
      resume
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({ message: 'Server error fetching user profile.', error: error.message });
  }
}

// Update Candidate / User Profile
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone, headline, location, education, experience_years, skills, bio } = req.body;

    if (name) {
      await query('UPDATE users SET name = ? WHERE id = ?', [name.trim(), userId]);
    }

    if (req.user.role === 'candidate') {
      const candidateCheck = await query('SELECT id FROM candidates WHERE user_id = ?', [userId]);
      if (candidateCheck.length > 0) {
        await query(
          `UPDATE candidates 
           SET phone = ?, headline = ?, location = ?, education = ?, experience_years = ?, skills = ?, bio = ? 
           WHERE user_id = ?`,
          [phone || '', headline || '', location || '', education || '', experience_years || 0, skills || '', bio || '', userId]
        );
      } else {
        await query(
          `INSERT INTO candidates (user_id, phone, headline, location, education, experience_years, skills, bio) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, phone || '', headline || '', location || '', education || '', experience_years || 0, skills || '', bio || '']
        );
      }
    }

    return res.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return res.status(500).json({ message: 'Server error updating profile.', error: error.message });
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
