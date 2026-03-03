
### 1️⃣ Project Setup

* [X] Init Node.js + TypeScript project
* [X] Setup folder structure (modules, core, shared)
* [X] Configure ESLint + Prettier
* [X] Setup env config (.env, validation)
* [X] Setup PostgreSQL
* [X] Setup ORM (Prisma / Drizzle)
* [X] Add migration system
---

### 2️⃣ Core Infrastructure

* [X] Global error handler
* [X] Request validation (Zod / class-validator)
* [X] Rate limiter
* [X] CORS + Helmet
* [X] Health check endpoint
---

### 3️⃣ Auth & RBAC

* [X] User entity
* [ ] Role entity
* [ ] Permission entity
* [X] JWT access token
* [X] Refresh token (rotation)
* [ ] Refresh token (revocation)
* [X] Password hashing (bcrypt/argon2)
* [ ] Role middleware guard
* [ ] Audit log for auth actions

---

### 4️⃣ Hostel Module

* [ ] Building entity
* [ ] Room entity
* [ ] Bed entity
* [ ] Student entity
* [ ] Allocation entity
* [ ] Complaint entity
* [ ] CRUD APIs
* [ ] Room availability logic
* [ ] Allocation transaction-safe logic

---

### 5️⃣ Canteen Module

* [ ] Meal plan entity
* [ ] Subscription entity
* [ ] Menu entity
* [ ] Attendance entity
* [ ] Billing logic
* [ ] CRUD APIs
* [ ] Subscription expiry check

---

### 6️⃣ Gym Module

* [ ] Membership plan entity
* [ ] Member entity
* [ ] Attendance entity
* [ ] Equipment entity
* [ ] Maintenance log entity
* [ ] Membership expiry automation

---

### 7️⃣ Social Hall Module

* [ ] Hall entity
* [ ] Booking entity
* [ ] Time slot validation
* [ ] Conflict detection logic
* [ ] Cancellation logic

---

### 8️⃣ Billing System

* [ ] Invoice entity
* [ ] Payment entity
* [ ] Unified billing logic
* [ ] Partial payment handling
* [ ] Transaction-safe payment processing

---

### 9️⃣ Background Jobs

* [ ] Setup Redis
* [ ] Setup queue (BullMQ)
* [ ] Expiry checks job
* [ ] Invoice generation job
* [ ] Notification job

---

### 🔟 Logging & Monitoring

* [ ] Structured logs
* [ ] Request ID middleware
* [ ] Audit log table
* [ ] Error tracking (Sentry optional)

---

### 1️⃣1️⃣ Testing

* [ ] Unit tests (services)
* [ ] Integration tests (API + DB)
* [ ] RBAC permission tests

---

### 1️⃣2️⃣ Production Ready

* [ ] API versioning (/api/v1)
* [ ] Pagination everywhere
* [ ] Index DB columns
* [ ] CI/CD setup
* [ ] Staging + production configs

