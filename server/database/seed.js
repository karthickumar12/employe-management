const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function seed() {
  console.log('🌱 Starting Database Initialization and Seeding...');
  
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'recruitment_db';

  let connection;
  try {
    // 1. Initial connection without database selection
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });

    console.log(`📡 Connected to MySQL Server at ${host}:${port}`);

    // Read and run schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await connection.query(schemaSql);
    console.log(`✅ Database '${dbName}' and tables created successfully.`);

    // Switch to recruitment_db
    await connection.query(`USE \`${dbName}\`;`);

    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create a sample dummy resume PDF file
    const dummyResumePath = path.join(uploadsDir, 'sample_resume.pdf');
    if (!fs.existsSync(dummyResumePath)) {
      fs.writeFileSync(dummyResumePath, '%PDF-1.4 Sample Resume File for Recruitment System');
    }

    // Password Hash for all users: 'password123'
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 2. Insert Departments
    console.log('📦 Inserting Departments...');
    const [deptResult] = await connection.query(`
      INSERT INTO departments (name, description) VALUES
      ('Software Engineering', 'Building core products, frontend, backend, and cloud platform infrastructure.'),
      ('Human Resources', 'Talent acquisition, employee relations, and organizational development.'),
      ('Product Management', 'Product strategy, user research, roadmap planning, and UX design.'),
      ('Marketing & Growth', 'Brand awareness, digital marketing, content strategy, and customer acquisition.'),
      ('Finance & Operations', 'Financial reporting, business strategy, legal compliance, and operations.')
    `);

    const engDeptId = 1;
    const hrDeptId = 2;
    const prodDeptId = 3;
    const mktDeptId = 4;
    const finDeptId = 5;

    // 3. Insert Users & Profiles
    console.log('👤 Inserting Admin, Recruiters, and Candidates...');

    // Admin User
    const [adminUser] = await connection.query(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')`,
      ['System Administrator', 'admin@recruitment.com', hashedPassword]
    );

    // Recruiter Users
    const recruitersData = [
      { name: 'Sarah Jenkins', email: 'sarah.recruiter@recruitment.com', deptId: hrDeptId, designation: 'Senior Talent Acquisition Lead', phone: '+1 555-0101' },
      { name: 'Alex Rivera', email: 'alex.tech@recruitment.com', deptId: engDeptId, designation: 'Technical Recruiter', phone: '+1 555-0102' },
      { name: 'Priya Sharma', email: 'priya.ops@recruitment.com', deptId: finDeptId, designation: 'HR Operations Manager', phone: '+1 555-0103' }
    ];

    const recruiterIds = [];
    for (const r of recruitersData) {
      const [uRes] = await connection.query(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'recruiter')`,
        [r.name, r.email, hashedPassword]
      );
      const [recRes] = await connection.query(
        `INSERT INTO recruiters (user_id, department_id, company_name, phone, designation) VALUES (?, ?, ?, ?, ?)`,
        [uRes.insertId, r.deptId, 'Apex Global Solutions', r.phone, r.designation]
      );
      recruiterIds.push(recRes.insertId);
    }

    // Candidate Users
    const candidatesData = [
      {
        name: 'Karthickumar S S',
        email: 'karthick.candidate@recruitment.com',
        phone: '+91 9876543210',
        headline: 'Full-Stack Developer & Software Architect',
        location: 'Chennai, India',
        education: 'B.E. Computer Science & Engineering - Anna University (2022 - 2026)',
        experience_years: 2,
        skills: 'React.js, Node.js, Express.js, MySQL, JavaScript, Tailwind CSS, Python',
        bio: 'Passionate computer science student specializing in object-oriented analysis, software engineering, and modern web application development.'
      },
      {
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        phone: '+1 555-0201',
        headline: 'Senior Frontend Engineer | React Specialist',
        location: 'San Francisco, CA',
        education: 'B.S. Computer Science - Stanford University',
        experience_years: 5,
        skills: 'React, TypeScript, Redux, Tailwind CSS, Next.js, Jest',
        bio: 'Frontend specialist with 5 years of experience building high-performance web applications.'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@gmail.com',
        phone: '+1 555-0202',
        headline: 'Backend Developer | Node.js & Microservices',
        location: 'Austin, TX',
        education: 'M.S. Software Engineering - UT Austin',
        experience_years: 4,
        skills: 'Node.js, Express, MySQL, PostgreSQL, Docker, AWS, GraphQL',
        bio: 'Backend developer focused on scalable APIs, microservices, and database optimization.'
      },
      {
        name: 'David Miller',
        email: 'david.miller@gmail.com',
        phone: '+1 555-0203',
        headline: 'UI/UX Designer & Frontend Developer',
        location: 'New York, NY',
        education: 'B.A. Interactive Media - NYU Design',
        experience_years: 3,
        skills: 'Figma, UI/UX Design, HTML5, CSS3, JavaScript, React',
        bio: 'Creating intuitive user journeys and sleek responsive web interface components.'
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@gmail.com',
        phone: '+1 555-0204',
        headline: 'DevOps & Cloud Systems Engineer',
        location: 'Seattle, WA',
        education: 'B.S. Information Technology - University of Washington',
        experience_years: 4,
        skills: 'Kubernetes, Docker, CI/CD, AWS, Terraform, Linux, Bash',
        bio: 'Automating cloud infrastructure deployment and maintaining 99.99% uptime.'
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@gmail.com',
        phone: '+1 555-0205',
        headline: 'Product Manager | Agile Lead',
        location: 'Chicago, IL',
        education: 'MBA - Northwestern Kellogg School of Management',
        experience_years: 6,
        skills: 'Product Roadmap, User Stories, Jira, A/B Testing, Scrum, Analytics',
        bio: 'Experienced product strategist bridging business objectives with tech execution.'
      },
      {
        name: 'Sophia Wilson',
        email: 'sophia.wilson@gmail.com',
        phone: '+1 555-0206',
        headline: 'Digital Marketing Strategist',
        location: 'Boston, MA',
        education: 'B.S. Marketing - Boston University',
        experience_years: 3,
        skills: 'SEO, SEM, Google Analytics, Content Marketing, Social Media Strategy',
        bio: 'Driving brand growth and target candidate acquisition through digital marketing.'
      },
      {
        name: 'James Taylor',
        email: 'james.taylor@gmail.com',
        phone: '+1 555-0207',
        headline: 'Financial Analyst & Operations',
        location: 'Denver, CO',
        education: 'B.S. Finance - University of Colorado',
        experience_years: 4,
        skills: 'Financial Modeling, Excel, SAP, Forecasting, Data Analysis',
        bio: 'Analytical finance professional managing budgets and operational forecasting.'
      },
      {
        name: 'Olivia Anderson',
        email: 'olivia.anderson@gmail.com',
        phone: '+1 555-0208',
        headline: 'Junior QA Engineer | Automation',
        location: 'Atlanta, GA',
        education: 'B.S. Computer Science - Georgia Tech',
        experience_years: 1,
        skills: 'Selenium, Cypress, JavaScript, API Testing, Postman, Bug Tracking',
        bio: 'Detail-oriented QA engineer dedicated to software quality and test automation.'
      },
      {
        name: 'Daniel Thomas',
        email: 'daniel.thomas@gmail.com',
        phone: '+1 555-0209',
        headline: 'Data Analyst & BI Consultant',
        location: 'San Jose, CA',
        education: 'M.S. Data Analytics - San Jose State',
        experience_years: 3,
        skills: 'Python, SQL, Tableau, Power BI, Pandas, Statistical Analysis',
        bio: 'Transforming complex datasets into actionable executive insights.'
      }
    ];

    const candidateIds = [];
    const resumeIds = [];

    for (const c of candidatesData) {
      const [uRes] = await connection.query(
        `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'candidate')`,
        [c.name, c.email, hashedPassword]
      );
      const [candRes] = await connection.query(
        `INSERT INTO candidates (user_id, phone, headline, location, education, experience_years, skills, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [uRes.insertId, c.phone, c.headline, c.location, c.education, c.experience_years, c.skills, c.bio]
      );
      const candidateId = candRes.insertId;
      candidateIds.push(candidateId);

      // Insert dummy resume record
      const [resRes] = await connection.query(
        `INSERT INTO resumes (candidate_id, file_name, file_path, file_size) VALUES (?, ?, ?, ?)`,
        [candidateId, `${c.name.replace(/\s+/g, '_')}_Resume.pdf`, 'uploads/sample_resume.pdf', 1048576]
      );
      resumeIds.push(resRes.insertId);
    }

    // 4. Insert 10 Job Vacancies
    console.log('💼 Inserting Job Vacancies...');
    const jobsData = [
      {
        recruiterId: recruiterIds[1], // Alex (Tech)
        deptId: engDeptId,
        title: 'Senior Full Stack Developer',
        description: 'We are seeking a talented Senior Full Stack Developer to lead the development of our enterprise SaaS platform. You will work closely with product managers and UI designers to build scalable web applications.',
        requirements: '• 4+ years experience with React.js and Node.js\n• Strong command of SQL (MySQL/PostgreSQL)\n• Experience building and consuming RESTful APIs\n• Knowledge of containerization (Docker) is a plus.',
        location: 'Chennai, India (Hybrid)',
        employment_type: 'Full-time',
        salary_range: '$90,000 - $120,000 / year',
        experience_level: 'Senior Level (4+ years)',
        status: 'Open'
      },
      {
        recruiterId: recruiterIds[1], // Alex (Tech)
        deptId: engDeptId,
        title: 'Frontend React Developer',
        description: 'Join our dynamic engineering team to build sleek, modern visual UI interfaces using React, Vite, and Tailwind CSS. Focus on performance optimization and responsive user design.',
        requirements: '• 2+ years of hands-on React.js development\n• Proficiency in Tailwind CSS, JavaScript ES6+, and HTML5\n• Experience with state management and REST APIs.',
        location: 'Remote',
        employment_type: 'Full-time',
        salary_range: '$70,000 - $95,000 / year',
        experience_level: 'Mid Level (2-4 years)',
        status: 'Open'
      },
      {
        recruiterId: recruiterIds[1], // Alex (Tech)
        deptId: engDeptId,
        title: 'Backend Node.js Specialist',
        description: 'Design, build, and maintain high-throughput REST APIs and database architecture for enterprise recruitment services.',
        requirements: '• 3+ years experience with Node.js and Express framework\n• Expertise in relational databases (MySQL) and ORMs\n• Deep understanding of JWT authentication and API security.',
        location: 'Austin, TX',
        employment_type: 'Full-time',
        salary_range: '$85,000 - $110,000 / year',
        experience_level: 'Mid-Senior Level',
        status: 'Open'
      },
      {
        recruiterId: recruiterIds[1], // Alex (Tech)
        deptId: engDeptId,
        title: 'Cloud DevOps & Site Reliability Engineer',
        description: 'Oversee cloud infrastructure deployment pipelines, automated CI/CD workflows, server monitoring, and system uptime.',
        requirements: '• Experience with AWS cloud infrastructure and Kubernetes\n• Proficiency in Docker, GitHub Actions, and Terraform\n• Knowledge of shell scripting and Linux administration.',
        location: 'Seattle, WA',
        employment_type: 'Full-time',
        salary_range: '$100,000 - $130,000 / year',
        experience_level: 'Senior Level',
        status: 'Open'
      },
      {
        recruiterId: recruiterIds[0], // Sarah (HR)
        deptId: hrDeptId,
        title: 'HR Business Partner & Talent Recruiter',
        description: 'Manage end-to-end recruitment pipelines, candidate onboarding, employee relations, and strategic staffing for growing business units.',
        requirements: '• 3+ years experience in corporate HR and talent acquisition\n• Strong communication and candidate assessment skills\n• Experience using ATS platforms and recruitment tools.',
        location: 'San Francisco, CA',
        employment_type: 'Full-time',
        salary_range: '$65,000 - $85,000 / year',
        experience_level: 'Mid Level',
        status: 'Open'
      },
      {
        recruiterId: recruiterIds[2], // Priya (Ops)
        deptId: prodDeptId,
        title: 'Senior Product Manager',
        description: 'Drive the product lifecycle from conception to launch. Collaborate with engineering, UX designers, and stakeholders to deliver customer-centric software solutions.',
        requirements: '• 5+ years of software product management experience\n• Track record of shipping web applications\n• Strong data analysis, roadmapping, and agile management skills.',
        location: 'New York, NY (Hybrid)',
        employment_type: 'Full-time',
        salary_range: '$115,000 - $145,000 / year',
        experience_level: 'Senior Level',
        status: 'Open'
      },
      {
        recruiterId: recruiterIds[2], // Priya (Ops)
        deptId: prodDeptId,
        title: 'UI/UX Product Designer',
        description: 'Craft intuitive wireframes, interactive prototypes, and design systems for enterprise web and mobile platforms.',
        requirements: '• Proficiency in Figma, Adobe XD, and web design principles\n• Strong portfolio demonstrating visual hierarchy and component design\n• Familiarity with HTML/CSS and responsive design.',
        location: 'Remote',
        employment_type: 'Full-time',
        salary_range: '$75,000 - $95,000 / year',
        experience_level: 'Mid Level',
        status: 'Open'
      },
      {
        recruiterId: recruiterIds[0], // Sarah (HR)
        deptId: mktDeptId,
        title: 'Digital Marketing & Content Lead',
        description: 'Lead digital marketing campaigns, SEO strategy, social media engagement, and brand positioning across tech channels.',
        requirements: '• 3+ years experience in B2B SaaS digital marketing\n• Proficiency with Google Analytics, SEO tools, and email marketing\n• Excellent copywriting and communication skills.',
        location: 'Chicago, IL',
        employment_type: 'Full-time',
        salary_range: '$60,000 - $80,000 / year',
        experience_level: 'Mid Level',
        status: 'Open'
      },
      {
        recruiterId: recruiterIds[2], // Priya (Ops)
        deptId: finDeptId,
        title: 'Financial Planning & Operations Analyst',
        description: 'Conduct financial analysis, operational budgeting, revenue forecasting, and executive management reporting.',
        requirements: '• Bachelor degree in Finance, Economics, or related discipline\n• 2+ years of corporate financial analysis\n• Advanced Excel skills and financial modeling experience.',
        location: 'Denver, CO',
        employment_type: 'Full-time',
        salary_range: '$70,000 - $88,000 / year',
        experience_level: 'Mid Level',
        status: 'Open'
      },
      {
        recruiterId: recruiterIds[1], // Alex (Tech)
        deptId: engDeptId,
        title: 'Software Quality Assurance Intern',
        description: 'Assist the QA team in executing test cases, writing automated API test scripts with Postman, and verifying release builds.',
        requirements: '• Currently pursuing or recent graduate in Computer Science/IT\n• Basic knowledge of JavaScript, APIs, and bug reporting\n• Eager learner with high attention to detail.',
        location: 'Chennai, India',
        employment_type: 'Internship',
        salary_range: '$25,000 - $35,000 / year',
        experience_level: 'Entry Level / Intern',
        status: 'Open'
      }
    ];

    const jobIds = [];
    for (const j of jobsData) {
      const [jRes] = await connection.query(
        `INSERT INTO jobs (recruiter_id, department_id, title, description, requirements, location, employment_type, salary_range, experience_level, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [j.recruiterId, j.deptId, j.title, j.description, j.requirements, j.location, j.employment_type, j.salary_range, j.experience_level, j.status]
      );
      jobIds.push(jRes.insertId);
    }

    // 5. Insert Job Applications
    console.log('📝 Inserting Candidate Job Applications...');
    const applicationsData = [
      { jobId: jobIds[0], candidateId: candidateIds[0], resumeId: resumeIds[0], status: 'Interview Scheduled', cover_letter: 'I am excited to submit my application for the Senior Full Stack Developer position. My technical expertise in React, Node.js, and MySQL aligns perfectly with your requirements.' },
      { jobId: jobIds[1], candidateId: candidateIds[0], resumeId: resumeIds[0], status: 'Shortlisted', cover_letter: 'With strong skills in React and Tailwind CSS, I am eager to contribute to your frontend team.' },
      { jobId: jobIds[1], candidateId: candidateIds[1], resumeId: resumeIds[1], status: 'Selected', cover_letter: '5 years of hands-on React development experience making me ideal for this role.' },
      { jobId: jobIds[2], candidateId: candidateIds[2], resumeId: resumeIds[2], status: 'Interview Scheduled', cover_letter: 'Backend Node.js developer passionate about REST API architecture and scalable database design.' },
      { jobId: jobIds[0], candidateId: candidateIds[2], resumeId: resumeIds[2], status: 'Under Review', cover_letter: 'Experienced in Node.js and SQL database integration.' },
      { jobId: jobIds[6], candidateId: candidateIds[3], resumeId: resumeIds[3], status: 'Shortlisted', cover_letter: 'UI/UX designer with 3 years experience creating sleek interfaces in Figma and React.' },
      { jobId: jobIds[3], candidateId: candidateIds[4], resumeId: resumeIds[4], status: 'Interview Scheduled', cover_letter: 'DevOps engineer with experience in AWS, Docker, and Kubernetes deployment pipelines.' },
      { jobId: jobIds[5], candidateId: candidateIds[5], resumeId: resumeIds[5], status: 'Under Review', cover_letter: 'Product manager with MBA and 6 years leading cross-functional tech teams.' },
      { jobId: jobIds[7], candidateId: candidateIds[6], resumeId: resumeIds[6], status: 'Applied', cover_letter: 'Digital marketer experienced in B2B tech growth and content strategy.' },
      { jobId: jobIds[8], candidateId: candidateIds[7], resumeId: resumeIds[7], status: 'Applied', cover_letter: 'Financial analyst with background in corporate forecasting and budgeting.' },
      { jobId: jobIds[9], candidateId: candidateIds[8], resumeId: resumeIds[8], status: 'Shortlisted', cover_letter: 'Junior QA engineer eager to contribute to automated API testing with Postman.' },
      { jobId: jobIds[0], candidateId: candidateIds[9], resumeId: resumeIds[9], status: 'Rejected', cover_letter: 'Data analyst interested in moving into software development.' },
      { jobId: jobIds[4], candidateId: candidateIds[5], resumeId: resumeIds[5], status: 'Applied', cover_letter: 'Experienced team leader interested in talent acquisition management.' },
      { jobId: jobIds[2], candidateId: candidateIds[0], resumeId: resumeIds[0], status: 'Under Review', cover_letter: 'Exploring backend opportunities in Node.js and database engineering.' },
      { jobId: jobIds[9], candidateId: candidateIds[0], resumeId: resumeIds[0], status: 'Applied', cover_letter: 'Enthusiastic about software quality assurance and test automation.' }
    ];

    const applicationIds = [];
    for (const app of applicationsData) {
      const [aRes] = await connection.query(
        `INSERT INTO applications (job_id, candidate_id, resume_id, status, cover_letter) VALUES (?, ?, ?, ?, ?)`,
        [app.jobId, app.candidateId, app.resumeId, app.status, app.cover_letter]
      );
      applicationIds.push(aRes.insertId);
    }

    // 6. Insert Interview Schedules
    console.log('📅 Inserting Scheduled Interviews...');
    const interviewsData = [
      {
        applicationId: applicationIds[0], // Karthick - Senior Full Stack
        scheduled_date: '2026-10-10 10:00:00',
        location_or_link: 'https://meet.google.com/rec-tech-interview',
        notes: 'Technical round focusing on React.js architecture, Node.js API design, and MySQL database queries.',
        status: 'Scheduled'
      },
      {
        applicationId: applicationIds[3], // Jane - Backend Node.js
        scheduled_date: '2026-10-12 14:30:00',
        location_or_link: 'https://meet.google.com/backend-node-eval',
        notes: 'Discussion on microservices, JWT security, and database pool management.',
        status: 'Scheduled'
      },
      {
        applicationId: applicationIds[6], // Emily - DevOps
        scheduled_date: '2026-10-11 11:00:00',
        location_or_link: 'https://meet.google.com/devops-cloud-sync',
        notes: 'AWS infrastructure, Docker deployment, and CI/CD pipelines review.',
        status: 'Scheduled'
      },
      {
        applicationId: applicationIds[2], // John - Frontend React (Selected)
        scheduled_date: '2026-10-02 09:30:00',
        location_or_link: 'Apex Global HQ - Room 302',
        notes: 'Final leadership interview. Passed with distinction.',
        status: 'Passed'
      }
    ];

    for (const inv of interviewsData) {
      await connection.query(
        `INSERT INTO interviews (application_id, scheduled_date, location_or_link, notes, status) VALUES (?, ?, ?, ?, ?)`,
        [inv.applicationId, inv.scheduled_date, inv.location_or_link, inv.notes, inv.status]
      );
    }

    // 7. Insert Notifications
    console.log('🔔 Inserting Notifications...');
    const notificationsData = [
      {
        userId: 5, // Karthick (user_id 5)
        title: 'Interview Scheduled!',
        message: 'Your interview for Senior Full Stack Developer has been scheduled for Oct 10, 2026 at 10:00 AM.'
      },
      {
        userId: 5,
        title: 'Application Update',
        message: 'Your application for Frontend React Developer has been shortlisted by the hiring team!'
      },
      {
        userId: 2, // Sarah Recruiter
        title: 'New Applicant',
        message: 'Karthickumar S S applied for Senior Full Stack Developer vacancy.'
      }
    ];

    for (const notif of notificationsData) {
      await connection.query(
        `INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)`,
        [notif.userId, notif.title, notif.message]
      );
    }

    console.log('\n✨ Database seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('🔑 TEST USER CREDENTIALS:');
    console.log('• Admin: admin@recruitment.com / password123');
    console.log('• Recruiter: sarah.recruiter@recruitment.com / password123');
    console.log('• Tech Recruiter: alex.tech@recruitment.com / password123');
    console.log('• Candidate (Karthick): karthick.candidate@recruitment.com / password123');
    console.log('• Candidate (John): john.doe@gmail.com / password123');
    console.log('----------------------------------------------------');

  } catch (error) {
    console.error('❌ Error during database seeding:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
