# 55Lounge Operations Platform

A modern, production-grade restaurant operations platform built to demonstrate senior engineering principles.

## Architecture
- **Frontend**: Next.js App Router, TypeScript, CSS Modules
- **Backend**: Express.js, TypeScript, PostgreSQL (via Prisma)
- **Monorepo**: npm workspaces

## Local Development Setup

### Prerequisites
- Node.js (v20+)
- PostgreSQL (or Docker for `docker-compose`)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy the `.env.example` files in both `frontend` and `backend` to `.env` and fill in your local values.

### 3. Database Setup
```bash
# Start local Postgres instance
docker-compose up -d

# Run migrations
cd backend
npx prisma migrate dev --name init

# Seed database with operator account
npx prisma db seed
```

### 4. Start Servers
```bash
# Starts both frontend and backend
npm run dev
```

## Future Enhancements
- **Email Verification**: During registration, send a verification code to validate customer email addresses before allowing order placement.
- **Image Storage**: Migrate menu item `imageUrl` strings to use direct multipart uploads via Cloudinary or AWS S3 with pre-signed URLs.
