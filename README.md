# 🍔 FoodApp

Full-stack food ordering application built with Node.js, React, and MySQL.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, React Query, Zustand, React Router v6
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: MySQL + Sequelize ORM
- **Auth**: OTP via Twilio + JWT
- **Payments**: Razorpay
- **Notifications**: Firebase FCM
- **Deployment**: AWS EC2 + RDS + S3

---

## Project Structure

```
foodapp/
├── client/                   # React frontend
│   └── src/
│       ├── api/              # All API call functions
│       ├── assets/           # Images, icons
│       ├── components/
│       │   ├── common/       # Reusable: Button, Input, Modal, etc.
│       │   └── layout/       # Navbar, Footer, Sidebar
│       ├── context/          # AuthContext, CartStore (Zustand)
│       ├── hooks/            # useGeolocation, useSocket, etc.
│       ├── pages/
│       │   ├── auth/         # Login, OTP verify
│       │   ├── home/         # Home, search, filters
│       │   ├── restaurant/   # Restaurant detail + menu
│       │   ├── cart/         # Cart, checkout
│       │   ├── orders/       # Order history, tracking
│       │   └── profile/      # Profile, addresses
│       └── utils/            # formatCurrency, formatDate, etc.
│
└── server/                   # Node.js backend
    ├── config/               # database.js, index.js (env vars)
    ├── controllers/          # Request handlers (thin layer)
    ├── middlewares/          # auth.js, errorHandler.js
    ├── models/               # Sequelize models + associations
    ├── routes/               # Express route definitions
    ├── services/             # Business logic (OTP, payment, etc.)
    ├── utils/                # logger, apiResponse, seed
    └── server.js             # Entry point
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8+
- Git

### 1. Clone and install
```bash
git clone <your-repo-url>
cd foodapp
npm run install:all
```

### 2. Configure environment
```bash
# Copy and fill in your credentials
cp server/.env.example server/.env
```

### 3. Create MySQL database
```sql
CREATE DATABASE foodapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run the app (both client + server)
```bash
npm run dev
```

This starts:
- Backend on http://localhost:5000
- Frontend on http://localhost:5173

### 5. Seed sample data (optional)
```bash
cd server && npm run seed
```

---

## API Endpoints Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/send-otp | Send OTP to phone | No |
| POST | /api/auth/verify-otp | Verify OTP, get token | No |
| GET | /api/users/profile | Get my profile | Yes |
| PUT | /api/users/profile | Update profile | Yes |
| GET | /api/restaurants | Get nearby restaurants | No |
| GET | /api/restaurants/:id/menu | Get menu | No |
| POST | /api/orders | Create order | Yes |
| GET | /api/orders/my-orders | My order history | Yes |
| POST | /api/payments/create-order | Init Razorpay payment | Yes |
| POST | /api/payments/verify | Verify payment | Yes |

---

## Day-by-Day Plan

| Day | Focus |
|-----|-------|
| 1 ✅ | Project setup, folder structure, DB models |
| 2 | OTP authentication, JWT, login screens |
| 3 | Restaurant listing, location filter, menu |
| 4 | Cart, orders, Razorpay checkout |
| 5 | Profile, order tracking (Socket.io), notifications |
| 6 | Testing, security hardening, UI polish |
| 7 | AWS deployment (EC2 + RDS + S3 + Nginx + SSL) |
