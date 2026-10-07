const { query } = require('../config/db');

// Admin get all system users
async function getAllUsers(req, res) {
  try {
    const { role, search } = req.query;
    let sql = `SELECT id, name, email, role, status, created_at FROM users WHERE 1=1`;
    const params = [];

    if (role) {
      sql += ` AND role = ?`;
      params.push(role);
    }

    if (search) {
      sql += ` AND (name LIKE ? OR email LIKE ?)`;
      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }

    sql += ` ORDER BY created_at DESC`;

    const users = await query(sql, params);
    return res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error fetching user directory.', error: error.message });
  }
}

// Get candidate profiles directory
async function getCandidates(req, res) {
  try {
    const { search } = req.query;
    let sql = `
      SELECT c.*, u.name, u.email, u.status as account_status, u.created_at,
             (SELECT COUNT(*) FROM applications a WHERE a.candidate_id = c.id) as total_applications
      FROM candidates c
      JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (u.name LIKE ? OR u.email LIKE ? OR c.skills LIKE ? OR c.headline LIKE ?)`;
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    sql += ` ORDER BY u.created_at DESC`;

    const candidates = await query(sql, params);
    return res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return res.status(500).json({ message: 'Server error fetching candidates.', error: error.message });
  }
}

// Get recruiters directory
async function getRecruiters(req, res) {
  try {
    const { search } = req.query;
    let sql = `
      SELECT r.*, d.name as department_name, u.name, u.email, u.status as account_status, u.created_at,
             (SELECT COUNT(*) FROM jobs j WHERE j.recruiter_id = r.id) as total_jobs_posted
      FROM recruiters r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN departments d ON r.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (u.name LIKE ? OR u.email LIKE ? OR r.company_name LIKE ? OR r.designation LIKE ?)`;
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    sql += ` ORDER BY u.created_at DESC`;

    const recruiters = await query(sql, params);
    return res.json(recruiters);
  } catch (error) {
    console.error('Error fetching recruiters:', error);
    return res.status(500).json({ message: 'Server error fetching recruiters.', error: error.message });
  }
}

// Admin toggle active/inactive status
async function toggleUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status !== 'active' && status !== 'inactive') {
      return res.status(400).json({ message: 'Status must be active or inactive.' });
    }

    const result = await query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User record not found.' });
    }

    return res.json({ message: `User account status changed to ${status}.` });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ message: 'Server error updating user status.', error: error.message });
  }
}

// Admin delete user
async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const result = await query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User record not found.' });
    }

    return res.json({ message: 'User account removed successfully.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Server error deleting user.', error: error.message });
  }
}

module.exports = {
  getAllUsers,
  getCandidates,
  getRecruiters,
  toggleUserStatus,
  deleteUser
};
