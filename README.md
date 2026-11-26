# UCU Campus Lost and Found Management System

A centralized, full-stack web application for **Uganda Christian University (UCU), Bishop Barham University College (BBUC)** Kabale to manage lost and found property reports, ownership claims, claim approvals, physical item returns, and live analytics.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui, Lucide React, Recharts, React Hook Form, Zod, Axios, React Router
- **Backend:** Node.js, Express.js, MySQL2, bcryptjs, jsonwebtoken, Multer, Helmet, CORS, express-rate-limit, cookie-parser
- **Database:** MySQL (MySQL Workbench compatible)
- **Testing:** Vitest, Supertest, Playwright

## Project Structure

- `client/` — React + Vite frontend (`components/`, `pages/`, `layouts/`, `context/`, `services/`, `utils/`)
- `server/` — Express REST API (`config/`, `controllers/`, `middleware/`, `routes/`, `services/`, `validators/`, `scripts/`, `uploads/`)
- `database/` — `schema.sql` and `sample_data.sql`
- `tests/` — Automated API (`api.test.js`) and Playwright (`e2e.spec.js`) test suites

## Local Installation & Setup

1. **Database:**
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/sample_data.sql
   Or copy and execute from mysql
   ```
2. **Backend:**
   ```bash
   cd server
   edit.env file
   npm install
   npm run verify:db
   npm run dev
   ```
3. **Frontend:**
   ```bash
   cd client
   cp .env.example .env
   npm install
   npm run dev
   ```

## Sample Seeded Accounts (Local Development Only)

- **Admin:** `tumusiime@ucu.ac.ug` / `Password@123`
- **Student:** `grace@students.ucu.ac.ug` / `Password@123`

## Running Tests

- **API & Security Tests:** `cd server && npx vitest run ../tests/api.test.js`
- **End-to-End & Responsive Tests:** `npx playwright test tests/e2e.spec.js`
