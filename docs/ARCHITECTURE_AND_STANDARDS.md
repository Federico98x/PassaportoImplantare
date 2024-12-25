## **1. Overview**  
This document describes the **software architecture** and **development standards** for the **Passaporto Implantare Digital** project. It ensures that all team members follow a consistent structure, use recommended libraries and frameworks, and adhere to **GDPR** and **OWASP** security best practices.

### **Goals**  
- Provide a **clear, modular directory structure**.  
- Use **Node.js + Express** (backend) and **React** (frontend).  
- Enforce **GDPR compliance** and robust **security standards** (JWT, OWASP).  
- Standardize how we generate and store the digital “Passaporto Implantare” (PDF, possibly wallet pass).  
- Outline a **role-based access control** scheme (Admin, Dentist, Patient).

---

## **2. Project Structure**  
A recommended high-level directory layout:

```
passaporto-implantare-digital/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # MongoDB connection, environment-based configs
│   │   │   └── index.js       # Consolidates main config settings (port, JWT secrets, etc.)
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── middlewares/
│   │   │   ├── auth.js        # JWT validation, role checks
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── passportRoutes.js
│   │   ├── services/
│   │   │   └── pdfService.js  # PDF generation logic
│   │   └── app.js            # Express app (loader)
│   ├── tests/
│   │   └── (unit & integration tests)
│   ├── package.json
│   └── server.js             # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.js
│   ├── public/
│   ├── package.json
│   └── .env                  # React env variables (if needed)
│
├── docs/
│   ├── ARCHITECTURE_AND_STANDARDS.md   # This file
│   ├── IMPLEMENTATION.md               # Implementation roadmap
│   ├── AUTHENTICATION.md               # Auth & RBAC details
│   ├── PDF_MODULE.md                   # PDF generation guide
│   ├── PROGRESS.md                     # Development progress, notes
│   └── CHANGELOG.md                    # Version tracking & releases
│
├── docker-compose.yml                  # Docker orchestration (optional)
├── Dockerfile                          # Dockerfile for backend (optional)
├── .gitignore
└── README.md
```

### **Key Folders**  
1. **`backend/src/config/`**  
   - Database connection settings (`db.js`).  
   - JWT secret and other environment variables (`index.js`).  
2. **`backend/src/controllers/`**  
   - Functions handling request/response logic, bridging routes and services.  
3. **`backend/src/models/`**  
   - Mongoose models (e.g., **User**, **Passport**).  
4. **`backend/src/routes/`**  
   - Express route definitions (e.g., `authRoutes.js`, `passportRoutes.js`).  
5. **`backend/src/services/`**  
   - Reusable business logic (e.g., PDF generation, email notifications, subscription management).  
6. **`frontend/`**  
   - React Single Page Application.  
7. **`docs/`**  
   - All Markdown documentation (architecture, implementation, authentication, etc.).  
8. **`tests/`**  
   - Unit and integration tests for the backend (and optionally for the frontend).  

---

## **3. Technology Stack & Libraries**  

### 3.1 Backend  
- **Node.js + Express**: Flexible, widely adopted, easy to scale.  
- **MongoDB (Mongoose)**: Schema-based modeling, flexible document storage.  
- **Authentication**:  
  - **JWT** for stateless auth; tokens are short-lived (15–30 min).  
  - **bcrypt** or **Argon2** for password hashing.  
- **PDF Generation**:  
  - **pdfkit** or **Puppeteer** (depending on layout complexity).  
- **Logging & Error Handling**:  
  - Winston or Morgan for logs.  
- **Security Middlewares**:  
  - `helmet` for setting secure HTTP headers.  
  - `express-rate-limit` for brute force prevention.  

### 3.2 Frontend  
- **React** (or Next.js if SSR is required).  
- **UI Library**: Material UI, Bootstrap, or Tailwind CSS (project preference).  
- **State Management**: Redux, Context API, or any standard React approach.  

### 3.3 Optional Tools  
- **Docker** for containerization.  
- **AWS S3** or similar for PDF/cloud file storage.  
- **Stripe/PayPal** for subscription payments (if implementing advanced billing).  

---

## **4. Security & Compliance**  

### 4.1 GDPR Guidelines  
1. **Data Minimization**:  
   - Only collect needed data (patient name, implant details).  
   - Limit retention time.  
2. **Right to Erasure**:  
   - Implement routes to delete personal data upon request.  
3. **Consent & Transparency**:  
   - Clearly inform users how data is used and stored.  
4. **Secure Storage**:  
   - Store PDFs or sensitive data in encrypted form (if feasible).  

### 4.2 OWASP Standards  
1. **Injection Prevention**:  
   - Use parameterized queries, Mongoose sanitation, etc.  
2. **Broken Auth**:  
   - Strict JWT usage, short token lifetime, optional refresh tokens.  
   - Strong password hashing (bcrypt or Argon2).  
3. **Sensitive Data Exposure**:  
   - Always use HTTPS for data in transit.  
   - Log only minimal personal info.  
4. **Role-Based Access**:  
   - **Admin**: Full system control, user management.  
   - **Dentist**: Create/view passports, manage their patients.  
   - **Patient**: View only their own passports.  

### 4.3 Additional Security Measures  
- **rate limiting** on auth routes.  
- **audit logs** for passport creation and access.  
- **monitoring** suspicious login attempts (failed logins, IP-based checks).

---

## **5. Containerization & Environment Management**  

### 5.1 Environment Variables  
- **`.env`** (local) for development secrets:  
  ```
  PORT=4000
  JWT_SECRET=someSecureSecret
  MONGO_URI=mongodb://localhost:27017/passaporto-implantare
  ```
- In production, use a secure approach:  
  - Hosted environment variables on the server or secret manager.

### 5.2 Docker Integration  
- **Dockerfile** (Backend Example):
  ```dockerfile
  FROM node:18-alpine
  WORKDIR /usr/src/app
  COPY package*.json ./
  RUN npm install
  COPY . .
  EXPOSE 4000
  CMD ["node", "server.js"]
  ```
- **docker-compose.yml**:
  ```yaml
  version: '3'
  services:
    backend:
      build: ./backend
      ports:
        - "4000:4000"
      env_file:
        - ./backend/.env
      depends_on:
        - mongo
    mongo:
      image: mongo:latest
      container_name: passaporto_mongo
      ports:
        - "27017:27017"
      volumes:
        - mongo-data:/data/db

  volumes:
    mongo-data:
  ```
- **Frontend** can also be containerized or served via a CDN/hosted service.

---

## **6. Best Practices**  

### 6.1 Coding Standards  
- Use **ESLint** or **Prettier** for code consistency.  
- Follow standard naming conventions (e.g., `camelCase` for variables, `PascalCase` for React components).  
- Keep **controllers** thin, delegate logic to **services**.  

### 6.2 Documentation  
- Keep `AUTHENTICATION.md`, `PDF_MODULE.md`, etc., up to date.  
- Update `CHANGELOG.md` for every feature or patch.  
- Use `PROGRESS.md` to track sprints, tasks, or milestone completion.  

### 6.3 Testing  
- **Unit Tests**: For controllers, services, and models.  
- **Integration Tests**: To validate endpoints and user flows.  
- **End-to-End Tests** (optional): Possibly with Cypress or Puppeteer in advanced stages.

### 6.4 Continuous Integration  
- Set up a CI/CD pipeline (GitHub Actions, GitLab CI, or others) to run tests automatically on each commit.  
- Deploy to staging or production environment if all tests pass.  

---

## **7. Conclusion**  
This **ARCHITECTURE_AND_STANDARDS.md** sets forth the **structure, technologies, and security guidelines** for building a robust, compliant, and scalable platform dedicated to **digitalizing the Passaporto Implantare** in Italy. By following these standards, we ensure a consistent development process, **adhering to GDPR** and **OWASP** best practices, and delivering on our motto:  
> *“Niente più carta e penna, crea il tuo passaporto implantare in un clic.”*