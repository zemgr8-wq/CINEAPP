# CineBook - Production Cinema Ticket-Booking Platform

A production-ready cinema ticket-booking web application engineered for Vercel deployment with Next.js App Router, Tailwind CSS, Neon PostgreSQL, Drizzle ORM, role-based authentication, and concurrency-safe seat reservation transactions.

## Architecture & Team Agents

- **Agent 1 - App Agent**: Responsive cinematic dark theme, interactive auditorium seat maps, live hold countdown timers, itemized checkout, digital boarding-pass tickets with high-contrast QR codes, and customer booking dashboard.
- **Agent 2 - Database Engine Agent**: Neon Serverless PostgreSQL with Drizzle ORM, row-level locks on `showtime_seats`, UTC timestamps, integer minor units for all currencies, unique constraints, and idempotent cron cleanup (`/api/cron/release-holds`).
- **Agent 3 - QA Agent**: Automated test runner verifying concurrent double-booking protection, hold expiration, integer cent precision, and cancellation flows.

---

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run dev server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Run QA Test Suite**:
   ```bash
   npm test
   ```

---

## Vercel Deployment Instructions

1. **Push repository to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial cinebook cinema platform"
   git remote add origin https://github.com/your-org/cinebook.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new) and import the repository.
   - In the **Storage** tab, add **Neon Serverless Postgres** from the Vercel Marketplace.
   - Configure Environment Variables (from `.env.example`):
     - `DATABASE_URL` (Pooled Neon connection)
     - `DIRECT_URL` (Direct migration connection)
     - `CRON_SECRET` (For scheduled `/api/cron/release-holds`)
     - `NEXT_PUBLIC_APP_URL` (Your Vercel deployment URL)
   - Click **Deploy**.

3. **Vercel Cron Configuration**:
   Create a `vercel.json` file for automatic hold cleanup:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/release-holds",
         "schedule": "*/5 * * * *"
       }
     ]
   }
   ```
