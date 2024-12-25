
## **1. Introduction**  
This document outlines the **user authentication and authorization** strategies for the Passaporto Implantare Digital platform. Key objectives include:

1. **Secure Sign-Up and Login** using JWT.  
2. **Password Hashing** with bcrypt or Argon2.  
3. **Role-Based Access Control (RBAC)** for Admin, Dentist, and Patient.  
4. **Optional** Refresh Tokens and Revocation/Blacklisting Mechanism.  
5. Alignment with **GDPR** and **OWASP** recommendations.

---

## **2. Authentication Flow**  
1. **User Registration (Sign-Up)**  
   - **Endpoint**: `POST /auth/signup`  
   - **Payload**: `{ "email": "user@example.com", "password": "PlainTextPassword", "role": "Dentist" }`  
   - **Process**:  
     1. Check if the user already exists by `email`.  
     2. Hash the password using **bcrypt** or **Argon2**.  
     3. Create a new `User` document in MongoDB.  
     4. Return a success message or auto-generate a JWT (optional).  

2. **User Login**  
   - **Endpoint**: `POST /auth/login`  
   - **Payload**: `{ "email": "user@example.com", "password": "PlainTextPassword" }`  
   - **Process**:  
     1. Find the user by `email`.  
     2. Compare hashed password with the provided `password`.  
     3. If valid, generate a **short-lived Access Token** (e.g., 15–30 minutes).  
     4. (Optional) Also generate a **Refresh Token** for longer-lived sessions.  

3. **JWT Structure**  
   - **Header**: `alg`, `typ`  
   - **Payload**: `sub` (user ID), `role`, `iat`, `exp`  
   - **Signature**: Encrypted with `JWT_SECRET`.  
   - Example token:
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - Store the token **client-side** (e.g., `localStorage` or an HTTP-only cookie).

4. **Role-Based Access Control (RBAC)**  
   - Each user has a `role` field: `Admin`, `Dentist`, or `Patient`.  
   - Protected routes check if `req.user.role` matches an **allowed** role.  
   - Example middleware pseudo-code:  
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
   - **Admin**: Manage users, subscriptions, system settings.  
   - **Dentist**: Create/Edit “Passaporto Implantare” for their patients.  
   - **Patient**: View only their own passports.

---

## **3. Authorization Middleware**  
- **Token Extraction**  
  - Typically from the `Authorization: Bearer <token>` header.  
  - Verify the token’s signature and ensure it’s not expired.  
- **Attach User to Request**  
  - On success, attach decoded user info to `req.user`.  
  - On failure, respond with `401 Unauthorized`.  

- **Example**:  
  ```js
  const jwt = require('jsonwebtoken');

  module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
  ```

---

## **4. Password Hashing**  
- **bcrypt** (Typical usage):  
  ```js
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  
  async function hashPassword(plainTextPassword) {
    return await bcrypt.hash(plainTextPassword, saltRounds);
  }

  async function comparePassword(plainTextPassword, hashedPassword) {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }
  ```
- **Argon2** (Alternative):  
  ```js
  const argon2 = require('argon2');

  async function hashPassword(plainTextPassword) {
    return await argon2.hash(plainTextPassword);
  }

  async function comparePassword(plainTextPassword, hashedPassword) {
    return await argon2.verify(hashedPassword, plainTextPassword);
  }
  ```

Ensure a **sufficient cost factor** (bcrypt `saltRounds` ~10–12, Argon2 with recommended memory and iteration settings) to mitigate brute force attacks.

---

## **5. Refresh Tokens & Blacklisting (Optional)**  
1. **Refresh Token**: Long-lived token (e.g., 7–30 days).  
2. **Storage**:  
   - In a secure **HTTP-only cookie** or a dedicated DB/Redis store.  
3. **Blacklisting**:  
   - Maintain a table/record of invalidated or used refresh tokens.  
   - On logout or forced password reset, mark the token as invalid.  
4. **Rotation**:  
   - Issue a new refresh token every time the old one is used to get an access token.

---

## **6. Security Best Practices**  
1. **HTTPS**: Always encrypt data in transit.  
2. **Error Handling**: Avoid exposing internal error details in auth endpoints.  
3. **Brute Force Protection**: Implement a rate limiter on login routes (e.g., `express-rate-limit`).  
4. **Password Policy**: Enforce minimum length and complexity.  
5. **Secrets Management**: Store `JWT_SECRET` in `.env`, never commit to source control.

---

## **7. GDPR & Compliance**  
1. **Data Minimization**: Only store necessary user info (email, hashed password, role).  
2. **Right to Erasure**: Provide a route for users to delete their account or data.  
3. **Logging**: Keep minimal logs (avoid storing plaintext credentials).  
4. **Consent**: Make sure terms and policies are presented to the user upon sign-up.

---

## **8. Testing & Documentation**  
1. **Unit Tests**:  
   - Ensure password hashing and JWT generation are correct.  
2. **Integration Tests**:  
   - Test sign-up → login → protected route access flows.  
3. **Documentation**:  
   - Update `IMPLEMENTATION.md` and `CHANGELOG.md` for any changes to the auth flow.  

---

## **9. Conclusion**  
This **AUTHENTICATION.md** provides a secure, tested approach to user registration, login, and role-based protection for the **Passaporto Implantare Digital** platform. By following these guidelines—especially regarding JWT, hashing, and role checks—we ensure compliance with industry best practices and regulatory requirements.