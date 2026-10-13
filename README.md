# 🏝️ Royal Rides — Premier Sri Lankan Tourism & Travel Platform

A full-stack, production-ready tourism and travel booking platform built with the MERN stack (MongoDB, Express.js, React 18, Node.js).

---

## ✨ Features

- 🗺️ **Interactive Sri Lanka Map** — Leaflet/OpenStreetMap with custom markers, clustering, nearby facilities
- 🚗 **Vehicle Booking** — Cars, vans, luxury units; distance-based pricing; with/without driver
- 🏨 **Hotel Booking** — Nightly rates, seasonal discounts, cancellation policies, room calendars
- 📦 **Travel Packages** — Day-by-day itineraries, tour guide selection, auto price adjustment
- 💱 **Multi-Currency** — Live LKR ↔ USD switching with animated transitions
- 👤 **User Accounts** — Register/login, booking history, wishlist, downloadable PDFs
- 🔐 **Admin Dashboard** — Full CRUD, analytics, booking management, RBAC
- 📧 **Email Notifications** — Booking confirmations via Nodemailer
- 🎨 **Stunning UI** — Glassmorphism, Framer Motion, GSAP scroll storytelling, Lenis smooth scroll

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, React Router v6, Zustand, TanStack Query |
| Styling | Tailwind CSS (custom tokens), Framer Motion, GSAP + ScrollTrigger |
| Forms | React Hook Form + Zod |
| Map | React Leaflet (OpenStreetMap) |
| Backend | Node.js + Express.js (MVC) |
| Database | MongoDB + Mongoose |
| Auth | JWT (access token in memory + refresh in httpOnly cookie) |
| Images | Multer + Cloudinary |
| Email | Nodemailer |
| Logging | Winston + Morgan |

---

## 📁 Project Structure

```
royal-rides/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── animations/      # GSAP, Framer Motion variants
│   │   ├── assets/          # Static assets, fonts
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/          # Primitives (Button, Card, Input…)
│   │   │   ├── layout/      # Navbar, Footer, Layout wrappers
│   │   │   └── shared/      # Domain-agnostic shared components
│   │   ├── features/        # Feature slices (auth, vehicles, hotels…)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Route-level page components
│   │   ├── services/        # Axios API service layer
│   │   ├── store/           # Zustand stores
│   │   ├── styles/          # Global CSS, design tokens
│   │   └── utils/           # Utility functions
│   └── public/
├── server/                  # Express.js REST API
│   └── src/
│       ├── config/          # DB, Cloudinary, email config
│       ├── controllers/     # Request handlers
│       ├── middleware/       # Auth, error, upload middleware
│       ├── models/          # Mongoose models
│       ├── routes/          # API route definitions
│       ├── services/        # Business logic layer
│       ├── utils/           # Helpers, email templates, PDF
│       ├── validators/      # Zod/express-validator schemas
│       └── seeds/           # Database seed script
└── docs/                    # API docs, architecture diagrams
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (Optional: local/Atlas URI in `.env`, or runs automatically with embedded in-memory MongoDB engine!)
- Cloudinary account (optional, for image uploads)
- SMTP credentials (optional, for emails)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/royal-rides.git
cd royal-rides

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Environment Setup

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI, JWT secrets, Cloudinary keys, SMTP config

# Client
cp client/.env.example client/.env
# Edit client/.env with your API URL
```

### 3. Seed the Database

```bash
cd server
npm run seed
```

This will populate the database with:
- 10 Sri Lankan destinations (Sigiriya, Kandy, Ella, Galle, Mirissa, Yala, Nuwara Eliya, Anuradhapura, Jaffna, Trincomalee)
- Sample vehicles (cars, vans, luxury units, SUVs, buses)
- Sample hotels with rooms and seasonal rates
- Sample travel packages (cultural, beach, wildlife, adventure, honeymoon, hill country)
- Tour guides with specializations
- Emergency facilities (police stations, hospitals, restrooms)
- Admin user (admin@royalrides.lk / Admin@123456)

### 4. Run Development Servers

```bash
# Terminal 1: Start server (port 5000)
cd server && npm run dev

# Terminal 2: Start client (port 5173)
cd client && npm run dev
```

### 5. Access the App

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api/v1 |
| API Docs (Swagger) | http://localhost:5000/api-docs |
| Admin Panel | http://localhost:5173/admin |

**Default admin credentials:**
- Email: `admin@royalrides.lk`
- Password: `Admin@123456`

---

## 🌱 Available Scripts

### Server
```bash
npm run dev       # Development server with nodemon
npm start         # Production server
npm run seed      # Seed database with sample data
npm run seed:clear # Clear all seeded data
npm test          # Run Jest + Supertest API tests
npm run lint      # ESLint check
```

### Client
```bash
npm run dev       # Vite dev server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint check
```

---

## 🔒 Security Features

- JWT with access token (15m) + refresh token rotation (7d, httpOnly secure cookie)
- bcrypt password hashing (salt rounds: 12)
- Helmet.js secure headers
- CORS whitelist
- express-rate-limit (100 req/15min general; 5 req/15min auth)
- express-mongo-sanitize (NoSQL injection prevention)
- xss-clean (XSS protection)
- hpp (HTTP parameter pollution prevention)
- Input validation (Zod + express-validator)
- File upload validation (type + size limits)
- HTTPS-ready configuration

---

## 📞 Contact

- **Tel:** 0718282758
- **Email:** Info@uncage.lk
- **Tourist Police:** 1912
- **Emergency:** 119 (Police), 1990 (Ambulance), 110 (Fire)

---

## 📄 License

MIT — Royal Rides © 2026
