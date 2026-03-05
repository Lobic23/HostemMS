### 1️⃣ Project Setup

- [x] Init Node.js + TypeScript project
- [x] Setup folder structure (modules, core, shared)
- [x] Configure ESLint + Prettier
- [x] Setup env config (.env, validation)
- [x] Setup PostgreSQL
- [x] Setup ORM (Prisma / Drizzle)
- [x] Add migration system

---

### 2️⃣ Core Infrastructure

- [x] Global error handler
- [x] Request validation (Zod / class-validator)
- [x] Rate limiter
- [x] CORS + Helmet
- [x] Health check endpoint

---

### 3️⃣ Auth & RBAC

- [x] User entity
- [ ] Role entity
- [ ] Permission entity
- [x] JWT access token
- [x] Refresh token (rotation)
- [ ] Refresh token (revocation)
- [x] Password hashing (bcrypt/argon2)
- [x] Role middleware guard
- [ ] Audit log for auth actions

---

### 4️⃣ Hostel Module

- [x] Building entity
- [x] Room entity
- [x] Bed entity
- [x] Allocation entity
- [ ] Complaint entity
- [ ] CRUD APIs
- [x] Room availability logic
- [x] Allocation transaction-safe logic

---

### 5️⃣ Canteen Module

- [ ] Meal plan entity
- [ ] Subscription entity
- [ ] Menu entity
- [ ] Attendance entity
- [ ] Billing logic
- [ ] CRUD APIs
- [ ] Subscription expiry check

---

### 6️⃣ Gym Module

- [ ] Membership plan entity
- [ ] Member entity
- [ ] Attendance entity
- [ ] Equipment entity
- [ ] Maintenance log entity
- [ ] Membership expiry automation

---

### 7️⃣ Social Hall Module

- [ ] Hall entity
- [ ] Booking entity
- [ ] Time slot validation
- [ ] Conflict detection logic
- [ ] Cancellation logic

---

### 8️⃣ Billing System

- [ ] Invoice entity
- [ ] Payment entity
- [ ] Unified billing logic
- [ ] Partial payment handling
- [ ] Transaction-safe payment processing

---

### 9️⃣ Background Jobs

- [ ] Setup Redis
- [ ] Setup queue (BullMQ)
- [ ] Expiry checks job
- [ ] Invoice generation job
- [ ] Notification job

---

### 🔟 Logging & Monitoring

- [ ] Structured logs
- [ ] Request ID middleware
- [ ] Audit log table
- [ ] Error tracking (Sentry optional)

---

### 1️⃣1️⃣ Testing

- [ ] Unit tests (services)
- [ ] Integration tests (API + DB)
- [ ] RBAC permission tests

---

### 1️⃣2️⃣ Production Ready

- [ ] API versioning (/api/v1)
- [ ] Pagination everywhere
- [ ] Index DB columns
- [ ] CI/CD setup
- [ ] Staging + production configs
