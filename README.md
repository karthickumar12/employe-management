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

The **Employee Recruitment Management System** is an enterprise web platform designed to streamline an organization's talent acquisition lifecycle. It connects job seekers (candidates), HR hiring managers (recruiters), and platform administrators through a centralized MySQL database.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Lucide React Icons, Recharts Analytics
- **Backend**: Node.js, Express.js (MVC Architecture)
- **Database**: MySQL 8.0 (Relational schema with foreign keys)
- **Authentication**: JWT (JSON Web Tokens), Bcryptjs Password Hashing
- **File Uploads**: Multer (PDF resume management)
- **API Client & Testing**: Axios, Postman

---

## 🔑 Test Demo Accounts

All pre-seeded test accounts use password: **`password123`**

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | System Administrator | `admin@recruitment.com` | `password123` |
| **Recruiter Lead** | Sarah Jenkins (HR Lead) | `sarah.recruiter@recruitment.com` | `password123` |
| **Tech Recruiter** | Alex Rivera (Technical Lead) | `alex.tech@recruitment.com` | `password123` |
| **Candidate** | KARTHICKUMAR S S | `karthick.candidate@recruitment.com` | `password123` |
| **Candidate** | John Doe | `john.doe@gmail.com` | `password123` |

---

## 🗄️ Database Architecture (`recruitment_db`)

The normalized MySQL database schema includes 9 core tables:
1. `users`: Credentials, roles (`admin`, `recruiter`, `candidate`), and status.
2. `departments`: Functional units (Engineering, HR, Product, Marketing, Finance).
3. `recruiters`: Recruiter profiles linked to departments and company names.
4. `candidates`: Education, skills, headline, location, phone, and experience.
5. `resumes`: PDF resume storage records.
6. `jobs`: Vacancies with salary ranges, employment types, and Open/Closed status.
7. `applications`: Job applications linking candidate, job, resume, and status (`Applied`, `Under Review`, `Shortlisted`, `Interview Scheduled`, `Selected`, `Rejected`).
8. `interviews`: Interview dates, Google Meet links, notes, and outcome status.
9. `notifications`: Real-time candidate and recruiter alert notifications.

---

## 🚀 Installation & Execution Guide

### Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+)

### 1. Database Setup & Seeding

Navigate to the `server/` directory:
```bash
cd server
npm install
```

Configure your MySQL credentials in `server/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Muthuvel2006
DB_NAME=recruitment_db
JWT_SECRET=recruitment_ooase_jwt_secret_key_6113241041061
```

Run database schema creation & seeding:
```bash
npm run db:setup
```

### 2. Start Backend API Server

In `server/`:
```bash
npm start
```
*API will run at `http://localhost:5000`*

### 3. Start Frontend Client Application

In a new terminal window, navigate to `client/`:
```bash
cd client
npm install
npm run dev
```
*Frontend will run at `http://localhost:3000`*

---

## 📡 REST API Documentation & Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register new candidate or recruiter.
- `POST /api/auth/login`: Authenticate and receive JWT token.
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
- `POST /api/applications/apply`: Submit job application with cover letter.
- `POST /api/applications/upload-resume`: Upload PDF resume file.
- `GET /api/applications/my-applications`: Candidate applications list.
- `GET /api/applications/track/:id`: Visual application status timeline.
- `DELETE /api/applications/:id/withdraw`: Candidate application withdrawal.
- `GET /api/applications/recruiter/applicants`: Recruiter review applicants list.
- `PUT /api/applications/:id/status`: Update status (`Applied` -> `Selected` / `Rejected`).
- `GET /api/applications/resume/:resumeId`: View/Download candidate PDF resume.

### Interview Management (`/api/interviews`)
- `POST /api/interviews`: Schedule candidate interview with Google Meet link.
- `GET /api/interviews`: View scheduled interviews list.
- `PUT /api/interviews/:id/status`: Update interview outcome (`Passed`, `Failed`).

### Admin & User Oversight (`/api/users`)
- `GET /api/users`: Admin user account directory.
- `GET /api/users/candidates`: Candidate directory.
- `GET /api/users/recruiters`: Recruiter directory.
- `PUT /api/users/:id/status`: Toggle user active/inactive state.
- `DELETE /api/users/:id`: Delete user account.

### Reports & Analytics (`/api/reports`)
- `GET /api/reports/dashboard-stats`: Role-specific live statistics.
- `GET /api/reports/analytics`: Recharts recruitment funnel data.

---

## 🧪 Postman API Testing Instructions

1. Open **Postman**.
2. Create a `POST` request to `http://localhost:5000/api/auth/login` with raw JSON body:
   ```json
   {
     "email": "sarah.recruiter@recruitment.com",
     "password": "password123"
   }
   ```
3. Copy the returned `token` from response body.
4. For protected endpoints, set header:
   `Authorization: Bearer <your_copied_jwt_token>`
