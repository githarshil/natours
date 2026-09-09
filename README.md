# Natours

A full-stack tour-booking application — browse tours, sign up, log in, and manage a user account — built server-rendered with Node.js, Express, MongoDB, and Pug. The biggest backend project in this set, focused on doing the "boring but essential" parts of a production API properly.

**Tech stack:** Node.js · Express · MongoDB / Mongoose · Pug · JWT · bcrypt · Multer · Nodemailer

## What I Built

- **A proper MVC structure** — `models/` (Tour, User, Review), `controller/` (tour, user, review, auth, view), and `routes/` cleanly separated, with a shared `handlerfactory.js` for generic CRUD operations so I wasn't repeating the same create/update/delete logic per resource.
- **Authentication & authorization** — JWT-based auth (`authController.js`) with `bcrypt`/`bcryptjs` password hashing, cookie-based sessions (`cookie-parser`), and route-level permission checks.
- **Security middleware** — `helmet` for HTTP headers, `express-rate-limit` to throttle requests, and input handling to guard against common attacks.
- **Server-rendered views** — Pug templates (`overview`, `tour`, `login`, `signup`, `account`) rendered directly from Express instead of a separate SPA frontend.
- **File uploads and email** — `multer` for handling image uploads, `nodemailer` for transactional emails (e.g. password resets).
- **A query utility class** (`utils/Apifeatures.js`) implementing filtering, sorting, field limiting, and pagination as a reusable layer on top of Mongoose queries.
- **Centralized error handling** — a global error controller plus `catchAsync` to avoid try/catch blocks in every single controller.

## What I Learned

- **What "production-grade" actually means for a Node API** — this project is where security headers, rate limiting, and centralized error handling stopped being theoretical and became things I had to wire up myself.
- **The factory-handler pattern** — writing one generic `createOne`/`updateOne`/`deleteOne` set of functions that every resource controller reuses, instead of copy-pasting near-identical CRUD logic five times.
- **JWT auth end to end** — issuing tokens, verifying them on protected routes, and handling password-reset flows with time-limited tokens and email, not just "log in and get a token."
- **Server-side rendering with Pug** — templating data straight from MongoDB into HTML on the server, as a contrast to the client-rendered React apps in the rest of my projects.
- **Query building as its own abstraction** — `APIFeatures` taught me how much cleaner controllers get once filtering/sorting/pagination logic lives in one reusable class instead of being duplicated per-route.

## Getting Started

```bash
npm install
npm run dev
```

Requires a MongoDB connection string and environment variables for JWT secrets and email credentials (see `.env` usage via `dotenv`).
