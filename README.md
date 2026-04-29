# Phantasmagoria - University Alumni Analytics Dashboard

## 1. Project Overview

Phantasmagoria is a university alumni analytics platform designed to collect, manage, and analyse graduate data. It allows users to register, create profiles, and visualise insights such as industry distribution, programme trends, and skill demand through an interactive dashboard.

The system also supports API key generation and usage tracking, allowing external clients to securely access selected data endpoints. Furthermore the system allows the user to download profile data through the CSV export functionality once a profile is completed and submitted.

## 2. System Architecture

The system follows a three-tier architecture:

Frontend:
- Built using HTML, CSS, and JavaScript
- Displays dashboards, charts, filters, and user interfaces

Backend:
- Built using Node.js and Express.js
- Handles authentication, business logic, analytics, and API access

Database:
- MongoDB Atlas
- Stores users, profiles, API keys, usage logs, and related data

Flow:
Frontend → Backend API → MongoDB → Backend → Frontend

## 3. Folder Structure

- models/ → MongoDB schemas (User, Profile, ApiToken, etc.)
- routes/ → API route handlers
- frontend/ → HTML pages and JavaScript (dashboard, login, profile)
- server.js → Main backend entry point
- db.js → Database connection
- seed.js → Populates database with test data
- swagger.js → API documentation setup

## 4. Environment Variables

The system uses environment variables for security and configuration:

- PORT → Server port
- MONGO_URI → MongoDB connection string
- UNIVERSITY_DOMAIN → Restricts email registration domain
- BASE_URL → Backend base URL
- INDEX_URL → Frontend base URL
- VERIFY_TOKEN_SECRET → Email verification secret
- SESSION_SECRET → Session encryption key

## 5. Database Schema and Relationships

Collections:

- User → stores user credentials and verification status
- Profile → stores alumni data (programme, industry, skills, etc.)
- ApiToken → stores API keys and permissions
- ApiUsage → logs API usage activity
- Bid → stores bid submissions (FROM COURSEWORK 1) (CAN BE TESTED IN BACKEND ONLY)
- ParticipatingAlumnus → stores selected alumni for features (FROM COURSEWORK 1) (CAN BE TESTED IN BACKEND ONLY)
- EmailToken → stores verification tokens

Database Relationships/Cardinalities:

### User — Profile

One User has a minimum of 1 Profile and a maximum of 1 Profile once an account is created.  
One Profile belongs to a minimum of 1 User and a maximum of 1 User.

Cardinality: User (1..1) — Profile (1..1)

### User — Bid

One User may not place any Bids but they can also place many Bids.  
One Bid belongs to 1 User and only 1 User.

Cardinality: User (0..*) — Bid (1..1)

### User — Participating Alumnus

One User may not have any Participating Alumnus records but they can also have many Participating Alumnus records.  
One Participating Alumnus record belongs to 1 User and only 1 User.

Cardinality: User (0..*) — Participating Alumnus (1..1)

### Bid — Participating Alumnus

One Bid may not have any Participating Alumnus records and at most 1 Participating Alumnus record.  
One Participating Alumnus record is linked to at least 1 Bid and only 1 Bid.

Cardinality: Bid (0..1) — Participating Alumnus (1..1)

### API Token — API Usage

One API Token may have no API Usage records but it can also have multiple API Usage records.  
One API Usage record belongs to 1 API Token and only 1 API Token.

Cardinality: API Token (0..*) — API Usage (1..1)

### User — Email Token

One User can have a minimum of 0 Email Tokens and a maximum of many Email Tokens.  
One Email Token belongs to a minimum of 1 User and a maximum of 1 User.

Cardinality: User (0..*) — Email Token (1..1)

---

## 6. API Endpoint Documentation

| Method | Endpoint | Description |
------------------------------------------
| POST | /auth/register | Register user |
| POST | /auth/login | Login user |
| POST | /auth/logout | Logout user |
| POST | /profile | Create/update profile |
| GET | /profile/me | Get current profile |
| GET | /analytics/summary | Dashboard summary |
| GET | /analytics/by-industry | Industry chart |
| GET | /analytics/by-programme | Programme chart |
| GET | /analytics/by-graduation-year | Year chart |
| GET | /apiKeys/usage | API usage logs |
| GET | /client/participatingAlumnus/tomorrow | Client endpoint |

## 7. Security Features

- Password hashing using bcrypt
- Session-based authentication
- Email verification system
- API key validation middleware
- API usage logging
- Environment variable protection
- CORS configuration

## 8. Setup Instructions

### Live Application Links

Frontend (GitHub Pages):
https://alexandru-rx.github.io/w1887688-Advanced-Server-Side/

Backend API (Render):
https://w1887688-advanced-server-side.onrender.com

### Instructions 

1. Open the frontend link above/in submission.

2. Register a new account using the university email address (@westminster.ac.uk).

3. Verify your account via the backend terminal (go to logs in Render and you'll see a verification link) from above/in submission

3. Log in using your credentials.

4. Navigate to **My Profile** and enter alumni details such as:
   - Programme
   - Graduation Year
   - Industry Sector
   - Skills

5. Save the profile.

6. Navigate to the **Dashboard** to view:
   - Total alumni statistics
   - Industry distribution chart
   - Programme distribution chart
   - Graduation year trends
   - Skills analysis

7. Use the filter controls to refine analytics results.

8. View the **API Usage Logs** table at the bottom to monitor API activity.

## 9. Explanation of Key Code Logic

### Analytics (analytics.js)

1 - Builds a MongoDB query object based on filters provided such as programme, industry, graduation year etc.
v
const filter = buildFilterQuery(req.query);

2 - Adds a programme filter if the programme is provided
v
if (query.programme) {
    filter.programme = query.programme;
  }

3 - Adds industry filter if the industry is provided
v
if (query.industrySector) {
    filter.industrySector = query.industrySector;
  }

### Skills Counting (analytics.js)

1 - Uses MongoDB aggregation to count most common skills inputted by users.
- $unwind splits array into individual entries, so the individual skills can be counted.
- $group counts how many times each skill occures.
- $sort orders the results by their frequency
- $limit restricts the outputed skills to only the top 8 most inputted skills.

const data = await Profile.aggregate({
      { $match: filter },
      { $unwind: "$skills" },
      { $group: { _id: "$skills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

### Profile (profile.js)

1 - Converts comma-seperated string inputs into arrays
- Ensures consistency of data despite what the user might input on the frontend.

skills: Array.isArray(skills)
  ? skills
  : String(skills || "")
      .split(",")
      .map(item => item.trim())
      .filter(Boolean),

2 - Searches for an existing userId stored in the database and if that profile exists it updates it with new data
- If profile doesn't exist it creates a new one using $setOnInsert
- This whole process ensures that each user can only have one profile

const profile = await Profile.findOneAndUpdate()

### Authentication (auth.js)

1 - Generates a secret random token for email verification 

const rawToken = crypto.randomBytes(32).toString("hex");

2 - Hashes the token before storing in the database and prevents token leakage if database is compromised

const tokenHash = crypto
  .createHash("sha256")
  .update(rawToken + secret)
  .digest("hex");

3 - Stores userId in session after a successful login, alowing session-based authentication for protected routes

req.session.userId = user._id;

### Authentication (requireAuth.js)

- Middleware used to protect the routes by verifying session authentication and blocks access if user is not logged in

if (!req.session || !req.session.userId)

## 10. Summary

This project demonstrates a full-stack web application with clear separation of secure authentication, structured database design, and data-driven analytics visualisation.
