# CivicConnect Backend Service

The Node.js, Express, and MongoDB backend for **CivicConnect**. This service manages role-based access control, JWT session operations, complaint ticketing, volunteer matching, corporate sponsorship logging, system alerts, PDF certificates compile streaming, and integration fallback AI classifications.

---

## Technical Features

1. **Role-Based Auth (JWT)**: Separate registration flows and custom permissions for:
   - `citizen`: Report issues, RSVP, volunteer, earn points/badges.
   - `ngo`: Post volunteering campaigns, approve/reject volunteers, publish events.
   - `business`: Launch CSR funds, sponsor community events.
   - `authority`: Dispatch crews, update status tickets, download reports.
2. **AI Integration (`aiService.js`)**:
   - Automatic issue categorization & priority scoring using Gemini (with keyword-matching regex fallbacks).
   - Duplicate checks (within 50 meters and 35%+ Jaccard description word overlap).
   - Smart volunteering recommendations based on citizen history category overlaps.
3. **Certificate Generation**: Landscape PDF certificate compilation using PDFKit.
4. **Data Exports**: Authority queue data CSV exports.

---

## Setup & Running Instructions

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **MongoDB** (A local database server running on port `27017` or a MongoDB Atlas cloud connection URI)

### Local Configuration
1. Open the `backend` directory.
2. Create your `.env` configuration file (already initialized with default values by seed scripts):
   ```bash
   cp .env.example .env
   ```
3. Update `MONGO_URI` with your connection string if you use a custom port or cloud database.

### Installation
Install npm dependencies:
```bash
npm install
```

### Seeding Initial Data
To populate the database with seed users, complaints, events, and mock points history, ensure your MongoDB server is running and execute:
```bash
npm run seed
```

### Starting the Server
Start the Express server in development mode (runs on port `5000` by default):
```bash
npm start
```
Verify the server state by opening: `http://localhost:5000/api/health`

---

## API Endpoints Catalog

### Authentication Endpoints (`/api/auth`)

| Endpoint | Method | Role Access | Body / Headers | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/signup/citizen` | `POST` | Public | `{ name, email, password, phone }` | Registers a citizen user. Sets refresh token cookie and returns access token. |
| `/signup/ngo` | `POST` | Public | `{ orgName, registrationNumber, contactPerson, email, password, phone }` | Registers an NGO (creates in `pending` status). |
| `/signup/business` | `POST` | Public | `{ businessName, gstNumber, email, csrFocusArea, password, phone }` | Registers a corporate business. |
| `/signup/authority` | `POST` | Public | `{ name, department, employeeId, email, password, phone }` | Registers a municipal official (creates in `pending` status). |
| `/login` | `POST` | Public | `{ email, password, role }` | Role-aware login. Blocks pending authority accounts. Sets refresh cookie. |
| `/refresh` | `POST` | Public | *Cookie: refreshToken* | Validates refresh token cookie and returns new JWT access token. |
| `/logout` | `POST` | Public | *None* | Wipes refresh token cookie. |
| `/me` | `GET` | Authenticated | *Authorization: Bearer <JWT>* | Returns currently logged-in user profile. |
| `/authority/:id/approve` | `PATCH` | Admin | *Header: x-admin-key: admin123* | Activates/approves a pending authority representative account. |

---

### Complaints Endpoints (`/api/complaints`)

| Endpoint | Method | Role Access | Body / Headers | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `POST` | Citizen | Form-Data: `{ title, description, address, lat, lng, photo: file }` | Files an issue. Runs AI tagging, duplicate checks, and credits citizen +50 points. |
| `/mine` | `GET` | Citizen | *Authorization: Bearer <JWT>* | Returns the citizen's own reported issues. |
| `/` | `GET` | Authority | *Query: status, category, priority* | Returns the queue sorted by AI priority (High first). |
| `/:id/assign` | `PATCH` | Authority | `{ department }` | Assigns ticket to department, sets status to `in_progress`. |
| `/:id/resolve` | `PATCH` | Authority | *None* | Resolves ticket. Credits reporter +100 points and fires notifications email. |
| `/:id/reject` | `PATCH` | Authority | `{ reason }` | Rejects complaint. |
| `/:id/feedback` | `POST` | Citizen | `{ rating, comment }` | Citizen submits resolution rating (1-5) on resolved ticket. |
| `/export` | `GET` | Authority | *None* | Downloads the whole complaint queue as a `.csv` file. |

---

### Volunteer Opportunities Endpoints (`/api/opportunities`)

| Endpoint | Method | Role Access | Body / Headers | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `POST` | NGO / Business | `{ title, description, category, date, location, capacity }` | Posts a new volunteering drive campaign. |
| `/` | `GET` | Authenticated | *Query: category, location, search* | Lists active campaigns. |
| `/:id/apply` | `POST` | Citizen | *None* | Citizen registers. Sends alert to NGO. |
| `/:id/applicants/:userId` | `PATCH` | NGO / Business | `{ status: "approved" / "rejected" }` | NGO approves volunteer. Credits citizen +30 points. |
| `/recommended` | `GET` | Citizen | *None* | AI Opportunity recommend engine matches tags against user interest history. |

---

### Events Endpoints (`/api/events`)

| Endpoint | Method | Role Access | Body / Headers | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `POST` | NGO / Business | `{ title, description, date, type }` | Creates a new campaign/volunteering/csr community event. |
| `/` | `GET` | Authenticated | *Query: startDate, endDate* | Calendar list view. |
| `/:id/rsvp` | `POST` | Authenticated | *None* | Registers user. If citizen, awards +15 points. |
| `/:id/sponsor` | `PATCH` | Business | *None* | Corporate sponsors community event for CSR budget. |

---

### Rewards & Certificates Endpoints (`/api/users`)

| Endpoint | Method | Role Access | Body / Headers | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/:id/profile` | `GET` | Authenticated | *None* | Unified activity history timeline list, reward balance, and badges. |
| `/:id/certificate/:activityId` | `GET` | Citizen | *None* | Generates and streams PDF Certificate of Civic Action. |

---

### Notifications Endpoints (`/api/notifications`)

| Endpoint | Method | Role Access | Body / Headers | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/mine` | `GET` | Authenticated | *None* | Returns notification alerts for logged-in user. |
| `/:id/read` | `PATCH` | Authenticated | *None* | Marks alert as read. |

---

### Dashboard Endpoints (`/api/dashboard`)

| Endpoint | Method | Role Access | Description |
| :--- | :--- | :--- | :--- |
| `/ngo` | `GET` | NGO | Aggregates active campaigns count, approved volunteers, and pending applications. |
| `/business` | `GET` | Business | Aggregates CSR initiatives funded, budget deployed, and citizen outreach counts. |
| `/authority` | `GET` | Authority | Aggregates open complaints queue, resolved counts, and active civic volunteers. |
