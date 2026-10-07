const { query } = require('../config/db');

// Get departments list
async function getDepartments(req, res) {
  try {
    const departments = await query('SELECT * FROM departments ORDER BY name ASC');
    return res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return res.status(500).json({ message: 'Server error fetching departments.', error: error.message });
  }
}

// Get all published jobs with search, filters & pagination
async function getAllJobs(req, res) {
  try {
    const { search, department, location, type, status, page = 1, limit = 10 } = req.query;
    
    let sql = `
      SELECT j.*, d.name as department_name, r.company_name, u.name as recruiter_name,
             (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as total_applicants
      FROM jobs j
      JOIN departments d ON j.department_id = d.id
      JOIN recruiters r ON j.recruiter_id = r.id
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Unless specific status requested (e.g. for recruiters), show Open jobs publicly
    if (status) {
      sql += ` AND j.status = ?`;
      params.push(status);
    } else {
      sql += ` AND j.status = 'Open'`;
    }

    if (search) {
      sql += ` AND (j.title LIKE ? OR j.description LIKE ? OR j.location LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (department) {
      sql += ` AND j.department_id = ?`;
      params.push(department);
    }

    if (location) {
      sql += ` AND j.location LIKE ?`;
      params.push(`%${location}%`);
    }

    if (type) {
      sql += ` AND j.employment_type = ?`;
      params.push(type);
    }

    sql += ` ORDER BY j.created_at DESC`;

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    const jobs = await query(sql, params);

    // Get total count for pagination metadata
    let countSql = `SELECT COUNT(*) as total FROM jobs j WHERE 1=1`;
    const countParams = [];
    if (status) {
      countSql += ` AND j.status = ?`;
      countParams.push(status);
    } else {
      countSql += ` AND j.status = 'Open'`;
    }
    if (search) {
      countSql += ` AND (j.title LIKE ? OR j.description LIKE ? OR j.location LIKE ?)`;
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }
    if (department) {
      countSql += ` AND j.department_id = ?`;
      countParams.push(department);
    }
    if (location) {
      countSql += ` AND j.location LIKE ?`;
      countParams.push(`%${location}%`);
    }
    if (type) {
      countSql += ` AND j.employment_type = ?`;
      countParams.push(type);
    }

    const countResult = await query(countSql, countParams);
    const totalJobs = countResult[0].total;

    return res.json({
      jobs,
      pagination: {
        total: totalJobs,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalJobs / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({ message: 'Server error fetching job listings.', error: error.message });
  }
}

// Get single job details by ID
async function getJobById(req, res) {
  try {
    const { id } = req.params;
    const sql = `
      SELECT j.*, d.name as department_name, r.company_name, r.phone as recruiter_phone, r.designation as recruiter_designation, u.name as recruiter_name, u.email as recruiter_email,
             (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as total_applicants
      FROM jobs j
      JOIN departments d ON j.department_id = d.id
      JOIN recruiters r ON j.recruiter_id = r.id
      JOIN users u ON r.user_id = u.id
      WHERE j.id = ?
    `;

    const jobs = await query(sql, [id]);
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'Job vacancy not found.' });
    }

    return res.json(jobs[0]);
  } catch (error) {
    console.error('Error fetching job details:', error);
    return res.status(500).json({ message: 'Server error fetching job details.', error: error.message });
  }
}

// Create new Job posting (Recruiter or Admin)
async function createJob(req, res) {
  try {
    const userId = req.user.id;
    const { title, department_id, description, requirements, location, employment_type, salary_range, experience_level, status } = req.body;

    if (!title || !department_id || !description || !requirements || !location) {
      return res.status(400).json({ message: 'Title, department, description, requirements, and location are required.' });
    }

    // Get recruiter ID for this user
    let recruiterId;
    if (req.user.role === 'recruiter') {
      const recruiters = await query('SELECT id FROM recruiters WHERE user_id = ?', [userId]);
      if (recruiters.length === 0) {
        return res.status(400).json({ message: 'Recruiter profile not found for user.' });
      }
      recruiterId = recruiters[0].id;
    } else if (req.user.role === 'admin') {
      // For admin creating a job, assign to first available recruiter or create admin recruiter entry
      const recruiters = await query('SELECT id FROM recruiters LIMIT 1');
      if (recruiters.length > 0) {
        recruiterId = recruiters[0].id;
      } else {
        return res.status(400).json({ message: 'No recruiter exists to assign this job posting.' });
      }
    }

    const result = await query(
      `INSERT INTO jobs (recruiter_id, department_id, title, description, requirements, location, employment_type, salary_range, experience_level, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recruiterId,
        department_id,
        title.trim(),
        description,
        requirements,
        location.trim(),
        employment_type || 'Full-time',
        salary_range || 'Competitive',
        experience_level || 'Mid Level',
        status || 'Open'
      ]
    );

    return res.status(201).json({
      message: 'Job vacancy created successfully.',
      jobId: result.insertId
    });
  } catch (error) {
    console.error('Error creating job:', error);
    return res.status(500).json({ message: 'Server error creating job vacancy.', error: error.message });
  }
}

// Update existing Job posting
async function updateJob(req, res) {
  try {
    const { id } = req.params;
    const { title, department_id, description, requirements, location, employment_type, salary_range, experience_level, status } = req.body;

    const existingJobs = await query('SELECT * FROM jobs WHERE id = ?', [id]);
    if (existingJobs.length === 0) {
      return res.status(404).json({ message: 'Job posting not found.' });
    }

    await query(
      `UPDATE jobs 
       SET title = ?, department_id = ?, description = ?, requirements = ?, location = ?, employment_type = ?, salary_range = ?, experience_level = ?, status = ?
       WHERE id = ?`,
      [
        title || existingJobs[0].title,
        department_id || existingJobs[0].department_id,
        description || existingJobs[0].description,
        requirements || existingJobs[0].requirements,
        location || existingJobs[0].location,
        employment_type || existingJobs[0].employment_type,
        salary_range || existingJobs[0].salary_range,
        experience_level || existingJobs[0].experience_level,
        status || existingJobs[0].status,
        id
      ]
    );

    return res.json({ message: 'Job posting updated successfully.' });
  } catch (error) {
    console.error('Error updating job:', error);
    return res.status(500).json({ message: 'Server error updating job posting.', error: error.message });
  }
}

// Delete Job vacancy
async function deleteJob(req, res) {
  try {
    const { id } = req.params;

    const result = await query('DELETE FROM jobs WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Job vacancy not found.' });
    }

    return res.json({ message: 'Job vacancy deleted successfully.' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return res.status(500).json({ message: 'Server error deleting job vacancy.', error: error.message });
  }
}

// Get Recruiter's own jobs
async function getRecruiterJobs(req, res) {
  try {
    const userId = req.user.id;
    let sql = `
      SELECT j.*, d.name as department_name,
             (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as total_applicants
      FROM jobs j
      JOIN departments d ON j.department_id = d.id
    `;
    const params = [];

    if (req.user.role === 'recruiter') {
      sql += ` JOIN recruiters r ON j.recruiter_id = r.id WHERE r.user_id = ?`;
      params.push(userId);
    } else {
      sql += ` WHERE 1=1`;
    }

    sql += ` ORDER BY j.created_at DESC`;

    const jobs = await query(sql, params);
    return res.json(jobs);
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    return res.status(500).json({ message: 'Server error fetching posted jobs.', error: error.message });
  }
}

module.exports = {
  getDepartments,
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getRecruiterJobs
};
