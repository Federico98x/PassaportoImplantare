# **Passaporto Implantare Digital**  
**IMPLEMENTATION.md**  
> *“Niente più carta e penna, crea il tuo passaporto implantare in un clic.”*  

---

## **1. Overview**  
This document outlines the **multi-phase** implementation plan for the **Passaporto Implantare Digital** project. It breaks down the roadmap into actionable steps (micro-tasks) so that our development team (“LLM B”) can execute each phase systematically.  

Key points we aim to address:  
- Building a **Minimum Viable Product (MVP)** to validate the concept.  
- Adding roles, security, and subscription logic in **subsequent phases**.  
- Ensuring **GDPR compliance** and solid **OWASP-based security** throughout.  
- Continuously **documenting** and **testing** each deliverable.  

Please refer to the complementary documentation in the `docs/` folder (e.g. `AUTHENTICATION.md`, `PDF_MODULE.md`, `CHANGELOG.md`) for detailed technical references and updates.

---

## **2. Technology & Prerequisites**  

### 2.1 Backend  
- **Node.js + Express** for server-side.  
- **MongoDB (via Mongoose)** for data storage.  
- **JWT** for authentication and session management.  
- **bcrypt** or **Argon2** for password hashing.  
- **pdfkit** (or **Puppeteer**) for generating digital passports as PDFs.  

### 2.2 Frontend  
- **React** (recommended) or similar SPA framework.  
- **UI Library**: (Material UI, Bootstrap, or Tailwind) for components and styling.  

### 2.3 Environment & Security  
- **`.env`** files to store secrets (JWT secret, DB URIs).  
- **HTTPS** enforced in production (SSL/TLS).  
- **GDPR**-aligned data handling (right to erasure, data minimization).  

### 2.4 Documentation & Testing  
- **Markdown Docs** in `docs/` (e.g., `ARCHITECTURE_AND_STANDARDS.md`, `AUTHENTICATION.md`).  
- **Testing** with Jest or Mocha + Chai.  
- **Logging** using Winston/Morgan for visibility.  

---

## **3. Implementation Roadmap**  

Below is a three-phase plan, each with specific goals and micro-tasks. “LLM B” (the Coder) will focus on the listed tasks and update the `PROGRESS.md` file as features are completed.  

---

### **PHASE 1 – Minimum Viable Product (MVP)**  
**Objectives**  
1. Provide basic **user authentication** (signup, login).  
2. Allow **creation** of a simple “Passaporto Implantare” record.  
3. Implement **PDF generation** for the passport.  
4. Build a **frontend** (React) with minimal UI for testing.  

**Micro-Tasks**  

1. **Project Initialization**  
   - **Create Node.js/Express app** in `backend/`.  
   - Set up **Mongoose** connection (`config/db.js`).  
   - Ensure `.env` is configured with placeholders for `JWT_SECRET` and `MONGO_URI`.  

2. **User Model & Auth**  
   - **`User.js`** (Mongoose model): fields: `email`, `passwordHash`, `role` (default: `Dentist`).  
   - **Signup Route**:  
     - **`POST /auth/signup`** – Accepts `email`/`password`, hashes password with `bcrypt` or `Argon2`, stores the user.  
   - **Login Route**:  
     - **`POST /auth/login`** – Verifies credentials, returns a short-lived JWT token (e.g., 15–30 min).  

3. **JWT & Role Middleware**  
   - **`middlewares/auth.js`**:  
     - Check for valid JWT in `Authorization` header.  
     - Attach user info to `req.user`.  
   - For MVP, a simple “Dentist” role is sufficient, but make it extensible for Phase 2.  

4. **Passport Model & Creation**  
   - **`Passport.js`** (Mongoose model):  
     - Example fields: `{ patientName, dateOfBirth, implantDetails, createdBy (Dentist), createdAt, ... }`.  
   - **`POST /passport/create`**:  
     - Protected by JWT (only accessible by “Dentist” role).  
     - Stores the new passport document in the DB.  

5. **PDF Generation**  
   - **pdfService.js** (in `services/`):  
     - Implement a function like `generatePassportPDF(passportData)`.  
     - Use `pdfkit` or `puppeteer` to create the PDF.  
   - **`GET /passport/:id/pdf`**:  
     - Retrieves the passport from DB.  
     - Calls `generatePassportPDF`, returns the file as a download/stream.  
   - (Optional) Save the generated PDF to local storage or a remote bucket (like AWS S3).  

6. **Basic Frontend Setup**  
   - **React** (in `frontend/`):  
     - Setup login/sign-up pages.  
     - A simple dashboard to create/view passports (only minimal UI needed).  
     - Trigger PDF download via an axios call to `/passport/:id/pdf`.  

7. **Testing & Validation**  
   - Basic unit tests:  
     - Auth routes (signup, login).  
     - Passport creation.  
   - Integration tests:  
     - End-to-end flow: signup → create passport → fetch PDF.  

**Deliverable:**  
- A working MVP that creates user accounts, logs in, creates a passport, and generates a PDF version.  
- Document everything in `docs/IMPLEMENTATION.md` (this file) and track progress in `PROGRESS.md`.  

---

### **PHASE 2 – Role Expansion, Security & Subscription**  
**Objectives**  
1. Introduce **role-based access** (Admin, Dentist, Patient).  
2. Improve **PDF** generation design & features.  
3. Add **subscription logic** (monthly/yearly).  
4. Strengthen **logging, auditing, and security** measures.  

**Micro-Tasks**  

1. **Extended RBAC**  
   - Update the **`User`** model to have roles: `Admin`, `Dentist`, `Patient`.  
   - Enhance the **JWT middleware** to check roles, e.g.:  
     ```js
     function roleCheck(...allowedRoles) {
       return (req, res, next) => {
         if (!allowedRoles.includes(req.user.role)) {
           return res.status(403).json({ message: "Forbidden" });
         }
         next();
       };
     }
     ```  
   - Protect routes accordingly (e.g., only `Dentist` or `Admin` can create passports, `Patient` can only view their own).  

2. **Enhanced PDF Generation**  
   - **Branding**: Add clinic logos or custom designs.  
   - **Additional Fields**: Include more details (implant brand, lot number, relevant disclaimers, etc.).  
   - Consider switching to **`puppeteer`** if advanced layouts are needed.  

3. **Security Hardening**  
   - **Use `helmet`** for setting secure HTTP headers.  
   - **Rate Limit** login attempts to prevent brute-force attacks (e.g., with `express-rate-limit`).  
   - **Refresh Tokens** + blacklisting (optional step):  
     - Store refresh tokens in DB or Redis.  
     - Revoke them upon logout or token compromise.  

4. **Logging & Auditing**  
   - Integrate **Winston** or **Morgan** for server logs (e.g., request logs, error logs).  
   - Create an **audit log** for passport creation, updates, and accesses.  
   - Provide an Admin dashboard or a separate endpoint to view these logs.  

5. **Subscription Module**  
   - **`Subscription`** model (Mongoose): fields like `{ userId, planType, startDate, endDate, status }`.  
   - Admin routes to **manage subscriptions**:  
     - `POST /admin/subscription/create` – create or update a subscription for a user/clinic.  
   - **Enforce subscription** checks:  
     - If a dentist’s subscription is expired, disable new passport creation (or allow a grace period).  

6. **Frontend Enhancements**  
   - Separate dashboards for:  
     - **Admin**: Manage users, subscriptions, see usage logs.  
     - **Dentist**: Create/edit passports, see their patient list.  
     - **Patient**: View/download personal passports only.  
   - Expand the UI for PDF preview, subscription status checks, and logs (if needed).  

7. **Testing & Documentation**  
   - **Role-based** integration tests (Admin, Dentist, Patient).  
   - **Subscription** logic tests (active vs. expired).  
   - Update relevant docs (`AUTHENTICATION.md`, `PDF_MODULE.md`) with new flows.  

**Deliverable:**  
- A platform with robust role management, subscription checks, improved security, and a richer PDF output.  

---

### **PHASE 3 – Scalability, Microservices & Advanced Analytics**  
**Objectives**  
1. Prepare for **high traffic** and future expansions.  
2. Introduce **microservices** or modularization (if needed).  
3. Implement **advanced analytics** for clinics.  

**Micro-Tasks**  

1. **Containerization & Scaling**  
   - Provide a **Dockerfile** for the backend (and optionally the frontend).  
   - Use **`docker-compose.yml`** to run the app + MongoDB in containers.  
   - Consider **Kubernetes** or other orchestration for load balancing in production.  

2. **Microservices Architecture** (Optional, if traffic demands)  
   - Split out **PDF service** or **auth service** into a separate microservice if needed.  
   - Communicate via REST or messaging queue (RabbitMQ, Kafka).  
   - Ensure each service has well-defined responsibilities and minimal shared state.  

3. **Advanced Analytics & Dashboards**  
   - Add **aggregations** for passports created per month, usage patterns, etc.  
   - A dedicated **Analytics** module or microservice that tracks metrics for each clinic.  
   - Provide a custom admin panel to visualize these metrics (charts, heatmaps, etc.).  

4. **Internationalization**  
   - If targeting other countries, set up **i18n** support for multi-language.  
   - Comply with **local regulations** (similar or stricter than GDPR).  

5. **Performance Monitoring**  
   - Use **APM tools** (e.g., New Relic, Datadog) to track response times, bottlenecks.  
   - Implement caching (Redis) for frequently accessed data (like repeated PDF fetches).  

**Deliverable:**  
- A **scalable, containerized** solution with the option for microservices and advanced analytics, ready for higher loads and international expansion.

---

## **4. Testing & QA Responsibilities**  
1. **Unit Tests**:  
   - Cover controllers, services, and models.  
2. **Integration Tests**:  
   - Validate entire flows (auth → create passport → generate PDF → subscription checks).  
3. **Security Tests**:  
   - Validate role permissions, token revocation, brute-force protection.  
4. **Performance Tests**:  
   - Evaluate how the system handles concurrent requests (especially PDF generation).  

All these test suites are owned by **(B)** (the Coder), who integrates them into CI/CD pipelines.  

---

## **5. Documentation & Continuous Updates**  
- **`PROGRESS.md`**: Track ongoing tasks, mark completions, add notes for blockers.  
- **`CHANGELOG.md`**: Document new features, bug fixes, version increments.  
- **`AUTHENTICATION.md`**: Outline JWT-based auth, refresh token policies, role checks.  
- **`PDF_MODULE.md`**: Show how `pdfService.js` or Puppeteer handles templates & generation.  
- **`SUBSCRIPTION.md`** (optional): Describe subscription plans, billing cycle logic (if needed).  

**Remember**: Always keep these docs in sync with the latest code changes.

---

## **6. Conclusion**  
By adhering to this **Implementation Plan**, we will deliver a **secure**, **scalable**, and **user-friendly** system for digitizing Italy’s “Passaporto Implantare.” Each phase gradually enriches functionality—from the basic MVP in Phase 1, to robust RBAC and subscriptions in Phase 2, and finally advanced scaling and analytics in Phase 3.  

**Next Steps**  
- Proceed with **Phase 1** to confirm core functionality and get quick validation.  
- Move on to subsequent phases for **expanded features, security, and compliance** enhancements.  
- Maintain all relevant documentation and test coverage at every stage to ensure code quality and system reliability.

---

**End of IMPLEMENTATION.md**  
