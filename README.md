Mini Compete — Competition Registration System
A full-stack monorepo project built with NestJS, Next.js, Prisma, and Redis, designed to simulate a small-scale competition platform. Organizers can create events, participants can register, and background workers handle confirmations and reminders.

🚀 Tech Stack
- Monorepo: Turborepo
- Backend: NestJS + Prisma + PostgreSQL
- Frontend: Next.js (minimal UI)
- Queueing: Redis + BullMQ
- Auth: JWT (email/password)
- Infra: Docker Compose (Postgres + Redis)

📦 Project Structure
apps/
├── backend/     # NestJS API + Worker + Cron
├── frontend/    # Next.js UI



🧪 Features
Auth
- POST /api/auth/signup — Register with name, email, password, role (organizer/participant)
- POST /api/auth/login — Login and receive JWT
Competitions
- POST /api/competitions — Organizer creates a competition
- POST /api/competitions/:id/register — Participant registers
- Uses Idempotency-Key header
- Checks deadline and capacity
- Prevents oversell via DB transaction or Redis lock
- Enqueues confirmation job
Worker (NestJS + BullMQ)
- Processes registration:confirmation jobs
- Simulates email via MailBox table
- Retry logic + exponential backoff
- Failed jobs pushed to DLQ or logged
Cron Job
- Runs nightly (or every minute in dev)
- Enqueues reminder:notify jobs for competitions starting in next 24 hours
- Optionally purges stale registrations

🛠 Setup Instructions
1. Clone & Install
git clone https://github.com/your-username/mini-compete.git
cd mini-compete
yarn install


2. Environment Setup
Copy .env.example to .env and fill in required values.
cp .env.example .env


3. Start Services
docker-compose up -d


4. Migrate & Seed
yarn workspace backend prisma migrate dev
yarn workspace backend prisma db seed


5. Run Backend & Frontend
yarn workspace backend start:dev
yarn workspace frontend dev



🧠 Architecture Notes
Idempotency
- Idempotency-Key header ensures safe retries
- Redis or DB-based locking prevents duplicate registrations
Concurrency
- DB transactions with row-level locking OR Redis locks
- Prevents overselling under concurrent requests
Job Processing
- BullMQ queues for confirmation/reminder jobs
- Retry logic with exponential backoff
- DLQ or FailedJobs table for failed attempts

📬 API Examples (Postman / Curl)
Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"pass123","role":"organizer"}'


Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"pass123"}'


Create Competition
curl -X POST http://localhost:3000/api/competitions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hackathon","description":"24hr coding","capacity":50,"regDeadline":"2025-11-20T23:59:59.000Z"}'


Register (with Idempotency)
curl -X POST http://localhost:3000/api/competitions/<id>/register \
  -H "Authorization: Bearer <token>" \
  -H "Idempotency-Key: abc123" \
  -H "Content-Type: application/json" \
  -d '{}'



🧑‍💻 Seed Data
- 2 organizers
- 5 competitions
- 5 participants

📁 Mailbox Simulation
View simulated emails in the MailBox table via frontend or DB.



