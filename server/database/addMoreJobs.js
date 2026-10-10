const { query } = require('../config/db');

async function addMoreJobs() {
  try {
    console.log('--- Adding New Job Vacancies to recruitment_db ---');

    // 1. Fetch departments
    const departments = await query('SELECT id, name FROM departments');
    const deptMap = {};
    departments.forEach(d => {
      deptMap[d.name] = d.id;
    });

    // 2. Fetch recruiters
    const recruiters = await query('SELECT id, user_id FROM recruiters');
    const rec1 = recruiters[0]?.id || 1; // Sarah
    const rec2 = recruiters[1]?.id || 2; // Alex
    const rec3 = recruiters[2]?.id || (recruiters[0]?.id || 1); // Priya

    const engDept = deptMap['Software Engineering'] || 1;
    const hrDept = deptMap['Human Resources'] || 2;
    const prodDept = deptMap['Product Management'] || 3;
    const finDept = deptMap['Finance & Operations'] || 5;

    const newJobs = [
      {
        recruiter_id: rec2,
        department_id: engDept,
        title: 'Artificial Intelligence & ML Engineer',
        description: 'Design, train, and deploy generative AI, NLP, and machine learning models into production systems. Work with LLMs, PyTorch, and TensorFlow to build cutting-edge intelligence features.',
        requirements: '• 3+ years experience with Python, PyTorch, or TensorFlow\n• Hands-on experience with LLMs, prompt engineering, and fine-tuning\n• Experience with Vector Databases (Pinecone/Milvus/Chroma)\n• Knowledge of building scalable REST APIs in FastAPI or Flask.',
        location: 'Bengaluru, India (Hybrid)',
        employment_type: 'Full-time',
        salary_range: '₹18,00,000 - ₹28,00,000 / year',
        experience_level: 'Mid to Senior Level (3-5 Years)',
        status: 'Open'
      },
      {
        recruiter_id: rec2,
        department_id: engDept,
        title: 'Cybersecurity & Penetration Testing Analyst',
        description: 'Protect enterprise infrastructure, execute vulnerability assessments, ethical hacking, and incident response monitoring across cloud and web systems.',
        requirements: '• 2+ years of experience in vulnerability assessments and penetration testing (VAPT)\n• Proficiency with Burp Suite, Wireshark, Metasploit, and SIEM tools\n• Solid knowledge of OWASP Top 10 vulnerabilities and network security\n• Relevant security certifications (CEH, OSCP, or CompTIA Security+) preferred.',
        location: 'Chennai, India',
        employment_type: 'Full-time',
        salary_range: '₹12,00,000 - ₹20,00,000 / year',
        experience_level: 'Mid Level (2-4 Years)',
        status: 'Open'
      },
      {
        recruiter_id: rec1,
        department_id: engDept,
        title: 'Mobile Application Engineer (Flutter & React Native)',
        description: 'Develop cross-platform mobile apps for iOS and Android using Flutter and React Native. Build responsive UI, state management, push notifications, and offline data sync.',
        requirements: '• 2+ years of mobile application development experience\n• Strong grasp of Flutter/Dart or React Native\n• Experience with state management (Riverpod/Bloc/Redux)\n• Proven track record deploying apps to Google Play Store and Apple App Store.',
        location: 'Remote',
        employment_type: 'Full-time',
        salary_range: '₹10,00,000 - ₹16,00,000 / year',
        experience_level: 'Mid Level (2-4 Years)',
        status: 'Open'
      },
      {
        recruiter_id: rec2,
        department_id: engDept,
        title: 'Big Data & ETL Pipeline Engineer',
        description: 'Design and maintain scalable ETL/ELT data pipelines, data warehouses, and analytics dashboards using Apache Spark, Snowflake, and SQL.',
        requirements: '• Advanced SQL querying and database optimization\n• Hands-on experience with Python and Apache Spark/PySpark\n• Experience with modern data warehouses (Snowflake, BigQuery, or Amazon Redshift)\n• Familiarity with workflow orchestrators like Apache Airflow.',
        location: 'Hyderabad, India (Hybrid)',
        employment_type: 'Full-time',
        salary_range: '₹14,00,000 - ₹22,00,000 / year',
        experience_level: 'Mid to Senior Level (3-6 Years)',
        status: 'Open'
      },
      {
        recruiter_id: rec2,
        department_id: engDept,
        title: 'Enterprise Cloud Solutions Architect (AWS / Azure)',
        description: 'Architect enterprise multi-cloud infrastructure on AWS and Azure, automate infrastructure-as-code, and manage microservices on Kubernetes clusters.',
        requirements: '• 5+ years in cloud infrastructure architecture\n• Certified AWS Solutions Architect or Azure Solutions Architect Expert\n• Deep expertise in Terraform, Docker, and Kubernetes\n• Experience with high-availability systems, fault tolerance, and disaster recovery.',
        location: 'Remote / Mumbai, India',
        employment_type: 'Full-time',
        salary_range: '₹24,00,000 - ₹38,00,000 / year',
        experience_level: 'Senior Level (5+ Years)',
        status: 'Open'
      },
      {
        recruiter_id: rec1,
        department_id: engDept,
        title: 'Associate Software Engineer (Campus & Fresh Graduate)',
        description: 'Entry-level engineering role for enthusiastic fresh graduates. Learn full stack development, collaborate with senior architects, and build modern cloud web applications.',
        requirements: '• B.E./B.Tech/M.C.A in Computer Science, IT, or related fields (2024 - 2026 Batch)\n• Strong fundamentals in Object-Oriented Programming (OOPS) and Data Structures\n• Working knowledge of JavaScript, Python, or Java and SQL\n• High curiosity, strong problem-solving skills, and good communication.',
        location: 'Chennai, India (On-site)',
        employment_type: 'Full-time',
        salary_range: '₹5,50,000 - ₹8,00,000 / year',
        experience_level: 'Entry Level (0-1 Year)',
        status: 'Open'
      },
      {
        recruiter_id: rec1,
        department_id: hrDept,
        title: 'Senior Technical Recruiter & Talent Acquisition Partner',
        description: 'Lead end-to-end recruitment for high-tech engineering teams, manage candidate interviews, salary negotiations, and employer branding campaigns.',
        requirements: '• 3+ years in tech recruiting for software engineering roles\n• Proficiency with LinkedIn Recruiter, Boolean search, and modern ATS platforms\n• Exceptional candidate engagement and relationship-building skills\n• Experience managing university campus recruitment drives is a plus.',
        location: 'Bangalore, India (Hybrid)',
        employment_type: 'Full-time',
        salary_range: '₹9,00,000 - ₹15,00,000 / year',
        experience_level: 'Mid Level (3-5 Years)',
        status: 'Open'
      },
      {
        recruiter_id: rec3,
        department_id: prodDept,
        title: 'Product Growth & Retention Manager',
        description: 'Drive user acquisition, retention, and funnel optimization through data-driven product experiments, A/B testing, and user feedback.',
        requirements: '• 3+ years in product management or product-led growth\n• Experience with analytics tools (Mixpanel, Amplitude, Google Analytics)\n• Demonstrated success running A/B testing cycles and user journey experiments\n• Strong cross-functional leadership working with design and engineering teams.',
        location: 'Remote',
        employment_type: 'Full-time',
        salary_range: '₹15,00,000 - ₹24,00,000 / year',
        experience_level: 'Mid Level (3-5 Years)',
        status: 'Open'
      },
      {
        recruiter_id: rec1,
        department_id: engDept,
        title: 'Frontend Web Development Intern (React & Tailwind)',
        description: '6-month paid internship building modern interactive web components, UI screens, and API integrations with mentorship from senior engineers.',
        requirements: '• Good understanding of HTML5, CSS3, JavaScript (ES6+)\n• Familiarity with React.js component architecture and hooks\n• Basic knowledge of Git and GitHub collaboration\n• Eagerness to build responsive, accessible web applications.',
        location: 'Chennai, India (Hybrid)',
        employment_type: 'Internship',
        salary_range: '₹25,000 - ₹35,000 / month',
        experience_level: 'Internship / Student',
        status: 'Open'
      },
      {
        recruiter_id: rec3,
        department_id: finDept,
        title: 'Business Operations & Strategy Associate',
        description: 'Collaborate with leadership on operational efficiency, key performance metric tracking, vendor negotiations, and cross-functional project management.',
        requirements: '• Degree in Business, Management, Finance, or Engineering\n• Strong analytical mindset and financial modeling skills in Excel\n• Excellent executive presentation and communication capabilities\n• Ability to manage multiple initiatives in a fast-paced environment.',
        location: 'New Delhi, India',
        employment_type: 'Full-time',
        salary_range: '₹8,00,000 - ₹13,00,000 / year',
        experience_level: 'Junior to Mid Level (1-3 Years)',
        status: 'Open'
      }
    ];

    let insertedCount = 0;
    for (const job of newJobs) {
      // Check if job with this title already exists
      const existing = await query('SELECT id FROM jobs WHERE title = ?', [job.title]);
      if (existing.length === 0) {
        await query(
          `INSERT INTO jobs (recruiter_id, department_id, title, description, requirements, location, employment_type, salary_range, experience_level, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            job.recruiter_id,
            job.department_id,
            job.title,
            job.description,
            job.requirements,
            job.location,
            job.employment_type,
            job.salary_range,
            job.experience_level,
            job.status
          ]
        );
        insertedCount++;
        console.log(`✅ Added Job: "${job.title}" (${job.location})`);
      } else {
        console.log(`ℹ️ Already exists: "${job.title}"`);
      }
    }

    const totalJobs = await query('SELECT COUNT(*) as total FROM jobs');
    console.log(`\n🎉 Inserted ${insertedCount} new vacancies! Total jobs in database: ${totalJobs[0].total}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding jobs:', err);
    process.exit(1);
  }
}

addMoreJobs();
