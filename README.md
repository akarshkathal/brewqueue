# BrewQueue ☕

A real-time virtual queue system for coffee shops. Customers join a virtual 
queue from their phone and track their live position without standing in line. 
Staff manage the queue from a real-time dashboard.

> Phase 1 of QueueFlow — a multi-tenant queue platform.
> Parking and concert/event modes in development.

## Live Demo
🔗 [Coming soon after deployment]

## Features

**For Customers:**
- Join queue by scanning a QR code
- See live position and estimated wait time
- Get instant notification when called
- Leave queue anytime

**For Staff:**
- Secure login with JWT authentication
- Live queue dashboard — no refresh needed
- Call, serve, or remove customers
- Open/close shop toggle
- QR code generator for customer check-in

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 16 |
| Real-time | Socket.io |
| Auth | JWT + bcrypt |
| Local Dev | Docker + Docker Compose |
| Deployment | Vercel (FE) + Railway (BE + DB) |

## Architecture
[ React + TypeScript + Vite ]  ←→  [ Socket.io-client ]
↕ Axios (REST)                    ↕ WebSocket
[ Express + TypeScript + Node.js + Socket.io ]
↕ node-postgres
[ PostgreSQL 16 ]

## Local Setup

### Prerequisites
- Node.js 22.12+
- Docker Desktop

### Steps

1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/brewqueue.git
cd brewqueue
```

2. Start the database
```bash
docker-compose up -d
```

3. Setup the backend
```bash
cd server
npm install
npm run migrate
npm run seed
npm run create-staff
npm run dev
```

4. Setup the frontend
```bash
cd ../client
npm install
cp .env.example .env
npm run dev
```

5. Open the app
Customer: http://localhost:5173/shop/blue-bottle
Staff:    http://localhost:5173/staff/login
Email: staff@bluebottle.com
Password: password123

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/queue/:slug | Public | Get queue + shop info |
| POST | /api/queue/:slug/join | Public | Join the queue |
| GET | /api/queue/:slug/status/:id | Public | Get entry status |
| PATCH | /api/queue/:slug/entry/:id | Staff | Update entry status |
| PATCH | /api/queue/:slug/toggle | Staff | Toggle shop open/closed |
| POST | /api/auth/login | Public | Staff login |
| GET | /api/auth/me | Staff | Get current user |

## What I'd Add Next
- SMS notifications via Twilio when customer is called
- Redis for scaling Socket.io across multiple server instances
- Analytics dashboard showing peak hours and average wait times
- Multi-shop support with admin panel
- Parking lot queue mode (Phase 2)
- Concert/event waiting room with Redis (Phase 3)