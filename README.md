# Employee Recruitment Management System
**College Academic Project - Object-Oriented Analysis and Software Engineering (OOASE)**

---

## 🎓 Academic Details

- **Project Title**: Employee Recruitment Management System
- **Student Name**: KARTHICKUMAR S S
- **Register Number**: 6113241041061
- **Project Type**: College Academic Project
- **Subject**: Object-Oriented Analysis and Software Engineering (OOASE)

---

## 📌 Project Objective

The **Employee Recruitment Management System** is an enterprise web platform designed to streamline an organization's talent acquisition lifecycle. It connects job seekers (candidates), HR hiring managers (recruiters), and platform administrators through a centralized MySQL database with integrated, database-backed email notifications and cryptographic OTP verification.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Lucide React Icons, Recharts Analytics
- **Backend**: Node.js, Express.js (MVC Architecture)
- **Database**: MySQL 8.0 (Relational schema with foreign keys, transactional queries)
- **Authentication**: JWT (JSON Web Tokens), Bcryptjs Password Hashing
- **Email Service**: Nodemailer (Gmail SMTP) with Database-backed Outbox Queue & Retry
- **Security**: Cryptographic 6-digit OTP generation, SHA-256 OTP hashing, Rate limiting & Cooldown timers
- **File Uploads**: Multer (PDF resume management)

---

## 🔑 Test Demo Accounts

All pre-seeded test accounts use password: **`password123`** (All pre-verified: `is_verified = 1`)

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | System Administrator | `admin@recruitment.com` | `password123` |
| **Recruiter Lead** | Sarah Jenkins (HR Lead) | `sarah.recruiter@recruitment.com` | `password123` |
| **Tech Recruiter** | Alex Rivera (Technical Lead) | `alex.tech@recruitment.com` | `password123` |
| **Candidate (Live Email)** | KARTHICKUMAR S S | `karthickumar1207@gmail.com` | `password123` |
| **Candidate (Demo)** | John Doe | `john.doe@gmail.com` | `password123` |

---

## 📧 Email Notification System

The system includes an end-to-end email notification infrastructure:

1. **Candidate Registration & OTP Email Verification**:
   - Cryptographically secure 6-digit OTP generated via `crypto.randomInt`.
   - Stored in MySQL as a SHA-256 hash (never plain text).
   - 10-minute expiry window with 60-second cooldown timer.
   - Max 5 failed attempt limit before code invalidation.
   - Beautiful React OTP verification page (`/verify-email`) with countdown timers.
   - Unverified candidates cannot log in or apply until verified.

2. **Welcome Onboarding Email**:
   - Sent automatically upon successful first-time email verification.
   - Duplicate prevention prevents repeated welcome emails.

3. **Job Application Confirmation**:
   - Sent immediately upon candidate application submission with unique Reference `#APP-{id}`.
   - Alerts the recruiter/HR lead with candidate credentials.

4. **Recruiter Decision & Status Change Email Notifications**:
   - Recruiter can click the dedicated **Make Decision** modal in the Applicant Management dashboard.
   - Dispatched to candidate when recruiter makes a decision (`Selected / Offer`, `Shortlisted`, `Under Review`, `Rejected`).
   - Includes custom **Recruiter Remarks & Next Steps** (e.g., joining date, offer details, technical feedback).
   - Candidate receives tailored HTML emails with rich decision cards and portal links.
   - Delivered directly to candidate's Gmail inbox and saved in application tracking history.

5. **Interview Scheduling, Rescheduling & Cancellation**:
   - Dispatched when an interview is booked or rescheduled, including candidate name, job title, date/time with timezone, and Google Meet link.
   - Dispatches a cancellation email if an interview is cancelled.

6. **Outbox Notification History & Resilient Fallback**:
   - All email dispatches are tracked in `email_logs` (`SENT`, `FAILED`, `PENDING`).
   - If SMTP is firewalled or credentials are misconfigured, delivery fails gracefully without crashing the server or failing user requests.
   - Admins can view notification history and click **Retry** on failed emails from `/admin/email-logs`.

---

## 🗄️ Database Architecture (`recruitment_db`)

The normalized MySQL database schema includes 11 tables:
1. `users`: Credentials, roles (`admin`, `recruiter`, `candidate`), `is_verified`, and status.
2. `departments`: Functional units (Engineering, HR, Product, Marketing, Finance).
3. `recruiters`: Recruiter profiles linked to departments and company names.
4. `candidates`: Education, skills, headline, location, phone, and experience.
5. `resumes`: PDF resume storage records.
6. `jobs`: Vacancies with salary ranges, employment types, and Open/Closed status.
7. `applications`: Job applications linking candidate, job, resume, and status.
8. `interviews`: Interview dates, Google Meet links, notes, and outcome status.
9. `notifications`: In-app candidate and recruiter alert notifications.
10. `email_otps`: Secure hashed OTPs, attempt limits, expiration, and rate-limit tracking.
11. `email_logs`: Database-backed outbox queue tracking delivery status, error logs, and retry attempts.

---

## 🚀 Installation & Execution Guide

### Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+)

### 1. Database Setup & Seeding

Navigate to `server/`:
```bash
cd server
npm install
```

Configure your credentials in `server/.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=recruitment_db
JWT_SECRET=your_jwt_secret_key

# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_digit_app_password
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_app_password
ADMIN_EMAIL=your_admin_email@gmail.com
```

Run schema setup and email migration:
```bash
npm run db:setup
node database/runMigration.js
```

### 2. Start Backend API Server
```bash
cd server
npm start
```
*API runs at `http://localhost:5000`*

### 3. Start Frontend Client Application
```bash
cd client
npm install
npm run dev
```
*Client runs at `http://localhost:3000`*

---

## 🔐 How to Configure Live Gmail SMTP Delivery

To send real live emails to candidate inboxes via Gmail:
1. Open your Google Account: **Manage your Google Account** -> **Security**.
2. Enable **2-Step Verification**.
3. Search for **App passwords** (or go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
4. Create an App password with name **RecruitX ERP**.
5. Copy the 16-character code (e.g. `abcd efgh ijkl mnop`).
6. Put this code in `server/.env`:
   ```env
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=abcdefghijklmnop
   ```
7. Restart the backend server. Emails will now be delivered live to real recipient inboxes!

---

## 📡 REST API Documentation & Endpoints

### Authentication & Email Verification (`/api/auth`)
- `POST /api/auth/register`: Register candidate (requires OTP verification) or recruiter.
- `POST /api/auth/verify-otp`: Validate 6-digit OTP, activate candidate account, issue JWT.
- `POST /api/auth/resend-otp`: Resend fresh OTP with 60-second cooldown protection.
- `POST /api/auth/login`: Authenticate; blocks unverified candidates with `requiresVerification: true`.
- `GET /api/auth/me`: Get current user profile details.
- `PUT /api/auth/profile`: Update candidate profile information.

### Job Vacancies (`/api/jobs`)
- `GET /api/jobs`: Get all open job vacancies with search and filters.
- `GET /api/jobs/departments`: Get department list.
- `GET /api/jobs/:id`: Get detailed job posting specifications.
- `POST /api/jobs`: Create new job vacancy (Recruiter/Admin).
- `PUT /api/jobs/:id`: Update existing job posting (Recruiter/Admin).
- `DELETE /api/jobs/:id`: Delete job vacancy (Recruiter/Admin).

### Applications (`/api/applications`)
- `POST /api/applications/apply`: Submit job application (Triggers candidate confirmation & recruiter alert emails).
- `POST /api/applications/upload-resume`: Upload PDF resume file.
- `GET /api/applications/my-applications`: Candidate applications list.
- `GET /api/applications/track/:id`: Visual application status timeline.
- `DELETE /api/applications/:id/withdraw`: Candidate application withdrawal.
- `GET /api/applications/recruiter/applicants`: Recruiter review applicants list.
- `PUT /api/applications/:id/status`: Update status (Triggers candidate status change notification email).
- `GET /api/applications/resume/:resumeId`: View/Download candidate PDF resume.

### Interview Management (`/api/interviews`)
- `POST /api/interviews`: Schedule/Reschedule interview (Triggers invitation email with Google Meet link).
- `GET /api/interviews`: View scheduled interviews list.
- `PUT /api/interviews/:id/status`: Update outcome (`Passed`, `Failed`, or `Cancelled` - triggers cancellation email).

### Reports & Outbox History (`/api/reports`)
- `GET /api/reports/dashboard-stats`: Role-specific live statistics.
- `GET /api/reports/analytics`: Recharts recruitment funnel data.
- `GET /api/reports/email-logs`: Outbox notification history table (Admin only).
- `POST /api/reports/email-logs/:id/retry`: Retry sending a failed outbox email (Admin only).
